import { MutationWatcher } from "@/comp/MutationWatcher";
import {
  Group,
  MantineProvider,
  Text,
  Transition,
  createEmotionCache,
} from "@mantine/core";
import { useToggle, useViewportSize } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import json from "../package.json";
import { ClickThrougher } from "./comp/ClickThrougher";
import { InputWatcher } from "./comp/InputWatcher";
import { JSONFormatter } from "./comp/JSONFormatter";
import { SelectionWatcher } from "./comp/SelectionWatcher";
import { useFormElements } from "./lib/hooks/useFormElements";

const cache = createEmotionCache({
  key: "cgpt-agmt",
  insertionPoint: document.body,
});
type Props = { html: string };
export const MiniApp = ({ html }: Props) => {
  const [visible, toggle] = useToggle([true, false]);
  const [mounted, setMounted] = useState(false);
  const isWide = useViewportSize().width > 500;
  const { textarea } = useFormElements();
  useEffect(() => {
    setTimeout(() => setMounted(true), 5);
  }, []);
  return (
    <MantineProvider emotionCache={cache} theme={{ colorScheme: "dark" }}>
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
              <Notifications position="top-right" />
            </Group>
          </Group>
        )}
      </Transition>
    </MantineProvider>
  );
};
