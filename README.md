# 📝 Chrome侧边栏记事本 v2.0

> 一个让你在浏览器中优雅记事的Chrome扩展，告别临时记事本的混乱时代！ 🎉

## ✨ 功能特色

### 🖊️ 智能记事功能
- **Monaco编辑器**：基于VS Code的编辑器，支持语法高亮
- **自动保存**：再也不用担心忘记保存，3-60秒自动保存间隔可调
- **状态恢复**：记住你的滚动位置和选择状态，下次打开继续编辑
- **主题切换**：明亮/暗黑主题，护眼又美观

### 🔄 文本中转站
- **自定义网址**：可配置的文本中转站，指向自定义网址
- **无缝切换**：在记事本和中转站之间自由切换
- **独立显示**：中转站模式下隐藏状态栏，专注内容

### 🎨 界面设计
- **紧凑布局**：顶部标签栏 + 编辑器 + 底部状态栏，空间利用最大化
- **响应式设计**：适配不同屏幕尺寸
- **现代化UI**：圆角、阴影、过渡动画，细节满满

### ⚙️ 个性化设置
- **滑块控制**：用滑块调整自动保存时间，比下拉框更直观
- **实时预览**：设置更改即时生效，无需重启
- **配置持久化**：所有设置自动保存，下次打开依然有效

## 🚀 安装说明

### 方法一：开发者模式安装（推荐）
1. 下载项目文件到本地
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式" 🔧
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹，完成安装！

### 方法二：打包安装
1. 在开发者模式下点击"打包扩展程序"
2. 选择项目文件夹，生成 `.crx` 文件
3. 将 `.crx` 文件拖拽到扩展页面安装

## 📖 使用说明

### 基本操作
1. **打开记事本**：点击浏览器工具栏中的扩展图标
2. **切换标签**：点击顶部的"浏览器记事"或"文本中转站"
3. **手动保存**：点击右下角的💾图标或使用 `Ctrl+S` 快捷键
4. **打开设置**：点击右下角的⚙️图标

### 高级功能
- **自动保存**：内容会自动保存到本地存储，无需担心丢失
- **主题切换**：在设置中切换明亮/暗黑主题
- **时间间隔**：用滑块调整自动保存频率（3-60秒）
- **网址配置**：自定义文本中转站的网址

### 快捷键
- `Ctrl+S`：手动保存内容
- 标签切换：鼠标点击即可

## 🛠️ 技术架构

### 核心技术
- **Monaco Editor**：强大的代码编辑器
- **Chrome Extension API**：本地存储和扩展管理
- **原生JavaScript**：无框架依赖，轻量高效


## 🎯 版本历史

### v2.0 (当前版本)
- ✨ 新增文本中转站功能
- 🎨 优化界面设计和主题系统
- ⚙️ 改进设置界面，使用滑块控制
- 🐛 修复自动保存和滚动位置问题
- 📱 优化响应式布局

### v1.0
- 🎉 基础记事本功能
- 💾 自动保存机制
- 🎨 主题切换功能

## 🤝 贡献指南

欢迎提交Issue和Pull Request！🎊



## 📄 许可证

本项目采用 [MIT许可证](LICENSE) 📜

```
MIT License

Copyright (c) 2024 Chrome侧边栏记事本

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 致谢

- **Monaco Editor**：感谢微软提供的优秀编辑器
- **Chrome Extension API**：感谢Google的扩展平台
- **所有贡献者**：感谢每一位为项目做出贡献的朋友

## 📞 联系方式

- 💡 GitHub：https://github.com/lukechern/chrome_sidebar_noter


---

**⭐ 如果这个扩展对你有帮助，请给个Star支持一下！** ⭐

*让记事变得简单，让生活更加美好！* 🌟 