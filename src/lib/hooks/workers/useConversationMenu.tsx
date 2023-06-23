import { Text } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCaretUp, IconCopy, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { store } from "./useElements";

const regDel = /^Delete ".+"\?$/;

export const useConversationMenu = () => {
  const [elNew] = store((s) => [s.button.new]);
  const [target, setTarget] = useState<HTMLAnchorElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handlerRef = useRef((el: HTMLAnchorElement, x: number, y: number) => {
    setTarget(el);
    setPos({ x, y });
  });
  const ref = useClickOutside(() => setTarget(null));
  const isDeleting = regDel.test(target?.textContent || "");
  const isOpened = !!(target && target.classList.contains("bg-gray-800"));
  const helperRef = useRef<[string, number]>();
  const helper = useMemo(() => {
    return {
      prepareAndClick() {
        const el = target?.parentElement;
        if (!el) throw new Error("No parent element");
        const title = el.textContent || "";
        const siblings = helper.getByTitle(title);
        const idx = siblings.indexOf(el);
        helperRef.current = [title, idx];
        target.click();
        return el;
      },
      getByTitle(title: string) {
        const allLinks = [...document.querySelectorAll("nav li.relative")];
        const filtered = allLinks.filter(
          (el) =>
            el.textContent === title ||
            el.textContent === `Delete "${title}"?` ||
            el.querySelector("input")?.value === title
        );
        return filtered;
      },
      async get(selector: string, expectedLength = 1) {
        if (!helperRef.current) throw new Error("No helperRef");

        let result: NodeListOf<HTMLElement>;
        const t = Date.now();
        const [title, idx] = helperRef.current;
        do {
          const parent = helper.getByTitle(title)[idx];
          if (parent) {
            result = parent.querySelectorAll(selector);
            if (result?.length === expectedLength) {
              return [...result];
            }
          }
          await new Promise((r) => setTimeout(r, 50));
        } while (t + 2_000 > Date.now());
        return null;
      },
      cleanup: () => {
        helperRef.current = void 0;
      },
    };
  }, [target]);

  const handlers = useMemo(
    () =>
      target
        ? {
            bail: () => {
              helper.cleanup();
              notifications.show({
                icon: <IconX />,
                color: "orange",
                title: "Failed due to a list change",
                message: "Please try again.",
              });
            },
            openMenu: () => {
              const srItem = document.querySelectorAll(
                ".sr-only"
              ) as NodeListOf<HTMLSpanElement>;
              srItem.forEach((el) => {
                if (el.textContent === "Open sidebar") el.click();
              });
            },
            click: () => target.click(),
            edit: async () => {
              helper.prepareAndClick();
              try {
                const els = await helper.get("button", 3);
                if (els?.length !== 3) return handlers.bail?.();
                const edit = els[0];
                edit.click();
              } finally {
                helper.cleanup();
              }
            },
            share: async () => {
              helper.prepareAndClick();
              try {
                const els = await helper.get("button", 3);
                if (els?.length !== 3) return handlers.bail?.();

                const share = els[1];
                const hasPopup = share.getAttribute("aria-haspopup");
                if (!hasPopup) return;
                share.click();
              } finally {
                helper.cleanup();
              }
            },
            copyUrl: async () => {
              helper.prepareAndClick();
              try {
                const els = await helper.get("button", 3);
                if (els?.length !== 3) return handlers.bail?.();

                const url = location.href;
                navigator.clipboard.writeText(url);
                notifications.show({
                  icon: <IconCopy />,
                  color: "blue",
                  title: "Copied URL",
                  message: url,
                });
              } finally {
                helper.cleanup();
              }
            },
            pullToTop: async () => {
              helper.prepareAndClick();
              try {
                const title = target.textContent;

                const els = await helper.get("button", 3);
                if (els?.length !== 3) return handlers.bail?.();

                const edit = els[0];
                edit.click();

                const elsInput = await helper.get("input");
                const el = elsInput?.[0] as HTMLInputElement | undefined;
                if (!el) return handlers.bail?.();

                if (el.value.endsWith(" ")) el.value = el.value.slice(0, -1);
                else el.value = el.value + " ";
                el.dispatchEvent(new Event("input", { bubbles: true }));
                if (helperRef.current) {
                  helperRef.current[0] = el.value; // update scanning title
                }

                const elsBtn = await helper.get("button", 2);
                if (elsBtn?.length !== 2) return handlers.bail?.();
                const btn = elsBtn[0];
                btn.click();

                notifications.show({
                  icon: <IconCaretUp />,
                  color: "blue",
                  title: "Pulled to top",
                  message: (
                    <Text>
                      <Text fw={700}>{title}</Text> will be at the top on the
                      next list update.
                    </Text>
                  ),
                });
              } finally {
                helper.cleanup();
              }
            },
            delete: async () => {
              helper.prepareAndClick();
              try {
                const title = target.textContent;

                const els = await helper.get("button", 3);
                if (els?.length !== 3) return handlers.bail?.();

                const del = els[els.length - 1];
                del.click();

                const elsBtn = await helper.get("button", 2);
                if (elsBtn?.length !== 2) return handlers.bail?.();

                const confirm = elsBtn[0];
                confirm.click();

                notifications.show({
                  icon: <IconTrash />,
                  color: "red",
                  title: "Deleted",
                  message: title,
                });
              } finally {
                helper.cleanup();
              }
            },
            close: async () => {
              elNew?.click();
            },
          }
        : {},
    [target, helper]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = e.pageX;
      const y = e.pageY;
      let el = e.target as HTMLElement | null;
      while (el) {
        if (el.tagName === "A") {
          if (el.classList.contains("text-sm")) {
            return; // not a message link
          }
          break;
        }
        el = el.parentElement;
      }
      if (!el) return;
      // me being lazy to traverse the dom
      el.classList.add("cgpt-agmt-ctx");
      const verifiedEl = document.querySelector(
        "nav a.cgpt-agmt-ctx"
      ) as HTMLElement | null;
      el.classList.remove("cgpt-agmt-ctx");
      if (!verifiedEl) return;

      e.preventDefault();
      handlerRef.current(verifiedEl as HTMLAnchorElement, x, y);
    };
    document.body.addEventListener("contextmenu", handler);
    return () => (
      document.body.removeEventListener("contextmenu", handler), setTarget(null)
    );
  }, []);

  return { target, pos, ref, isDeleting, isOpened, setTarget, handlers };
};
