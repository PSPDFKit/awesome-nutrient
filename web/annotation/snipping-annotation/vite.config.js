import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Your Vite configuration.
  plugins: [
    // Your Vite plugins.
    copy({
      targets: [
        {
          src: "node_modules/pspdfkit/dist/pspdfkit-lib",
          dest: "public/",
        },
      ],
      hook: "buildStart",
    }),
    react(),
  ],
  build: {
    outDir: "build",
  },
});
