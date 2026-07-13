import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";

export function LoginPage() {
  return (
    <div className="auth-page">
      <PageHeader
        eyebrow="Login"
        title="Welcome back"
        description="This is a non-functional auth shell. Supabase Auth can attach here later through an auth service boundary."
      />
      <form className="auth-card">
        <label>
          Email
          <input type="email" placeholder="collector@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="button">Sign in</button>
        <ButtonLink to={routes.register} variant="secondary">
          Create account
        </ButtonLink>
      </form>
    </div>
  );
}
