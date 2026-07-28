import { Check, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import {
  avatarOptions,
  validateDisplayName,
  type AvatarKey
} from "../../features/auth/profile";

export function OnboardingPage() {
  const { status, error: authError, isSubmitting, completeOnboarding, retry } = useAuth();
  const location = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("mint-unicorn");
  const [fieldError, setFieldError] = useState("");
  const liveValidation = validateDisplayName(displayName);
  const destination = (location.state as { from?: string } | null)?.from ?? "/";

  if (status === "ready") return <Navigate to={destination} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (liveValidation.error) {
      setFieldError(liveValidation.error);
      return;
    }

    setFieldError("");
    try {
      await completeOnboarding(liveValidation.value, avatarKey);
    } catch {
      // AuthContext provides the user-facing service error.
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-intro">
        <span className="onboarding-intro__brand">Let's Collect</span>
        <p className="eyebrow">第一次见面</p>
        <h1>为你的收藏身份<br />取一个名字</h1>
        <p>不用邮箱或密码。选好昵称和头像，就可以开始遇见第一只软萌小动物。</p>
        <div className="onboarding-intro__glow" aria-hidden="true">
          <span className={`profile-avatar profile-avatar--${avatarKey.replace("-unicorn", "")}`}>
            <Sparkles size={28} />
          </span>
        </div>
      </section>

      <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
        <div className="onboarding-field">
          <label htmlFor="display-name">你的昵称</label>
          <div className="onboarding-name-input">
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setFieldError("");
              }}
              placeholder="例如：配色收藏家"
              autoComplete="nickname"
              maxLength={24}
              aria-describedby="display-name-help display-name-error"
              aria-invalid={Boolean(fieldError)}
              autoFocus
            />
            <span>{Array.from(liveValidation.value).length}/16</span>
          </div>
          <p id="display-name-help">支持中文、英文、数字、空格、_ 和 -，昵称可以重复。</p>
          {fieldError ? <p className="form-error" id="display-name-error">{fieldError}</p> : null}
        </div>

        <fieldset className="onboarding-field">
          <legend>选择头像</legend>
          <div className="avatar-picker">
            {avatarOptions.map((avatar) => (
              <label key={avatar.key} className="avatar-option">
                <input
                  type="radio"
                  name="avatar"
                  value={avatar.key}
                  checked={avatarKey === avatar.key}
                  onChange={() => setAvatarKey(avatar.key)}
                />
                <span className={`profile-avatar profile-avatar--${avatar.palette}`}>
                  <Sparkles size={20} />
                  {avatarKey === avatar.key ? <Check className="avatar-option__check" size={13} /> : null}
                </span>
                <span>{avatar.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {authError ? (
          <div className="onboarding-service-error" role="alert">
            <span>{authError}</span>
            {status === "error" ? <button type="button" onClick={retry}>重试</button> : null}
          </div>
        ) : null}

        <button className="onboarding-submit" type="submit" disabled={isSubmitting || status === "loading"}>
          <Sparkles size={18} />
          {isSubmitting ? "正在创建收藏身份..." : "开始收藏"}
        </button>
        <p className="onboarding-note">身份会保存在当前浏览器中。清除 Safari 网站数据、使用无痕模式或更换设备后，会创建新的身份。</p>
      </form>
    </main>
  );
}
