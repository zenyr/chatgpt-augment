import {
  ActionIcon,
  Button,
  Group,
  JsonInput,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconJson, IconX } from "@tabler/icons-react";

export const JSONFormatter = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Tooltip label="JSON Formatter" withArrow>
        <ActionIcon
          onClick={open}
          size="sm"
          color="gray"
          variant="filled"
          radius="xl"
        >
          <IconJson size={14} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text size="xl" fw={500}>
            JSON Formatter
          </Text>
        }
        overlayProps={{ blur: 3 }}
        centered
      >
        <Stack spacing="xs">
          <JsonInput minRows={10} formatOnBlur />
          <Text color="dimmed" fs="italic" size="xs">
            Seriously, that's it for now.
          </Text>
          <Group noWrap spacing="xs">
            <Button
              variant="outline"
              color="gray"
              onClick={close}
              leftIcon={<IconX />}
            >
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
