import { installApp } from "@/lib/install";
import throttle from "lodash/throttle";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContinueClicker } from "./ContinueClicker";
import { EditWatcher } from "./EditWatcher";
import { useJustMounted } from "@/lib/hooks/useJustMounted";

const healthcheck = throttle(() => {
  const app = document.getElementById("chatgpt-augment-app");
  if (!app) installApp();
}, 100);

export const MutationWatcher = () => {
  const continueRef = useRef<HTMLElement | null>(null);
  const editRef = useRef<Set<HTMLElement>>(new Set());
  const justMounted = useJustMounted();
  const [rev, setRev] = useState(0);
  const update = useCallback(() => setRev((r) => r + 1), []);

  const clearContinueNode = useCallback(
    () => ((continueRef.current = null), update()),
    []
  );
  const clearEditNode = useCallback(
    (node?: HTMLElement) => (node && editRef.current.delete(node), update()),
    []
  );

  const scanAddedNode = useCallback((node: Node) => {
    if (node instanceof HTMLElement) {
      if (node.textContent === "Continue generating") {
        continueRef.current = node;
        update();
      }
      if (node.textContent === "Save & SubmitCancel") {
        const parent = node.parentNode;
        if (parent && parent instanceof HTMLElement) {
          editRef.current.add(parent);
          update();
        }
      }
    }
  }, []);

  const handleMutation = useCallback((mutations: MutationRecord[]): void => {
    mutations.forEach((mutation) => {
      const addedNodes = Array.from(mutation.addedNodes);
      addedNodes.forEach(scanAddedNode);
    });
    healthcheck();
  }, []);
  useEffect(() => {
    // install / uninstall observer
    const observer = new MutationObserver(handleMutation);
    try {
      observer.observe(document.body, { childList: true, subtree: true });
      if (import.meta.hot) {
        import.meta.hot.dispose(() => {
          observer.disconnect();
        });
      }
    } catch {
      console.log("Fatal: No Main found.");
    }
    return () => observer.disconnect();
  }, [handleMutation]);

  return (
    <>
      {!justMounted && continueRef.current && (
        <ContinueClicker node={continueRef.current} done={clearContinueNode} />
      )}
      {Array.from(editRef.current).map((node, idx) => (
        <EditWatcher key={`${rev}_${idx}`} node={node} done={clearEditNode} />
      ))}
    </>
  );
};
