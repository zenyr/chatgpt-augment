import { ClassNames } from "@emotion/react";
import {
  Badge,
  ColorSchemeProvider,
  Group,
  MantineProvider,
  Text,
  Tooltip,
  Transition,
  createEmotionCache,
} from "@mantine/core";
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

const container = document.getElementsByTagName("head")[0];
let cache = createEmotionCache({ key: "cgpt-agmt", container });

export const App = () => {
  const [colorScheme, setTheme] = useCgptColorScheme();

  const [mounted, setMounted] = useState(false);
  const [tgt, __html] = useRootAnchor();

  const { width, height } = useElsUpdater(); // updates els on mutation
  const isWide = width > 600;
  const wrapperStyle = useMemo(
    () =>
      ({
        userSelect: "none",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      } as const),
    []
  );
  useEffect(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  }, [tgt]);
  return (
    <div style={{ width, height, position: "relative" }}>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={(theme) =>
          setTheme(theme || ("system" as unknown as "light"))
        }
      >
        <MantineProvider emotionCache={cache!} theme={{ colorScheme }}>
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
                  <ClassNames>
                    {({ css }) => (
                      <Tooltip
                        label={
                          <Text
                            component={Balancer}
                            size="xs"
                            dangerouslySetInnerHTML={{ __html }}
                          />
                        }
                        classNames={{
                          tooltip: css`
                            max-width: "90vw";
                            white-space: "pre-wrap";
                          `,
                        }}
                        withArrow
                        withinPortal
                      >
                        <Badge
                          variant="gradient"
                          size="xs"
                          fw={500}
                          className={css`
                            opacity: 0.5;
                            text-transform: initial;
                            transition: opacity 1s;
                            &:hover {
                              opacity: 1;
                            }
                          `}
                        >
                          {isWide && `ChatGPT Augment `}v{version}
                        </Badge>
                      </Tooltip>
                    )}
                  </ClassNames>
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
    </div>
  );
};
