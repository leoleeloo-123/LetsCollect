# 产品概览

状态：当前实现与已批准目标并行记录
日期：2026-07-28

## 产品是什么

Let's Collect 是一个围绕数字 Companion 展开的治愈系收藏体验。

用户通过遇见、选择和收藏 Companion 表达审美与偏好；系统从真实收藏行为中发现人与人之间细微的共鸣。收藏是前台主体验，Echo 是低压力的第二层体验，Agent 是幕后解释与运营能力。

```text
Collect · Connect · Companion
```

> Collect what you love. Meet who understands.

长期原则见 `docs/PRODUCT_CONSTITUTION.md`，详细目标规格见 `docs/COMPANION_ECHO_PRODUCT_BASELINE.md`。

## Current reality：当前已经实现

当前开发事实以 `codex/companion-echo-frontend` 为准：它是 React + Vite +
TypeScript SPA，并跟踪同名 GitHub 远程分支。`main` 仍是 Vercel Production
发布分支，但尚未由当前 Companion / Echo 开发分支替换。

技术和数据现状：

- React Router 路由和响应式 App Shell；
- Supabase 匿名 Auth 与 `profiles`；
- 本地 `MvpStateProvider` 保存票券、收藏、好友和最近抽取；
- 收藏状态使用 `localStorage`，3D 缩略图使用 IndexedDB；
- 抽取结果和票券仍由客户端 Demo 逻辑产生，不是权威后端；
- 共享 Three.js `ToyViewer`、本地 Draco、模型解码缓存、加载与错误状态；
- Collection 缩略图网格、Favorite、Representative、Signature 和选中藏品 3D 详情；
- 已退役的单文件 Hero 已从工作树移除，需要历史对照时从 Git 提交
  `d34f28c` 恢复。

当前 C 端路由：

- `/`：色彩系列与特殊系列卡片架，以及原地揭晓；
- `/draw`：兼容的客户端全局 Mock 抽取与揭晓；
- `/collection`：本地收藏、Favorite、Representative、Signature 与 3D 详情；
- `/echo`：有限、匿名、确定性的本地 Echo 演示；
- `/onboarding`：匿名身份与 profile；
- `/agent`：独立 Internal / Demo Agent Console；
- Lab routes：内部 3D 资产验证。

`/friends` 与 `/profile` 只作为兼容重定向。当前抽取会在揭晓前立即扣除
票券并写入 Collection；Favorite、Representative、Signature、Echo 与
Agent Console 已有本地演示实现，但票券、所有权、Echo 和 Agent 审批均
不是生产权威服务。

## Current assets：当前真实资产

当前 active 内容为：

- 二十四个 Color Animals matte / 柔雾树脂 Companion；
- 九个注册常规 colorway；
- Collect 首页的色彩系列：选择九色之一后，在二十四个 matte 模型中严格等概率
  `1 / 24` 抽取；
- Collect 首页的特殊系列：`collectSeries.ts` 注册的十三个特殊系列各自
  使用独立、可审计的模型池，全部每次六张券；
- Diamond Unicorn、Diamond Dog 与 Jelly Jade 已完全离线归档，不在
  `public/`、当前类型、catalog、旧藏品详情或 Lab 中；
- 兼容 `/draw` 现在只从二十四只 matte 伙伴中均等抽取，不再生成 Crystal。

二十四个普通模型使用不同的真实换色目标，不能统一描述为“全身换色”。
ZZZ 复用小猫、海豹和考拉三款现有睡姿。Crystal 与 Jelly Jade 仅作为
本地离线归档存在；完整当前路径、大小、palette、实现方式和 availability
见 `docs/ASSET_CAPABILITY_REGISTRY.md`。

旧 Jelly Jade、八材质、归档模型和 Lab 实验是 legacy / experimental，不是当前可抽取内容。

## Approved target：已经批准但尚未全部实现

目标 C 端一级入口收敛为：

1. `Collect`
2. `Collection`
3. `Echo`

目标核心循环：

```text
表达偏好
-> 遇见 Companion
-> 加入 Collection
-> 形成 Collection Signature
-> 看见有限匿名 Echo
-> 可选 Collect Together
-> 返回 Collect
```

目标产品比例：

- 80% Collect / Collection；
- 15% Echo；
- 5% Agent 展示。

Agent Console 使用独立 Internal / Demo route，不进入 C 端主导航。

## 当前分支已经实现的本地 Demo 能力

### Collect

- 一个可扩展的系列卡片架，而不是卡片内部的全局分页器；
- 第一张色彩系列卡展示二十四个真实 matte 模型，并用九个色点切换全卡配色；
- 每个特殊系列独立成卡，模型池、配色策略、概率与票券成本集中配置；
- 每张卡使用一个 live canvas 让卡内模型同步旋转，下方卡片临近 viewport 才初始化；
- 当前一张色彩卡与十三张特殊卡各使用一个 canvas；特殊卡接近 viewport
  才初始化，离屏时停止无意义渲染。用户滚动访问全部卡片后最多可同时保留
  十四个系列 WebGL context，而不是为六十个模型格分别建立 canvas；
- 柔和、非老虎机式揭晓；
- 以 Companion、colorway、当前 matte 主题和简短描述为主要信息。

### Collection

- 现有缩略图网格与详情 Viewer；
- Favorite；
- 最多三只 Representative Companions；
- 从真实信号派生的 Collection Signature。

Model / Colorway / Material / Date 筛选、Representative 排序和真实 profile
展示仍是下一步能力，不属于当前已实现范围。

### Echo

- 每日有限匿名候选；
- Representative Companions 作为匿名形象；
- 可解释 resonance reasons；
- Leave an Echo / Let it drift；
- mutual 后可选的一张极简 Collect Together 进度卡；
- 无真人照片、Match percentage、Chat、Feed 或在线状态。

### Agents

- Resonance Agent：deterministic、结构化、可解释，外部模型不是基础流程依赖；
- Evolution Agent：当前演示 Observe → Reason → Propose → Human Approve，
  并展示 Measure 区域；Apply 与持久化测量尚未实现；
- 所有 Campaign 必须经过 capability feasibility 与人工批准；
- 依赖未来资产的提案只能成为 Roadmap Proposal。

## 当前只在本地 Demo、不是生产权威能力

- 云端收藏和跨设备所有权；
- 服务端权威抽取、票券流水和概率版本；
- Favorite、Representative、Signature；
- Echo、Shared Collection Task；
- Resonance / Evolution Agent；
- Campaign 配置与发布；
- typed analytics 后端；
- lint 与自动化测试工具链。

`src/config/capabilityRegistry.ts` 的 `currentAssetRegistry` 已与当前二十四
模型 catalog / draw pool 同步，Agent feasibility 使用同一套正式资产边界。

## 迁移原则

1. 保留当前稳定的 3D、抽取、收藏、响应式和视觉基础；
2. 先更新文档、capability 和状态合同，再改变导航；
3. `/draw`、`/friends` 与现有 localStorage 必须有兼容和回滚；
4. 不把 planned 或 legacy 能力提前展示为 available；
5. 不换框架，不建设平行 Demo，不做一次性大重写。
