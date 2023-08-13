import { App } from "@/App";
import debounce from "lodash/debounce";
import React from "react";
import { Root, createRoot } from "react-dom/client";

let root: Root;
const anchor = document.createElement("div");
anchor.id = "cgpt-agmt-root";
anchor.style.position = "absolute";
anchor.style.left = "0";
anchor.style.top = "0";

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
