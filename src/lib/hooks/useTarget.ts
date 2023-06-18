import { useEffect, useLayoutEffect, useState } from "react";
import { waitElement } from "../elementPromises";
import { useDead } from "./useDeadRef";

export const useSelector = <E extends HTMLElement>(
  selector: string,
  textReg?: RegExp
) => {
  const [el, setEl] = useState<E | null>(null);
  const dead = useDead();
  useLayoutEffect(() => {
    const scanEl = async () => {
      if (dead.current) return;
      const tgtEl = await waitElement<E>(
        { selector, textReg, timeout: 1000 },
        true
      );
      if (dead.current || !tgtEl) return;
      setEl(tgtEl);
    };

    // monitor attach / detachment
    const mo = new MutationObserver((mutations) => {
      if (dead.current) return;
      let additionFound = false;
      for (let mutation of mutations) {
        if (mutation.type === "childList") {
          if (el) {
            const found = [...mutation.removedNodes].some((node) =>
              node.contains(el)
            );
            if (found) setEl(null);
          } else {
            if (mutation.addedNodes.length > 0) additionFound = true;
          }
        }
      }
      if (additionFound) scanEl();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    if (!el) scanEl();
    return () => mo.disconnect();
  }, [el, textReg]);
  return el;
};

export const useSelectors = <E extends HTMLElement>(
  selector: string,
  textReg?: RegExp
) => {
  const [els, setEls] = useState<E[]>([]);
  const dead = useDead();
  useLayoutEffect(() => {
    const scanEls = async () => {
      if (dead.current) return;
      const tgtEls = await waitElement<E, true, true>(
        { selector, textReg, timeout: 100 },
        true,
        true
      );
      if (dead.current || !tgtEls) return;
      setEls([...tgtEls]);
    };

    // monitor attach / detachment
    const mo = new MutationObserver((mutations) => {
      if (dead.current) return;
      let changeFound = false;
      for (let mutation of mutations) {
        if (mutation.type === "childList") {
          const removalDetected = [...mutation.removedNodes].some((node) =>
            [...els].some((e) => node.contains(e))
          );
          if (removalDetected) changeFound = true;
          if (changeFound) break;
          if (mutation.addedNodes.length > 0) changeFound = true;
          if (changeFound) break;
        }
      }

      if (changeFound) scanEls();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    if (!els) scanEls();
    return () => mo.disconnect();
  }, [els, textReg]);
  return els;
};

export const useRootTarget = (selector: string) => {
  const target = useSelector(selector);
  const [orgHtml, setOrgHtml] = useState("");

  useEffect(() => {
    if (target) {
      setOrgHtml(target.innerHTML || "ChatGPT");
      target.innerHTML = "";
    }
  }, [target]);

  return [target, orgHtml] as const;
};
