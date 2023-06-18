import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";

export const useCgptColorScheme = () => {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">({ key: "theme" });
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const systemScheme = useColorScheme();
  const colorScheme =
    override ||
    (!theme || (theme as string) === "system" ? systemScheme : theme);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const newScheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      setOverride(newScheme);
    });

    mo.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return [colorScheme, setTheme] as const;
};
