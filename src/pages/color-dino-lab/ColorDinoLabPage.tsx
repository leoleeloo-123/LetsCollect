import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorDinoLabViewer,
  type DinoScarfVariant,
} from "../../three/ColorDinoLab/ColorDinoLabViewer";

const variantPool: DinoScarfVariant[] = [
  { id: "berry", name: "莓果红", swatch: "#b95f70" },
  { id: "sky", name: "雾霭蓝", swatch: "#6f91ad" },
  { id: "mint", name: "薄荷绿", swatch: "#68a98f" },
  { id: "grape", name: "葡萄紫", swatch: "#9178ad" },
  { id: "honey", name: "蜂蜜黄", swatch: "#c99a53" },
  { id: "peach", name: "蜜桃橙", swatch: "#d18470" },
  { id: "cocoa", name: "可可棕", swatch: "#866052" },
  { id: "pine", name: "松针绿", swatch: "#617f70" },
  { id: "plum", name: "李子紫", swatch: "#805e77" },
];

export function ColorDinoLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next =
      crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) =>
      next === current % variantPool.length ? current + 1 : next,
    );
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-dino-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR DINO STUDY 01</p>
          <h1>Dino 围脖换色。</h1>
          <p>
            小恐龙的身体、五官、腮红和其他配件始终保留原色。随机按钮只会改变源模型中的红色围脖。
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
            {showZones ? "查看成品" : "检查着色区"}
          </button>
          <button
            className="color-animal-randomize"
            type="button"
            onClick={randomize}
          >
            <Dices size={18} />
            随机围脖颜色
          </button>
        </div>
      </section>

      <ColorDinoLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>围脖专用着色：</strong> 255,936 字节的 Draco 模型搭配
          14,264 字节无损 WebP 蒙版。高饱和红色候选区与颈部三维范围同时命中时才会换色，其余区域继续使用原始贴图。
        </p>
      </section>
    </main>
  );
}
