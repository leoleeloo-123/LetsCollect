import { ArrowLeft, FlaskConical, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { toyModels } from "../../features/toys/catalog";
import { MaterialLabViewer } from "../../three/MaterialLab/MaterialLabViewer";
import type { ToyModelId } from "../../types/toy";

export function MaterialLabPage() {
  const [modelId, setModelId] = useState<ToyModelId>("unicorn");

  return (
    <main className="material-lab-page">
      <header className="material-lab-header">
        <Link className="material-lab-header__back" to={routes.home}>
          <ArrowLeft size={18} />
          返回首页
        </Link>
        <span className="material-lab-header__mark"><FlaskConical size={18} /> Let's Collect</span>
      </header>

      <section className="material-lab-intro">
        <div>
          <p className="eyebrow">Material study 01</p>
          <h1>材质实验室</h1>
          <p>同一造型、同一灯光、同一观察角度，比较八种基础材质的辨识度。</p>
        </div>
        <label className="material-lab-model-select">
          <span>测试造型</span>
          <select value={modelId} onChange={(event) => setModelId(event.target.value as ToyModelId)}>
            {toyModels.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </label>
      </section>

      <MaterialLabViewer modelId={modelId} />

      <section className="material-lab-notes" aria-label="原型边界">
        <Info size={19} />
        <p><strong>原型边界</strong> 木头使用无 UV 程序化纹理；钻石使用现有光滑几何，后续需要切面模型验证最终质感。</p>
      </section>
    </main>
  );
}
