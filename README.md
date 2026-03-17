# AI 快速提问助手 (浏览器扩展插件)

一款简洁美观的浏览器扩展，支持一键在多个 AI 工具中批量查询，提升信息获取效率。

## 功能特性

- **统一入口**：一个页面整合多个 AI 工具
- **批量查询**：一次输入，同时打开多个 AI 平台
- **自动填充**：自动将查询内容填充到各 AI 工具的输入框
- **标签页分组**：自动将打开的 AI 工具标签页分组管理
- **美观界面**：现代化设计，支持深色模式
- **历史记录**：本地存储查询历史，方便回顾
- **自定义选择**：灵活勾选需要的 AI 工具

## 支持的 AI 工具

| 工具名称 | 官网地址 |
|---------|----------|
| DeepSeek | https://chat.deepseek.com/ |
| 腾讯元宝 | https://yuanbao.tencent.com/chat/ |
| 豆包 | https://www.doubao.com/chat/ |
| Kimi | https://www.kimi.com/ |
| 千问 | https://www.qianwen.com/ |

## 安装方法

### Chrome / Edge 浏览器

1. 下载或克隆本项目到本地
2. 打开浏览器扩展管理页面：
   - Chrome: 访问 `chrome://extensions/`
   - Edge: 访问 `edge://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目所在的文件夹
6. 安装成功后，浏览器工具栏会出现插件图标

### Firefox 浏览器

1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件」
3. 选择项目中的 `manifest.json` 文件

## 使用方法

1. 点击浏览器工具栏中的插件图标
2. 在输入框中输入您想要查询的问题或关键词
3. 勾选需要使用的 AI 工具（可使用全选/全不选快捷操作）
4. 点击「开始批量查询」按钮或按 `Ctrl+Enter`
5. 插件会自动打开所选 AI 工具，并**自动将查询内容填充到输入框**
6. 直接点击各 AI 平台的发送按钮即可开始对话

## 快捷键

- `Ctrl + Enter` (Mac: `Cmd + Enter`): 开始查询

## 历史记录

- 点击右上角时钟图标查看历史查询记录
- 点击历史记录可快速填充查询内容
- 支持清空所有历史记录

## 技术栈

- Manifest V3
- HTML5 + CSS3 + Vanilla JavaScript
- IndexedDB 本地存储
- Content Scripts（自动填充功能）

## 文件结构

```
ai-batch-question-browser-extension/
├── manifest.json          # 扩展配置文件
├── popup.html             # 主页面
├── css/
│   └── popup.css          # 样式文件
├── js/
│   ├── content-scripts/   # 内容脚本（用于自动填充）
│   │   ├── deepseek.js    # DeepSeek 自动填充
│   │   ├── doubao.js      # 豆包自动填充
│   │   ├── kimi.js        # Kimi 自动填充
│   │   ├── qianwen.js     # 千问自动填充
│   │   └── yuanbao.js     # 腾讯元宝自动填充
│   ├── background.js      # 后台脚本
│   ├── config.js          # 配置文件
│   ├── popup.js           # 主逻辑
│   └── storage.js         # 存储模块
├── icons/
│   ├── icon16.png         # 16x16 图标
│   ├── icon48.png         # 48x48 图标
│   └── icon128.png        # 128x128 图标
└── README.md              # 说明文档
```

## 注意事项

- **使用前请确保已登录**：请确保您已经在各 AI 平台网站上登录过账号
- 部分网站可能有弹窗限制，请允许插件打开多个标签页
- 插件会自动将查询内容填充到各 AI 平台的输入框
- 历史记录保存在浏览器本地，不会上传到任何服务器

## 许可证

MIT License
