import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/afterdark-night-game/",
  plugins: [react()],
  publicDir: "public",
  build: { outDir: "docs", emptyOutDir: true },
});
