// ========== 预设数据（增加 value / state 字段） ==========
// 左栏滑块
let leftSliders = [
    { label: '我认为我是：', left: '淡人', right: '浓人', value: 50 },
    { label: '是否主动破冰，与他人互动：', left: '否', right: '是', value: 50 },
    { label: '对空间争议话题的参与度：', left: 'peace and love', right: 'tlk！！', value: 50 },
    { label: '对社交干涉的接受度(壁塑/编水/嘴碎等)：', left: '放荡不羁爱自由', right: '尽量演好每一帧', value: 50 },
    { label: '对删后重加的态度：', left: '绝不接受', right: '欢迎再续前缘 从来不请', value: 50 },
    { label: '对有仇和好的态度：', left: '老死不相往来', right: '逐渐放下', value: 50 },
    { label: '与列表观念不合：', left: '无所谓', right: '删除拉黑 随地大小絮', value: 50 },
    { label: '面刺寡人之过者：', left: '受上赏', right: '给两枪', value: 50 },
    { label: '我与朋友的联系频率：', left: '很久不联系也没关系', right: '不常联系算什么朋友', value: 50 }
];
// 中间栏滑块
let middleSliders = [
    { label: '如何补充精神能量：', left: '自闭', right: '社交！疯狂社交！', value: 50 },
    { label: '被一不小心踩了雷点：', left: '孩子不是故意的算了算了', right: '拖下去斩了', value: 50 },
    { label: '对自来熟的态度：', left: '女士请自重', right: '大欢迎', value: 50 },
    { label: '是否接受单删：', left: '无所谓', right: '不接受', value: 50 },
    { label: '清列频率：', left: '从来不清', right: '经常清列', value: 50 },
    { label: '搞同人/oc更喜欢：', left: '单机', right: '同好四面八方来', value: 50 },
    { label: '我的精力水平是：', left: '💤', right: '精力充沛', value: 50 },
    { label: '我护短吗？：', left: '帮亲不帮理', right: '理理不帮亲', value: 50 },
    { label: '有巨大的观念分歧无法相处：', left: '愿意磨合', right: '分道扬镳', value: 50 }
];
// 表格行（每行包含 text, state1, state2）
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

    // 删除事件
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

    // 滑块值变化保存
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

    // 复选框点击循环
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

    // 删除行
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
    const cn = document.getElementById('cnInput').value;
    const tag = document.getElementById('tagInput').value;
    const compose = document.getElementById('composeInput').value;
    const prefer = Array.from(document.querySelectorAll('.prefer-row input[type="checkbox"]')).map(cb => cb.checked);
    const extra = document.getElementById('extraInput').value;
    const avatarSrc = document.getElementById('avatarImg').src;

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
        document.getElementById('cnInput').value = data.cn || '';
        document.getElementById('tagInput').value = data.tag || '';
        document.getElementById('composeInput').value = data.compose || '';
        const preferCbs = document.querySelectorAll('.prefer-row input[type="checkbox"]');
        if (data.prefer && data.prefer.length === preferCbs.length) {
            preferCbs.forEach((cb, i) => cb.checked = data.prefer[i]);
        }
        document.getElementById('extraInput').value = data.extra || '';
        if (data.avatarSrc) {
            const img = document.getElementById('avatarImg');
            img.src = data.avatarSrc;
            img.style.display = 'block';
            document.getElementById('avatarPlaceholder').style.display = 'none';
            document.getElementById('avatarWrap').classList.add('has-image');
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

// ========== 添加滑块（模态框） ==========
const sliderModal = document.getElementById('sliderModal');
const modalSliderLabel = document.getElementById('modalSliderLabel');
const modalSliderLeft = document.getElementById('modalSliderLeft');
const modalSliderRight = document.getElementById('modalSliderRight');
let currentTarget = 'left';

document.querySelectorAll('.btn-add[data-target]').forEach(btn => {
    btn.addEventListener('click', function() {
        currentTarget = this.dataset.target;
        sliderModal.classList.add('active');
        modalSliderLabel.value = '';
        modalSliderLeft.value = '';
        modalSliderRight.value = '';
    });
});
document.getElementById('modalSliderCancel').addEventListener('click', function() {
    sliderModal.classList.remove('active');
});
document.getElementById('modalSliderConfirm').addEventListener('click', function() {
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

// ========== 添加表格行（模态框） ==========
const tableModal = document.getElementById('tableModal');
const modalTableLabel = document.getElementById('modalTableLabel');

document.getElementById('addTableRowBtn').addEventListener('click', function() {
    tableModal.classList.add('active');
    modalTableLabel.value = '';
});
document.getElementById('modalTableCancel').addEventListener('click', function() {
    tableModal.classList.remove('active');
});
document.getElementById('modalTableConfirm').addEventListener('click', function() {
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

// ========== 输入框自动保存 ==========
document.getElementById('cnInput').addEventListener('input', saveData);
document.getElementById('tagInput').addEventListener('input', saveData);
document.getElementById('composeInput').addEventListener('input', saveData);
document.getElementById('extraInput').addEventListener('input', saveData);
document.querySelectorAll('.prefer-row input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveData);
});

// ========== 打印按钮 ==========
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

// ========== 重置按钮 ==========
document.getElementById('resetBtn').addEventListener('click', resetData);

