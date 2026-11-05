import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
