import { useDisclosure } from "@mantine/hooks";
import { store } from "./useElements";
import { useMemo } from "react";
import { serializeMessageElement } from "@/lib/messageSerializer";

export const useMessageSerializer = () => {
  const [els] = store((s) => [s.container.conversations]);
  const [opened, setOpened] = useDisclosure(false);

  const handlers = useMemo(
    () => ({
      close: setOpened.close,
      open: setOpened.open,
    }),
    []
  );
  const data = useMemo(
    () =>
      els
        ? (els.map(serializeMessageElement).filter(Boolean) as [
            boolean,
            string
          ][])
        : [],
    [els]
  );
  return { data, opened, handlers };
};
