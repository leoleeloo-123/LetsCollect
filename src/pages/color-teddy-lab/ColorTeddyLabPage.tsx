import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorTeddyLabViewer, type TeddyColorVariant } from "../../three/ColorTeddyLab/ColorTeddyLabViewer";

const variantPool: TeddyColorVariant[] = [
  { id: "cocoa", name: "可可曲奇", swatch: "#a7795e" },
  { id: "honey", name: "蜂蜜松饼", swatch: "#d29a62" },
  { id: "rose", name: "玫瑰奶霜", swatch: "#d9899b" },
  { id: "mint", name: "薄荷奶糖", swatch: "#78b8a7" },
  { id: "sky", name: "晴空棉花", swatch: "#75a7c8" },
  { id: "grape", name: "葡萄软糖", swatch: "#9d82bd" },
  { id: "coral", name: "珊瑚落日", swatch: "#dc7f6a" },
  { id: "lemon", name: "柠檬蛋糕", swatch: "#c8b05c" },
  { id: "plum", name: "梅子果酱", swatch: "#9b627f" }
];

export function ColorTeddyLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-dog-page color-dog-page--single color-teddy-page">
      <header className="color-dog-header">
        <Link className="color-dog-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-dog-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-dog-intro">
        <div>
          <p className="eyebrow">COLOR TEDDY STUDY 01</p>
          <h1>给小熊换一种毛色，再转一圈检查。</h1>
          <p>头、耳朵、身体和四肢使用同一组随机毛色；黑色眼睛、深棕鼻子与微笑嘴线保持原色，奶油色口鼻和两侧腮红独立保护。拖动模型即可检查每一处边缘。</p>
        </div>
        <div className="color-lab-actions">
          <button className="color-lab-zone-toggle" type="button" aria-pressed={showZones} onClick={() => setShowZones((value) => !value)}>
            <Palette size={18} />{showZones ? "查看成品" : "检查保护区"}
          </button>
          <button className="color-dog-randomize" type="button" onClick={randomize}>
            <Dices size={18} />随机生成一只
          </button>
        </div>
      </section>
      <ColorTeddyLabViewer variant={variant} showZones={showZones} />
      <section className="color-dog-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>三通道保护方案：</strong> 约 356KB 的 Draco 模型搭配一张约 8KB、1024px 的无损 WebP 蒙版。红色通道保护眼睛、鼻子和嘴线，绿色通道保护双侧腮红，蓝色通道定义固定奶油色口鼻；随机按钮只更新毛色，不会重新下载模型。</p>
      </section>
    </main>
  );
}