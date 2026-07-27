import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorRacoonLabViewer, type RacoonTanghuluVariant } from "../../three/ColorRacoonLab/ColorRacoonLabViewer";

const variantPool: RacoonTanghuluVariant[] = [
  { id: "sky", name: "雾霭蓝", swatch: "#7397b3" },
  { id: "peach", name: "蜜桃粉", swatch: "#d88f86" },
  { id: "mint", name: "薄荷绿", swatch: "#69ab92" },
  { id: "grape", name: "葡萄紫", swatch: "#9479b3" },
  { id: "honey", name: "蜂蜜杏", swatch: "#cf985c" },
  { id: "coral", name: "珊瑚橘", swatch: "#cf715e" },
  { id: "lemon", name: "柠檬黄", swatch: "#c4ac55" },
  { id: "cocoa", name: "可可棕", swatch: "#876153" },
  { id: "berry", name: "莓果红", swatch: "#a35f75" }
];

export function ColorRacoonLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-racoon-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-animal-intro">
        <div>
          <p className="eyebrow">COLOR RACOON STUDY 01</p>
          <h1>Racoon 保持原色，只给糖葫芦换颜色。</h1>
          <p>Racoon 的身体、眼睛、鼻嘴、腮红和竹签始终保留原色。随机按钮只改变糖葫芦的红色糖衣。</p>
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
      <ColorRacoonLabViewer variant={variant} showZones={showZones} />
      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>糖葫芦专用着色：</strong> 327,400 字节的 Draco 模型搭配 8,464 字节无损 WebP 蒙版。只有红橙色贴图候选区与糖葫芦三维范围同时命中时才会变色，黄色糖粒、高光和 Racoon 其余部分始终使用原始贴图。</p>
      </section>
    </main>
  );
}