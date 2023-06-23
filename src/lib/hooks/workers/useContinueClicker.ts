import { useInterval } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { store } from "./useElements";

const CLICKER_DEFAULT = 50;

export const useContinueClicker = () => {
  const [node, container, t] = store((s) => [
    s.button.continue,
    s.container.continue,
    s.changeT,
  ]);
  const [seconds, setSeconds] = useState(50);
  const { start, stop, active } = useInterval(
    () => setSeconds((s) => Math.max(0, s - 1)),
    100
  );
  const handleStop = useCallback(() => {
    stop();
    setSeconds(CLICKER_DEFAULT * 2);
  }, [stop]);

  const secondsText = active
    ? `Continue in ${(seconds / 10).toFixed(1)}`
    : "Continue";

  useEffect(() => {
    if (!node) return;
    setSeconds(CLICKER_DEFAULT);
    node.innerHTML = "";
    const tooSoon = Date.now() - t < 1000;
    if (tooSoon) return;
    start();
    return stop;
  }, [node]);

  useEffect(() => {
    if (active && node && seconds <= 0) {
      node.click();
    }
  }, [seconds, node, active]);

  return [secondsText, handleStop, node, active && container] as const;
};
