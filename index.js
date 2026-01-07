let rpgStats = {
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100
};

// --- Core UI Functions ---

const initRPGUI = () => {
    // ลบของเก่าถ้ามี (ป้องกันการโหลดซ้ำ)
    $('#rpg-fab-btn, #rpg-main-panel').remove();

    const html = `
    <div id="rpg-fab-btn" title="Open RPG Stats">
        <i class="fa-solid fa-gamepad"></i>
    </div>

    <div id="rpg-main-panel">
        <div class="rpg-header">
            <span class="rpg-title">Character Status</span>
            <i class="fa-solid fa-xmark rpg-close"></i>
        </div>

        <div class="rpg-stat-row">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>HP</strong> <span id="disp-hp-val">100/100</span>
            </div>
            <div class="rpg-bar-container">
                <div id="bar-hp" class="rpg-bar-fill hp-fill" style="width: 100%;"></div>
                <div class="rpg-bar-text">Health Points</div>
            </div>
        </div>

        <div class="rpg-stat-row">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>MP</strong> <span id="disp-mp-val">100/100</span>
            </div>
            <div class="rpg-bar-container">
                <div id="bar-mp" class="rpg-bar-fill mp-fill" style="width: 100%;"></div>
                <div class="rpg-bar-text">Mana Points</div>
            </div>
        </div>

        <hr style="border-color:#444; margin: 15px 0;">

        <div style="font-size:0.9rem; color:#888; margin-bottom:5px;">Manual Override / Settings</div>
        <div class="rpg-settings-grid">
            <div class="rpg-input-group">
                <label>Current HP</label>
                <input type="number" id="in-cur-hp" class="rpg-input" value="100">
            </div>
            <div class="rpg-input-group">
                <label>Max HP</label>
                <input type="number" id="in-max-hp" class="rpg-input" value="100">
            </div>
            <div class="rpg-input-group">
                <label>Current MP</label>
                <input type="number" id="in-cur-mp" class="rpg-input" value="100">
            </div>
            <div class="rpg-input-group">
                <label>Max MP</label>
                <input type="number" id="in-max-mp" class="rpg-input" value="100">
            </div>
        </div>
    </div>
    `;

    $('body').append(html);

    // Event Listeners
    $('#rpg-fab-btn').on('click', () => {
        $('#rpg-main-panel').fadeToggle(200);
        refreshInputs(); // ดึงค่าปัจจุบันมาใส่ Input ทุกครั้งที่เปิด
    });

    $('.rpg-close').on('click', () => {
        $('#rpg-main-panel').fadeOut(200);
    });

    // ฟังการแก้ค่าใน Input (Manual Settings)
    $('.rpg-input').on('change', function() {
        rpgStats.hp = parseInt($('#in-cur-hp').val());
        rpgStats.maxHp = parseInt($('#in-max-hp').val());
        rpgStats.mp = parseInt($('#in-cur-mp').val());
        rpgStats.maxMp = parseInt($('#in-max-mp').val());
        updateRPGDisplay();
    });
    
    console.log('[ST-RPG] Modern UI Loaded');
};

const refreshInputs = () => {
    $('#in-cur-hp').val(rpgStats.hp);
    $('#in-max-hp').val(rpgStats.maxHp);
    $('#in-cur-mp').val(rpgStats.mp);
    $('#in-max-mp').val(rpgStats.maxMp);
};

const updateRPGDisplay = () => {
    // Clamp values
    rpgStats.hp = Math.min(rpgStats.maxHp, Math.max(0, rpgStats.hp));
    rpgStats.mp = Math.min(rpgStats.maxMp, Math.max(0, rpgStats.mp));

    // Calc %
    const hpPct = (rpgStats.hp / rpgStats.maxHp) * 100;
    const mpPct = (rpgStats.mp / rpgStats.maxMp) * 100;

    // Update Bars
    $('#bar-hp').css('width', hpPct + '%');
    $('#bar-mp').css('width', mpPct + '%');

    // Update Text
    $('#disp-hp-val').text(`${rpgStats.hp}/${rpgStats.maxHp}`);
    $('#disp-mp-val').text(`${rpgStats.mp}/${rpgStats.maxMp}`);
    
    // Sync Inputs if panel is open
    refreshInputs();
};

const parseRPGCommands = (text) => {
    let modified = false;
    const hpRegex = /\[HP([+-]\d+)\]/gi;
    const mpRegex = /\[MP([+-]\d+)\]/gi;

    let match;
    while ((match = hpRegex.exec(text)) !== null) {
        rpgStats.hp += parseInt(match[1]);
        modified = true;
    }
    while ((match = mpRegex.exec(text)) !== null) {
        rpgStats.mp += parseInt(match[1]);
        modified = true;
    }

    if (modified) {
        updateRPGDisplay();
        // แจ้งเตือนเล็กน้อย
        if (typeof toastr !== 'undefined') {
            toastr.success(`Status Updated! HP:${rpgStats.hp} MP:${rpgStats.mp}`);
        }
    }
};

// --- Initialization ---

jQuery(document).ready(function () {
    // รอให้ ST โหลดเสร็จสักนิด
    setTimeout(initRPGUI, 1000);

    // Observer สำหรับจับข้อความใหม่
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                $(mutation.addedNodes).each(function () {
                    if ($(this).hasClass('mes')) {
                        const text = $(this).find('.mes_text').text();
                        parseRPGCommands(text);
                    }
                });
            }
        });
    });

    const chatContainer = document.querySelector('#chat');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
    }
});
