import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api" : "http://localhost:5000"
    },
    host: true, 
    allowedHosts: [
      "6709-2409-40c2-108-76f1-1d9c-5c46-367b-aa41.ngrok-free.app"
    ]
  }
})
