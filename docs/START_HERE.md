# 从这里开始

## 项目定位

Let's Collect 是一个围绕数字 Companion 展开的、手机优先的治愈系收藏体验。

产品表达是：

`Collect · Connect · Companion`

收藏是前台主体验；Echo 是有限、匿名、无聊天的 Soft Connection；Agent 在幕后寻找可解释的微小共鸣，并在明确能力边界和人工批准下提出运营配置。

## 当前实施状态

`main` 已包含第一版 Collect / Collection / Echo 前端和独立 Agent Console。

截至 2026-07-29，Collect 第一页使用“按系列选择、在当前页揭晓”的第四轮：
首页是一张可切 9 色、包含 24 个正式柔雾模型的「色彩系列」卡，以及按角色、
状态与兴趣组成的 13 张特殊系列卡。所有特殊系列统一为 6 张券；每张系列卡
只使用一个受控 WebGL 舞台，让卡内模型同步原地旋转。色彩系列固定为 4 列 ×
6 行并按 6 只一批渐进加载。新企鹅已替换测试用奶油小熊进入正式阵容；
新小鸟只改变皇冠颜色，企鹅只改变耳罩顶部与杯子；
两只水晶资产继续归档。首次注册依次收集昵称、伙伴、颜色和质感偏好。
完整决定与回滚见 `docs/COLLECT_SERIES_V2.md`。
全模型检查页已在本地开发入口 `/appearance-lab/` 建立 24 × 9 柔雾视觉
基线。它使用独立 HTML，不进入正式首页或默认生产构建；下一阶段的渲染入口
收敛、金银与珠光闪粉计划见
`docs/RENDERING_SURFACE_UPGRADE_PLAN.md`。

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

线上 Vercel（旧 Production）：

`https://lets-collect.vercel.app/`

当前 Netlify Deploy Preview：

`https://deploy-preview-2--letscollect.netlify.app/`

## Git 与发布

- `main` 是 Vercel Production 的发布分支；
- 当前改造分支是 `codex/companion-echo-frontend`；
- 推送 `main` 会触发 Vercel Production；
- `archive/react-mvp-v1/` 保存改造前 React MVP；
- 更早的单文件 HTML Hero 已在 React 替代完成后从工作树移除；如需历史回滚，
  从 Git 提交 `d34f28c` 恢复；
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

- `/`：Collect，从色彩或特殊系列卡选择盲盒，并在当前页扣券、揭晓和入柜；
- `/draw`：旧随机抽取兼容入口，不再是 Collect 首页主流程；
- `/collection`：最多三只 Representative、Favorite、Collection Signature、缩略图网格和单项 3D 详情；
- `/echo`：每日最多三条匿名 Echo、可解释共鸣和一个极简 Collect Together；
- `/onboarding`：Supabase 匿名身份与四步 Taste 偏好注册；
- `/friends -> /echo`；
- `/profile -> /collection`。

内部路由：

- `/agent`：Evolution Agent Console；
- 各模型 Lab route：资产和材质验证，不是 C 端产品能力。

Primary navigation 只有 Collect、Collection、Echo。Agent 入口被明确标记为 Internal。

其中 Collection 当前尚未实现 metadata / acquisition date 筛选、Representative
排序和 profile 展示，不得提前写成现成功能。

## 当前真实资产

- 二十四个 active matte Color Animals，包含皇冠小鸟与耳罩企鹅；
- 奶油小熊已整体归档，不进入 catalog、运行时、Lab 或抽取池；
- 九个常规 colorway；
- Diamond Unicorn、Diamond Dog 与全部 Jelly Jade 已完全离线归档；
- 当前代码不保留旧晶体 tint、历史藏品渲染或对应 Lab；
- 色彩系列包含二十四个柔雾模型，每个色系严格 `1 / 24`；
- 十三个特殊系列按集中配置组合，全部使用 6 张券；
- 旧 `/draw` 与系列抽取都只生成二十四只正式柔雾伙伴。

二十四个普通模型的换色目标不同；完整路径、大小、palette 与实现见 `docs/ASSET_CAPABILITY_REGISTRY.md`。

本轮把已验证的新模型与 shader 接入产品 catalog，但不重建 GLB。

## 当前可以验证的流程

```text
首次注册昵称 / 头像
-> 依次选择伙伴 / 颜色 / 材质偏好
-> 选择色彩系列或一张特殊系列卡
-> 拖动查看该系列可同步旋转的真实 3D 模型
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
- Sleepy Crystal Night 仍显示 `requires_asset_creation`，因为当前只有柔雾猫咪、
  海豹和考拉睡姿，没有对应水晶睡姿资产；
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
- 已注册三只睡姿伙伴之外的更多 Sleepy / Quirky / Cool 模型；
- 新的 fuzzy / metallic / porcelain 材质；
- pending draw-result transaction；
- Collection metadata / acquisition date 筛选与 Representative 排序；
- lint 与自动化 test 工具链；
- 首次访问可靠的静态 3D poster fallback。

这些能力不得在 C 端假装已经存在。

## 当前项目进度

- 已完成：产品宪法、资产注册表、三入口 App Shell、24 模型 Collect 系列货架、
  本地 Collection 表达、有限 Echo Demo、Evolution Agent Console Demo；
- 部分完成：typed adapter 边界、Collection 管理、Campaign 生命周期；部分页面
  仍直接依赖 `MvpStateProvider`，Console 目前只演示 proposal / approve；
- 下一阶段：服务端权威抽取、票券和所有权，user-scoped 云端状态，生产 Echo / Campaign
  审计，以及 lint、自动化测试与真实移动设备性能加固；
- 资产 catalog、抽取池与 `src/config/capabilityRegistry.ts` 已同步为同一套
  24 模型正式阵容。

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
2. 普通藏品、Feed 与历史列表使用缩略图；Collect 系列展示是受控例外，每张
   系列卡最多一个 WebGL canvas，不得为每只模型创建一个 canvas；
3. 页面不直接创建自己的 GLTFLoader；
4. 真实抽取和票券写入必须由可信服务端负责；
5. current、target、planned 不得混写；
6. Agent 不得生成不存在的资产或跳过人工批准；
7. React MVP archive 继续保留；已退役的单文件 Hero 只通过 Git 历史恢复，
   不再保留在当前工作树；
8. 未经用户明确确认，不修改线上根入口或推送到 `main`。

藏品生成与未来数据边界见：

`playbooks/collectible-generation-architecture.md`
