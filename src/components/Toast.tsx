import React, { useEffect, useContext } from "react";
  import { ThemeContext } from "../lib/ThemeContext";

  interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
  }

  const Toast: React.FC<ToastProps> = ({ message, type = "success", duration = 3000, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    useEffect(() => {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icon =
      type === "error" ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ) : type === "info" ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );

    const containerStyle: React.CSSProperties =
      type === "error"
        ? {
            background: isDark ? "rgba(239,68,68,0.13)" : "rgba(254,226,226,0.96)",
            border: "1px solid rgba(239,68,68,0.28)",
            boxShadow: "0 8px 32px rgba(239,68,68,0.18)",
          }
        : type === "info"
        ? {
            background: isDark ? "rgba(99,102,241,0.15)" : "rgba(238,242,255,0.96)",
            border: "1px solid rgba(99,102,241,0.26)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.20)",
          }
        : {
            background: "linear-gradient(135deg, rgba(79,70,229,0.92) 0%, rgba(124,58,237,0.92) 50%, rgba(168,85,247,0.92) 100%)",
            boxShadow: "0 8px 32px rgba(168,85,247,0.40), inset 0 0 0 1px rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.10)",
          };

    const textColor =
      type === "error"
        ? isDark ? "text-red-400" : "text-red-600"
        : type === "info"
        ? isDark ? "text-indigo-300" : "text-indigo-700"
        : "text-white";

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 pointer-events-none">
        <div
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold backdrop-blur-2xl ${textColor}`}
          style={containerStyle}
        >
          {icon}
          <span>{message}</span>
        </div>
      </div>
    );
  };

  export default Toast;
  
