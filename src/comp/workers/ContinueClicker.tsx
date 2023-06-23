import { useContinueClicker } from "@/lib/hooks/workers/useContinueClicker";
import { Portal } from "@mantine/core";
import { IconPlayerStop, IconPlayerTrackNext } from "@tabler/icons-react";

export const ContinueWorker = () => {
  const [seconds, stop, node, container] = useContinueClicker();
  return (
    <>
      {node ? (
        <Portal target={node}>
          <div className="flex w-full gap-2 items-center justify-center">
            <IconPlayerTrackNext stroke={1} size={16} />
            {seconds}
          </div>
        </Portal>
      ) : null}
      {container ? (
        <Portal target={container}>
          <button
            className="btn relative btn-neutral -z-0 border-0 md:border"
            onClick={stop}
          >
            <div className="flex w-full gap-2 items-center justify-center">
              <IconPlayerStop stroke={1} size={16} />
              Stop
            </div>
          </button>
        </Portal>
      ) : null}
    </>
  );
};
