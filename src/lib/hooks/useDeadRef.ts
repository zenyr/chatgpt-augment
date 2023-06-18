import { useEffect, useRef } from "react";

export const useDead = () => {
  const ref = useRef(false);
  useEffect(() => () => void (ref.current = true), []);
  return ref;
};
