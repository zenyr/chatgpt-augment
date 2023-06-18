import { Portal } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { IconHandStop, IconPlayerTrackNext } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

type Props = { node: HTMLElement };

const DEFAULT = 50;
export const ContinueClicker = ({ node }: Props) => {
  const [seconds, setSeconds] = useState(DEFAULT);
  const { start, stop } = useInterval(() => setSeconds((s) => s - 1), 100);
  const orgTextRef = useRef<string | null>(null);
  const parent = node.parentElement!;
  const stopped = seconds > DEFAULT;

  useEffect(() => {
    orgTextRef.current = node.innerHTML;
    setSeconds(DEFAULT);
    node.innerHTML = "";
    start();
    return stop;
  }, []);

  useEffect(() => {
    if (seconds > DEFAULT) return;
    if (seconds <= 0) {
      node.click();
    }
  }, [seconds]);
  return (
    <>
      {!stopped && (
        <Portal target={parent} style={{ display: "inline-flex" }}>
          <button
            className={node.className}
            onClick={() => (stop(), setSeconds(DEFAULT * 2))}
          >
            <IconHandStop stroke={1} size={16} style={{ marginRight: 6 }} />
            Cancel
          </button>
        </Portal>
      )}
      <Portal
        target={node}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <IconPlayerTrackNext stroke={1} size={16} style={{ marginRight: 6 }} />
        Continue
        {!stopped && ` in ${(seconds / 10).toFixed(1)}`}
      </Portal>
    </>
  );
};
