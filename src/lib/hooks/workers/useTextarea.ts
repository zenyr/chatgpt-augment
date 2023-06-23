import {
  getHotkeyHandler,
  useDebouncedValue,
  useDisclosure,
  useLocalStorage,
  useTextSelection,
} from "@mantine/hooks";
import {
  MouseEvent,
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { encode } from "../../gpt3TokenizerUnobfuscated";
import { notifications } from "@mantine/notifications";
import {
  IconCodeMinus,
  IconCodeOff,
  IconCodePlus,
  IconEraser,
  IconRotate2,
} from "@tabler/icons-react";
import { getTextExpander } from "../../textExpander";
import { useJson } from "../useJson";

const getLastWordAndSelect = (el: HTMLTextAreaElement) => {
  const { value, selectionStart } = el;
  const before = value.slice(0, selectionStart);
  const beforeWords = before.split(/\s/);
  const lastWord = beforeWords[beforeWords.length - 1];
  el.selectionStart = selectionStart - lastWord.length;
  el.selectionEnd = selectionStart;
  return lastWord;
};

// communicate with textarea
export const useTextAreaAugmentaion = (textarea: HTMLTextAreaElement) => {
  const [savedText, setSavedText] = useLocalStorage({
    key: "prompt",
    defaultValue: "",
  });
  const [text, setText] = useState(savedText);
  const [debouncedText] = useDebouncedValue(text, 100);
  const [openTokens, setOpenTokens] = useState(false);

  // const length = useMemo(() => getTokenLength(debouncedText), [debouncedText]);
  const tokens = useMemo(() => encode(debouncedText), [debouncedText]);

  useEffect(
    () => void (debouncedText && setSavedText(debouncedText)),
    [debouncedText]
  );

  const handleBadgeClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = textarea;
      if (!el) return;
      if (el.value === savedText) return;
      notifications.show({
        icon: createElement(IconRotate2),
        color: "blue",
        title: "Restored a recent prompt",
        message: `Because they want you to forget the past everytime`,
      });
      el.value = savedText;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus();
    },
    [savedText, textarea]
  );
  const handleTextOptimized = useCallback(
    (text: string) => {
      setText(text);
      const el = textarea;
      if (!el) return;
      if (el.value === text) return;
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [textarea]
  );

  useLayoutEffect(() => {
    // listen for input
    const el = textarea;
    if (!el) return;
    const handler = (e: Event) => {
      const { value } = e.currentTarget as HTMLTextAreaElement;
      if (e.type === "focus" && !value) return; // protect against accidental deletion
      setText(value);
    };
    setText(el.value);
    el.addEventListener("input", handler);
    el.addEventListener("focus", handler);
    return () => (
      el.removeEventListener("input", handler),
      el.removeEventListener("focus", handler)
    );
  }, [textarea]);

  const selection = useTextSelection();
  const [openAddmodal, { open, close }] = useDisclosure(false);
  const { json, set, remove } = useJson();
  const delRef = useRef<string | null>(null);

  const handleConfirm = useCallback(
    (key: string, value: string) => {
      notifications.show({
        icon: createElement(IconCodePlus),
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
        icon: createElement(IconCodeMinus),
        color: "red",
        title: "Deleted a macro",
        message: `${key} is now a goner.`,
      }),
      remove(key)
    ),
    [remove]
  );
  const handleClearText = useCallback(() => {
    const el = textarea;
    if (!el) return;
    if (!el.value && !!delRef.current) {
      notifications.show({
        icon: createElement(IconRotate2),
        title: "Restored text",
        message: `Because everybody deserves a second chance`,
      });
      el.value = delRef.current;
    } else {
      notifications.show({
        icon: createElement(IconEraser),
        color: "red",
        title: "Cleared text",
        message: `Because delete key needs some rest`,
      });
      delRef.current = el.value;
      el.value = "";
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => el.focus(), 0);
  }, [textarea]);

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
      const el = textarea;
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
    [selection, textarea]
  );

  useLayoutEffect(() => {
    const el = textarea;
    if (!el) return;
    const handler = getHotkeyHandler([
      [
        "mod+e",
        async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const text = selection?.toString() || getLastWordAndSelect(el) || "";

          const expanded = textExpander(text);
          if (expanded instanceof Error) {
            notifications.show({
              icon: createElement(IconCodeOff),
              color: "black",
              title: "Could not expand text",
              message: expanded.message,
            });
            return console.log(expanded);
          }
          if (expanded === text) {
            notifications.show({
              icon: createElement(IconCodeOff),
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
  }, [selection, textExpander, textarea]);

  return {
    tokens,
    handleBadgeClick,
    openTokens,
    setOpenTokens,
    handleTextOptimized,
    handleClearText,
    json,
    openAddmodal,
    handleConfirm,
    handleDelete,
    open,
    close,
    selection,
    items,
    handleSelect,
  };
};
