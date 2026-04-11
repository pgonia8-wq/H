import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  accentColor: string;
  toggleTheme: () => void;
  setTheme: (t: ThemeType) => void;
  setAccentColor: (c: string) => void;
  username: string | null;
  setUsername: (u: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as ThemeType)) || "dark"
  );

  const [accentColor, setAccentColor] = useState<string>(
    (typeof window !== "undefined" && localStorage.getItem("accentColor")) || "#7c3aed"
  );

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (username) localStorage.setItem("username", username);
    else localStorage.removeItem("username");
  }, [username]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setTheme, setAccentColor, username, setUsername }}>
      <div
        className={theme === "dark" ? "dark" : ""}
        style={{ "--accent-color": accentColor } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export { ThemeContext };
