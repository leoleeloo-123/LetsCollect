# 从这里开始

## 项目定位

Let's Collect 是一个围绕数字 Companion 展开的、手机优先的治愈系收藏体验。

当前 React MVP 仍使用“首页 / 抽取 / 收藏 / 好友”四入口；已经批准的目标方向是“Collect / Collection / Echo”三入口。目标尚未全部实现，阅读文档时必须区分 current reality 与 approved target。

## 阅读顺序

开发前按顺序阅读：

1. `docs/PRODUCT_CONSTITUTION.md`：长期产品原则和不可越界事项；
2. `docs/COMPANION_ECHO_PRODUCT_BASELINE.md`：Collect / Collection / Echo、Agent、数据与验收规格；
3. `docs/ASSET_CAPABILITY_REGISTRY.md`：当前真实资产、legacy / planned 边界与 feasibility；
4. `docs/PRODUCT_OVERVIEW.md`：当前实现与批准目标；
5. `docs/ROADMAP.md`：分阶段实施、验收和回滚；
6. `docs/ARCHITECTURE.md`：当前技术边界和目标 adapter / service；
7. `docs/DATA_MODEL.md`：当前数据与目标领域合同；
8. `docs/THEMING.md`：Rose Frost 到 Quiet Collectible 的视觉演进；
9. `docs/THREE_MODEL_GUIDE.md`：GLB、Three.js、缩略图和回退规则；
10. `docs/COLOR_ANIMALS_V3.md` 与 `docs/DIAMOND_UNICORN_SPECIAL_EXHIBIT.md`：当前 active 系列和特殊展品。

`docs/SOCIAL_COLLECTING_V1.md` 是历史探索记录，不再作为新导航、好友 Feed 或八材质图鉴的实施依据。

## 本地与远程位置

本地项目：

`C:\Users\licunhongyu\Desktop\LetsCollect`

GitHub：

`https://github.com/leoleeloo-123/LetsCollect`

线上 Vercel：

`https://lets-collect.vercel.app/`

## Git 与发布

- `main` 是当前 React MVP 和 Vercel Production 的发布分支；
- 推送 `main` 会触发 Vercel Production；
- `legacy/hero-prototype/` 保留旧 HTML Hero 作为视觉与 3D 行为参考；
- 未经用户明确确认，不推送 `main`、不改变线上根入口。

## Current reality：当前应用

技术栈：

- React 18；
- Vite；
- TypeScript；
- React Router；
- Three.js；
- Lucide React；
- Supabase 匿名 Auth 与 Profile；
- 浏览器本地票券、收藏和好友 Demo 状态；
- IndexedDB 3D 缩略图缓存。

当前 C 端路由：

- `/`：六个 Color Animals 3D stage、每日仪式和好友动态；
- `/draw`：客户端 Mock 抽取；
- `/collection`：本地收藏、图鉴、成就与 3D 详情；
- `/friends`：本地好友管理；
- `/onboarding`：匿名身份；
- `/explore -> /`；
- `/profile -> /friends`。

Lab routes 是内部资产验证页面，不是 C 端产品能力。

## 当前真实资产

- 六个 active Color Animals；
- 九个常规 colorway；
- 一只 Diamond Unicorn；
- Diamond Unicorn 五个 tint；
- 常规抽取分支 95%；
- Diamond Unicorn 特殊分支 5%。

六个普通模型的换色目标不同；完整路径、大小、palette 与实现见 `docs/ASSET_CAPABILITY_REGISTRY.md`。

## 当前已经可以验证

```text
匿名 onboarding
-> 好友动态互动增加本地票券
-> 客户端抽取
-> 立即写入本地 Collection
-> 揭晓
-> 缩略图与 3D 详情
```

还可以验证：

- 六个 active GLB 的加载与真实 model-specific colorway；
- Diamond Unicorn 五个 tint 与 5% 分支；
- 收藏网格、图鉴、成就和详情浮层；
- 手机底部导航与桌面顶栏；
- localStorage 刷新保留；
- Supabase profile 创建与 session 恢复。

## 当前尚未实现

- Collect / Collection / Echo 三入口；
- Favorite、最多三只 Representative Companions；
- Collection Signature；
- 偏好、typed analytics、Echo、Collect Together；
- Resonance / Evolution Agent 与 Agent Console；
- 云端收藏、票券和服务端权威抽取；
- lint 与自动化 test 工具链；
- 首次访问可靠的静态 3D fallback。

## 目标路由

批准后的方向：

- `/`：Collect；
- `/collection`：Collection；
- `/echo`：Echo；
- `/agent` 或 `/agent-console`：独立 Internal / Demo；
- `/draw`：迁移期兼容入口；
- `/friends`：Echo 完成前保留，之后退出一级导航。

文档更新不代表这些目标路由已经上线。

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
7. Legacy Hero 在替代流程完成远程验证前继续保留；
8. 未经用户明确确认，不修改线上根入口或推送到 `main`。

藏品生成与未来数据边界见：

`playbooks/collectible-generation-architecture.md`
