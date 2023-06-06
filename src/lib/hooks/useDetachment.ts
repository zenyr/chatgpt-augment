import { useEffect, useRef } from "react";

export const useDetachment = (
  node: HTMLElement | null,
  callback?: (node?: HTMLElement) => void
) => {
  const lastRef = useRef<HTMLElement | null>(null);
  const lastCbkRef = useRef<((node?: HTMLElement) => void) | null>(null);

  useEffect(() => {
    const nodeChanged = lastRef.current !== node;
    const cbkChanged = lastCbkRef.current !== node;
    // initial render
    if (node) {
      if (nodeChanged) {
        lastCbkRef.current?.(lastRef.current || void 0);
      }
      lastCbkRef.current = callback || null;
      lastRef.current = node;

      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === "childList" &&
            Array.from(mutation.removedNodes).includes(node)
          ) {
            lastCbkRef.current?.(node || void 0);
          }
        }
      });

      const parent = node.parentNode;
      if (!parent) {
        // oof this is an orphan, no need to observe at all
        lastCbkRef.current?.(node || void 0);
        return;
      }

      observer.observe(parent, { childList: true });
      return () => observer.disconnect();
    } else {
      if (!node) {
        if (!lastRef.current) return; // meh
        if (cbkChanged) {
          callback?.(lastRef.current);
        } else {
          lastCbkRef.current?.(lastRef.current);
        }

        lastRef.current = node;
        lastCbkRef.current = callback || null;
        return;
      }
    }
  }, [node, callback]);

  return;
};
