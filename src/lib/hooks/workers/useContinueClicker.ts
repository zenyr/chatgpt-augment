import { useInterval } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { store } from "./useElements";

const CLICKER_DEFAULT = 50;

export const useContinueClicker = () => {
  const [node, regen, container, t, submitText, isStreaming] = store((s) => [
    s.button.continue,
    s.button.regen,
    s.container.continue,
    s.changeT,
    s.handlers.submitText,
    s.computed.isStreaming(),
  ]);
  const [seconds, setSeconds] = useState(50);
  const [className, setClassName] = useState("");
  const { start, stop, active } = useInterval(
    () => setSeconds((s) => Math.max(0, s - 1)),
    100
  );
  const handleStop = useCallback(() => {
    stop();
    setSeconds(CLICKER_DEFAULT * 2);
  }, [stop]);
  const handleForceContinue = useCallback(
    () => submitText("Continue"),
    [submitText]
  );

  const secondsText = active ? `${(seconds / 10).toFixed(1)}` : "";

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
    if (!regen) return;
    const newClassName = regen.className
      .split(" ")
      .filter((c) => c !== "-z-0")
      .join(" ");
    if (className !== newClassName) setClassName(newClassName);
  }, [regen, className]);
  useEffect(() => {
    if (active && node && seconds <= 0) {
      node.click();
    }
  }, [seconds, node, active]);

  return {
    secondsText,
    handleStop,
    handleForceContinue,
    node,
    container,
    active,
    isStreaming,
    className,
  } as const;
};
