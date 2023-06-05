import { getTokenLength } from "@/lib/tokenizer";
import { Badge, Group, Portal } from "@mantine/core";
import { useEffect, useState } from "react";

type Props = { node: HTMLElement; done: () => void };

export const EditWatcher = ({ node }: Props) => {
  const [value, setValue] = useState(() => {
    const el = node.querySelector("textarea") as HTMLTextAreaElement;
    return el?.value || "";
  });
  const target = node.querySelector("div");

  // watch edit messages
  useEffect(() => {
    const el = node.querySelector("textarea") as HTMLTextAreaElement;
    if (!el) return;
    const handler = (e: Event) => {
      const { value } = e.currentTarget as HTMLTextAreaElement;
      setValue(value);
    };
    el.addEventListener("input", handler);

    // install token counter
    return () => el.removeEventListener("input", handler);
  }, []);
  return target ? (
    <Portal target={target}>
      <Group m="xs" align="center">
        <Badge variant="filled" color="gray">
          {getTokenLength(value)} Tokens
        </Badge>
      </Group>
    </Portal>
  ) : null;
};
