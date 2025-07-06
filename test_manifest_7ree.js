/**
语言包定义

    'pl_test_manifest_7r' => '测试Manifest配置',
    'pl_manifest_valid_7r' => 'Manifest配置有效',
    'pl_manifest_invalid_7r' => 'Manifest配置无效',
**/

// 测试Manifest配置
function testManifestConfig_7ree() {
    console.log(langJS_7ree.pl_test_manifest_7r);
    
    // 检查扩展是否正常加载
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('Chrome扩展API可用');
        
        // 检查Monaco文件是否可访问
        const monacoUrl = chrome.runtime.getURL('lib/monaco-editor-0.52.2/min/vs/editor/editor.main.js');
        console.log('Monaco URL:', monacoUrl);
        
        // 测试文件访问
        fetch(monacoUrl)
            .then(response => {
                if (response.ok) {
                    console.log(langJS_7ree.pl_manifest_valid_7r + ': Monaco文件可访问');
                } else {
                    console.error(langJS_7ree.pl_manifest_invalid_7r + ': Monaco文件不可访问');
                }
            })
            .catch(error => {
                console.error(langJS_7ree.pl_manifest_invalid_7r + ':', error);
            });
    } else {
        console.error('Chrome扩展API不可用');
    }
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testManifestConfig_7ree);
} else {
    testManifestConfig_7ree();
} 