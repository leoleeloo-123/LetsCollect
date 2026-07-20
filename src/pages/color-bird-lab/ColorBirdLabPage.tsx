import { ArrowLeft, Dices, Info, Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorBirdLabViewer, type BirdColorVariant } from "../../three/ColorBirdLab/ColorBirdLabViewer";

const variantPool: BirdColorVariant[] = [
  { id: "lime-coral", name: "青柠珊瑚", bodySwatch: "#d7dc9a", capSwatch: "#f09378", blushSwatch: "#ef8f91" },
  { id: "mint-peach", name: "薄荷蜜桃", bodySwatch: "#a8d9bd", capSwatch: "#ef9f83", blushSwatch: "#ef8797" },
  { id: "sky-berry", name: "晴空莓果", bodySwatch: "#a9cee8", capSwatch: "#a66bb3", blushSwatch: "#ec829d" },
  { id: "cream-cocoa", name: "奶霜可可", bodySwatch: "#e7d9bd", capSwatch: "#93614d", blushSwatch: "#d8797d" },
  { id: "grape-lemon", name: "葡萄柠檬", bodySwatch: "#c9b7df", capSwatch: "#e2b64f", blushSwatch: "#ea8798" },
  { id: "rose-sage", name: "玫瑰鼠尾草", bodySwatch: "#c7d5b4", capSwatch: "#c87587", blushSwatch: "#ee8296" },
  { id: "ocean-sunset", name: "海盐落日", bodySwatch: "#9ecbd0", capSwatch: "#e4765e", blushSwatch: "#f09298" },
  { id: "cloud-blue", name: "云朵蓝莓", bodySwatch: "#d7dce4", capSwatch: "#7184c4", blushSwatch: "#e98aa4" },
  { id: "honey-olive", name: "蜂蜜橄榄", bodySwatch: "#c7c67f", capSwatch: "#d58a48", blushSwatch: "#df7f82" }
];

export function ColorBirdLabPage() {
  const [seed, setSeed] = useState(0);
  const [showZones, setShowZones] = useState(false);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
    setShowZones(false);
  }

  return (
    <main className="color-dog-page color-bird-page">
      <header className="color-dog-header">
        <Link className="color-dog-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-dog-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-dog-intro color-bird-intro">
        <div>
          <p className="eyebrow">COLOR BIRD STUDY 01</p>
          <h1>三种颜色，一只会转圈的小鸟。</h1>
          <p>身体、翅膀和尾巴共用主体色；头顶与腮红各自保留独立色区。黑色眼珠与高光、凸出的嘴巴和两只脚保持原始颜色，拖动一圈即可检查分区边缘。</p>
        </div>
        <div className="color-bird-actions">
          <button className="color-bird-zone-toggle" type="button" aria-pressed={showZones} onClick={() => setShowZones((value) => !value)}>
            <Palette size={18} />{showZones ? "查看成品" : "检查分区"}
          </button>
          <button className="color-dog-randomize" type="button" onClick={randomize}>
            <Dices size={18} />随机生成一只
          </button>
        </div>
      </section>
      <ColorBirdLabViewer variant={variant} showZones={showZones} />
      <section className="color-dog-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>四区移动端方案：</strong> 加载约 310KB 的 Draco 模型和一张 512px 多通道 Mask。未遮罩区域是主体，绿色通道是头顶，蓝色通道是腮红，红色通道保护眼睛和嘴，脚部由解码后的几何分区保护；随机按钮只更新三组颜色，不会重新下载模型。</p>
      </section>
    </main>
  );
}
