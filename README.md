# Daily Demos

一个持续生长的实验作品集：每个 demo 独立选型、独立运行、独立测试、按需部署。

这不是统一应用，也不是强制共享依赖的 workspace。根目录只负责导航与项目元信息，不提供全仓库的一键安装、启动或构建。

## 作品

| 日期 | Demo | 说明 | 运行与源码 |
| --- | --- | --- | --- |
| 2026-10-19 | 把今天折成一首诗 | 日常场景 × 心情 × 意象，原创诗句组合、编辑并导出 PNG | [README](demos/fold-a-day/README.md) |
| 2026-10-20 | 日常物证馆 | 为平凡物件写展签，私藏日常并导出展品海报 | [README](demos/ordinary-museum/README.md) |
| 2026-10-21 | 午夜小食堂 | 七夜小店经营：采购、菜单、定价与顾客口味共同影响现金和口碑 | [README](demos/midnight-canteen/README.md) |
| 2026-10-21 | 雨夜来信 | 雨夜遗失信件：调查证词、连接证据、核验重建与不同结局 | [README](demos/rainy-letters/README.md) |
| 2026-10-21 | 一平方米四季 | 20日阳台生态：播种、浇水、天气与伴生植物的资源策略 | [README](demos/balcony-seasons/README.md) |
| 2026-10-21 | 末班车调度室 | 末班地铁调度：容量、让行、换乘与期限的方案优化 | [README](demos/last-train/README.md) |
| 2026-10-22 | 行李里的远方 | 空间收纳与旅行取舍：旋转物品、满足需要、比较不同偏好的装箱策略 | [README](demos/suitcase-stories/README.md) |
| 2026-10-22 | 口袋声景 | 六轨十六步生活声音编曲：A/B结构、重音、摇摆、独奏与可保存的原创声景 | [README](demos/pocket-soundscape/README.md) |
| 2026-10-22 | 影子剧场 | 三幕光影几何谜题：移动纸偶与光源，让投影重合并探索等效解 | [README](demos/shadow-theatre/README.md) |
| 2026-10-22 | 合租公约实验室 | 四周合租协商：分配劳动与预算，观察投票、信任与共同生活的不同结局 | [README](demos/shared-house-council/README.md) |

在线体验（公开）：
- 把今天折成一首诗：https://hakuya-fold-a-day.golden-berry-3772.chatgpt.site
- 日常物证馆：https://hakuya-ordinary-museum.golden-berry-3772.chatgpt.site

- 午夜小食堂：https://hakuya-midnight-canteen.golden-berry-3772.chatgpt.site
- 雨夜来信：https://hakuya-rainy-letters.golden-berry-3772.chatgpt.site
- 一平方米四季：https://hakuya-balcony-seasons.golden-berry-3772.chatgpt.site
- 末班车调度室：https://hakuya-last-train.golden-berry-3772.chatgpt.site

- 行李里的远方：https://hakuya-suitcase-stories.golden-berry-3772.chatgpt.site
- 口袋声景：https://hakuya-pocket-soundscape.golden-berry-3772.chatgpt.site
- 影子剧场：https://hakuya-shadow-theatre.golden-berry-3772.chatgpt.site
- 合租公约实验室：https://hakuya-shared-house-council.golden-berry-3772.chatgpt.site

各项目独立部署；本作品无需登录即可访问。

## 目录约定

```text
demos/
  fold-a-day/        # 独立 npm 项目，无运行时第三方依赖
    src/
    test/
    scripts/
    package.json
    package-lock.json
    README.md
demos.json          # 只记录索引元信息，不承担编排
README.md
```

未来可直接加入 Python、Node、Rust、Electron 等项目；各自维护环境要求、依赖清单、锁文件、启动与验证命令。不为了形式统一建立共享 packages；只有确实出现可复用需求才讨论抽取。

## 新增一个 demo

1. 选一个可在当次交付完成的小问题，使用 `demos/<slug>/` 独立目录。
2. 写自己的 README：解决什么、如何运行、环境与依赖、验证方式、部署入口、已知限制。
3. 用该项目自己的工具链安装和锁定依赖；不依赖其他 demo 的私有路径。
4. 完成真实交互和最小可复现测试，记录实际通过与未执行项。
5. 能部署则部署该项目；不能部署则给出可靠本地运行方法，不强塞到网页运行。
6. 更新此导航和 `demos.json`，提交源码并核对远端 commit。

## 安全与边界

不提交凭据、真实私人数据或组织内部内容。演示默认使用虚构素材；付费服务、新凭据/授权、外部传播需单独确认。每个项目有自己的数据处理说明。

## License

MIT，见 [LICENSE](LICENSE)。各 demo 的原创代码与内容默认采用同一许可；未来使用第三方资源时单独注明其许可。
