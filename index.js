// ตัวแปรเก็บค่า Status
let rpgStats = {
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100
};

// ฟังก์ชันสร้าง UI เมื่อ Extension โหลด
const initRPGUI = () => {
    const html = `
    <div id="rpg-status-container">
        <div class="rpg-bar-group">
            <div class="rpg-bar-label"><span>HP</span> <span id="hp-text">100/100</span></div>
            <div class="rpg-bar-bg">
                <div id="hp-bar-fill" class="rpg-bar-fill"></div>
            </div>
        </div>
        <div class="rpg-bar-group">
            <div class="rpg-bar-label"><span>MP</span> <span id="mp-text">100/100</span></div>
            <div class="rpg-bar-bg">
                <div id="mp-bar-fill" class="rpg-bar-fill"></div>
            </div>
        </div>
    </div>`;
    
    // Inject ลงใน Body ของ SillyTavern
    $('body').append(html);
    console.log('[ST-RPG] UI Loaded');
};

// ฟังก์ชันอัปเดต UI ตามค่าตัวแปร
const updateRPGDisplay = () => {
    // คำนวณ %
    const hpPercent = Math.max(0, Math.min(100, (rpgStats.hp / rpgStats.maxHp) * 100));
    const mpPercent = Math.max(0, Math.min(100, (rpgStats.mp / rpgStats.maxMp) * 100));

    // อัปเดต CSS Width
    $('#hp-bar-fill').css('width', hpPercent + '%');
    $('#mp-bar-fill').css('width', mpPercent + '%');

    // อัปเดตตัวเลข
    $('#hp-text').text(`${rpgStats.hp}/${rpgStats.maxHp}`);
    $('#mp-text').text(`${rpgStats.mp}/${rpgStats.maxMp}`);
};

// ฟังก์ชัน Parsing ข้อความจาก AI
// ค้นหา Pattern เช่น [HP-10] หรือ [MP+5]
const parseRPGCommands = (text) => {
    let modified = false;

    // Regex สำหรับจับค่า [HP+10], [HP-20], [MP+5]...
    const hpRegex = /\[HP([+-]\d+)\]/gi;
    const mpRegex = /\[MP([+-]\d+)\]/gi;

    let hpMatch;
    while ((hpMatch = hpRegex.exec(text)) !== null) {
        rpgStats.hp += parseInt(hpMatch[1]);
        modified = true;
    }

    let mpMatch;
    while ((mpMatch = mpRegex.exec(text)) !== null) {
        rpgStats.mp += parseInt(mpMatch[1]);
        modified = true;
    }

    // Clamp ค่าไม่ให้เกิน Max หรือต่ำกว่า 0
    if (modified) {
        rpgStats.hp = Math.min(rpgStats.maxHp, Math.max(0, rpgStats.hp));
        rpgStats.mp = Math.min(rpgStats.maxMp, Math.max(0, rpgStats.mp));
        updateRPGDisplay();
        toastr.info(`RPG Stats Updated: HP ${rpgStats.hp}, MP ${rpgStats.mp}`);
    }
};

// Hook เข้ากับระบบรับข้อความของ SillyTavern
// หมายเหตุ: แต่ละเวอร์ชั่นของ ST อาจใช้ Event ไม่เหมือนกัน อันนี้คือ Standard Hook
jQuery(document).ready(function () {
    initRPGUI();

    // ฟัง Event เมื่อได้รับข้อความใหม่จาก AI
    // (ใช้ event extension_message_received หรือ mutation observer ก็ได้)
    // วิธีที่ง่ายที่สุดสำหรับ ST Extension API:
    
    const originalProcessResponse = window.processMessageToClient; 
    
    // Override เล็กน้อยเพื่อดักจับข้อความ (Monkey Patching)
    // เตือน: ถ้า ST อัปเดตฟังก์ชันนี้ อาจต้องแก้โค้ด แต่เป็นวิธีที่ง่ายที่สุดในการเทส
    /* หมายเหตุ: ในการใช้งานจริง ควรใช้ event listener:
       eventSource.on(event_types.MESSAGE_RECEIVED, (id) => { ... })
       แต่เพื่อความง่ายในการทดสอบเบื้องต้น เราจะใช้ MutationObserver จับ chat log
    */

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                $(mutation.addedNodes).each(function () {
                    if ($(this).hasClass('mes')) { // ถ้าเป็นกล่องข้อความ
                        const text = $(this).find('.mes_text').text();
                        parseRPGCommands(text);
                    }
                });
            }
        });
    });

    // เริ่มจับตาดู Chat Log
    const chatContainer = document.querySelector('#chat');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
        console.log('[ST-RPG] Observer Attached');
    }
});
