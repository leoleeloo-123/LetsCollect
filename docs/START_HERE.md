# 从这里开始

## 项目定位

Let's Collect 是一个围绕数字 Companion 展开的、手机优先的治愈系收藏体验。

产品表达是：

`Collect · Connect · Companion`

收藏是前台主体验；Echo 是有限、匿名、无聊天的 Soft Connection；Agent 在幕后寻找可解释的微小共鸣，并在明确能力边界和人工批准下提出运营配置。

## 当前实施状态

`codex/companion-echo-frontend` 分支已经实现第一版 Collect / Collection / Echo 前端和独立 Agent Console。`main` 与 Vercel Production 尚未被这个分支替换。

2026-07-24 起，Collect 第一页进入“按系列选择、在当前页揭晓”的第二轮：
默认复用六只 live 3D 玩偶舞台，系列可左右切换；首次注册依次收集昵称、
伙伴、颜色和质感偏好。完整决定与回滚见 `docs/COLLECT_SERIES_V2.md`。

改造前的 React MVP 已完整归档到：

`archive/react-mvp-v1/`

迁移原因、影响、验证与回滚见：

`docs/COMPANION_ECHO_FRONTEND_V1.md` 与 `docs/COLLECT_SERIES_V2.md`

## 阅读顺序

开发前按顺序阅读：

1. `docs/PRODUCT_CONSTITUTION.md`：长期产品原则和不可越界事项；
2. `docs/COMPANION_ECHO_PRODUCT_BASELINE.md`：Collect / Collection / Echo、Agent、数据与验收规格；
3. `docs/COMPANION_ECHO_FRONTEND_V1.md`：当前实现、归档、验证和回滚；
4. `docs/COLLECT_SERIES_V2.md`：系列盲盒、原地揭晓、注册偏好与回滚；
5. `docs/ASSET_CAPABILITY_REGISTRY.md`：当前真实资产、legacy / planned 边界与 feasibility；
6. `docs/PRODUCT_OVERVIEW.md`：产品范围与核心循环；
7. `docs/ROADMAP.md`：分阶段实施与服务端演进；
8. `docs/ARCHITECTURE.md`：技术边界和 adapter / service；
9. `docs/DATA_MODEL.md`：当前数据与目标领域合同；
10. `docs/THEMING.md`：Rose Frost 到 Quiet Collectible 的视觉演进；
11. `docs/THREE_MODEL_GUIDE.md`：GLB、Three.js、缩略图和回退规则；
12. `docs/COLOR_ANIMALS_V3.md` 与 `docs/DIAMOND_UNICORN_SPECIAL_EXHIBIT.md`：active 系列和特殊展品。

`docs/SOCIAL_COLLECTING_V1.md` 是历史探索记录，不再作为新导航、好友 Feed 或八材质图鉴的实施依据。

## 本地与远程位置

本地项目：

`C:\Users\licunhongyu\Desktop\LetsCollect`

GitHub：

`https://github.com/leoleeloo-123/LetsCollect`

线上 Vercel：

`https://lets-collect.vercel.app/`

## Git 与发布

- `main` 是 Vercel Production 的发布分支；
- 当前改造分支是 `codex/companion-echo-frontend`；
- 推送 `main` 会触发 Vercel Production；
- `archive/react-mvp-v1/` 保存改造前 React MVP；
- `legacy/hero-prototype/` 保存更早的 HTML Hero；
- 未经用户明确确认，不推送 `main`、不改变线上根入口。

## Current reality：当前分支应用

技术栈：

- React 18；
- Vite；
- TypeScript；
- React Router；
- Three.js；
- Lucide React；
- Supabase 匿名 Auth 与 Profile；
- 浏览器本地票券、收藏偏好、Favorite、Representative 和 Echo Demo 状态；
- IndexedDB 3D 缩略图缓存；
- typed local analytics adapter。

当前 C 端路由：

- `/`：Collect，按系列左右切换 live 3D 成员，并在当前页扣券、揭晓和入柜；
- `/draw`：旧随机抽取兼容入口，不再是 Collect 首页主流程；
- `/collection`：最多三只 Representative、Favorite、真实 metadata 筛选、Collection Signature 和 3D 详情；
- `/echo`：每日最多三条匿名 Echo、可解释共鸣和一个极简 Collect Together；
- `/onboarding`：Supabase 匿名身份与四步 Taste 偏好注册；
- `/friends -> /echo`；
- `/profile -> /collection`。

内部路由：

- `/agent`：Evolution Agent Console；
- 各模型 Lab route：资产和材质验证，不是 C 端产品能力。

Primary navigation 只有 Collect、Collection、Echo。Agent 入口被明确标记为 Internal。

## 当前真实资产

- 六个 active matte Color Animals；
- 九个常规 colorway；
- 一只 Diamond Unicorn；
- Diamond Unicorn 五个 tint；
- 常规抽取分支 95%；
- Diamond Unicorn 特殊分支 5%。

六个普通模型的换色目标不同；完整路径、大小、palette 与实现见 `docs/ASSET_CAPABILITY_REGISTRY.md`。

本次前端没有修改 GLB、shader、保护 mask、模型路径或抽取概率。

## 当前可以验证的流程

```text
首次注册昵称 / 头像
-> 依次选择伙伴 / 颜色 / 材质偏好
-> 左右切换 Collect 系列
-> 查看该系列 live 3D 成员
-> 当前页抽取、柔和揭晓并立即加入本地 Collection
-> Favorite / Representative
-> 规则生成 Collection Signature
-> 查看有限匿名 Echo
-> Leave an Echo / Let it drift
-> mutual 后推进 Collect Together
-> 完成时获得一次额外抽取
-> 返回 Collect
```

Agent Demo：

```text
Observe
-> Reason
-> Propose
-> Human Approve
-> Measure
```

- Calm Green Week 只引用当前真实 matte 模型与颜色；
- Sleepy Crystal Night 明确显示 `requires_asset_creation`；
- 依赖不存在资产的提案不可批准或发布。

## 状态与 adapter 边界

- `MvpStateProvider` 是当前 collector 本地 repository adapter；
- storage key 继续使用 `lets-collect-mvp-state-v12`，并兼容旧快照；
- Echo 使用独立 service / repository 和本地 Demo fixtures；
- Resonance 是 deterministic、结构化、可追溯 fallback，不依赖 LLM API；
- Evolution 使用聚合 Demo signals 与 deterministic feasibility；
- UI 不直接解析自由文本 Agent 输出；
- typed analytics 不记录照片、聊天、精确位置或敏感身份。

## 当前尚未实现

- 云端收藏、票券、Favorite、Representative 与 Echo 持久化；
- 服务端权威抽取；
- 生产多用户 Resonance；
- 生产 Campaign 应用、发布与测量；
- 自由文本 Chat、私信、关注 / 粉丝与实时多人；
- 新的 Sleepy / Quirky / Cool 模型；
- 新的 fuzzy / metallic / porcelain 材质；
- pending draw-result transaction；
- lint 与自动化 test 工具链；
- 首次访问可靠的静态 3D poster fallback。

这些能力不得在 C 端假装已经存在。

## 常用命令

```powershell
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

当前 `package.json` 没有 `lint` 或 `test` 脚本。交付时必须如实说明，不得声称已执行不存在的命令。

## 修改规则

1. 修改一级导航、核心循环、active asset、3D 加载策略或首期非目标前，先更新产品宪法；
2. 列表使用缩略图，不为每张卡片加载 GLB；
3. 页面不直接创建自己的 GLTFLoader；
4. 真实抽取和票券写入必须由可信服务端负责；
5. current、target、planned 不得混写；
6. Agent 不得生成不存在的资产或跳过人工批准；
7. Legacy Hero 和 React MVP archive 在替代流程完成远程验证前继续保留；
8. 未经用户明确确认，不修改线上根入口或推送到 `main`。

藏品生成与未来数据边界见：

`playbooks/collectible-generation-architecture.md`
