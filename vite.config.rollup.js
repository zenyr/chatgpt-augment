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
    manualChunks: {
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
      "vnd.gptTokenizer": ["gpt-tokenizer"],
      "vnd.emojis": ["node-emoji"],
    },
  },
};
