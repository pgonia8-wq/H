import React from "react";
  import ReactDOM from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
  import { ThemeProvider } from "./lib/ThemeContext";
  import { UserProvider } from "./context/UserContext";
  import { LanguageProvider } from "./LanguageContext";
  import ErrorBoundary from "./components/ErrorBoundary";

  const APP_ID = (import.meta as any).env?.VITE_APP_ID ?? "";

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <MiniKitProvider appId={APP_ID}>
      <UserProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </LanguageProvider>
        </ThemeProvider>
      </UserProvider>
    </MiniKitProvider>
  );
  