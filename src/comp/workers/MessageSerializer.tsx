import { ActionIcon, Tooltip } from "@mantine/core";
import { SerializerModal } from "../modals/SerializerModal";
import { IconMessages } from "@tabler/icons-react";
import { useMessageSerializer } from "@/lib/hooks/workers/useMessageSerializer";

export const MessageSerializer = () => {
  const { data, opened, handlers } = useMessageSerializer();
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
          disabled={!data.length}
        >
          <IconMessages size={14} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};
