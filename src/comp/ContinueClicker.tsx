import { Button } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

type Props = { node: HTMLElement; done: () => void };

const DEFAULT = 50;
export const ContinueClicker = ({ node, done }: Props) => {
  const [seconds, setSeconds] = useState(DEFAULT);
  const { start, stop } = useInterval(() => setSeconds((s) => s - 1), 100);
  const orgTextRef = useRef<string | null>(null);

  useEffect(() => {
    orgTextRef.current = node.innerHTML;
    setSeconds(DEFAULT);
    start();
    return stop;
  }, []);

  useEffect(() => {
    node.innerHTML = `Continue in ${(seconds / 10).toFixed(1)}`;
    if (seconds === 0) {
      node.click();
      done();
    }
  }, [seconds, done]);
  return (
    <Button
      onClick={() => (stop(), (node.innerHTML = "Continue"), done())}
      variant="filled"
    >
      Cancel
    </Button>
  );
};
