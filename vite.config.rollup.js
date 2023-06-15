export const chunks = {
  "vnd.react": ["react", "react-dom"],
  "vnd.ui": [
    "@mantine/core",
    "@mantine/hooks",
    "@mantine/notifications",
    "@tabler/icons-react",
  ],
  "vnd.lodash": [
    "lodash",
    "lodash/memoize",
    "lodash/debounce",
    "lodash/throttle",
    "lodash/fp",
  ],
  "vnd.chronoNode": ["chrono-node"],
  "vnd.emojis": ["node-emoji"],
};

/** @type {import('vite').UserConfig.build.rollupOptions} */
export default {
  treeshake: "smallest",
  output: {
    generatedCode: {
      arrowFunctions: true,
      constBindings: true,
      objectShorthand: true,
      hoistTransitiveImports: false,
    },
    manualChunks:
      process.env.NODE_ENV === "production"
        ? (id) => {
            const found = Object.entries(chunks).find(([_, value]) =>
              value.some((m) => id.includes(m))
            );
            if (found) {
              const [key] = found;
              return key;
            }
            if (id.includes("gpt3")) return "vnd.gpt3.encoder";
          }
        : {},
  },
};
