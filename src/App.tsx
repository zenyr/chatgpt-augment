import { MutationWatcher } from "@/comp/MutationWatcher";
import {
  ColorSchemeProvider,
  Group,
  MantineProvider,
  Portal,
  Text,
  Transition,
  createEmotionCache,
} from "@mantine/core";
import { useToggle, useViewportSize } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import json from "../package.json";
import { ClickThrougher } from "./comp/ClickThrougher";
import { ConversationMenu } from "./comp/ConversationMenu";
import { InputWatcher } from "./comp/InputWatcher";
import { JSONFormatter } from "./comp/JSONFormatter";
import { SelectionWatcher } from "./comp/SelectionWatcher";
import { useCgptColorScheme } from "./lib/hooks/useColorScheme";
import { useElements } from "./lib/hooks/useElements";
import { useRootTarget } from "./lib/hooks/useTarget";

const cache = createEmotionCache({
  key: "cgpt-agmt",
  insertionPoint: document.body,
});

export const App = () => {
  const [colorScheme, setTheme] = useCgptColorScheme();
  const [target, orgHtml] = useRootTarget("form + div");
  const [mounted, setMounted] = useState(false);
  const [visible, toggle] = useToggle([true, false]);
  const isWide = useViewportSize().width > 500;
  const { textarea, parent } = useElements();
  useEffect(() => {
    if (!target) setMounted(false);
    setTimeout(() => setMounted(true), 100);
  }, [target]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={(theme) =>
        setTheme(theme || ("system" as unknown as "light"))
      }
    >
      <MantineProvider emotionCache={cache} theme={{ colorScheme }}>
        {target && (
          <Portal target={target}>
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
                    dangerouslySetInnerHTML={{ __html: orgHtml }}
                  />
                  <Group
                    style={{ display: visible ? "flex" : "none" }}
                    noWrap
                    spacing="xs"
                    align="center"
                    position="center"
                  >
                    <MutationWatcher />
                    {textarea && <InputWatcher textarea={textarea} />}
                    {textarea && <SelectionWatcher textarea={textarea} />}
                    <JSONFormatter />
                  </Group>
                </Group>
              )}
            </Transition>
          </Portal>
        )}
        {mounted && parent && <ClickThrougher parent={parent} />}
        <ConversationMenu />
        <Notifications position="top-right" />
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
