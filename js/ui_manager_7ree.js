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
        
        // 异步设置标签名称和网址
        chrome.storage.local.get([
            'sidebar_noter_exchange_url', 
            'sidebar_noter_clipboard_url',
            'sidebar_noter_tab1_name',
            'sidebar_noter_tab2_name'
        ], (result) => {
            // 设置默认标签名称
            const tab1Name = document.getElementById('tab1-name');
            const tab2Name = document.getElementById('tab2-name');
            
            if (result.sidebar_noter_tab1_name && tab1Name) {
                tab1Name.value = result.sidebar_noter_tab1_name;
            }
            
            if (result.sidebar_noter_tab2_name && tab2Name) {
                tab2Name.value = result.sidebar_noter_tab2_name;
            }
            
            // 设置网址
            if (result.sidebar_noter_exchange_url) {
                exchangeUrl.value = result.sidebar_noter_exchange_url;
            }
            
            const clipboardUrl = document.getElementById('clipboard-url');
            if (result.sidebar_noter_clipboard_url && clipboardUrl) {
                clipboardUrl.value = result.sidebar_noter_clipboard_url;
            }
            
            // 更新标签显示名称
            this.updateTabNames(result.sidebar_noter_tab1_name, result.sidebar_noter_tab2_name);
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
            
            // 获取新的标签名称
            const tab1Name = document.getElementById('tab1-name');
            const tab2Name = document.getElementById('tab2-name');
            const newTab1Name = tab1Name ? tab1Name.value.trim() : '文本中转站';
            const newTab2Name = tab2Name ? tab2Name.value.trim() : '云剪贴板';
            
            // 保存标签名称
            this.updateTabNames(newTab1Name, newTab2Name);
            
            // 保存中转站网址（现在是标签一网址）
            const newExchangeUrl = exchangeUrl.value.trim();
            if (window.tabsManager) {
                window.tabsManager.setExchangeUrl(newExchangeUrl);
            }
            
            // 保存云剪贴板网址（现在是标签二网址）
            const clipboardUrl = document.getElementById('clipboard-url');
            const newClipboardUrl = clipboardUrl ? clipboardUrl.value.trim() : '';
            if (window.tabsManager) {
                window.tabsManager.setClipboardUrl(newClipboardUrl);
            }
            
            // 保存主题设置
            const theme = themeSwitch.checked ? 'dark' : 'light';
            chrome.storage.local.set({ 
                'sidebar_noter_theme': theme,
                'sidebar_noter_auto_save_interval': newInterval,
                'sidebar_noter_exchange_url': newExchangeUrl,
                'sidebar_noter_clipboard_url': newClipboardUrl,
                'sidebar_noter_tab1_name': newTab1Name,
                'sidebar_noter_tab2_name': newTab2Name
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
    
    // 更新标签显示名称
    updateTabNames(tab1Name, tab2Name) {
        // 更新标签栏显示名称
        const exchangeTab = document.querySelector('[data-tab="exchange"]');
        const clipboardTab = document.querySelector('[data-tab="clipboard"]');
        
        if (exchangeTab) {
            exchangeTab.textContent = tab1Name || '文本中转站';
        }
        
        if (clipboardTab) {
            clipboardTab.textContent = tab2Name || '云剪贴板';
        }
    }
}

// 标签栏管理类
class TabsManager_7ree {
    constructor() {
        this.currentTab = 'noter';
        this.exchangeUrl = '';
        this.clipboardUrl = '';
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
        console.log('switchTab called with:', tabName);
        
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
        } else if (tabName === 'clipboard') {
            this.showClipboardTab();
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
        
        // 隐藏云剪贴板iframe
        const clipboardFrame = document.getElementById('clipboard-frame');
        if (clipboardFrame) {
            clipboardFrame.style.display = 'none';
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
        
        // 隐藏云剪贴板iframe
        const clipboardFrame = document.getElementById('clipboard-frame');
        if (clipboardFrame) {
            clipboardFrame.style.display = 'none';
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

    showClipboardTab() {
        console.log('showClipboardTab called, clipboardUrl:', this.clipboardUrl);
        
        // 隐藏编辑器
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.display = 'none';
        }
        
        // 隐藏中转站iframe
        const exchangeFrame = document.getElementById('exchange-frame');
        if (exchangeFrame) {
            exchangeFrame.style.display = 'none';
        }
        
        // 隐藏状态栏
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'none';
        }
        
        // 显示或创建云剪贴板iframe
        let clipboardFrame = document.getElementById('clipboard-frame');
        if (!clipboardFrame) {
            console.log('Creating new clipboard iframe with URL:', this.clipboardUrl);
            clipboardFrame = document.createElement('iframe');
            clipboardFrame.id = 'clipboard-frame';
            clipboardFrame.src = this.clipboardUrl || 'about:blank';
            document.body.appendChild(clipboardFrame);
        } else {
            console.log('Updating existing clipboard iframe with URL:', this.clipboardUrl);
            clipboardFrame.src = this.clipboardUrl || 'about:blank';
        }
        clipboardFrame.style.display = 'block';
        
        // 如果没有设置URL，显示提示
        if (!this.clipboardUrl) {
            console.log('No clipboard URL set, showing placeholder');
            clipboardFrame.src = 'data:text/html,<html><body style="font-family:Arial;padding:20px;text-align:center;"><h3>请先在设置中配置云剪贴板网址</h3><p>点击右下角设置按钮进行配置</p></body></html>';
        }
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
    
    // 设置云剪贴板网址
    setClipboardUrl(url) {
        this.clipboardUrl = url;
        // 如果当前在clipboard标签，更新iframe
        if (this.currentTab === 'clipboard') {
            const clipboardFrame = document.getElementById('clipboard-frame');
            if (clipboardFrame) {
                clipboardFrame.src = url;
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
