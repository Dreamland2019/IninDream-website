import { OPERATORS } from './operator_data.js';

const AVATAR_PATH = './avatars/';         // 主页面显示的高清大图路径
const AVATAR_PATH_THUMB = './avatars_thumb/'; // 选择器里显示的缩略图路径

// ==================== 势力配置 ====================
const FACTION_NAMES = [
    'S.W.E.E.P.',
    '东',
    '乌萨斯',
    '乌萨斯学生自治团',
    '企鹅物流',
    '伊比利亚',
    '卡西米尔',
    '叙拉古',
    '哥伦比亚',
    '喀兰贸易',
    '塔拉',
    '巴别塔',
    '彩虹小队',
    '拉特兰',
    '格拉斯哥帮',
    '汐斯塔',
    '深海猎人',
    '炎',
    '炎-岁',
    '炎-龙门',
    '玻利瓦尔',
    '米诺斯',
    '维多利亚',
    '罗德岛',
    '罗德岛-精英干员',
    '莱塔尼亚',
    '莱欧斯小队',
    '莱茵生命',
    '萨尔贡',
    '萨米',
    '行动组A4',
    '行动预备组A6',
    '谢拉格',
    '阿戈尔',
    '雷姆必拓',
    '黑钢国际',
    '龙门近卫局'
];
// ==================================================

let state = {
    selectedOps: [],
    blankSlots: 0,
    sliders: [
        { label: '关于氪金', texts: ['0氪', '微氪', '中氪', '重氪'], value: 50, steps: 4 },
        { label: '关于吃谷', texts: ['不太吃', '理性吃', '为鹰角掏空钱包'], value: 50, steps: 3 },
        { label: '关于剧情', texts: ['跳过党', '挑感兴趣的看', '剧情党'], value: 50, steps: 3 },
        { label: '剧情偏好', texts: ['温馨日常', '宏大悲剧'], value: 50, steps: 3 },
        { label: '更偏向于', texts: ['XP', '强度'], value: 50, steps: 3 },
        { label: '吃更多的是', texts: ['cb', 'cp'], value: 50, steps: 3 },
        { label: '集成战略(肉鸽)', texts: ['几乎不碰', '为了奖励打', '深度沉迷'], value: 50, steps: 3 }
    ],
    faction: '罗德岛'
};

// ==================== 渲染引擎 ====================

// 玩家名自动缩放（不换行）：内容超出输入框宽度时逐级缩小字号
function fitDrNameFontSize() {
    const input = document.getElementById('drNameInput');
    if (!input) return;
    const maxWidth = input.clientWidth;
    let size = 70;
    input.style.fontSize = size + 'px';
    while (input.scrollWidth > maxWidth && size > 18) {
        size -= 1;
        input.style.fontSize = size + 'px';
    }
}

function loadBaseInfo() {
    const radios = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const saved = JSON.parse(localStorage.getItem('arknights_baseInfo') || '{}');
    radios.forEach(el => {
        if (el.type === 'radio' && saved[el.name] === el.value) el.checked = true;
        if (el.type === 'checkbox' && saved[el.name]?.includes(el.value)) el.checked = true;
    });
    syncCustomControlState();
    const extraTextArea = document.getElementById('extraInput');
    if (extraTextArea) {
        // 初始化先算一次高度（防止刷新页面后高度塌陷）
        extraTextArea.style.height = 'auto';
        extraTextArea.style.height = extraTextArea.scrollHeight + 'px';

        extraTextArea.addEventListener('input', function() {
            // 重置高度为 auto，获取真实的 scrollHeight，再赋值回去（这样删文字时高度也会自动回缩！）
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            saveState(); // 触发原有的保存逻辑
        });
    }
    document.getElementById('drNameInput').value = saved.drName || '';
    document.getElementById('extraInput').value = saved.extra || '';
    fitDrNameFontSize();

    if (saved.avatarLgSrc) {
        const wrap = document.getElementById('avatarWrapLg');
        const img = document.getElementById('avatarImgLg');
        const placeholder = document.getElementById('avatarPlaceholderLg');
        if (img && wrap && placeholder) {
            img.src = saved.avatarLgSrc;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            wrap.classList.add('has-image');
        }
    }
}

function saveBaseInfo() {
    const avatarImgLg = document.getElementById('avatarImgLg');
    const data = { 
        drName: document.getElementById('drNameInput').value, 
        extra: document.getElementById('extraInput').value,
        avatarLgSrc: avatarImgLg ? avatarImgLg.src : ''
    };
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => {
        if (!data[el.name]) data[el.name] = [];
        if (el.type === 'radio' && el.checked) data[el.name] = el.value;
        if (el.type === 'checkbox' && el.checked) data[el.name].push(el.value);
    });
    localStorage.setItem('arknights_baseInfo', JSON.stringify(data));
}

// ==================== 自定义表单控件（radio/checkbox）====================
function syncCustomControlState() {
    document.querySelectorAll('.custom-radio, .custom-checkbox').forEach(el => {
        const input = el.querySelector('input[type="radio"], input[type="checkbox"]');
        if (input && input.checked) el.classList.add('active');
        else el.classList.remove('active');
    });
}

function bindCustomControls() {
    document.querySelectorAll('.custom-radio').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll(`.custom-radio[data-name="${this.dataset.name}"]`).forEach(g => g.classList.remove('active'));
            this.classList.add('active');
            const input = this.querySelector('input[type="radio"]');
            if (input) input.checked = true;
            saveState();
        });
    });
    document.querySelectorAll('.custom-checkbox').forEach(el => {
        el.addEventListener('click', function() {
            this.classList.toggle('active');
            const input = this.querySelector('input[type="checkbox"]');
            if (input) input.checked = this.classList.contains('active');
            saveState();
        });
    });
}

function renderSliders() {
    const container = document.getElementById('sliderContainer');
    container.innerHTML = '';
    state.sliders.forEach((item, idx) => {
        const steps = item.steps || 3;
        const currentVal = item.value != null ? item.value : 50;

        const div = document.createElement('div');
        div.className = 'slider-item';
        
        let ticksHtml = '';
        for (let i = 0; i < steps; i++) {
            const left = (i / (steps - 1)) * 100;
            ticksHtml += `<div class="tick" style="left:${left}%"></div>`;
        }

        let textsHtml = '';
        if (item.texts && item.texts.length > 0) {
            const len = item.texts.length;
            textsHtml = item.texts.map((t, i) => {
                const left = (i / (len - 1)) * 100;
                let alignClass = 'slider-text-center';
                let styleStr = `left:${left}%;`;
                if (i === 0) {
                    alignClass = 'slider-text-left';
                    styleStr = `left:0;`;
                } else if (i === len - 1) {
                    alignClass = 'slider-text-right';
                    styleStr = `left:100%;`;
                }
                return `<span class="${alignClass}" style="${styleStr}">${t || ''}</span>`;
            }).join('');
        }

        div.innerHTML = `
            <button class="slider-del" data-idx="${idx}">✕</button>
            <span class="slider-title">${item.label}</span>
            <div class="slider-wrap">
                <div class="slider-track-bg"></div>
                <div class="slider-track-fill"></div>
                <input type="range" min="0" max="100" value="${currentVal}" data-idx="${idx}" class="slider-range-hidden" />
                <div class="slider-thumb"></div>
                <div class="slider-ticks">${ticksHtml}</div>
            </div>
            <div class="slider-texts">${textsHtml}</div>
        `;
        container.appendChild(div);

        const input = div.querySelector('input[type="range"]');
        const fill = div.querySelector('.slider-track-fill');
        const thumb = div.querySelector('.slider-thumb');
        const updateSliderPos = () => {
            const pct = input.value + '%';
            if (fill) fill.style.width = pct;
            if (thumb) thumb.style.left = pct;
        };
        updateSliderPos();
        input.addEventListener('input', function() {
            state.sliders[parseInt(this.dataset.idx)].value = parseInt(this.value);
            updateSliderPos();
            saveState();
        });

        const delBtn = div.querySelector('.slider-del');
        delBtn.addEventListener('click', function() {
            state.sliders.splice(parseInt(this.dataset.idx), 1);
            renderSliders();
            saveState();
        });
    });
}

function renderSelectedOps() {
    const grid = document.getElementById('selectedOpsGrid');
    const tips = document.getElementById('selectedTips');
    grid.innerHTML = '';
    state.selectedOps.forEach(op => {
        const div = document.createElement('div');
        div.className = 'char-item';
        div.innerHTML = `<img src="${AVATAR_PATH}${op.avatar}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" /><span class="char-name">${op.name}</span>`;
        grid.appendChild(div);
    });
    // 空白格：供玩家导出后自行 P 图（如剧情角色等无头像角色）
    for (let i = 0; i < state.blankSlots; i++) {
        const blank = document.createElement('div');
        blank.className = 'char-item char-blank';
        blank.title = '空白格：导出后可自行 P 图，点击移除';
        blank.innerHTML = `<span class="blank-hint">＋</span>`;
        blank.addEventListener('click', function() {
            state.blankSlots = Math.max(0, state.blankSlots - 1);
            renderSelectedOps();
            saveState();
        });
        grid.appendChild(blank);
    }
    // 自动补足到 8 格（仅当总数不足 8 时）
    const remain = Math.max(0, 8 - state.selectedOps.length - state.blankSlots);
    for (let i = 0; i < remain; i++) {
        const empty = document.createElement('div');
        empty.className = 'char-item';
        empty.style.background = '#f4f4f4';
        grid.appendChild(empty);
    }
    let tipText = `已选择 ${state.selectedOps.length} 位干员`;
    if (state.blankSlots > 0) tipText += ` · ${state.blankSlots} 个空白格`;
    tips.textContent = tipText;
}

function initFactionSelect() {
    const sel = document.getElementById('factionSelect');
    if (!sel) return;
    sel.innerHTML = '';
    FACTION_NAMES.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
    });
}

function renderFaction(val) {
    const container = document.getElementById('bgLogoContainer');
    const img = document.getElementById('bgLogoImg');
    if (!container || !img) return;
    
    const imgPath = `./logos/Logo_${val}.png`; 
    img.src = imgPath;

    // 同步小 Logo（与背景 logo 同图，仅尺寸缩小）
    const riLogoImg = document.getElementById('riLogoImg');
    if (riLogoImg) {
        riLogoImg.src = imgPath;
        riLogoImg.onerror = function() { riLogoImg.style.display = 'none'; };
        riLogoImg.onload = function() { riLogoImg.style.display = 'inline-block'; };
    }
    
    img.onerror = function() { 
        console.error(`❌ 找不到背景 LOGO: ${imgPath}`);
        container.style.display = 'none'; 
    };
    img.onload = function() { 
        container.style.display = 'flex'; 
    };
}

function saveState() {
    localStorage.setItem('arknights_selectedOps', JSON.stringify(state.selectedOps.map(o => o.id)));
    localStorage.setItem('arknights_blankSlots', String(state.blankSlots));
    localStorage.setItem('arknights_sliders', JSON.stringify(state.sliders));
    localStorage.setItem('arknights_faction', state.faction);
    saveBaseInfo();
}

function loadState() {
    const opsIds = JSON.parse(localStorage.getItem('arknights_selectedOps') || '[]');
    state.selectedOps = opsIds.map(id => OPERATORS.find(o => o.id === id)).filter(Boolean);
    state.blankSlots = parseInt(localStorage.getItem('arknights_blankSlots') || '0', 10) || 0;
    const sliders = JSON.parse(localStorage.getItem('arknights_sliders') || 'null');
    if (sliders) state.sliders = sliders;

    initFactionSelect();
    const savedFaction = localStorage.getItem('arknights_faction') || '罗德岛';
    state.faction = savedFaction;
    document.getElementById('factionSelect').value = savedFaction;
    renderFaction(savedFaction);

    renderSliders();
    renderSelectedOps();
    loadBaseInfo();
}

// ==================== 干员选择器逻辑 ====================
let tempSelectedIds = [];
function openSelector() {
    tempSelectedIds = state.selectedOps.map(o => o.id);
    document.getElementById('operatorModal').classList.add('active');
    renderModalList();
    initFilters();
}
function closeSelector() { document.getElementById('operatorModal').classList.remove('active'); }

function renderModalList() {
    const container = document.getElementById('modalOperatorList');
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const pFilter = document.getElementById('filterProfession').value;
    const rFilter = document.getElementById('filterRace').value;
    const raFilter = document.getElementById('filterRarity').value;

    let list = OPERATORS.filter(op => {
        if (keyword && !op.name.toLowerCase().includes(keyword)) return false;
        if (pFilter && op.profession !== pFilter) return false;
        if (rFilter && op.race !== rFilter) return false;
        if (raFilter && op.rarity !== raFilter) return false;
        return true;
    });

    container.innerHTML = '';
    list.forEach(op => {
        const div = document.createElement('div');
        div.className = 'op-item';
        const checked = tempSelectedIds.includes(op.id) ? 'checked' : '';
        div.innerHTML = `
            <input type="checkbox" value="${op.id}" ${checked} />
            <!-- 【修改点】：这里把路径换成了 AVATAR_PATH_THUMB ！ -->
            <img src="${AVATAR_PATH_THUMB}${op.avatar}" onerror="this.style.display='none'" />
            <span>${op.name} ${op.rarity}</span>
        `;
        div.querySelector('input[type="checkbox"]').addEventListener('change', function() {
            const id = parseInt(this.value);
            if (this.checked) { if (!tempSelectedIds.includes(id)) tempSelectedIds.push(id); }
            else { tempSelectedIds = tempSelectedIds.filter(i => i !== id); }
        });
        container.appendChild(div);
    });
}

function initFilters() {
    const professions = [...new Set(OPERATORS.map(o => o.profession))];
    const races = [...new Set(OPERATORS.map(o => o.race))];
    const rarities = [...new Set(OPERATORS.map(o => o.rarity))];

    const setOptions = (id, values, label) => {
        const sel = document.getElementById(id);
        const curVal = sel.value;
        sel.innerHTML = `<option value="">${label}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
        sel.value = curVal;
        sel.onchange = renderModalList;
    };
    setOptions('filterProfession', professions, '根职业（全部）');
    setOptions('filterRace', races, '种族（全部）');
    setOptions('filterRarity', rarities, '稀有度（全部）');
    document.getElementById('searchInput').oninput = renderModalList;
}

// ==================== 导出与重置 ====================
function exportImage() {
    // ===== 【新增：强制备份】导出瞬间立即保存当前状态，防止意外重置导致缓存丢失！ =====
    saveState(); 

    const container = document.querySelector('.container');
    container.classList.add('hide-for-export');
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));

    // ===== 【核心升级】强制导出宽度为电脑端桌面尺寸 (960px) =====
    const desktopWidth = 960; 

    const clone = container.cloneNode(true);
    clone.classList.add('export-clone');
    // ===== 【新增核心】注入一段强制桌面版的 CSS，使手机端排版不影响导出！ =====
    const cloneStyle = document.createElement('style');
    cloneStyle.textContent = `
        .container { padding: 45px 50px !important; }
        .top-row { gap: 15px !important; margin-bottom: 10px !important; }
        .bottom-content { gap: 40px !important; }
        .dr-area { margin-bottom: 10px !important; }
        .dr-label { font-size: 80px !important; font-weight: bold !important; line-height: 1 !important; }
        .dr-input { width: 520px !important; font-size: 80px !important; }
        .info-item .label { width: 100px !important; font-size: 23px !important; }
        .info-item .options label { font-size: 18px !important; }
        .sec-title { font-size: 18px !important; }
        .slider-title { font-size: 17px !important; }
        .slider-texts span { font-size: 16px !important; }
        .footer-section textarea { font-size: 19px !important; }
        /* 👇 新增这两行，强制恢复博士头像和干员头像的电脑端尺寸 */
        .avatar-wrap-lg { width: 233px !important; height: 233px !important; }
        .char-item { max-width: 120px !important; max-height: 120px !important; }
        /* 👇 新增：导出时强制新装饰元素为桌面端样式，并避免与模拟控件重复渲染 */
        .export-clone .dr-blue-bar { width: 8px !important; height: 100px !important; top: 6px !important; }
        .export-clone .dr-subtitle { font-size: 24px !important; font-weight: 700 !important; }
        .export-clone .right-edge-dots { display: block !important; }
        .export-clone .logo-section { flex-direction: row !important; align-items: flex-end; !important; }
        .export-clone .ri-slogan { margin: 0 0 15px 0 !important; }
        .export-clone .custom-radio, .export-clone .custom-checkbox { gap: 4px !important; font-size: 20px !important; }
        .export-clone .custom-radio::before, .export-clone .custom-radio::after,
        .export-clone .custom-checkbox::before, .export-clone .custom-checkbox::after { content: none !important; display: none !important; }
        .export-clone .slider-track-bg, .export-clone .slider-track-fill, .export-clone .slider-thumb { display: none !important; }
    `;

    // 把这段样式注入到克隆体中
    clone.appendChild(cloneStyle);

    // ===== 【修复条形码】随机生成动态粗细的条形码！ =====
    const cloneBarcode = clone.querySelector('.barcode-lines');
    if (cloneBarcode) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 33;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';

        let x = 0;
        // 不断循环，直到画满 120 像素宽度
        while (x < 120) {
            // 随机生成黑条的宽度 (1px ~ 4px)
            let barWidth = Math.floor(Math.random() * 4) + 1;
            if (x + barWidth > 120) barWidth = 120 - x;
            ctx.fillRect(x, 0, barWidth, 33);

            x += barWidth;

            // 随机生成间隔的宽度 (1px ~ 3px)
            let gapWidth = Math.floor(Math.random() * 3) + 1;
            if (x + gapWidth > 120) gapWidth = 120 - x;
            x += gapWidth;
        }
        // 替换原有的 div
        cloneBarcode.parentNode.replaceChild(canvas, cloneBarcode);
    }
    // ====================================================================

    // ===== 导出：把基础信息的单/复选项改成“斜杠分隔 + 选中项红色马克笔涂抹” =====
    const infoOptions = clone.querySelectorAll('.info-item .options');
    infoOptions.forEach(optionsEl => {
        const optionEls = optionsEl.querySelectorAll('.custom-radio, .custom-checkbox');
        if (optionEls.length === 0) return;
        const parts = [];
        optionEls.forEach(opt => {
            // 勾选态以 .active class 为准（cloneNode 不会复制 input.checked 属性）
            const isChecked = opt.classList.contains('active');
            const text = (opt.textContent || '').trim();
            if (isChecked) {
                parts.push(`<span style="background: rgba(255, 45, 45, 0.35); padding: 1px 3px;">${text}</span>`);
            } else {
                parts.push(`<span>${text}</span>`);
            }
        });
        optionsEl.innerHTML = parts.join('  /  ');
        optionsEl.style.display = 'block';
        optionsEl.style.fontSize = '23px';
        optionsEl.style.lineHeight = '1.6';
    });

    // 1. 因为 clone 本身就是 .container，直接修改它的样式。
    clone.style.maxWidth = desktopWidth + 'px';
    clone.style.width = desktopWidth + 'px';
    
    // 【关键修复】这里不再读取手机端的真实 padding，而是直接覆盖为桌面端设定值
    // 否则注入的 css !important 会被内联样式覆盖
    clone.style.padding = '45px 50px';

    // 2. 强制覆盖手机端自定义头像的 margin，使用电脑端位置
    const cloneAvatarArea = clone.querySelector('.custom-avatar-area');
    if (cloneAvatarArea) {
        // 【修正】改为和编辑时一致的 margin-right: 70px，并让 margin-top 为 0 以免下沉
        cloneAvatarArea.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 120px;
            margin-top: 0px;
        `;
    }

    // 3. 强制恢复背景 LOGO 为最新的桌面端样式
    const cloneLogoContainer = clone.querySelector('#bgLogoContainer');
    const cloneLogoImg = clone.querySelector('#bgLogoImg');
    if (cloneLogoContainer && cloneLogoImg) {
        cloneLogoContainer.style.cssText = `
            position: absolute !important;
            bottom: 80px !important;
            right: 10px !important;
            pointer-events: none !important;
            z-index: 0 !important;
            opacity: 0.08 !important;
            display: flex !important;
        `;
        cloneLogoImg.style.cssText = `
            width: 400px !important;
            max-width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
        `;
    }

    // 4. 隐藏手机端的底部快捷操作栏
    const cloneBottomToolbar = clone.querySelector('.bottom-toolbar');
    if (cloneBottomToolbar) cloneBottomToolbar.style.display = 'none';

    // 5. 强制恢复电脑端双栏 Flex 布局
    const cloneTopRow = clone.querySelector('.top-row');
    const cloneBottomContent = clone.querySelector('.bottom-content');
    if (cloneTopRow) {
        cloneTopRow.style.flexDirection = 'row';
        cloneTopRow.style.flexWrap = 'wrap';
    }
    if (cloneBottomContent) {
        cloneBottomContent.style.flexDirection = 'row';
        cloneBottomContent.style.flexWrap = 'wrap';
    }

    // 6. 恢复左右栏的宽度比例
    const cloneTopLeft = clone.querySelector('.top-left');
    const cloneTopRight = clone.querySelector('.top-right');
    const cloneBottomLeft = clone.querySelector('.bottom-left');
    const cloneBottomRight = clone.querySelector('.bottom-right');
    
    if (cloneTopLeft) { cloneTopLeft.style.flex = '2'; cloneTopLeft.style.minWidth = '350px'; }
    if (cloneTopRight) { 
        cloneTopRight.style.flex = '1'; 
        cloneTopRight.style.minWidth = '200px'; 
        cloneTopRight.style.display = 'flex'; 
        cloneTopRight.style.justifyContent = 'center'; 
        cloneTopRight.style.alignItems = 'center';     
    }
    if (cloneBottomLeft) { cloneBottomLeft.style.flex = '1'; cloneBottomLeft.style.minWidth = '320px'; }
    if (cloneBottomRight) { cloneBottomRight.style.flex = '2'; cloneBottomRight.style.minWidth = '400px'; }

    // 7. 恢复干员选择器为 4 列布局（!important 内联样式，压过手机端 3 列媒体查询）
    const cloneGrid = clone.querySelector('.char-selected-grid');
    if (cloneGrid) {
        cloneGrid.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
    }

    // 8. 修复导出：彻底去掉 Dr. 输入框下划线
    const cloneDrInput = clone.querySelector('#drNameInput');
    if (cloneDrInput) {
        const val = cloneDrInput.value || '博士名称';
        // 读取自动缩放后的实际字号（内联样式），避免被导出 CSS 的 80px !important 覆盖
        const actualFontSize = cloneDrInput.style.fontSize || '80px';
        const computedStyle = window.getComputedStyle(cloneDrInput);

        const textDisplay = document.createElement('div');
        textDisplay.className = cloneDrInput.className;
        textDisplay.style.cssText = `
            display: inline-block;
            width: ${computedStyle.width};
            font-size: ${actualFontSize} !important;
            font-weight: ${computedStyle.fontWeight};
            line-height: ${computedStyle.lineHeight};
            padding: 0 5px 0 0;
            background: transparent;
            color: #1a1a1a;
            border: none !important;
            border-bottom: none !important;
            white-space: nowrap !important;
        `;
        textDisplay.textContent = val;
        cloneDrInput.parentNode.replaceChild(textDisplay, cloneDrInput);
    }

    // 9. 修复补充文本框导出时自动换行问题
    const cloneExtraInput = clone.querySelector('#extraInput');
    if (cloneExtraInput) {
        const val = cloneExtraInput.value || '';
        const computedStyle = window.getComputedStyle(cloneExtraInput);

        const textDisplay = document.createElement('div');
        textDisplay.className = cloneExtraInput.className;
        textDisplay.style.cssText = `
            width: ${computedStyle.width};
            min-height: ${computedStyle.minHeight};
            font-size: ${computedStyle.fontSize};
            font-family: ${computedStyle.fontFamily};
            line-height: ${computedStyle.lineHeight};
            padding: ${computedStyle.padding};
            border: ${computedStyle.border};
            background: transparent;
            color: #1a1a1a;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            box-sizing: border-box;
            display: block;
        `;
        textDisplay.textContent = val;
        cloneExtraInput.parentNode.replaceChild(textDisplay, cloneExtraInput);
    }

    // 10. 修复滑块在截图中的显示
    const wraps = clone.querySelectorAll('.slider-wrap');
    wraps.forEach((wrap) => {
        const input = wrap.querySelector('input[type="range"]');
        if (!input) return;
        const val = parseInt(input.value);
        input.style.display = 'none';
        const mock = document.createElement('div');
        mock.style.cssText = 'position: relative; width: 100%; height: 34px; margin: 0;';
        const track = document.createElement('div');
        track.style.cssText = 'position: absolute; top: 50%; left: 0; right: 0; height: 3px; background: #000; transform: translateY(-50%); opacity: 0.7;';
        const thumb = document.createElement('div');
        thumb.style.cssText = `
            position: absolute; top: 50%; left: ${val}%; width: 16px; height: 16px;
            background: #1a1a1a; transform: translate(-50%, -50%); border-radius: 0; opacity: 0.8;
        `;
        track.appendChild(thumb);
        mock.appendChild(track);
        wrap.appendChild(mock);
    });

    // 11. 截图执行
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed; left:-9999px; top:0; z-index:-9999; width:${desktopWidth}px;`;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: desktopWidth 
    }).then(canvas => {
        document.body.removeChild(wrapper);
        container.classList.remove('hide-for-export');
        const link = document.createElement('a');
        link.download = '方舟扩列档案.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        document.body.removeChild(wrapper);
        container.classList.remove('hide-for-export');
        alert('导出失败: ' + err);
    });
}

function resetAll() {
    if (!confirm('确认重置所有数据吗？此操作不可撤销！')) return;
    localStorage.clear();
    location.reload();
}

// ==================== 新增滑块 ====================
document.getElementById('addSliderBtn').addEventListener('click', function() {
    document.getElementById('sliderModal').classList.add('active');
    document.getElementById('modalSSteps').dispatchEvent(new Event('change'));
});

document.getElementById('cancelSlider').addEventListener('click', function() {
    document.getElementById('sliderModal').classList.remove('active');
});

document.getElementById('modalSSteps').addEventListener('change', function() {
    const steps = parseInt(this.value);
    const container = document.getElementById('tickInputsContainer');
    container.innerHTML = '';
    for (let i = 0; i < steps; i++) {
        const div = document.createElement('div');
        div.className = 'modal-field';
        div.innerHTML = `
            <label>刻度 ${i+1} 文字（可留空）</label>
            <input type="text" class="tick-text-input" placeholder="刻度 ${i+1} 描述" />
        `;
        container.appendChild(div);
    }
});

document.getElementById('confirmSlider').addEventListener('click', function() {
    const label = document.getElementById('modalSLabel').value.trim();
    const steps = parseInt(document.getElementById('modalSSteps').value);
    const inputs = document.querySelectorAll('#tickInputsContainer .tick-text-input');
    const texts = Array.from(inputs).map(input => input.value.trim());

    if (!label) { alert('请输入标题文字'); return; }
    
    state.sliders.push({ label, texts, value: 50, steps });
    renderSliders();
    saveState();
    document.getElementById('sliderModal').classList.remove('active');
});

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    bindCustomControls();

    document.querySelectorAll('input, #extraInput, #drNameInput').forEach(el => {
        el.addEventListener('change', saveState);
        if(el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox') {
            el.addEventListener('input', saveState);
        }
    });

    // 玩家名输入时自动缩放字号（不换行）
    document.getElementById('drNameInput').addEventListener('input', fitDrNameFontSize);

    document.getElementById('openSelectorBtn').addEventListener('click', openSelector);
    document.getElementById('addBlankBtn').addEventListener('click', function() {
        state.blankSlots += 1;
        renderSelectedOps();
        saveState();
    });
    document.getElementById('closeSelectorBtn').addEventListener('click', closeSelector);
    document.getElementById('cancelSelector').addEventListener('click', closeSelector);
    document.getElementById('confirmSelector').addEventListener('click', function() {
        state.selectedOps = tempSelectedIds.map(id => OPERATORS.find(o => o.id === id)).filter(Boolean);
        renderSelectedOps();
        saveState();
        closeSelector();
    });

    // ===== 【修复】顶部势力切换监听 =====
    document.getElementById('factionSelect').addEventListener('change', function() {
        state.faction = this.value;
        renderFaction(state.faction);
        saveState();
    });

    // ===== 【新增】底部移动端切换监听 =====
    const bottomSelect = document.getElementById('bottomFactionSelect');
    if (bottomSelect) {
        // 复制顶部下拉框的数据
        const topSelect = document.getElementById('factionSelect');
        bottomSelect.innerHTML = topSelect.innerHTML;
        bottomSelect.value = state.faction;
        bottomSelect.addEventListener('change', function() {
            state.faction = this.value;
            renderFaction(state.faction);
            // 把顶部的选项也同步改变，保持状态一致
            document.getElementById('factionSelect').value = this.value;
            saveState();
        });
    }

    // ===== 【新增】底部按钮绑定 =====
    document.getElementById('bottomResetBtn').addEventListener('click', resetAll);
    document.getElementById('bottomExportBtn').addEventListener('click', exportImage);

    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
    });

    document.getElementById('exportImgBtn').addEventListener('click', exportImage);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
});

  // ===== 【补全】自定义大头像上传监听器 =====
    const avatarWrapLg = document.getElementById('avatarWrapLg');
    const avatarInputLg = document.getElementById('avatarInputLg');
    const avatarImgLg = document.getElementById('avatarImgLg');
    const avatarPlaceholderLg = document.getElementById('avatarPlaceholderLg');

    if (avatarWrapLg && avatarInputLg && avatarImgLg && avatarPlaceholderLg) {
        // 点击外框触发文件选择
        avatarWrapLg.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') avatarInputLg.click();
        });

        // 监听文件选择变更
        avatarInputLg.addEventListener('change', function(e) {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                // 将读取到的 base64 赋予头像标签
                avatarImgLg.src = ev.target.result;
                avatarImgLg.style.display = 'block';
                avatarPlaceholderLg.style.display = 'none';
                avatarWrapLg.classList.add('has-image');
                // 触发保存缓存（和你之前代码里的逻辑一样）
                setTimeout(saveState, 100); 
            };
            reader.readAsDataURL(file);
        });
    }