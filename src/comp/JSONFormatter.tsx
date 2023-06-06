import {
  ActionIcon,
  Button,
  Group,
  JsonInput,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconJson } from "@tabler/icons-react";

export const JSONFormatter = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ActionIcon onClick={open} size="sm" color="gray" variant="filled">
        <IconJson size={16} />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        title="Enter JSON to format it"
        overlayProps={{ blur: 3 }}
        centered
      >
        <Stack spacing="xs">
          <JsonInput minRows={10} formatOnBlur />
          <Text color="gray" fs="italic">
            Seriously, that's it for now.
          </Text>
          <Group noWrap spacing="xs">
            <Button variant="outline" color="gray" onClick={close}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
