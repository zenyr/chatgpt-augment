import { useCoder } from "@/lib/hooks/useCoder2";
import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  TextInput,
  Textarea,
  TypographyStylesProvider,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { IconHandStop, IconReload } from "@tabler/icons-react";
import { CoderMarkdown } from "../coder2/Markdown";

export const Coder2Main = () => {
  const [
    files,
    currentFile,
    currentMessage,
    questions,
    conversations,
    answers,
    userInput,
    handleAnswerInput,
    handleUserInput,
    stopOrRegenerate,
    submitResponse,
    submitInitialPrompt,
    isBusy,
  ] = useCoder((s) => [
    s.files,
    s.currentFile,
    s.currentMessage,
    s.questions,
    s.conversations,
    s.answers,
    s.userInput,
    s.handlers.handleAnswerInput,
    s.handlers.handleUserInput,
    s.handlers.stopOrRegenerate,
    s.handlers.submitResponse,
    s.handlers.submitInitialPrompt,
    s.isBusy,
  ]);
  const [value, setValue] = useToggle(["message", "file", null]);
  const file = files.find((f) => f.path === currentFile);
  return (
    <Tabs
      value={value}
      onTabChange={setValue}
      h="100%"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Tabs.List>
        <Tabs.Tab value="message">Messages</Tabs.Tab>
        <Tabs.Tab value="file">File - {currentFile || "N/A"}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel
        pt="xs"
        value="message"
        style={{ flex: 1, overflow: "hidden" }}
      >
        <Stack spacing="xs" h="100%">
          <ScrollArea style={{ flex: 1 }}>
            <TypographyStylesProvider>
              <CoderMarkdown md={currentMessage} loading={isBusy} />
            </TypographyStylesProvider>
            <Stack mr="md" w="100%" spacing="md">
              {questions.map((q, i) => (
                <TextInput
                  key={i}
                  placeholder="Your answer (optional)"
                  label={q}
                  value={answers[i]}
                  onInput={handleAnswerInput}
                  data-idx={i}
                />
              ))}
              <Textarea
                label={`${questions.length ? "Additional " : ""}User input`}
                placeholder="(optional)"
                value={userInput}
                disabled={isBusy}
                onChange={handleUserInput}
              />
            </Stack>
          </ScrollArea>
          <Group
            spacing="xs"
            position="right"
            style={{ flexGrow: 0, flexShrink: 0 }}
          >
            {conversations.length === 0 ? null : isBusy ? (
              <Button
                onClick={() => stopOrRegenerate(true)}
                leftIcon={<IconHandStop stroke={1.5} />}
              >
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => stopOrRegenerate(false)}
                leftIcon={<IconReload stroke={1.5} />}
              >
                Regenerate
              </Button>
            )}
            {conversations.length === 0 ? (
              <Button onClick={submitInitialPrompt} disabled={isBusy}>
                Start
              </Button>
            ) : (
              <Button onClick={submitResponse} disabled={isBusy}>
                Submit {questions.length > 0 ? "Answers" : "Review"}
              </Button>
            )}
          </Group>
        </Stack>
      </Tabs.Panel>
      <Tabs.Panel pt="xs" value="file" style={{ flex: 1 }}>
        <ScrollArea>
          {file ? (
            <TypographyStylesProvider>
              <Paper
                withBorder
                component="pre"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {file.content}
              </Paper>
            </TypographyStylesProvider>
          ) : (
            "N/A"
          )}
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
};
