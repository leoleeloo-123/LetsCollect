# 前端主题系统

Let's Collect 的产品页面使用统一的「Rose Frost / 粉色磨砂玻璃」主题。主题与布局已经分层，调整视觉参数时不需要进入页面组件逐个修改。

## 文件职责

- `src/styles/tokens.css`：唯一的主题数值配置入口。品牌色、文字色、透明度、玻璃模糊、阴影、圆角、动效均在这里定义。
- `src/styles/themes/rose-frost.css`：把语义变量映射到顶栏、底栏、卡片、抽取、收藏、好友与认证等组件；这里不负责页面排版。
- `src/styles/layout.css`、`src/styles/components.css`：公共组件的尺寸、网格和排版。
- Feature / Page CSS：只管理所属模块的结构和响应式布局。
- `src/styles/index.css`：按“基础变量 → 公共布局 → 页面布局 → 当前主题”的顺序集中加载全部 CSS，避免组件内部加载顺序覆盖主题。

## 最常调整的变量

在 `src/styles/tokens.css` 中修改：

- 主题色：`--color-brand`、`--color-brand-deep`、`--color-brand-soft`
- 页面底色：`--background-page`
- 玻璃透明度：`--glass-surface`、`--glass-surface-strong`、`--glass-surface-muted`
- 玻璃模糊：`--glass-blur`、`--glass-blur-strong`
- 圆角：`--radius-control`、`--radius-card`、`--radius-panel`、`--radius-nav`
- 阴影：`--shadow-soft`、`--shadow-card`、`--shadow-nav`
- 动效：`--motion-fast`、`--motion-standard`、`--ease-standard`

例如，想让所有主要卡片更圆，只需要修改 `--radius-card`；想让整站玻璃更通透，只需降低 `--glass-surface` 和 `--glass-surface-strong` 的 alpha。

## 约束

- 页面或组件 CSS 不再新增品牌色、玻璃透明度、通用圆角和通用阴影的硬编码值，应使用语义变量。
- 稀有度、抽取券、玩偶本体配色和头像色属于功能/内容颜色，保持独立，不随品牌主题覆盖。
- 真正的 `backdrop-filter` 只用于少量大面板与导航；重复的小卡片使用半透明背景，避免手机端出现过多玻璃合成层。
- 新页面 CSS 必须从 `src/styles/index.css` 的 Feature / Page 区域引入，并保证当前主题文件始终最后加载。
