import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorBunnyLabViewer, type BunnyBagVariant } from "../../three/ColorBunnyLab/ColorBunnyLabViewer";

const variantPool: BunnyBagVariant[] = [
  { id: "peach", name: "蜜桃手提包", swatch: "#dc8d78" },
  { id: "honey", name: "蜂蜜杏", swatch: "#d39a5d" },
  { id: "sky", name: "海盐蓝", swatch: "#6fa7c7" },
  { id: "mint", name: "薄荷绿", swatch: "#68b59d" },
  { id: "grape", name: "葡萄软糖", swatch: "#967bb8" },
  { id: "coral", name: "珊瑚橘", swatch: "#d97560" },
  { id: "lemon", name: "柠檬黄", swatch: "#c5ad55" },
  { id: "cocoa", name: "可可棕", swatch: "#8e6250" },
  { id: "berry", name: "莓果紫", swatch: "#99627f" }
];

export function ColorBunnyLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-bunny-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR BUNNY STUDY 01</p>
          <h1>白兔保持原色，只给手提包换一种颜色。</h1>
          <p>兔子身体始终保持奶油白；黑色眼睛、鼻子和微笑嘴线，以及耳内粉色与双侧腮红全部保留原色。随机按钮只改变手提包和提手。</p>
        </div>
        <div className="color-lab-actions">
          <button className="color-lab-zone-toggle" type="button" aria-pressed={showZones} onClick={() => setShowZones((value) => !value)}>
            <Palette size={18} />{showZones ? "查看成品" : "检查保护区"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />随机生成一只
          </button>
        </div>
      </section>
      <ColorBunnyLabViewer variant={variant} showZones={showZones} />
      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>包包专用着色：</strong> 约 377KB 的 Draco 模型搭配约 53KB、512px 的 WebP 蒙版。暖粉候选区与包包三维体积同时命中时才会变色；兔子身体、眼睛、鼻嘴、耳内粉和腮红始终使用原始贴图。</p>
      </section>
    </main>
  );
}