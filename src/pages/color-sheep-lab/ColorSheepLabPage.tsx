import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorSheepLabViewer,
  type SheepAccessoryVariant
} from "../../three/ColorSheepLab/ColorSheepLabViewer";

const variantPool: SheepAccessoryVariant[] = [
  { id: "berry", name: "莓果红", swatch: "#b85d70" },
  { id: "forest", name: "森林绿", swatch: "#5f876d" },
  { id: "sky", name: "雾霭蓝", swatch: "#6f91ad" },
  { id: "grape", name: "葡萄紫", swatch: "#9178ad" },
  { id: "honey", name: "蜂蜜黄", swatch: "#c99a53" },
  { id: "peach", name: "蜜桃橙", swatch: "#d18470" },
  { id: "cocoa", name: "可可棕", swatch: "#866052" },
  { id: "teal", name: "青瓷绿", swatch: "#568b88" },
  { id: "plum", name: "李子紫", swatch: "#805e77" }
];

export function ColorSheepLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-sheep-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-sheep-intro">
        <div>
          <p className="eyebrow">COLOR SHEEP · CAPE &amp; BOW STUDY</p>
          <h1>小羊保持原色，只给披风与包包蝴蝶结换色。</h1>
          <p>
            随机按钮会同步改变玫红色披风和包包上的粉色蝴蝶结。
            羊毛、五官、角、耳朵、包身与金色配件继续使用原始贴图。
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
            {showZones ? "查看成品" : "检查披风与蝴蝶结"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机披风与蝴蝶结颜色
          </button>
        </div>
      </section>

      <ColorSheepLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 61,702,384 字节、1,998,026 三角面的 GLB 已压缩为
          267,280 字节、59,940 三角面的移动端模型。23,560 字节的双通道 UV
          遮罩只控制原始玫红色披风与包包上的粉色蝴蝶结。
        </p>
      </section>
    </main>
  );
}
