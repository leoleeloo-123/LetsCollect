import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import {
  ColorDogCameraLabViewer,
  type DogCameraAccessoryVariant
} from "../../three/ColorDogCameraLab/ColorDogCameraLabViewer";

const variantPool: DogCameraAccessoryVariant[] = [
  { id: "honey", name: "蜂蜜黄", swatch: "#d6a13e" },
  { id: "rose", name: "草莓粉", swatch: "#d9829a" },
  { id: "mint", name: "薄荷绿", swatch: "#69a993" },
  { id: "sky", name: "晴空蓝", swatch: "#668fb9" },
  { id: "grape", name: "葡萄紫", swatch: "#8f73ad" },
  { id: "coral", name: "珊瑚红", swatch: "#cf7064" },
  { id: "orange", name: "柑橘橙", swatch: "#d88949" },
  { id: "teal", name: "湖水青", swatch: "#4e9b9a" },
  { id: "cocoa", name: "可可棕", swatch: "#946a53" }
];

export function ColorDogCameraLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = variantPool[seed % variantPool.length];

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-animal-page color-animal-page--single color-dog-camera-page">
      <header className="color-animal-header">
        <Link className="color-animal-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="color-animal-header__mark">Let's Collect · 3D LAB</span>
      </header>

      <section className="color-animal-intro color-dog-camera-intro">
        <div>
          <p className="eyebrow">COLOR DOG CAMERA · ACCESSORY STUDY</p>
          <h1>狗狗和相机保持原色，只给帽子、包包换颜色。</h1>
          <p>
            随机按钮会同步更新两件黄色配饰。拖动模型，从帽檐、背带、包边和背面检查颜色是否完整。
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
            {showZones ? "查看成品" : "检查配件区域"}
          </button>
          <button className="color-animal-randomize" type="button" onClick={randomize}>
            <Dices size={18} />
            随机帽子与包包颜色
          </button>
        </div>
      </section>

      <ColorDogCameraLabViewer variant={variant} showZones={showZones} />

      <section className="color-animal-notes" aria-label="技术说明">
        <Info size={19} />
        <p>
          <strong>标准化资产：</strong> 原始 85.7MB、约 200 万三角面的 GLB 已压缩为
          372.8KB、约 6 万三角面的移动端模型。狗狗、五官、相机和白色零件保持原样，
          13.8KB 独立遮罩只控制帽子与包包的黄色 UV 区域。
        </p>
      </section>
    </main>
  );
}
