import { safeParseJson } from "@/lib/utils";
import {
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ChangeEvent, useCallback } from "react";

type Props = {
  opened: boolean;
  data: [boolean, string][];
  onClose(): void;
};
const DEFAULT = ["### User:", "### Assistant:"];
export const SerializerModal = ({ opened, data, onClose }: Props) => {
  const [strNames, setStrNames] = useLocalStorage({
    key: "serializer",
    defaultValue: JSON.stringify(DEFAULT),
  });
  const [user, assistant] = safeParseJson(strNames, DEFAULT);
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      const idx = parseInt(e.currentTarget.getAttribute("data-idx") || "0", 10);
      setStrNames((p) => {
        const nP = [...safeParseJson(p, DEFAULT)];
        nP[idx] = v;
        return JSON.stringify(nP);
      });
    },
    [setStrNames]
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={500}>
          Raw message list
        </Text>
      }
      fullScreen
    >
      <Modal.Body>
        <Stack spacing="xs">
          <Group spacing="xs" noWrap align="stretch">
            <TextInput
              label="User"
              value={user}
              onInput={handleInput}
              data-idx="0"
            />
            <TextInput
              label="Assistant"
              value={assistant}
              onInput={handleInput}
              data-idx="1"
            />
          </Group>
          <Paper p="md" withBorder component={ScrollArea} h="80vh">
            <Stack spacing="xs">
              {data.map(([isUser, text], idx) => {
                return (
                  <Paper
                    key={idx}
                    p="md"
                    maw="80%"
                    style={{
                      whiteSpace: "pre-wrap",
                      alignSelf: isUser ? "flex-end" : "flex-start",
                    }}
                    withBorder
                  >
                    <Text size="md">{isUser ? user : assistant}</Text>
                    <Text size="sm">{text}</Text>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        </Stack>
      </Modal.Body>
    </Modal>
  );
};
