import React from "react";
import { MiniApp } from "@/App";
import { debounce } from "lodash";
import { Root, createRoot } from "react-dom/client";

let root: Root;

export const installApp = debounce(async () => {
  let srcDiv;
  do {
    srcDiv = document.querySelector("form + div");
    await new Promise((r) => setTimeout(r, 100));
  } while (!srcDiv);
  const html = srcDiv.innerHTML || "ChatGPT";
  uninstallApp();
  root = createRoot(srcDiv);
  root.render(React.createElement(MiniApp, { html }));
}, 100);

const uninstallApp = () => {
  if (root) {
    root.unmount();
  }
};
