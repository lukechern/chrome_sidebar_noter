/**
 * 存储管理类
 */
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
                const scrollPosition = editor.getScrollPosition ? editor.getScrollPosition() : { scrollTop: 0, scrollLeft: 0 };
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

    // 主题管理
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        }
    }

    // 应用主题
    applyTheme(theme) {
        this.setTheme(theme);
    }

    // 获取设置
    getSettings() {
        // 这里可以从chrome.storage.local获取，为了简化，先返回默认值
        return {
            theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light',
            autoSaveInterval: this.autoSaveInterval
        };
    }
}

// 在DOMContentLoaded事件中初始化StorageManager_7ree
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager_7ree = new StorageManager_7ree();
}); 