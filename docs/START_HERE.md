# 从这里开始

## 项目定位

Let's Collect 是一个以 3D 数字收藏玩具为核心、优先服务手机端的收藏产品。

开发前先阅读：

- `docs/PRODUCT_CONSTITUTION.md`：产品方向和不可随意改变的边界；
- `docs/PRODUCT_OVERVIEW.md`：当前产品状态；
- `docs/SOCIAL_COLLECTING_V1.md`：社区、收藏身份与成就系统的第一轮产品基线；
- `docs/ROADMAP.md`：实施顺序和验收闸门；
- `docs/ARCHITECTURE.md`：前后端与 3D 模块边界；
- `docs/THEMING.md`：前端主题变量、样式分层与调整规则；
- `docs/THREE_MODEL_GUIDE.md`：GLB 与 Three.js 资产规则。
- `docs/COLOR_ANIMALS_V3.md`：当前软萌变色小动物系列、移动端预算与回退方案。

## 本地与远程位置

本地项目：

`C:\Users\licunhongyu\Desktop\LetsCollect`

GitHub：

`https://github.com/leoleeloo-123/LetsCollect`

线上 Vercel：

`https://lets-collect.vercel.app/`

## Git 状态

- `main` 是当前 React MVP 和 Vercel Production 的发布分支；
- `legacy/hero-prototype/` 继续保留旧 HTML Hero 作为视觉参考；
- 推送 `main` 会触发 Vercel Production，未经明确确认不要操作。

## 当前线上入口

`vercel.json` 将 `/` 重写到：

`/`

当前默认 Hero 页面加载：

`Color Dog / Color Bird / Color Teddy / Color Bunny / Color Cat / Color Panda` 六种移动端模型展示。

## 当前 React MVP

技术栈：

- React 18；
- Vite；
- TypeScript；
- React Router；
- Lucide React；
- Supabase 匿名 Auth 与 Profile；
- 浏览器本地藏品、票券和社交 Mock 状态。

一级路由：

- `/`：首页与好友动态；
- `/draw`：Mock 抽取；
- `/collection`：收藏；
- `/friends`：好友；
- `/login`、`/register`：认证边界占位。

旧 `/explore` 会回到首页，旧 `/profile` 会转到好友页。

## 已经可以验证的流程

```text
好友动态互动 -> 抽取券增加 -> 生成独立材质藏品 -> 揭晓 -> 收藏更新
```

还可以验证：

- 六种 Color Animals 移动端 GLB 的动态展示、随机配色与详情保护；
- 收藏筛选、材质工艺品质与 3D 详情浮层；
- 好友搜索、添加与接受申请；
- 手机端底部导航；
- 桌面端顶部导航；
- 本地状态刷新后保留；
- 好友页重置演示数据。

## 尚未接入

- 云端藏品、抽奖和票券表；
- 真实好友关系；
- 服务端抽取；
- 权威抽取券流水；
- 木头 UV 纹理、玻璃厚度细节和更细致的水晶内含物资产；
- 抽奖记录点赞与真实动态流。

## 常用命令

```powershell
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

## 修改规则

1. 修改一级导航、核心循环、3D 加载策略或首期非目标前，先更新产品宪法；
2. 列表使用缩略图，不为每个卡片加载 GLB；
3. 页面不直接创建自己的 GLTFLoader；
4. 真实抽取和票券写入必须由服务端负责；
5. Legacy Hero 在 React 版本完成远程验证前继续保留；
6. 未经用户明确确认，不修改线上根入口或推送到 `main`。

藏品生成规则与未来数据边界见：

`playbooks/collectible-generation-architecture.md`
