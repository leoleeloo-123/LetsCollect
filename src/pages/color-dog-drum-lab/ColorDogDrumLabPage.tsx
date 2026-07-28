import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorDogDrumLabViewer,
  type DogDrumVariant
} from "../../three/ColorDogDrumLab/ColorDogDrumLabViewer";

const variantPool: DogDrumVariant[] = [
  { id: "festival-red", name: "节庆红", swatch: "#d9594c" },
  { id: "lotus-pink", name: "莲花粉", swatch: "#d989a2" },
  { id: "mint", name: "薄荷绿", swatch: "#6fae92" },
  { id: "sky", name: "晴空蓝", swatch: "#6092c7" },
  { id: "grape", name: "葡萄紫", swatch: "#9072b8" },
  { id: "coral", name: "珊瑚橙", swatch: "#d77a55" },
  { id: "butter", name: "黄油金", swatch: "#d9a441" },
  { id: "teal", name: "湖水青", swatch: "#4c9b98" },
  { id: "cocoa", name: "可可棕", swatch: "#956a52" }
];

export function ColorDogDrumLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-dog-drum-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-dog-drum-intro">
        <div>
          <p className="eyebrow">COLOR DOG DRUM · DRUM COLOR STUDY</p>
          <h1>保留狗狗主体，只检查鼓面和鼓身的随机换色。</h1>
          <p>
            这个版本先完成标准压缩和运行时路径整理。颜色逻辑只针对鼓身内部原本的红色区域，
            方便你先看鼓的可变色效果，再决定是否继续细修保护边界。
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
            {showZones ? "查看成品" : "检查鼓区域"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机鼓颜色
          </button>
        </div>
      </section>

      <ColorDogDrumLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 GLB 76.07MB、约 199.6 万三角面，
          已压缩为 373.54KB、69,870 三角面的移动端模型。源文件位于
          assets/models/source/color-dog-drum/，运行时文件位于
          public/models/toys/color-dog-drum/。
        </p>
      </section>
    </main>
  );
}
