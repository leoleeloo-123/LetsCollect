# 前端主题系统

状态：当前实现与已批准目标并行记录

Let's Collect 当前使用统一的「Rose Frost / 粉色磨砂玻璃」主题。新的产品方向不会新建一套平行主题或推翻现有 UI，而是在相同工程分层上逐步演进为「Quiet Collectible / 安静的收藏空间」：保留磨砂触感、圆角、柔和阴影和品牌粉识别，同时让 3D Companion 成为视觉中心，让界面本身后退。

## 当前实现与目标方向

### Current：Rose Frost

- 粉色磨砂玻璃是当前生产主题；
- `tokens.css`、主题映射、公共布局和页面样式已经分层；
- 品牌粉、半透明表面、圆角和柔和阴影构成现有识别；
- 当前变量名与加载顺序继续有效，迁移期间不得让页面各自创建一套新主题。

### Target：Quiet Collectible

- 页面大面积底色以 off-white、暖灰白和低对比中性色为主；
- 低饱和绿与雾蓝用于较大的辅助区域、偏好状态和 Echo 语境；
- 品牌粉保留为品牌识别、关键 CTA 或少量强调色，不再铺满所有大面；
- Crystal 使用独立、克制的冰透强调色，不把普通 matte Companion 包装成水晶系列；
- 同一页面避免同时铺开多种 pastel，色彩优先服务 3D 资产、层级和状态；
- 玻璃效果继续存在，但只用于导航和少量重要面板，不能形成高密度玻璃卡片墙；
- 视觉目标是 cozy、gentle、calm、premium but approachable，而不是盲盒商城、儿童游戏或社交匹配界面。

迁移应通过调整语义 token 和主题映射逐步完成。页面结构与 feature CSS 不应以硬编码颜色抢先模拟目标主题。

## 文件职责

- `src/styles/tokens.css`：唯一的主题数值配置入口。品牌色、文字色、透明度、玻璃模糊、阴影、圆角、动效均在这里定义。
- `src/styles/themes/rose-frost.css`：把语义变量映射到顶栏、底栏、卡片、抽取、收藏、好友与认证等组件；这里不负责页面排版。
- `src/styles/layout.css`、`src/styles/components.css`：公共组件的尺寸、网格和排版。
- Feature / Page CSS：只管理所属模块的结构和响应式布局。
- `src/styles/index.css`：按“基础变量 → 公共布局 → 页面布局 → 当前主题”的顺序集中加载全部 CSS，避免组件内部加载顺序覆盖主题。

## 当前可调变量

以下是当前已存在、可以继续调整的变量。在 `src/styles/tokens.css` 中修改：

- 主题色：`--color-brand`、`--color-brand-deep`、`--color-brand-soft`
- 页面底色：`--background-page`
- 玻璃透明度：`--glass-surface`、`--glass-surface-strong`、`--glass-surface-muted`
- 玻璃模糊：`--glass-blur`、`--glass-blur-strong`
- 圆角：`--radius-control`、`--radius-card`、`--radius-panel`、`--radius-nav`
- 阴影：`--shadow-soft`、`--shadow-card`、`--shadow-nav`
- 动效：`--motion-fast`、`--motion-standard`、`--ease-standard`

例如，想让所有主要卡片更圆，只需要修改 `--radius-card`；想让整站玻璃更通透，只需降低 `--glass-surface` 和 `--glass-surface-strong` 的 alpha。

## 目标语义 token

以下名称记录目标语义，不表示当前代码已经全部实现。实施时先加入 `src/styles/tokens.css`，再由主题文件映射，页面组件只消费语义变量：

- 基础表面：页面背景、普通表面、抬升表面；
- 文本：主文字、次文字、弱提示；
- 边界：轻边框与聚焦轮廓；
- 品牌：保留现有 brand / brand deep / brand soft；
- Echo：独立 `echo` accent，用于低压力共鸣提示与状态；
- Crystal：独立 `crystal` accent，只服务 Diamond Unicorn 与特殊展品；
- 状态：统一 `success` 与 `warning`，不直接复用品牌粉；
- 动效：保留 fast / standard，并为 reveal / drift 使用统一 easing。

具体变量名在实现时一次冻结，避免出现多套同义命名。Companion palette、材质色和稀有度颜色属于内容数据，不随主题替换。

## 页面层级

- 3D Companion 获得最大面积和最高对比；
- 同一屏只保留一个主要视觉焦点；
- Collect 主舞台只使用一个 live Viewer，其余模型和 colorway 使用缩略图或轻控件；
- Collection、Representative 和 Echo 卡片使用缩略图，选中详情才加载 GLB；
- 控制卡片数量与信息密度，避免 Dashboard 感；
- 标题可以保留现有编辑感和个性，但不能在 C 端压过 Companion；
- 品质分、rarity badge 和统计数字降低视觉权重；
- 不使用复杂 3D 背景、赌场金色、强霓虹或高刺激渐变。

## 动效与 reduced motion

- 常规动效使用慢速淡入、轻微浮动、柔和 reveal 和颜色过渡，不使用老虎机闪烁、连续抖动或强制连胜；
- Echo 的出现与离开可以有轻微漂移，但不能阻塞操作或隐藏状态变化；
- `prefers-reduced-motion: reduce` 下取消非必要浮动、漂移、视差和自动强调，将 reveal 转为即时或短淡入；
- reduced motion 不能移除结果、焦点、Loading 或成功反馈，只改变其运动表达；
- 3D Viewer 的自动旋转和页面可见性策略继续由共享 Three.js 边界统一处理，页面 CSS 不创建另一套动画控制。

## 约束

- 页面或组件 CSS 不新增品牌色、玻璃透明度、通用圆角和通用阴影的硬编码值，应使用语义变量；
- 稀有度、抽取券、玩偶本体配色属于功能 / 内容颜色，保持独立；
- Echo、Crystal、success 和 warning 不得直接借用某个 Companion 的 palette 值；
- 新增状态色必须同时检查正文、按钮、边框和 focus 的对比度，不能只依赖颜色传达含义；
- 真正的 `backdrop-filter` 只用于少量大面板与导航；重复小卡片使用半透明背景，避免手机端过多玻璃合成层；
- 页面中现存的硬编码粉、绿、白、圆角和阴影需要随页面迁移逐步回收，不在一次 token 修改中盲目全局替换；
- 新页面 CSS 从 `src/styles/index.css` 的 Feature / Page 区域引入，并保证主题文件始终最后加载。
