# Asset Data Registry V1 Playbook

- 状态：Phase 0–2 已完成，Phase 3 待实施
- 适用阶段：Hackathon / 本地 JSON 数据源
- 基线日期：2026-07-30

## 1. 目的

在继续扩展背景、底盘和其他视觉系统之前，将 Let's Collect 当前分散在
多个 TypeScript 文件中的核心资产配置收敛为一套轻量、可校验的 JSON Registry。

V1 的目标不是建设完整 CMS 或数据库，而是：

- 24 个正式玩偶、9 个配色、当前表面、背景和系列关系都有统一数据来源；
- 常见内容调整只需要修改 JSON；
- 页面、抽取逻辑和 3D Viewer 通过 Registry API 读取数据，不直接读取 JSON；
- 现有 ID、外观、抽取结果和页面行为在迁移前后保持一致；
- 后续接入 Supabase 时可以复用同一数据契约，而不需要重写页面。

### 与用户后端的边界

本 Playbook 只负责静态资产 Registry。这里将“资产表迁入 Supabase”放在 P2，
不表示用户动态数据也可以无限后置。

以下内容属于独立的后端数据契约，不纳入本次资产迁移：

- Auth 与 profiles；
- 用户收藏与归属关系；
- 抽取券余额和交易；
- draws；
- Echo 与奖励领取；
- RLS、RPC 或 Edge Function 的受控写入。

这些关系应在单独的 `backend-data-contract-v0.md` 中定义，并可以与本 Playbook
并行推进。GLB 和 mask 在 Hackathon 阶段继续使用部署项目的静态目录，不要求
为了使用 Supabase 迁入 Storage。

## 2. Hackathon 范围原则

### P0 / Must：核心迁移不可缺少

- 统一 JSON 目录和稳定 ID；
- 迁移全部 24 个正式模型；
- 迁移全部 9 个当前配色；
- 迁移柔雾树脂、金、银、玫瑰金四个当前表面定义；
- 迁移初冬、暖春、淡绿、淡紫四个当前背景；
- 迁移系列和系列成员关系；
- 迁移换色 Profile 的可配置参数；
- 为 toy、series 和 series member 增加轻量 `enabled`，缺省为 `true`；
- 支持 presentation 数据结构、resolver 和少数已知异常模型 override；
- 建立 `AssetRegistrySnapshot` 与 `createAssetRegistry(snapshot)`；
- 建立统一的相对资产路径 `resolveAssetUrl()`；
- 建立统一 Registry API，并保留现有 getter 兼容层；
- 校验重复 ID、外键、GLB、遮罩文件和数值范围；
- 完成 24 个模型迁移前后的视觉回归。

### P1 / Should：明显提升维护效率，但可在核心迁移后完成

- `grounds.json` 和背景的 `groundId` 引用；

- Appearance Lab 中的朝向、比例、目标点实时调试；
- Copy transform JSON / Copy presentation JSON；
- 一份共享 JSON Schema；
- 自动生成资产 ID union。

### P2 / Optional：不阻塞 Hackathon

- `draft / active / retired / archived` 完整生命周期；
- 每个功能独立的 visibility 矩阵；
- Asset Registry 的 Supabase 表、seed 和远程数据加载；
- 完整异步 `AssetDataSource` 切换；
- 自动写回本地 JSON；
- 资产管理后台、权限、审计、回滚和发布工作流；
- 为所有理论展示场景预建参数；
- 资产版本锁定和用户收藏 appearance snapshot；
- 完整 X/Y/Z 调试 gizmo；
- 自动生成所有 TypeScript 数据结构。

P2 不得成为 P0 合并或上线的前置条件。

## 3. 已确定的数据边界

### 3.1 模型资产与收藏实例分离

Registry 中的模型记录使用稳定的 `modelId`，例如 `color-cat`。

用户收藏继续保留独立实例身份：

```ts
type CollectibleReference = {
  collectibleId: string;
  modelId: string;
  paletteId: string;
  surfaceStyleId?: string;
  appearanceSeed: number;
  createdAt: string;
};
```

“历史收藏使用最新资产”表示：

- GLB 路径更新后，旧收藏加载新 GLB；
- 默认朝向和取景更新后，旧收藏使用新取景；
- palette 或 surface 参数更新后，旧收藏使用新参数；
- 不为每个收藏保存 `modelVersion` 或外观快照。

这不表示删除 `collectibleId`、随机 seed、品质、获得时间或其他实例数据。

### 3.2 当前稳定 ID 不重命名

示例中的 `sleeping-cat`、`honey-apricot` 不是迁移目标 ID。

V1 必须保留已经进入本地数据和代码的现有 ID：

- 模型继续使用 `color-*`；
- 配色继续使用 `cocoa`、`apricot` 等现有 ID；
- 表面继续使用 `matte`、`metal-gold`、`metal-silver`、
  `metal-rose-gold`；
- 系列继续使用当前已注册 ID。

显示名称和描述可以修改，已发布业务 ID 不修改。

### 3.3 JSON 只保存参数

JSON 可以保存：

- GLB、遮罩和其他静态资源路径；
- 换色 Profile ID；
- mask 类型、channel、强度和颜色倍率；
- 模型基础校准；
- presentation override；
- palette、surface、background 和 ground 参数；
- 系列成员和抽取权重。

以下内容必须继续留在 TypeScript：

- Three.js 执行函数；
- shader、GLSL 和材质工厂；
- mask profile 的算法实现；
- 相机和构图参数解析；
- 随机抽取算法；
- 兼容和 fallback 逻辑；
- WebGL 生命周期和资源释放。

JSON 中不得保存任意函数名拼接、GLSL 表达式或可执行代码。

## 4. V1 数据目录

```text
src/data/asset-registry/
|-- toy-models.json
|-- palettes.json
|-- surfaces.json
|-- backgrounds.json
|-- recolor-profiles.json
|-- series.json
|-- series-members.json
|-- grounds.json                 # P1
|-- registry.ts
|-- types.ts
`-- index.ts

scripts/
|-- validate-assets.ts
`-- verify-asset-files.ts
```

V1 不创建空目录和无消费方的数据表。

## 5. 核心 JSON 表

### 5.1 `toy-models.json`

每个记录至少包含：

```json
{
  "id": "color-penguin",
  "enabled": true,
  "name": "企鹅",
  "description": "戴耳罩、捧着杯子的企鹅",
  "species": "penguin",
  "fallbackShape": "blob",
  "assets": {
    "modelUrl": "/models/toys/color-penguin/model-mobile-v003.glb"
  },
  "calibration": {
    "scaleMultiplier": 0.94,
    "yOffset": -0.02,
    "rotationYDeg": -12.6
  },
  "recolorProfileId": "penguin-accessories",
  "sortOrder": 3
}
```

V1 优先迁移已有的 `scaleMultiplier`、`yOffset` 和 `rotationY`，不强制
一次性增加完整 position、rotation、camera 和 bounding radius。

`id` 同时作为当前 URL/目录 slug；V1 不再重复保存完全相同的 `slug`。
`mobileModelUrl` 仅在确实存在独立移动资产时填写，否则 Registry 回退到
`modelUrl`。

`enabled` 是 P0 的轻量停用开关，未填写时视为 `true`。`getToyModel(id)`
仍能解析 disabled 模型，保证已有收藏不失效；`getActiveToyModels()`、抽取池和
Appearance Lab 默认过滤 `enabled: false`。V1 不实现更复杂的生命周期。

### 5.2 `palettes.json`

V1 保留当前渲染实际使用的字段，不提前增加无消费方的语义色槽：

```json
{
  "id": "apricot",
  "name": "蜂蜜杏",
  "color": "#...",
  "attenuation": "#...",
  "emissive": "#...",
  "glow": "#...",
  "sortOrder": 2
}
```

未来一个换色 Profile 确实需要 secondary、accent、highlight 或 shadow 时，
再扩展 palette token。

### 5.3 `surfaces.json`

V1 只登记当前表面系统：

- `matte`
- `metal-gold`
- `metal-silver`
- `metal-rose-gold`

旧的 plastic、glass、wood、iron、copper、silver、gold、crystal 八材质系统
不是新 Registry 的正式表面来源，只保留必要的旧收藏兼容。

表面 JSON 可以保存颜色、swatch 和稳定的材质参数。设备性能策略、shader
实现和材质工厂继续留在 TypeScript。

### 5.4 `recolor-profiles.json`

该表保存模型换色所需的声明式参数，例如：

```json
{
  "id": "penguin-accessories",
  "rendererProfileId": "color-accessory-mask",
  "maskType": "texture-and-triangle-mask",
  "maskUrl": "/models/toys/color-penguin/accessory-mask-mobile-v003.webp?v=3",
  "triangleMaskUrl": "/models/toys/color-penguin/zone-triangle-mask-mobile-v003.bin?v=3",
  "colorScale": 0.92,
  "supportsSurfaceOverride": true
}
```

`rendererProfileId` 必须指向 TypeScript 中受控、穷尽式的
`renderProfileRegistry`。V1 不要求把所有历史 profile 重写成同一种算法。

### 5.5 `backgrounds.json`

V1 迁移当前四个背景：

```json
{
  "id": "early-winter",
  "name": "初冬",
  "group": "dynamic",
  "background": "#e5f1f6",
  "swatch": "#d8ebf3",
  "particlePresetId": "snow",
  "groundId": null
}
```

`particlePresetId` 引用 TypeScript 中受控的粒子 preset，不在 JSON 中保存
动画函数。P1 增加 `groundId` 后，初冬可以引用雪地底盘。

### 5.6 `grounds.json`（P1）

只有在开始雪地底盘时才创建。第一批建议只包含：

- `default-pedestal`
- `snow-patch`

Ground 保存几何和材质参数；创建、更新和 dispose Three.js 对象的逻辑留在
TypeScript ground factory。

### 5.7 `series.json`

保存当前系列的稳定元数据：

- ID、名称和描述；
- `enabled`，缺省为 `true`；
- 券消耗；
- 展示顺序；
- 默认 palette policy；
- 默认 surface policy。

策略必须使用受控枚举或 preset ID，不保存任意表达式。

### 5.8 `series-members.json`

V1 同时承担系列展示关系和抽取成员关系：

```json
{
  "id": "series_zzz--color-cat",
  "enabled": true,
  "seriesId": "series_zzz",
  "modelId": "color-cat",
  "displayOrder": 1,
  "drawWeight": 1,
  "palettePolicyOverride": null,
  "surfacePolicyOverride": null
}
```

玩偶资产本身不保存抽取概率。成员 `enabled` 缺省为 `true`。可抽取列表同时
过滤 disabled model、series 和 series member，但按 ID 解析已有收藏时不应用
该过滤。V1 不要求更复杂的生命周期字段。

## 6. Presentation 与统一标准空间

### P0：迁移当前参数并支持语义 override

P0 的目标是无视觉变化，因此先迁移当前：

- `scaleMultiplier`
- `yOffset`
- `rotationY`

迁移时可以将 radians 转成更易编辑的 `rotationYDeg`，Registry resolver 再转换
回 Three.js radians。

P0 同时建立 presentation 数据结构和
`resolveToyPresentation(modelId, context)`，并只为已经确认存在裁切问题的模型
填写 override。方便编辑这些参数的 Lab 工具仍属于 P1。

### P0：少数场景 override

不同渲染器同时使用透视和正交相机，因此 JSON 不直接假设所有场景都支持同一个
camera distance。推荐保存语义化 override：

```json
{
  "presentation": {
    "collection": {
      "framingScale": 0.88,
      "targetYOffset": 0.12,
      "yawOffsetDeg": 0
    },
    "thumbnail": {
      "framingScale": 0.82,
      "padding": 1.15,
      "yawOffsetDeg": -5
    }
  }
}
```

`resolveToyPresentation()` 根据 ToyViewer、SeriesToyViewer 或 ThumbnailRenderer
把语义参数转换成实际模型缩放、相机距离或正交构图。

优先检查的模型：

- 小猫与毛线球；
- 气球豚鼠；
- 浴缸小鸭；
- 摄像狗与挎包；
- 打鼓狗；
- 横向海豹；
- 长尾、宽翅膀、鹿角或帽饰明显的模型。

没有构图问题的模型不填写 override，使用场景默认值。

## 7. Registry API

页面和 Viewer 不直接导入 JSON。P0 先建立轻量 snapshot factory：

```ts
type AssetRegistrySnapshot = {
  toyModels: ToyModelRecord[];
  palettes: PaletteRecord[];
  surfaces: SurfaceRecord[];
  backgrounds: BackgroundRecord[];
  recolorProfiles: RecolorProfileRecord[];
  series: SeriesRecord[];
  seriesMembers: SeriesMemberRecord[];
};

function createAssetRegistry(snapshot: AssetRegistrySnapshot): AssetRegistry;
```

当前使用 `createAssetRegistry(localJsonSnapshot)`。未来 Supabase datasource 只负责
异步取得同结构 snapshot，再创建 Registry；页面和 Viewer 继续使用同步 getter。

Registry 至少提供：

```ts
getToyModel(id)
getToyPalette(id)
getToySurfaceStyle(id)
getToyBackground(id)
getCollectSeries(id)
getSeriesMembers(seriesId)
getActiveToyModels()
resolveToyRecolorProfile(modelId)
resolveToyPresentation(modelId, context)
resolveAssetUrl(assetPath)
```

迁移期保留现有 `getToyModel()`、`getToyPalette()` 等名称，只替换数据来源。
这样大部分页面无需修改。

JSON 保存相对部署路径或未来 Storage object path，不保存写死的 Netlify、Vercel
或 Supabase 完整 URL。`resolveAssetUrl()` 负责附加当前 CDN/base URL。

完整 Supabase datasource 和启动预加载属于 P2；P0 只建立 snapshot 注入边界，
确保页面依赖 Registry API，而不是依赖具体 JSON 或远程请求方式。

## 8. V1 校验

`npm run validate:assets` 至少检查：

- JSON 可以解析；
- ID 唯一且格式稳定；
- 至少存在一个 enabled 模型；
- disabled 记录仍可通过稳定 ID 解析；
- active 列表正确过滤 disabled model、series 和 series member；
- model 引用的 recolor profile 存在；
- series member 引用的 model 和 series 存在；
- palette、surface 和 background ID 存在；
- GLB、mask、triangle mask 文件存在；
- 数值是有限数字；
- scale、颜色倍率和构图参数位于合理范围；
- series member 不重复；
- 正式系列不引用未知模型。

`EXPECTED_MIGRATION_BASELINE_TOY_COUNT = 24` 只用于迁移 parity test，确认本轮没有
漏掉正式模型；它不是常规 Registry validator 的永久业务限制。增加第 25 个模型
时不应修改基础校验规则。

JSON Schema 和自动生成类型是 P1。P0 可以先使用 TypeScript 类型、明确的
运行时断言和跨表校验脚本，但不得完全依赖类型断言跳过验证。

## 9. Appearance Lab

### P0

- 从 Registry 读取所有 enabled 模型，迁移 parity test 期望当前为 24 个；
- 从 Registry 读取 palette、surface 和 background；
- 保持当前真实 3D 检查与缩略图矩阵；
- 迁移前后视觉表现一致。

### P1

- 调整 rotation Y、scale、yOffset；
- 调整语义 framing 和 target Y；
- 选择 presentation context；
- Reset to Registry values；
- Copy calibration JSON；
- Copy presentation override JSON。

### P2

- 完整 position / rotation X/Y/Z；
- 自动保存 JSON；
- 将资产配置写入 Supabase；
- 权限、审计和版本回滚。

## 10. 迁移顺序

### Phase 0：冻结当前基线

- 单独提交当前未提交的背景主题、毛绒退役和对应文档；
- 底盘尚未修改，不把底盘写入该基线提交；
- 记录 24 个模型当前参数和关键视觉状态。

### Phase 1：数据契约与 Registry 外壳

- 创建 JSON 目录；
- 定义 P0 TypeScript 数据结构；
- 定义 `AssetRegistrySnapshot` 和 `createAssetRegistry(snapshot)`；
- 创建 Registry maps、getter 和 `resolveAssetUrl()`；
- 添加基础校验脚本；
- 暂不切换生产调用方。

实施状态（2026-07-30）：Registry 类型、运行时校验、snapshot factory、稳定 getter、
展示参数 resolver、相对路径 resolver 和 `validate:assets` CLI 已建立。Phase 1 完成时尚未
创建或迁移任何 JSON 数据表，生产调用方仍使用现有 TypeScript 数据源。
Phase 1 的 CLI 允许数据表暂缺；Phase 2 已切换为低风险五表必需校验，完整
`--strict` 校验将在 Phase 3 的模型和换色表迁移完成后启用。

### Phase 2：迁移低风险数据

依次迁移：

1. palettes；
2. surfaces；
3. backgrounds；
4. series；
5. series members。

以上记录同步加入缺省为 `true` 的 `enabled`。

每一类迁移后继续通过原 getter 对外服务。

实施状态（2026-07-30）：9 个 palette、4 个 surface、4 个 background、14 个
series 和 60 条 series member 已迁入 JSON。`catalog.ts`、`surfaceStyles.ts`、
`stageThemes.ts` 与 `collectSeries.ts` 继续提供原有 API；production build 现会先
执行 Phase 2 Registry 校验。玩偶模型和 recolor profile 尚未迁移。

### Phase 3：迁移模型与换色配置

- 迁移 24 个 model 定义；
- 迁移 recolor profile 参数；
- 建立 presentation schema 和 resolver；
- 为已确认裁切的少数模型迁移或添加 override；
- 保留所有材质工厂和 shader 算法；
- 让 `catalog.ts` 降级为兼容 wrapper；
- 让 `formalRoster.ts` 从 Registry 派生，或在验证稳定后删除。

### Phase 4：调用方与兼容

- generator 和系列抽取读取 Registry；
- ToyViewer、SeriesToyViewer 和 ThumbnailRenderer 继续通过稳定 getter；
- Collection、Home、Echo 和 Lab 不直接读取 JSON；
- 保留当前收藏实例和 compatibility 逻辑；
- 所有 GLB 和 mask 通过 `resolveAssetUrl()` 解析相对路径。

### Phase 5：验证与清理

- typecheck；
- production build；
- `validate:assets`；
- 24/24 模型加载；
- palette、surface、background 回归；
- Collection、Collect Reveal、Thumbnail 和系列舞台检查；
- 删除被完整替代的数据常量，不删除仍承担算法或兼容职责的模块。

### Phase 6：P1 功能

- grounds；
- 进一步校准 presentation override；
- Appearance Lab 参数复制工具；
- JSON Schema 和 ID 生成。

## 11. 验收标准

P0 完成必须同时满足：

1. 迁移 parity test 确认当前 24 个正式模型全部来自 `toy-models.json`。
2. 常规 Registry 校验不把 24 写成永久模型数量上限。
3. 9 个 palette、4 个 surface 和 4 个 background 全部来自 Registry。
4. 所有正式系列和成员关系来自 JSON。
5. 页面与 3D Viewer 不直接导入原始 JSON。
6. Registry 由 `createAssetRegistry(snapshot)` 创建，页面不依赖 snapshot 来源。
7. disabled model 不进入抽取和 Lab，但已有收藏仍能按 ID 解析。
8. 修改模型基础旋转后，所有使用默认 calibration 的 Viewer 同步变化。
9. 已知异常模型可以通过 presentation override 修正裁切。
10. 新增背景记录后，Appearance Lab 可通过 Registry 显示。
11. GLB 和 mask 使用相对路径并统一通过 `resolveAssetUrl()` 解析。
12. 模型资产记录中不存在抽取概率。
13. 所有外键和静态文件通过自动校验。
14. 当前 24 个模型的默认朝向、比例、换色和材质表现基本不变。
15. 当前本地收藏继续正常读取和展示。
16. 未实现完整 lifecycle、资产 Supabase 化或自动写回不影响 P0 验收。

## 12. 旧模块的去留

| 当前模块 | V1 处理 |
| --- | --- |
| `catalog.ts` | 数据迁入 JSON；getter wrapper 暂时保留 |
| `formalRoster.ts` | 从 Registry 派生，稳定后可删除 |
| `surfaceStyles.ts` | 数据迁入 JSON；解析和材质参数适配保留 |
| `stageThemes.ts` | 数据迁入 backgrounds；getter 可兼容保留 |
| `collectSeries.ts` | 数据迁入 JSON；策略解析函数保留 |
| `activeSeries.ts` | generation 规则和领域判断保留 |
| `materialCatalog.ts` | 仅保留必要的 legacy compatibility |
| `prepareToyAppearance.ts` | 保留 |
| `applyToySurfaceStyle.ts` | 保留 |
| 各模型材质工厂 | 保留 |
| `generator.ts` | 抽取算法保留，模型池改读 Registry |
| `compatibility.ts` | 保留并验证旧本地收藏 |

## 13. Effort

| 范围 | 预计工作量 |
| --- | ---: |
| Phase 0 基线提交 | 1–2 小时 |
| P0 数据契约、Registry 和校验 | 6–8 小时 |
| P0 静态数据迁移 | 6–10 小时 |
| P0 模型与换色配置迁移 | 6–10 小时 |
| P0 调用方、兼容和视觉回归 | 6–8 小时 |
| **P0 合计** | **25–36 小时** |
| P1 grounds、Lab calibration 和 copy 工具 | 10–16 小时 |
| P2 lifecycle、资产 Supabase 化、管理能力 | 按实际产品需求另行评估 |

P0 是 Hackathon 可接受的完整核心迁移。P1 和 P2 不应与 P0 绑在同一个巨大
提交中。

## 14. 提交纪律

建议按以下顺序拆分提交：

1. `docs: add asset data registry playbook`
2. `chore: freeze current appearance lab baseline`
3. `feat: add asset registry contracts and validation`
4. `refactor: migrate palettes surfaces and backgrounds`
5. `refactor: migrate toy models and recolor profiles`
6. `refactor: migrate series membership data`
7. `test: verify registry assets and visual parity`
8. `feat: add ground and presentation calibration tools`（P1）

每个提交必须可独立 typecheck，并且不得顺手改写 3D Viewer 架构。

## 15. 回滚原则

- 在 JSON Registry 完成验证前保留旧 TypeScript 数据常量；
- 通过兼容 getter 逐类切换，不一次性删除全部旧数据；
- Phase 0 基线提交作为视觉回滚点；
- 若某类迁移失败，只回滚该类数据来源，不回滚无关背景或材质工作；
- 不使用迁移机会改名现有 ID、移动 GLB 或重写 shader。
