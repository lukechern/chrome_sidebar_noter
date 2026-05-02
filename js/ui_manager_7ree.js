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

        // 设置当前值
        const isDarkTheme = document.body.classList.contains('theme-dark');
        if (themeSwitch) {
            themeSwitch.checked = isDarkTheme;
        }

        // 异步设置标签名称和网址
        chrome.storage.local.get([
            'sidebar_noter_exchange_url',
            'sidebar_noter_clipboard_url',
            'sidebar_noter_tab1_name',
            'sidebar_noter_tab2_name'
        ], (result) => {
            console.log('Loading settings from storage:', result);

            // 设置默认标签名称
            const tab1Name = document.getElementById('tab1-name');
            const tab2Name = document.getElementById('tab2-name');
            const exchangeUrl = document.getElementById('exchange-url');
            const clipboardUrl = document.getElementById('clipboard-url');

            // 设置标签名称，如果没有保存的值则使用默认值
            if (tab1Name) {
                tab1Name.value = result.sidebar_noter_tab1_name || '文本中转站';
            }

            if (tab2Name) {
                tab2Name.value = result.sidebar_noter_tab2_name || '云剪贴板';
            }

            // 设置网址，确保即使是空字符串也要显示
            if (exchangeUrl) {
                exchangeUrl.value = result.sidebar_noter_exchange_url || '';
                console.log('Set exchange URL input to:', exchangeUrl.value);
            }

            if (clipboardUrl) {
                clipboardUrl.value = result.sidebar_noter_clipboard_url || '';
                console.log('Set clipboard URL input to:', clipboardUrl.value);
            }

            // 更新标签显示名称
            this.updateTabNames(result.sidebar_noter_tab1_name, result.sidebar_noter_tab2_name);
        });

        if (dialog) {
            dialog.style.display = 'flex';
        }

        // 主题切换实时预览
        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.body.classList.remove('theme-light');
                    document.body.classList.add('theme-dark');
                } else {
                    document.body.classList.remove('theme-dark');
                    document.body.classList.add('theme-light');
                }
            });
        }

        // 保存设置
        const saveButton = document.getElementById('save-settings');
        const cancelButton = document.getElementById('cancel-settings');

        const saveSettings = () => {
            // 获取新的标签名称
            const tab1Name = document.getElementById('tab1-name');
            const tab2Name = document.getElementById('tab2-name');
            const exchangeUrlInput = document.getElementById('exchange-url');
            const clipboardUrlInput = document.getElementById('clipboard-url');

            const newTab1Name = tab1Name ? tab1Name.value.trim() : '文本中转站';
            const newTab2Name = tab2Name ? tab2Name.value.trim() : '云剪贴板';
            const newExchangeUrl = exchangeUrlInput ? exchangeUrlInput.value.trim() : '';
            const newClipboardUrl = clipboardUrlInput ? clipboardUrlInput.value.trim() : '';

            console.log('Saving settings:', {
                tab1Name: newTab1Name,
                tab2Name: newTab2Name,
                exchangeUrl: newExchangeUrl,
                clipboardUrl: newClipboardUrl
            });

            // 保存标签名称
            this.updateTabNames(newTab1Name, newTab2Name);

            // 更新TabsManager中的网址
            if (window.tabsManager) {
                window.tabsManager.setExchangeUrl(newExchangeUrl);
                window.tabsManager.setClipboardUrl(newClipboardUrl);
            }

            // 保存主题设置
            const theme = themeSwitch && themeSwitch.checked ? 'dark' : 'light';

            // 保存到chrome存储
            chrome.storage.local.set({
                'sidebar_noter_theme': theme,
                'sidebar_noter_exchange_url': newExchangeUrl,
                'sidebar_noter_clipboard_url': newClipboardUrl,
                'sidebar_noter_tab1_name': newTab1Name,
                'sidebar_noter_tab2_name': newTab2Name
            }, () => {
                console.log('Settings saved to storage successfully');
                showNotification_7ree(langJS_7ree.pl_settings_saved_7r);
                if (dialog) {
                    dialog.style.display = 'none';
                }
            });
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
            if (dialog) {
                dialog.style.display = 'none';
            }
        };

        if (saveButton) {
            saveButton.onclick = saveSettings;
        }
        if (cancelButton) {
            cancelButton.onclick = cancelSettings;
        }

        // 点击背景关闭对话框
        if (dialog) {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    cancelSettings();
                }
            });
        }

        // 清空缓存按钮事件处理
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearUrlCache();
            });
        }


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



    // 清空网址缓存
    clearUrlCache() {
        // 显示自定义确认对话框
        const confirmDialog = document.getElementById('confirm-dialog');
        if (confirmDialog) {
            confirmDialog.style.display = 'flex';

            // 获取确认和取消按钮
            const confirmYes = document.getElementById('confirm-yes');
            const confirmNo = document.getElementById('confirm-no');

            // 确认按钮事件
            const handleConfirm = () => {
                // 清空标签一和标签二的网址缓存
                chrome.storage.local.remove(['sidebar_noter_exchange_url', 'sidebar_noter_clipboard_url'], () => {
                    console.log('URL cache cleared from storage');

                    // 重置输入框
                    const exchangeUrl = document.getElementById('exchange-url');
                    const clipboardUrl = document.getElementById('clipboard-url');

                    if (exchangeUrl) {
                        exchangeUrl.value = '';
                    }

                    if (clipboardUrl) {
                        clipboardUrl.value = '';
                    }

                    // 更新TabsManager中的网址
                    if (window.tabsManager) {
                        window.tabsManager.setExchangeUrl('');
                        window.tabsManager.setClipboardUrl('');
                    }

                    // 通知用户
                    showNotification_7ree('网址缓存已清空');
                });

                // 隐藏确认对话框
                confirmDialog.style.display = 'none';

                // 移除事件监听器
                confirmYes.removeEventListener('click', handleConfirm);
                confirmNo.removeEventListener('click', handleCancel);
            };

            // 取消按钮事件
            const handleCancel = () => {
                // 隐藏确认对话框
                confirmDialog.style.display = 'none';

                // 移除事件监听器
                confirmYes.removeEventListener('click', handleConfirm);
                confirmNo.removeEventListener('click', handleCancel);
            };

            // 添加事件监听器
            confirmYes.addEventListener('click', handleConfirm);
            confirmNo.addEventListener('click', handleCancel);

            // 点击背景关闭对话框
            confirmDialog.addEventListener('click', (e) => {
                if (e.target === confirmDialog) {
                    handleCancel();
                }
            });
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
        this.loadStoredUrls(); // 初始化时加载存储的网址
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

        // 显示状态栏，并恢复保存时间和保存图标的显示
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'flex';
            // 显示保存时间和保存图标
            const lastSaveTime = document.getElementById('last-save-time');
            const saveIcon = document.getElementById('save-icon');
            if (lastSaveTime) lastSaveTime.style.display = 'block';
            if (saveIcon) saveIcon.style.display = 'block';
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

        // 显示状态栏，但只显示齿轮图标
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'flex';
            // 隐藏保存时间和保存图标
            const lastSaveTime = document.getElementById('last-save-time');
            const saveIcon = document.getElementById('save-icon');
            if (lastSaveTime) lastSaveTime.style.display = 'none';
            if (saveIcon) saveIcon.style.display = 'none';
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

        // 显示状态栏，但只显示齿轮图标
        const statusbar = document.querySelector('.statusbar_7ree');
        if (statusbar) {
            statusbar.style.display = 'flex';
            // 隐藏保存时间和保存图标
            const lastSaveTime = document.getElementById('last-save-time');
            const saveIcon = document.getElementById('save-icon');
            if (lastSaveTime) lastSaveTime.style.display = 'none';
            if (saveIcon) saveIcon.style.display = 'none';
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

    // 从存储中加载网址
    loadStoredUrls() {
        chrome.storage.local.get([
            'sidebar_noter_exchange_url',
            'sidebar_noter_clipboard_url'
        ], (result) => {
            console.log('TabsManager loading stored URLs:', result);
            this.exchangeUrl = result.sidebar_noter_exchange_url || '';
            this.clipboardUrl = result.sidebar_noter_clipboard_url || '';
            console.log('TabsManager URLs loaded - exchange:', this.exchangeUrl, 'clipboard:', this.clipboardUrl);
        });
    }

    // 设置中转站网址
    setExchangeUrl(url) {
        console.log('Setting exchange URL to:', url);
        this.exchangeUrl = url || '';
        // 如果当前在exchange标签，更新iframe
        if (this.currentTab === 'exchange') {
            const exchangeFrame = document.getElementById('exchange-frame');
            if (exchangeFrame) {
                exchangeFrame.src = this.exchangeUrl || 'about:blank';
            }
        }
    }

    // 设置云剪贴板网址
    setClipboardUrl(url) {
        console.log('Setting clipboard URL to:', url);
        this.clipboardUrl = url || '';
        // 如果当前在clipboard标签，更新iframe
        if (this.currentTab === 'clipboard') {
            const clipboardFrame = document.getElementById('clipboard-frame');
            if (clipboardFrame) {
                clipboardFrame.src = this.clipboardUrl || 'about:blank';
            }
        }
    }

    // 为iframe添加设置齿轮图标
    addSettingsIconToFrame(frame) {
        // 移除之前可能添加的设置图标
        const existingIcon = document.getElementById('frame-settings-icon');
        if (existingIcon) {
            existingIcon.remove();
        }

        // 创建设置齿轮图标
        const settingsIcon = document.createElement('div');
        settingsIcon.id = 'frame-settings-icon';
        settingsIcon.className = 'frame_settings_icon_7ree';
        settingsIcon.title = '设置';
        settingsIcon.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
        `;

        // 添加点击事件
        settingsIcon.addEventListener('click', () => {
            if (window.statusbarManager_7ree && typeof window.statusbarManager_7ree.showSettings === 'function') {
                window.statusbarManager_7ree.showSettings();
            }
        });

        // 将图标添加到body中
        document.body.appendChild(settingsIcon);
    }
}

// 在DOMContentLoaded事件中初始化UI管理器
document.addEventListener('DOMContentLoaded', () => {
    // 确保 window.storageManager_7ree 已加载
    if (typeof window.storageManager_7ree !== 'undefined') {
        window.statusbarManager_7ree = new StatusbarManager_7ree(window.storageManager_7ree);
        window.tabsManager_7ree = new TabsManager_7ree();
    } else {
        console.error("window.storageManager_7ree is not defined. Cannot initialize UI Managers.");
    }
});
