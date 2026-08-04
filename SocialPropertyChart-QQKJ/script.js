// ========== 预设数据 ==========
let leftSliders = [
    { label: '我认为我是：', left: '淡人', right: '浓人', value: 50 },
    { label: '是否主动破冰，与他人互动：', left: '否', right: '是', value: 50 },
    { label: '对空间争议话题的参与度：', left: 'peace and love', right: 'ttk！！', value: 50 },
    { label: '对社交干涉的接受度(壁塑/编水/嘴碎等)：', left: '放荡不羁爱自由', right: '尽量演好每一帧', value: 50 },
    { label: '对删后重加的态度：', left: '绝不接受', right: '欢迎再续前缘 从来不请', value: 50 },
    { label: '对有仇和好的态度：', left: '老死不相往来', right: '逐渐放下', value: 50 },
    { label: '与列表观念不合：', left: '无所谓', right: '删除拉黑 随地大小絮', value: 50 },
    { label: '面刺寡人之过者：', left: '受上赏', right: '给两枪', value: 50 },
    { label: '我与朋友的联系频率：', left: '很久不联系也没关系', right: '不常联系算什么朋友', value: 50 }
];
let middleSliders = [
    { label: '如何补充精神能量：', left: '自闭', right: '社交！疯狂社交！', value: 50 },
    { label: '被一不小心踩了雷点：', left: '孩子不是故意的算了算了', right: '拖下去斩了', value: 50 },
    { label: '对自来熟的态度：', left: '女士请自重', right: '大欢迎', value: 50 },
    { label: '是否接受单删：', left: '无所谓', right: '不接受', value: 50 },
    { label: '清列频率：', left: '从来不清', right: '经常清列', value: 50 },
    { label: '搞同人/oc更喜欢：', left: '单机', right: '同好四面八方来', value: 50 },
    { label: '我的精力水平是：', left: '💤', right: '精力充沛', value: 50 },
    { label: '我护短吗？：', left: '帮亲不帮理', right: '帮理不帮亲', value: 50 },
    { label: '有巨大的观念分歧无法相处：', left: '愿意磨合', right: '分道扬镳', value: 50 }
];
let tableRows = [
    { text: '小窗倒黑泥', state1: 0, state2: 0 },
    { text: '被问个人隐私', state1: 0, state2: 0 },
    { text: '聊天记录挂空间', state1: 0, state2: 0 },
    { text: '已读不回/敷衍', state1: 0, state2: 0 },
    { text: '空间艾特', state1: 0, state2: 0 },
    { text: '反复确认关系', state1: 0, state2: 0 },
    { text: 'deeptalk/敏感话题', state1: 0, state2: 0 },
    { text: '评论', state1: 0, state2: 0 },
    { text: '单向互动', state1: 0, state2: 0 },
    { text: '锁空间', state1: 0, state2: 0 },
    { text: '报备式聊天', state1: 0, state2: 0 },
    { text: '对方表现出占有欲', state1: 0, state2: 0 },
    { text: '“偷列表”', state1: 0, state2: 0 },
    { text: '地狱笑话', state1: 0, state2: 0 },
    { text: '大量分享生活琐事', state1: 0, state2: 0 },
    { text: '自己不感兴趣的话题', state1: 0, state2: 0 }
];

// ========== 渲染函数 ==========
function renderSliders(containerId, dataArray) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    dataArray.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'slider-item';
        div.innerHTML = `
            <button class="slider-del" data-index="${index}" data-container="${containerId}">✕</button>
            <span class="slider-label">${item.label}</span>
            <div class="slider-wrap">
                <input type="range" min="0" max="100" value="${item.value || 50}" />
            </div>
            <div class="slider-extremes">
                <span>${item.left}</span>
                <span>${item.right}</span>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.slider-del').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            const cid = this.dataset.container;
            if (cid === 'leftSliderList') {
                leftSliders.splice(idx, 1);
                renderSliders('leftSliderList', leftSliders);
            } else if (cid === 'middleSliderList') {
                middleSliders.splice(idx, 1);
                renderSliders('middleSliderList', middleSliders);
            }
            saveData();
        });
    });

    container.querySelectorAll('input[type="range"]').forEach((input, idx) => {
        input.addEventListener('input', function() {
            const val = parseInt(this.value);
            const isLeft = containerId === 'leftSliderList';
            const arr = isLeft ? leftSliders : middleSliders;
            if (arr[idx]) {
                arr[idx].value = val;
                saveData();
            }
        });
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    tableRows.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.text}</td>
            <td class="check-cell"><span class="custom-check state-${row.state1 || 0}" data-row="${index}" data-col="0"></span></td>
            <td class="check-cell"><span class="custom-check state-${row.state2 || 0}" data-row="${index}" data-col="1"></span></td>
            <td><button class="del-row-btn" data-index="${index}">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.custom-check').forEach(el => {
        el.addEventListener('click', function() {
            const rowIdx = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);
            let current = parseInt(this.dataset.state) || 0;
            current = (current + 1) % 3;
            this.dataset.state = current;
            this.className = `custom-check state-${current}`;
            if (col === 0) tableRows[rowIdx].state1 = current;
            else tableRows[rowIdx].state2 = current;
            saveData();
        });
    });

    tbody.querySelectorAll('.del-row-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            tableRows.splice(idx, 1);
            renderTable();
            saveData();
        });
    });
}

// ========== 保存 / 加载 / 重置 ==========
function saveData() {
    const cnInput = document.getElementById('cnInput');
    const tagInput = document.getElementById('tagInput');
    const composeInput = document.getElementById('composeInput');
    const extraInput = document.getElementById('extraInput');
    const avatarImg = document.getElementById('avatarImg');
    
    const cn = cnInput ? cnInput.value : '';
    const tag = tagInput ? tagInput.value : '';
    const compose = composeInput ? composeInput.value : '';
    const extra = extraInput ? extraInput.value : '';
    const prefer = Array.from(document.querySelectorAll('.prefer-row input[type="checkbox"]')).map(cb => cb.checked);
    const avatarSrc = avatarImg ? avatarImg.src : '';

    const data = {
        leftSliders,
        middleSliders,
        tableRows,
        cn, tag, compose, prefer, extra, avatarSrc
    };
    try {
        localStorage.setItem('socialFormData', JSON.stringify(data));
    } catch (e) {
        console.warn('保存数据失败', e);
    }
}

function loadData() {
    const stored = localStorage.getItem('socialFormData');
    if (!stored) return false;
    try {
        const data = JSON.parse(stored);
        leftSliders = data.leftSliders || leftSliders;
        middleSliders = data.middleSliders || middleSliders;
        tableRows = data.tableRows || tableRows;
        
        const cnInput = document.getElementById('cnInput');
        const tagInput = document.getElementById('tagInput');
        const composeInput = document.getElementById('composeInput');
        const extraInput = document.getElementById('extraInput');
        const avatarImg = document.getElementById('avatarImg');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        const avatarWrap = document.getElementById('avatarWrap');

        if (cnInput) cnInput.value = data.cn || '';
        if (tagInput) tagInput.value = data.tag || '';
        if (composeInput) composeInput.value = data.compose || '';
        if (extraInput) extraInput.value = data.extra || '';
        
        const preferCbs = document.querySelectorAll('.prefer-row input[type="checkbox"]');
        if (data.prefer && data.prefer.length === preferCbs.length) {
            preferCbs.forEach((cb, i) => cb.checked = data.prefer[i]);
        }
        if (data.avatarSrc && avatarImg && avatarPlaceholder && avatarWrap) {
            avatarImg.src = data.avatarSrc;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            avatarWrap.classList.add('has-image');
        }
        renderSliders('leftSliderList', leftSliders);
        renderSliders('middleSliderList', middleSliders);
        renderTable();
        return true;
    } catch (e) {
        console.warn('加载缓存失败', e);
        return false;
    }
}

function resetData() {
    if (!confirm('确认重置所有数据吗？')) return;
    localStorage.removeItem('socialFormData');
    location.reload();
}

// ========== 初始化 ==========
if (!loadData()) {
    renderSliders('leftSliderList', leftSliders);
    renderSliders('middleSliderList', middleSliders);
    renderTable();
}

// ========== 头像上传 ==========
const avatarWrap = document.getElementById('avatarWrap');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');

if (avatarWrap && avatarInput && avatarImg && avatarPlaceholder) {
    avatarWrap.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') avatarInput.click();
    });
    avatarInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            avatarImg.src = ev.target.result;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
            avatarWrap.classList.add('has-image');
            setTimeout(saveData, 100);
        };
        reader.readAsDataURL(file);
    });
}

// ========== 添加滑块（模态框） ==========
const sliderModal = document.getElementById('sliderModal');
const modalSliderLabel = document.getElementById('modalSliderLabel');
const modalSliderLeft = document.getElementById('modalSliderLeft');
const modalSliderRight = document.getElementById('modalSliderRight');
const modalSliderCancel = document.getElementById('modalSliderCancel');
const modalSliderConfirm = document.getElementById('modalSliderConfirm');

let currentTarget = 'left';

if (sliderModal && modalSliderLabel && modalSliderLeft && modalSliderRight && modalSliderCancel && modalSliderConfirm) {
    document.querySelectorAll('.btn-add[data-target]').forEach(btn => {
        btn.addEventListener('click', function() {
            currentTarget = this.dataset.target;
            sliderModal.classList.add('active');
            modalSliderLabel.value = '';
            modalSliderLeft.value = '';
            modalSliderRight.value = '';
        });
    });
    modalSliderCancel.addEventListener('click', function() {
        sliderModal.classList.remove('active');
    });
    modalSliderConfirm.addEventListener('click', function() {
        const label = modalSliderLabel.value.trim();
        const left = modalSliderLeft.value.trim();
        const right = modalSliderRight.value.trim();
        if (!label || !left || !right) {
            alert('请完整填写标签、左端和右端文字');
            return;
        }
        const newItem = { label, left, right, value: 50 };
        if (currentTarget === 'left') {
            leftSliders.push(newItem);
            renderSliders('leftSliderList', leftSliders);
        } else if (currentTarget === 'middle') {
            middleSliders.push(newItem);
            renderSliders('middleSliderList', middleSliders);
        }
        sliderModal.classList.remove('active');
        saveData();
    });
    sliderModal.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
}

// ========== 添加表格行（模态框） ==========
const tableModal = document.getElementById('tableModal');
const modalTableLabel = document.getElementById('modalTableLabel');
const modalTableCancel = document.getElementById('modalTableCancel');
const modalTableConfirm = document.getElementById('modalTableConfirm');

if (tableModal && modalTableLabel && modalTableCancel && modalTableConfirm) {
    document.getElementById('addTableRowBtn').addEventListener('click', function() {
        tableModal.classList.add('active');
        modalTableLabel.value = '';
    });
    modalTableCancel.addEventListener('click', function() {
        tableModal.classList.remove('active');
    });
    modalTableConfirm.addEventListener('click', function() {
        const text = modalTableLabel.value.trim();
        if (!text) {
            alert('请输入行为描述');
            return;
        }
        tableRows.push({ text, state1: 0, state2: 0 });
        renderTable();
        tableModal.classList.remove('active');
        saveData();
    });
    tableModal.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
}

// ========== 输入框自动保存 ==========
const cnInput = document.getElementById('cnInput');
const tagInput = document.getElementById('tagInput');
const composeInput = document.getElementById('composeInput');
const extraInput = document.getElementById('extraInput');
if (cnInput) cnInput.addEventListener('input', saveData);
if (tagInput) tagInput.addEventListener('input', saveData);
if (composeInput) composeInput.addEventListener('input', saveData);
if (extraInput) extraInput.addEventListener('input', saveData);
document.querySelectorAll('.prefer-row input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveData);
});

// ========== 打印按钮 ==========
const printBtn = document.getElementById('printBtn');
if (printBtn) {
    printBtn.addEventListener('click', function() {
        window.print();
    });
} else {
    console.warn('未找到打印按钮 #printBtn');
}

// ========== 重置按钮 ==========
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', resetData);
} else {
    console.warn('未找到重置按钮 #resetBtn');
}

// ========== 导出图片 ==========
const exportBtn = document.getElementById('exportImgBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', function() {
        console.log('导出图片按钮被点击');
        exportImage();
    });
} else {
    console.error('未找到 id="exportImgBtn" 的按钮，请检查 HTML');
}

function exportImage() {
    console.log('开始导出图片...');
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas 库未加载，请检查网络或刷新页面重试。');
        console.error('html2canvas 未定义');
        return;
    }

    const container = document.querySelector('.container');
    if (!container) {
        alert('未找到容器 .container');
        return;
    }
    const threeCol = document.querySelector('.three-col');
    if (!threeCol) {
        alert('未找到三列布局 .three-col');
        return;
    }

    // 保存原始样式
    const origContainerWidth = container.style.width;
    const origGridTemplate = threeCol.style.gridTemplateColumns;
    const origContainerPadding = container.style.padding;
    const origOverflow = container.style.overflow;

    // 强制三列布局，固定容器宽度为1200px
    container.style.width = '1200px';
    container.style.padding = '40px 35px';
    container.style.overflow = 'visible';
    threeCol.style.gridTemplateColumns = '1fr 1fr 1.2fr';

    // ---------- 处理滑块：生成模拟显示 ----------
    const sliderInputs = container.querySelectorAll('.slider-item input[type="range"]');
    const mockElements = [];
    sliderInputs.forEach(input => {
        const val = parseInt(input.value);
        const parent = input.parentNode; // .slider-wrap
        // 创建模拟容器
        const mock = document.createElement('div');
        mock.className = 'mock-slider';
        mock.style.cssText = 'position:relative; width:100%; height:30px; display:flex; align-items:center;';
        
        // 轨道
        const track = document.createElement('div');
        track.style.cssText = 'position:absolute; left:10px; right:10px; height:2px; background:#ccc;';
        mock.appendChild(track);
        
        // thumb圆点
        const thumb = document.createElement('div');
        const percent = (val / 100) * 100;
        thumb.style.cssText = `position:absolute; left:${percent}%; transform:translateX(-50%); width:18px; height:18px; border-radius:50%; background:#1e1e1e; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);`;
        track.appendChild(thumb); // 将thumb放在track内部，基于track定位
        
        // 隐藏原input
        input.style.display = 'none';
        parent.appendChild(mock);
        mockElements.push({ parent, input, mock });
    });

    console.log('正在截图，请稍候...');

    html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
    }).then(canvas => {
        // 恢复样式
        container.style.width = origContainerWidth;
        container.style.padding = origContainerPadding;
        container.style.overflow = origOverflow;
        threeCol.style.gridTemplateColumns = origGridTemplate;
        // 恢复滑块
        mockElements.forEach(({ parent, input, mock }) => {
            parent.removeChild(mock);
            input.style.display = '';
        });

        // 下载图片
        const link = document.createElement('a');
        link.download = '社交一览表.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('下载已触发');
    }).catch(err => {
        // 恢复样式
        container.style.width = origContainerWidth;
        container.style.padding = origContainerPadding;
        container.style.overflow = origOverflow;
        threeCol.style.gridTemplateColumns = origGridTemplate;
        // 恢复滑块
        mockElements.forEach(({ parent, input, mock }) => {
            parent.removeChild(mock);
            input.style.display = '';
        });
        console.error('导出图片失败:', err);
        alert('导出失败，请打开控制台查看详细错误信息。');
    });
}