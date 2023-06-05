import { getTokenLength } from "@/lib/tokenizer";
import { Badge, Tooltip } from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
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
    const handler = (e: KeyboardEvent) => {
      const { value } = e.currentTarget as HTMLTextAreaElement;
      setText(value);
    };

    el.addEventListener("keyup", handler);
    return () => el.removeEventListener("keyup", handler);
  }, []);

  return (
    <Tooltip label="Restore last text">
      <Badge
        color={length > 2000 ? "red" : "blue"}
        size="xs"
        onClick={handleBadgeClick}
      >
        {length} Tokens
      </Badge>
    </Tooltip>
  );
};
