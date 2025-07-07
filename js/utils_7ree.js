/**
 * 通用工具函数
 */

/**
 * 显示一个短暂的通知
 * @param {string} message 通知消息
 * @param {string} type 通知类型 ('success' 或 'error')
 */
window.showNotification_7ree = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `toolbar_notification_7ree ${type}`;
    
    const iconSpan = document.createElement('span');
    iconSpan.textContent = '📢 ';
    iconSpan.style.marginRight = '5px'; // 添加一些间距

    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    notification.appendChild(iconSpan);
    notification.appendChild(textSpan);

    document.body.appendChild(notification);

    // 2秒后自动消失
    setTimeout(() => {
        notification.remove();
    }, 2000);
};

console.log("utils_7ree.js loaded and showNotification_7ree defined"); 