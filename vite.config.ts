import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { devApiPlugin } from "./vite-plugin-dev-api";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Só aceita conexões desta máquina. Para testar em outro aparelho da rede, rode `npm run dev -- --host`.
    host: "localhost",
    port: 8080,
  },
  plugins: [react(), devApiPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
