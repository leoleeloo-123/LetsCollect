import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { StateBlock } from "../../components/feedback/StateBlock";

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <StateBlock
        tone="error"
        title="这里还没有藏品"
        description="这个页面不存在，回到首页继续探索吧。"
      />
      <ButtonLink to={routes.home}>返回首页</ButtonLink>
    </div>
  );
}
