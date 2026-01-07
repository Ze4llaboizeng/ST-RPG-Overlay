// ตั้งชื่อ Extension ให้ตรงกับโฟลเดอร์
const extensionName = "st-rpg-overlay";
const extensionSettingsKey = "rpg_overlay_settings";

// ค่า Default
let rpgStats = {
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    isVisible: false // สถานะเปิด/ปิด
};

// โหลดค่า Settings (ถ้ามี)
const loadSettings = () => {
    const saved = localStorage.getItem(extensionSettingsKey);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge ค่าที่เซฟไว้กับค่าปัจจุบัน (เผื่อ MaxHP เปลี่ยน)
        rpgStats = { ...rpgStats, ...parsed };
    }
};

// บันทึกค่า Settings
const saveSettings = () => {
    localStorage.setItem(extensionSettingsKey, JSON.stringify(rpgStats));
};

// สร้าง UI ปุ่มลอยและหลอดเลือด
const initRPGUI = () => {
    // ลบอันเก่าถ้ามี (ป้องกัน Duplicates ตอน Reload)
    $('#rpg-status-container').remove();
    $('#rpg-toggle-btn').remove();

    const html = `
    <div id="rpg-toggle-btn" title="Toggle RPG Status">⚔️</div>

    <div id="rpg-status-container" class="${rpgStats.isVisible ? 'visible' : ''}">
        <div class="rpg-bar-group">
            <div class="rpg-bar-label"><span>HP</span> <span id="hp-text">${rpgStats.hp}/${rpgStats.maxHp}</span></div>
            <div class="rpg-bar-bg">
                <div id="hp-bar-fill" class="rpg-bar-fill" style="width: ${(rpgStats.hp/rpgStats.maxHp)*100}%"></div>
            </div>
        </div>
        <div class="rpg-bar-group">
            <div class="rpg-bar-label"><span>MP</span> <span id="mp-text">${rpgStats.mp}/${rpgStats.maxMp}</span></div>
            <div class="rpg-bar-bg">
                <div id="mp-bar-fill" class="rpg-bar-fill" style="width: ${(rpgStats.mp/rpgStats.maxMp)*100}%"></div>
            </div>
        </div>
    </div>`;
    
    $('body').append(html);

    // ผูก Event ปุ่ม Toggle
    $('#rpg-toggle-btn').on('click', () => {
        const container = $('#rpg-status-container');
        container.toggleClass('visible');
        rpgStats.isVisible = container.hasClass('visible');
        saveSettings(); // จำค่าสถานะเปิดปิดไว้
    });
};

// ฟังก์ชันอัปเดตหลอดเลือด
const updateRPGDisplay = () => {
    const hpPercent = Math.max(0, Math.min(100, (rpgStats.hp / rpgStats.maxHp) * 100));
    const mpPercent = Math.max(0, Math.min(100, (rpgStats.mp / rpgStats.maxMp) * 100));

    $('#hp-bar-fill').css('width', hpPercent + '%');
    $('#mp-bar-fill').css('width', mpPercent + '%');
    $('#hp-text').text(`${rpgStats.hp}/${rpgStats.maxHp}`);
    $('#mp-text').text(`${rpgStats.mp}/${rpgStats.maxMp}`);
    
    saveSettings(); // เซฟทุกครั้งที่ค่าเปลี่ยน
};

// Logic อ่านข้อความ (เหมือนเดิม)
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
        rpgStats.hp = Math.min(rpgStats.maxHp, Math.max(0, rpgStats.hp));
        rpgStats.mp = Math.min(rpgStats.maxMp, Math.max(0, rpgStats.mp));
        updateRPGDisplay();
        toastr.info(`Status Updated: HP ${rpgStats.hp}, MP ${rpgStats.mp}`);
    }
};

// --- ส่วนของการสร้าง Settings Menu ใน SillyTavern ---
const addExtensionSettings = () => {
    // HTML สำหรับหน้าตั้งค่า
    const settingsHtml = `
    <div class="rpg-settings">
        <h4>RPG Overlay Configuration</h4>
        <div class="rpg-setting-row">
            <label>Max HP:</label>
            <input type="number" id="rpg-max-hp" value="${rpgStats.maxHp}" />
        </div>
        <div class="rpg-setting-row">
            <label>Max MP:</label>
            <input type="number" id="rpg-max-mp" value="${rpgStats.maxMp}" />
        </div>
        <div class="rpg-setting-row">
            <button id="rpg-reset-btn" class="menu_button">Full Heal (Reset)</button>
        </div>
        <small>Changes are saved automatically.</small>
    </div>
    `;

    // รอให้หน้า Extension โหลดเสร็จ แล้วแปะ HTML นี้เข้าไป
    // หมายเหตุ: SillyTavern ไม่มี API มาตรฐานเป๊ะๆ สำหรับ Inject UI เราเลยใช้ jQuery selector ทั่วไป
    // วิธีนี้: เมื่อ user เปิดเมนู Extension ตัวนี้ มันจะ Render HTML นี้
    
    // ค้นหาที่อยู่ของ Extension ใน List (ปกติ ST จะใช้ชื่อโฟลเดอร์เป็น ID หรือ class)
    // แต่เพื่อความง่าย เราจะใช้ฟังก์ชันที่ ST เตรียมไว้ให้ (ถ้ามี) หรือสร้าง Global Function
    
    // ** วิธีที่ Work ที่สุดใน ST ปัจจุบัน **
    // เราสร้างฟังก์ชันใส่ window object เพื่อให้ HTML เรียกใช้ได้ถ้าจำเป็น
    window.rpgUpdateSettings = () => {
        rpgStats.maxHp = parseInt($('#rpg-max-hp').val()) || 100;
        rpgStats.maxMp = parseInt($('#rpg-max-mp').val()) || 100;
        rpgStats.hp = rpgStats.maxHp; // Reset เลือดให้เต็มเมื่อแก้ Max
        rpgStats.mp = rpgStats.maxMp;
        updateRPGDisplay();
        toastr.success("RPG Settings Saved & Restored!");
    };
};

// Main Entry Point
jQuery(document).ready(function () {
    loadSettings();
    initRPGUI();

    // Observer สำหรับจับข้อความแชท
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

    // --- Inject Settings into Extensions Menu ---
    // เนื่องจาก ST โหลด Extensions แบบ Dynamic เราต้องรอจังหวะที่ User กดเปิดเมนู Extensions
    // เราจะใช้ Trick ในการ Hook เข้าไปที่ DOM ของ Settings
    
    // สร้าง Settings UI ทันทีที่โหลด Extension
    const extensionId = "st-rpg-overlay"; // ต้องตรงกับชื่อโฟลเดอร์
    
    // รอสักนิดให้ ST โหลด Extension List เสร็จ
    setTimeout(() => {
        // หา Elements ในหน้า Extension ที่ตรงกับชื่อเรา
        // ปกติ ST จะสร้าง div ที่มี attribute 'data-extension-id="st-rpg-overlay"' (ขึ้นอยู่กับเวอร์ชั่น)
        // เพื่อความชัวร์ เราจะใช้วิธี Standard ของ ST: extension_settings variable
        
        /* ในไฟล์ extension.js ของ SillyTavern หลัก (ไม่ใช่ของเรา) 
           มันจะมองหาตัวแปร global ที่ชื่อ 'extension_settings' 
           แต่ extension แบบง่าย (client-only) มักไม่มี
           
           ดังนั้น: เราจะใช้ jQuery หาปุ่ม Setting ของเราแล้ว Override click event (Hacky แต่ได้ผล)
        */
       
       // ฟัง event เมื่อมีการเปิด popup extensions
       $(document).on('click', '#extensions_button', function() {
           // รอ Popup เปิด
           setTimeout(() => {
               // หา List item ของเรา
               // ปกติจะไม่มี ID ชัดเจน ให้ User มองหาชื่อ "ST RPG Overlay"
               // ** วิธีแก้: ** เราจะสร้างปุ่ม "Open RPG Settings" ไว้ที่ปุ่มลอยของเราด้วย (คลิกขวาที่ปุ่มลอย)
           }, 500);
       });

       // ** Feature เสริม: คลิกขวาที่ปุ่มดาบ เพื่อเปิด Settings เล็กๆ **
       $('#rpg-toggle-btn').on('contextmenu', (e) => {
           e.preventDefault();
           // ถามค่าใหม่ผ่าน Browser Prompt ง่ายๆ (เพื่อให้ใช้ได้ทั้ง Mobile/PC)
           const newMaxHp = prompt("Set Max HP:", rpgStats.maxHp);
           const newMaxMp = prompt("Set Max MP:", rpgStats.maxMp);
           
           if(newMaxHp && newMaxMp) {
               rpgStats.maxHp = parseInt(newMaxHp);
               rpgStats.maxMp = parseInt(newMaxMp);
               rpgStats.hp = rpgStats.maxHp; // Reset to full
               rpgStats.mp = rpgStats.maxMp; // Reset to full
               updateRPGDisplay();
               toastr.success("Settings Updated via Quick Menu");
           }
       });

    }, 2000);
});
