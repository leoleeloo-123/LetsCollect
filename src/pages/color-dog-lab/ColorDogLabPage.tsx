import { ArrowLeft, Dices, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorDogLabViewer, type DogColorVariant } from "../../three/ColorDogLab/ColorDogLabViewer";

const variantPool: DogColorVariant[] = [
  { id: "cocoa", name: "可可曲奇", hue: -0.28, swatch: "#9d6d54" },
  { id: "honey", name: "蜂蜜杏", hue: 0, swatch: "#d99052" },
  { id: "rose", name: "玫瑰奶霜", hue: 0.88, swatch: "#db7f91" },
  { id: "berry", name: "蓝莓汽水", hue: 2.72, swatch: "#788bd1" },
  { id: "mint", name: "薄荷奶糖", hue: 2.05, swatch: "#6fba9f" },
  { id: "grape", name: "葡萄软糖", hue: -1.75, swatch: "#a47ac2" },
  { id: "coral", name: "珊瑚落日", hue: 0.5, swatch: "#df785f" },
  { id: "lime", name: "青柠果冻", hue: 1.42, swatch: "#9db660" },
  { id: "sky", name: "晴空棉花", hue: -2.65, swatch: "#69a9c8" }
];

export function ColorDogLabPage() {
  const [seed, setSeed] = useState(0);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
  }

  return (
    <main className="color-dog-page color-dog-page--single">
      <header className="color-dog-header">
        <Link className="color-dog-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-dog-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-dog-intro">
        <div>
          <p className="eyebrow">COLOR DOG STUDY 03</p>
          <h1>一只小狗，完整转一圈。</h1>
          <p>直接以带五官与原始深浅关系的 Color Dog 为底：眼球、眼白、鼻子、粉色嘴巴与脚掌肉球保持原色；身体只做统一换色，不再叠加腮红，因此眼睛边缘更干净。</p>
        </div>
        <button className="color-dog-randomize" type="button" onClick={randomize}>
          <Dices size={18} />随机生成一只
        </button>
      </section>
      <ColorDogLabViewer variant={variant} />
      <section className="color-dog-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>移动端稳定方案：</strong> 单次只加载约 336KB 模型和一张约 6KB、512px 的多通道遮罩；固定眼睛、鼻嘴与粉色肉球共用一次纹理采样，没有额外模型或绘制批次。模型采用 soft matte / matte resin 材质，拖动可 360° 检查，手机上支持双指缩放。</p>
      </section>
    </main>
  );
}