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