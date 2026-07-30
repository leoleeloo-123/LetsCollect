# 渲染与表面效果升级计划

状态：阶段 2 已完成；阶段 3 的金、银、玫瑰金已完成，局部毛绒实验已退役
基线日期：2026-07-30

## 当前基线

- 正式阵容固定为 24 只 Color Animals。
- Color Bird v002 只改变皇冠颜色。
- Color Penguin v003 只改变耳罩顶部与杯子颜色。
- Color Teddy 已完整归档，不保留产品兼容路径。
- Bird 与 Penguin 都通过 `color-accessory-mask` 接入。
- `catalog.ts`、抽取池、特殊系列和 `capabilityRegistry.ts` 使用同一套
  24 模型清单。
- 归档 payload 只保存在本地，Git 仅保存每个归档模型的 README。

这份基线必须先通过 typecheck、production build 和移动端视觉检查，再开始
改变材质参数或渲染架构。

## 目标

1. 让 Lab、详情、系列舞台和缩略图使用同一份模型外观准备逻辑。
2. 建立可快速比较 24 只模型和全部色板的检查页面。
3. 在普通柔雾颜色之外增加金、银、玫瑰金和珠光闪粉表面。
4. 降低列表首次访问时的 WebGL、Draco 解码和 shader 编译成本。
5. 为确定性生成规则和资产注册一致性增加自动化保护。

## 阶段 1：全模型外观检查页

新增独立开发 HTML `/appearance-lab/`，作为后续重构和材质开发的视觉基准。
该入口不属于产品 SPA，也不进入默认 `vite build` 的生产产物。

实现状态（2026-07-30）：

- 24 只正式模型 ID 已收敛到 `formalColorAnimalModelIds`，目录、抽取池与能力
  注册表共享这一清单；
- `/appearance-lab/` 已提供柔雾 24 × 9、金/银/玫瑰金各 24 个样本、
  系列/模型/配色/表面筛选及单个实时 3D 检查器；
- 默认先加载同一配色下的 24 只模型，确认全阵容后再手动展开全部 9 色；
- 216 个缩略图按可视区域进入串行队列，不创建 216 个 WebGL context；
- 手机端全阵容视图固定为 4 列，桌面端按模型展示 9 色横向对照；
- 旧 `/asset-lab` 多画布页面与产品路由均已删除；
- Lab 使用独立 HTML 与 React 入口，正式首页构建不包含 Lab chunk 或样式；
- 金、银、玫瑰金样本已完成；局部毛绒样本经评审后退役，珠光闪粉与奖励规则
  仍待后续阶段。

- 正式范围只读取 `colorAnimalModels`，不显示 Jelly Jade、Crystal 或 archive。
- 支持按模型、颜色和表面类型筛选。
- 默认展示 24 × 9 的普通柔雾矩阵。
- 页面不能创建 216 个 WebGL context。
- 优先使用同一缩略图渲染队列或静态 WebP；选中单格后才挂载一个实时 3D
  检查器。
- 提供模型加载失败、遮罩缺失和重复 ID 的明确状态。
- 记录固定相机、灯光、背景和渲染版本，便于前后截图对比。

## 阶段 2：生产渲染入口收敛

当前 14 个模型已经走 `color-accessory-mask` profile，剩余 10 个模型仍使用
独立 rendering mode。建立一个穷尽式外观注册表，统一返回：

```ts
type PreparedToyAppearance = {
  materials: Three.Material[];
  textures: Three.Texture[];
  updatePalette: (palette: ToyPaletteDefinition) => void;
  dispose: () => void;
};
```

`ToyViewer`、`SeriesToyViewer` 和 `ThumbnailRenderer` 只调用这一入口，不再各自
维护模型分支。新增 rendering mode 或 profile 未注册时必须由 TypeScript 报错。

验收重点：

- 三条生产路径换色一致；
- dispose 不遗漏材质、贴图或替换后的 geometry；
- 缩略图是回归红线；
- shader cache key 必须包含 profile、debug 状态和表面档位。

## 阶段 3：色板表面档位

颜色和表面效果分开建模。建议将色板扩展为：

```ts
type ToySurfaceStyle =
  | { kind: "matte" }
  | { kind: "metal"; metal: "gold" | "silver" | "rose-gold" }
  | { kind: "pearl-glitter"; intensity: number };

type ToyPaletteDefinition = {
  // existing color fields
  surface?: ToySurfaceStyle;
};
```

规则：

- 不填写 `surface` 时必须保持当前普通柔雾效果完全不变。
- 金属只改变模型已批准的换色区域，不覆盖身体和五官。
- 金属档读取独立的 metalness、roughness、envMapIntensity 和 clearcoat。

- 珠光闪粉使用稳定的物体空间细闪与轻微珠光偏色，避免屏幕空间噪点在旋转时
  跳动。
- 详情使用完整参数；系列舞台与缩略图使用 lightweight 参数。
- 同一个颜色可以与不同表面组合，避免复制整套色板。

第一轮先完成三种金属；下一轮再做一个低强度珠光闪粉样本。
所有新表面都不直接进入抽取经济，先在
本地 `/appearance-lab/` 做 24 模型覆盖检查，再决定奖励与 Echo 解锁规则。

局部毛绒原型曾复用各模型现有换色遮罩，但换色目标同时包含食物、衣物和配件，
统一毛绒处理无法在 24 只模型上保持语义一致，因此不再作为通用表面档位。
Jelly Jade 同样不作为这些局部换色区域的通用表面，只保留在历史归档语境。

### 本轮实现状态（2026-07-30）

- `ToyViewer`、`SeriesToyViewer` 与 `ThumbnailRenderer` 已统一调用
  `prepareToyAppearance`，模型分支、资源释放和调色更新不再维护三份。
- `Collectible.surfaceStyleId` 为可选字段；缺省值始终回退到 `matte`，已有收藏
  和普通柔雾画面不发生迁移或视觉变化。
- `metal-gold`、`metal-silver` 与 `metal-rose-gold` 使用固定金属色，并按
  detail / compact / tile / thumbnail 分档配置 metalness、roughness 与
  envMapIntensity。
- 金属参数复用各模型现有 shader 遮罩表达式，只覆盖已批准的皇冠、帽子、包、
  杯子、衣服、书本、气球等改色区域，不覆盖动物主体与五官。
- shader program cache key 与缩略图 appearance signature 均包含表面身份，避免
  柔雾与三种金属之间互相串用缓存。
- Appearance Lab 保留“柔雾树脂 / 金属”表面材质与独立配色控制：金属显示
  金/银/玫瑰金，柔雾显示九组常规配色。
- Lab 新增独立舞台背景维度：动态初冬、动态暖春、静态淡绿和静态淡紫。
  动态粒子只在单个实时 3D 检查器播放，24 个缩略图只继承主题底色。
- 当前矩阵共 24 ×（9 个柔雾配色 + 3 个金属色）× 4 个背景，即
  1,152 种可检查组合。
- 本地 Lab 已完成柔雾、三种金属与四组背景的 24/24 真实浏览器检查。
- 尚未开始：珠光闪粉、奖励/Echo 解锁规则和静态 WebP 预渲染。

## 阶段 4：静态优先缩略图

- 复用生产缩略图逻辑生成 24 × 9 的普通柔雾 WebP。
- 输出带 manifest 和渲染版本，支持增量生成。
- Collection 和其他列表优先读取静态图，不在首屏启动 WebGL。
- 详情先显示同构静态图，再无跳变替换为实时 3D。
- IndexedDB 继续作为静态图缺失或新表面实验的兜底。

不要做全量 GLB 重压缩。当前主要成本是运行时解码、材质准备、shader 编译和
WebP 编码；只有超预算的单个模型需要单独处理。

## 阶段 5：Lab 与测试收口

- 把重复 Lab 生命周期收敛为通用壳层和模型配置。
- 保留已分享旧 Lab URL 的重定向。
- Lab debug shader 与生产 shader 必须共用材质工厂。
- 增加确定性生成、24 模型注册一致性、系列成员有效性和资产路径存在性测试。
- 每个阶段都执行 typecheck、production build 和真实浏览器视觉检查。

## 建议提交顺序

1. `test: add roster and asset contract checks`
2. `feat: add 24-model appearance lab`
3. `refactor: centralize toy appearance preparation`
4. `feat: add metal and pearl-glitter surface styles`
5. `perf: prerender static toy thumbnails`
6. `refactor: consolidate model labs`

每个提交必须可独立回滚。金属与闪粉工作不得早于生产渲染入口收敛。
