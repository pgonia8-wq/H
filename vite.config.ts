import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Cada clave es un chunk separado que el navegador cachea de forma independiente.
          // Si framer-motion no cambia entre deploys, el usuario no lo vuelve a descargar.
          "vendor-motion":   ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-minikit":  ["@worldcoin/minikit-js"],
          "vendor-react":    ["react", "react-dom"],
        }
      }
    },
    // Silencia el warning de chunks grandes (opcional)
    chunkSizeWarningLimit: 600
  }
})
