import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'pspdfkit': path.resolve(__dirname, 'node_modules/pspdfkit/dist/pspdfkit.js')
    }
  },
  optimizeDeps: {
    include: ['pspdfkit']
  }
});


// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import copy from "rollup-plugin-copy";
// import path from 'path';

// // https://vitejs.dev/config/
// export default defineConfig({
//   // Your Vite configuration.
//   plugins: [
//     // Your Vite plugins.
//     copy({
//       targets: [
//         {
//           src: "node_modules/pspdfkit/dist/pspdfkit-lib",
//           dest: "public/",
//         },
//       ],
//       hook: "buildStart",
//     }),
//     react(),
//   ],
//   resolve: {
//     alias: {
//       'pspdfkit': path.resolve(__dirname, 'node_modules/pspdfkit/dist/pspdfkit.js')
//     }
//   },
//   optimizeDeps: {
//     include: ['pspdfkit']
//   },
//   build: {
//     outDir: "build",
//   },
// });