import { textExpander } from "@/lib/textExpander";
import { useTextSelection, getHotkeyHandler } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLayoutEffect } from "react";

export const SelectionWatcher = () => {
  const selection = useTextSelection();

  useLayoutEffect(() => {
    const el = document.querySelector("form textarea") as HTMLTextAreaElement;
    if (!el) return;
    const handler = getHotkeyHandler([
      [
        "mod+e",
        async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!selection) return;
          const text = selection.toString();
          if (!text) return;
          const expanded = textExpander(text);
          if (expanded instanceof Error) {
            notifications.show({
              title: "Could not expand text",
              message: expanded.message,
            });
            return console.log(expanded);
          }
          if (expanded === text) {
            notifications.show({
              title: "Could not expand text",
              message: "No expansion found",
            });
            return;
          }
          if (!expanded) return;
          const target = e.currentTarget as HTMLTextAreaElement;
          const oldValue = target.value;
          const newValue = oldValue.replace(text.trim(), expanded);
          const delta = newValue.length - oldValue.length;
          const { selectionStart, selectionEnd } = target;
          target.value = newValue;
          target.selectionStart = selectionStart;
          target.selectionEnd = selectionEnd + delta;
        },
      ],
    ]);
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [selection]);
  return null;
};
