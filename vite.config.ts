import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/protfolio/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-three-core",
              test: /node_modules[\\/]three[\\/]build[\\/]/,
              priority: 35,
            },
            {
              name: "vendor-three-addons",
              test: /node_modules[\\/]three[\\/]examples[\\/]/,
              priority: 30,
            },
            {
              name: "vendor-r3f",
              test: /node_modules[\\/]@react-three[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-motion",
              test: /node_modules[\\/](motion|framer-motion|gsap)[\\/]/,
              priority: 15,
            },
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
