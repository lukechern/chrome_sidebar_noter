/**
语言包定义

    'pl_test_monaco_7r' => '测试Monaco编辑器配置',
    'pl_test_success_7r' => '测试成功',
    'pl_test_failed_7r' => '测试失败',
**/

// 测试Monaco Editor配置
function testMonacoConfig_7ree() {
    console.log(langJS_7ree.pl_test_monaco_7r);
    
    // 检查Monaco环境配置
    if (typeof window.MonacoEnvironment !== 'undefined') {
        console.log('MonacoEnvironment 配置正确');
    } else {
        console.error('MonacoEnvironment 未定义');
        return false;
    }
    
    // 检查require配置
    if (typeof require !== 'undefined' && require.config) {
        console.log('Require.js 配置正确');
    } else {
        console.error('Require.js 未正确加载');
        return false;
    }
    
    // 检查语言包
    if (typeof window.langJS_7ree !== 'undefined') {
        console.log('语言包加载正确');
    } else {
        console.error('语言包未加载');
        return false;
    }
    
    console.log(langJS_7ree.pl_test_success_7r);
    return true;
}

// 延迟执行测试，确保所有脚本都已加载
setTimeout(testMonacoConfig_7ree, 100); 