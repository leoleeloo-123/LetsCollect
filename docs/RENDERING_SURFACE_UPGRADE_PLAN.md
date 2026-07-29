# 渲染与表面效果升级计划

状态：准备开工
基线日期：2026-07-29

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
3. 在普通柔雾颜色之外增加金、银金属表面和珠光闪粉表面。
4. 降低列表首次访问时的 WebGL、Draco 解码和 shader 编译成本。
5. 为确定性生成规则和资产注册一致性增加自动化保护。

## 阶段 1：全模型外观检查页

新增内部路由 `/appearance-lab`，作为后续重构和材质开发的视觉基准。

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
  | { kind: "metal"; metal: "gold" | "silver" }
  | { kind: "pearl-glitter"; intensity: number };

type ToyPaletteDefinition = {
  // existing color fields
  surface?: ToySurfaceStyle;
};
```

规则：

- 不填写 `surface` 时必须保持当前普通柔雾效果完全不变。
- 金、银只改变模型已批准的换色区域，不覆盖身体和五官。
- 金属档读取独立的 metalness、roughness、envMapIntensity 和 clearcoat。
- 珠光闪粉使用稳定的物体空间细闪与轻微珠光偏色，避免屏幕空间噪点在旋转时
  跳动。
- 详情使用完整参数；系列舞台与缩略图使用 lightweight 参数。
- 同一个颜色可以与不同表面组合，避免复制整套色板。

第一轮只做金、银和一个低强度珠光闪粉样本，不直接进入抽取经济。先在
`/appearance-lab` 做 24 模型覆盖检查，再决定奖励与 Echo 解锁规则。

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
