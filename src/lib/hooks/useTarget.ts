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
      const tgtEl = await waitElement<E>({ selector, textReg }, true);
      if (dead || !tgtEl) return;
      setEl(tgtEl);
    };
    if (!el) {
      // find element
      scanEl();
    } else {
      // monitor detachment
      const mo = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.type === "childList") {
            const found = [...mutation.removedNodes].some((node) =>
              node.contains(el)
            );
            if (dead) return;
            if (found) setEl(null);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
  }, [el, textReg]);
  return el;
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
