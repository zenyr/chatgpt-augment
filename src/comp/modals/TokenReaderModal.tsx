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
import { useToggle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCoinOff,
  IconCoins,
  IconPigMoney,
  IconScissors,
  IconX,
} from "@tabler/icons-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Balancer } from "react-wrap-balancer";

const checkBr = (char: string | number) =>
  char === "\n" || char === "\n\n"
    ? {
        display: "flex",
        flex: 1,
        minHeight: char === "\n\n" ? "1.5rem" : "initial",
      }
    : {};

enum Tokens {
  LINE_BREAK = 198,
  DBL_LINE_BREAK = 628,
  SPACING = 220,
}

type Props = {
  tokens: number[];
  opened: boolean;
  onCancel(): void;
  onPromptChange(text: string): void;
};
export const TokenReaderModal = ({
  tokens,
  opened,
  onCancel,
  onPromptChange,
}: Props) => {
  const parsed = useMemo(
    () => (opened ? tokens.map((t) => [decode([t]), t] as const) : []),
    [tokens, opened]
  );
  const { colorScheme } = useMantineColorScheme();
  const [inverse, setInverse] = useState(false);
  const [slice1000, setSlice1000] = useState(false);
  const [slice100, setSlice100] = useState(true);
  const [removeHeading, toggle] = useToggle([false, true]);
  const opacity = (inverse ? 0.2 : 0.1) + (colorScheme === "light" ? 0.2 : 0);

  const handleOptimizeToken = useCallback(() => {
    const newTokens = [...tokens];
    let spacingScan = 0;
    let wasLinebreak = false;
    for (let i = 0; i < newTokens.length; i++) {
      const prevToken = i === 0 ? null : newTokens[i - 1];
      const currentToken = newTokens[i];
      const isLineBreak =
        currentToken === Tokens.LINE_BREAK ||
        currentToken === Tokens.DBL_LINE_BREAK;
      if (isLineBreak && prevToken === currentToken) {
        // double line break
        newTokens.splice(i, 1);
        i--;
      }
      if (currentToken === Tokens.SPACING) {
        spacingScan++;
        wasLinebreak =
          wasLinebreak ||
          prevToken === Tokens.LINE_BREAK ||
          prevToken === Tokens.DBL_LINE_BREAK;
      } else {
        if (spacingScan > 0) {
          // stepped on consecutive spacings
          if (isLineBreak) {
            // trailing space found
            newTokens.splice(i - spacingScan, spacingScan);
            i -= spacingScan;
          } else if (wasLinebreak && removeHeading) {
            // heading space found
            newTokens.splice(i - spacingScan, spacingScan);
            i -= spacingScan;
          }
        }
        spacingScan = 0;
        wasLinebreak = false;
      }
    }
    if (tokens.length !== newTokens.length) {
      const diff = tokens.length - newTokens.length;
      notifications.show({
        icon: <IconPigMoney />,
        color: "lime",
        title: "Optimized tokens",
        message: `Reduced ${diff} token${diff > 1 ? "s" : ""}!`,
      });
      const newPrompt = decode(newTokens);
      onPromptChange(newPrompt);
    } else {
      notifications.show({
        icon: <IconPigMoney />,
        color: "green",
        title: "Optimized tokens",
        message: `But there's nothing to optimize.`,
      });
    }
  }, [tokens, onPromptChange, removeHeading]);

  const theme = useMantineTheme();
  return (
    <ClassNames>
      {({ css }) => (
        <Modal
          title={
            <>
              <Text size="xl" fw={500}>
                Token Reader
              </Text>
              <Text component="span">
                ({tokens.length.toLocaleString()} token
                {tokens.length > 1 && "s"})
              </Text>
            </>
          }
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
                      label={
                        <Text size="xs" style={{ whiteSpace: "pre" }}>
                          Index: {(i + 1).toLocaleString()} / Text: "{char}" (
                          {char.charCodeAt(0).toLocaleString()}
                          {char.length > 1 ? `,...+${char.length - 1}` : ""}) /
                          Token: {token.toLocaleString()}
                        </Text>
                      }
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

            <Group noWrap spacing="xs" align="center">
              <Button
                variant="outline"
                color="gray"
                onClick={onCancel}
                leftIcon={<IconX />}
              >
                Close
              </Button>
              <Tooltip
                label={
                  <Text component={Balancer} size="xs" align="center">
                    Save tokens by trimming off trailing spaces and merging CRLF
                    tokens with the least change of layout
                  </Text>
                }
                style={{ maxWidth: 400 }}
                withArrow
                position="bottom"
                withinPortal
              >
                <Button
                  variant="outline"
                  color="lime"
                  onClick={handleOptimizeToken}
                  leftIcon={<IconPigMoney stroke={1.5} />}
                >
                  Optimize
                </Button>
              </Tooltip>
              <Tooltip
                label={
                  <Text component={Balancer} size="xs" align="center">
                    May shift layout & may leave a leading space but still saves
                    more tokens
                  </Text>
                }
                style={{ maxWidth: 400 }}
                withArrow
                position="bottom"
                withinPortal
              >
                <span>
                  <Switch
                    checked={removeHeading}
                    onChange={() => toggle()}
                    onLabel={<IconCoinOff size={12} />}
                    offLabel={<IconCoins size={12} />}
                    label="Trim Leading space tokens"
                    description="Great for text, bad for codes"
                    styles={{ body: { alignItems: "center" } }}
                  />
                </span>
              </Tooltip>
            </Group>
          </Stack>
        </Modal>
      )}
    </ClassNames>
  );
};
