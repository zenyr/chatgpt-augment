import { MutationWatcher } from "@/comp/MutationWatcher";
import { Group, MantineProvider, Text } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import json from "../package.json";
import { InputWatcher } from "./comp/InputWatcher";
import { SelectionWatcher } from "./comp/SelectionWatcher";

type Props = { html: string };
export const MiniApp = ({ html }: Props) => {
  const [visible, toggle] = useToggle([true, false]);
  return (
    <MantineProvider>
      <Group spacing="xs" align="center" position="center">
        <span
          className="app"
          style={{ display: visible ? "block" : "none" }}
          id="chatgpt-augment-app"
        >
          <Text
            variant="gradient"
            style={{ lineHeight: "initial" }}
            onClick={() => toggle()}
          >
            ChatGPT Augment Online. v{json.version}
          </Text>
        </span>
        <span
          className="org"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ display: !visible ? "inline-block" : "none" }}
          onClick={() => toggle()}
        />
        <SelectionWatcher />
        <MutationWatcher />
        <InputWatcher />
        <Notifications />
      </Group>
    </MantineProvider>
  );
};
