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
| 2026-10-23 | 借风放纸鸢 | 借助确定性风场牵线、收放与减压，在三种风况中优化四枚风笺的路线 | [README](demos/kite-wind/README.md) |
| 2026-10-23 | 蓝染实验室 | 画蜡、折叠与分层浸染，完成三种防染委托或创作独一块布样 | [README](demos/resist-dye/README.md) |
| 2026-10-23 | 留白编辑部 | 从三篇原创散文中逐词删削、重新分行，在约束与自由写作中留下另一种叙事 | [README](demos/erasure-poetry/README.md) |
| 2026-10-23 | 晴天洗衣计划 | 安排洗衣批次与晾晒时序，在天气、材质、截止时间与用电之间找到可行策略 | [README](demos/laundry-day/README.md) |

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

- 借风放纸鸢：https://hakuya-kite-wind.golden-berry-3772.chatgpt.site
- 蓝染实验室：https://hakuya-resist-dye.golden-berry-3772.chatgpt.site
- 留白编辑部：https://hakuya-erasure-poetry.golden-berry-3772.chatgpt.site
- 晴天洗衣计划：https://hakuya-laundry-day.golden-berry-3772.chatgpt.site

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
scripts/validate-catalog.mjs  # 零依赖目录校验，不安装或构建作品
test/catalog.test.mjs        # 索引契约回归测试
README.md
```

未来可直接加入 Python、Node、Rust、Electron 等项目；各自维护环境要求、依赖清单、锁文件、启动与验证命令。不为了形式统一建立共享 packages；只有确实出现可复用需求才讨论抽取。

## 新增一个 demo

1. 选一个可在当次交付完成的小问题，使用 `demos/<slug>/` 独立目录。
2. 写自己的 README：解决什么、如何运行、环境与依赖、验证方式、部署入口、已知限制。
3. 用该项目自己的工具链安装和锁定依赖；不依赖其他 demo 的私有路径。
4. 完成真实交互和最小可复现测试，记录实际通过与未执行项。
5. 能部署则部署该项目；不能部署则给出可靠本地运行方法，不强塞到网页运行。
6. 更新此导航和 `demos.json`，运行下面的目录校验；提交源码并核对远端 commit。公开部署完成后再添加对应公开入口，不将本地地址写入公共索引。

## 展厅索引契约

`demos.json` 是个人主页展厅等消费者的机器可读入口，顶层始终为数组。它只提供导航与展示数据，不导入其他 demo，不执行它们的脚本，也不建立根目录 workspace。现有字段保持不变；新增展示字段全部可选，旧版条目仍能通过验证。未知新增字段允许保留，消费者应忽略自己不认识的字段。

每个条目必须包含：

- `slug`：唯一、小写字母或数字，单个连字符分词；例如 `fold-a-day`。
- `path`：精确为 `demos/<slug>`，禁止绝对路径、反斜杠和路径穿越。
- `title`、`description`：非空文字，直接作为文本显示，不作为 HTML 执行。
- `date`：实际发布日，格式为真实有效的 `YYYY-MM-DD` 日期。
- `stack`：非空技术名称数组。
- `readme`：精确为 `<path>/README.md`。
- `license`：`MIT`，目录内必须有 `LICENSE` 文件。
- `deployment`：包含 `access: "public"` 与 `url`。入口必须是无需登录的公开 HTTPS 地址，不得带凭据或非标准端口。

展厅展示字段（可选，缺省时消费者提供中性默认样式或省略）：

- `category`：`文学`、`生活`、`策略`、`创作` 四者之一，表示主分类。
- `interaction`：不超过 60 个 Unicode 字符的单行操作提示，说明访客能亲手做什么。
- `accent`：六位十六进制色值，如 `#A65D4E`，只作为装饰色，不用颜色单独承载含义。
- `preview`：真实作品截图的公开 HTTPS 图片 URL。没有可验证截图时直接省略，不填占位图或臆造 URL；消费者应在缺图或加载失败时正常显示文字卡片。

消费约定：按 `date` 倒序展示，同日可按 `slug` 稳定排序；使用 `slug` 作为稳定标识，不依赖数组位置、固定作品数量或手写标题列表。新增作品只需按契约补充此文件；个人主页按自己的刷新策略读取已发布索引，不需要同步修改每张卡片。抓取或校验失败时应保留上次有效快照，首次不可用时显示明确的暂不可用状态，不能把未同步说成最新。

### 校验目录（Node.js 20+，无需安装依赖）

在仓库根目录执行：

```sh
node scripts/validate-catalog.mjs
node --test test/catalog.test.mjs
```

也可用 `node scripts/validate-catalog.mjs /absolute/path/to/demos.json` 校验另一份索引；源码目录按该 JSON 所在目录解析。校验失败会列出原因并返回非零退出码，适合在发布或索引同步前执行。

校验覆盖必填字段、唯一 slug、日期、MIT 声明、展示字段、URL 格式、源码/README/LICENSE 存在性与符号链接边界。URL 规则拒绝非 HTTPS、凭据、自定义端口、IP 字面量、单段主机名及常见本地/保留域名；校验不联网、不解析 DNS，不证明域名所有权、公开可达性或截图真实性。发布者仍需实际打开入口与截图进行验证。

这两条命令只检查导航契约，不代替各 demo 自己的测试和构建；根目录仍不提供统一安装、启动或构建命令。

## 安全与边界

不提交凭据、真实私人数据或组织内部内容。演示默认使用虚构素材；付费服务、新凭据/授权、外部传播需单独确认。每个项目有自己的数据处理说明。

## License

MIT，见 [LICENSE](LICENSE)。各 demo 的原创代码与内容默认采用同一许可；未来使用第三方资源时单独注明其许可。
