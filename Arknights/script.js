function openModal(imgSrc) {
    const modal = document.getElementById('modal');
    const fullImg = document.getElementById('full-img');
    
    if (modal && fullImg) {
        fullImg.src = imgSrc;
        modal.style.display = 'flex'; // 显示弹窗
        document.body.style.overflow = 'hidden'; // 禁用背景滚动
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none'; // 隐藏弹窗
        document.body.style.overflow = 'auto'; // 恢复滚动
    }
}

// 监听 Esc 键关闭
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- 背景轮换配置 ---
// 因为是静态网页，无法自动读取文件夹，请在这里列出每个文件夹下的图片文件名
const imgLists = {
    '终末地': ['1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp', '7.webp', '8.webp', '9.webp', '10.webp'], 
    '明日方舟': ['ak1.webp', '不义之财_鸣铳.webp'],
    '其他游戏': ['dd2.webp', 'hh.webp']
};

const libs = Object.keys(imgLists);
let currentLibIndex = 0;
// 记录每个图库当前播到第几张，用于顺序轮换
let libProgress = { '终末地': 0, '明日方舟': 0, '其他游戏': 0 };

let timeLeft = 5;
let timer = null;
let isPaused = false;
let isRandomMode = false; // 默认顺序轮换

window.onload = function() {
    updateModeDisplay();
    startRotation();
};

function startRotation() {
    if (timer) clearInterval(timer);
    timeLeft = 5;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            if (timeLeft <= 0) {
                changeBackground();
                timeLeft = 5;
            }
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer-sec').innerText = timeLeft;
}

// 核心换图逻辑
function changeBackground() {
    const bgOverlay = document.querySelector('.background-overlay');
    const currentLibName = libs[currentLibIndex];
    const list = imgLists[currentLibName];
    let imgFileName = "";

    if (isRandomMode) {
        // 随机模式
        imgFileName = list[Math.floor(Math.random() * list.length)];
    } else {
        // 顺序模式
        let idx = libProgress[currentLibName];
        imgFileName = list[idx];
        // 更新进度供下一次使用
        libProgress[currentLibName] = (idx + 1) % list.length;
    }

    const imgPath = `Resources/${currentLibName}/${imgFileName}`;
    
    // 预加载并切换
    const tempImg = new Image();
    tempImg.src = imgPath;
    tempImg.onload = () => {
        bgOverlay.style.backgroundImage = `url('${imgPath}')`;
        updateModeDisplay(); // 换图后更新 (x/n) 的显示
    };
}

// 切换轮换模式
function toggleMode() {
    isRandomMode = !isRandomMode;
    updateModeDisplay();
    // 切换模式后立刻换一张图并重启计时
    changeBackground();
    resetTimer();
}

function updateModeDisplay() {
    const modeBtn = document.getElementById('mode-text');
    const currentLibName = libs[currentLibIndex];
    const list = imgLists[currentLibName];
    
    if (isRandomMode) {
        modeBtn.innerText = "随机抽取";
    } else {
        // 获取当前图片在数组中的真实位置（显示为 1-based）
        // 因为 changeBackground 运行后进度已经 +1 了，所以这里取 (进度 || 总数)
        let currentIdx = libProgress[currentLibName];
        let displayIdx = currentIdx === 0 ? list.length : currentIdx;
        modeBtn.innerText = `顺序轮换 (${displayIdx}/${list.length})`;
    }
}

// 切换图库
function switchLibrary() {
    currentLibIndex = (currentLibIndex + 1) % libs.length;
    const currentLibName = libs[currentLibIndex];
    document.getElementById('lib-name').innerText = currentLibName;
    
    // 切换图库时，重置该图库的进度到第一张
    libProgress[currentLibName] = 0;
    
    changeBackground();
    resetTimer();
    if (isPaused) toggleRotation();
}

function resetTimer() {
    timeLeft = 5;
    updateTimerDisplay();
}

function toggleRotation() {
    isPaused = !isPaused;
    document.querySelector('#pause-btn .ctrl-cmd').innerText = isPaused ? "指令：恢复轮换" : "指令：暂停轮换";
}

// --- 右侧卡片隐藏与弹窗逻辑 (保持不变) ---
let isCardsVisible = true;
function toggleCardsVisibility() {
    const group = document.getElementById('target-cards-group');
    if (!group) {
        console.error("找不到 ID 为 target-cards-group 的元素！");
        return;
    }
    
    // 使用 classList.toggle 会自动判断：有这个类就删掉，没这个类就加上
    group.classList.toggle('cards-hidden');
    
    // 可选：控制按钮的样式，让用户知道现在是隐藏状态
    const hideBtn = document.querySelector('.hide-btn');
    if (group.classList.contains('cards-hidden')) {
        hideBtn.style.background = 'var(--endfield-teal)'; // 隐藏时按钮变色
    } else {
        hideBtn.style.background = ''; // 恢复
    }
}

function openModal(imgSrc) {
    const modal = document.getElementById('modal');
    const fullImg = document.getElementById('full-img');
    fullImg.src = imgSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}