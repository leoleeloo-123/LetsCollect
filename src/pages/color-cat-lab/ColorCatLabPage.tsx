import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorCatLabViewer, type CatColorVariant } from "../../three/ColorCatLab/ColorCatLabViewer";

const variantPool: CatColorVariant[] = [
  { id: "biscuit", name: "焦糖饼干", swatch: "#c58d62" },
  { id: "butter", name: "黄油曲奇", swatch: "#d2b465" },
  { id: "rose", name: "玫瑰奶霜", swatch: "#d7889b" },
  { id: "mint", name: "薄荷奶糖", swatch: "#76b5a5" },
  { id: "sky", name: "晴空棉花", swatch: "#78a7c8" },
  { id: "grape", name: "葡萄软糖", swatch: "#9a82b9" },
  { id: "coral", name: "珊瑚果冻", swatch: "#d77e6c" },
  { id: "sage", name: "鼠尾草团子", swatch: "#8ca98b" },
  { id: "plum", name: "梅子慕斯", swatch: "#95647e" }
];

export function ColorCatLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-cat-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-animal-intro color-cat-intro">
        <div>
          <p className="eyebrow">COLOR CAT STUDY 01</p>
          <h1>给趴趴猫换一种毛色，再转一圈检查。</h1>
          <p>头部、身体、前爪和尾巴共享随机主色；耳内粉色、粉鼻子、闭眼、胡须、嘴巴线条与两侧腮红保持原始颜色。拖动模型即可检查五官边缘和耳内接缝。</p>
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
      <ColorCatLabViewer variant={variant} showZones={showZones} />
      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>蒙版与几何双重保护：</strong> 约 319KB 的 Draco 模型搭配一张约 100KB、1024px 的无损 WebP 蒙版。红色通道保存面部与基础耳内细节，绿色通道补充跨 UV 分片的粉色，蓝色通道修正耳内浅色三角面，再由模型坐标门控排除身体 UV 碎片；随机按钮只更新毛色，不会重新下载模型。</p>
      </section>
    </main>
  );
}
