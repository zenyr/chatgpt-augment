import { useDetachment } from "@/lib/hooks/useDetachment";
import { Group, Portal } from "@mantine/core";
import { useRef } from "react";
import { InputWatcher } from "./InputWatcher";
import { SelectionWatcher } from "./SelectionWatcher";

type Props = { node: HTMLElement; done: (node?: HTMLElement) => void };

export const EditWatcher = ({ node, done }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(
    node.querySelector("textarea")
  );
  const portalRef = useRef<HTMLDivElement>(node.querySelector("div"));
  useDetachment(textareaRef.current, done);

  return portalRef.current ? (
    <Portal target={portalRef.current}>
      <Group spacing="xs" m={4} align="center">
        {textareaRef.current && <InputWatcher textarea={textareaRef.current} />}
        {textareaRef.current && (
          <SelectionWatcher textarea={textareaRef.current} isEdit />
        )}
      </Group>
    </Portal>
  ) : null;
};
