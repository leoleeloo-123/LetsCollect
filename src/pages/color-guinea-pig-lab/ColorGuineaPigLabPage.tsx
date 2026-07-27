import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorGuineaPigLabViewer,
  type GuineaPigBalloonVariant
} from "../../three/ColorGuineaPigLab/ColorGuineaPigLabViewer";

const variantPool: GuineaPigBalloonVariant[] = [
  { id: "sky-blue", name: "晴空蓝", swatch: "#79a9d1" },
  { id: "mint-green", name: "薄荷绿", swatch: "#86c5a7" },
  { id: "sea-teal", name: "海盐青", swatch: "#78b9c4" },
  { id: "grape-purple", name: "葡萄紫", swatch: "#9b83c7" },
  { id: "forest-green", name: "森林绿", swatch: "#6e9a77" },
  { id: "cloud-blue", name: "云朵蓝", swatch: "#93aec8" },
  { id: "honey-gold", name: "蜂蜜金", swatch: "#d5a24f" },
  { id: "rose-pink", name: "玫瑰粉", swatch: "#c98091" },
  { id: "cream-cocoa", name: "奶霜可可", swatch: "#c99579" }
];

export function ColorGuineaPigLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-guinea-pig-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-guinea-pig-intro">
        <div>
          <p className="eyebrow">COLOR GUINEA PIG · BALLOON STUDY</p>
          <h1>一种颜色，三只气球同步变化。</h1>
          <p>
            每次随机选择一种颜色，星形、心形与圆形气球全部同步换色。豚鼠身体、耳朵、脚掌、五官和气球绳保持原始贴图。
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
            {showZones ? "查看成品" : "检查气球遮罩"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机气球颜色
          </button>
        </div>
      </section>

      <ColorGuineaPigLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 78,620,492 字节、1,996,170 三角面的 GLB 已压缩为
          309,868 字节、59,884 三角面的移动端模型。23,128 字节的联合 UV 覆盖遮罩与 3D 区域保护共同控制三只气球；三者使用同一种颜色，因此共用贴图和交叠面不再产生异色边界。
        </p>
      </section>
    </main>
  );
}

