import { getTokenLength } from "@/lib/tokenizer";
import { Chip } from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type Props = { textarea: HTMLTextAreaElement | null; isEdit?: boolean };
export const InputWatcher = ({ textarea, isEdit }: Props) => {
  const [text, setText] = useState(textarea?.value || "");
  const [debouncedText] = useDebouncedValue(text, 100);
  const [savedText, setSavedText] = useLocalStorage({
    key: "prompt",
    defaultValue: text,
    getInitialValueInEffect: true,
  });
  const length = useMemo(() => getTokenLength(debouncedText), [debouncedText]);

  useEffect(() => setSavedText(debouncedText), [debouncedText]);

  const handleBadgeClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = textarea;
      if (!el) return;
      if (el.value === savedText) return;
      notifications.show({
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

  useLayoutEffect(() => {
    // listen for input
    const el = textarea;
    if (!el) return;
    const handler = (e: Event) => {
      const { value } = e.currentTarget as HTMLTextAreaElement;
      if (!value && !isEdit) return; // protect against accidental deletion
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

  return (
    <Chip
      color={length > 2000 ? "red" : "blue"}
      size="xs"
      variant={length ? "light" : "outline"}
      onClick={handleBadgeClick}
      style={{ cursor: length ? "pointer" : "none" }}
      checked={false}
      title="Restore last text"
    >
      {length} Token{length > 1 && "s"}
    </Chip>
  );
};
