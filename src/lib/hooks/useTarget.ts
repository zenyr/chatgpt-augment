import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { waitElement } from "../elementPromises";
import { useDead } from "./useDeadRef";
import { useViewportSize } from "@mantine/hooks";

export const useQuerySelector = (
  selector: string,
  onMutation?: (el: HTMLElement | null) => void
): HTMLElement | null => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const elRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const handleElement = (): void => {
      const selectedElement = document.querySelector<HTMLElement>(selector);
      onMutation?.(selectedElement);
      if (selectedElement === elRef.current) return;
      setElement(selectedElement);
      elRef.current = selectedElement;
    };

    handleElement();

    const observer = new MutationObserver(handleElement);
    const options: MutationObserverInit = {
      childList: true,
      subtree: true,
    };

    observer.observe(document.documentElement, options);

    return () => observer.disconnect();
  }, [selector, onMutation]);

  return element;
};

export const useSelector = <E extends HTMLElement>(
  selector: string,
  textReg?: RegExp,
  attributeFilter?: string[]
) => {
  const [el, setEl] = useState<E | null>(null);
  const dead = useDead();
  useLayoutEffect(() => {
    const scanEl = async () => {
      if (dead.current) return;
      const tgtEl = await waitElement<E>(
        { selector, textReg, timeout: 100 },
        true
      );
      if (dead.current) return;
      setEl(tgtEl);
    };

    // monitor attach / detachment
    const mo = new MutationObserver((mutations) => {
      if (dead.current) return;
      let shouldScan = false;
      for (let mutation of mutations) {
        if (mutation.target) {
          mutation.target.contains(el);
          shouldScan = true;
          break;
        }
        if (mutation.type === "childList") {
          if (el) {
            const found = [...mutation.removedNodes].some((node) =>
              node.contains(el)
            );
            if (found) {
              shouldScan = true;
              break;
            }
          } else {
            if (mutation.addedNodes.length > 0) {
              shouldScan = true;
              break;
            }
          }
        }
      }
      if (shouldScan) scanEl();
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter,
    });
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
      if (dead.current) return;
      setEls([...tgtEls]);
    };

    // monitor attach / detachment
    const mo = new MutationObserver((mutations) => {
      if (dead.current) return;
      let shouldScan = false;
      for (let mutation of mutations) {
        if (mutation.type === "childList") {
          if (
            mutation.target instanceof Element &&
            els.includes(mutation.target as E)
          ) {
            shouldScan = true;
            break;
          }
          const removalDetected = [...mutation.removedNodes].some((node) =>
            [...els].some((e) => node.contains(e))
          );
          if (removalDetected) shouldScan = true;
          if (shouldScan) break;
          if (mutation.addedNodes.length > 0) shouldScan = true;
          if (shouldScan) break;
        }
      }

      if (shouldScan) scanEls();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    if (!els) scanEls();
    return () => mo.disconnect();
  }, [els, textReg]);
  return els;
};

export const useRootAnchor = () => {
  const [orgHtml, setOrgHtml] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { width: w, height: h } = useViewportSize();
  const [n, setN] = useState(0);
  useLayoutEffect(() => {
    setN(w * h);
  }, [w, h]);
  const handleAnchorMutation = useCallback(
    (el: HTMLElement | null = anchor) => {
      if (!el) return;
      const span = el.firstChild as HTMLSpanElement;
      const rect = span.getBoundingClientRect();
      setRect(rect);
      setOrgHtml(span.innerHTML || "ChatGPT");
    },
    [n]
  );

  const anchor = useQuerySelector(`form + div`, handleAnchorMutation);

  return [anchor, orgHtml, rect] as const;
};
