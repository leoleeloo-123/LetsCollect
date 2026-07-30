import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Grid3X3,
  Layers3,
  Palette,
  Rotate3D,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import {
  colorAnimalModels,
  colorAnimalPalettes,
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import {
  getToySurfaceStyle,
  toySurfaceStyles
} from "../../features/toys/surfaceStyles";
import {
  getToyStageTheme,
  toyStageThemes,
  type ToyStageThemeDefinition,
  type ToyStageThemeId
} from "../../features/toys/stageThemes";
import {
  formalColorAnimalModelIds,
  type FormalColorAnimalModelId
} from "../../features/toys/formalRoster";
import { generateCollectible } from "../../features/toys/generator";
import {
  collectSeries,
  type AvailableCollectSeriesId
} from "../../features/collect/collectSeries";
import { ToyViewer } from "../../three/ToyViewer/ToyViewer";
import type {
  Collectible,
  ToyPaletteId,
  ToySurfaceStyleId
} from "../../types/toy";

type SeriesFilter = "all" | AvailableCollectSeriesId;
type ModelFilter = "all" | FormalColorAnimalModelId;
type PaletteFilter = "all" | ToyPaletteId;
type SurfaceMode = "matte" | "metal";
type MetalSurfaceStyleId =
  | "metal-gold"
  | "metal-silver"
  | "metal-rose-gold";

const FIXED_CREATED_AT = "2026-07-29T00:00:00.000Z";
const CONFIGURED_METAL_SURFACE_STYLE_IDS = [
  "metal-gold",
  "metal-silver",
  "metal-rose-gold"
] as const satisfies readonly MetalSurfaceStyleId[];
const ACTIVE_METAL_SURFACE_STYLE_IDS =
  CONFIGURED_METAL_SURFACE_STYLE_IDS.filter((styleId) =>
    toySurfaceStyles.some((surface) => surface.id === styleId)
  );
const HAS_MATTE_SURFACE = toySurfaceStyles.some(
  (surface) => surface.id === "matte"
);
const LAB_SURFACE_OPTIONS: readonly {
  id: SurfaceMode;
  name: string;
  swatch: string;
}[] = [
  ...(HAS_MATTE_SURFACE
    ? [{ id: "matte" as const, name: "柔雾树脂", swatch: "#d7a27f" }]
    : []),
  ...(ACTIVE_METAL_SURFACE_STYLE_IDS.length > 0
    ? [{
        id: "metal" as const,
        name: "金属",
        swatch: getToySurfaceStyle(ACTIVE_METAL_SURFACE_STYLE_IDS[0]).swatch
      }]
    : [])
];
const DEFAULT_SURFACE_MODE = LAB_SURFACE_OPTIONS[0].id;
const DEFAULT_METAL_SURFACE_STYLE_ID =
  ACTIVE_METAL_SURFACE_STYLE_IDS[0] ?? "metal-gold";
const STAGE_THEME_GROUPS = [
  {
    id: "dynamic",
    label: "动态",
    themes: toyStageThemes.filter((theme) => theme.group === "dynamic")
  },
  {
    id: "static",
    label: "静态",
    themes: toyStageThemes.filter((theme) => theme.group === "static")
  }
] as const;
const DEFAULT_STAGE_THEME_ID = toyStageThemes.find(
  (theme) => theme.id === "soft-green"
)?.id ?? toyStageThemes[0].id;
const TOTAL_APPEARANCE_COMBINATION_COUNT = formalColorAnimalModelIds.length
  * (
    (HAS_MATTE_SURFACE ? colorAnimalPalettes.length : 0)
    + ACTIVE_METAL_SURFACE_STYLE_IDS.length
  )
  * toyStageThemes.length;

function getMatrixKey(modelId: FormalColorAnimalModelId, paletteId: ToyPaletteId) {
  return `${modelId}:${paletteId}`;
}

function createAppearanceMatrix() {
  const toys = new Map<string, Collectible>();

  formalColorAnimalModelIds.forEach((modelId, modelIndex) => {
    colorAnimalPalettes.forEach((palette, paletteIndex) => {
      const key = getMatrixKey(modelId, palette.id);
      toys.set(
        key,
        generateCollectible({
          id: `appearance-${modelId}-${palette.id}`,
          publicCode: `LAB-${modelIndex + 1}-${paletteIndex + 1}`,
          modelId,
          paletteId: palette.id,
          seed: (modelIndex + 1) * 1000 + paletteIndex + 1,
          createdAt: FIXED_CREATED_AT
        })
      );
    });
  });

  return toys;
}

function applySurfaceStyleToMatrix(
  matrix: Map<string, Collectible>,
  surfaceStyleId: ToySurfaceStyleId
) {
  if (surfaceStyleId === "matte") return matrix;

  const surfaced = new Map<string, Collectible>();
  matrix.forEach((toy, key) => {
    surfaced.set(key, {
      ...toy,
      surfaceStyleId,
      appearanceSignature: `${toy.appearanceSignature}:surface:${surfaceStyleId}`
    });
  });
  return surfaced;
}

type StageAtmosphereProps = {
  theme: ToyStageThemeDefinition;
  layer: "back" | "front";
};

function StageAtmosphere({ theme, layer }: StageAtmosphereProps) {
  if (!theme.particle) return null;
  const particleCount = layer === "back" ? 10 : 8;

  return (
    <span
      className={`appearance-stage-particles appearance-stage-particles--${layer} is-${theme.particle}`}
      aria-hidden="true"
    >
      {Array.from({ length: particleCount }, (_, index) => (
        <span key={`${layer}-${index}`} />
      ))}
    </span>
  );
}

type AppearanceCellProps = {
  toy: Collectible;
  label: string;
  sublabel?: string;
  background: string;
  eager?: boolean;
  selected: boolean;
  onSelect: () => void;
};

function AppearanceCell({
  toy,
  label,
  sublabel,
  background,
  eager = false,
  selected,
  onSelect
}: AppearanceCellProps) {
  return (
    <button
      type="button"
      className={`appearance-cell${selected ? " is-selected" : ""}`}
      aria-label={`检查${toy.name}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span
        className="appearance-cell__visual"
        style={{ backgroundColor: background }}
      >
        <ToyThumbnail toy={toy} size="card" eager={eager} />
        {selected ? (
          <span className="appearance-cell__selected" aria-hidden="true">
            <Check size={12} strokeWidth={3} />
          </span>
        ) : null}
      </span>
      <span className="appearance-cell__label">{label}</span>
      {sublabel ? (
        <span className="appearance-cell__sublabel">{sublabel}</span>
      ) : null}
    </button>
  );
}

export function AppearanceLabPage() {
  const matrix = useMemo(createAppearanceMatrix, []);
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>("all");
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilter>(
    colorAnimalPalettes[0].id
  );
  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>(
    DEFAULT_SURFACE_MODE
  );
  const [stageThemeId, setStageThemeId] = useState<ToyStageThemeId>(
    DEFAULT_STAGE_THEME_ID
  );
  const [metalSurfaceStyleId, setMetalSurfaceStyleId] =
    useState<MetalSurfaceStyleId>(DEFAULT_METAL_SURFACE_STYLE_ID);
  const [selectedKey, setSelectedKey] = useState(() =>
    getMatrixKey(formalColorAnimalModelIds[0], colorAnimalPalettes[0].id)
  );
  const surfaceStyleId: ToySurfaceStyleId = surfaceMode === "metal"
    ? metalSurfaceStyleId
    : surfaceMode;

  const displayMatrix = useMemo(
    () => applySurfaceStyleToMatrix(matrix, surfaceStyleId),
    [matrix, surfaceStyleId]
  );
  const selectedToy = displayMatrix.get(selectedKey)
    ?? displayMatrix.values().next().value as Collectible;
  const selectedModel = getToyModel(selectedToy.modelId);
  const selectedPalette = getToyPalette(selectedToy.paletteId);
  const selectedSurface = getToySurfaceStyle(surfaceStyleId);
  const selectedStageTheme = getToyStageTheme(stageThemeId);
  const surfaceUsesFixedColor = selectedSurface.colorOverride !== null;
  const selectedSeries = seriesFilter === "all"
    ? null
    : collectSeries.find((series) => series.id === seriesFilter) ?? null;
  const seriesModels = selectedSeries
    ? selectedSeries.modelIds.map(getToyModel)
    : colorAnimalModels;
  const visibleModels = modelFilter === "all"
    ? seriesModels
    : seriesModels.filter((model) => model.id === modelFilter);
  const visiblePalettes = surfaceUsesFixedColor
    ? [getToyPalette(colorAnimalPalettes[0].id)]
    : paletteFilter === "all"
      ? colorAnimalPalettes
      : colorAnimalPalettes.filter((palette) => palette.id === paletteFilter);
  const visibleCombinationCount = visibleModels.length * visiblePalettes.length;

  const selectToy = (
    modelId: FormalColorAnimalModelId,
    paletteId: ToyPaletteId
  ) => {
    setSelectedKey(getMatrixKey(modelId, paletteId));
  };

  const selectSurface = (nextSurfaceMode: SurfaceMode) => {
    setSurfaceMode(nextSurfaceMode);
    if (nextSurfaceMode === "metal") {
      const firstPaletteId = colorAnimalPalettes[0].id;
      setPaletteFilter(firstPaletteId);
      setSelectedKey(getMatrixKey(
        selectedToy.modelId as FormalColorAnimalModelId,
        firstPaletteId
      ));
    }
  };

  const selectMetalColor = (nextStyleId: MetalSurfaceStyleId) => {
    setMetalSurfaceStyleId(nextStyleId);
  };

  const selectPalette = (nextPaletteFilter: PaletteFilter) => {
    setPaletteFilter(nextPaletteFilter);
    if (nextPaletteFilter === "all") return;
    setSelectedKey(getMatrixKey(
      selectedToy.modelId as FormalColorAnimalModelId,
      nextPaletteFilter
    ));
  };

  const selectSeries = (nextSeriesFilter: SeriesFilter) => {
    setSeriesFilter(nextSeriesFilter);
    setModelFilter("all");

    if (nextSeriesFilter === "all") return;
    const nextSeries = collectSeries.find(
      (series) => series.id === nextSeriesFilter
    );
    const firstModelId = nextSeries?.modelIds[0] as
      | FormalColorAnimalModelId
      | undefined;
    if (firstModelId) {
      setSelectedKey(getMatrixKey(firstModelId, selectedToy.paletteId));
    }
  };

  return (
    <main className="appearance-lab">
      <header className="appearance-lab__header">
        <Link className="appearance-lab__back" to="/">
          <ArrowLeft size={17} />
          返回首页
        </Link>

        <div className="appearance-lab__heading">
          <p className="appearance-lab__eyebrow">
            <Grid3X3 size={15} />
            APPEARANCE LAB
          </p>
          <h1>24 只玩偶，外观实验室</h1>
          <p>
            正式阵容 · {LAB_SURFACE_OPTIONS.length} 种表面材质 · {toyStageThemes.length} 组舞台背景
          </p>
        </div>

        <dl className="appearance-lab__metrics">
          <div>
            <dt>模型</dt>
            <dd>{formalColorAnimalModelIds.length}</dd>
          </div>
          <div>
            <dt>表面</dt>
            <dd>{LAB_SURFACE_OPTIONS.length}</dd>
          </div>
          <div>
            <dt>背景</dt>
            <dd>{toyStageThemes.length}</dd>
          </div>
          <div>
            <dt>组合</dt>
            <dd>
              {TOTAL_APPEARANCE_COMBINATION_COUNT}
            </dd>
          </div>
        </dl>
      </header>

      <section className="appearance-lab__filters" aria-label="外观筛选">
        <label className="appearance-lab__select-filter">
          <span>系列</span>
          <select
            data-testid="series-filter"
            value={seriesFilter}
            onChange={(event) =>
              selectSeries(event.target.value as SeriesFilter)
            }
          >
            <option value="all">全部系列 · 24 只</option>
            {collectSeries.map((series) => (
              <option key={series.id} value={series.id}>
                {series.category === "color" ? series.eyebrow : series.title}
                {" · "}
                {series.modelIds.length} 只
              </option>
            ))}
          </select>
        </label>

        <label className="appearance-lab__select-filter">
          <span>模型</span>
          <select
            data-testid="model-filter"
            value={modelFilter}
            onChange={(event) =>
              setModelFilter(event.target.value as ModelFilter)
            }
          >
            <option value="all">全部 {seriesModels.length} 只</option>
            {seriesModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>

        <div className="appearance-lab__palette-filter appearance-lab__surface-filter">
          <span className="appearance-lab__filter-label">
            <Sparkles size={15} />
            表面材质
          </span>
          <div className="appearance-lab__palette-options">
            {LAB_SURFACE_OPTIONS.map((surface) => (
              <button
                type="button"
                key={surface.id}
                className={surfaceMode === surface.id ? "is-active" : ""}
                aria-pressed={surfaceMode === surface.id}
                onClick={() => selectSurface(surface.id)}
              >
                <span
                  className="appearance-lab__swatch"
                  style={{ backgroundColor: surface.swatch }}
                  aria-hidden="true"
                />
                {surface.name}
              </button>
            ))}
          </div>
        </div>

        <div className="appearance-lab__palette-filter">
          <span className="appearance-lab__filter-label">
            <Palette size={15} />
            配色
          </span>
          <div className="appearance-lab__palette-options">
            {surfaceMode === "metal" ? (
              ACTIVE_METAL_SURFACE_STYLE_IDS.map((styleId) => {
                const style = getToySurfaceStyle(styleId);
                return (
                  <button
                    type="button"
                    key={styleId}
                    className={
                      metalSurfaceStyleId === styleId ? "is-active" : ""
                    }
                    aria-pressed={metalSurfaceStyleId === styleId}
                    onClick={() => selectMetalColor(styleId)}
                  >
                    <span
                      className="appearance-lab__swatch"
                      style={{ backgroundColor: style.swatch }}
                      aria-hidden="true"
                    />
                    {style.name}
                  </button>
                );
              })
            ) : (
              <>
                <button
                  type="button"
                  className={paletteFilter === "all" ? "is-active" : ""}
                  aria-pressed={paletteFilter === "all"}
                  onClick={() => selectPalette("all")}
                >
                  <Grid3X3 size={14} />
                  全部
                </button>
                {colorAnimalPalettes.map((palette) => (
                  <button
                    type="button"
                    key={palette.id}
                    className={
                      paletteFilter === palette.id ? "is-active" : ""
                    }
                    aria-pressed={paletteFilter === palette.id}
                    onClick={() => selectPalette(palette.id)}
                  >
                    <span
                      className="appearance-lab__swatch"
                      style={{ backgroundColor: palette.color }}
                      aria-hidden="true"
                    />
                    {palette.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="appearance-lab__background-filter">
          <span className="appearance-lab__filter-label">
            <Layers3 size={15} />
            背景
          </span>
          <div className="appearance-lab__background-options">
            {STAGE_THEME_GROUPS.map((group) => (
              <div className="appearance-lab__background-group" key={group.id}>
                <span>{group.label}</span>
                {group.themes.map((theme) => (
                  <button
                    type="button"
                    key={theme.id}
                    className={stageThemeId === theme.id ? "is-active" : ""}
                    aria-pressed={stageThemeId === theme.id}
                    onClick={() => setStageThemeId(theme.id)}
                  >
                    <span
                      className="appearance-lab__background-swatch"
                      style={{ backgroundColor: theme.swatch }}
                      aria-hidden="true"
                    />
                    {theme.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="appearance-lab__workspace">
        <aside className="appearance-inspector">
          <div className="appearance-inspector__topline">
            <span>
              <Rotate3D size={15} />
              实时检查
            </span>
            <span>{selectedSurface.shortName} · {selectedStageTheme.name}</span>
          </div>
          <div
            className="appearance-inspector__viewer"
            data-stage-theme={selectedStageTheme.id}
            style={{ backgroundColor: selectedStageTheme.background }}
          >
            <StageAtmosphere theme={selectedStageTheme} layer="back" />
            <ToyViewer
              key={selectedToy.appearanceSignature}
              toy={selectedToy}
              variant="inspect"
              interactive
              autoRotate="intro"
              materialProfile="compact"
            />
            <StageAtmosphere theme={selectedStageTheme} layer="front" />
          </div>
          <div className="appearance-inspector__meta">
            <span
              className="appearance-inspector__swatch"
              style={{
                backgroundColor: selectedSurface.colorOverride
                  ?? selectedPalette.color
              }}
              aria-hidden="true"
            />
            <div>
              <strong>{selectedModel.name}</strong>
              <span>
                {surfaceUsesFixedColor
                  ? selectedSurface.name
                  : `${selectedSurface.name} · ${selectedPalette.name}`}
              </span>
            </div>
          </div>
        </aside>

        <section className="appearance-lab__matrix" aria-live="polite">
          <div className="appearance-lab__matrix-head">
            <div>
              <span>
                {selectedSeries
                  ? `${selectedSeries.category === "color"
                      ? selectedSeries.eyebrow
                      : selectedSeries.title}系列`
                  : `${selectedSurface.name}基线`}
              </span>
              <strong>{visibleCombinationCount} 个组合</strong>
            </div>
            <span>{visibleModels.length} × {visiblePalettes.length}</span>
          </div>

          {paletteFilter === "all" && !surfaceUsesFixedColor ? (
            <div className="appearance-model-rows">
              {visibleModels.map((model, modelIndex) => (
                <section className="appearance-model-row" key={model.id}>
                  <header>
                    <span>{String(modelIndex + 1).padStart(2, "0")}</span>
                    <h2>{model.name}</h2>
                    <code>{model.id}</code>
                  </header>
                  <div className="appearance-model-row__grid">
                    {visiblePalettes.map((palette) => {
                      const key = getMatrixKey(
                        model.id as FormalColorAnimalModelId,
                        palette.id
                      );
                      const toy = displayMatrix.get(key);
                      if (!toy) return null;
                      return (
                        <AppearanceCell
                          key={key}
                          toy={toy}
                          label={palette.name}
                          background={selectedStageTheme.background}
                          selected={selectedKey === key}
                          onSelect={() =>
                            selectToy(
                              model.id as FormalColorAnimalModelId,
                              palette.id
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="appearance-focus-grid">
              {visibleModels.map((model) => {
                const palette = visiblePalettes[0];
                const key = getMatrixKey(
                  model.id as FormalColorAnimalModelId,
                  palette.id
                );
                const toy = displayMatrix.get(key);
                if (!toy) return null;
                return (
                  <AppearanceCell
                    key={key}
                    toy={toy}
                    label={model.name}
                    background={selectedStageTheme.background}
                    sublabel={
                      surfaceUsesFixedColor
                        ? selectedSurface.name
                        : palette.name
                    }
                    eager
                    selected={selectedKey === key}
                    onSelect={() =>
                      selectToy(
                        model.id as FormalColorAnimalModelId,
                        palette.id
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
