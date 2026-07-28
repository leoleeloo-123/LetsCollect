# Companion / Echo 产品基线

状态：已批准方向；本地 Demo 主循环已实现，生产权威化尚未完成
版本：v1
日期：2026-07-28
产品表达：`Collect · Connect · Companion`

## 1. 文档职责

本文件记录 Let's Collect 从当前 React MVP 演进到 Companion / Echo 体验时的可实施产品基线。它负责定义页面、术语、Agent、数据与验收；长期不可随意改变的原则仍以 `docs/PRODUCT_CONSTITUTION.md` 为最高决策基线。

阅读时必须区分：

- **Current reality**：仓库和线上版本今天已经具备的能力；
- **Approved target**：已经确认方向、但仍需按路线图实现的能力；
- **Planned capability**：未来可能增加、当前 C 端不得伪装成可用的能力。

真实资产和能力状态以 `docs/ASSET_CAPABILITY_REGISTRY.md` 与代码注册表为准。

## 2. 产品定义

Let's Collect 是一个围绕数字 Companion 展开的治愈系收藏体验。用户通过遇见、选择和收藏不同 Companion，逐渐表达自己的审美和偏好；系统再从这些收藏行为中发现人与人之间细微而真实的共鸣。

连接不是 Dating、Match、聊天、加好友或建立现实关系。它是一种低压力、保持距离、保留想象力的 Soft Connection：

> 收藏自己喜欢的小东西，也偶尔发现这个世界上有人与你喜欢着相似的小东西。

产品 slogan：

> Collect what you love. Meet who understands.

## 3. 产品结构与优先级

目标体验比例：

- 80%：Collect 与 Collection；
- 15%：Echo 与极轻量共同收藏；
- 5%：Agent 能力展示。

核心循环：

```text
表达偏好
-> 遇见 Companion
-> 加入 Collection
-> 形成可解释的 Collection Signature
-> Resonance Agent 发现匿名共鸣
-> 用户留下一个 Echo 或让它飘走
-> 可选的轻量 Collect Together 目标
-> 获得克制的收藏奖励
-> 返回 Collect
```

任何功能如果不能强化收藏、表达或低压力共鸣中的至少一项，不进入首期目标。

## 4. 当前事实快照

截至 2026-07-28，当前代码已经具备：

- React 18、Vite、TypeScript、React Router；
- Supabase 匿名 Auth 与 `profiles`；
- React Context + `localStorage` 的票券、收藏、好友和最近抽取状态；
- 二十四个 active Color Animals matte 模型；
- 九个常规 colorway；
- 首页色彩系列的二十四个 matte 模型 × 九色显式组合；
- `collectSeries.ts` 注册的十三个独立特殊系列池，全部六券一次；
- Diamond Unicorn 与 Diamond Dog 已归档，五种原生 Crystal tint 只保留给已有本地藏品与内部验证；
- 共享 `ToyViewer`、本地 Draco、按 URL 的模型解码缓存；
- IndexedDB WebP 缩略图缓存；
- Collect / Collection / Echo 三个 C 端入口，以及独立 Agent Console；
- Favorite、最多三只 Representative Companions 与确定性 Collection Signature；
- 有限本地 Echo、Collect Together、typed local analytics 和 capability registry；
- 当前抽取在客户端生成，并在揭晓前立即写入本地 Collection。

当前尚未实现：

- 真实多人 Echo / Resonance 服务与生产通知；
- Agent 对生产 Campaign 的权威审批、审计与发布；
- 云端收藏、权威抽取与票券流水；
- lint 与自动化测试脚本。

## 5. 信息架构

批准后的 C 端一级入口只有：

| 入口 | 推荐路径 | 主要任务 |
| --- | --- | --- |
| Collect | `/` | 表达偏好、遇见 Companion、完成揭晓 |
| Collection | `/collection` | 浏览、策展、Favorite、Representative、Signature |
| Echo | `/echo` | 查看有限匿名共鸣并选择 Leave / Drift |

迁移规则：

- `/draw` 在 Collect 合并稳定前继续可用，之后保留为兼容重定向或二级流程；
- `/friends` 在 Echo 具备完整替代流程前不删除代码，迁移后不再作为一级入口；
- `/agent` 或 `/agent-console` 使用独立 Internal / Demo shell，不进入 C 端主导航；
- `/onboarding` 继续作为身份边界；
- Lab 路由继续用于资产验证，不混入普通用户导航。

禁止新增 Chat、Friends、Messages、Feed、Dating 或 Match List 一级入口。

## 6. Collect 页面

Collect 是产品最重要的页面，真实 3D Companion 资产是唯一主视觉焦点。
Collect 系列货架是受控 live 3D 例外：每张系列卡只创建一个 canvas /
renderer，卡内模型共享旋转，并在接近 viewport 时懒初始化。当前十四张卡
在全部访问后最多保留十四个 WebGL context；如果按六十个模型格逐项创建
canvas，会远超移动端预算。普通列表仍
使用缓存缩略图，揭晓和详情继续使用单模型 live `ToyViewer`。

### 6.1 页面层级

顶部只保留：

- Let's Collect 品牌；
- 当前抽取次数或票券；
- 简洁偏好入口；
- 用户菜单。

主体使用：

- 一个可扩展的系列卡片架，不使用卡片右上角的全局分页器；
- 第一张色彩系列卡同时展示二十四个真实 matte 模型；
- 卡内九个色点切换全部模型的同一 colorway；
- `collectSeries.ts` 注册的十三个特殊系列各自一张纵向特殊系列卡；
- 十三个特殊系列全部消耗六张券，且只在自己的严格模型池中均等抽取；
- 每张卡一个主要抽取 CTA，并准确展示 `1 / N` 与票券成本；
- 系列卡预览使用单卡单 canvas 的共享旋转舞台；揭晓阶段使用一个 live `ToyViewer`。

不得新增房间、森林、花园或其他复杂 3D 场景。新增特殊系列应只扩展
集中配置与一张复用卡片，不复制抽取逻辑，也不为每个模型新增 canvas。

### 6.2 偏好

用户当前只能表达真实存在的偏好：

- 二十四个 active matte Companion；
- 九个真实 colorway 或它们的情绪分组；
- Matte 倾向，以及为未来保留但不会改变当前抽取的 Crystal 兴趣信号；
- 明确选择的系列与该系列真实存在的模型池。

`Calm / Warm / Fresh / Dreamy / Bold / Monochrome` 只能作为九个真实 colorway 的 UI 分组，不是新增资产。映射必须集中配置并可解释。

需要注意：二十四个普通模型不是全部“身体整体换色”。不同模型改变主体、
帽子、行李箱、毛线球、棒棒糖、爆炸头、相机配件、鼓、海星或睡帽。用户界面
优先使用 `colorway / 配色 / color accent`，详情使用真实部位名称。

色彩系列的九个色点是显式选择：二十四个模型在该色系下严格等概率
`1 / 24`。`collectSeries.ts` 注册的十三个特殊系列分别使用自己的模型池，
全部六券一次。水晶卡与新生成分支已经归档；旧 `/draw`
也只从二十四只 matte 伙伴中生成。所有系列概率都从集中配置派生，
不允许额外混入隐藏彩蛋概率。

### 6.3 抽取叙事

主 CTA 推荐：

- `Meet a Companion`
- `Discover a Companion`
- `Who will you meet today?`

可以保留 Draw 作为系统术语，但不能使用老虎机、高速闪烁、金币爆炸、倒计时或强刺激稀有度反馈。

揭晓使用柔和旋转、光晕、淡入或材质过渡，并尊重 `prefers-reduced-motion`。

### 6.4 揭晓信息

揭晓以真实 3D 模型为主，展示：

- Companion / 模型名称；
- colorway 与真实换色部位；
- Matte 或 Crystal；
- 当前 series / pool；
- 一句集中管理的简短描述。

降低 rarity、100 分品质与五维评分的视觉权重。不得用 AI 为每只玩偶凭空编写大量人格设定。

### 6.5 当前自动入库的迁移

当前 `drawCollectible()` 会立即扣票并写入 Collection。为避免破坏现有闭环：

1. 第一阶段保留自动入库，揭晓 CTA 使用 `View in Collection`；
2. 只有在 `pendingDraw`、失败回滚和未来服务端权威写入契约明确后，才切换为真正的 `Add to Collection`；
3. 显式 Skip / disposition 上线前，不发送虚假的 `companion_skipped` 事件。

## 7. Collection 页面

Collection 是干净、有策展感的数字陈列馆，不是房间或养成世界。

### 7.1 Representative Companions

- 用户最多选择三只已经拥有的 Companion；
- 保存具体收藏实例、当前 colorway、材质与顺序；
- 不要求真人头像；
- 这三只 Companion 是 Echo 中他人首先看到的匿名表达。

### 7.2 Collection Grid

继续复用现有 WebP 缩略图、单一详情 Viewer 和详情浮层。目标筛选仅基于真实 metadata：

- Model；
- Colorway；
- Material；
- Favorite；
- Acquisition date。

当前不存在 Personality、Pose、Sleepy、Quirky、Fuzzy、Metallic 或 Porcelain 筛选。

### 7.3 Collection Signature

Signature 是近期收藏倾向的轻量、可解释总结，不是人格测试。

首期规则只读取：

- 已拥有模型分布；
- colorway 分布；
- Matte / Crystal 分布；
- Favorite 分布；
- Representative Companions；
- 最近收藏趋势。

输出 2–4 个规则标签和一句保守描述，例如：

- `Soft Colors`
- `Matte Lover`
- `Fresh Green`
- `Unicorn Curious`
- `Warm Palette`
- `Color Explorer`

语言必须使用“最近偏向”“目前似乎”“可能喜欢”，不能声称 AI 已完全理解用户。

初始演示收藏目前会自动补齐旧六个 starter model。Signature 已能工作，但
真实用户上线前仍必须移除、标记或排除这些 fixture，避免新用户的收藏倾向
被演示 seed 强烈偏置。

## 8. Echo 页面

Echo 是唯一新增的 C 端连接页面。每天只提供有限数量的候选，建议 2–3 条；页面不是无限 Feed。

每张 Echo 卡片包含：

- `A similar collecting path crossed yours.`
- 匿名名称；
- 1–3 只真实 Representative Companions；
- 1–2 条来自真实信号的共鸣理由；
- `Leave an Echo`；
- `Let it drift`。

不得显示：

- 真人照片、真实姓名、性别、年龄、职业、地点；
- 在线状态、Match percentage、热度、Like 或 Followers；
- 左右滑动、聊天或私信。

`Leave an Echo` 是预设的非文字、低压力信号。双方均留下 Echo 后，可以显示一张极简 `Collect Together` 进度卡；不新增实时互动、小游戏或共享 3D 场景。

奖励只使用已实现或明确可配置的能力，例如：

- 额外抽取机会；
- 简单 2D Badge；
- 已有 colorway 解锁；
- Collection frame。

如果某奖励尚未实现，capability 必须标为 `requires_engineering`，不能假装可发放。

## 9. Resonance Agent

Resonance Agent 面向用户价值，但前台不称 Matching Agent。

输入信号：

- 主动选择的模型、colorway mood 与材质倾向；
- 收藏、Favorite、Representative；
- 最近抽取与真实 disposition；
- Echo leave / drift；
- Campaign 参与。

第一版使用确定性、可解释的规则模型即可。推荐内部权重：

- 主动偏好 35%；
- 实际收藏行为 35%；
- Representative 20%；
- Campaign / Echo 行为 10%。

这些比例、score 与 confidence 不显示给用户。前台只显示追溯到真实信号的自然语言理由。

结构化结果至少包含：

```text
candidateId
anonymousName
representativeCompanions
sharedSignals
primaryReason
secondaryReason
internalScore
confidence
generatedAt
```

Agent 不依赖外部 LLM 才能工作；即使未来接入模型服务，也必须保留 deterministic fallback，并禁止生成不存在的模型、colorway 或材质。

## 10. Evolution Agent 与 Console

Evolution Agent 面向运营 / B 端，不是聊天机器人。

它体现：

```text
Observe -> Reason -> Propose -> Human Approve -> Apply -> Measure -> Adjust
```

“Evolution” 指根据活动结果调整配置和策略权重，不是自动修改源代码，也不是无人审批上线。

Agent Console 使用独立 route 和一屏式布局：

- 左：聚合后的 Community Signals；
- 中：自然语言 Agent Insight；
- 右：结构化 Campaign Proposal。

Proposal 必须包含：

- insight 与目标人群；
- 当前真实模型和 colorway；
- draw / material 权重变化；
- shared task 与 reward；
- required capabilities；
- feasibility 与 blocking reasons；
- Approve / Edit / Archive。

只允许 `available_now` 或人工确认后的 `requires_configuration` 进入发布动作。
ZZZ 已有小猫、海豹和考拉三款现成睡姿；依赖新的 Sleepy 资产、睡眠水晶
变体、Quirky、新材质或其他新 3D 资产的提案仍必须标为 Roadmap Proposal 并禁用发布。

## 11. Capability 与资产真实性

统一状态：

- `available`
- `planned`
- `experimental`
- `legacy`
- `unavailable`

统一 feasibility：

- `available_now`
- `requires_configuration`
- `requires_asset_creation`
- `requires_engineering`

代码中的 active registry 是运行时真源；文档注册表用于产品、设计和验收。文件存在于仓库不等于 C 端可用，legacy Jelly Jade、八材质目录和 archived 模型不得被自动推导为 available。

## 12. 数据与 adapter 边界

概念必须分离：

- `CompanionModel`：基础模型和渲染能力；
- `CollectibleInstance`：抽取生成的不可变外观事实；
- `UserCollectionItem`：owner、favorite、representative rank 与获得来源；
- `UserTasteProfile`：主动偏好与派生信号；
- `EchoCandidate`：匿名候选和可解释理由；
- `SharedCollectionTask`：极简共同目标；
- `CampaignProposal`：Agent 提案、feasibility 与评估；
- `AnalyticsEvent`：最小非敏感事件。

页面不直接读取 mock fixture、`localStorage` 或 Supabase 表。当前 `MvpStateProvider` 可以继续作为 UI 边界，但纯业务逻辑应逐步拆到 repository / service / reducer。

Demo fixture、真实资产、UI copy、Agent fixture 与 Campaign 配置必须分模块管理。

## 13. Analytics

最小 typed event 可包含：

```text
draw_started
companion_drawn
companion_collected
companion_skipped
companion_favorited
representative_set
color_preference_selected
material_preference_selected
echo_viewed
echo_left
echo_drifted
echo_mutual
shared_task_started
shared_task_progressed
shared_task_completed
campaign_exposed
campaign_joined
campaign_completed
```

事件不得包含真人照片、聊天内容、精确位置或敏感身份数据。没有 analytics 后端时使用 local/mock adapter，不引入重型事件系统。

## 14. 视觉与产品语言

目标气质：

- Cozy；
- Gentle；
- Calm；
- Collectible；
- Slightly mysterious；
- Premium but approachable；
- Cute without becoming childish；
- Minimal but not sterile。

现有 Rose Frost 的品牌粉、玻璃感、圆角和柔和阴影可以保留，但大面积视觉应转为 off-white、低饱和绿和雾蓝；品牌粉成为温暖识别色，Crystal 使用独立冷色 accent，Echo 使用低饱和柔和 accent。

页面应减少卡片密度、状态徽章和评分信息，让 3D Companion 获得最大面积与最高对比。现有 Lab 的开放式编辑排版与 3D 舞台可作为视觉参考，但 C 端标题不能压过 Companion。

统一使用：

- Companion；
- Collect；
- Collection；
- Echo；
- Resonance；
- Collect Together；
- Representative Companions；
- Collection Signature；
- Leave an Echo；
- Let it drift。

避免：

- Match / Match rate；
- Dating；
- Add friend；
- Online now；
- Message / Chat；
- Swipe / Reject；
- Popularity / Followers / Likes。

所有新增 copy 集中管理。当前主界面是中文，可以保留中文交互，但产品专有词需要稳定映射，不能在页面间随意切换。

## 15. 性能、状态与可访问性

- 除 Collect 系列货架外，同一主要页面默认只保留一个 active live Viewer；
- Collect 货架每张卡最多一个 canvas，当前最多十四个系列 context，并对下方
  卡片懒初始化、对离屏卡片暂停无意义渲染；renderer 回收仍需移动端验证；
- 列表、Representative 与 Echo 卡片使用缩略图；
- 保留模型 URL 解码缓存与 IndexedDB WebP；
- 为首次访问增加静态 poster 或 CSS fallback，不能只依赖已经生成过的缓存缩略图；
- 历史本地藏品若包含归档水晶模型，详情页仍应按需加载兼容运行文件；
- 高频 colorway 切换应优先原位更新材质，避免销毁整个 renderer；
- 所有页面具备 loading、empty、error、retry；
- 所有交互可键盘操作，有可见 focus；
- 动效尊重 reduced motion；
- 移动端继续保留 safe area、触控尺寸和首屏预算。

## 16. 明确不做

首期不实现：

- 新 3D 模型或自动生成 GLB；
- 房间、森林、花园或复杂 3D 世界；
- Companion 养成或自主 AI 行动；
- 实时多人同步；
- 自由文本 Chat、私信；
- 真人头像社交、Feed、关注与粉丝；
- 地理匹配、Dating、无限滑卡；
- 大型推荐系统；
- Agent 自动改源码；
- Agent 无人工审批直接发布活动；
- 为展示 AI 而强制新增 API key；
- 把 planned / legacy 资产当作当前可抽取内容。

## 17. Demo 验收

### Flow A：Collect

```text
选择色彩系列的 colorway，或选择一张特殊系列卡
-> 在该卡片声明的严格模型池中等概率遇见一个 Companion
-> 揭晓真实模型 / colorway / material
-> 进入 Collection
-> Favorite / Representative
-> Signature 更新
```

### Flow B：Echo

```text
查看有限匿名候选
-> 看见真实 Representative 与可解释原因
-> Leave an Echo 或 Let it drift
-> mutual 时出现极简 Collect Together
-> 无 Chat
```

### Flow C：Evolution

```text
观察聚合趋势
-> 生成使用当前资产的可执行 Campaign
-> 人工批准
-> 同时生成依赖未来资产的 Roadmap Proposal
-> Roadmap Proposal 明确阻塞且不可发布
```

完整实现必须保证二十四个 matte 模型、九个常规 colorway、色彩系列
`1 / 24`，以及`collectSeries.ts` 注册的十三个特殊系列十三个六券特殊池的
严格模型与概率。两只 Crystal 模型及五个原生 tint 不出现在当前 Collect
货架或新抽取；已有本地藏品和现有详情渲染不得被破坏。

## 18. 实施原则

1. 先更新产品宪法和文档真源，再改变一级导航或核心循环；
2. 不换框架，不重写已经稳定的 ToyViewer 和资产管线；
3. 先拆 current / target / planned，再做 UI；
4. 每阶段保持当前抽取与收藏闭环可用；
5. `/draw`、`/friends` 和旧状态需要明确兼容与回滚路径；
6. 新状态先走 typed local adapter，再替换为 Supabase repository；
7. Agent 先规则化、结构化、可解释，再考虑外部模型服务；
8. 每个阶段独立通过 typecheck、build 和对应的人工流程验证；
9. 仓库当前没有 lint / test 脚本，不得在交付报告中声称它们已经执行。
