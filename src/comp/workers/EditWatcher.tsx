import { Group, Portal } from "@mantine/core";
import { useRef } from "react";
import { InputWatcher } from "./InputWatcher";
import { SelectionWatcher } from "./SelectionWatcher";
import { ClassNames } from "@emotion/react";

type Props = { node: HTMLElement };

export const EditWatcher = ({ node }: Props) => {
  const parent = node.parentElement!;
  const textareaRef = useRef<HTMLTextAreaElement>(
    parent.querySelector("textarea")
  );
  const portalRef = useRef<HTMLDivElement>(parent.querySelector("div"));

  return (
    <ClassNames>
      {({ css }) =>
        portalRef.current && (
          <Portal
            target={portalRef.current}
            className={css`
              position: relative;
              display: flex;
              align-items: center;
            `}
          >
            <Group spacing="xs" m={4} align="center" noWrap position="center">
              {textareaRef.current && (
                <InputWatcher textarea={textareaRef.current} />
              )}
              {textareaRef.current && (
                <SelectionWatcher textarea={textareaRef.current} isEdit />
              )}
            </Group>
          </Portal>
        )
      }
    </ClassNames>
  );
};
