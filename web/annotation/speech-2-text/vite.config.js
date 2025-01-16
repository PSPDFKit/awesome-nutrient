import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // eslint-disable-next-line no-undef
    __APP_ENV__: process.env.APP_ENV,
  },
  plugins: [
    // your vite plugins...
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
