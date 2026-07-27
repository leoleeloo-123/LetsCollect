import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorSealLabViewer,
  type SealStarfishVariant
} from "../../three/ColorSealLab/ColorSealLabViewer";

const variantPool: SealStarfishVariant[] = [
  { id: "sunshine", name: "日光黄", swatch: "#e7aa3d" },
  { id: "rose", name: "海盐粉", swatch: "#d9829a" },
  { id: "mint", name: "薄荷绿", swatch: "#69a993" },
  { id: "sky", name: "晴空蓝", swatch: "#668fb9" },
  { id: "grape", name: "葡萄紫", swatch: "#8f73ad" },
  { id: "coral", name: "珊瑚红", swatch: "#cf7064" },
  { id: "teal", name: "湖水青", swatch: "#4e9b9a" },
  { id: "cocoa", name: "可可棕", swatch: "#946a53" },
  { id: "lavender", name: "浅薰衣草", swatch: "#9a8fca" }
];

export function ColorSealLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-seal-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-seal-intro">
        <div>
          <p className="eyebrow">COLOR SEAL · STARFISH COLOR STUDY</p>
          <h1>只改变肚子上的海星，海豹主体完整保留。</h1>
          <p>
            独立 UV 遮罩只覆盖海星原本的黄色区域。拖动模型检查海星的五个角、
            边缘和腹部接触位置，其余五官、身体与尾部保持原色。
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
            {showZones ? "查看成品" : "检查海星区域"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机海星颜色
          </button>
        </div>
      </section>

      <ColorSealLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 GLB 78.37MB、约 199.9 万三角面，
          已压缩为 319.58KB、69,970 三角面的移动端模型。11.27KB UV 遮罩与 10.39KB
          物体空间遮罩共同控制海星换色、脸部补色与边缘清理，
          源文件与运行时文件分别位于 assets/models/source/color-seal/ 和
          public/models/toys/color-seal/。
        </p>
      </section>
    </main>
  );
}
