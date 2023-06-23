import { App } from "@/App";
import debounce from "lodash/debounce";
import React from "react";
import { Root, createRoot } from "react-dom/client";

let root: Root;
const anchor = document.createElement("div");
anchor.id = "cgpt-agmt-root";
anchor.className =
  "px-3 pb-3 pt-2 text-center text-xs text-gray-600 dark:text-gray-300 md:px-4 md:pb-6 md:pt-3";
anchor.style.position = "absolute";
// anchor.style.transform = "translate(0, -100%)";
anchor.style.right = "0";
anchor.style.bottom = "0";

document.body.appendChild(anchor);

export const installApp = debounce(async () => {
  uninstallApp();
  root = createRoot(anchor);
  root.render(React.createElement(App));
}, 100);

const uninstallApp = () => {
  if (root) {
    root.unmount();
  }
};
