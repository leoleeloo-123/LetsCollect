import { ArrowLeft, Grid3X3, Palette, Rotate3D } from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { useSharedToyRotation } from "../../features/home/useSharedToyRotation";
import {
  colorAnimalModels,
  colorAnimalPalettes,
  diamondUnicornPalettes,
  specialExhibitModels
} from "../../features/toys/catalog";
import { generateCollectible } from "../../features/toys/generator";
import {
  ColorBearSingerLabViewer,
  type BearSingerAfroVariant
} from "../../three/ColorBearSingerLab/ColorBearSingerLabViewer";
import {
  ColorDogCameraLabViewer,
  type DogCameraAccessoryVariant
} from "../../three/ColorDogCameraLab/ColorDogCameraLabViewer";
import {
  ColorDogDrumLabViewer,
  type DogDrumVariant
} from "../../three/ColorDogDrumLab/ColorDogDrumLabViewer";
import {
  DiamondDogLabViewer,
  type DiamondDogVariant
} from "../../three/DiamondDogLab/DiamondDogLabViewer";
import { ToyViewer } from "../../three/ToyViewer";
import { AssetLabAccessoryCard } from "./AssetLabAccessoryCard";
import type { ToyPaletteDefinition, ToyPaletteId } from "../../types/toy";

const assetLabModels = [...colorAnimalModels, ...specialExhibitModels] as const;
const DEFAULT_REGULAR_PALETTE_ID: ToyPaletteId = "sky";
const DEFAULT_DIAMOND_PALETTE_ID: ToyPaletteId = "diamond-ice";
const LAB_CREATED_AT = "2026-07-24T00:00:00.000Z";

type AssetLabModelId =
  | "color-otter"
  | "color-bird"
  | "color-penguin"
  | "color-bunny"
  | "color-cat"
  | "color-panda"
  | "diamond-unicorn";
type PaletteSelection = Record<AssetLabModelId, ToyPaletteId>;

const initialPaletteSelection = Object.fromEntries(
  assetLabModels.map((model) => [
    model.id as AssetLabModelId,
    model.id === "diamond-unicorn"
      ? DEFAULT_DIAMOND_PALETTE_ID
      : DEFAULT_REGULAR_PALETTE_ID
  ])
) as PaletteSelection;

const seedByModel: Record<AssetLabModelId, number> = {
  "color-otter": 1801,
  "color-bird": 1811,
  "color-penguin": 1823,
  "color-bunny": 1831,
  "color-cat": 1847,
  "color-panda": 1861,
  "diamond-unicorn": 1871
};

function getPaletteOptions(modelId: AssetLabModelId): ToyPaletteDefinition[] {
  return modelId === "diamond-unicorn"
    ? diamondUnicornPalettes
    : colorAnimalPalettes;
}

function getRecolorTarget(model: (typeof assetLabModels)[number]) {
  if (model.id === "diamond-unicorn") return "整体钻石 tint";
  if (model.id === "color-bird") return "皇冠";
  if (model.id === "color-penguin") return "耳罩顶部与杯子";
  switch (model.rendering?.mode) {
    case "color-otter-lollipop":
      return "棒棒糖";
    case "color-bunny-bag":
      return "行李箱";
    case "color-cat-yarn":
      return "毛线球";
    case "color-panda-hat":
      return "帽子";
    default:
      return "已注册换色区域";
  }
}

export function AssetLabPage() {
  const [paletteByModel, setPaletteByModel] = useState<PaletteSelection>(
    () => ({ ...initialPaletteSelection })
  );
  const [cameraPaletteId, setCameraPaletteId] = useState<ToyPaletteId>(
    DEFAULT_REGULAR_PALETTE_ID
  );
  const [bearSingerPaletteId, setBearSingerPaletteId] = useState<ToyPaletteId>(
    DEFAULT_REGULAR_PALETTE_ID
  );
  const [dogDrumPaletteId, setDogDrumPaletteId] = useState<ToyPaletteId>(
    DEFAULT_REGULAR_PALETTE_ID
  );
  const [diamondDogPaletteId, setDiamondDogPaletteId] = useState<ToyPaletteId>(
    DEFAULT_DIAMOND_PALETTE_ID
  );
  const {
    controller,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown
  } = useSharedToyRotation();

  const previews = useMemo(
    () => assetLabModels.map((model) => {
      const modelId = model.id as AssetLabModelId;
      const paletteId = paletteByModel[modelId];
      return {
        model,
        modelId,
        paletteId,
        toy: generateCollectible({
          id: `asset-lab-${modelId}`,
          publicCode: `LAB-${modelId.toUpperCase()}`,
          seed: seedByModel[modelId],
          modelId,
          paletteId,
          createdAt: LAB_CREATED_AT
        })
      };
    }),
    [paletteByModel]
  );

  const regularPaletteIds = [
    ...colorAnimalModels.map(
      (model) => paletteByModel[model.id as AssetLabModelId]
    ),
    cameraPaletteId,
    bearSingerPaletteId,
    dogDrumPaletteId
  ];
  const unifiedRegularPaletteId = regularPaletteIds.every(
    (paletteId) => paletteId === regularPaletteIds[0]
  )
    ? regularPaletteIds[0]
    : "";

  function updateModelPalette(
    modelId: AssetLabModelId,
    paletteId: ToyPaletteId
  ) {
    const isAllowed = getPaletteOptions(modelId).some(
      (palette) => palette.id === paletteId
    );
    if (!isAllowed) return;
    setPaletteByModel((current) => ({
      ...current,
      [modelId]: paletteId
    }));
  }

  function updateAllRegularPalettes(event: ChangeEvent<HTMLSelectElement>) {
    const paletteId = event.target.value as ToyPaletteId;
    if (!colorAnimalPalettes.some((palette) => palette.id === paletteId)) return;
    setCameraPaletteId(paletteId);
    setBearSingerPaletteId(paletteId);
    setDogDrumPaletteId(paletteId);
    setPaletteByModel((current) => {
      const next = { ...current };
      colorAnimalModels.forEach((model) => {
        next[model.id as AssetLabModelId] = paletteId;
      });
      return next;
    });
  }

  const cameraPalette = colorAnimalPalettes.find(
    (palette) => palette.id === cameraPaletteId
  ) ?? colorAnimalPalettes[0];
  const cameraVariant: DogCameraAccessoryVariant = {
    id: cameraPalette.id,
    name: cameraPalette.name,
    swatch: cameraPalette.color
  };
  const bearSingerPalette = colorAnimalPalettes.find(
    (palette) => palette.id === bearSingerPaletteId
  ) ?? colorAnimalPalettes[0];
  const bearSingerVariant: BearSingerAfroVariant = {
    id: bearSingerPalette.id,
    name: bearSingerPalette.name,
    swatch: bearSingerPalette.color
  };
  const dogDrumPalette = colorAnimalPalettes.find(
    (palette) => palette.id === dogDrumPaletteId
  ) ?? colorAnimalPalettes[0];
  const dogDrumVariant: DogDrumVariant = {
    id: dogDrumPalette.id,
    name: dogDrumPalette.name,
    swatch: dogDrumPalette.color
  };
  const diamondDogPalette = diamondUnicornPalettes.find(
    (palette) => palette.id === diamondDogPaletteId
  ) ?? diamondUnicornPalettes[0];
  const diamondDogVariant: DiamondDogVariant = {
    id: diamondDogPalette.id,
    name: diamondDogPalette.name,
    swatch: diamondDogPalette.color
  };

  return (
    <main className="asset-lab-page">
      <header className="asset-lab-header">
        <Link className="asset-lab-header__back" to={routes.home}>
          <ArrowLeft size={18} aria-hidden="true" />
          返回 Collect
        </Link>
        <Link className="asset-lab-header__mark" to={routes.appearanceLab}>
          <Grid3X3 size={15} aria-hidden="true" />
          24 × 9 外观矩阵
        </Link>
      </header>

      <section className="asset-lab-intro" aria-labelledby="asset-lab-title">
        <div>
          <p className="eyebrow">ALL MODEL LAB ASSETS</p>
          <h1 id="asset-lab-title">一次看完所有当前资产。</h1>
          <p>
            同屏检查六款柔雾树脂 Color Animals、三件配件换色研究和两件水晶材质研究（Diamond Unicorn / Diamond Dog）。
            每张卡都能切换其完整注册色板，拖动任一模型区域会同步旋转全部资产。
          </p>
        </div>
        <dl className="asset-lab-summary" aria-label="资产统计">
          <div><dt>模型</dt><dd>11</dd></div>
          <div><dt>常规色</dt><dd>9</dd></div>
          <div><dt>钻石色</dt><dd>5</dd></div>
        </dl>
      </section>

      <section className="asset-lab-toolbar" aria-label="统一配色控制">
        <div className="asset-lab-toolbar__title">
          <Palette size={18} aria-hidden="true" />
          <div>
            <strong>统一配色检查</strong>
            <span>先统一换色，再在单张卡里单独调整。</span>
          </div>
        </div>

        <label className="asset-lab-select">
          <span>常规九款</span>
          <select
            value={unifiedRegularPaletteId}
            onChange={updateAllRegularPalettes}
            aria-label="统一选择九款常规模型的配色"
          >
            {unifiedRegularPaletteId === "" ? (
              <option value="" disabled>当前为多种配色</option>
            ) : null}
            {colorAnimalPalettes.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </select>
        </label>

        <label className="asset-lab-select">
          <span>Diamond Unicorn</span>
          <select
            value={paletteByModel["diamond-unicorn"]}
            onChange={(event) => updateModelPalette(
              "diamond-unicorn",
              event.target.value as ToyPaletteId
            )}
            aria-label="选择 Diamond Unicorn 钻石色"
          >
            {diamondUnicornPalettes.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </select>
        </label>
        <label className="asset-lab-select">
          <span>Diamond Dog</span>
          <select
            value={diamondDogPaletteId}
            onChange={(event) => setDiamondDogPaletteId(event.target.value as ToyPaletteId)}
            aria-label="选择 Diamond Dog 水晶色"
          >
            {diamondUnicornPalettes.map((palette) => (
              <option key={palette.id} value={palette.id}>
                {palette.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="asset-lab-rotation-hint">
        <Rotate3D size={16} aria-hidden="true" />
        左右拖动同步旋转 · 方向键微调 · Home 回到正面
      </div>

      <div
        className="asset-lab-grid"
        role="group"
        tabIndex={0}
        aria-label="11 款当前 3D 资产。左右拖动可同步旋转全部模型。"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLSelectElement) return;
          handleKeyDown(event);
        }}
      >
        {previews.map(({ model, modelId, paletteId, toy }) => {
          const palettes = getPaletteOptions(modelId);
          const activePalette = palettes.find(
            (palette) => palette.id === paletteId
          ) ?? palettes[0];

          return (
            <article className="asset-lab-card" key={model.id}>
              <div className="asset-lab-card__viewer">
                <ToyViewer
                  toy={toy}
                  variant="stage"
                  interactive={false}
                  autoRotate="off"
                  rotationController={controller}
                  materialProfile={model.id === "diamond-unicorn" ? "compact" : "auto"}
                />
              </div>

              <div className="asset-lab-card__meta">
                <div>
                  <span className="asset-lab-card__kind">
                    {model.id === "diamond-unicorn" ? "SPECIAL EXHIBIT" : "COLOR ANIMAL"}
                  </span>
                  <h2>{model.name}</h2>
                  <p>换色目标：{getRecolorTarget(model)}</p>
                </div>
                <span
                  className="asset-lab-card__swatch"
                  style={{ backgroundColor: activePalette.color }}
                  aria-label={`当前颜色 ${activePalette.name}`}
                />
              </div>

              <label
                className="asset-lab-card__select"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <span>检查配色</span>
                <select
                  value={paletteId}
                  onChange={(event) => updateModelPalette(
                    modelId,
                    event.target.value as ToyPaletteId
                  )}
                  aria-label={`选择${model.name}配色`}
                >
                  {palettes.map((palette) => (
                    <option key={palette.id} value={palette.id}>
                      {palette.name}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          );
        })}
        <AssetLabAccessoryCard
          assetId="diamond-dog"
          kind="CRYSTAL STUDY"
          name="水晶小狗"
          recolorTarget="整体水晶 tint"
          paletteId={diamondDogPaletteId}
          palettes={diamondUnicornPalettes}
          onPaletteChange={setDiamondDogPaletteId}
        >
          <DiamondDogLabViewer
            variant={diamondDogVariant}
            inspectFacets={false}
            compact
            interactive={false}
            rotationController={controller}
          />
        </AssetLabAccessoryCard>
        <AssetLabAccessoryCard
          assetId="color-dog-camera"
          kind="ACCESSORY STUDY"
          name="狗狗相机"
          recolorTarget="帽子与包包"
          paletteId={cameraPaletteId}
          palettes={colorAnimalPalettes}
          onPaletteChange={setCameraPaletteId}
        >
          <ColorDogCameraLabViewer
            variant={cameraVariant}
            showZones={false}
            compact
            interactive={false}
            rotationController={controller}
          />
        </AssetLabAccessoryCard>

        <AssetLabAccessoryCard
          assetId="color-bear-singer"
          kind="HAIR STUDY"
          name="歌手小熊"
          recolorTarget="顶部爆炸头"
          paletteId={bearSingerPaletteId}
          palettes={colorAnimalPalettes}
          onPaletteChange={setBearSingerPaletteId}
        >
          <ColorBearSingerLabViewer
            variant={bearSingerVariant}
            showZones={false}
            compact
            interactive={false}
            rotationController={controller}
          />
        </AssetLabAccessoryCard>

        <AssetLabAccessoryCard
          assetId="color-dog-drum"
          kind="PROP STUDY"
          name="鼓手小狗"
          recolorTarget="鼓面与鼓身"
          paletteId={dogDrumPaletteId}
          palettes={colorAnimalPalettes}
          onPaletteChange={setDogDrumPaletteId}
        >
          <ColorDogDrumLabViewer
            variant={dogDrumVariant}
            showZones={false}
            compact
            interactive={false}
            rotationController={controller}
          />
        </AssetLabAccessoryCard>      </div>
    </main>
  );
}
