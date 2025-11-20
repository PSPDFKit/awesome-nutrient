import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    copy({
      targets: [
        {
          // Nutrient Web SDK requires its assets to be in the `public` directory so it can load them at runtime.
          src: "node_modules/@nutrient-sdk/viewer/dist/nutrient-viewer-lib",
          dest: "public/",
        },
      ],
      hook: "buildStart", // Copy assets when build starts.
    }),
    react(),
  ],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
