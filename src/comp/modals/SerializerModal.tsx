import { Modal, Paper, Stack, Text } from "@mantine/core";

type Props = {
  opened: boolean;
  data: [boolean, string][];
  onClose(): void;
};
export const SerializerModal = ({ opened, data, onClose }: Props) => {
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
                <Text size="md">{isUser ? "### User:" : "### Assistant:"}</Text>
                <Text size="sm">{text}</Text>
              </Paper>
            );
          })}
        </Stack>
      </Modal.Body>
    </Modal>
  );
};
