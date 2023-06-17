import { ClassNames } from "@emotion/react";
import {
  Autocomplete,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { MouseEvent, forwardRef, useCallback, useState } from "react";

type ItemProps = {
  prompt: string;
  value: string;
};
const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ value, prompt, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap align="center" position="apart">
        <Text weight="700">{value}</Text>
        <Text color="dimmed">{prompt}</Text>
      </Group>
    </div>
  )
);

function createAbbreviation(input: string): string {
  const words = input.split(/\s+/); // Split input into an array of words
  const abbreviation = words
    .map((word) => word.charAt(0).toLowerCase()) // Get the first letter of each word and capitalize it
    .join(""); // Join the first letters together

  return abbreviation;
}

type Props = {
  opened: boolean;
  macros: Record<string, string>;
  onConfirm(key: string, value: string): void;
  onDelete(key: string): void;
  onCancel(): void;
  initialPrompt: string;
};
export const MacroAddModal = ({
  opened,
  macros,
  onConfirm,
  onDelete,
  onCancel,
  initialPrompt,
}: Props) => {
  const [shortcut, setShortcut] = useState(createAbbreviation(initialPrompt));
  const [prompt, setPrompt] = useState(initialPrompt);
  const trueShortcut = shortcut.toLocaleLowerCase();
  const handleConfirm = useCallback(
    () => onConfirm(trueShortcut, prompt),
    [trueShortcut, prompt, onConfirm]
  );
  const handleDelete = useCallback(
    (e: MouseEvent) => (e.preventDefault(), onDelete(trueShortcut)),
    [trueShortcut]
  );
  const handleShortcutBlur = useCallback(() => {
    const matching = macros[shortcut];
    if (matching && !prompt) {
      setPrompt(matching);
    }
  }, [shortcut, prompt]);
  const exists = opened && macros[trueShortcut];
  const data = Object.entries(macros).map(([key, value]) => ({
    prompt: `${value.slice(0, 30)}${value.length > 30 ? "..." : ""}`,
    value: key,
  }));

  return (
    <ClassNames>
      {({ css }) => (
        <Modal
          title="Add a Macro"
          size="auto"
          opened={opened}
          onClose={onCancel}
          centered
          overlayProps={{ blur: 3 }}
          scrollAreaComponent={ScrollArea.Autosize}
          classNames={{
            content: css`
              user-select: none;
              input,
              textarea {
                user-select: text;
              }
            `,
          }}
        >
          <Stack spacing="xs">
            <Text size="xs" color="gray">
              Add commonly used prompts as you wish.
            </Text>
            <Autocomplete
              label="Shortcut"
              placeholder="smh"
              withAsterisk
              value={trueShortcut}
              onChange={setShortcut}
              onBlur={handleShortcutBlur}
              itemComponent={AutoCompleteItem}
              data={data}
              variant="filled"
              error={
                exists ? (
                  <Text>
                    {trueShortcut} already exists. Do you want to{" "}
                    <Text
                      component="a"
                      href="#"
                      fw={700}
                      onClick={handleDelete}
                    >
                      delete
                    </Text>{" "}
                    it?
                  </Text>
                ) : null
              }
            />
            <Textarea
              variant="filled"
              placeholder="Shake my head."
              label="Prompt"
              data-autofocus
              value={prompt}
              onChange={(e) => setPrompt(e.currentTarget.value)}
              autosize
              minRows={2}
              maxRows={5}
            />
            <Text size="xs" color="gray">
              Once added, select a text in the text field and{" "}
              <Text component="code" color="white">
                Ctrl/Cmd + E
              </Text>{" "}
              to expand.
            </Text>
            <Text size="xs" color="gray">
              if{" "}
              <Text component="code" color="blue">
                :cursor:
              </Text>{" "}
              is found, your cursor will be placed there.
            </Text>
            <Group spacing="xs" position="apart">
              <Button
                radius="xs"
                color="red"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                radius="xs"
                variant="outline"
                onClick={handleConfirm}
                disabled={!trueShortcut || !prompt}
              >
                {exists ? "Overwrite" : "Add"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </ClassNames>
  );
};
