import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/afterdark/",
  plugins: [
    react(),
    {
      name: "nenkae-social-metadata",
      transformIndexHtml(html) {
        return html.replaceAll('content="/og.png"', 'content="https://www.nenkae.com/afterdark/og.png"');
      },
    },
  ],
  publicDir: "public",
  build: { outDir: "nenkae-dist", emptyOutDir: true },
});
