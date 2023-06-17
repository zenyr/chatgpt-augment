import { ClassNames } from "@emotion/react";
import { Menu, Portal } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
  IconEdit,
  IconMessage,
  IconShare2,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const ConversationMenu = () => {
  const [target, setTarget] = useState<HTMLAnchorElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handlerRef = useRef((el: HTMLAnchorElement, x: number, y: number) => {
    setTarget(el);
    setPos({ x, y });
  });
  const ref = useClickOutside(() => setTarget(null));

  const handlers = useMemo(
    () =>
      target
        ? {
            wait: async () => {
              let els: NodeListOf<HTMLButtonElement>;
              do {
                // wait for buttons to appear
                els = target.querySelectorAll("button");
                if (!els.length) await new Promise((r) => setTimeout(r, 100));
              } while (!els.length);

              return els;
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
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              const edit = els[0];
              edit.click();
              handlers.openMenu?.();
            },
            share: async () => {
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              if (els.length < 3) return; // no share button
              const share = els[1];
              share.click();
            },
            delete: async () => {
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              const del = els[els.length - 1];
              del.click();
              handlers.openMenu?.();
            },
          }
        : {},
    [target]
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

  useEffect(() => {
    if (!target) return;
    const els = document.querySelectorAll(
      "nav .overflow-y-auto"
    ) as NodeListOf<HTMLElement>;
    els.forEach((el) => (el.style.overflowY = "hidden"));
    return els.forEach((el) => (el.style.overflowY = "auto"));
  }, [target]);

  return target ? (
    <ClassNames>
      {({ css }) => (
        <Portal>
          <div
            // shadow="md"
            // withBorder
            className={css`
              position: fixed;
              left: ${pos.x}px;
              top: ${pos.y}px;
              z-index: 9999;
              user-select: none;
            `}
            ref={ref}
          >
            <Menu
              opened
              onChange={() => setTarget(null)}
              position="right"
              withArrow
            >
              <Menu.Target>
                <span />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{target.textContent}</Menu.Label>
                {!target.classList.contains("bg-gray-800") && (
                  <Menu.Item icon={<IconMessage />} onClick={handlers.click}>
                    Open
                  </Menu.Item>
                )}
                <Menu.Item icon={<IconEdit />} onClick={handlers.edit}>
                  Edit
                </Menu.Item>
                <Menu.Item icon={<IconShare2 />} onClick={handlers.share}>
                  Share...
                </Menu.Item>
                <Menu.Item icon={<IconTrash />} onClick={handlers.delete}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Portal>
      )}
    </ClassNames>
  ) : null;
};
