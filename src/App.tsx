import {
  ColorSchemeProvider,
  Group,
  MantineProvider,
  Text,
  Tooltip,
  Transition,
  createEmotionCache,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import Balancer from "react-wrap-balancer";
import { version } from "../package.json";
import { CoderModal2 } from "./comp/modals/CoderModal2";
import { ClickThrougher } from "./comp/workers/ClickThrougher";
import { ContinueWorker } from "./comp/workers/ContinueClicker";
import { ConversationMenu } from "./comp/workers/ConversationMenu";
import { MessageSerializer } from "./comp/workers/MessageSerializer";
import { TextAreaAugmenter } from "./comp/workers/TextAreaAugmenter";
import { useCgptColorScheme } from "./lib/hooks/useColorScheme";
import { useRootAnchor } from "./lib/hooks/useTarget";
import { useElsUpdater } from "./lib/hooks/workers/useElements";

const cache = createEmotionCache({
  key: "cgpt-agmt",
  insertionPoint: document.body,
});

export const App = () => {
  const [colorScheme, setTheme] = useCgptColorScheme();

  const [mounted, setMounted] = useState(false);
  const isWide = useViewportSize().width > 600;
  const [tgt, __html] = useRootAnchor();

  const { width } = useElsUpdater(); // updates els on mutation
  const wrapperStyle = useMemo(
    () =>
      ({
        width,
        userSelect: "none",
        backdropFilter: "blur(3px)",
        position: "relative",

        zIndex: 1,
        background:
          colorScheme === "dark"
            ? "rgb(52, 53, 64 , 0.5)"
            : "rgb(255, 255, 255, 0.5)",
      } as const),
    [colorScheme, width]
  );
  useEffect(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  }, [tgt]);
  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={(theme) =>
        setTheme(theme || ("system" as unknown as "light"))
      }
    >
      <MantineProvider emotionCache={cache} theme={{ colorScheme }}>
        <Group style={wrapperStyle} align="center" position="center">
          <Transition
            mounted={!!width && mounted}
            transition="pop"
            duration={500}
            exitDuration={100}
            timingFunction="ease"
            keepMounted
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
                <Tooltip
                  label={
                    <Text
                      component={Balancer}
                      size="xs"
                      dangerouslySetInnerHTML={{ __html }}
                    />
                  }
                  styles={{
                    tooltip: { maxWidth: "90vw", whiteSpace: "pre-wrap" },
                  }}
                  withArrow
                  withinPortal
                >
                  <Text variant="gradient" size="sm">
                    {isWide && `ChatGPT Augment `}v{version}
                  </Text>
                </Tooltip>
                <ContinueWorker />
                <ClickThrougher />
                <TextAreaAugmenter />
                <ConversationMenu />
                <MessageSerializer />
                <CoderModal2 />
                {/* BUTTONS / UI HERE */}
              </Group>
            )}
          </Transition>
          <Notifications position="top-right" />
        </Group>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
