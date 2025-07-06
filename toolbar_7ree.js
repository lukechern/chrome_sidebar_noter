/**
语言包定义

    'pl_statusbar_last_save_7r' => '上次保存',
    'pl_statusbar_never_saved_7r' => '从未保存',
    'pl_statusbar_manual_save_7r' => '手动保存',
    'pl_statusbar_settings_7r' => '设置',
    'pl_settings_theme_7r' => '主题风格',
    'pl_settings_theme_light_7r' => '明亮',
    'pl_settings_theme_dark_7r' => '暗黑',
    'pl_settings_auto_save_interval_7r' => '自动保存时间',
    'pl_settings_save_7r' => '保存设置',
    'pl_settings_cancel_7r' => '取消',
    'pl_manual_save_success_7r' => '手动保存成功',
    'pl_settings_saved_7r' => '设置已保存',
**/

// 状态栏管理类
class StatusbarManager_7ree {
    constructor() {
        this.statusbar = null;
        this.lastSaveTimeElement = null;
        this.createStatusbar();
    }

    // 创建状态栏
    createStatusbar() {
        // 创建状态栏容器
        this.statusbar = document.createElement('div');
        this.statusbar.id = 'statusbar_7ree';
        this.statusbar.className = 'statusbar_7ree';
        
        // 创建左侧区域（时间显示）
        const leftSection = document.createElement('div');
        leftSection.className = 'statusbar_left_7ree';
        
        this.lastSaveTimeElement = document.createElement('span');
        this.lastSaveTimeElement.id = 'last_save_time_7ree';
        this.lastSaveTimeElement.textContent = langJS_7ree.pl_statusbar_never_saved_7r;
        
        leftSection.appendChild(this.lastSaveTimeElement);
        
        // 创建右侧区域（图标）
        const rightSection = document.createElement('div');
        rightSection.className = 'statusbar_right_7ree';
        
        // 保存图标
        const saveIcon = this.createIcon('save', this.getSaveIconSVG(), () => {
            this.handleManualSave();
        });
        
        // 设置图标
        const settingsIcon = this.createIcon('settings', this.getSettingsIconSVG(), () => {
            this.showSettingsDialog();
        });
        
        rightSection.appendChild(saveIcon);
        rightSection.appendChild(settingsIcon);
        
        // 组装状态栏
        this.statusbar.appendChild(leftSection);
        this.statusbar.appendChild(rightSection);
        
        // 插入到页面
        document.body.appendChild(this.statusbar);
        
        // 初始化时间显示
        this.updateLastSaveTime(storageManager_7ree.getLastSaveTime());
    }

    // 创建图标
    createIcon(id, svgContent, onClick) {
        const icon = document.createElement('div');
        icon.id = `statusbar_${id}_7ree`;
        icon.className = 'statusbar_icon_7ree';
        icon.innerHTML = svgContent;
        icon.title = id === 'save' ? langJS_7ree.pl_statusbar_manual_save_7r : langJS_7ree.pl_statusbar_settings_7r;
        icon.addEventListener('click', onClick);
        return icon;
    }

    // 获取保存图标SVG
    getSaveIconSVG() {
        return `<svg viewBox="0 0 24 24">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>`;
    }

    // 获取设置图标SVG
    getSettingsIconSVG() {
        return `<svg viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>`;
    }

    // 更新上次保存时间
    updateLastSaveTime(lastSaveTime) {
        if (this.lastSaveTimeElement) {
            if (lastSaveTime) {
                const timeString = lastSaveTime.toLocaleTimeString();
                this.lastSaveTimeElement.textContent = `${langJS_7ree.pl_statusbar_last_save_7r}: ${timeString}`;
            } else {
                this.lastSaveTimeElement.textContent = langJS_7ree.pl_statusbar_never_saved_7r;
            }
        }
    }

    // 处理手动保存
    handleManualSave() {
        if (window.editor && typeof window.editor.getModel === 'function') {
            storageManager_7ree.manualSave(window.editor);
            this.showNotification(langJS_7ree.pl_manual_save_success_7r);
        }
    }

    // 显示设置对话框
    showSettingsDialog() {
        const settings = storageManager_7ree.getSettings();
        
        const dialog = document.createElement('div');
        dialog.className = 'settings_dialog_7ree';
        dialog.innerHTML = `
            <div class="settings_content_7ree">
                <h3>${langJS_7ree.pl_settings_title_7r}</h3>
                <div class="settings_item_7ree">
                    <div class="theme_label_container_7ree">
                        <span class="theme_text_7ree">${langJS_7ree.pl_settings_theme_light_7r}</span>
                        <label class="theme_switch_7ree">
                            <input type="checkbox" id="theme_switch_7ree" ${settings.theme === 'dark' ? 'checked' : ''}>
                            <span class="theme_slider_7ree"></span>
                        </label>
                        <span class="theme_text_7ree">${langJS_7ree.pl_settings_theme_dark_7r}</span>
                    </div>
                </div>
                <div class="settings_item_7ree">
                    <label>${langJS_7ree.pl_settings_auto_save_interval_7r}:</label>
                    <select id="interval_select_7ree">
                        <option value="3000" ${settings.autoSaveInterval === 3000 ? 'selected' : ''}>3秒</option>
                        <option value="10000" ${settings.autoSaveInterval === 10000 ? 'selected' : ''}>10秒</option>
                        <option value="15000" ${settings.autoSaveInterval === 15000 ? 'selected' : ''}>15秒</option>
                        <option value="30000" ${settings.autoSaveInterval === 30000 ? 'selected' : ''}>30秒</option>
                        <option value="60000" ${settings.autoSaveInterval === 60000 ? 'selected' : ''}>60秒</option>
                    </select>
                </div>
                <div class="settings_buttons_7ree">
                    <button id="save_settings_7ree">${langJS_7ree.pl_settings_save_7r}</button>
                    <button id="cancel_settings_7ree">${langJS_7ree.pl_settings_cancel_7r}</button>
                </div>
            </div>
        `;
        
        // 添加样式
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const content = dialog.querySelector('.settings_content_7ree');
        content.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            min-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        // 添加主题切换实时预览
        const themeSwitch = dialog.querySelector('#theme_switch_7ree');
        
        themeSwitch.addEventListener('change', () => {
            const isDark = themeSwitch.checked;
            
            // 实时预览主题
            if (isDark) {
                document.body.classList.add('theme-dark');
                document.body.classList.remove('theme-light');
            } else {
                document.body.classList.add('theme-light');
                document.body.classList.remove('theme-dark');
            }
        });
        
        // 添加事件监听
        dialog.querySelector('#save_settings_7ree').addEventListener('click', () => {
            const theme = themeSwitch.checked ? 'dark' : 'light';
            const interval = parseInt(dialog.querySelector('#interval_select_7ree').value);
            
            storageManager_7ree.setTheme(theme);
            storageManager_7ree.setAutoSaveInterval(interval);
            this.showNotification(langJS_7ree.pl_settings_saved_7r);
            document.body.removeChild(dialog);
        });
        
        dialog.querySelector('#cancel_settings_7ree').addEventListener('click', () => {
            // 恢复原始主题
            storageManager_7ree.applyTheme(settings.theme);
            document.body.removeChild(dialog);
        });
        
        // 点击背景关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                // 恢复原始主题
                storageManager_7ree.applyTheme(settings.theme);
                document.body.removeChild(dialog);
            }
        });
        
        document.body.appendChild(dialog);
    }

    // 显示通知
    showNotification(message, type = 'success') {
        // 确保消息不为空
        if (!message || message.trim() === '') {
            message = type === 'success' ? '操作成功' : '操作失败';
        }
        
        const notification = document.createElement('div');
        notification.className = `toolbar_notification_7ree ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 2秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
}

// 创建全局状态栏管理器实例
window.statusbarManager_7ree = new StatusbarManager_7ree(); 