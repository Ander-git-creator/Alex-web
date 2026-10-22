# XIAOFENG Portfolio

React + Vite + OGL，PC 优先。首页保持宽屏，下方四个模块采用 68% 居中版心（最大 1360px），并包含手机适配。

## 运行

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

也可以使用 npm install / npm run dev / npm run build。

## 替换入口

所有文案与素材映射在 `src/data/portfolio.js`。

- `profile`：姓名、介绍、联系方式、项目数字、头像。
- `profile.hero.videos`：首屏视频顺序播放列表；当前第一个视频播放一次后切到第二个视频，第二个视频持续循环。刷新页面后从第一个视频重新开始。
- `artwork`：作品素材。替换为 `{ src: '/assets/your-image.jpg' }`，删除 `crop` 和 `sourceSize` 即可使用完整图片。
- `projects`：项目大卡片、描述与详情图片。
- `career`、`strengths`：工作经历与个人优势。
- 真实联系方式填入后，将 `profile.contactReady` 改成 `true`，可点击复制。

当前经历、数字、公司、联系方式是按参考图填充的示例信息，不代表真实履历。参考作品与头像来自用户截图，使用 SVG 视口及画廊纹理显示局部画面，原图完整保留。后续替换高清作品原图即可提升清晰度。联系区未生成虚假二维码。

## 组件

`Navigation` / `Hero` / `CircularGallery` / `About` / `Works` / `Strengths` / `Contact` 独立拆分。

CircularGallery 使用用户提供的新版 React Bits JavaScript + CSS 源码，通过 WebGL 2 渲染。首页参数为 `bend={2.5}`、`itemSize={0.4}`、`fadeEdges={0.3}`、`autoScroll={2}`，隐藏标题。卡片默认不透明，悬停上浮；点击卡片在画廊内展开，支持再次点击、关闭按钮和 Escape 关闭。悬停、拖动及展开时暂停自动滚动，支持滚轮和键盘浏览；离开可视区域或切换后台时暂停渲染。`public/assets/hero-gallery/` 保存首页画廊图片；当前使用用户提供的“D:\web\首屏轮播”文件夹中的 7 张原图，顺序由 `galleryItems` 控制。

首页视频支持暂停，尊重系统减少动态效果设置。项目卡片打开原生 dialog，支持 Escape 关闭与焦点恢复。

## 素材

首屏动画使用 `profile.hero.videos` 中的两个 MP4 文件。

全站字体在 `public/fonts/`：英文使用 Krona One Regular，两处 xiaoF 标志文字使用 Rany Medium，中文统一使用 HarmonyOS Sans SC Regular（鸿蒙黑体 Regular）。中英混排由浏览器按字符自动选择字体。

本版本用于本地预览，尚未部署。

