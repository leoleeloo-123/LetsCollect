import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorPenguinLabViewer,
  type PenguinAccessoryVariant
} from "../../three/ColorPenguinLab/ColorPenguinLabViewer";

const variantPool: PenguinAccessoryVariant[] = [
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

export function ColorPenguinLabPage() {
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
    <main className="color-animal-page color-animal-page--single color-penguin-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">
          Let's Collect · 3D LAB
        </span>
      </header>

      <section className="color-animal-intro color-penguin-intro">
        <div>
          <p className="eyebrow">COLOR PENGUIN · ACCESSORY STUDY</p>
          <h1>企鹅保持原色，只给粉色耳罩顶部和杯子换色。</h1>
          <p>
            随机按钮会同步改变耳罩顶部与杯子。企鹅羽毛、脸部、腮红、嘴、脚和其余细节继续使用原始贴图。
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
            {showZones ? "查看成品" : "检查两个配件区域"}
          </button>
          <button
            className="color-animal-randomize"
            type="button"
            onClick={randomize}
          >
            <Dices size={18} />
            随机耳罩与杯子颜色
          </button>
        </div>
      </section>

      <ColorPenguinLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 77,606,960
          字节、1,999,282 三角面的 GLB 已压缩为 322,324
          字节、59,966 三角面的移动端模型。粉色像素与网格连通块交集只标记
          粉色耳罩顶部与粉色杯子，两个区域使用同一套颜色变体。
        </p>
      </section>
    </main>
  );
}
