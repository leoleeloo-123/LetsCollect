import { useMemo } from "react";
import {
  ArrowRight,
  Check,
  Gem,
  LibraryBig,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { useMvpState } from "../../app/MvpState";
import { productCopy } from "../../content/productCopy";
import {
  availableCompanionOptions,
  colorMoods,
  getMoodPreviewColors,
  getPreferredPaletteId
} from "../../features/collect/collectPreferences";
import {
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import { generateCollectible } from "../../features/toys/generator";
import { ToyViewer } from "../../three/ToyViewer";
import type { ColorMoodId, MaterialPreference } from "../../types/taste";
import type { ToyModelId, ToyPaletteId } from "../../types/toy";
import "./collect-page.css";

const modelSeeds: Partial<Record<ToyModelId, number>> = {
  "color-otter": 101,
  "color-bird": 211,
  "color-teddy": 307,
  "color-bunny": 401,
  "color-cat": 503,
  "color-panda": 601,
  "diamond-unicorn": 701
};

const crystalPaletteByMood: Record<ColorMoodId, ToyPaletteId> = {
  open: "diamond-clear",
  calm: "diamond-ice",
  warm: "diamond-champagne",
  fresh: "diamond-mint",
  dreamy: "diamond-rose",
  bold: "diamond-rose"
};

const materialOptions: readonly {
  id: MaterialPreference;
  label: string;
  description: string;
}[] = [
  { id: "open", label: "Open", description: "Let either finish appear" },
  { id: "matte", label: "Matte", description: "Six soft companions" },
  { id: "crystal", label: "Crystal curious", description: "One Unicorn exhibit" }
];

export function CollectPage() {
  const {
    collection,
    representativeIds,
    tastePreferences,
    updateTastePreferences
  } = useMvpState();

  const selectedModelId =
    tastePreferences.modelIds.find((modelId) => modelId !== "diamond-unicorn")
    ?? "color-bunny";
  const heroModelId: ToyModelId =
    tastePreferences.material === "crystal"
      ? "diamond-unicorn"
      : selectedModelId;
  const heroPaletteId =
    heroModelId === "diamond-unicorn"
      ? crystalPaletteByMood[tastePreferences.colorMood]
      : getPreferredPaletteId(tastePreferences.colorMood);

  const heroToy = useMemo(
    () => generateCollectible({
      id: `preference-preview-${heroModelId}-${heroPaletteId}`,
      publicCode: "LC-PREVIEW",
      seed: (modelSeeds[heroModelId] ?? 701) + heroPaletteId.length * 17,
      modelId: heroModelId,
      paletteId: heroPaletteId,
      createdAt: "2026-07-24T00:00:00.000Z"
    }),
    [heroModelId, heroPaletteId]
  );

  const representativeCount = representativeIds.filter((id) =>
    collection.some((toy) => toy.id === id)
  ).length;

  const toggleModel = (modelId: ToyModelId) => {
    const selected = tastePreferences.modelIds.includes(modelId);
    const nextModelIds = selected
      ? tastePreferences.modelIds.filter((id) => id !== modelId)
      : [...tastePreferences.modelIds, modelId].slice(-3);
    updateTastePreferences({ modelIds: nextModelIds });
  };

  return (
    <div className="collect-page">
      <section className="collect-hero" aria-labelledby="collect-title">
        <div className="collect-hero__copy">
          <p className="collect-kicker">
            <Sparkles size={14} aria-hidden="true" />
            {productCopy.collect.eyebrow}
          </p>
          <p className="collect-signature">{productCopy.signature}</p>
          <h1 id="collect-title">{productCopy.collect.title}</h1>
          <p className="collect-hero__intro">{productCopy.collect.description}</p>

          <div className="collect-hero__actions">
            <Link className="collect-primary-action" to={routes.draw}>
              {productCopy.collect.primaryAction}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="collect-secondary-action" to={routes.collection}>
              <LibraryBig size={17} aria-hidden="true" />
              {productCopy.collect.secondaryAction}
            </Link>
          </div>

          <dl className="collect-hero__facts">
            <div>
              <dt>Collection</dt>
              <dd>{collection.length} companions</dd>
            </div>
            <div>
              <dt>Representatives</dt>
              <dd>{representativeCount} of 3 chosen</dd>
            </div>
          </dl>
        </div>

        <div className="collect-hero__stage">
          <div className="collect-hero__aura" aria-hidden="true" />
          <ToyViewer
            toy={heroToy}
            variant="hero"
            autoRotate="continuous"
            className="collect-hero__viewer"
          />
          <div className="collect-hero__identity">
            <span>
              {heroToy.materialId === "crystal" ? <Gem size={14} /> : <Sparkles size={14} />}
              {heroToy.materialId === "crystal" ? "Crystal exhibit" : "Soft matte"}
            </span>
            <strong>{getToyModel(heroToy.modelId).name}</strong>
            <small>{getToyPalette(heroToy.paletteId).name}</small>
          </div>
        </div>
      </section>

      <section className="collect-preferences" aria-labelledby="collect-preferences-title">
        <header className="collect-preferences__header">
          <div>
            <p className="collect-kicker">
              <SlidersHorizontal size={14} aria-hidden="true" />
              Taste signals
            </p>
            <h2 id="collect-preferences-title">
              {productCopy.collect.preferenceTitle}
            </h2>
          </div>
          <p>{productCopy.collect.preferenceDescription}</p>
        </header>

        <div className="collect-preferences__grid">
          <fieldset className="preference-group preference-group--companions">
            <legend>
              <span>01</span>
              Companions
              <small>Choose up to three</small>
            </legend>
            <div className="preference-companion-list">
              {availableCompanionOptions.map((option) => {
                const selected = tastePreferences.modelIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => toggleModel(option.id)}
                  >
                    <span className="preference-companion-list__mark" aria-hidden="true">
                      {selected ? <Check size={13} /> : null}
                    </span>
                    <strong>{option.name}</strong>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="preference-group">
            <legend>
              <span>02</span>
              Color mood
              <small>Mapped to available colors</small>
            </legend>
            <div className="preference-mood-list">
              {colorMoods.map((mood) => {
                const selected = tastePreferences.colorMood === mood.id;
                const previewColors = getMoodPreviewColors(mood.id);
                return (
                  <button
                    key={mood.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => updateTastePreferences({ colorMood: mood.id })}
                  >
                    <span className="preference-mood-list__swatches" aria-hidden="true">
                      {previewColors.map((color, index) => (
                        <i key={`${mood.id}-${index}`} style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    <span>
                      <strong>{mood.label}</strong>
                      <small>{mood.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="preference-group">
            <legend>
              <span>03</span>
              Finish
              <small>Only current assets</small>
            </legend>
            <div className="preference-material-list">
              {materialOptions.map((option) => {
                const selected = tastePreferences.material === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => updateTastePreferences({ material: option.id })}
                  >
                    <span aria-hidden="true">
                      {option.id === "crystal" ? <Gem size={17} /> : <Sparkles size={17} />}
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="preference-group__note">
              Crystal currently means the single Diamond Unicorn exhibit.
              No other crystal models are implied.
            </p>
          </fieldset>
        </div>
      </section>
    </div>
  );
}
