/**
 * 笔记管理类
 * 负责多笔记的创建、读取、更新、删除操作
 */
class NoteManager_7ree {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.notes = [];
        this.currentNoteId = null;
        this.isInitialized = false;
    }

    /**
     * 初始化笔记管理器
     * 从存储中加载笔记列表
     */
    async init() {
        try {
            const result = await chrome.storage.local.get('sidebar_noter_notes');
            if (result.sidebar_noter_notes && Array.isArray(result.sidebar_noter_notes)) {
                this.notes = result.sidebar_noter_notes;
            } else {
                this.notes = [];
            }

            const currentResult = await chrome.storage.local.get('sidebar_noter_current_note_id');
            if (currentResult.sidebar_noter_current_note_id) {
                this.currentNoteId = currentResult.sidebar_noter_current_note_id;
            }

            if (this.notes.length === 0) {
                await this.createDefaultNote();
            }

            if (!this.currentNoteId && this.notes.length > 0) {
                this.currentNoteId = this.notes[0].id;
            }

            this.isInitialized = true;
            console.log('NoteManager initialized, notes count:', this.notes.length);
            return true;
        } catch (error) {
            console.error('NoteManager initialization error:', error);
            return false;
        }
    }

    /**
     * 创建默认笔记
     */
    async createDefaultNote() {
        const defaultNote = {
            id: this.generateId(),
            name: '默认笔记',
            content: '',
            language: 'plaintext',
            fontSize: 14,
            lineHeight: 26,
            isEncrypted: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.notes.push(defaultNote);
        this.currentNoteId = defaultNote.id;
        await this.saveNotesList();
        return defaultNote;
    }

    /**
     * 创建新笔记
     * @param {string} name - 笔记名称
     * @param {string} initialContent - 初始内容
     */
    async createNote(name, initialContent = '') {
        const note = {
            id: this.generateId(),
            name: name || '未命名笔记',
            content: initialContent,
            language: 'plaintext',
            fontSize: 14,
            lineHeight: 26,
            isEncrypted: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.notes.push(note);
        await this.saveNotesList();
        
        return note;
    }

    /**
     * 获取笔记
     * @param {string} noteId - 笔记ID
     */
    getNote(noteId) {
        return this.notes.find(note => note.id === noteId) || null;
    }

    /**
     * 获取当前笔记
     */
    getCurrentNote() {
        if (!this.currentNoteId) return null;
        return this.getNote(this.currentNoteId);
    }

    /**
     * 获取所有笔记列表（元数据，不含内容）
     */
    getNotesList() {
        return this.notes.map(note => ({
            id: note.id,
            name: note.name,
            isEncrypted: note.isEncrypted,
            language: note.language,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }));
    }

    /**
     * 更新笔记内容
     * @param {string} noteId - 笔记ID
     * @param {string} content - 新内容
     */
    async updateNoteContent(noteId, content) {
        const note = this.getNote(noteId);
        if (!note) return false;

        note.content = content;
        note.updatedAt = Date.now();
        
        await this.saveNotesList();
        return true;
    }

    /**
     * 重命名笔记
     * @param {string} noteId - 笔记ID
     * @param {string} newName - 新名称
     */
    async renameNote(noteId, newName) {
        const note = this.getNote(noteId);
        if (!note) return false;

        note.name = newName || '未命名笔记';
        note.updatedAt = Date.now();
        
        await this.saveNotesList();
        return true;
    }

    /**
     * 删除笔记
     * @param {string} noteId - 笔记ID
     */
    async deleteNote(noteId) {
        const index = this.notes.findIndex(n => n.id === noteId);
        if (index === -1) return false;

        if (this.notes.length <= 1) {
            console.warn('Cannot delete the last note');
            return false;
        }

        this.notes.splice(index, 1);

        if (this.currentNoteId === noteId) {
            this.currentNoteId = this.notes[0].id;
        }

        await this.saveNotesList();
        return true;
    }

    /**
     * 切换当前笔记
     * @param {string} noteId - 笔记ID
     */
    async switchNote(noteId) {
        const note = this.getNote(noteId);
        if (!note) return false;

        this.currentNoteId = noteId;
        await chrome.storage.local.set({
            'sidebar_noter_current_note_id': noteId
        });

        return true;
    }

    /**
     * 更新笔记设置
     * @param {string} noteId - 笔记ID
     * @param {object} settings - 设置对象
     */
    async updateNoteSettings(noteId, settings) {
        const note = this.getNote(noteId);
        if (!note) return false;

        if (settings.language !== undefined) note.language = settings.language;
        if (settings.fontSize !== undefined) note.fontSize = settings.fontSize;
        if (settings.lineHeight !== undefined) note.lineHeight = settings.lineHeight;
        note.updatedAt = Date.now();

        await this.saveNotesList();
        return true;
    }

    /**
     * 保存笔记列表到存储
     */
    async saveNotesList() {
        try {
            await chrome.storage.local.set({
                'sidebar_noter_notes': this.notes,
                'sidebar_noter_current_note_id': this.currentNoteId
            });
            return true;
        } catch (error) {
            console.error('Save notes list error:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 搜索所有笔记内容
     * @param {string} keyword - 搜索关键词
     * @param {boolean} caseSensitive - 是否区分大小写
     */
    searchNotes(keyword, caseSensitive = false) {
        if (!keyword || keyword.trim() === '') {
            return [];
        }

        const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
        const results = [];

        for (const note of this.notes) {
            if (note.isEncrypted) continue;

            const content = caseSensitive ? note.content : note.content.toLowerCase();
            const name = caseSensitive ? note.name : note.name.toLowerCase();

            const matches = [];
            const lines = note.content.split('\n');
            
            lines.forEach((line, lineIndex) => {
                const searchLine = caseSensitive ? line : line.toLowerCase();
                let pos = 0;
                while ((pos = searchLine.indexOf(searchKeyword, pos)) !== -1) {
                    matches.push({
                        line: lineIndex + 1,
                        column: pos + 1,
                        preview: line.substring(Math.max(0, pos - 20), Math.min(line.length, pos + keyword.length + 20)),
                        startIndex: pos,
                        endIndex: pos + keyword.length
                    });
                    pos += searchKeyword.length;
                }
            });

            if (name.indexOf(searchKeyword) !== -1 || matches.length > 0) {
                results.push({
                    noteId: note.id,
                    noteName: note.name,
                    matches: matches,
                    matchCount: matches.length
                });
            }
        }

        return results;
    }
}

// 在DOMContentLoaded事件中初始化NoteManager_7ree
document.addEventListener('DOMContentLoaded', () => {
    if (typeof storageManager_7ree !== 'undefined') {
        window.noteManager_7ree = new NoteManager_7ree(storageManager_7ree);
    }
}); 
