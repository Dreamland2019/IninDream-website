// ========== 预设数据 ==========
// 左栏滑块
let leftSliders = [
    { label: '我认为我是：', left: '淡人', right: '浓人' },
    { label: '是否主动破冰，与他人互动：', left: '否', right: '是' },
    { label: '对空间争议话题的参与度：', left: 'peace and love', right: 'tlk！！' },
    { label: '对社交干涉的接受度(壁塑/编水/嘴碎等)：', left: '放荡不羁爱自由', right: '尽量演好每一帧' },
    { label: '对删后重加的态度：', left: '绝不接受', right: '欢迎再续前缘 从来不请' },
    { label: '对有仇和好的态度：', left: '老死不相往来', right: '逐渐放下' },
    { label: '与列表观念不合：', left: '无所谓', right: '删除拉黑 随地大小絮' },
    { label: '面刺寡人之过者：', left: '受上赏', right: '给两枪' },
    { label: '我与朋友的联系频率：', left: '很久不联系也没关系', right: '不常联系算什么朋友' }
];
// 中间栏滑块
let middleSliders = [
    { label: '如何补充精神能量：', left: '自闭', right: '社交！疯狂社交！' },
    { label: '被一不小心踩了雷点：', left: '孩子不是故意的算了算了', right: '拖下去斩了' },
    { label: '对自来熟的态度：', left: '女士请自重', right: '大欢迎' },
    { label: '是否接受单删：', left: '无所谓', right: '不接受' },
    { label: '清列频率：', left: '从来不清', right: '经常清列' },
    { label: '搞同人/oc更喜欢：', left: '单机', right: '同好四面八方来' },
    { label: '我的精力水平是：', left: '💤', right: '精力充沛' },
    { label: '我护短吗？：', left: '帮亲不帮理', right: '理理不帮亲' },
    { label: '有巨大的观念分歧无法相处：', left: '愿意磨合', right: '分道扬镳' }
];
// 表格行
let tableRows = [
    '小窗倒黑泥',
    '被问个人隐私',
    '聊天记录挂空间',
    '已读不回/敷衍',
    '空间艾特',
    '反复确认关系',
    'deeptalk/敏感话题',
    '评论',
    '单向互动',
    '锁空间',
    '报备式聊天',
    '对方表现出占有欲',
    '“偷列表”',
    '地狱笑话',
    '大量分享生活琐事',
    '自己不感兴趣的话题'
];

// ========== 渲染函数 ==========
// 渲染滑块列表
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
                <input type="range" min="0" max="100" value="50" />
            </div>
            <div class="slider-extremes">
                <span>${item.left}</span>
                <span>${item.right}</span>
            </div>
        `;
        container.appendChild(div);
    });
    // 绑定删除事件
    container.querySelectorAll('.slider-del').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(this.dataset.index);
            const containerId = this.dataset.container;
            if (containerId === 'leftSliderList') {
                leftSliders.splice(idx, 1);
                renderSliders('leftSliderList', leftSliders);
            } else if (containerId === 'middleSliderList') {
                middleSliders.splice(idx, 1);
                renderSliders('middleSliderList', middleSliders);
            }
        });
    });
}

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    tableRows.forEach((text, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${text}</td>
            <td class="check-cell"><span class="custom-check state-0" data-row="${index}" data-col="0"></span></td>
            <td class="check-cell"><span class="custom-check state-0" data-row="${index}" data-col="1"></span></td>
            <td><button class="del-row-btn" data-index="${index}">✕</button></td>
        `;
        tbody.appendChild(tr);
    });
    // 绑定复选框点击（三态循环）
    tbody.querySelectorAll('.custom-check').forEach(el => {
        el.addEventListener('click', function() {
            let state = parseInt(this.dataset.state) || 0;
            state = (state + 1) % 3; // 0→1→2→0
            this.dataset.state = state;
            this.className = `custom-check state-${state}`;
        });
    });
    // 绑定删除行
    tbody.querySelectorAll('.del-row-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            tableRows.splice(idx, 1);
            renderTable();
        });
    });
}

// ========== 初始化渲染 ==========
renderSliders('leftSliderList', leftSliders);
renderSliders('middleSliderList', middleSliders);
renderTable();

// ========== 头像上传 ==========
const avatarWrap = document.getElementById('avatarWrap');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');

avatarWrap.addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') {
        avatarInput.click();
    }
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
    };
    reader.readAsDataURL(file);
});

// ========== 添加滑块（模态框） ==========
const sliderModal = document.getElementById('sliderModal');
const modalSliderLabel = document.getElementById('modalSliderLabel');
const modalSliderLeft = document.getElementById('modalSliderLeft');
const modalSliderRight = document.getElementById('modalSliderRight');
let currentTarget = 'left'; // 默认

// 打开模态框（由按钮触发）
document.querySelectorAll('.btn-add[data-target]').forEach(btn => {
    btn.addEventListener('click', function() {
        currentTarget = this.dataset.target;
        sliderModal.classList.add('active');
        modalSliderLabel.value = '';
        modalSliderLeft.value = '';
        modalSliderRight.value = '';
    });
});
// 取消
document.getElementById('modalSliderCancel').addEventListener('click', function() {
    sliderModal.classList.remove('active');
});
// 确认
document.getElementById('modalSliderConfirm').addEventListener('click', function() {
    const label = modalSliderLabel.value.trim();
    const left = modalSliderLeft.value.trim();
    const right = modalSliderRight.value.trim();
    if (!label || !left || !right) {
        alert('请完整填写标签、左端和右端文字');
        return;
    }
    const newItem = { label, left, right };
    if (currentTarget === 'left') {
        leftSliders.push(newItem);
        renderSliders('leftSliderList', leftSliders);
    } else if (currentTarget === 'middle') {
        middleSliders.push(newItem);
        renderSliders('middleSliderList', middleSliders);
    }
    sliderModal.classList.remove('active');
});
// 点击外部关闭
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
    tableRows.push(text);
    renderTable();
    tableModal.classList.remove('active');
});
tableModal.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
});