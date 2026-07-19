import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";

export function RegisterPage() {
  return (
    <div className="auth-page">
      <PageHeader
        eyebrow="创建账户"
        title="开始你的收藏"
        description="当前为界面演示，后续会通过认证服务边界接入 Supabase。"
      />
      <form className="auth-card">
        <label>
          昵称
          <input type="text" placeholder="配色收藏家" />
        </label>
        <label>
          邮箱
          <input type="email" placeholder="collector@example.com" />
        </label>
        <label>
          密码
          <input type="password" placeholder="设置密码" />
        </label>
        <button type="button">创建演示账户</button>
        <ButtonLink to={routes.login} variant="secondary">已有账户，去登录</ButtonLink>
      </form>
    </div>
  );
}
