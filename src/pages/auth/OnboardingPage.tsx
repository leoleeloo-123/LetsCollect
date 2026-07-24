import { Check, ChevronLeft, Gem, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMvpState } from "../../app/MvpState";
import {
  availableCompanionOptions,
  colorMoods,
  getMoodPreviewColors,
  materialPreferences
} from "../../features/collect/collectPreferences";
import { useAuth } from "../../features/auth/AuthContext";
import {
  avatarOptions,
  validateDisplayName,
  type AvatarKey
} from "../../features/auth/profile";
import type {
  ColorMoodId,
  MaterialPreference
} from "../../types/taste";
import type { ToyModelId } from "../../types/toy";

type OnboardingStep = 0 | 1 | 2 | 3;

const stepCopy: Record<OnboardingStep, {
  eyebrow: string;
  title: string;
  description: string;
}> = {
  0: {
    eyebrow: "第一次见面",
    title: "先为你的收藏身份取个名字",
    description: "不用邮箱或密码。这个名字和小头像只属于你的收藏空间。"
  },
  1: {
    eyebrow: "偏好 01",
    title: "哪些伙伴看起来最亲切？",
    description: "最多选三只，也可以先不选。它们只是柔和信号，不会暗改盲盒概率。"
  },
  2: {
    eyebrow: "偏好 02",
    title: "你更容易被哪种颜色吸引？",
    description: "选择一种颜色氛围。之后仍可以在个人空间里调整。"
  },
  3: {
    eyebrow: "偏好 03",
    title: "最后，选一种喜欢的质感",
    description: "当前有十只柔雾伙伴，以及水晶独角兽和水晶小狗两只晶亮伙伴。"
  }
};

export function OnboardingPage() {
  const {
    status,
    error: authError,
    isSubmitting,
    completeOnboarding,
    retry
  } = useAuth();
  const { tastePreferences, updateTastePreferences } = useMvpState();
  const location = useLocation();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [displayName, setDisplayName] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("mint-unicorn");
  const [modelIds, setModelIds] = useState<ToyModelId[]>(
    tastePreferences.modelIds
  );
  const [colorMood, setColorMood] = useState<ColorMoodId>(
    tastePreferences.colorMood
  );
  const [material, setMaterial] = useState<MaterialPreference>(
    tastePreferences.material
  );
  const [fieldError, setFieldError] = useState("");
  const liveValidation = validateDisplayName(displayName);
  const destination = (location.state as { from?: string } | null)?.from ?? "/";
  const copy = stepCopy[step];

  if (status === "ready") return <Navigate to={destination} replace />;

  const toggleModel = (modelId: ToyModelId) => {
    setModelIds((current) => {
      if (current.includes(modelId)) {
        return current.filter((id) => id !== modelId);
      }
      if (current.length >= 3) return current;
      return [...current, modelId];
    });
  };

  const goForward = () => {
    if (step === 0 && liveValidation.error) {
      setFieldError(liveValidation.error);
      return;
    }
    setFieldError("");
    setStep((current) => Math.min(3, current + 1) as OnboardingStep);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < 3) {
      goForward();
      return;
    }

    if (liveValidation.error) {
      setStep(0);
      setFieldError(liveValidation.error);
      return;
    }

    setFieldError("");
    try {
      await completeOnboarding(liveValidation.value, avatarKey);
      updateTastePreferences({ modelIds, colorMood, material });
    } catch {
      // AuthContext provides the user-facing service error.
    }
  }

  return (
    <main className="onboarding-page onboarding-page--taste">
      <section className="onboarding-intro">
        <span className="onboarding-intro__brand">Let's Collect</span>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="onboarding-intro__glow" aria-hidden="true">
          <span className={`profile-avatar profile-avatar--${avatarKey.replace("-unicorn", "")}`}>
            <Sparkles size={28} />
          </span>
        </div>
      </section>

      <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
        <div className="onboarding-progress" aria-label={`注册进度，第 ${step + 1} 步，共 4 步`}>
          <div>
            <span>收藏偏好</span>
            <strong>{step + 1} / 4</strong>
          </div>
          <div aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <i key={index} className={index <= step ? "is-active" : ""} />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <div className="onboarding-step" key="identity">
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
              <p id="display-name-help">
                支持中文、英文、数字、空格、_ 和 -，昵称可以重复。
              </p>
              {fieldError ? (
                <p className="form-error" id="display-name-error">{fieldError}</p>
              ) : null}
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
                      {avatarKey === avatar.key ? (
                        <Check className="avatar-option__check" size={13} />
                      ) : null}
                    </span>
                    <span>{avatar.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 1 ? (
          <fieldset className="onboarding-field onboarding-taste" key="models">
            <legend>
              喜欢的伙伴
              <small>{modelIds.length} / 3</small>
            </legend>
            <div className="onboarding-companion-grid">
              {availableCompanionOptions.map((option) => {
                const selected = modelIds.includes(option.id);
                const disabled = !selected && modelIds.length >= 3;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => toggleModel(option.id)}
                  >
                    <span aria-hidden="true">{selected ? <Check size={14} /> : null}</span>
                    <strong>{option.name}</strong>
                  </button>
                );
              })}
            </div>
            <p>偏好会帮助形成 Collection Signature，但不会改变系列盲盒的公开概率。</p>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="onboarding-field onboarding-taste" key="colors">
            <legend>颜色氛围</legend>
            <div className="onboarding-mood-grid">
              {colorMoods.map((mood) => {
                const selected = colorMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => setColorMood(mood.id)}
                  >
                    <span className="onboarding-mood-grid__swatches" aria-hidden="true">
                      {getMoodPreviewColors(mood.id).map((color, index) => (
                        <i key={`${mood.id}-${index}`} style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    <span><strong>{mood.label}</strong><small>{mood.description}</small></span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset className="onboarding-field onboarding-taste" key="materials">
            <legend>喜欢的质感</legend>
            <div className="onboarding-material-grid">
              {materialPreferences.map((option) => {
                const selected = material === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => setMaterial(option.id)}
                  >
                    <span aria-hidden="true">
                      {option.id === "crystal"
                        ? <Gem size={19} />
                        : <Sparkles size={19} />}
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <p>选择“喜欢晶亮”只是偏好信号，不会改变两只水晶伙伴的公开抽取概率。</p>
          </fieldset>
        ) : null}

        {authError ? (
          <div className="onboarding-service-error" role="alert">
            <span>{authError}</span>
            {status === "error" ? (
              <button type="button" onClick={retry}>重试</button>
            ) : null}
          </div>
        ) : null}

        <div className="onboarding-actions">
          {step > 0 ? (
            <button
              className="onboarding-back"
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1) as OnboardingStep)}
              disabled={isSubmitting}
            >
              <ChevronLeft size={18} aria-hidden="true" />
              上一步
            </button>
          ) : null}
          <button
            className="onboarding-submit"
            type="submit"
            disabled={isSubmitting || (step === 3 && status === "loading")}
          >
            <Sparkles size={18} />
            {isSubmitting
              ? "正在创建收藏身份..."
              : step === 3
                ? "完成，开始收藏"
                : "下一步"}
          </button>
        </div>

        <p className="onboarding-note">
          身份与偏好会保存在当前浏览器中。未来可以从头像进入个人空间再次调整。
        </p>
      </form>
    </main>
  );
}
