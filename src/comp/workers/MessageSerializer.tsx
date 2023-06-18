import { useSelectors } from "@/lib/hooks/useTarget";
import { serializeMessageElement } from "@/lib/messageSerializer";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconMessages } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { SerializerModal } from "../modals/SerializerModal";

export const MessageSerializer = () => {
  const groupEls = useSelectors("main .flex-col .group") || [];
  const [opened, setOpened] = useState(false);

  const handlers = useMemo(
    () => ({
      close: () => setOpened(false),
      open: () => setOpened(true),
    }),
    []
  );
  const data = useMemo(
    () =>
      groupEls.filter(Boolean).map(serializeMessageElement) as [
        boolean,
        string
      ][],
    [groupEls]
  );
  return (
    <>
      {data && (
        <SerializerModal opened={opened} data={data} onClose={handlers.close} />
      )}
      <Tooltip label="Messages" withArrow>
        <ActionIcon
          onClick={handlers.open}
          size="sm"
          color="gray"
          variant="filled"
          radius="xl"
        >
          <IconMessages size={14} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};
