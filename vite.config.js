import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";

/** @type {import('vite').UserConfig} */
export default {
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || ""),
    "process.env": {},
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
  },
  build: {
    target: "modules",
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
    },
  },
  plugins: [react()],
};
