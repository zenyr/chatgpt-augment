import { getTokenLength } from "@/lib/tokenizer";
import { Chip } from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { MouseEvent, useCallback, useLayoutEffect, useMemo } from "react";

export const InputWatcher = () => {
  const [text, setText] = useLocalStorage({
    key: "prompt",
    defaultValue: "",
    getInitialValueInEffect: true,
  });

  const [debouncedText] = useDebouncedValue(text, 100);
  const length = useMemo(() => getTokenLength(debouncedText), [debouncedText]);
  const handleBadgeClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = document.querySelector("form textarea") as HTMLTextAreaElement;
      if (!el) return;
      if (el.value === text) return;
      notifications.show({
        color: "blue",
        title: "Restored a recent prompt",
        message: `Because they want you to forget the past everytime`,
      });
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.focus();
    },
    [text]
  );

  useLayoutEffect(() => {
    // listen for input
    const el = document.querySelector("form textarea") as HTMLTextAreaElement;
    if (!el) return;
    const handler = (e: Event) => {
      const { value } = e.currentTarget as HTMLTextAreaElement;
      setText(value);
    };

    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

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
