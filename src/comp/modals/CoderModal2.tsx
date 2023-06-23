import { useCoder } from "@/lib/hooks/useCoder2";
import { ClassNames } from "@emotion/react";
import {
  ActionIcon,
  Button,
  Group,
  Indicator,
  Modal,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { IconArrowBackUp, IconCode, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { Coder2Files } from "../coder2/Files";
import { Coder2Main } from "../coder2/Main";
import { Coder2Prepare } from "../coder2/Prepare";

export const CoderModal2 = () => {
  const [askClose, askCloseHandler] = useToggle();
  const [opened, modalHandlers] = useDisclosure(false);
  const [step, reset, files] = useCoder((s) => [
    s.step,
    s.handlers.reset,
    s.files,
  ]);

  useEffect(() => reset, [opened]);

  return (
    <>
      <Tooltip label="Coder (beta)" withArrow>
        <ActionIcon
          onClick={modalHandlers.open}
          size="sm"
          color="gray"
          variant="filled"
          radius="xl"
        >
          <IconCode size={14} />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={askClose}
        onClose={askCloseHandler}
        size="xs"
        title={
          <Text size="xl" fw={500}>
            Are you sure you want to close Coder?
          </Text>
        }
        centered
      >
        <Group noWrap spacing="xs" position="apart">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => askCloseHandler(false)}
            leftIcon={<IconArrowBackUp />}
          >
            Cancel
          </Button>
          <Button
            variant="subtle"
            color="red"
            onClick={() => (modalHandlers.close(), askCloseHandler(false))}
            leftIcon={<IconX />}
          >
            Close
          </Button>
        </Group>
      </Modal>
      <ClassNames>
        {({ css }) => (
          <Modal
            opened={opened && !askClose}
            onClose={askCloseHandler}
            title={
              <Text size="xl" fw={500}>
                ChatGPT Coder
              </Text>
            }
            size="xl"
            overlayProps={{ blur: 1 }}
            closeOnClickOutside
            closeOnEscape
            centered
            className={css`
              user-select: none;
              input,
              textarea {
                user-select: initial;
              }
              [type="checkbox"]:checked {
                background-image: initial;
              }
            `}
          >
            <Group align="stretch" h="70vh" noWrap>
              {files.length && (
                <Paper p="xs" style={{ flex: 1 }}>
                  <Coder2Files />
                </Paper>
              )}
              <Paper p="xs" style={{ flex: 3 }}>
                {step === 1 && <Coder2Prepare />}
                {step === 2 && <Coder2Main />}
              </Paper>
            </Group>
          </Modal>
        )}
      </ClassNames>
    </>
  );
};
