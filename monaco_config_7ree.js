/**
语言包定义

    'pl_monaco_config_7r' => 'Monaco配置',
    'pl_worker_disabled_7r' => 'Web Worker已禁用',
**/

// Monaco Editor配置 - 专门针对Chrome扩展优化
function configureMonaco_7ree() {
    console.log(langJS_7ree.pl_monaco_config_7r);
    
    if (typeof monaco === 'undefined') {
        console.warn('Monaco对象未定义，跳过配置');
        return;
    }
    
    try {
        // 禁用TypeScript/JavaScript的语义验证
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
        
        // 设置急切模型同步
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        
        // 禁用编译器选项
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            allowNonTsExtensions: true,
            allowJs: true,
            noLib: true
        });
        
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowNonTsExtensions: true,
            allowJs: true,
            noLib: true
        });
        
        // 禁用额外的库
        monaco.languages.typescript.javascriptDefaults.setExtraLibs([]);
        monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
        
        // 禁用所有语言服务
        monaco.languages.register({ id: 'plaintext' });
        
        // 禁用主题相关功能
        monaco.editor.defineTheme('vs', {
            base: 'vs',
            inherit: false,
            rules: [],
            colors: {}
        });
        
        // 禁用语法高亮
        monaco.languages.setMonarchTokensProvider('plaintext', {
            tokenizer: {
                root: []
            }
        });
        
        console.log(langJS_7ree.pl_worker_disabled_7r);
        
    } catch (e) {
        console.error('Monaco配置错误:', e);
    }
}

// 监听Monaco加载完成事件
window.addEventListener('monaco-loaded', configureMonaco_7ree);

// 如果Monaco已经加载，立即配置
if (typeof monaco !== 'undefined') {
    configureMonaco_7ree();
} 