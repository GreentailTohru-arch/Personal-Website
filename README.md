# Ren Kobayashi 个人网站

这是从初版单文件 `A.html` 拆分后的静态个人网站。拆分只调整文件组织，不改变页面内容、样式和交互逻辑。

## 文件结构

```text
Personal-Website/
├── A.html              # 页面结构与内容
├── css/
│   └── styles.css      # 原 A.html 中的全部样式
├── js/
│   ├── main.js         # 页面交互脚本
│   └── color-bends.js  # Three.js 背景模块
├── .gitignore
└── README.md
```

## 本地运行

由于页面使用 ES Module 加载 Three.js，建议通过本地静态服务器打开：

```bash
python -m http.server 8000
```

然后访问 <http://localhost:8000/A.html>。

## 开发说明

- 修改页面结构和文案：`A.html`
- 修改视觉样式：`css/styles.css`
- 修改交互逻辑：`js/main.js`
- 修改流体渐变背景：`js/color-bends.js`
- 外部库通过 CDN 加载，项目无需构建工具即可运行。
