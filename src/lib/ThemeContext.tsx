import React, { createContext, useState, useContext, ReactNode } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  accentColor: string;
  setTheme: (t: ThemeType) => void;
  setAccentColor: (c: string) => void;
}

// Creamos el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider que envuelve la app
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [accentColor, setAccentColor] = useState<string>("#7c3aed"); // color púrpura por defecto

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      <div
        className={theme === "dark" ? "dark" : ""}
        style={{ "--accent-color": accentColor } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto en componentes
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

// Export explícito de ThemeContext para compatibilidad con imports antiguos
export { ThemeContext };
