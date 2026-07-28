import { ArrowLeft, Dices, Eye, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { diamondUnicornPalettes } from "../../features/toys/catalog";
import {
  DiamondUnicornLabViewer,
  type DiamondVariant
} from "../../three/DiamondUnicornLab/DiamondUnicornLabViewer";

const diamondVariants: DiamondVariant[] = diamondUnicornPalettes.map((palette) => ({
  id: palette.id,
  name: palette.name,
  swatch: palette.color
}));

export function DiamondUnicornLabPage() {
  const [variantIndex, setVariantIndex] = useState(0);
  const [inspectFacets, setInspectFacets] = useState(false);
  const variant = diamondVariants[variantIndex];

  function randomizeDiamond() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % diamondVariants.length;
    setVariantIndex((current) => next === current ? (current + 1) % diamondVariants.length : next);
    setInspectFacets(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single diamond-unicorn-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro diamond-unicorn-intro">
        <div>
          <p className="eyebrow">FIRST UNICORN · DIAMOND STUDY</p>
          <h1>最早的独角兽，换回钻石切面。</h1>
          <p>
            这份 Lab 使用最早的 Unicorn 原始模型重新压缩，材质采用钻石折射率、色散和低粗糙度参数。
            拖动模型检查轮廓、耳朵、四肢与透明材质下的切面变化。
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
            {inspectFacets ? "查看钻石成品" : "切面检查"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomizeDiamond}>
            <Dices size={18} />
            切换钻石色
          </button>
        </div>
      </section>

      <DiamondUnicornLabViewer variant={variant} inspectFacets={inspectFacets} />

      <section className="color-animal-notes" aria-label="资产压缩说明">
        <Info size={19} />
        <p>
          <strong>已归档材质研究：</strong> 最早的 2.35MB、约 100 万三角面 Unicorn 已压缩为
          174,984 字节、53,522 三角面的 Draco GLB。钻石效果完全由运行时材质生成，没有新增贴图；
          它只用于历史本地藏品与内部检查，不再进入任何新抽取。
        </p>
      </section>
    </main>
  );
}
