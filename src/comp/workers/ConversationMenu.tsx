import { useSelector } from "@/lib/hooks/useTarget";
import { ClassNames } from "@emotion/react";
import { MantineProvider, Menu, Portal } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCaretUp,
  IconCopy,
  IconEdit,
  IconMessage,
  IconShare2,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

const regDel = /^Delete ".+"\?$/;
const regNew = /^New chat$/;
export const ConversationMenu = () => {
  const [target, setTarget] = useState<HTMLAnchorElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handlerRef = useRef((el: HTMLAnchorElement, x: number, y: number) => {
    setTarget(el);
    setPos({ x, y });
  });
  const elNew = useSelector<HTMLElement>("nav a.flex-grow", regNew);

  const ref = useClickOutside(() => setTarget(null));
  const isDeleting = regDel.test(target?.textContent || "");
  const isOpened = !!(target && target.classList.contains("bg-gray-800"));

  const handlers = useMemo(
    () =>
      target
        ? {
            wait: async () => {
              let els: NodeListOf<HTMLButtonElement>;
              let t = Date.now();
              do {
                // wait for buttons to appear
                await new Promise((r) => setTimeout(r, 10));
                els = document.querySelectorAll(
                  "nav .overflow-y-auto li button"
                );
              } while (
                !els.length &&
                !!target.parentElement &&
                t + 1000 > Date.now()
              );

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
              console.log(els);
              if (!els) return;
              const edit = els[0];
              edit.click();
            },
            share: async () => {
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              const share = els[1];
              const hasPopup = share.getAttribute("aria-haspopup");
              if (!hasPopup) return;
              share.click();
            },
            copyUrl: async () => {
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              const url = location.href;
              navigator.clipboard.writeText(url);
              notifications.show({
                icon: <IconCopy />,
                color: "blue",
                title: "Copied URL",
                message: url,
              });
            },
            pullToTop: async () => {
              target.click();
              const els = await handlers.wait?.();
              if (!els) return;
              const edit = els[0];
              const parent = target.parentElement;
              edit.click();
              await new Promise((r) => setTimeout(r, 10));
              const el = parent?.querySelector("input");
              if (!el) return;
              if (el.value.endsWith(" ")) el.value = el.value.slice(0, -1);
              else el.value = el.value + " ";
              el.dispatchEvent(new Event("input", { bubbles: true }));
              const btn = parent?.querySelector(
                "button"
              ) as HTMLButtonElement | null;
              btn?.click();
            },
            delete: async () => {
              target.click();
              const title = target.textContent;
              const els = await handlers.wait?.();
              if (!els) return;
              const del = els[els.length - 1];
              del.click();
              const els2 = await handlers.wait?.();
              if (!els2) return;
              const confirm = els2[0];
              confirm.click();
              notifications.show({
                icon: <IconTrash />,
                color: "red",
                title: "Deleted",
                message: title,
              });
            },
            close: async () => {
              elNew?.click();
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
          <MantineProvider theme={{ colorScheme: "dark" }}>
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
                opened={!isDeleting}
                onChange={() => setTarget(null)}
                position="right"
                withArrow
              >
                <Menu.Target>
                  <span />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{target.textContent}</Menu.Label>
                  <Menu.Divider />

                  {isOpened ? (
                    <Menu.Item
                      icon={<IconX />}
                      onClick={handlers.close}
                      color="indigo"
                    >
                      Close
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      icon={<IconMessage />}
                      onClick={handlers.click}
                      color="indigo"
                    >
                      Open
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item icon={<IconEdit />} onClick={handlers.edit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item icon={<IconShare2 />} onClick={handlers.share}>
                    Share...
                  </Menu.Item>
                  <Menu.Item icon={<IconCopy />} onClick={handlers.copyUrl}>
                    Copy URL
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCaretUp />}
                    onClick={handlers.pullToTop}
                  >
                    Pull to top
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconTrash />}
                    onClick={handlers.delete}
                    color="red"
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </MantineProvider>
        </Portal>
      )}
    </ClassNames>
  ) : null;
};
