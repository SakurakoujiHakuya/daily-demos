# QA — 潮汐邮差

## 已执行

- Node 内置测试 39/39 通过（2026-10-24）。
- npm run build 成功。
- 同一 Node 测试进程启动真实HTTP服务并请求：首页/模块200、正确MIME、未知路径404、编码路径穿越403。npm ci 成功。
- 三关求解路径均由测试逐步核验合法、无失败、回到邮局并三星；每关延迟两拍出发也能成功，属于自动规则测试，不是浏览器实测。

## 公开站真实浏览器验证

2026-10-24 09:14–09:16 UTC，在独立云端 Chromium 标签页实际打开并点击验证：
https://hakuya-tidal-post.golden-berry-3772.chatgpt.site/

- 三关均以真实按钮点击完整通关：晨汐短笺 33 拍、岛间折返 42 拍、暮色回航 40 拍。可见归航成功、全部投递状态；第一关明确核对三星及目标 36 拍。未注入游戏状态、未通过 evaluate 驱动逻辑。
- 第一关 E,E,wait 实际触发涨潮失败，方向按钮锁定；撤回后 E 成功抵达 A，并继续完成全关。
- 第二关实际点击相邻地图格移动，向海水移动显示“行动未消耗”反馈；重走和切关可用。
- 第二、三关提示分别显示下一步向东及 42/40 拍可行解，不自动前进行动。
- 完成三关后刷新，三个最佳记录 33/42/40 均保留，当前地图回第一关。
- ArrowRight 键从邮局移动到相邻陆地，Z 键撤回，已读取对应可见位置确认。
- 已查看通关截图：地图、预报、控件和三星结果无重叠，桌面布局正常。
- 控制台有浏览器扩展自身 chrome-extension:// 内容脚本 metadata 发送错误；按本站域名筛查 warn/error 无记录。未将扩展报错误报为游戏错误。

## 尚未覆盖

窄屏实际视口、真实手机、Safari、屏幕阅读器未验证；第二三关星级未单独读取，三星结论由规则测试覆盖。地图全部策略、所有键盘键、无存储权限场景未做浏览器穷尽测试。

N/E/S/W 分别为 ↑/→/↓/←，wait 为等一拍，rest 为歇脚。

### 01 · 晨汐短笺

最短参考 33 拍，三星阈值 36。

E, E, E, wait, W, E, W, W, W, rest, E, S, S, S, rest, wait, rest, rest, E, E, E, wait, W, E, W, W, W, rest, rest, N, N, N, W

### 02 · 岛间折返

最短参考 42 拍，三星阈值 44。

E, E, E, rest, E, N, N, E, E, wait, W, W, W, W, rest, wait, wait, rest, rest, W, W, wait, E, E, S, S, E, rest, rest, E, S, S, wait, wait, wait, N, N, W, rest, W, W, W

### 03 · 暮色回航

最短参考 40 拍，三星阈值 42。

E, E, E, wait, E, E, E, S, S, rest, rest, S, S, W, W, W, rest, rest, W, W, W, wait, E, E, N, S, E, rest, rest, W, N, N, E, wait, W, W, W, rest, N, N

