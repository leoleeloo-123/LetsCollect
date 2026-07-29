import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorBirdLabViewer,
  type BirdCrownVariant
} from "../../three/ColorBirdLab/ColorBirdLabViewer";

const variantPool: BirdCrownVariant[] = [
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

export function ColorBirdLabPage() {
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
    <main className="color-animal-page color-animal-page--single color-bird-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">
          Let's Collect · 3D LAB
        </span>
      </header>

      <section className="color-animal-intro color-bird-intro">
        <div>
          <p className="eyebrow">COLOR BIRD · CROWN STUDY</p>
          <h1>小鸟保持原色，只让头顶皇冠换色。</h1>
          <p>
            精确皇冠面、原始金色识别与 3D 位置保护共同锁定皇冠。
            小鸟的头部、身体、翅膀、眼睛、喙、腮红和脚继续使用原始贴图。
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
            {showZones ? "查看成品" : "检查皇冠区域"}
          </button>
          <button
            className="color-animal-randomize"
            type="button"
            onClick={randomize}
          >
            <Dices size={18} />
            随机皇冠颜色
          </button>
        </div>
      </section>

      <ColorBirdLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 74,691,460 字节、1,998,622
          三角面的 GLB 已压缩为 295,428 字节、59,958
          三角面的移动端模型。4,292 字节的皇冠 UV
          遮罩、59,958 字节的拓扑遮罩与底边原始金色识别共同锁定皇冠。
        </p>
      </section>
    </main>
  );
}
