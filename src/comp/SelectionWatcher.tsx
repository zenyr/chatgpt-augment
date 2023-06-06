import { useFormElements } from "@/lib/hooks/useFormElements";
import { useJson } from "@/lib/hooks/useJson";
import { getTextExpander } from "@/lib/textExpander";
import { ActionIcon, Select } from "@mantine/core";
import {
  getHotkeyHandler,
  useDisclosure,
  useTextSelection,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { MacroAddModal } from "./MacroAddModal";

export const SelectionWatcher = () => {
  const selection = useTextSelection();
  const [openAddmodal, { open, close }] = useDisclosure(false);
  const { json, set, remove } = useJson();
  const elements = useFormElements();
  const delRef = useRef<string | null>(null);

  const handleConfirm = useCallback(
    (key: string, value: string) => {
      notifications.show({
        color: "blue",
        title: "Added a macro",
        message: `Shorthand: ${key}`,
      }),
        set(key, value);
      close();
    },
    [set, close]
  );
  const handleDelete = useCallback(
    (key: string) => (
      notifications.show({
        color: "red",
        title: "Deleted a macro",
        message: `${key} is now a goner.`,
      }),
      remove(key)
    ),
    [remove]
  );
  const handleClearText = useCallback(() => {
    const el = elements.textarea;
    if (!el) return;
    if (!el.value && !!delRef.current) {
      notifications.show({
        title: "Restored text",
        message: `Because everybody deserves a second chance`,
      });
      el.value = delRef.current;
    } else {
      notifications.show({
        color: "red",
        title: "Cleared text",
        message: `Because delete key needs some rest`,
      });
      delRef.current = el.value;
      el.value = "";
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => el.focus(), 0);
  }, []);

  const items = useMemo(
    () =>
      Object.entries(json).map(([key, value]) => ({
        label: key,
        value: value as string,
      })),
    [json]
  );

  const textExpander = useMemo(() => getTextExpander(json), [json]);
  const handleSelect = useCallback(
    (value: string) => {
      if (!value) return;
      const el = elements.textarea;
      if (!el) return;
      const { selectionStart, selectionEnd } = el;
      const cursorFound = value.indexOf(":cursor:");

      el.value =
        el.value.slice(0, selectionStart) +
        value.replace(":cursor:", "") +
        el.value.slice(selectionEnd);
      if (cursorFound !== -1) {
        el.selectionStart = selectionStart + cursorFound;
        el.selectionEnd = selectionStart + cursorFound;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(() => el.focus(), 0);
    },
    [selection]
  );

  useLayoutEffect(() => {
    const el = elements.textarea;
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
              color: "black",
              title: "Could not expand text",
              message: expanded.message,
            });
            return console.log(expanded);
          }
          if (expanded === text) {
            notifications.show({
              color: "black",
              title: "Could not expand text",
              message: "No expansion found",
            });
            return;
          }
          if (!expanded) return;
          const target = e.currentTarget as HTMLTextAreaElement;
          const cursorFound = expanded.indexOf(":cursor:");
          const oldValue = target.value;
          const newValue = oldValue.replace(text.trim(), expanded);
          const delta = newValue.length - oldValue.length;
          const { selectionStart, selectionEnd } = target;
          target.value = newValue.replace(":cursor:", "");
          target.selectionStart = selectionStart;
          target.selectionEnd = selectionEnd + delta;
          if (cursorFound !== -1) {
            target.selectionStart = selectionStart + cursorFound;
            target.selectionEnd = selectionStart + cursorFound;
          }
          target.dispatchEvent(new Event("input", { bubbles: true }));
        },
      ],
    ]);
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [selection, textExpander]);
  return (
    <>
      <ActionIcon
        size="sm"
        color="gray"
        variant="filled"
        onClick={handleClearText}
        radius="xl"
      >
        <IconTrash size={12} />
      </ActionIcon>
      <MacroAddModal
        macros={json}
        opened={openAddmodal}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onCancel={close}
        initialPrompt={selection?.toString() || ""}
      />
      <Select
        size="xs"
        radius="lg"
        placeholder="Macros"
        searchable
        nothingFound="No options"
        data={items}
        onChange={handleSelect}
        style={{ maxWidth: 100 }}
      />
      <ActionIcon
        size="sm"
        color="gray"
        variant="filled"
        onClick={open}
        radius="xl"
      >
        <IconPlus size={12} />
      </ActionIcon>
    </>
  );
};
