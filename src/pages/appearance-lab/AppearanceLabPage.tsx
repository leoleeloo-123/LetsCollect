import { useMemo, useState } from "react";
import { ArrowLeft, Check, Grid3X3, Palette, Rotate3D } from "lucide-react";
import { Link } from "react-router-dom";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import {
  colorAnimalModels,
  colorAnimalPalettes,
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import {
  formalColorAnimalModelIds,
  type FormalColorAnimalModelId
} from "../../features/toys/formalRoster";
import { generateCollectible } from "../../features/toys/generator";
import { ToyViewer } from "../../three/ToyViewer/ToyViewer";
import type { Collectible, ToyPaletteId } from "../../types/toy";

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
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilter>(
    colorAnimalPalettes[0].id
  );
  const [selectedKey, setSelectedKey] = useState(() =>
    getMatrixKey(formalColorAnimalModelIds[0], colorAnimalPalettes[0].id)
  );

  const selectedToy = matrix.get(selectedKey)
    ?? matrix.values().next().value as Collectible;
  const selectedModel = getToyModel(selectedToy.modelId);
  const selectedPalette = getToyPalette(selectedToy.paletteId);
  const visibleModels = modelFilter === "all"
    ? colorAnimalModels
    : colorAnimalModels.filter((model) => model.id === modelFilter);
  const visiblePalettes = paletteFilter === "all"
    ? colorAnimalPalettes
    : colorAnimalPalettes.filter((palette) => palette.id === paletteFilter);
  const visibleCombinationCount = visibleModels.length * visiblePalettes.length;

  const selectToy = (
    modelId: FormalColorAnimalModelId,
    paletteId: ToyPaletteId
  ) => {
    setSelectedKey(getMatrixKey(modelId, paletteId));
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
          <h1>24 只玩偶，全配色基线</h1>
          <p>正式阵容 · 柔雾树脂 · 9 组配色</p>
        </div>

        <dl className="appearance-lab__metrics">
          <div>
            <dt>模型</dt>
            <dd>{formalColorAnimalModelIds.length}</dd>
          </div>
          <div>
            <dt>配色</dt>
            <dd>{colorAnimalPalettes.length}</dd>
          </div>
          <div>
            <dt>组合</dt>
            <dd>{formalColorAnimalModelIds.length * colorAnimalPalettes.length}</dd>
          </div>
        </dl>
      </header>

      <section className="appearance-lab__filters" aria-label="外观筛选">
        <label className="appearance-lab__model-filter">
          <span>模型</span>
          <select
            value={modelFilter}
            onChange={(event) =>
              setModelFilter(event.target.value as ModelFilter)
            }
          >
            <option value="all">全部 24 只</option>
            {colorAnimalModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>

        <div className="appearance-lab__palette-filter">
          <span className="appearance-lab__filter-label">
            <Palette size={15} />
            配色
          </span>
          <div className="appearance-lab__palette-options">
            <button
              type="button"
              className={paletteFilter === "all" ? "is-active" : ""}
              aria-pressed={paletteFilter === "all"}
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
            <span>柔雾</span>
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
              style={{ backgroundColor: selectedPalette.color }}
              aria-hidden="true"
            />
            <div>
              <strong>{selectedModel.name}</strong>
              <span>{selectedPalette.name}</span>
            </div>
          </div>
        </aside>

        <section className="appearance-lab__matrix" aria-live="polite">
          <div className="appearance-lab__matrix-head">
            <div>
              <span>柔雾树脂基线</span>
              <strong>{visibleCombinationCount} 个组合</strong>
            </div>
            <span>{visibleModels.length} × {visiblePalettes.length}</span>
          </div>

          {paletteFilter === "all" ? (
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
                      const toy = matrix.get(key);
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
                const toy = matrix.get(key);
                if (!toy) return null;
                return (
                  <AppearanceCell
                    key={key}
                    toy={toy}
                    label={model.name}
                    sublabel={palette.name}
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
