import { encode } from "@/lib/gpt3TokenizerUnobfuscated";
import { ActionIcon, Badge } from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCircleArrowUp, IconCoin, IconRotate2 } from "@tabler/icons-react";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { TokenReaderModal } from "../modals/TokenReaderModal";

type Props = { textarea: HTMLTextAreaElement | null };
export const InputWatcher = ({ textarea }: Props) => {
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
        icon: <IconRotate2 />,
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

  return (
    <>
      <Badge
        color={tokens.length > 3000 ? "red" : "dark"}
        size="xs"
        style={{ overflow: "visible", padding: "11px 0", border: 0 }}
        leftSection={
          <ActionIcon
            size="sm"
            radius="xl"
            variant="subtle"
            onClick={handleBadgeClick}
            title="Restore last text"
            color="gray"
          >
            <IconCircleArrowUp size={12} />
          </ActionIcon>
        }
        rightSection={
          <ActionIcon
            size="sm"
            radius="xl"
            variant="subtle"
            disabled={!tokens.length}
            onClick={() => setOpenTokens(true)}
            title="Token visualizer"
            color="gray"
          >
            <IconCoin size={12} />
          </ActionIcon>
        }
      >
        {tokens.length.toLocaleString()} Token{tokens.length > 1 && "s"}
      </Badge>
      <TokenReaderModal
        tokens={tokens}
        opened={openTokens}
        onCancel={() => setOpenTokens(false)}
      />
    </>
  );
};
