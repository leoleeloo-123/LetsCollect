import { ArrowLeft, Dices, Eye, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  DiamondDogLabViewer,
  type DiamondDogVariant
} from "../../three/DiamondDogLab/DiamondDogLabViewer";

const diamondDogVariants: DiamondDogVariant[] = [
  { id: "clear", name: "透亮水晶", swatch: "#eaf7f4" },
  { id: "ice", name: "冰川蓝", swatch: "#9edff0" },
  { id: "rose", name: "蔷薇晶", swatch: "#ef9fbd" },
  { id: "champagne", name: "香槟晶", swatch: "#efcf8d" },
  { id: "mint", name: "薄荷晶", swatch: "#9fd9c1" }
];

export function DiamondDogLabPage() {
  const [variantIndex, setVariantIndex] = useState(0);
  const [inspectFacets, setInspectFacets] = useState(false);
  const variant = diamondDogVariants[variantIndex];

  function randomizeDiamond() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % diamondDogVariants.length;
    setVariantIndex((current) => next === current ? (current + 1) % diamondDogVariants.length : next);
    setInspectFacets(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single diamond-dog-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro diamond-dog-intro">
        <div>
          <p className="eyebrow">ARCHIVED COLOR DOG · CRYSTAL STUDY</p>
          <h1>退役小狗，换成水晶切面。</h1>
          <p>
            这份 Lab 保留 Color Dog 的原始轮廓，并套用 Diamond Unicorn 的透明、折射与色散材质。
            拖动模型检查耳朵、眼睛、尾巴和四肢在不同角度下的水晶层次。
          </p>
        </div>
        <div className="color-lab-actions">
          <button
            className="color-lab-zone-toggle"
            type="button"
            aria-pressed={inspectFacets}
            onClick={() => setInspectFacets((value) => !value)}
          >
            <Eye size={18} />
            {inspectFacets ? "查看水晶成品" : "切面检查"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomizeDiamond}>
            <Dices size={18} />
            切换水晶色
          </button>
        </div>
      </section>

      <DiamondDogLabViewer variant={variant} inspectFacets={inspectFacets} />

      <section className="color-animal-notes" aria-label="资产说明">
        <Info size={19} />
        <p>
          <strong>独立 Lab 展品：</strong> 使用退役 Color Dog 的 344,052 字节 Draco GLB，
          水晶效果完全由运行时材质生成，没有新增贴图。该实验不会把 Color Dog 重新加入首页或抽取池。
        </p>
      </section>
    </main>
  );
}
