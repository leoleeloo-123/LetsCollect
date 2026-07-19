import { ArrowLeft, Dices, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { ColorUnicornLabViewer, type UnicornColorVariant } from "../../three/ColorUnicornLab/ColorUnicornLabViewer";

const variantPool: UnicornColorVariant[] = [
  { id: "berry-night", name: "莓果夜曲", bodySwatch: "#efc9d4", hornSwatch: "#7350a5" },
  { id: "mint-amber", name: "薄荷琥珀", bodySwatch: "#bde4d2", hornSwatch: "#d2873d" },
  { id: "blue-sun", name: "海盐日光", bodySwatch: "#b9d6ec", hornSwatch: "#d5962e" },
  { id: "peach-ink", name: "蜜桃墨羽", bodySwatch: "#f1c2b4", hornSwatch: "#383044" },
  { id: "grape-rose", name: "葡萄玫瑰", bodySwatch: "#d5c3e8", hornSwatch: "#a83f68" },
  { id: "cream-cocoa", name: "奶霜可可", bodySwatch: "#eadac6", hornSwatch: "#72442f" },
  { id: "lime-orchid", name: "青柠兰花", bodySwatch: "#d5e4b8", hornSwatch: "#82519f" },
  { id: "cloud-coral", name: "云朵珊瑚", bodySwatch: "#d7e1e8", hornSwatch: "#c65d55" },
  { id: "rose-ocean", name: "玫瑰海风", bodySwatch: "#e8bec9", hornSwatch: "#456d9c" }
];

export function ColorUnicornLabPage() {
  const [seed, setSeed] = useState(3);
  const variant = useMemo(() => variantPool[seed % variantPool.length], [seed]);

  function randomize() {
    const next = crypto.getRandomValues(new Uint32Array(1))[0] % variantPool.length;
    setSeed((current) => next === current % variantPool.length ? current + 1 : next);
  }

  return (
    <main className="color-dog-page color-unicorn-page">
      <header className="color-dog-header">
        <Link className="color-dog-header__back" to={routes.home}><ArrowLeft size={18} />返回首页</Link>
        <span className="color-dog-header__mark">Let's Collect · 3D LAB</span>
      </header>
      <section className="color-dog-intro">
        <div>
          <p className="eyebrow">CLEAN UNICORN STUDY 03</p>
          <h1>一只双翼独角兽，转一圈也要干净。</h1>
          <p>改用 161KB 素色移动端模型：身体、鬃毛、尾发与双翼使用连续磨砂底色，不再叠加容易漏边的彩色贴图；灵动眼睛、粉色口鼻、黑色四蹄保持固定，角使用随机强调色。</p>
        </div>
        <button className="color-dog-randomize" type="button" onClick={randomize}>
          <Dices size={18} />随机生成一只
        </button>
      </section>
      <ColorUnicornLabViewer variant={variant} />
      <section className="color-dog-notes" aria-label="技术说明">
        <Info size={19} />
        <p><strong>移动端优先的干净分层：</strong> 只加载一个约 161KB 的 Draco 模型，没有彩色贴图与额外遮罩。拖动可 360° 检查，手机上可双指缩放；随机按钮只更新颜色，不会重新下载模型。</p>
      </section>
    </main>
  );
}