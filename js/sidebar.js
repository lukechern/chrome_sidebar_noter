/**
 * 主侧边栏脚本
 * 集成所有新功能：多笔记管理、搜索、加密、编辑器优化等
 */

// 全局变量
window.currentEditor = null;
window.currentNote = null;
window.searchMatches = [];
window.currentMatchIndex = 0;
window.isCaseSensitive = false;
window.encryptedNoteCache = {};

// 初始化函数
async function initSidebar_7ree() {
    try {
        // 确保所有管理器已初始化
        if (!storageManager_7ree) {
            console.error("storageManager_7ree is not initialized");
            return;
        }

        // 初始化笔记管理器
        if (window.noteManager_7ree) {
            await window.noteManager_7ree.init();
        }

        // 加载保存的主题设置
        const themeResult = await chrome.storage.local.get('sidebar_noter_theme');
        if (themeResult.sidebar_noter_theme === 'dark') {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        }

        // 加载全局设置
        await loadGlobalSettings();

        // 配置Monaco Editor
        require.config({ paths: { 'vs': 'lib/monaco-editor-0.52.2/min/vs' } });

        require(['vs/editor/editor.main'], async function() {
            // 禁用Web Worker
            self.MonacoEnvironment = {
                getWorkerUrl: function (moduleId, label) {
                    return null;
                }
            };

            // 创建编辑器
            await createEditor();

            // 初始化UI事件
            initUIEvents();

            // 加载当前笔记
            await loadCurrentNote();

            // 开始自动保存
            if (storageManager_7ree) {
                storageManager_7ree.startAutoSave(window.currentEditor);
                console.log('自动保存已启动，间隔:', storageManager_7ree.autoSaveInterval, 'ms');
            }

            console.log('Chrome Sidebar Noter 已就绪');
        });

    } catch (error) {
        console.error('初始化错误:', error);
    }
}

// 创建编辑器
async function createEditor() {
    const container = document.getElementById('editor-container');
    
    // 获取默认设置
    const settingsResult = await chrome.storage.local.get([
        'sidebar_noter_default_font_size',
        'sidebar_noter_default_line_height',
        'sidebar_noter_show_line_numbers',
        'sidebar_noter_show_minimap'
    ]);

    const isDarkTheme = document.body.classList.contains('theme-dark');
    
    window.currentEditor = monaco.editor.create(container, {
        value: '',
        language: 'plaintext',
        theme: isDarkTheme ? 'vs-dark' : 'vs',
        lineNumbers: settingsResult.sidebar_noter_show_line_numbers !== false ? 'on' : 'off',
        automaticLayout: true,
        minimap: { enabled: settingsResult.sidebar_noter_show_minimap === true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: parseInt(settingsResult.sidebar_noter_default_font_size) || 14,
        lineHeight: parseInt(settingsResult.sidebar_noter_default_line_height) || 26,
        padding: { top: 5, bottom: 5 },
        scrollbar: {
            vertical: 'visible',
            horizontal: 'visible'
        },
        readOnly: false,
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        quickSuggestions: false,
        parameterHints: { enabled: false },
        suggestOnTriggerCharacters: false,
        acceptSuggestionOnCommitCharacter: false
    });

    // 监听编辑器变化
    window.currentEditor.onDidChangeModelContent(() => {
        updateEditorStatus();
    });

    // 监听光标位置变化
    window.currentEditor.onDidChangeCursorPosition(() => {
        updateEditorStatus();
    });

    // 监听选择变化
    window.currentEditor.onDidChangeSelection(() => {
        updateEditorStatus();
    });
}

// 更新编辑器状态栏
function updateEditorStatus() {
    if (!window.currentEditor) return;

    const model = window.currentEditor.getModel();
    const position = window.currentEditor.getPosition();
    const selection = window.currentEditor.getSelection();

    // 更新行号
    const lineCount = model ? model.getLineCount() : 0;
    document.getElementById('editor-lines').textContent = `${lineCount} 行`;

    // 更新光标位置
    if (position) {
        document.getElementById('editor-position').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    }

    // 更新语言
    const currentNote = window.noteManager_7ree ? window.noteManager_7ree.getCurrentNote() : null;
    document.getElementById('editor-language').textContent = currentNote ? currentNote.language : 'plaintext';
}

// 加载全局设置
async function loadGlobalSettings() {
    const result = await chrome.storage.local.get([
        'sidebar_noter_auto_save_interval',
        'sidebar_noter_exchange_url',
        'sidebar_noter_clipboard_url',
        'sidebar_noter_tab1_name',
        'sidebar_noter_tab2_name',
        'sidebar_noter_backup_count'
    ]);

    if (result.sidebar_noter_auto_save_interval && storageManager_7ree) {
        storageManager_7ree.setAutoSaveInterval(result.sidebar_noter_auto_save_interval);
    }

    if (result.sidebar_noter_backup_count && storageManager_7ree) {
        storageManager_7ree.backupCount = result.sidebar_noter_backup_count;
    }

    // 更新标签名称
    if (window.statusbarManager_7ree && typeof window.statusbarManager_7ree.updateTabNames === 'function') {
        window.statusbarManager_7ree.updateTabNames(
            result.sidebar_noter_tab1_name,
            result.sidebar_noter_tab2_name
        );
    }
}

// 加载当前笔记
async function loadCurrentNote() {
    if (!window.noteManager_7ree) return;

    const note = window.noteManager_7ree.getCurrentNote();
    if (!note) {
        console.error('没有找到当前笔记');
        return;
    }

    window.currentNote = note;

    // 更新UI显示
    document.getElementById('current-note-name').textContent = note.name;

    // 更新锁图标
    const lockIcon = document.getElementById('lock-icon');
    if (note.isEncrypted) {
        lockIcon.classList.add('locked');
        lockIcon.classList.remove('unlocked');
        lockIcon.title = '已加密';
    } else {
        lockIcon.classList.remove('locked');
        lockIcon.classList.add('unlocked');
        lockIcon.title = '未加密';
    }

    // 处理加密笔记
    if (note.isEncrypted) {
        // 检查是否有缓存的解密内容
        const cachedContent = window.encryptedNoteCache[note.id];
        if (cachedContent !== undefined) {
            loadNoteContent(note, cachedContent);
        } else {
            // 显示密码对话框
            showPasswordDialog(note);
        }
    } else {
        loadNoteContent(note, note.content);
    }

    // 更新笔记列表
    renderNotesList();
}

// 加载笔记内容到编辑器
function loadNoteContent(note, content) {
    if (!window.currentEditor) return;

    // 保存当前滚动位置（如果有的话）
    const oldScrollPosition = window.currentEditor.getScrollPosition();

    // 设置编辑器内容
    window.currentEditor.setValue(content || '');

    // 更新编辑器语言
    monaco.editor.setModelLanguage(
        window.currentEditor.getModel(),
        note.language || 'plaintext'
    );

    // 更新编辑器字体和行高
    const options = {};
    if (note.fontSize) options.fontSize = note.fontSize;
    if (note.lineHeight) options.lineHeight = note.lineHeight;
    if (Object.keys(options).length > 0) {
        window.currentEditor.updateOptions(options);
    }

    // 更新主题
    const isDarkTheme = document.body.classList.contains('theme-dark');
    monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');

    updateEditorStatus();
}

// 渲染笔记列表
function renderNotesList() {
    if (!window.noteManager_7ree) return;

    const notes = window.noteManager_7ree.getNotesList();
    const currentNoteId = window.noteManager_7ree.currentNoteId;
    const listContainer = document.getElementById('notes-list');

    listContainer.innerHTML = '';

    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = `note_item_7ree ${note.id === currentNoteId ? 'active' : ''}`;
        item.dataset.noteId = note.id;

        // 格式化日期
        const updatedDate = new Date(note.updatedAt);
        const dateStr = updatedDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

        item.innerHTML = `
            <div class="note_item_icon_7ree ${note.isEncrypted ? 'locked' : ''}">
                <svg viewBox="0 0 24 24">
                    ${note.isEncrypted 
                        ? '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>'
                        : '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>'
                    }
                </svg>
            </div>
            <div class="note_item_name_7ree">${escapeHtml(note.name)}</div>
            <div class="note_item_date_7ree">${dateStr}</div>
        `;

        // 点击切换笔记
        item.addEventListener('click', (e) => {
            if (e.target.closest('.note_item_menu_7ree')) return;
            switchToNote(note.id);
        });

        listContainer.appendChild(item);
    });
}

// 切换到指定笔记
async function switchToNote(noteId) {
    if (!window.noteManager_7ree) return;

    const currentNote = window.noteManager_7ree.getCurrentNote();
    
    // 保存当前笔记内容
    if (currentNote && window.currentEditor) {
        const content = window.currentEditor.getValue();
        
        // 处理加密笔记 - 保存到缓存
        if (currentNote.isEncrypted) {
            window.encryptedNoteCache[currentNote.id] = content;
        }
        
        await window.noteManager_7ree.updateNoteContent(currentNote.id, content);
    }

    // 切换笔记
    await window.noteManager_7ree.switchNote(noteId);
    
    // 加载新笔记
    await loadCurrentNote();

    // 关闭笔记面板
    closeNotesPanel();

    showNotification_7ree('已切换笔记');
}

// 显示密码对话框
function showPasswordDialog(note) {
    const dialog = document.getElementById('password-dialog');
    const passwordInput = document.getElementById('unlock-password');
    const errorMsg = document.getElementById('password-error');

    errorMsg.style.display = 'none';
    passwordInput.value = '';
    dialog.style.display = 'flex';

    // 聚焦密码输入框
    setTimeout(() => passwordInput.focus(), 100);

    // 清除之前的事件监听器
    const unlockBtn = document.getElementById('unlock-note-btn');
    const cancelBtn = document.getElementById('cancel-unlock-btn');

    // 使用事件委托或重新绑定
    const handleUnlock = async () => {
        const password = passwordInput.value.trim();
        if (!password) {
            errorMsg.textContent = '请输入密码';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            // 尝试解密
            const encryptedPackage = note.encryptedPackage || note.content;
            const decryptedContent = await window.encryptionManager_7ree.decryptNote(
                typeof encryptedPackage === 'string' ? JSON.parse(encryptedPackage) : encryptedPackage,
                password
            );

            // 缓存解密内容
            window.encryptedNoteCache[note.id] = decryptedContent;

            // 关闭对话框
            dialog.style.display = 'none';

            // 加载内容
            loadNoteContent(note, decryptedContent);

            // 解除事件绑定
            unlockBtn.removeEventListener('click', handleUnlock);
            cancelBtn.removeEventListener('click', handleCancel);

        } catch (error) {
            errorMsg.textContent = '密码错误，请重试';
            errorMsg.style.display = 'block';
            passwordInput.focus();
            passwordInput.select();
        }
    };

    const handleCancel = () => {
        dialog.style.display = 'none';
        // 解除事件绑定
        unlockBtn.removeEventListener('click', handleUnlock);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    unlockBtn.addEventListener('click', handleUnlock);
    cancelBtn.addEventListener('click', handleCancel);

    // 回车键解锁
    passwordInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            handleUnlock();
        }
    };
}

// 初始化UI事件
function initUIEvents() {
    // 笔记面板切换
    document.getElementById('toggle-notes-panel').addEventListener('click', toggleNotesPanel);
    document.getElementById('close-notes-panel').addEventListener('click', closeNotesPanel);

    // 新建笔记
    document.getElementById('new-note-btn').addEventListener('click', createNewNote);

    // 搜索按钮
    document.getElementById('search-btn').addEventListener('click', toggleSearchPanel);
    document.getElementById('close-search').addEventListener('click', closeSearchPanel);

    // 搜索控制
    initSearchEvents();

    // 笔记设置
    document.getElementById('note-settings-btn').addEventListener('click', openNoteSettings);
    document.getElementById('close-note-settings').addEventListener('click', closeNoteSettings);
    document.getElementById('save-note-settings').addEventListener('click', saveNoteSettings);
    document.getElementById('cancel-note-settings').addEventListener('click', closeNoteSettings);
    document.getElementById('delete-note-btn').addEventListener('click', deleteCurrentNote);

    // 加密开关
    document.getElementById('note-encrypted').addEventListener('change', (e) => {
        const passwordContainer = document.getElementById('encryption-password-container');
        passwordContainer.style.display = e.target.checked ? 'block' : 'none';
    });

    // 全局设置
    document.getElementById('global-settings-btn').addEventListener('click', openGlobalSettings);
    document.getElementById('close-global-settings').addEventListener('click', closeGlobalSettings);
    document.getElementById('save-global-settings').addEventListener('click', saveGlobalSettings);
    document.getElementById('cancel-global-settings').addEventListener('click', closeGlobalSettings);

    // 设置标签切换
    document.querySelectorAll('.settings_tab_btn_7ree').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchSettingsTab(e.target.dataset.settingsTab);
        });
    });

    // 自动保存滑块
    const autoSaveSlider = document.getElementById('auto-save-slider');
    const autoSaveValue = document.getElementById('auto-save-value');
    autoSaveSlider.addEventListener('input', (e) => {
        autoSaveValue.textContent = `${e.target.value} 秒`;
    });

    // 主题切换实时预览
    const themeSwitch = document.getElementById('global-theme-switch');
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        }
        // 更新编辑器主题
        if (window.currentEditor) {
            monaco.editor.setTheme(e.target.checked ? 'vs-dark' : 'vs');
        }
    });

    // 导出/导入数据
    document.getElementById('export-data-btn').addEventListener('click', exportAllData);
    document.getElementById('import-data-btn').addEventListener('click', () => {
        document.getElementById('import-data-input').click();
    });
    document.getElementById('import-data-input').addEventListener('change', handleImportData);

    // 清空所有数据
    document.getElementById('clear-all-data-btn').addEventListener('click', () => {
        showConfirmDialog('确定要清空所有数据吗？此操作不可恢复！', async () => {
            await chrome.storage.local.clear();
            window.encryptedNoteCache = {};
            if (window.noteManager_7ree) {
                window.noteManager_7ree.notes = [];
                window.noteManager_7ree.currentNoteId = null;
                await window.noteManager_7ree.createDefaultNote();
            }
            await loadCurrentNote();
            showNotification_7ree('数据已清空');
        });
    });

    // 清空缓存
    document.getElementById('clear-cache-btn').addEventListener('click', () => {
        showConfirmDialog('确定要清空标签一和标签二的网址缓存吗？', async () => {
            await chrome.storage.local.remove(['sidebar_noter_exchange_url', 'sidebar_noter_clipboard_url']);
            showNotification_7ree('网址缓存已清空');
        });
    });

    // 保存按钮
    document.getElementById('save-icon').addEventListener('click', handleManualSave);

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+S 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleManualSave();
        }

        // Ctrl+F 搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            toggleSearchPanel();
        }

        // Escape 关闭面板
        if (e.key === 'Escape') {
            closeSearchPanel();
            closeNotesPanel();
            closeGlobalSettings();
            closeNoteSettings();
        }
    });
}

// 初始化搜索事件
function initSearchEvents() {
    const searchInput = document.getElementById('search-input');
    const searchNext = document.getElementById('search-next');
    const searchPrev = document.getElementById('search-prev');
    const caseSensitiveBtn = document.getElementById('search-case-sensitive');
    const replaceOne = document.getElementById('replace-one');
    const replaceAll = document.getElementById('replace-all');

    // 搜索输入
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 200);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                findPrevious();
            } else {
                findNext();
            }
        }
    });

    // 搜索按钮
    searchNext.addEventListener('click', findNext);
    searchPrev.addEventListener('click', findPrevious);

    // 区分大小写
    caseSensitiveBtn.addEventListener('click', () => {
        window.isCaseSensitive = !window.isCaseSensitive;
        caseSensitiveBtn.classList.toggle('active', window.isCaseSensitive);
        performSearch();
    });

    // 替换功能
    replaceOne.addEventListener('click', replaceCurrentMatch);
    replaceAll.addEventListener('click', replaceAllMatches);

    // 显示替换框（双击 Ctrl+F 或其他方式）
    searchInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            document.getElementById('search-replace-box').style.display = 'flex';
        }
    });
}

// 执行搜索
function performSearch() {
    if (!window.currentEditor) return;

    const searchInput = document.getElementById('search-input');
    const searchText = searchInput.value;
    const searchCount = document.getElementById('search-count');

    if (!searchText) {
        searchCount.textContent = '0/0';
        window.searchMatches = [];
        window.currentMatchIndex = 0;
        clearSearchDecorations();
        return;
    }

    const model = window.currentEditor.getModel();
    
    // 查找所有匹配
    window.searchMatches = model.findMatches(
        searchText,
        true,              // 是否搜索整个模型
        window.isCaseSensitive,  // 区分大小写
        false,             // 正则表达式
        null,              // 匹配大小写
        true               // 只获取匹配计数
    );

    // 更新搜索计数
    const totalMatches = window.searchMatches.length;
    if (window.currentMatchIndex >= totalMatches) {
        window.currentMatchIndex = Math.max(0, totalMatches - 1);
    }

    searchCount.textContent = `${totalMatches > 0 ? window.currentMatchIndex + 1 : 0}/${totalMatches}`;

    // 高亮所有匹配
    highlightSearchMatches(searchText);

    // 定位到当前匹配
    if (totalMatches > 0) {
        goToMatch(window.currentMatchIndex);
    }
}

// 高亮搜索匹配
function highlightSearchMatches(searchText) {
    if (!window.currentEditor) return;

    // 使用Monaco的find功能
    const editor = window.currentEditor;
    const model = editor.getModel();

    // 清除旧的装饰
    clearSearchDecorations();

    if (!searchText || window.searchMatches.length === 0) return;

    // 创建装饰
    const decorations = window.searchMatches.map((match, index) => {
        const isCurrent = index === window.currentMatchIndex;
        return {
            range: match.range,
            options: {
                className: isCurrent ? 'currentFindMatch' : 'findMatch',
                isWholeLine: false,
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
        };
    });

    // 应用装饰
    window.searchDecorations = editor.deltaDecorations([], decorations);
}

// 清除搜索装饰
function clearSearchDecorations() {
    if (window.currentEditor && window.searchDecorations) {
        window.currentEditor.deltaDecorations(window.searchDecorations, []);
        window.searchDecorations = null;
    }
}

// 查找下一个
function findNext() {
    if (window.searchMatches.length === 0) return;
    window.currentMatchIndex = (window.currentMatchIndex + 1) % window.searchMatches.length;
    goToMatch(window.currentMatchIndex);
    updateSearchCount();
}

// 查找上一个
function findPrevious() {
    if (window.searchMatches.length === 0) return;
    window.currentMatchIndex = (window.currentMatchIndex - 1 + window.searchMatches.length) % window.searchMatches.length;
    goToMatch(window.currentMatchIndex);
    updateSearchCount();
}

// 定位到指定匹配
function goToMatch(index) {
    if (!window.currentEditor || !window.searchMatches[index]) return;

    const match = window.searchMatches[index];
    window.currentEditor.revealRangeInCenter(match.range);
    window.currentEditor.setSelection(match.range);

    // 更新高亮
    highlightSearchMatches(document.getElementById('search-input').value);
}

// 更新搜索计数显示
function updateSearchCount() {
    const searchCount = document.getElementById('search-count');
    const totalMatches = window.searchMatches.length;
    searchCount.textContent = `${totalMatches > 0 ? window.currentMatchIndex + 1 : 0}/${totalMatches}`;
}

// 替换当前匹配
function replaceCurrentMatch() {
    if (!window.currentEditor || window.searchMatches.length === 0) return;

    const replaceText = document.getElementById('replace-input').value;
    const match = window.searchMatches[window.currentMatchIndex];

    if (!match) return;

    // 执行替换
    window.currentEditor.executeEdits('replace', [
        {
            range: match.range,
            text: replaceText
        }
    ]);

    // 重新搜索
    performSearch();
}

// 替换所有匹配
function replaceAllMatches() {
    if (!window.currentEditor || window.searchMatches.length === 0) return;

    const searchText = document.getElementById('search-input').value;
    const replaceText = document.getElementById('replace-input').value;

    // 获取模型
    const model = window.currentEditor.getModel();
    const fullText = model.getValue();

    // 执行替换
    const flags = window.isCaseSensitive ? 'g' : 'gi';
    const newText = fullText.replace(new RegExp(escapeRegex(searchText), flags), replaceText);

    // 设置新内容
    window.currentEditor.setValue(newText);

    showNotification_7ree(`已替换 ${window.searchMatches.length} 处匹配`);

    // 重新搜索
    performSearch();
}

// 转义正则表达式特殊字符
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 切换搜索面板
function toggleSearchPanel() {
    const panel = document.getElementById('search-panel');
    const searchInput = document.getElementById('search-input');

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        setTimeout(() => searchInput.focus(), 10);
    } else {
        closeSearchPanel();
    }
}

// 关闭搜索面板
function closeSearchPanel() {
    const panel = document.getElementById('search-panel');
    panel.style.display = 'none';
    document.getElementById('search-input').value = '';
    document.getElementById('replace-input').value = '';
    document.getElementById('search-replace-box').style.display = 'none';
    window.searchMatches = [];
    window.currentMatchIndex = 0;
    clearSearchDecorations();
}

// 切换笔记面板
function toggleNotesPanel() {
    const panel = document.getElementById('notes-panel');
    panel.classList.toggle('open');
}

// 关闭笔记面板
function closeNotesPanel() {
    const panel = document.getElementById('notes-panel');
    panel.classList.remove('open');
}

// 创建新笔记
async function createNewNote() {
    if (!window.noteManager_7ree) return;

    const noteName = prompt('请输入笔记名称:', '新笔记');
    if (noteName === null) return; // 用户取消

    const finalName = noteName.trim() || '新笔记';
    
    // 保存当前笔记
    const currentNote = window.noteManager_7ree.getCurrentNote();
    if (currentNote && window.currentEditor) {
        const content = window.currentEditor.getValue();
        if (currentNote.isEncrypted) {
            window.encryptedNoteCache[currentNote.id] = content;
        }
        await window.noteManager_7ree.updateNoteContent(currentNote.id, content);
    }

    // 创建新笔记
    const newNote = await window.noteManager_7ree.createNote(finalName);
    
    // 切换到新笔记
    await window.noteManager_7ree.switchNote(newNote.id);
    await loadCurrentNote();

    showNotification_7ree(`已创建笔记: ${finalName}`);
}

// 打开笔记设置
function openNoteSettings() {
    if (!window.noteManager_7ree) return;

    const note = window.noteManager_7ree.getCurrentNote();
    if (!note) return;

    // 填充表单
    document.getElementById('note-name').value = note.name;
    document.getElementById('note-language').value = note.language || 'plaintext';
    document.getElementById('note-font-size').value = note.fontSize || 14;
    document.getElementById('note-line-height').value = note.lineHeight || 26;
    document.getElementById('note-encrypted').checked = note.isEncrypted;
    document.getElementById('encryption-password-container').style.display = note.isEncrypted ? 'block' : 'none';

    // 清除密码输入
    document.getElementById('note-password').value = '';
    document.getElementById('note-password-confirm').value = '';

    // 显示对话框
    document.getElementById('note-settings-dialog').style.display = 'flex';
}

// 关闭笔记设置
function closeNoteSettings() {
    document.getElementById('note-settings-dialog').style.display = 'none';
}

// 保存笔记设置
async function saveNoteSettings() {
    if (!window.noteManager_7ree) return;

    const note = window.noteManager_7ree.getCurrentNote();
    if (!note) return;

    const name = document.getElementById('note-name').value.trim();
    const language = document.getElementById('note-language').value;
    const fontSize = parseInt(document.getElementById('note-font-size').value);
    const lineHeight = parseInt(document.getElementById('note-line-height').value);
    const isEncrypted = document.getElementById('note-encrypted').checked;

    // 验证
    if (!name) {
        showNotification_7ree('请输入笔记名称', 'error');
        return;
    }

    // 处理加密
    if (isEncrypted !== note.isEncrypted) {
        if (isEncrypted) {
            // 开启加密
            const password = document.getElementById('note-password').value;
            const passwordConfirm = document.getElementById('note-password-confirm').value;

            if (!password) {
                showNotification_7ree('请输入密码', 'error');
                return;
            }

            if (password !== passwordConfirm) {
                showNotification_7ree('两次输入的密码不一致', 'error');
                return;
            }

            // 加密内容
            const currentContent = window.currentEditor ? window.currentEditor.getValue() : note.content;
            const encryptedPackage = await window.encryptionManager_7ree.createEncryptedNote(currentContent, password);

            // 更新笔记
            note.isEncrypted = true;
            note.encryptedPackage = encryptedPackage;
            note.content = JSON.stringify(encryptedPackage);
            
            // 缓存解密内容
            window.encryptedNoteCache[note.id] = currentContent;

        } else {
            // 关闭加密 - 需要确认
            showConfirmDialog('确定要关闭加密吗？笔记内容将变为未加密状态。', async () => {
                // 获取解密后的内容
                const decryptedContent = window.encryptedNoteCache[note.id];
                if (decryptedContent !== undefined) {
                    note.isEncrypted = false;
                    note.content = decryptedContent;
                    delete note.encryptedPackage;
                    delete window.encryptedNoteCache[note.id];
                }
            });
        }
    }

    // 更新其他设置
    note.name = name;
    note.language = language;
    note.fontSize = fontSize;
    note.lineHeight = lineHeight;
    note.updatedAt = Date.now();

    // 保存
    await window.noteManager_7ree.saveNotesList();

    // 更新编辑器
    if (window.currentEditor) {
        const options = {
            fontSize: fontSize,
            lineHeight: lineHeight
        };
        window.currentEditor.updateOptions(options);

        // 更新语言
        monaco.editor.setModelLanguage(window.currentEditor.getModel(), language);
    }

    // 更新UI
    document.getElementById('current-note-name').textContent = name;
    renderNotesList();

    // 更新锁图标
    const lockIcon = document.getElementById('lock-icon');
    if (note.isEncrypted) {
        lockIcon.classList.add('locked');
        lockIcon.classList.remove('unlocked');
        lockIcon.title = '已加密';
    } else {
        lockIcon.classList.remove('locked');
        lockIcon.classList.add('unlocked');
        lockIcon.title = '未加密';
    }

    closeNoteSettings();
    showNotification_7ree('设置已保存');
}

// 删除当前笔记
async function deleteCurrentNote() {
    if (!window.noteManager_7ree) return;

    const note = window.noteManager_7ree.getCurrentNote();
    if (!note) return;

    // 不能删除最后一个笔记
    const notes = window.noteManager_7ree.getNotesList();
    if (notes.length <= 1) {
        showNotification_7ree('不能删除最后一个笔记', 'error');
        return;
    }

    showConfirmDialog(`确定要删除笔记 "${note.name}" 吗？此操作不可恢复！`, async () => {
        closeNoteSettings();
        
        // 清除缓存
        delete window.encryptedNoteCache[note.id];
        
        // 删除笔记
        await window.noteManager_7ree.deleteNote(note.id);
        
        // 加载新笔记
        await loadCurrentNote();

        showNotification_7ree('笔记已删除');
    });
}

// 打开全局设置
async function openGlobalSettings() {
    // 加载当前设置
    const result = await chrome.storage.local.get([
        'sidebar_noter_theme',
        'sidebar_noter_auto_save_interval',
        'sidebar_noter_default_language',
        'sidebar_noter_default_font_size',
        'sidebar_noter_default_line_height',
        'sidebar_noter_show_line_numbers',
        'sidebar_noter_show_minimap',
        'sidebar_noter_backup_count',
        'sidebar_noter_exchange_url',
        'sidebar_noter_clipboard_url',
        'sidebar_noter_tab1_name',
        'sidebar_noter_tab2_name'
    ]);

    // 设置主题开关
    const isDarkTheme = result.sidebar_noter_theme === 'dark';
    document.getElementById('global-theme-switch').checked = isDarkTheme;

    // 设置自动保存
    const autoSaveInterval = result.sidebar_noter_auto_save_interval || 3;
    document.getElementById('auto-save-slider').value = autoSaveInterval;
    document.getElementById('auto-save-value').textContent = `${autoSaveInterval} 秒`;

    // 设置编辑器默认值
    if (result.sidebar_noter_default_language) {
        document.getElementById('default-language').value = result.sidebar_noter_default_language;
    }
    if (result.sidebar_noter_default_font_size) {
        document.getElementById('default-font-size').value = result.sidebar_noter_default_font_size;
    }
    if (result.sidebar_noter_default_line_height) {
        document.getElementById('default-line-height').value = result.sidebar_noter_default_line_height;
    }
    document.getElementById('show-line-numbers').checked = result.sidebar_noter_show_line_numbers !== false;
    document.getElementById('show-minimap').checked = result.sidebar_noter_show_minimap === true;

    // 设置备份数量
    if (result.sidebar_noter_backup_count) {
        document.getElementById('backup-count').value = result.sidebar_noter_backup_count;
    }

    // 设置高级选项
    document.getElementById('tab1-name').value = result.sidebar_noter_tab1_name || '文本中转站';
    document.getElementById('tab2-name').value = result.sidebar_noter_tab2_name || '云剪贴板';
    document.getElementById('exchange-url').value = result.sidebar_noter_exchange_url || '';
    document.getElementById('clipboard-url').value = result.sidebar_noter_clipboard_url || '';

    // 显示对话框
    document.getElementById('global-settings-dialog').style.display = 'flex';
}

// 关闭全局设置
function closeGlobalSettings() {
    document.getElementById('global-settings-dialog').style.display = 'none';
}

// 切换设置标签
function switchSettingsTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.settings_tab_btn_7ree').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.settingsTab === tabName);
    });

    // 显示/隐藏内容
    document.querySelectorAll('.settings_tab_content_7ree').forEach(content => {
        content.style.display = content.id === `settings-tab-${tabName}` ? 'block' : 'none';
    });
}

// 保存全局设置
async function saveGlobalSettings() {
    const isDarkTheme = document.getElementById('global-theme-switch').checked;
    const autoSaveInterval = parseInt(document.getElementById('auto-save-slider').value);
    const defaultLanguage = document.getElementById('default-language').value;
    const defaultFontSize = parseInt(document.getElementById('default-font-size').value);
    const defaultLineHeight = parseInt(document.getElementById('default-line-height').value);
    const showLineNumbers = document.getElementById('show-line-numbers').checked;
    const showMinimap = document.getElementById('show-minimap').checked;
    const backupCount = parseInt(document.getElementById('backup-count').value);
    const tab1Name = document.getElementById('tab1-name').value.trim();
    const tab2Name = document.getElementById('tab2-name').value.trim();
    const exchangeUrl = document.getElementById('exchange-url').value.trim();
    const clipboardUrl = document.getElementById('clipboard-url').value.trim();

    // 保存到存储
    await chrome.storage.local.set({
        'sidebar_noter_theme': isDarkTheme ? 'dark' : 'light',
        'sidebar_noter_auto_save_interval': autoSaveInterval,
        'sidebar_noter_default_language': defaultLanguage,
        'sidebar_noter_default_font_size': defaultFontSize,
        'sidebar_noter_default_line_height': defaultLineHeight,
        'sidebar_noter_show_line_numbers': showLineNumbers,
        'sidebar_noter_show_minimap': showMinimap,
        'sidebar_noter_backup_count': backupCount,
        'sidebar_noter_tab1_name': tab1Name || '文本中转站',
        'sidebar_noter_tab2_name': tab2Name || '云剪贴板',
        'sidebar_noter_exchange_url': exchangeUrl,
        'sidebar_noter_clipboard_url': clipboardUrl
    });

    // 应用设置
    if (storageManager_7ree) {
        storageManager_7ree.setAutoSaveInterval(autoSaveInterval);
        storageManager_7ree.backupCount = backupCount;
    }

    // 应用主题
    if (isDarkTheme) {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
    }

    // 更新编辑器主题
    if (window.currentEditor) {
        monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');
    }

    // 更新标签名称
    if (window.statusbarManager_7ree && typeof window.statusbarManager_7ree.updateTabNames === 'function') {
        window.statusbarManager_7ree.updateTabNames(tab1Name, tab2Name);
    }

    closeGlobalSettings();
    showNotification_7ree('设置已保存');
}

// 手动保存
async function handleManualSave() {
    if (!window.currentEditor || !window.noteManager_7ree) return;

    const note = window.noteManager_7ree.getCurrentNote();
    if (!note) return;

    const content = window.currentEditor.getValue();

    // 处理加密笔记
    if (note.isEncrypted) {
        // 保存到缓存
        window.encryptedNoteCache[note.id] = content;
        
        // 重新加密
        const password = await promptForPassword('请输入密码以保存加密笔记');
        if (password) {
            try {
                const encryptedPackage = await window.encryptionManager_7ree.createEncryptedNote(content, password);
                note.encryptedPackage = encryptedPackage;
                note.content = JSON.stringify(encryptedPackage);
                note.updatedAt = Date.now();
                await window.noteManager_7ree.saveNotesList();
            } catch (error) {
                showNotification_7ree('保存失败: ' + error.message, 'error');
                return;
            }
        }
    } else {
        await window.noteManager_7ree.updateNoteContent(note.id, content);
    }

    if (storageManager_7ree) {
        storageManager_7ree.lastSaveTime = new Date();
        storageManager_7ree.updateLastSaveTime();
    }

    showNotification_7ree('已保存');
}

// 提示输入密码
function promptForPassword(message) {
    return new Promise((resolve) => {
        const password = prompt(message);
        resolve(password);
    });
}

// 导出所有数据
async function exportAllData() {
    if (!storageManager_7ree) return;

    const exportData = await storageManager_7ree.exportAllData();
    if (!exportData) {
        showNotification_7ree('导出失败', 'error');
        return;
    }

    // 创建下载
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrome-sidebar-noter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification_7ree('数据已导出');
}

// 处理导入数据
async function handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importData = JSON.parse(event.target.result);
            
            showConfirmDialog('确定要导入数据吗？这将覆盖当前所有数据。', async () => {
                if (!storageManager_7ree) return;
                
                const result = await storageManager_7ree.importAllData(importData);
                
                if (result.success) {
                    // 重新初始化
                    if (window.noteManager_7ree) {
                        window.noteManager_7ree.isInitialized = false;
                        await window.noteManager_7ree.init();
                    }
                    await loadCurrentNote();
                    showNotification_7ree('数据已导入');
                } else {
                    showNotification_7ree('导入失败: ' + result.error, 'error');
                }
            });
        } catch (error) {
            showNotification_7ree('无效的备份文件', 'error');
        }
    };
    reader.readAsText(file);

    // 清除文件输入
    e.target.value = '';
}

// 显示确认对话框
function showConfirmDialog(message, onConfirm) {
    const dialog = document.getElementById('confirm-dialog');
    const messageEl = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    messageEl.textContent = message;
    dialog.style.display = 'flex';

    const handleConfirm = () => {
        dialog.style.display = 'none';
        cleanup();
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        dialog.style.display = 'none';
        cleanup();
    };

    const cleanup = () => {
        yesBtn.removeEventListener('click', handleConfirm);
        noBtn.removeEventListener('click', handleCancel);
    };

    yesBtn.addEventListener('click', handleConfirm);
    noBtn.addEventListener('click', handleCancel);

    // 点击背景取消
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            handleCancel();
        }
    }, { once: true });
}

// 转义HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSidebar_7ree);
