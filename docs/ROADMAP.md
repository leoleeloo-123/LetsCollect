# 产品与技术路线图

状态：Companion / Echo 迁移路线
更新日期：2026-07-24

## 路线原则

- 保留当前可用的 3D、抽取、收藏、Auth、响应式与主题基础；
- 先建立文档和数据真源，再改变一级导航；
- 每一阶段都保持可运行、可回滚、可独立验收；
- Current、Approved Target、Planned Capability 必须分离；
- Agent 先规则化、结构化、可解释，再考虑外部模型服务；
- 真实抽取、票券和所有权最终由可信服务端负责。

## 阶段 0：新产品基线与真实能力盘点（当前）

- 升级产品宪法；
- 建立 Companion / Echo 产品基线；
- 建立 Asset / Capability Registry；
- 标记 Social Collecting V1 为历史基线；
- 修正 Overview、Architecture、Data Model、Theming、Security 和 Start Here；
- 明确当前没有 lint / test 脚本。

验收问题：团队能否明确区分“今天已经可用”“批准后要实现”“未来可能实现”？

回滚：只修改文档，不改变运行时行为。

## 阶段 1：领域合同与本地 adapter

- 定义基础 Companion、收藏实例和用户所有权边界；
- 为 Favorite、Representative rank、偏好和 typed events 增加版本化本地状态；
- 建立 collection、analytics、resonance、campaign repository / service interface；
- 将 UI copy、Demo fixture、Agent fixture 与 Campaign 配置分开；
- 为旧 localStorage v12 提供显式迁移；
- 解决 starter collection 自动补齐旧六模型对 Signature 的偏置。

验收问题：页面是否只依赖 typed domain contract，而不是直接依赖 mock、localStorage 或 Supabase 表？

回滚：保留当前 `MvpStateProvider` 快照和 v12 读取路径。

## 阶段 2：App Shell、导航与 Quiet Collectible 视觉

- 将目标主导航收敛为 Collect / Collection / Echo；
- `/draw` 暂时保留兼容入口；
- `/friends` 在 Echo 可用前保留旧路由，但退出一级导航；
- `/agent` 使用独立 Internal / Demo shell；
- 在现有 token 分层上引入 off-white、低饱和绿、雾蓝、echo 和 crystal 语义；
- 保留品牌粉、磨砂触感、圆角、阴影、safe area 与响应式能力；
- 清理页面硬编码颜色和过小字体。

验收问题：用户能否一眼识别收藏是主任务，而不是 Feed、好友或盲盒商城？

回滚：恢复原四入口 nav 配置和 Rose Frost token 值。

## 阶段 3：Collect

- 将 `/` 重构为可扩展的系列卡片架，移除卡片内部的全局分页器；
- 第一张色彩系列卡同时展示十二个模型，以九个色点切换选定 colorway，
  并在所选色系下严格 `1 / 12` 等概率抽取；
- 熊猫、艺术家、狗狗与水晶作为独立特殊系列卡；新增系列只扩展集中配置；
- 特殊系列使用各自的严格模型池；水晶系列随机原生 tint 并使用更多票券；
- 系列卡使用缓存缩略图，只有揭晓与详情使用 live `ToyViewer`；
- 正确表达每个模型的真实换色部位；
- `/draw` 兼容入口继续保留 95% matte / 5% crystal 全局规则，系列抽取不
  混入隐藏特殊分支；
- 使用柔和 reveal、预载结果资产和 reduced motion；
- 降低 rarity、品质分与五维评分的视觉权重；
- 在 pending draw 契约完成前继续自动入库，并使用准确 CTA。

验收问题：用户能否在不破坏任何真实 3D 效果的情况下完成一次安静、清晰的 Companion 遇见？

回滚：`/` 恢复现有首页，`/draw` 继续承担抽取。

## 阶段 4：Collection

- 保留现有 WebP 网格和单项 3D 详情；
- 增加 Favorite；
- 增加最多三只、可排序的 Representative Companions；
- 增加真实 metadata 筛选与 acquisition date；
- 建立 deterministic Collection Signature；
- 使用真实 Supabase profile 替代硬编码 collector profile；
- 两只 Crystal Companion 的五个原生 tint 保持独立；色彩系列可以显式
  使用九个常规色作为运行时 tint，但不改变兼容全局抽取的材质分支。

验收问题：Collection 是否既能管理资产，又能克制地表达用户当前收藏倾向？

回滚：新字段可忽略，现有 collection array 和详情继续工作。

## 阶段 5：Echo 与 Resonance

- 新增 `/echo`；
- 使用清晰隔离的 demo repository / fixture；
- 每日只展示 2–3 条匿名 Echo；
- 以 Representative Companions 作为匿名形象；
- Resonance service 使用 deterministic 权重和结构化 shared signals；
- 只展示自然语言 reasons，不展示 score 或 Match percentage；
- 实现 Leave an Echo / Let it drift；
- mutual 时显示极简 Collect Together 进度卡；
- 无 Chat、无限 Feed、真人照片或在线状态。

验收问题：Echo 是否让用户感到“有人与我喜欢相似的小东西”，而不是被推入社交关系？

回滚：从主导航隐藏 Echo，保留 Collection 主循环。

## 阶段 6：Evolution Agent Console

- 建立聚合 signals；
- 生成结构化 insight；
- 生成一个仅使用当前真实资产的 Campaign；
- 生成一个依赖未来资产的 Roadmap Proposal；
- 建立 capability feasibility；
- 实现 Human Approve / Edit / Archive；
- `requires_engineering` 与 `requires_asset_creation` 禁用发布；
- 记录 Apply、Measure、Adjust 的配置和评估数据。

验收问题：Console 能否同时说明“当前可以做什么”和“为什么未来提案现在不能做”？

回滚：Console 作为独立 Internal route 隐藏，不影响 C 端。

## 阶段 7：后端权威化

- 将 Collection、Favorite、Representative 和偏好迁移到 user-scoped Supabase repository；
- 为 Echo 提供最小匿名投影和 RLS / service boundary；
- 将抽取池、概率版本、票券流水和结果移到可信服务端；
- 原子、幂等写入票券、DrawRecord 和所有权；
- 为 Campaign approval / application 建立审计；
- 将 local analytics adapter 替换为最小真实事件层。

验收问题：客户端是否无法伪造票券、抽取结果、所有权、Representative 限制或 Campaign 发布？

回滚：保留本地 Demo adapter，生产写入开关可关闭。

## 阶段 8：生产加固与切换

- 增加 lint 和最小自动化测试工具链；
- 覆盖 typecheck、build、关键纯逻辑和流程 smoke test；
- 检查十个 matte、两只 Crystal、九个常规 colorway、五个原生 Crystal
  tint、各系列严格模型池与兼容 5% 全局分支；
- 检查 loading、empty、error、retry、poster / CSS fallback；
- 检查移动端性能、键盘、对比度和 reduced motion；
- 通过 Preview 远程验证；
- 经明确确认后再修改生产导航或推送 `main`；
- 保留 Legacy Hero 与旧路由回滚。

验收问题：目标体验是否在真实手机、生产资产和失败状态下仍然稳定？

## 明确后置

- 新 3D 资产；
- Sleepy、Quirky、Bold、Cool 系列；
- 新水晶、金属、毛绒或陶瓷；
- 房间、花园或复杂 3D 世界；
- Chat、私信、Feed、关注、粉丝与 Dating；
- 实时多人；
- Agent 自动改源码或自动发布。
