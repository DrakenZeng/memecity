# Meme City

Pieverse Meme Agent 城市的交互式前端演示。Next.js App Router + TypeScript + Three.js / React Three Fiber，使用 Bun 管理依赖。

## 环境要求

- Node.js 20.9 或以上版本。
- Bun（项目声明的包管理器版本为 `1.4.2`，依赖锁定在 `bun.lock`）。
- 支持 WebGL 的现代浏览器，用于渲染 3D 城市。

## 本地运行

```sh
git clone https://github.com/DrakenZeng/memecity.git
cd memecity
bun install
bun run dev --port 3015
```

访问终端打印的地址；以上命令通常为 `http://localhost:3015`。默认端口为 3000，可通过 `--port` 指定。

当前版本无需配置钱包、API 密钥或环境变量即可体验。所有数据均在浏览器本地模拟，具体限制见下方「模拟边界」。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `bun run dev` | 启动本地开发服务器 |
| `bun run typecheck` | 检查 TypeScript 类型 |
| `bun test` | 运行测试 |
| `bun run build` | 生成生产构建 |
| `bun run start` | 启动生产服务器，需先执行构建 |
| `bun run export` | 静态导出到 `out/` |

## 检查与构建

```sh
bun run typecheck
bun test
bun run build
```

标准 Next.js 构建后运行 `bun run start`。如需静态托管，运行 `bun run export`，产物位于 `out/`。静态导出之后需重新运行 `bun run build` 才能使用 `bun run start`。

`node_modules/`、`.next/`、`out/`、临时缓存和环境变量文件不提交到 Git。仓库托管在 GitHub 不代表已经部署网站；对外访问仍需单独配置部署服务。

## 演示操作

- 地图扩展至 68×68，面积约为最初城市的 12 倍，包含中心 Exchange、夜市、住宅区、研究园区、工业区、花园、游乐区、车站和水岸九个街区。
- 点右下角 Whole city 看完整城市；右侧 City Map 可点击定位或选择街区跳转，Exchange 按钮回到中心。缩放范围为 2.5–90，普通建筑与设施的数量始终独立于 agent 数量。
- 外围新增 70 栋建筑、夜市摊位、摩天轮、湖泊、凉亭、列车、仓库、吊机、桥梁、码头、船只和飞艇。全城共有 61 辆道路车辆，另有 32 名普通行人；行人是城市背景角色，不是代币 agent。
- 拖动平移；滚轮或触控板缩放，围绕鼠标位置放大；触屏支持双指缩放。右下角可缩放、复位或进入全景模式。
- 点击行走的 agent、名字标签或底部卡片打开详情。普通建筑是共享设施，与 agent 数量无关。
- Launch 完成身份、性格、策略及确认流程。每次只创建一个 agent，不生成新建筑；演示上限为 24 个居民。
- 确认 mint 后约 11 秒内完成：mint 确认 → 等待内部初始化与扫描灯效 → 正门打开 → agent 走下台阶进入广场。结束后打开详情。
- Exchange 招牌下 Demo the Genesis Gate 可以重播出门动画，不新增居民，不改变资金与留言。支持 Skip。
- 出场期间自动研究与交易调度暂缓，已有居民仍可在街头活动，完成后恢复。
- 非休眠 agent 随机选择公共地点，沿路网行走，停下来喝咖啡、看资料、打招呼、跳舞或等车。动作显示在头顶，街头事件写入活动流。等待工作激活的 agent 也能散步，休眠 agent 停止走动。
- City Pulse 的 Surprise me 随机触发 Agent 剧情；右上角 Scene Lab 可指定 Agent、按六个分类选择 43 种剧情。背景仍会出现喷泉金币、广场舞会或流星，Agent 剧情播放期间暂缓背景事件。
- 剧情覆盖行情跌涨、开发者买卖与清仓、金库快递、算力电量、回购销毁、权限红灯、社区信箱、研究议题、邻里交流和纪念日。道具跟随角色出现，包括伞、毯子、空椅子、火箭气球、蛋糕等；邻居通过城市无线电交流，不复制或瞬移角色。
- 随机剧情默认开启，每段播放 18 秒，可设置剧情之间留白 12/18/30/60 秒。自动剧情不移动镜头，Locate agent 定位；导演台手动演示会定位角色。暂停同时暂停剧情计时与动画。
- 剧情卡支持跳过、视觉回放、恢复最新剧情前的模拟数值、下载 SVG 纪念卡。回放不重复修改数值；每个 Agent 仅最新事件允许恢复，恢复保留后来写的 note 与已获得徽章。
- Chronicle 展示心情、模拟价格曲线、开发者持仓、徽章、邻里关系和事件记录；可提交研究议题，在研究剧情中被读取。Daily paper 汇总最近八条城市新闻。
- 新 Agent 出门完成后会触发欢迎剧情。
- 中心保留六栋背景建筑、Exchange、咖啡馆、公园、喷泉、雕塑、长椅、路灯、公交站、环形道路、出租车、夜班巴士、红绿灯、配送无人机与小猫，外围使用独立的静态布局扩展。
- 详情包含 Overview、Activity、Treasury、Notes，可触发研究、发帖、回购、销毁、税费、休眠和唤醒。
- 新 agent 初始资金为 0，Fund agent 模拟税费收入，Wake up 激活其工作状态。
- Notes 在下一次唤醒时标为已读，并在日志生成预设确认回复。
- Pause simulation 暂停自动研究交易、居民行走、车辆与环境动画；出门演示独立完成。Reset 会确认后重置。
- 数据保存在当前浏览器 localStorage，不跨设备同步。镜头、位置、随机活动和暂停状态不持久化。

## 目录

```text
src/app/                             页面、元数据与响应式样式
src/components/city-scene.tsx         城市布局、Exchange、投影标签与相机
src/components/city-environment.tsx   共享设施、车辆与城市特效
src/components/metropolis-environment.tsx 外围街区、交通、游乐设施与水岸
src/components/metropolis-buildings.tsx 外围建筑与实例化渲染
src/components/city-visitors.tsx      普通行人
src/components/world-navigator.tsx    小地图与街区跳转
src/components/roaming-agent.tsx      居民行走与随机活动
src/components/agent-avatar.tsx       角色与四肢动作
src/components/hatch-effect.tsx       延迟出门演示
src/components/meme-city.tsx          界面、创建、详情与模拟控制
src/lib/city-life.ts                  场景常量、公共地点、步行路网
src/lib/metropolis.ts                 大地图街区、建筑布局与交通路线
src/lib/simulation.ts                 资金、工作状态与存档规则
src/lib/stories.ts                    43 种剧情、性格反应、数值快照、存档和卡片导出
src/hooks/use-stories.ts              剧情调度、计时、回放和持久化
src/components/story-lab.tsx          导演台、事件卡、年表与小报
src/components/story-effects.tsx      跟随 Agent 的 3D 剧情道具
src/lib/*.test.ts                     导航、出门时序与资金规则测试
```

## 模拟边界

所有行情、资金、研究和帖子均为模拟，无真实钱包、链上交易、X 发布或 AI。性格与策略用于展示，工作事件采用预设文案；街头地点与动作随机选择。

- 回购最多每笔 $120，不能超过金库余额；模拟价格 $0.01/token。
- 税费事件增加 $80 操作资金和 $20 算力资金。
- 研究与发帖扣除 $2、$3 算力资金，余额不足时不执行。
- 每次销毁最多 10,000 枚，仅消耗已有 token。
- 休眠或等待工作激活时不主动研究、发帖或交易。
- 散步与背景城市特效不影响资金。明确标识 MOCK 的 Agent 剧情可修改模拟行情、开发者持仓、算力或金库数值；剧情回购与销毁仍遵守现有余额与单次上限。
- 活动日志最多保留 80 条、剧情年表 120 条、单个 Agent 价格记录 30 点、研究议题 12 条；不含真实日预算、市场阈值唤醒、美股交易或收益核算。

场景需要 WebGL；不可用时显示提示，卡片和详情仍可操作。Google Fonts 不可用时自动使用系统字体。
