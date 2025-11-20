import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sign": {
        target: "http://localhost:6000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
