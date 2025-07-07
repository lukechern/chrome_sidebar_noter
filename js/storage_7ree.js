/**
语言包定义

    'pl_storage_save_7r' => '保存内容',
    'pl_storage_load_7r' => '加载内容',
    'pl_storage_error_7r' => '存储错误',
    'pl_auto_save_7r' => '自动保存',
    'pl_export_success_7r' => '导出成功',
    'pl_export_error_7r' => '导出失败',
    'pl_file_save_success_7r' => '文件保存成功',
    'pl_file_save_error_7r' => '文件保存失败',
    'pl_file_read_success_7r' => '文件读取成功',
    'pl_file_read_error_7r' => '文件读取失败',
    'pl_file_not_found_7r' => '文件不存在',
**/

// 存储管理类
class StorageManager_7ree {
    constructor() {
        this.storageKey = 'chrome_sidebar_noter_content_7ree';
        this.stateKey = 'chrome_sidebar_noter_state_7ree';
        this.settingsKey = 'chrome_sidebar_noter_settings_7ree';
        this.autoSaveInterval = 3000; // 默认3秒自动保存
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.theme = 'light'; // 默认明亮主题
        
        // 加载设置
        this.loadSettings();
    }

    // 加载设置
    loadSettings() {
        try {
            chrome.storage.local.get([this.settingsKey], (result) => {
                const settings = result[this.settingsKey] || {};
                this.autoSaveInterval = settings.autoSaveInterval || 3000;
                this.theme = settings.theme || 'light';
                
                // 应用主题
                this.applyTheme(this.theme);
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 保存设置
    saveSettings() {
        try {
            const settings = {
                autoSaveInterval: this.autoSaveInterval,
                theme: this.theme
            };
            
            chrome.storage.local.set({
                [this.settingsKey]: settings
            }, () => {
                console.log('设置已保存');
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 应用主题
    applyTheme(theme) {
        this.theme = theme;
        
        if (window.editor && typeof window.editor.getModel === 'function') {
            monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
        }
        
        // 更新CSS主题
        document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    }

    // 保存文本内容
    saveContent(content) {
        try {
            chrome.storage.local.set({
                [this.storageKey]: content
            }, () => {
                this.lastSaveTime = new Date();
                console.log(langJS_7ree.pl_storage_save_7r + ': 内容已保存');
                
                // 更新状态栏
                this.updateStatusBar();
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 加载文本内容
    loadContent(callback) {
        try {
            chrome.storage.local.get([this.storageKey], (result) => {
                const content = result[this.storageKey] || '';
                console.log(langJS_7ree.pl_storage_load_7r + ': 内容已加载');
                if (callback) callback(content);
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
            if (callback) callback('');
        }
    }

    // 保存编辑器状态
    saveEditorState(editor) {
        try {
            if (!editor || typeof editor.getModel !== 'function') {
                return;
            }

            const state = {
                selection: editor.getSelection(),
                scrollTop: editor.getScrollTop(),
                scrollLeft: editor.getScrollLeft(),
                viewState: editor.saveViewState(),
                timestamp: Date.now()
            };

            chrome.storage.local.set({
                [this.stateKey]: state
            }, () => {
                console.log('编辑器状态已保存');
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 恢复编辑器状态
    restoreEditorState(editor) {
        try {
            if (!editor || typeof editor.getModel !== 'function') {
                return;
            }

            chrome.storage.local.get([this.stateKey], (result) => {
                const state = result[this.stateKey];
                if (state && state.viewState) {
                    // 恢复滚动位置
                    if (typeof state.scrollTop === 'number') {
                        editor.setScrollTop(state.scrollTop);
                    }
                    if (typeof state.scrollLeft === 'number') {
                        editor.setScrollLeft(state.scrollLeft);
                    }
                    
                    // 恢复视图状态
                    if (state.viewState) {
                        editor.restoreViewState(state.viewState);
                    }
                    
                    console.log('编辑器状态已恢复');
                }
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 开始自动保存
    startAutoSave(editor) {
        this.stopAutoSave(); // 先停止之前的定时器
        
        this.autoSaveTimer = setInterval(() => {
            if (editor && typeof editor.getModel === 'function') {
                const content = editor.getValue();
                this.saveContent(content);
                this.saveEditorState(editor);
                console.log(langJS_7ree.pl_auto_save_7r + ': ' + new Date().toLocaleTimeString());
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

    // 手动保存
    manualSave(editor) {
        if (editor && typeof editor.getModel === 'function') {
            const content = editor.getValue();
            this.saveContent(content);
            this.saveEditorState(editor);
            console.log('手动保存完成');
        }
    }

    // 导出到txt文件
    exportToTxt(editor) {
        try {
            if (!editor || typeof editor.getModel !== 'function') {
                console.error(langJS_7ree.pl_export_error_7r + ': 编辑器不可用');
                return;
            }

            const content = editor.getValue();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `noter_${timestamp}.txt`;

            // 创建Blob对象
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            if (a.parentNode) {
                a.parentNode.removeChild(a);
            }
            URL.revokeObjectURL(url);
            
            console.log(langJS_7ree.pl_export_success_7r + ': ' + filename);
            return filename;
        } catch (e) {
            console.error(langJS_7ree.pl_export_error_7r + ':', e);
            return null;
        }
    }

    // 更新状态栏
    updateStatusBar() {
        if (window.statusbarManager_7ree) {
            window.statusbarManager_7ree.updateLastSaveTime(this.lastSaveTime);
        }
    }

    // 获取上次保存时间
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    // 设置自动保存时间间隔
    setAutoSaveInterval(interval) {
        this.autoSaveInterval = interval;
        this.saveSettings();
        
        // 如果编辑器正在运行，重新启动自动保存
        if (window.editor && typeof window.editor.getModel === 'function') {
            this.startAutoSave(window.editor);
        }
    }

    // 设置主题
    setTheme(theme) {
        this.applyTheme(theme);
        this.saveSettings();
    }

    // 获取设置
    getSettings() {
        return {
            autoSaveInterval: this.autoSaveInterval,
            theme: this.theme
        };
    }

    // 清除所有数据
    clearAllData() {
        try {
            chrome.storage.local.remove([this.storageKey, this.stateKey], () => {
                console.log('所有数据已清除');
            });
        } catch (e) {
            console.error(langJS_7ree.pl_storage_error_7r + ':', e);
        }
    }

    // 清理资源
    cleanup() {
        this.stopAutoSave();
    }
}

// 创建全局存储管理器实例
window.storageManager_7ree = new StorageManager_7ree(); 
window.storageManager_7ree = new StorageManager_7ree(); 