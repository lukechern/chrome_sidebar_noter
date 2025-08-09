# 📝 Chrome侧边栏记事本 v3.0

![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue)
![GitHub release (latest by date)](https://img.shields.io/badge/version-v3.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![GitHub](https://img.shields.io/github/license/lukechern/chrome_sidebar_noter)

[English](#english-version) | [中文](#-chrome侧边栏记事本-v30)

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

### v3.0 (当前版本)
- 🎨 再次优化界面设计和配置卡片UI



### v2.0 
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



## 免责声明

本项目为个人兴趣开发，为爱分享，仅供学习交流使用。作者不对使用本项目产生的任何后果承担责任。

## 🙏 致谢

- **Monaco Editor**：感谢微软提供的优秀编辑器
- **Chrome Extension API**：感谢Google的扩展平台
- **所有贡献者**：感谢每一位为项目做出贡献的朋友

## 📞 联系方式

- 💡 GitHub：https://github.com/lukechern/chrome_sidebar_noter


---

**⭐ 如果这个扩展对你有帮助，请给个Star支持一下！** ⭐

*让记事变得简单，让生活更加美好！* 🌟

---

## English Version

# 📝 Chrome Sidebar Noter v3.0

> An elegant note-taking Chrome extension that helps you告别 temporary notepads and混乱的时代！ 🎉

## ✨ Key Features

### 🖊️ Smart Note-Taking Features
- **Monaco Editor**: Based on VS Code's editor with syntax highlighting
- **Auto Save**: Never worry about forgetting to save again, with adjustable auto-save intervals from 3-60 seconds
- **State Restoration**: Remember your scroll position and selection state, continue editing when you open it next time
- **Theme Switching**: Bright/Dark themes for eye comfort and aesthetics

### 🔄 Text Transfer Station
- **Custom URL**: Configurable text transfer station pointing to a custom URL
- **Seamless Switching**: Free switching between notepad and transfer station
- **Independent Display**: Hide the status bar in transfer station mode for focused content

### 🎨 Interface Design
- **Compact Layout**: Top tab bar + editor + bottom status bar for maximum space utilization
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Rounded corners, shadows, transition animations, full of details

### ⚙️ Personalization Settings
- **Slider Control**: Use a slider to adjust auto-save time, more intuitive than a dropdown
- **Real-time Preview**: Settings changes take effect immediately without restarting
- **Configuration Persistence**: All settings are automatically saved and remain effective when you open it next time

## 🚀 Installation Instructions

### Method 1: Developer Mode Installation (Recommended)
1. Download the project files to your local machine
2. Open Chrome browser and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner 🔧
4. Click "Load unpacked extension"
5. Select the project folder to complete the installation!

### Method 2: Packaged Installation
1. Click "Pack extension" in developer mode
2. Select the project folder to generate a `.crx` file
3. Drag the `.crx` file to the extensions page to install

## 📖 Usage Instructions

### Basic Operations
1. **Open Notepad**: Click the extension icon in the browser toolbar
2. **Switch Tabs**: Click "Browser Notes" or "Text Transfer Station" at the top
3. **Manual Save**: Click the 💾 icon in the bottom right corner or use the `Ctrl+S` shortcut
4. **Open Settings**: Click the ⚙️ icon in the bottom right corner

### Advanced Features
- **Auto Save**: Content is automatically saved to local storage, no need to worry about loss
- **Theme Switching**: Switch between bright/dark themes in settings
- **Time Interval**: Use a slider to adjust auto-save frequency (3-60 seconds)
- **URL Configuration**: Customize the URL of the text transfer station

### Shortcuts
- `Ctrl+S`: Manually save content
- Tab switching: Click with mouse

## 🛠️ Technical Architecture

### Core Technologies
- **Monaco Editor**: Powerful code editor
- **Chrome Extension API**: Local storage and extension management
- **Native JavaScript**: No framework dependencies, lightweight and efficient

## 🎯 Version History

### v3.0 (Current Version)
- 🎨 Optimized interface design and configuration card UI again

### v2.0
- ✨ Added text transfer station feature
- 🎨 Optimized interface design and theme system
- ⚙️ Improved settings interface with slider control
- 🐛 Fixed auto-save and scroll position issues
- 📱 Optimized responsive layout

### v1.0
- 🎉 Basic notepad functionality
- 💾 Auto-save mechanism
- 🎨 Theme switching feature

## 🤝 Contribution Guidelines

Welcome to submit Issues and Pull Requests! 🎊

## Disclaimer

This project is developed out of personal interest and love for sharing, for learning and exchange purposes only. The author assumes no responsibility for any consequences arising from the use of this project.

## 📄 License

This project uses the [MIT License](LICENSE) 📜



## 🙏 Acknowledgements

- **Monaco Editor**: Thanks to Microsoft for providing an excellent editor
- **Chrome Extension API**: Thanks to Google's extension platform
- **All Contributors**: Thanks to everyone who has contributed to the project

## 📞 Contact

- 💡 GitHub: https://github.com/lukechern/chrome_sidebar_noter

---

**⭐ If this extension is helpful to you, please give it a Star for support!** ⭐

*Make note-taking simple and life better!* 🌟

