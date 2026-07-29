import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Grid3X3,
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

const FIXED_CREATED_AT = "2026-07-29T00:00:00.000Z";

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
type AppearanceCellProps = {
  toy: Collectible;
  label: string;
  sublabel?: string;
  eager?: boolean;
  selected: boolean;
  onSelect: () => void;
};

function AppearanceCell({
  toy,
  label,
  sublabel,
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
      <span className="appearance-cell__visual">
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
  const [surfaceStyleId, setSurfaceStyleId] =
    useState<ToySurfaceStyleId>("matte");
  const [selectedKey, setSelectedKey] = useState(() =>
    getMatrixKey(formalColorAnimalModelIds[0], colorAnimalPalettes[0].id)
  );

  const displayMatrix = useMemo(
    () => applySurfaceStyleToMatrix(matrix, surfaceStyleId),
    [matrix, surfaceStyleId]
  );
  const selectedToy = displayMatrix.get(selectedKey)
    ?? displayMatrix.values().next().value as Collectible;
  const selectedModel = getToyModel(selectedToy.modelId);
  const selectedPalette = getToyPalette(selectedToy.paletteId);
  const selectedSurface = getToySurfaceStyle(surfaceStyleId);
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

  const selectSurface = (nextSurfaceStyleId: ToySurfaceStyleId) => {
    setSurfaceStyleId(nextSurfaceStyleId);
    if (getToySurfaceStyle(nextSurfaceStyleId).colorOverride) {
      setPaletteFilter(colorAnimalPalettes[0].id);
    }
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
          <p>正式阵容 · 柔雾树脂 / 金属金 · 9 组配色</p>
        </div>

        <dl className="appearance-lab__metrics">
          <div>
            <dt>模型</dt>
            <dd>{formalColorAnimalModelIds.length}</dd>
          </div>
          <div>
            <dt>表面</dt>
            <dd>{toySurfaceStyles.length}</dd>
          </div>
          <div>
            <dt>组合</dt>
            <dd>
              {formalColorAnimalModelIds.length * (colorAnimalPalettes.length + 1)}
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
            表面
          </span>
          <div className="appearance-lab__palette-options">
            {toySurfaceStyles.map((surface) => (
              <button
                type="button"
                key={surface.id}
                className={surfaceStyleId === surface.id ? "is-active" : ""}
                aria-pressed={surfaceStyleId === surface.id}
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
            {surfaceUsesFixedColor ? "固定配色" : "配色"}
          </span>
          <div className="appearance-lab__palette-options">
            <button
              type="button"
              className={paletteFilter === "all" ? "is-active" : ""}
              aria-pressed={paletteFilter === "all"}
              disabled={surfaceUsesFixedColor}
              onClick={() => setPaletteFilter("all")}
            >
              <Grid3X3 size={14} />
              全部
            </button>
            {colorAnimalPalettes.map((palette) => (
              <button
                type="button"
                key={palette.id}
                className={paletteFilter === palette.id ? "is-active" : ""}
                aria-pressed={paletteFilter === palette.id}
                disabled={surfaceUsesFixedColor}
                onClick={() => setPaletteFilter(palette.id)}
              >
                <span
                  className="appearance-lab__swatch"
                  style={{ backgroundColor: palette.color }}
                  aria-hidden="true"
                />
                {palette.name}
              </button>
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
            <span>{selectedSurface.shortName}</span>
          </div>
          <div className="appearance-inspector__viewer">
            <ToyViewer
              key={selectedToy.appearanceSignature}
              toy={selectedToy}
              variant="inspect"
              interactive
              autoRotate="intro"
              materialProfile="compact"
            />
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
