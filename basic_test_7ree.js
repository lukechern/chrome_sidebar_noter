/**
语言包定义

    'pl_basic_test_7r' => '基础功能测试',
    'pl_monaco_loaded_7r' => 'Monaco编辑器已加载',
    'pl_monaco_not_loaded_7r' => 'Monaco编辑器未加载',
**/

// 基础功能测试
function basicTest_7ree() {
    console.log(langJS_7ree.pl_basic_test_7r);
    
    // 检查基本环境
    console.log('Chrome扩展API:', typeof chrome !== 'undefined' ? '可用' : '不可用');
    console.log('Require.js:', typeof require !== 'undefined' ? '可用' : '不可用');
    console.log('MonacoEnvironment:', typeof window.MonacoEnvironment !== 'undefined' ? '已定义' : '未定义');
    
    // 监听Monaco加载完成事件
    window.addEventListener('monaco-loaded', function() {
        console.log(langJS_7ree.pl_monaco_loaded_7r);
        
        // 检查Monaco对象
        if (typeof window.monaco !== 'undefined') {
            console.log('Monaco对象可用');
            console.log('Monaco版本:', window.monaco.version);
        } else {
            console.error(langJS_7ree.pl_monaco_not_loaded_7r);
        }
    });
    
    // 5秒后检查Monaco是否加载
    setTimeout(function() {
        if (typeof window.monaco === 'undefined') {
            console.warn('Monaco编辑器可能未正确加载');
        }
    }, 5000);
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', basicTest_7ree);
} else {
    basicTest_7ree();
} 