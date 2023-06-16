import { decode } from "@/lib/gpt3TokenizerUnobfuscated";
import { ClassNames } from "@emotion/react";
import {
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Switch,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconScissors } from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";

const checkBr = (char: string | number) =>
  char === "\n" ? { display: "flex", flex: 1 } : {};

type Props = { tokens: number[]; opened: boolean; onCancel(): void };
export const TokenReaderModal = ({ tokens, opened, onCancel }: Props) => {
  const parsed = useMemo(
    () => (opened ? tokens.map((t) => [decode([t]), t] as const) : []),
    [tokens, opened]
  );
  const { colorScheme } = useMantineColorScheme();
  const [inverse, setInverse] = useState(false);
  const [slice1000, setSlice1000] = useState(false);
  const [slice100, setSlice100] = useState(true);
  const opacity = (inverse ? 0.2 : 0.1) + (colorScheme === "light" ? 0.2 : 0);
  const theme = useMantineTheme();
  return (
    <ClassNames>
      {({ css }) => (
        <Modal
          title={`Token reader (${tokens.length.toLocaleString()} token${
            tokens.length > 1 && "s"
          })`}
          opened={opened}
          onClose={onCancel}
          centered
          overlayProps={{ blur: 3 }}
          scrollAreaComponent={ScrollArea.Autosize}
          size="lg"
          classNames={{
            content: css`
              user-select: none;
              ruby {
                user-select: text;
                letter-spacing: ${inverse ? -2 : -1}px;
                display: inline-block;
                text-align: center;
                margin-right: ${inverse ? 2 : 0}px;
                border-radius: ${theme.radius.sm};
                font-family: ${inverse ? "monospace" : "inherit"};
                white-space: pre-wrap;
                
                &:nth-of-type(3n) {
                  background: ${theme.fn.rgba(theme.colors.blue[4], opacity)};
                }
                &:nth-of-type(3n + 1) {
                  background: ${theme.fn.rgba(theme.colors.red[4], opacity)};
                }
                &:nth-of-type(3n + 2) {
                  background: ${theme.fn.rgba(theme.colors.violet[4], opacity)};
                }
              }
              rt {
                letter-spacing: ${inverse ? 0 : "inherit"};
                user-select: none;
                pointer-event: none;
                font-family: monospace;
                text-align: center;
                padding: 0 1px;
              }
            `,
          }}
        >
          <Stack spacing="xs">
            <Group position="apart">
              <Switch
                size="xs"
                label="Swap tokens / chars"
                checked={inverse}
                onChange={(e) => setInverse(e.currentTarget.checked)}
              />
              <Switch
                size="xs"
                label="Mark every 100th"
                checked={slice100}
                onChange={(e) => setSlice100(e.currentTarget.checked)}
              />
              <Switch
                size="xs"
                label={`Mark every ${(1000).toLocaleString()}th`}
                checked={slice1000}
                onChange={(e) => setSlice1000(e.currentTarget.checked)}
              />
            </Group>
            <Paper
              p="md"
              withBorder
              className={css`
                background-color: ${theme.fn.primaryShade()};
              `}
            >
              <Text
                size="sm"
                className={css`
                  white-space: pre-wrap;
                  word-break: break-all;
                `}
              >
                {parsed.map(([char, token], i) => (
                  <Fragment key={i}>
                    {i &&
                    ((slice100 && i % 100 === 0) ||
                      (slice1000 && i % 1000 === 0)) ? (
                      <Divider
                        my="xs"
                        variant="dashed"
                        labelPosition="center"
                        label={
                          <>
                            <IconScissors size={12} />
                            <Box ml={5}>{i.toLocaleString()} tokens</Box>
                          </>
                        }
                      />
                    ) : null}
                    <Tooltip
                      label={`Index: ${(
                        i + 1
                      ).toLocaleString()} / Text: "${char}" (${char
                        .charCodeAt(0)
                        .toLocaleString()}) / Token: ${token.toLocaleString()}`}
                      withinPortal
                    >
                      <ruby style={checkBr(char)}>
                        {inverse ? token : char}
                        <rt>{inverse ? char : token}</rt>
                      </ruby>
                    </Tooltip>
                  </Fragment>
                ))}
              </Text>
            </Paper>

            <Text color="dimmed" size="xs" id="tooltip-portal">
              *Non-latin letters / Emojis may be broken down to multiple tokens.
              That's the way it is.
            </Text>
            <Text color="dimmed" size="xs" id="tooltip-portal">
              *This tokenizer is sourced from the{" "}
              <Anchor
                href="https://github.com/openai/GPT-3-Encoder"
                target="_blank"
                rel="noopener noref"
              >
                OpenAI GPT-3 repository
              </Anchor>
              . You can compare the result with{" "}
              <Anchor
                href="https://platform.openai.com/tokenizer"
                rel="noopener noref"
              >
                the official tokenizer.
              </Anchor>
            </Text>

            <Group noWrap spacing="xs">
              <Button variant="outline" color="gray" onClick={onCancel}>
                Close
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </ClassNames>
  );
};
