import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorKoalaLabViewer,
  type KoalaHatVariant
} from "../../three/ColorKoalaLab/ColorKoalaLabViewer";

const variantPool: KoalaHatVariant[] = [
  { id: "lavender", name: "薰衣草紫", swatch: "#9b82c4" },
  { id: "rose", name: "海盐粉", swatch: "#d9829a" },
  { id: "mint", name: "薄荷绿", swatch: "#69a993" },
  { id: "sky", name: "晴空蓝", swatch: "#668fb9" },
  { id: "coral", name: "珊瑚红", swatch: "#cf7064" },
  { id: "sunshine", name: "日光黄", swatch: "#d9a441" },
  { id: "teal", name: "湖水青", swatch: "#4e9b9a" },
  { id: "cocoa", name: "可可棕", swatch: "#946a53" },
  { id: "plum", name: "梅子紫", swatch: "#845a91" }
];

export function ColorKoalaLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next =
      crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) =>
      next === current % variantPool.length ? current + 1 : next
    );
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-koala-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">
          Let's Collect · 3D LAB
        </span>
      </header>

      <section className="color-animal-intro color-koala-intro">
        <div>
          <p className="eyebrow">COLOR KOALA · HAT COLOR STUDY</p>
          <h1>只改变睡帽帽身，顶部绒球保持原色。</h1>
          <p>
            独立 UV 遮罩覆盖帽身原本的紫色区域，顶部绒球、考拉主体、
            树枝和叶片全部保护。拖动模型可检查帽身边缘与背面。
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
            {showZones ? "查看成品" : "检查帽身区域"}
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

      <ColorKoalaLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 GLB 81.81MB、约 199.86
          万三角面，已压缩为 335.14KB、59,956 三角面的移动端模型。
          9.01KB UV 遮罩只控制睡帽帽身，顶部绒球和其余模型保持原始材质；
          源文件与运行时文件分别位于 assets/models/source/color-koala/ 和
          public/models/toys/color-koala/。
        </p>
      </section>
    </main>
  );
}
