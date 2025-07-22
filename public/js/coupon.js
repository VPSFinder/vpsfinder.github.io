// 复制文本到剪贴板的函数
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // 现代浏览器的clipboard API
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // 旧版浏览器的fallback方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (err) {
        console.error('复制失败:', err);
        return false;
    }
}
// 显示Toast通知
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    
    // 清除之前的动画和内容
    toast.classList.remove('show', 'hide');
    toast.textContent = message;
    
    // 强制重绘，确保动画能重新开始
    void toast.offsetWidth;
    
    // 显示Toast
    toast.classList.add('show');
    
    // 设置隐藏延迟
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        // 完全隐藏后移除hide类
        setTimeout(() => {
            toast.classList.remove('hide');
        }, 300); // 与CSS过渡时间一致
    }, duration);
}
// 主要功能：复制优惠码并跳转
async function copyAndRedirect(button) {
    const card = button.closest('.coupon-card');
    const code = card.dataset.code;
    const url = card.dataset.url;
    
    // 防止重复点击
    if (button.disabled) return;
    button.disabled = true;
    
    // 复制优惠码
    const copySuccess = await copyToClipboard(code);
    
    if (copySuccess) {
        // 更新按钮状态
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.classList.add('copied');
        
        // 显示成功提示
        showToast(`优惠码 ${code} 已复制到剪贴板`);
        
        // 延迟跳转，让用户看到反馈
        setTimeout(() => {
            // 在新标签页打开链接
            window.open(url, '_blank');
            
            // 恢复按钮状态
            button.textContent = originalText;
            button.classList.remove('copied');
            button.disabled = false;
        }, 1000);
    } else {
        // 复制失败时的处理
        showToast('复制失败，请手动复制优惠码');
        button.disabled = false;
    }
}
// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('优惠码系统已加载');
});