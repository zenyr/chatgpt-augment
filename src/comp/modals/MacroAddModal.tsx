import { ClassNames } from "@emotion/react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Group,
  Kbd,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import {
  IconEditCircle,
  IconEraser,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  MouseEvent,
  SyntheticEvent,
  forwardRef,
  useCallback,
  useState,
} from "react";

const CUTOFF = 40;

type ItemProps = {
  prompt: string;
  value: string;
};
const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ value, prompt, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap align="center" position="apart">
        <Text weight="700">{value}</Text>
        <Text color="dimmed" size="xs">
          {prompt}
        </Text>
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
    (e: SyntheticEvent) => (
      e.preventDefault(), onConfirm(trueShortcut, prompt)
    ),
    [trueShortcut, prompt, onConfirm]
  );
  const handleDelete = useCallback(
    (e: MouseEvent) => (e.preventDefault(), onDelete(trueShortcut)),
    [trueShortcut]
  );
  const handleClear = useCallback(
    (e: MouseEvent) => (e.preventDefault(), setPrompt(""), setShortcut("")),
    []
  );
  const handleShortcutPick = useCallback(
    (item: AutocompleteItem) => {
      const shortcut = item.value;
      const matching = macros[shortcut];
      if (matching) {
        setPrompt(matching);
      }
    },
    [macros]
  );
  const exists = opened && macros[trueShortcut];
  const data = Object.entries(macros).map(([key, value]) => ({
    prompt: `${value.slice(0, CUTOFF)}${value.length > CUTOFF ? "..." : ""}`,
    value: key,
  }));
  data.sort((a, b) => a.value.localeCompare(b.value));

  return (
    <ClassNames>
      {({ css }) => (
        <Modal
          title={
            <Text size="xl" fw={500}>
              Add a macro
            </Text>
          }
          size="auto"
          opened={opened}
          onClose={onCancel}
          centered
          overlayProps={{ blur: 3 }}
          scrollAreaComponent={ScrollArea.Autosize}
          classNames={{
            content: css`
              min-width: 50vw;
              user-select: none;
              input,
              textarea {
                user-select: text;
              }
            `,
          }}
        >
          <Stack spacing="xs">
            <Text size="xs" color="dimmed">
              Add commonly used prompts.
            </Text>
            <Autocomplete
              label="Shortcut"
              placeholder="smh"
              withAsterisk
              value={trueShortcut}
              onChange={setShortcut}
              limit={data.length}
              classNames={{
                dropdown: css`
                  max-height: 200px;
                  overflow: auto;
                `,
              }}
              onItemSubmit={handleShortcutPick}
              itemComponent={AutoCompleteItem}
              withinPortal
              data={data}
              variant="filled"
            />
            {exists ? (
              <Text size="xs" color="dimmed">
                <Kbd>{trueShortcut}</Kbd> already exists. Do you want to{" "}
                <Text
                  component="a"
                  href="#"
                  fw={700}
                  onClick={handleDelete}
                  c="red"
                >
                  <IconTrash
                    size=".7rem"
                    style={{ display: "inline-block", marginBottom: 2 }}
                  />{" "}
                  delete
                </Text>{" "}
                it? Or{" "}
                <Text
                  component="a"
                  href="#"
                  fw={700}
                  c="green"
                  onClick={handleConfirm}
                >
                  <IconEditCircle
                    size=".7rem"
                    style={{ display: "inline-block", marginBottom: 2 }}
                  />{" "}
                  overwrite
                </Text>{" "}
                it with the prompt below.
              </Text>
            ) : null}
            <Textarea
              variant="filled"
              placeholder="Shake my head."
              label="Prompt"
              data-autofocus
              value={prompt}
              onChange={(e) => setPrompt(e.currentTarget.value)}
              autosize
              minRows={4}
              maxRows={8}
            />
            <Text size="xs" color="dimmed">
              Once added, select a text in the text field and{" "}
              <Text component="code" color="white">
                Ctrl/Cmd + E
              </Text>{" "}
              to expand.
            </Text>
            <Text size="xs" color="dimmed">
              if{" "}
              <Text component="code" color="cyan">
                :cursor:
              </Text>{" "}
              is found, your cursor will be placed there.
            </Text>
            <Group spacing="xs" position="apart">
              <Group spacing="xs">
                <Button
                  radius="xs"
                  color="red"
                  variant="outline"
                  onClick={onCancel}
                  leftIcon={<IconX />}
                >
                  Cancel
                </Button>
                <Button
                  radius="xs"
                  color="orange"
                  variant="subtle"
                  onClick={handleClear}
                  disabled={!prompt && !trueShortcut}
                  leftIcon={<IconEraser />}
                >
                  Clear
                </Button>
              </Group>
              <Button
                radius="xs"
                variant="light"
                color={exists ? "green" : "blue"}
                onClick={handleConfirm}
                disabled={!trueShortcut || !prompt}
                leftIcon={
                  exists ? <IconEditCircle stroke={1.5} /> : <IconPlus />
                }
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
