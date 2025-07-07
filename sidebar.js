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
    'pl_settings_exchange_url_7r' => '文本中转站网址',
    'pl_settings_save_7r' => '保存设置',
    'pl_settings_cancel_7r' => '取消',
    'pl_manual_save_success_7r' => '手动保存成功',
    'pl_settings_saved_7r' => '设置已保存',
    'pl_file_save_success_7r' => '文件保存成功',
    'pl_file_save_error_7r' => '文件保存失败',
    'pl_file_read_success_7r' => '文件读取成功',
    'pl_file_read_error_7r' => '文件读取失败',
    'pl_file_not_found_7r' => '文件不存在',
    'pl_tab_noter_7r' => '浏览器记事',
    'pl_tab_exchange_7r' => '文本中转站',
**/

// 主初始化函数
async function initSidebar_7ree() {
    try {
        // 确保全局实例存在
        if (typeof storageManager_7ree === 'undefined') {
            console.error("storageManager_7ree is not initialized globally.");
            return;
        }

        if (typeof window.statusbarManager_7ree === 'undefined') {
            console.error("StatusbarManager_7ree is not initialized globally.");
            return;
        }

        if (typeof window.tabsManager_7ree === 'undefined') {
            console.error("TabsManager_7ree is not initialized globally.");
            return;
        }

        // 从全局获取实例
        const storageManager = storageManager_7ree;
        const statusbarManager = window.statusbarManager_7ree;
        const tabsManager = window.tabsManager_7ree;
        
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
                        editor.setScrollPosition(data.scrollPosition);
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