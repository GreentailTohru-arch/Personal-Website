# Ren Kobayashi 个人网站

这是从初版单文件 `A.html` 拆分后的静态个人网站。页面采用单页多视图导航：首页、关于、项目、联系方式和摄影通过菜单切换，不再以一条长页面连续滚动展示。

## 文件结构

```text
Personal-Website/
├── A.html              # 页面结构与内容
├── css/
│   ├── styles.css      # 原 A.html 中的全部样式
│   ├── glass-surface.css # 联系方式与游戏 ID 胶囊玻璃效果
│   └── pill-nav.css    # React Bits PillNav 样式
├── js/
│   ├── main.js         # 页面交互脚本
│   ├── glass-surface.js # GlassSurface 原生适配
│   └── color-bends.js  # Three.js 背景模块
├── assets/
│   ├── logo.svg        # PillNav 导航标识
│   ├── favicon.png     # 浏览器兼容用圆角网页标签图标
│   └── ren-favicon.png # 网页标签图标原图
├── package.json        # PillNav registry 依赖
├── pnpm-lock.yaml
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
- 修改联系方式与游戏 ID 胶囊玻璃效果：`css/glass-surface.css`、`js/glass-surface.js`
- 修改 PillNav 样式：`css/pill-nav.css`
- 修改交互逻辑：`js/main.js`
- 修改流体渐变背景：`js/color-bends.js`
- 页面切换通过 URL hash 管理，例如 `#about`、`#projects`、`#contact`、`#photo`
- 五个页面通过顶部 PillNav 菜单或 URL hash 切换：首页、关于、项目、联系方式和摄影不会随滚轮或触摸滑动自动切换。
- 页面内容可使用浏览器原生滚动浏览；页面切换仍使用带回弹的平滑动画。
- 项目页每页最多显示 5 条，超出内容通过底部箭头按钮分页查看。
- 项目分页切换时，卡片会按照顺序逐条淡入并带轻微回弹。
- 页面分组：关于页包含 About，项目页包含 Posts，联系方式页下方包含 Play，摄影页下方包含 Digital 与 Final 文案。
- PillNav 使用 React Bits JS-CSS registry 的交互效果，已适配为原生 HTML/CSS/JS。
- 联系方式页和 Play 页的复制胶囊使用 React Bits GlassSurface JS-CSS registry 效果；点击复制逻辑保持不变。
- 首页背景使用 `assets/Fixed_static_camera_locked_tr.mp4`；首页播放，切换到其他页面时暂停并隐藏。
- 外部库通过 CDN 加载，项目无需构建工具即可运行。
