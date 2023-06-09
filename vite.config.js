// @ts-check
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import _manifest from "./manifest.json";
import rollupOptions from "./vite.config.rollup.js";

/** @type {import('./manifest.json')} */
const manifest = _manifest;

const preambleCode = `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;

/** @type {import('vite').UserConfig} */
export default {
  build: {
    minify: false,
    rollupOptions,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || ""),
    "process.env": {},
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
  },
  plugins: [
    crx({ manifest, contentScripts: { preambleCode } }),
    react(),
    !process.env.CI && visualizer(),
  ],
};
