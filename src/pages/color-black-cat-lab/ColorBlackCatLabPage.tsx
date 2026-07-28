import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorBlackCatLabViewer,
  type BlackCatLogoVariant
} from "../../three/ColorBlackCatLab/ColorBlackCatLabViewer";

const variantPool: BlackCatLogoVariant[] = [
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

export function ColorBlackCatLabPage() {
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
    <main className="color-animal-page color-animal-page--single color-black-cat-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">
          Let's Collect · 3D LAB
        </span>
      </header>

      <section className="color-animal-intro color-black-cat-intro">
        <div>
          <p className="eyebrow">COLOR BLACK CAT · FISH LOGO STUDY</p>
          <h1>黑猫与纸箱保持原色，只让箱子上的粉色鱼 Logo 换色。</h1>
          <p>
            独立 UV 遮罩与 3D 位置保护共同锁定纸箱正面的鱼形标记。
            黑猫、眼睛、耳朵、纸箱、边缘与其它粉色细节继续使用原始贴图。
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
            {showZones ? "查看成品" : "检查鱼 Logo 区域"}
          </button>
          <button
            className="color-animal-randomize"
            type="button"
            onClick={randomize}
          >
            <Dices size={18} />
            随机鱼 Logo 颜色
          </button>
        </div>
      </section>

      <ColorBlackCatLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 73,111,356 字节、1,926,498
          三角面的 GLB 已压缩为 359,448 字节、57,792
          三角面的移动端模型。10,582 字节的鱼 Logo UV
          遮罩与物体空间边界共同保护黑猫和纸箱。
        </p>
      </section>
    </main>
  );
}
