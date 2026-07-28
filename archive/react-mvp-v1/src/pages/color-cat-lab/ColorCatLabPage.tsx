import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorCatLabViewer, type CatYarnVariant } from "../../three/ColorCatLab/ColorCatLabViewer";

const variantPool: CatYarnVariant[] = [
  { id: "rose", name: "草莓毛线", swatch: "#d9829a" },
  { id: "butter", name: "黄油毛线", swatch: "#d4b45f" },
  { id: "mint", name: "薄荷毛线", swatch: "#6fb3a1" },
  { id: "sky", name: "晴空毛线", swatch: "#6f9fc8" },
  { id: "grape", name: "葡萄毛线", swatch: "#9478b7" },
  { id: "coral", name: "珊瑚毛线", swatch: "#d77869" },
  { id: "sage", name: "鼠尾草毛线", swatch: "#82a185" },
  { id: "plum", name: "梅子毛线", swatch: "#915f79" },
  { id: "cocoa", name: "可可毛线", swatch: "#9d6d55" }
];

export function ColorCatLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-cat-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-animal-intro color-cat-intro">
        <div>
          <p className="eyebrow">COLOR CAT NEW · YARN STUDY</p>
          <h1>给猫咪的毛线球换一种颜色，再转一圈检查。</h1>
          <p>猫咪的毛色、五官、耳朵、爪子和腮红全部保持原样；随机按钮只更新毛线球及相连线团的颜色。拖动模型即可从正面、背面和接触位置检查材质边界。</p>
        </div>
        <div className="color-lab-actions">
          <button className="color-lab-zone-toggle" type="button" aria-pressed={showZones} onClick={() => setShowZones((value) => !value)}>
            <Palette size={18} />{showZones ? "查看成品" : "检查毛线球区域"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />随机毛线球颜色
          </button>
        </div>
      </section>
      <ColorCatLabViewer variant={variant} showZones={showZones} />
      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>拓扑级材质分离：</strong> 原始约 72.8MB、200 万三角面的模型已压缩为约 657KB、8 万三角面的移动端 GLB。毛线球与线头的 24 个独立几何组件被合并为专用材质，随机色不会触碰猫咪本体，也不需要额外蒙版。</p>
      </section>
    </main>
  );
}
