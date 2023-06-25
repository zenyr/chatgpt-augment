import { useContinueClicker } from "@/lib/hooks/workers/useContinueClicker";
import { Portal, Tooltip } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  IconMessageBolt,
  IconPlayerStop,
  IconPlayerTrackNext,
} from "@tabler/icons-react";

export const ContinueWorker = () => {
  const {
    secondsText,
    handleStop,
    handleForceContinue,
    node,
    container,
    active,
    isStreaming,
    className,
  } = useContinueClicker();
  const isNarrow = useViewportSize().width <= 768;
  const stroke = isNarrow ? 2 : 1;
  return (
    <>
      {node ? (
        <Portal target={node}>
          <div className="flex w-full gap-2 items-center justify-center">
            <IconPlayerTrackNext stroke={stroke} size={16} />
            <span style={{ display: !isNarrow ? "inline" : "none" }}>
              Continue{active && " in "}
            </span>
            <span
              style={{
                display: active || !isNarrow ? "inline" : "none",
                fontFamily: "monospace",
              }}
            >
              {secondsText}
            </span>
          </div>
        </Portal>
      ) : null}
      {container ? (
        <Portal target={container} style={{ height: "100%", display: "flex" }}>
          {active ? (
            <button className={className} onClick={handleStop}>
              <div className="flex w-full gap-2 items-center justify-center">
                <IconPlayerStop stroke={stroke} size={16} />
                Stop
              </div>
            </button>
          ) : (
            <Tooltip label="Say 'Continue' to force another answer" withArrow>
              <button
                className={className}
                onClick={handleForceContinue}
                disabled={isStreaming}
              >
                <div className="flex w-full gap-2 items-center justify-center">
                  <IconMessageBolt stroke={stroke} size={16} />
                  {!isNarrow && "More"}
                </div>
              </button>
            </Tooltip>
          )}
        </Portal>
      ) : null}
    </>
  );
};
