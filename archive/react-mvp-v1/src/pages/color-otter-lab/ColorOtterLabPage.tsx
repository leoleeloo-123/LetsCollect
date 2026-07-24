import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorOtterLabViewer, type OtterLollipopVariant } from "../../three/ColorOtterLab/ColorOtterLabViewer";

const variantPool: OtterLollipopVariant[] = [
  { id: "strawberry", name: "草莓粉", swatch: "#d98598" },
  { id: "grape", name: "葡萄紫", swatch: "#9174b6" },
  { id: "lemon", name: "柠檬黄", swatch: "#d3b94f" },
  { id: "mint", name: "薄荷绿", swatch: "#63aa8e" },
  { id: "sky", name: "晴空蓝", swatch: "#6d9fc4" },
  { id: "peach", name: "蜜桃橘", swatch: "#d98a70" },
  { id: "berry", name: "莓果红", swatch: "#b95f78" },
  { id: "cola", name: "可乐棕", swatch: "#81594c" },
  { id: "coral", name: "珊瑚红", swatch: "#ca6e67" }
];

export function ColorOtterLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-otter-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR OTTER STUDY 01</p>
          <h1>水獭保持原色，只给手里的棒棒糖换颜色。</h1>
          <p>水獭身体、眼睛、鼻嘴、腮红和棒棒糖手柄始终保留原色。随机按钮只改变圆形糖体，并保留模型自身的立体明暗。</p>
        </div>
        <div className="color-lab-actions">
          <button className="color-lab-zone-toggle" type="button" aria-pressed={showZones} onClick={() => setShowZones((value) => !value)}>
            <Palette size={18} />{showZones ? "查看成品" : "检查着色区"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />随机生成一只
          </button>
        </div>
      </section>
      <ColorOtterLabViewer variant={variant} showZones={showZones} />
      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>棒棒糖独立材质：</strong> 约 360KB 的 Draco 模型已将完整糖球拆分为命名材质。随机颜色直接写入 `Lollipop_Color`，不使用 UV 蒙版或屏幕投影；水獭和棒棒糖手柄始终使用原始贴图。</p>
      </section>
    </main>
  );
}
