/**
语言包定义

    'pl_simple_monaco_7r' => '简化Monaco加载器',
    'pl_monaco_ready_7r' => 'Monaco编辑器准备就绪',
**/

// 简化版Monaco加载器
function loadMonacoSimple_7ree() {
    console.log(langJS_7ree.pl_simple_monaco_7r);
    
    // 定义Monaco环境 - 完全禁用Web Worker
    window.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            // 返回null来完全禁用Web Worker
            return null;
        },
        // 完全禁用Worker创建
        createWorker: function (moduleId, label) {
            // 返回一个空的Worker对象，避免错误
            return {
                postMessage: function() {},
                addEventListener: function() {},
                removeEventListener: function() {},
                terminate: function() {}
            };
        }
    };
    
    // 配置require.js
    require.config({
        paths: {
            'vs': chrome.runtime.getURL('lib/monaco-editor-0.52.2/min/vs')
        }
    });
    
    // 使用require.js加载Monaco Editor
    require(['vs/editor/editor.main'], function() {
        try {
            console.log('Monaco script loaded via require.js');
            
            // 配置编辑器选项以优化性能
            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
            
            // 禁用所有可能导致性能问题的功能
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true,
                noSuggestionDiagnostics: true
            });
            
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true,
                noSuggestionDiagnostics: true
            });

            // 暴露到全局并通知加载完成
            window.monaco = monaco;
            window.dispatchEvent(new Event('monaco-loaded'));
            
            console.log(langJS_7ree.pl_monaco_ready_7r);
        } catch (e) {
            console.error('Monaco configuration error:', e);
        }
    });
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMonacoSimple_7ree);
} else {
    loadMonacoSimple_7ree();
} 