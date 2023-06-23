import { useLocalStorage } from "@mantine/hooks";
import { useCallback, useMemo } from "react";
import { safeParseJson } from "../utils";

export const useJson = (key = "store") => {
  const [str, setStr] = useLocalStorage({
    key,
    defaultValue: "{}",
    getInitialValueInEffect: true,
  });
  const json = useMemo(() => safeParseJson(str), [str]);
  const set = useCallback(
    (key: string, value: string) =>
      setStr((s) => {
        const json = safeParseJson(s);
        json[key] = value;
        return JSON.stringify(json);
      }),
    []
  );
  const remove = useCallback(
    (key: string) =>
      setStr((s) => {
        const json = safeParseJson(s);
        delete json[key];
        return JSON.stringify(json);
      }),
    []
  );

  return { json, set, remove };
};
