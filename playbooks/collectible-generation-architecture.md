# 藏品生成系统架构 Playbook

本文件保留 LetsCollect 跨版本藏品生成规则与工程约定。当前新抽取使用 `generationVersion = 3` 的 Color Animals 系统：随机选择已批准的小动物模型与身体配色，表面固定为柔雾树脂；完整上线、性能、迁移与回退边界见 `docs/COLOR_ANIMALS_V3.md`。`generationVersion = 2` 的八材质与五项工艺系统继续保留为 legacy，公式见 `playbooks/material-system-v2.md`。

## 核心原则

- 基础模型与藏品实例必须分离。GLB 是可复用的几何资产，抽奖结果是带独立参数和 ID 的藏品实例。
- 页面只消费 `Collectible` 领域对象，不直接依赖 localStorage 或 Supabase 表结构。
- 所有随机结果由 `appearanceSeed` 和 `generationVersion` 决定，方便复现、测试和升级。
- 每个藏品有 UUID 身份和短公开编号。外观参数不能代替身份 ID。
- V1 果冻玉藏品继续保留原始五维参数；V2 新藏品使用显式材质和工艺向量，两者通过同一 `Collectible` 边界读取。

## 历史生成公式 V1

每次抽取等概率选择 1 个基础模型和 1 套颜色，然后生成固定的五维参数向量。五个维度均为 1-100，且数值越高越好：

| 维度 | 权重 | 主要视觉映射 |
| --- | ---: | --- |
| 通透度 `transparency` | 35% | transmission、attenuation distance、内部透光 |
| 色泽度 `colorDepth` | 20% | 饱和度、明暗深度、颜色覆盖感 |
| 水润度 `hydration` | 18% | thickness、柔和扩散、表面粗糙度 |
| 光泽度 `luster` | 17% | clearcoat、specular、环境反射 |
| 荧光度 `glow` | 10% | emissive、边缘光、底部辉光 |

综合品质分：

```text
qualityScore =
  transparency * 0.35 +
  colorDepth * 0.20 +
  hydration * 0.18 +
  luster * 0.17 +
  glow * 0.10
```

五维不是完全独立的均匀随机。生成器先得到一个共享品质趋势，再为每个维度增加受控偏差。这样同一件藏品既有长短板，又不会出现神话级通透度搭配极差整体材质的失真组合。

## 通透度十档

| 档位 | 名称 | 分数 | 概率 |
| ---: | --- | ---: | ---: |
| T1 | 雾糯 | 1-10 | 35% |
| T2 | 糯润 | 11-20 | 24% |
| T3 | 糯化 | 21-30 | 16% |
| T4 | 糯冰 | 31-40 | 10% |
| T5 | 冰润 | 41-50 | 6% |
| T6 | 冰种 | 51-60 | 4% |
| T7 | 高冰 | 61-70 | 2.5% |
| T8 | 玻璃种 | 71-80 | 1.4% |
| T9 | 极光玻璃 | 81-90 | 0.8% |
| T10 | 神话晶玉 | 91-100 | 0.3% |

稀有度由五维综合品质计算，不单独随机。V1 阈值经过 20 万次模拟校准：

```text
普通 Common:      1-27
稀有 Rare:       28-42
史诗 Epic:       43-56
传说 Legendary:  57-73
神话 Mythic:      74-100
```

预期分布约为 55% / 28% / 11% / 5% / 1%。

## 颜色与模型

V1 的 6 个模型和 8 套颜色均等概率。颜色本身不增加价值，价值只由五维品质决定。

```text
模型：Unicorn / Kitty / Bunny / Bird / Doggy / Karpy
颜色：樱花粉 / 薄荷绿 / 蜜糖黄 / 冰川蓝 / 帝王绿 / 烟紫 / 月光白 / 墨翠
```

新增模型时只允许修改模型目录与注册表，不允许在页面组件中增加模型判断。模型注册项必须包含 Web/Mobile 路径和可选的取景校正参数。

## 模型资产契约

```text
assets/models/source/{toy-slug}/model-source-v001.glb
public/models/toys/{toy-slug}/model-web-v001.glb
public/models/toys/{toy-slug}/model-mobile-v001.glb
```

V1 目标为 Web 约 100k 三角面、Mobile 约 50k 三角面。每个模型必须单独做轮廓、居中、拖动和窄屏清晰度验收，不能机械复用简化比例而不检查结果。

## 版本兼容

- `generationVersion` 决定抽奖公式与参数含义。
- `appearanceSeed` 决定可复现的细微色偏、衰减和光泽变化。
- 修改权重、概率、参数含义或随机算法时必须升级 `generationVersion`。
- 未来增加纯净度时使用可选字段 `purityScore`、`inclusionSeed`、`inclusionVersion`。V1 藏品不自动获得棉絮效果。

## 本地与 Supabase 边界

MVP 使用本地状态保存 `Collectible` 和 `DrawRecord`。页面不能直接调用 localStorage。未来切换 Supabase 时保留相同领域对象，并替换 repository/service 实现。

未来最小持久化结构：

```text
toy_models
toy_palettes
generation_rules
collectibles
draws
```

抽奖迁入后端时，扣券、生成参数、写入 `collectibles` 和 `draws` 必须在一个原子操作中完成。客户端不能提交品质分数。所有用户资产表启用 RLS，并使用 `owner_id = auth.uid()` 进行所有权校验。

## 社交扩展边界

`Collectible` 是资产，`DrawRecord` 是产生资产的公开事件。未来点赞应引用 `draw_id`，而不是修改藏品本身。

```text
draw_reactions(draw_id, user_id, reaction_type, created_at)
```

好友、评论、通知和动态流在对应交互得到验证后再分别建模。不要提前创建一个无约束的万能日志表。稳定的 UUID、创建时间和实体关系现在保留，完整社交表以后按实际 UX 增加。

## V1 非目标

- 不实现棉絮、纯净度或体积噪声。
- 不创建新的 Supabase 资产、抽奖或互动表。
- 不保证不同用户之间的全球外观唯一；本地仅避免当前收藏中的 seed 重复。
- 不在收藏网格同时创建多个 WebGL Canvas。
