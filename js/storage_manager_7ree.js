/**
 * 存储管理类
 * 包含数据校验、异常容错、意外恢复机制
 */
class StorageManager_7ree {
    constructor() {
        this.autoSaveInterval = 3000;
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.isAutoSaving = false;
        this.backupCount = 5;
        this.dataVersion = 2;
    }

    /**
     * 生成数据校验和
     * @param {object} data - 要校验的数据
     */
    async generateChecksum(data) {
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 验证数据完整性
     * @param {object} data - 数据对象（包含checksum字段）
     */
    async validateData(data) {
        if (!data || !data.checksum) {
            return { valid: false, reason: '缺少校验和' };
        }

        const storedChecksum = data.checksum;
        const dataToVerify = { ...data };
        delete dataToVerify.checksum;
        
        const computedChecksum = await this.generateChecksum(dataToVerify);
        
        if (storedChecksum !== computedChecksum) {
            return { valid: false, reason: '校验和不匹配' };
        }

        return { valid: true };
    }

    /**
     * 封装数据（添加版本和校验和）
     * @param {object} data - 原始数据
     */
    async wrapData(data) {
        const wrapper = {
            version: this.dataVersion,
            timestamp: Date.now(),
            data: data
        };
        
        const checksum = await this.generateChecksum(wrapper);
        wrapper.checksum = checksum;
        
        return wrapper;
    }

    /**
     * 解封装数据并验证
     * @param {object} wrapper - 封装的数据对象
     */
    async unwrapData(wrapper) {
        if (!wrapper) {
            return { success: false, data: null, error: '数据为空' };
        }

        const validation = await this.validateData(wrapper);
        if (!validation.valid) {
            return { success: false, data: null, error: validation.reason };
        }

        if (wrapper.version !== this.dataVersion) {
            console.log(`数据版本不匹配: 存储版本 ${wrapper.version}, 当前版本 ${this.dataVersion}`);
            const migratedData = this.migrateData(wrapper.data, wrapper.version);
            if (migratedData) {
                return { success: true, data: migratedData, migrated: true };
            }
            return { success: false, data: null, error: '数据迁移失败' };
        }

        return { success: true, data: wrapper.data };
    }

    /**
     * 数据迁移
     * @param {object} data - 旧版本数据
     * @param {number} fromVersion - 源版本号
     */
    migrateData(data, fromVersion) {
        try {
            if (fromVersion === 1) {
                console.log('从版本1迁移数据...');
                if (data && !data.notes) {
                    const migratedNotes = [{
                        id: 'note_migrated_' + Date.now(),
                        name: '迁移的笔记',
                        content: data.content || '',
                        language: 'plaintext',
                        fontSize: 14,
                        lineHeight: 26,
                        isEncrypted: false,
                        createdAt: data.timestamp || Date.now(),
                        updatedAt: Date.now()
                    }];
                    
                    return {
                        notes: migratedNotes,
                        currentNoteId: migratedNotes[0].id,
                        settings: data.settings || {}
                    };
                }
            }
            return data;
        } catch (error) {
            console.error('数据迁移失败:', error);
            return null;
        }
    }

    /**
     * 保存数据到存储（带校验和）
     * @param {string} key - 存储键
     * @param {object} data - 要存储的数据
     */
    async saveData(key, data) {
        try {
            const wrappedData = await this.wrapData(data);
            await chrome.storage.local.set({ [key]: wrappedData });
            
            await this.createBackup(key, wrappedData);
            
            this.lastSaveTime = new Date();
            this.updateLastSaveTime();
            
            console.log('数据已保存:', key);
            return { success: true };
        } catch (error) {
            console.error('保存数据错误:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 从存储加载数据（带验证）
     * @param {string} key - 存储键
     */
    async loadData(key) {
        try {
            const result = await chrome.storage.local.get(key);
            const wrapper = result[key];
            
            if (!wrapper) {
                const backupResult = await this.tryLoadFromBackup(key);
                if (backupResult) {
                    console.log('从备份恢复数据');
                    return backupResult;
                }
                return { success: false, data: null, error: '数据不存在' };
            }

            const unwrapResult = await this.unwrapData(wrapper);
            
            if (!unwrapResult.success) {
                console.warn(`数据验证失败: ${unwrapResult.error}, 尝试从备份恢复...`);
                const backupResult = await this.tryLoadFromBackup(key);
                if (backupResult) {
                    return backupResult;
                }
                return { success: false, data: null, error: unwrapResult.error };
            }

            if (unwrapResult.migrated) {
                console.log('迁移后的数据已保存');
                await this.saveData(key, unwrapResult.data);
            }

            return { success: true, data: unwrapResult.data };
        } catch (error) {
            console.error('加载数据错误:', error);
            
            const backupResult = await this.tryLoadFromBackup(key);
            if (backupResult) {
                return backupResult;
            }
            
            return { success: false, data: null, error: error.message };
        }
    }

    /**
     * 创建备份
     * @param {string} key - 存储键
     * @param {object} wrappedData - 封装的数据
     */
    async createBackup(key, wrappedData) {
        try {
            const backupKey = `${key}_backup_`;
            const timestampsKey = `${key}_backup_timestamps`;
            
            const timestampsResult = await chrome.storage.local.get(timestampsKey);
            let timestamps = timestampsResult[timestampsKey] || [];
            
            const timestamp = Date.now();
            timestamps.push(timestamp);
            
            while (timestamps.length > this.backupCount) {
                const oldestTimestamp = timestamps.shift();
                await chrome.storage.local.remove(`${backupKey}${oldestTimestamp}`);
            }
            
            await chrome.storage.local.set({
                [`${backupKey}${timestamp}`]: wrappedData,
                [timestampsKey]: timestamps
            });
            
            console.log(`创建备份成功，共 ${timestamps.length} 个备份`);
        } catch (error) {
            console.error('创建备份失败:', error);
        }
    }

    /**
     * 尝试从备份加载数据
     * @param {string} key - 存储键
     */
    async tryLoadFromBackup(key) {
        try {
            const backupKey = `${key}_backup_`;
            const timestampsKey = `${key}_backup_timestamps`;
            
            const timestampsResult = await chrome.storage.local.get(timestampsKey);
            let timestamps = timestampsResult[timestampsKey] || [];
            
            if (timestamps.length === 0) {
                return null;
            }
            
            timestamps.sort((a, b) => b - a);
            
            for (const timestamp of timestamps) {
                const backupResult = await chrome.storage.local.get(`${backupKey}${timestamp}`);
                const backupData = backupResult[`${backupKey}${timestamp}`];
                
                if (backupData) {
                    const unwrapResult = await this.unwrapData(backupData);
                    if (unwrapResult.success) {
                        console.log(`从备份恢复成功: ${new Date(timestamp).toLocaleString()}`);
                        await this.saveData(key, unwrapResult.data);
                        return { success: true, data: unwrapResult.data, fromBackup: true, timestamp };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('从备份恢复失败:', error);
            return null;
        }
    }

    /**
     * 保存内容到本地存储（兼容旧API）
     */
    async saveContent(content, scrollPosition = null, selection = null) {
        const data = {
            content: content,
            timestamp: Date.now(),
            scrollPosition: scrollPosition,
            selection: selection
        };
        
        const result = await this.saveData('sidebar_noter_data', data);
        return result.success;
    }

    /**
     * 从本地存储加载内容（兼容旧API）
     */
    async loadContent() {
        const result = await this.loadData('sidebar_noter_data');
        if (result.success) {
            return result.data;
        }
        return null;
    }

    /**
     * 清除存储的数据
     */
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

    /**
     * 开始自动保存
     */
    startAutoSave(editor) {
        this.stopAutoSave();
        console.log('启动自动保存，间隔:', this.autoSaveInterval, 'ms');
        
        this.autoSaveTimer = setInterval(async () => {
            if (editor && !this.isAutoSaving) {
                this.isAutoSaving = true;
                try {
                    if (window.noteManager_7ree && window.noteManager_7ree.isInitialized) {
                        const currentNote = window.noteManager_7ree.getCurrentNote();
                        if (currentNote && !currentNote.isEncrypted) {
                            const content = editor.getValue();
                            await window.noteManager_7ree.updateNoteContent(currentNote.id, content);
                            this.lastSaveTime = new Date();
                            this.updateLastSaveTime();
                        }
                    } else {
                        const content = editor.getValue();
                        const scrollPosition = editor.getScrollPosition ? editor.getScrollPosition() : { scrollTop: 0, scrollLeft: 0 };
                        const selection = editor.getSelection();
                        await this.saveContent(content, scrollPosition, selection);
                    }
                } catch (error) {
                    console.error('自动保存错误:', error);
                } finally {
                    this.isAutoSaving = false;
                }
            }
        }, this.autoSaveInterval);
    }

    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * 更新最后保存时间显示
     */
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

    /**
     * 设置自动保存间隔
     */
    setAutoSaveInterval(interval) {
        this.autoSaveInterval = interval * 1000;
        if (this.autoSaveTimer) {
            this.startAutoSave(window.currentEditor);
        }
    }

    /**
     * 主题管理
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        }
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        this.setTheme(theme);
    }

    /**
     * 获取设置
     */
    getSettings() {
        return {
            theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light',
            autoSaveInterval: this.autoSaveInterval
        };
    }

    /**
     * 导出所有数据
     */
    async exportAllData() {
        try {
            const allData = await chrome.storage.local.get(null);
            const exportData = {
                exportTime: Date.now(),
                version: this.dataVersion,
                data: allData
            };
            return exportData;
        } catch (error) {
            console.error('导出数据错误:', error);
            return null;
        }
    }

    /**
     * 导入数据
     * @param {object} importData - 导入的数据对象
     */
    async importAllData(importData) {
        try {
            if (!importData || !importData.data) {
                return { success: false, error: '无效的导入数据' };
            }

            await chrome.storage.local.set(importData.data);
            
            return { success: true };
        } catch (error) {
            console.error('导入数据错误:', error);
            return { success: false, error: error.message };
        }
    }
}

// 在DOMContentLoaded事件中初始化StorageManager_7ree
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager_7ree = new StorageManager_7ree();
}); 
