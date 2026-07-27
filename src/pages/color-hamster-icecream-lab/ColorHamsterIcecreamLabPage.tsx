import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorHamsterIcecreamLabViewer,
  type HamsterIcecreamVariant,
} from "../../three/ColorHamsterIcecreamLab/ColorHamsterIcecreamLabViewer";

const variantPool: HamsterIcecreamVariant[] = [
  { id: "strawberry", name: "草莓粉", swatch: "#d9839d" },
  { id: "blueberry", name: "蓝莓蓝", swatch: "#718eaf" },
  { id: "mint", name: "薄荷绿", swatch: "#68aa91" },
  { id: "grape", name: "葡萄紫", swatch: "#957ab4" },
  { id: "mango", name: "芒果黄", swatch: "#d0a44e" },
  { id: "peach", name: "蜜桃橙", swatch: "#d78672" },
  { id: "cocoa", name: "可可棕", swatch: "#896353" },
  { id: "matcha", name: "抹茶绿", swatch: "#819a67" },
  { id: "vanilla", name: "香草白", swatch: "#d8c7a4" },
];

export function ColorHamsterIcecreamLabPage() {
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
    <main className="color-animal-page color-animal-page--single color-hamster-icecream-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR HAMSTER ICECREAM STUDY 01</p>
          <h1>Hamster 只给雪糕换色。</h1>
          <p>
            仓鼠的身体、五官、腮红、手部和雪糕之外的配件始终保留原色。随机按钮只会改变源模型中专门标红的雪糕部分。
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
            随机雪糕颜色
          </button>
        </div>
      </section>

      <ColorHamsterIcecreamLabViewer
        variant={variant}
        showZones={showZones}
      />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>雪糕专用着色：</strong> 231,128 字节的 Draco 模型搭配
          14,680 字节无损 WebP 蒙版。高饱和红色贴图候选区与雪糕三维范围同时命中时才会换色，其余区域继续使用原始贴图。
        </p>
      </section>
    </main>
  );
}
