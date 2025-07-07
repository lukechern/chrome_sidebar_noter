/**
语言包定义

    'pl_monaco_loading_error_7r' => 'Monaco编辑器加载错误',
    'pl_web_worker_fallback_7r' => 'Web Worker创建失败，回退到主线程',
    'pl_editor_creation_error_7r' => '编辑器创建错误',
    'pl_welcome_message_7r' => '欢迎使用侧边栏记事本！',
    'pl_start_typing_7r' => '您可以在这里开始输入笔记。',
    'pl_test_monaco_7r' => '测试Monaco编辑器配置',
    'pl_test_success_7r' => '测试成功',
    'pl_test_failed_7r' => '测试失败',
    'pl_simple_monaco_7r' => '简化Monaco加载器',
    'pl_monaco_ready_7r' => 'Monaco编辑器准备就绪',
    'pl_test_manifest_7r' => '测试Manifest配置',
    'pl_manifest_valid_7r' => 'Manifest配置有效',
    'pl_manifest_invalid_7r' => 'Manifest配置无效',
    'pl_basic_test_7r' => '基础功能测试',
    'pl_monaco_loaded_7r' => 'Monaco编辑器已加载',
    'pl_monaco_not_loaded_7r' => 'Monaco编辑器未加载',
    'pl_monaco_config_7r' => 'Monaco配置',
    'pl_worker_disabled_7r' => 'Web Worker已禁用',
    'pl_storage_save_7r' => '保存内容',
    'pl_storage_load_7r' => '加载内容',
    'pl_storage_error_7r' => '存储错误',
    'pl_auto_save_7r' => '自动保存',
    'pl_content_loaded_7r' => '内容已加载',
    'pl_state_restored_7r' => '状态已恢复',
    'pl_toolbar_save_7r' => '保存',
    'pl_toolbar_export_7r' => '导出',
    'pl_toolbar_saved_7r' => '已保存',
    'pl_toolbar_exported_7r' => '已导出',
    'pl_export_success_7r' => '导出成功',
    'pl_export_error_7r' => '导出失败',
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
    'pl_tab_noter_7r' => '浏览器记事',
    'pl_tab_exchange_7r' => '文本中转站',
**/

// 存储管理类
class StorageManager_7ree {
    constructor() {
        this.autoSaveInterval = 3000; // 默认3秒
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.isAutoSaving = false;
    }

    // 保存内容到本地存储
    async saveContent(content, scrollPosition = null, selection = null) {
        try {
            const data = {
                content: content,
                timestamp: Date.now(),
                scrollPosition: scrollPosition,
                selection: selection
            };
            
            await chrome.storage.local.set({ 'sidebar_noter_data': data });
            this.lastSaveTime = new Date();
            this.updateLastSaveTime();
            console.log(langJS_7ree.pl_storage_save_7r, data);
            return true;
        } catch (error) {
            console.error(langJS_7ree.pl_storage_error_7r, error);
            return false;
        }
    }

    // 从本地存储加载内容
    async loadContent() {
        try {
            const result = await chrome.storage.local.get('sidebar_noter_data');
            if (result.sidebar_noter_data) {
                console.log(langJS_7ree.pl_content_loaded_7r, result.sidebar_noter_data);
                return result.sidebar_noter_data;
            }
            return null;
        } catch (error) {
            console.error(langJS_7ree.pl_storage_error_7r, error);
            return null;
        }
    }

    // 清除存储的数据
    async clearData() {
        try {
            await chrome.storage.local.remove('sidebar_noter_data');
            this.lastSaveTime = null;
            this.updateLastSaveTime();
            console.log('数据已清除');
            return true;
        } catch (error) {
            console.error(langJS_7ree.pl_storage_error_7r, error);
            return false;
        }
    }

    // 开始自动保存
    startAutoSave(editor) {
        this.stopAutoSave();
        console.log('启动自动保存，间隔:', this.autoSaveInterval, 'ms');
        this.autoSaveTimer = setInterval(() => {
            if (editor && !this.isAutoSaving) {
                this.isAutoSaving = true;
                const content = editor.getValue();
                const scrollPosition = editor.getScrollPosition ? editor.getScrollPosition() : { scrollTop: 0, scrollLeft: 0 }; // 修复：使用正确的Monaco API
                const selection = editor.getSelection();
                
                console.log('执行自动保存...');
                this.saveContent(content, scrollPosition, selection).then(() => {
                    this.isAutoSaving = false;
                });
            }
        }, this.autoSaveInterval);
    }

    // 停止自动保存
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // 更新最后保存时间显示
    updateLastSaveTime() {
        const lastSaveElement = document.getElementById('last-save-time');
        if (lastSaveElement) {
            if (this.lastSaveTime) {
                const timeString = this.lastSaveTime.toLocaleTimeString();
                lastSaveElement.textContent = `${langJS_7ree.pl_statusbar_last_save_7r}: ${timeString}`;
            } else {
                lastSaveElement.textContent = langJS_7ree.pl_statusbar_never_saved_7r;
            }
        }
    }

    // 设置自动保存间隔
    setAutoSaveInterval(interval) {
        this.autoSaveInterval = interval * 1000;
        if (this.autoSaveTimer) {
            this.startAutoSave(window.currentEditor);
        }
    }
}

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
            const scrollPosition = window.currentEditor.getScrollPosition ? window.currentEditor.getScrollPosition() : { scrollTop: 0, scrollLeft: 0 }; // 修复：使用正确的Monaco API
            const selection = window.currentEditor.getSelection();
            
            this.storageManager.saveContent(content, scrollPosition, selection).then((success) => {
                if (success) {
                    this.showNotification(langJS_7ree.pl_manual_save_success_7r);
                }
            });
        }
    }

    // 显示通知
    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `toolbar_notification_7ree ${isError ? 'error' : ''}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
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
        
        // 设置中转站网址
        exchangeUrl.value = window.tabsManager ? window.tabsManager.exchangeUrl : '';
        
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
            
            this.showNotification(langJS_7ree.pl_settings_saved_7r);
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

// 主初始化函数
async function initSidebar_7ree() {
    try {
        // 初始化存储管理器
        const storageManager = new StorageManager_7ree();
        
        // 初始化状态栏管理器
        const statusbarManager = new StatusbarManager_7ree(storageManager);
        
        // 初始化标签栏管理器
        const tabsManager = new TabsManager_7ree();
        window.tabsManager = tabsManager; // 保存到全局变量以便设置对话框访问
        
        // 加载保存的主题设置
        const themeResult = await chrome.storage.local.get('sidebar_noter_theme');
        if (themeResult.sidebar_noter_theme === 'dark') {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        }
        
        // 加载保存的设置
        const settingsResult = await chrome.storage.local.get([
            'sidebar_noter_auto_save_interval',
            'sidebar_noter_exchange_url'
        ]);
        
        if (settingsResult.sidebar_noter_auto_save_interval) {
            storageManager.setAutoSaveInterval(settingsResult.sidebar_noter_auto_save_interval);
        }
        
        if (settingsResult.sidebar_noter_exchange_url) {
            tabsManager.setExchangeUrl(settingsResult.sidebar_noter_exchange_url);
        }
        
        // 配置Monaco Editor
        require.config({ paths: { 'vs': 'lib/monaco-editor-0.52.2/min/vs' } });
        
        require(['vs/editor/editor.main'], function() {
            // 禁用Web Worker
            self.MonacoEnvironment = {
                getWorkerUrl: function (moduleId, label) {
                    return null; // 禁用Web Worker
                }
            };
            
            // 创建编辑器
            const editor = monaco.editor.create(document.getElementById('editor-container'), {
                theme: 'vs',
                language: 'plaintext',
                lineNumbers: 'on',
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 14,
                lineHeight: 26,
                padding: { top: 5, bottom: 5 },
                scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible'
                }
            });
            
            window.currentEditor = editor;
            
            // 加载保存的内容
            storageManager.loadContent().then(data => {
                if (data && data.content) {
                    editor.setValue(data.content);
                    
                    // 恢复滚动位置
                    if (data.scrollPosition && editor.setScrollPosition) {
                        editor.setScrollPosition(data.scrollPosition); // 修复：使用正确的Monaco API
                    }
                    
                    // 恢复选择状态
                    if (data.selection) {
                        editor.setSelection(data.selection);
                    }
                    
                    console.log(langJS_7ree.pl_state_restored_7r);
                }
            });
            
            // 开始自动保存
            storageManager.startAutoSave(editor);
            console.log('自动保存已启动，间隔:', storageManager.autoSaveInterval, 'ms');
            
            // 监听内容变化
            editor.onDidChangeModelContent(() => {
                // 内容变化时的处理逻辑可以在这里添加
            });
            
            console.log(langJS_7ree.pl_monaco_ready_7r);
        });
        
    } catch (error) {
        console.error(langJS_7ree.pl_monaco_loading_error_7r, error);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSidebar_7ree);