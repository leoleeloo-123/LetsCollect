import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";

export function RegisterPage() {
  return (
    <div className="auth-page">
      <PageHeader
        eyebrow="Register"
        title="Start collecting"
        description="Registration is mocked in Phase 1. The form shape is here so auth can be connected cleanly later."
      />
      <form className="auth-card">
        <label>
          Display name
          <input type="text" placeholder="Jelly Collector" />
        </label>
        <label>
          Email
          <input type="email" placeholder="collector@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="button">Create account</button>
        <ButtonLink to={routes.login} variant="secondary">
          I already have an account
        </ButtonLink>
      </form>
    </div>
  );
}
