# 产品概览

状态：当前实现与已批准目标并行记录
日期：2026-07-24

## 产品是什么

Let's Collect 是一个围绕数字 Companion 展开的治愈系收藏体验。

用户通过遇见、选择和收藏 Companion 表达审美与偏好；系统从真实收藏行为中发现人与人之间细微的共鸣。收藏是前台主体验，Echo 是低压力的第二层体验，Agent 是幕后解释与运营能力。

```text
Collect · Connect · Companion
```

> Collect what you love. Meet who understands.

长期原则见 `docs/PRODUCT_CONSTITUTION.md`，详细目标规格见 `docs/COMPANION_ECHO_PRODUCT_BASELINE.md`。

## Current reality：当前已经实现

当前 `main` 是 React + Vite + TypeScript SPA，并由 Vercel Production 部署。

技术和数据现状：

- React Router 路由和响应式 App Shell；
- Supabase 匿名 Auth 与 `profiles`；
- 本地 `MvpStateProvider` 保存票券、收藏、好友和最近抽取；
- 收藏状态使用 `localStorage`，3D 缩略图使用 IndexedDB；
- 抽取结果和票券仍由客户端 Demo 逻辑产生，不是权威后端；
- 共享 Three.js `ToyViewer`、本地 Draco、模型解码缓存、加载与错误状态；
- Collection Grid、图鉴、成就和选中藏品 3D 详情；
- Legacy Hero 保留在 `legacy/hero-prototype/` 作为视觉与行为参考。

当前 C 端路由：

- `/`：六只 3D Companion、每日仪式与好友动态；
- `/draw`：客户端 Mock 抽取与揭晓；
- `/collection`：本地收藏、图鉴、成就和详情；
- `/friends`：本地好友搜索、申请和管理；
- `/onboarding`：匿名身份与 profile；
- Lab routes：内部 3D 资产验证。

当前抽取会在揭晓前立即扣除票券并写入 Collection。当前没有 Favorite、Representative、Signature、Echo 或 Agent。

## Current assets：当前真实资产

当前 active 内容只有：

- 六个 Color Animals matte / 柔雾树脂 Companion；
- 九个注册 colorway；
- 一只 Diamond Unicorn 特殊展品；
- Diamond Unicorn 五个运行时 tint；
- 常规分支 95%，Diamond Unicorn 分支 5%。

六个普通模型使用不同的真实换色目标，不能统一描述为“全身换色”。完整路径、大小、palette、实现方式和 availability 见 `docs/ASSET_CAPABILITY_REGISTRY.md`。

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

## 目标能力

### Collect

- 一个主要 live 3D Companion；
- 六个真实模型与真实 colorway 偏好；
- 柔和、非老虎机式揭晓；
- 以 Companion、colorway、Matte / Crystal 和简短描述为主要信息。

### Collection

- 现有缩略图网格与详情 Viewer；
- Favorite；
- 最多三只 Representative Companions；
- Model / Colorway / Material / Date 筛选；
- 从真实信号派生的 Collection Signature。

### Echo

- 每日有限匿名候选；
- Representative Companions 作为匿名形象；
- 可解释 resonance reasons；
- Leave an Echo / Let it drift；
- mutual 后可选的一张极简 Collect Together 进度卡；
- 无真人照片、Match percentage、Chat、Feed 或在线状态。

### Agents

- Resonance Agent：deterministic、结构化、可解释，外部模型不是基础流程依赖；
- Evolution Agent：Observe → Reason → Propose → Human Approve → Apply → Measure；
- 所有 Campaign 必须经过 capability feasibility 与人工批准；
- 依赖未来资产的提案只能成为 Roadmap Proposal。

## 当前不是正式能力

- 云端收藏和跨设备所有权；
- 服务端权威抽取、票券流水和概率版本；
- Favorite、Representative、Signature；
- Echo、Shared Collection Task；
- Resonance / Evolution Agent；
- Campaign 配置与发布；
- typed analytics 后端；
- lint 与自动化测试工具链。

## 迁移原则

1. 保留当前稳定的 3D、抽取、收藏、响应式和视觉基础；
2. 先更新文档、capability 和状态合同，再改变导航；
3. `/draw`、`/friends` 与现有 localStorage 必须有兼容和回滚；
4. 不把 planned 或 legacy 能力提前展示为 available；
5. 不换框架，不建设平行 Demo，不做一次性大重写。
