/**
语言包定义

    'pl_monaco_loading_error_7r' => 'Monaco编辑器加载错误',
    'pl_web_worker_fallback_7r' => 'Web Worker创建失败，回退到主线程',
**/

// 定义 Monaco 环境配置 - 完全禁用Web Worker以避免Chrome扩展问题
self.MonacoEnvironment = {
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
        
        console.log('Monaco Editor loaded successfully');
    } catch (e) {
        console.error(langJS_7ree.pl_monaco_loading_error_7r + ':', e);
    }
});