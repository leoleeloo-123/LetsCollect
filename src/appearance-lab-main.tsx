import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppearanceLabPage } from "./pages/appearance-lab/AppearanceLabPage";
import "./styles/index.css";
import "./styles/appearance-lab.css";
import "./styles/appearance-stage-themes.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppearanceLabPage />
    </BrowserRouter>
  </React.StrictMode>
);
