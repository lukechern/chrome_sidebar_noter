/**
 * UI 管理器类
 */

// 状态栏管理类
class StatusbarManager_7ree {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.init();
    }

    init() {
        // 保存按钮点击事件
        const saveIcon = document.getElementById('save-icon');
        if (saveIcon) {
            saveIcon.addEventListener('click', () => {
                this.handleManualSave();
            });
        }

        // 设置按钮点击事件
        const settingsIcon = document.getElementById('settings-icon');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleManualSave();
            }
        });
    }

    // 处理手动保存
    handleManualSave() {
        if (window.currentEditor) {
            const content = window.currentEditor.getValue();
            const scrollPosition = window.currentEditor.getScrollPosition ? window.currentEditor.getScrollPosition() : { scrollTop: 0, scrollLeft: 0 };
            const selection = window.currentEditor.getSelection();
            
            this.storageManager.saveContent(content, scrollPosition, selection).then((success) => {
                if (success) {
                    showNotification_7ree(langJS_7ree.pl_manual_save_success_7r);
                }
            });
        }
    }

    // 显示设置对话框
    showSettings() {
        const dialog = document.getElementById('settings-dialog');
        const themeSwitch = document.getElementById('theme-switch');
        const autoSaveSlider = document.getElementById('auto-save-slider');
        const sliderValue = document.getElementById('slider-value');
        const exchangeUrl = document.getElementById('exchange-url');
        
        // 设置当前值
        const isDarkTheme = document.body.classList.contains('theme-dark');
        themeSwitch.checked = isDarkTheme;
        
        const currentInterval = Math.round(this.storageManager.autoSaveInterval / 1000);
        autoSaveSlider.value = currentInterval;
        sliderValue.textContent = currentInterval + '秒';
        
        // 异步设置中转站网址
        chrome.storage.local.get('sidebar_noter_exchange_url', (result) => {
            if (result.sidebar_noter_exchange_url) {
                exchangeUrl.value = result.sidebar_noter_exchange_url;
            }
        });
        
        dialog.style.display = 'flex';
        
        // 主题切换实时预览
        themeSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('theme-light');
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
                document.body.classList.add('theme-light');
            }
        });
        
        // 滑块值变化监听
        autoSaveSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            sliderValue.textContent = value + '秒';
        });
        
        // 保存设置
        const saveButton = document.getElementById('save-settings');
        const cancelButton = document.getElementById('cancel-settings');
        
        const saveSettings = () => {
            const newInterval = parseInt(autoSaveSlider.value);
            this.storageManager.setAutoSaveInterval(newInterval);
            
            // 保存中转站网址
            const newExchangeUrl = exchangeUrl.value.trim();
            if (window.tabsManager) {
                window.tabsManager.setExchangeUrl(newExchangeUrl);
            }
            
            // 保存主题设置
            const theme = themeSwitch.checked ? 'dark' : 'light';
            chrome.storage.local.set({ 
                'sidebar_noter_theme': theme,
                'sidebar_noter_auto_save_interval': newInterval,
                'sidebar_noter_exchange_url': newExchangeUrl
            });
            
            showNotification_7ree(langJS_7ree.pl_settings_saved_7r);
            dialog.style.display = 'none';
        };
        
        const cancelSettings = () => {
            // 恢复原来的主题
            if (isDarkTheme) {
                document.body.classList.remove('theme-light');
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
                document.body.classList.add('theme-light');
            }
            dialog.style.display = 'none';
        };
        
        saveButton.onclick = saveSettings;
        cancelButton.onclick = cancelSettings;
        
        // 点击背景关闭对话框
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                cancelSettings();
            }
        });
    }
}

// 标签栏管理类
class TabsManager_7ree {
    constructor() {
        this.currentTab = 'noter';
        this.exchangeUrl = '';
        this.init();
    }

    init() {
        const tabItems = document.querySelectorAll('.tab_item_7ree');
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // 更新标签状态
        const tabItems = document.querySelectorAll('.tab_item_7ree');
        tabItems.forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // 处理标签切换逻辑
        if (tabName === 'noter') {
            this.showNoterTab();
        } else if (tabName === 'exchange') {
            this.showExchangeTab();
        }
    }

    showNoterTab() {
        // 显示编辑器
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.display = 'block';
        }
        
        // 隐藏中转站iframe
        const exchangeFrame = document.getElementById('exchange-frame');
        if (exchangeFrame) {
            exchangeFrame.style.display = 'none';
        }
        
        // 显示状态栏
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'flex';
        }
    }

    showExchangeTab() {
        // 隐藏编辑器
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.display = 'none';
        }
        
        // 隐藏状态栏
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'none';
        }
        
        // 显示或创建中转站iframe
        let exchangeFrame = document.getElementById('exchange-frame');
        if (!exchangeFrame) {
            exchangeFrame = document.createElement('iframe');
            exchangeFrame.id = 'exchange-frame';
            exchangeFrame.src = this.exchangeUrl;
            document.body.appendChild(exchangeFrame);
        } else {
            exchangeFrame.src = this.exchangeUrl;
        }
        exchangeFrame.style.display = 'block';
    }
    
    // 设置中转站网址
    setExchangeUrl(url) {
        this.exchangeUrl = url;
        // 如果当前在exchange标签，更新iframe
        if (this.currentTab === 'exchange') {
            const exchangeFrame = document.getElementById('exchange-frame');
            if (exchangeFrame) {
                exchangeFrame.src = url;
            }
        }
    }
}

// 在DOMContentLoaded事件中初始化UI管理器
document.addEventListener('DOMContentLoaded', () => {
    // 确保 storageManager_7ree 已加载
    if (typeof storageManager_7ree !== 'undefined') {
        window.statusbarManager_7ree = new StatusbarManager_7ree(storageManager_7ree);
        window.tabsManager_7ree = new TabsManager_7ree();
    } else {
        console.error("storageManager_7ree is not defined. Cannot initialize UI Managers.");
    }
}); 