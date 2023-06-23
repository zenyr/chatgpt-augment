import { useCoder } from "@/lib/hooks/useCoder2";
import { store } from "@/lib/hooks/workers/useElements";
import {
  ActionIcon,
  Button,
  Checkbox,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlayerPlay, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { CoderLanguageSelector } from "./Languages";

export const Coder2Prepare = () => {
  const [isChatNew, isChatGpt4] = store((s) => [
    !s.container.conversations?.length,
    s.button.gptActive === s.button.gpt4,
  ]);
  const [handlers, prepareValues, prepared, questionCount, appName, language] =
    useCoder((s) => [
      s.handlers,
      s.computed.prepareValues,
      s.computed.prepared,
      s.questionCount,
      s.appName,
      s.language,
    ]);

  useEffect(() => useCoder.setState({ isChatNew }), [isChatNew]);
  useEffect(() => useCoder.setState({ isChatGpt4 }), [isChatGpt4]);

  return (
    <Stack align="stretch" justify="space-between" h="100%">
      <Checkbox.Group value={prepareValues} label="Basic preparations">
        <Stack mt="xs">
          <Checkbox
            radius="md"
            value="newchat"
            disabled
            label={
              <Text fw={500}>
                Start a new conversation{" "}
                <Text color="red" span>
                  *
                </Text>
              </Text>
            }
            description={
              <>
                Existing conversation may interfere with the process.
                {!isChatNew && (
                  <Button
                    color="dark"
                    onClick={!isChatNew ? handlers.openNewChat : undefined}
                    compact
                    m="xs"
                  >
                    {" "}
                    Click to start a new conversation.
                  </Button>
                )}
              </>
            }
          />
          <Checkbox
            radius="md"
            value="language"
            disabled
            styles={{ body: { alignItems: "center" } }}
            label={
              <CoderLanguageSelector
                value={language}
                onSelect={handlers.handleLanguage}
              />
            }
          />
          <Checkbox
            radius="md"
            value="appname"
            disabled
            styles={{ body: { alignItems: "center" } }}
            label={
              <TextInput
                label="App name"
                value={appName}
                placeholder="App name"
                onInput={handlers.handleAppName}
                withAsterisk
                rightSection={
                  <ActionIcon onClick={handlers.clearAppName}>
                    <IconX size={12} stroke={1} />
                  </ActionIcon>
                }
              />
            }
          />
          <Checkbox
            radius="md"
            value="questionCount"
            disabled
            styles={{ body: { alignItems: "center" } }}
            label={
              <TextInput
                type="number"
                label="Question count"
                value={questionCount}
                placeholder="Max question count"
                onInput={handlers.handleQuestionCount}
                withAsterisk
              />
            }
          />
          <Checkbox
            radius="md"
            value="chatGpt4"
            color="red"
            label="Using GPT4 may consume/blocked by your quota."
            description="The result will be superior but please proceed with caution."
            onClick={handlers.toggleGpt4Chat}
          />
        </Stack>
      </Checkbox.Group>

      <Button
        style={{ alignSelf: "flex-end" }}
        onClick={handlers.handlePrepared}
        disabled={!prepared}
        leftIcon={<IconPlayerPlay />}
      >
        Start
      </Button>
    </Stack>
  );
};
