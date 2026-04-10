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
            "vendor-react":    ["react", "react-dom"],
            "vendor-minikit":  ["@worldcoin/minikit-js"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-motion":   ["framer-motion"],
            "vendor-ethers":   ["ethers"],
            "vendor-charts":   ["recharts"],
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  })
  