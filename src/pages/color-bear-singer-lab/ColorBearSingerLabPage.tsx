import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorBearSingerLabViewer,
  type BearSingerAfroVariant
} from "../../three/ColorBearSingerLab/ColorBearSingerLabViewer";

const variantPool: BearSingerAfroVariant[] = [
  { id: "black", name: "经典黑", swatch: "#2f2a2e" },
  { id: "rose", name: "莓果粉", swatch: "#cb718f" },
  { id: "grape", name: "舞台紫", swatch: "#8468a7" },
  { id: "blue", name: "电光蓝", swatch: "#557fb5" },
  { id: "mint", name: "薄荷绿", swatch: "#5e9c89" },
  { id: "coral", name: "珊瑚红", swatch: "#c9685f" },
  { id: "orange", name: "摇滚橙", swatch: "#ce8146" },
  { id: "gold", name: "聚光金", swatch: "#c7a049" },
  { id: "cocoa", name: "可可棕", swatch: "#8b6450" }
];

export function ColorBearSingerLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-bear-singer-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-bear-singer-intro">
        <div>
          <p className="eyebrow">COLOR BEAR SINGER · AFRO STUDY</p>
          <h1>舞台造型保持原样，只给顶部爆炸头换颜色。</h1>
          <p>
            随机按钮只更新卷发颜色。拖动模型，从头顶、发际线、两侧和背面检查换色边界。
          </p>
        </div>
        <div className="color-lab-actions">
          <button
            className="color-lab-zone-toggle"
            type="button"
            aria-pressed={showZones}
            onClick={() => setShowZones((value) => !value)}
          >
            <Palette size={18} />
            {showZones ? "查看成品" : "检查爆炸头区域"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机爆炸头颜色
          </button>
        </div>
      </section>

      <ColorBearSingerLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 82.4MB、约 199 万三角面的 GLB 已压缩为
          1.38MB、约 19.9 万三角面的高保真移动端模型。颜色选择同时使用卷发纹理和三维边界，
          熊的五官、服装与舞台配件保持原样。
        </p>
      </section>
    </main>
  );
}
