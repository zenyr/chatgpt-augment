import { MutationWatcher } from "@/comp/MutationWatcher";
import {
  ColorSchemeProvider,
  Group,
  MantineProvider,
  Text,
  Transition,
  createEmotionCache,
} from "@mantine/core";
import {
  useColorScheme,
  useLocalStorage,
  useToggle,
  useViewportSize,
} from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import json from "../package.json";
import { ClickThrougher } from "./comp/ClickThrougher";
import { ConversationMenu } from "./comp/ConversationMenu";
import { InputWatcher } from "./comp/InputWatcher";
import { JSONFormatter } from "./comp/JSONFormatter";
import { SelectionWatcher } from "./comp/SelectionWatcher";
import { useElements } from "./lib/hooks/useElements";

const cache = createEmotionCache({
  key: "cgpt-agmt",
  insertionPoint: document.body,
});
type Props = { html: string };
export const MiniApp = ({ html }: Props) => {
  const [visible, toggle] = useToggle([true, false]);
  const [theme, setTheme] = useLocalStorage<"light" | "dark">({ key: "theme" });
  const systemScheme = useColorScheme();
  const colorScheme =
    !theme || (theme as string) === "system" ? systemScheme : theme;
  const [mounted, setMounted] = useState(false);
  const isWide = useViewportSize().width > 500;
  const { textarea } = useElements();
  useEffect(() => {
    setTimeout(() => setMounted(true), 5);
  }, []);
  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={(theme) =>
        setTheme(theme || ("system" as unknown as "light"))
      }
    >
      <MantineProvider emotionCache={cache} theme={{ colorScheme }}>
        <Transition
          mounted={mounted}
          transition="pop"
          duration={2000}
          timingFunction="ease"
        >
          {(styles) => (
            <Group
              style={styles}
              spacing="xs"
              align="center"
              position="center"
              className="cgpt-agmt"
              noWrap
            >
              <Text
                variant="gradient"
                style={{
                  lineHeight: "initial",
                  display: visible ? "block" : "none",
                }}
                onClick={() => toggle()}
                id="chatgpt-augment-app"
              >
                {isWide && `ChatGPT Augment `}v{json.version}
              </Text>
              <Text
                style={{
                  lineHeight: "initial",
                  display: !visible ? "block" : "none",
                }}
                onClick={() => toggle()}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <Group
                style={{ display: visible ? "flex" : "none" }}
                noWrap
                spacing="xs"
                align="center"
                position="center"
              >
                <ClickThrougher />
                <MutationWatcher />
                <InputWatcher textarea={textarea} />
                <SelectionWatcher textarea={textarea} />
                <JSONFormatter />
                <ConversationMenu />
                <Notifications position="top-right" />
              </Group>
            </Group>
          )}
        </Transition>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
