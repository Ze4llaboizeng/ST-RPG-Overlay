// RPG Extension for SillyTavern

(function () {
    // ข้อมูลเริ่มต้น (Default Data)
    let rpgData = {
        hp: 100, maxHp: 100,
        mp: 50, maxMp: 50,
        gold: 100,
        inventory: ["Potion", "Sword"]
    };

    // โหลดข้อมูลเก่าถ้ามี
    function loadData() {
        const stored = localStorage.getItem('st_rpg_data');
        if (stored) {
            rpgData = JSON.parse(stored);
        }
    }

    // บันทึกข้อมูล
    function saveData() {
        localStorage.setItem('st_rpg_data', JSON.stringify(rpgData));
    }

    // สร้าง UI HTML
    const rpgHtml = `
    <div id="rpg-overlay">
        <div class="rpg-header">RPG Status ⚔️</div>
        
        <div class="rpg-stat">
            <div class="stat-label"><span>HP</span> <span id="hp-text"></span></div>
            <div class="bar-container"><div id="hp-fill" class="hp-bar" style="width: 100%"></div></div>
            <div class="rpg-controls">
                <button class="rpg-btn" id="hp-minus">-</button>
                <button class="rpg-btn" id="hp-plus">+</button>
            </div>
        </div>

        <div class="rpg-stat">
            <div class="stat-label"><span>MP</span> <span id="mp-text"></span></div>
            <div class="bar-container"><div id="mp-fill" class="mp-bar" style="width: 100%"></div></div>
            <div class="rpg-controls">
                <button class="rpg-btn" id="mp-minus">-</button>
                <button class="rpg-btn" id="mp-plus">+</button>
            </div>
        </div>

        <div class="rpg-stat">
            <div class="stat-label"><span>Gold 💰</span> <span id="gold-text"></span></div>
            <div class="rpg-controls">
                <button class="rpg-btn" id="gold-minus">-</button>
                <button class="rpg-btn" id="gold-plus">+</button>
            </div>
        </div>

        <div class="inventory-section">
            <div class="stat-label">🎒 Inventory</div>
            <div style="display:flex; gap:5px; margin-bottom:5px;">
                <input type="text" id="item-input" placeholder="Item name" style="width:70%; color:black;">
                <button class="rpg-btn" id="add-item">Add</button>
            </div>
            <ul id="inventory-list"></ul>
        </div>
    </div>
    `;

    // ฟังก์ชันอัปเดตหน้าจอ UI
    function updateUI() {
        // HP
        $('#hp-text').text(`${rpgData.hp}/${rpgData.maxHp}`);
        $('#hp-fill').css('width', `${(rpgData.hp / rpgData.maxHp) * 100}%`);
        
        // MP
        $('#mp-text').text(`${rpgData.mp}/${rpgData.maxMp}`);
        $('#mp-fill').css('width', `${(rpgData.mp / rpgData.maxMp) * 100}%`);

        // Gold
        $('#gold-text').text(rpgData.gold);

        // Inventory
        const list = $('#inventory-list');
        list.empty();
        rpgData.inventory.forEach((item, index) => {
            list.append(`<li>${item} <span class="delete-item" data-index="${index}">x</span></li>`);
        });

        saveData(); // Save every time UI updates
    }

    // ฟังก์ชันเริ่มทำงานเมื่อโหลด Extension
    $(document).ready(function () {
        loadData();
        $('body').append(rpgHtml);
        updateUI();

        // --- Event Listeners (ปุ่มกดต่างๆ) ---
        
        // HP Logic
        $('#hp-minus').click(() => { if(rpgData.hp > 0) rpgData.hp -= 10; updateUI(); });
        $('#hp-plus').click(() => { if(rpgData.hp < rpgData.maxHp) rpgData.hp += 10; updateUI(); });

        // MP Logic
        $('#mp-minus').click(() => { if(rpgData.mp > 0) rpgData.mp -= 5; updateUI(); });
        $('#mp-plus').click(() => { if(rpgData.mp < rpgData.maxMp) rpgData.mp += 5; updateUI(); });

        // Gold Logic
        $('#gold-minus').click(() => { if(rpgData.gold > 0) rpgData.gold -= 10; updateUI(); });
        $('#gold-plus').click(() => { rpgData.gold += 10; updateUI(); });

        // Add Item
        $('#add-item').click(() => {
            const val = $('#item-input').val();
            if(val) {
                rpgData.inventory.push(val);
                $('#item-input').val('');
                updateUI();
            }
        });

        // Remove Item (Delegate event for dynamic list)
        $('#inventory-list').on('click', '.delete-item', function() {
            const idx = $(this).data('index');
            rpgData.inventory.splice(idx, 1);
            updateUI();
        });
    });
})();
