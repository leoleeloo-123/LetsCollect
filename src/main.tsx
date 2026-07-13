import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { MvpStateProvider } from "./app/MvpState";
import { AuthProvider } from "./features/auth/AuthContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MvpStateProvider>
          <App />
        </MvpStateProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
