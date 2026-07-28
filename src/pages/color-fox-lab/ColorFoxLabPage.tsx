import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorFoxLabViewer,
  type FoxHatVariant,
} from "../../three/ColorFoxLab/ColorFoxLabViewer";

const variantPool: FoxHatVariant[] = [
  { id: "berry", name: "莓果红", swatch: "#b85d70" },
  { id: "forest", name: "森林绿", swatch: "#5f876d" },
  { id: "sky", name: "雾霭蓝", swatch: "#6f91ad" },
  { id: "grape", name: "葡萄紫", swatch: "#9178ad" },
  { id: "honey", name: "蜂蜜黄", swatch: "#c99a53" },
  { id: "peach", name: "蜜桃橙", swatch: "#d18470" },
  { id: "cocoa", name: "可可棕", swatch: "#866052" },
  { id: "teal", name: "青瓷绿", swatch: "#568b88" },
  { id: "plum", name: "李子紫", swatch: "#805e77" },
];

export function ColorFoxLabPage() {
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
    <main className="color-animal-page color-animal-page--single color-fox-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR FOX STUDY 01</p>
          <h1>Fox 帽子与羽毛换色。</h1>
          <p>
            狐狸的身体、五官、耳朵、腮红和其他配件始终保留原色。随机按钮会同步改变头顶帽子与红色羽毛。
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
            随机帽子颜色
          </button>
        </div>
      </section>

      <ColorFoxLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>帽子与羽毛专用着色：</strong> 247,540 字节的 Draco
          模型搭配 50,634 字节无损 WebP 蒙版。目标贴图候选区与头顶三维范围同时命中时才会换色，其余区域继续使用原始贴图。
        </p>
      </section>
    </main>
  );
}
