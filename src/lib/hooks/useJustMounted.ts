import { useEffect, useState } from "react";

export const useJustMounted = (delay = 1000) => {
  const [value, setValue] = useState(false);
  useEffect(() => void window.setTimeout(() => setValue(false), delay), []);

  return value;
};
