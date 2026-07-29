# Let's Collect 产品宪法

状态：v2
日期：2026-07-28
用途：统一产品方向、体验原则、真实资产边界与工程决策顺序

## 一、产品定义

Let's Collect 是一个围绕数字 Companion 展开的治愈系收藏体验。

用户通过遇见、选择和收藏 Companion，逐渐表达自己的审美和偏好；系统从真实收藏行为中发现人与人之间细微的共鸣。收藏是前台主体，连接是轻轻附着在收藏之上的第二层体验，Agent 是帮助解释与运营这一体验的幕后能力。

核心表达：

```text
Collect · Connect · Companion
```

产品 slogan：

> Collect what you love. Meet who understands.

产品希望提供的不是“找到最适合的人”，而是：

> 发现这个世界上，还有人与我喜欢着相似的小东西。

## 二、核心循环

目标核心循环是：

```text
表达偏好
-> 遇见 / 抽取 Companion
-> 加入 Collection
-> 收藏行为形成 Collection Signature
-> Resonance Agent 发现匿名共鸣
-> 用户留下 Echo 或让它飘走
-> 可选的轻量 Collect Together
-> 获得克制的收藏奖励
-> 返回 Collect
```

目标产品比例：

- 80%：Collect 与 Collection；
- 15%：Echo 与轻量共同收藏；
- 5%：Agent 能力展示。

任何功能都必须强化收藏、表达或低压力共鸣中的至少一项。不得为了社交重新创造复杂世界。

## 三、不可随意改变的产品原则

1. Companion 始终是视觉与情感中心。
2. 收藏是用户进入、停留与长期回访的第一原因。
3. 社交是收藏行为的第二层回响，不是产品入口压力。
4. Agent 在幕后发现和解释共鸣，不替用户建立关系。
5. Soft Connection 不使用 Match、Dating、聊天、在线状态、未读红点、关注数或匹配率。
6. Companion 是用户表达自己的媒介，不是普通积分图标。
7. 当前资产、未来规划和实验资产必须严格分离。
8. Agent 不得假装不存在的模型、材质、颜色或工程能力已经可用。
9. Agent 不能自动修改源代码，活动配置必须经过人工批准。
10. 整体体验应安静、温柔、现代、略带神秘感，cute 但不幼稚，premium 但可亲近。
11. 手机端是默认体验，桌面端只做增强。
12. 一个页面只承担一个主要任务，并保留一个最明确的主操作。

## 四、目标一级信息架构

批准后的 C 端一级入口固定为三个：

| 模块 | 用户进入时的问题 | 主要结果 |
| --- | --- | --- |
| Collect | 今天会遇见哪一只 Companion？ | 表达真实偏好并完成一次遇见 / 抽取 |
| Collection | 我收藏了什么，它们怎样表达我？ | 浏览、Favorite、Representative、Signature |
| Echo | 是否有人与我的收藏轨迹产生了轻微共鸣？ | Leave an Echo、Let it drift、可选共同目标 |

账户、设置与偏好从用户菜单进入。Agent Console 使用独立 Internal / Demo route，不进入普通 C 端导航。

不得新增 Chat、Friends、Messages、Social Feed、Dating 或 Match List 一级入口。

当前 `/draw` 与 `/friends` 在迁移完成前可以保留兼容，但它们不再是批准后的长期一级结构。删除或重定向前必须有可验证替代和回滚路径。

## 五、页面职责

### Collect

- Collect 系列货架是受控 3D 例外：每个系列使用一个 WebGL canvas / renderer，卡内真实模型共享旋转；抽取揭晓使用一个主要 live 3D Companion；
- 保留真实模型、colorway、旋转和材质效果；
- 只允许基于当前可用资产表达偏好；
- 通过柔和 reveal 建立期待，不使用老虎机或赌场叙事；
- 当前自动入库行为在新 pending draw 契约完成前继续兼容。

### Collection

- 使用缩略图浏览，只有选中项加载 live GLB；
- 支持 Favorite；
- 最多选择三只 Representative Companions；
- 从真实收藏信号派生 Collection Signature；
- 不做复杂人格测试，不把用户归类成固定人格。

### Echo

- 每天只展示有限匿名候选；
- 使用真实 Representative Companions 作为对方形象；
- 只展示可解释的 resonance reasons，不显示内部 score；
- 只允许 Leave an Echo 或 Let it drift；
- 不提供自由文本 Chat；
- mutual Echo 后最多出现一张极简 Collect Together 进度卡。

## 六、Soft Connection 与隐私边界

Echo 不依赖并且不应展示：

- 真实姓名；
- 性别、年龄、职业；
- 地理位置；
- 真人照片；
- 在线状态；
- 聊天内容；
- Match percentage；
- Like、Followers 或 Popularity。

连接只能来自真实、低敏感的收藏信号，例如模型、colorway、材质、Representative、Favorite、收藏趋势和 Campaign 参与。

用户可以让 Echo 自然飘走，不需要解释，也不能被连续提醒或惩罚。

## 七、真实资产与能力边界

当前可用资产以 `docs/ASSET_CAPABILITY_REGISTRY.md` 为准。当前 C 端只可使用：

- 二十四个 active Color Animals，包含皇冠小鸟与耳罩企鹅；
- 测试用奶油小熊已整体归档，不进入正式 catalog、运行时、Lab 或抽取池；
- 九个注册的常规 colorway；
- 固定的柔雾树脂表现；
- 色彩系列中的二十四款 matte 模型与九个常规色值；
- `collectSeries.ts` 注册的十三个特殊池，全部每次消耗六张券；
- Diamond Unicorn、Diamond Dog、Jelly Jade 及其旧 tint 已完全离线归档，
  当前应用不再提供已有本地藏品、详情或 Lab 兼容；
- 当前抽取、收藏、缩略图与 3D 详情能力。

二十四个普通模型的换色目标不同；“colorway”不等于每只模型都改变完整身体颜色。

ZZZ 已复用小猫、海豹和考拉三款现有睡姿。注册表以外的新姿态、新动物、
新水晶、新金属、毛绒和陶瓷仍只能作为 planned capability。
旧 Jelly Jade、八材质、Color Dog、Color Unicorn 实验、归档模型与 Lab 路由不是当前可抽取能力。

文件存在于仓库不等于产品可用。代码 active registry 与人类可读资产注册表必须同时明确 availability。

## 八、Agent 治理

### Resonance Agent

- 使用主动偏好和真实收藏行为发现匿名共鸣；
- 输出结构化候选、共享信号和可解释理由；
- 内部可以有 score 与 confidence，但前台不展示百分比；
- 第一版优先使用 deterministic rule-based logic；
- 即使未来接入 LLM，也必须保留 deterministic fallback；
- 不得生成不存在的资产、人格结论或人口属性。

### Evolution Agent

Evolution 的定义是可控的 policy / config evolution：

```text
Observe -> Reason -> Propose -> Human Approve -> Apply -> Measure -> Adjust
```

Agent 可以提出使用当前模型、颜色、权重、活动时长、任务和奖励的 Campaign；不得自动改源码，不得无审批发布，不得将依赖未来资产的提案包装成可立即执行。

所有 Proposal 必须包含 capability feasibility：

- `available_now`
- `requires_configuration`
- `requires_engineering`
- `requires_asset_creation`

只有 `available_now` 或经过审阅的 `requires_configuration` 可以进入人工批准。

## 九、3D 与性能原则

- 模型路径、palette 和渲染能力集中配置，不散落在页面；
- 页面不创建自己的 GLTFLoader；
- `ToyViewer` 统一管理加载、相机、灯光、材质、交互、状态、清理与性能档位；
- 普通列表、Collection、Representative 和 Echo 卡片使用缩略图；
- Collect 系列货架是受控例外：每个系列最多一个 canvas / renderer，卡内模型共享旋转；
  当前一张色彩卡与十三张特殊卡最多保留十四个系列 WebGL context；若按当前
  六十个模型格逐项创建 canvas，context 数会远超移动端预算，因此严禁为每个
  模型各建 canvas。特殊卡继续按 viewport 懒初始化，并应评估离屏 renderer 回收；
- 除该系列货架外，同一主要页面默认只保留一个活跃 live Viewer；
- GLB 保持移动端优化并使用版本化路径；
- 必须有 loading、error、retry 和首次访问可用的静态 fallback；
- 动效尊重 `prefers-reduced-motion`；
- React + Vite 应用已经替代单文件 Hero；旧实现不再保留在工作树，只通过
  Git 历史提供有记录的回滚。

## 十、视觉原则

- 3D Companion 获得页面最大面积和最高视觉优先级；
- UI 使用足够留白并主动后退；
- 保留现有 Rose Frost 的品牌识别、触感、圆角与柔和阴影；
- 大面积逐步转为 off-white、低饱和绿和雾蓝；
- 品牌粉作为温暖识别色，而不是铺满全部大面；
- Crystal 与 Echo 使用独立、克制的语义 accent；
- 不建设复杂背景场景；
- 不使用高刺激霓虹、赌场金色、爆炸特效或卡片墙；
- 标题可以有性格，但不能压过 Companion；
- 所有状态不能只依赖颜色表达。

## 十一、数据与安全原则

- 基础模型、收藏实例和用户所有权必须分离；
- Favorite、Representative、Signature、Echo 与 Campaign 使用完整类型；
- UI 不直接依赖 mock fixture、`localStorage` 或 Supabase 表；
- repository / service adapter 隔离本地 Demo 与未来云端实现；
- 真实抽取、票券扣减和收藏写入最终必须由可信服务端原子处理；
- 用户数据使用 RLS 和最小披露；
- Echo 只返回 UI 必需的匿名投影；
- analytics 不包含真人照片、聊天内容、精确位置或敏感身份；
- 浏览器代码只使用 publishable key，不暴露 service-role secret。

## 十二、首期明确不做

- 未经验证的新 3D 模型或自动生成 GLB；
- 房间、小屋、森林、花园或复杂 3D 世界；
- Companion 养成或自主 AI 行动；
- 实时多人同步；
- 自由文本 Chat、私信；
- 真人头像社交；
- 用户动态 Feed；
- 关注、粉丝、排名或热度体系；
- 地理位置匹配、Dating、无限滑卡；
- 大型社交推荐系统；
- Agent 自动改源码或自动上线；
- 为展示 AI 强制新增 API key；
- 把 legacy、experimental 或 planned 资产当作 available。

## 十三、实施与变更规则

1. 修改一级导航、核心循环、active asset、3D 加载策略或首期非目标前，先更新本文件。
2. 详细页面、数据、Agent、copy 与验收见 `docs/COMPANION_ECHO_PRODUCT_BASELINE.md`。
3. 当前事实与批准目标必须分栏记录，文档不得提前声称未实现能力已经上线。
4. 先保留稳定的 3D、抽取、收藏、响应式与主题基础，再逐步替换 Feed / Friends 的产品地位。
5. 每个阶段必须有兼容、验证与回滚路径，不做一次性大爆炸重写。
6. 新状态先通过 typed local adapter 验证，再迁移到 Supabase 或 API。
7. 没有 lint 或 test 脚本时，应诚实记录缺失，不能伪造执行结果。

## 十四、当前迁移说明

当前 React MVP 仍运行：

```text
好友动态互动 -> 增加抽取券 -> 客户端抽取 -> 自动写入本地收藏
```

它是迁移起点，不是新产品方向的最终结构。当前稳定能力必须保留，但好友 Feed、传统好友关系和互动获券不再是长期产品主线。
