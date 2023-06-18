import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";

export const useCgptColorScheme = () => {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">({ key: "theme" });
  const systemScheme = useColorScheme();
  const colorScheme =
    !theme || (theme as string) === "system" ? systemScheme : theme;

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const newScheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      setTheme(newScheme);
    });

    mo.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return [colorScheme, setTheme] as const;
};
