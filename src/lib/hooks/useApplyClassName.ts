import { useLayoutEffect } from "react";

export const useApplyClassName = (
  node: HTMLElement | null,
  className: string
) => {
  useLayoutEffect(() => {
    if (!node) return;
    if (node.classList.contains(className)) return;
    node.classList.add(className);
    return () => node.classList.remove(className);
  }, [className, node]);
};
