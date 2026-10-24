# 街角拼花 / Corner Mosaic

在虚构海边街角旋转、交换几何瓷砖。三张逐步复杂的委托不只要求边缘同色，还要让海蓝色路线连通海港与灯塔。自由模式可改釉色，导出自己的 SVG 拼花。

## 运行

需要 Node.js 18 或更新版本，不需要服务端、账号、API key 或第三方运行依赖。

```sh
npm ci
npm test
npm run build
npm start
# 默认 http://localhost:4173，PORT=4180 npm start 可改端口
```

每个项目独立运行，根仓库不作为 workspace。`package-lock.json` 锁定零依赖包信息。

## 核心玩法

- 点击一块选中，点另一块交换位置；左右转按钮旋转90度。编号是瓷砖身份，不是当前位置。
- 每条相邻边须同色。外框应为陶土色，指定海蓝出入口除外。红色短线表示冲突。
- 同色在单块砖内连通，不同色的交叉不连通。海港可达的砖标蓝点，显示实时可达范围。
- 全部边相合且海港→灯塔连通才能完成。可能存在其他有效布局，程序按约束判定，不按编号判定。
- 每步有相合边数和路线反馈；撤回最多200步，不限时间。可看选中砖的线索或原始可行图纸，但不自动解谜。
- 自由模式可改变任何一条边的釉色，仍显示结构反馈，不以通关为目标。SVG 导出当前布局，可用于继续创作。
- Tab / Enter / Space 可操作按钮；选砖后 R 右转、Q 左转、Esc 取消、Ctrl/⌘ Z 撤回。

## 数据与限制

只使用浏览器 localStorage 保存当前一局；切换委托或重新开工会重置当前局，不保存多局历史。无法访问本地存储时明确提示，仍可游玩。没有分析埋点、网络API和个人数据采集。所有图形是原创 SVG 几何绘制，无外部字体、图片或CDN。纯抽象路网，不模拟真实工程铺砖。

## 测试、构建与部署

`npm test` 使用 Node 自带测试运行器，覆盖旋转、交换、边匹配、连通、三关解法、撤回、无效操作、保存校验、SVG。真实浏览器测试应单独见 QA.md，不能把引擎测试当浏览器实测。

`npm run build` 将 index.html、style.css、src/ 复制至 dist/；部署任意静态主机即可。生产部署由协调任务通过 Sites 的源代码打包/发布工作流完成，部署身份不硬编码在源码。公网URL以仓库根 demos.json 中本项 deployment 为准。不要把未发布预期URL当上线状态。

原始代码与几何素材均 MIT，见 LICENSE。

## 公开体验与源码

- 在线体验：https://hakuya-corner-mosaic.golden-berry-3772.chatgpt.site
- 源码：https://github.com/SakurakoujiHakuya/daily-demos/tree/main/demos/corner-mosaic
- 测试边界与实际浏览器记录：[QA.md](QA.md)
