import { useSelector } from "@/lib/hooks/useTarget";
import { ClassNames } from "@emotion/react";
import { MantineProvider, Menu, Portal, Text } from "@mantine/core";
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
            wait: async (
              parent: HTMLElement | Document,
              selector: string,
              length: number = 3
            ) => {
              let els: NodeListOf<HTMLButtonElement>;
              let t = Date.now();
              do {
                // wait for buttons to appear
                await new Promise((r) => setTimeout(r, 10));
                els = parent.querySelectorAll(selector);
              } while (
                els.length !== length &&
                !!(parent === document || parent.parentElement) &&
                t + 2000 > Date.now()
              );
              return els;
            },
            bail: () => {
              notifications.update({
                id: "ctx",
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
              const parent = target.parentElement!;

              target.click();
              const els = await handlers.wait?.(parent, "button", 3);
              console.log(els);
              if (!els) return;
              const edit = els[0];
              edit.click();
            },
            share: async () => {
              const parent = target.parentElement!;
              target.click();
              const els = await handlers.wait?.(parent, "button", 3);
              if (!els?.length) return handlers.bail?.();
              const share = els[1];
              const hasPopup = share.getAttribute("aria-haspopup");
              if (!hasPopup) return;
              share.click();
            },
            copyUrl: async () => {
              notifications.show({
                id: "ctx",
                message: "Copying URL...",
              });
              const parent = target.parentElement!;
              target.click();
              const els = await handlers.wait?.(parent, "button", 3);
              if (!els?.length) return handlers.bail?.();
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
              notifications.show({
                id: "ctx",
                message: "Pulling item up...",
              });
              const parent = target.parentElement!;
              target.click();
              const els = await handlers.wait?.(parent, "button", 3);
              if (!els?.length) return handlers.bail?.();
              const edit = els[0];
              edit.click();
              const elsInput = await handlers.wait?.(parent, "input", 1);
              const el = elsInput?.[0];
              if (!el) return handlers.bail?.();
              if (el.value.endsWith(" ")) el.value = el.value.slice(0, -1);
              else el.value = el.value + " ";
              el.dispatchEvent(new Event("input", { bubbles: true }));
              const elsBtn = await handlers.wait?.(parent, "button", 2);
              if (!elsBtn?.length) return handlers.bail?.();
              const btn = elsBtn?.[0];
              btn?.click();
              notifications.show({
                icon: <IconCaretUp />,
                color: "blue",
                title: "Pulled to top",
                message: (
                  <Text>
                    <Text fw={700}>{target.textContent}</Text>will be at the top
                    of the list soon or another.
                  </Text>
                ),
              });
            },
            delete: async () => {
              notifications.show({
                id: "ctx",
                message: "Deleting an item...",
              });
              const parent = target.parentElement!;
              const title = target.textContent;
              target.click();
              const els = await handlers.wait?.(parent, "button", 3);
              if (!els?.length) return handlers.bail?.();
              const del = els[els.length - 1];
              del.click();
              const els2 = await handlers.wait?.(parent, "button", 2);
              if (!els2?.length) return handlers.bail?.();
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
                      icon={<IconX size={12} />}
                      onClick={handlers.close}
                      color="indigo"
                    >
                      Close
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      icon={<IconMessage size={12} />}
                      onClick={handlers.click}
                      color="indigo"
                    >
                      Open
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconEdit size={12} />}
                    onClick={handlers.edit}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconShare2 size={12} />}
                    onClick={handlers.share}
                  >
                    Share...
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCopy size={12} />}
                    onClick={handlers.copyUrl}
                  >
                    Copy URL
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCaretUp size={12} />}
                    onClick={handlers.pullToTop}
                  >
                    Pull to top
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconTrash size={12} />}
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
