import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Visitrip",
        short_name: "Visitrip",
        description: "Organize, share, and collaborate on trips.",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/health": "http://localhost:3001",
    },
  },
});
