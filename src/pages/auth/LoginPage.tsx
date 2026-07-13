import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";

export function LoginPage() {
  return (
    <div className="auth-page">
      <PageHeader
        eyebrow="演示账户"
        title="欢迎回来"
        description="当前仅保留认证界面边界，尚未接入 Supabase Auth。"
      />
      <form className="auth-card">
        <label>
          邮箱
          <input type="email" placeholder="collector@example.com" />
        </label>
        <label>
          密码
          <input type="password" placeholder="请输入密码" />
        </label>
        <button type="button">登录演示</button>
        <ButtonLink to={routes.register} variant="secondary">创建账户</ButtonLink>
      </form>
    </div>
  );
}
