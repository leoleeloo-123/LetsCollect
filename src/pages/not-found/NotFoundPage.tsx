import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { StateBlock } from "../../components/feedback/StateBlock";

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <StateBlock
        tone="error"
        title="Page not found"
        description="This route does not exist in the product shell yet."
      />
      <ButtonLink to={routes.home}>Back home</ButtonLink>
    </div>
  );
}
