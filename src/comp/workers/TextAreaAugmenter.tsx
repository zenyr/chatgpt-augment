import { store } from "@/lib/hooks/workers/useElements";
import { useTextAreaAugmentaion } from "@/lib/hooks/workers/useTextarea";
import {
  ActionIcon,
  Badge,
  Group,
  Portal,
  Select,
  Tooltip,
} from "@mantine/core";
import {
  IconCircleArrowUp,
  IconCodePlus,
  IconCoin,
  IconTrash,
} from "@tabler/icons-react";
import { memo } from "react";
import { TokenReaderModal } from "../modals/TokenReaderModal";
import { MacroAddModal } from "../modals/MacroAddModal";

const Worker = ({
  textarea,
  isEdit,
}: {
  textarea: HTMLTextAreaElement;
  isEdit: boolean;
}) => {
  const {
    tokens,
    handleBadgeClick,
    openTokens,
    setOpenTokens,
    handleTextOptimized,
    handleClearText,
    json,
    openAddmodal,
    handleConfirm,
    handleDelete,
    open,
    close,
    selection,
    items,
    handleSelect,
  } = useTextAreaAugmentaion(textarea);
  return (
    <>
      <Badge
        color={tokens.length > 3000 ? "red" : "dark"}
        size="xs"
        style={{ overflow: "visible", padding: "11px 0", border: 0 }}
        leftSection={
          <ActionIcon
            size="sm"
            radius="xl"
            variant="subtle"
            onClick={handleBadgeClick}
            title="Restore last text"
            color="gray"
          >
            <IconCircleArrowUp size={12} />
          </ActionIcon>
        }
        rightSection={
          <ActionIcon
            size="sm"
            radius="xl"
            variant="subtle"
            disabled={!tokens.length}
            onClick={() => setOpenTokens(true)}
            title="Token visualizer"
            color="gray"
          >
            <IconCoin size={12} />
          </ActionIcon>
        }
      >
        {tokens.length.toLocaleString()} Token{tokens.length > 1 && "s"}
      </Badge>
      <TokenReaderModal
        tokens={tokens}
        opened={openTokens}
        onPromptChange={handleTextOptimized}
        onCancel={() => setOpenTokens(false)}
      />
      <Tooltip label="Clear text" withArrow>
        <ActionIcon
          size="sm"
          color="gray"
          variant="filled"
          onClick={handleClearText}
          radius="xl"
        >
          <IconTrash size={12} />
        </ActionIcon>
      </Tooltip>
      <MacroAddModal
        macros={json}
        opened={openAddmodal}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onCancel={close}
        initialPrompt={selection?.toString() || ""}
      />
      <Select
        size="xs"
        radius="lg"
        placeholder="Macros"
        searchable
        nothingFound="No options"
        data={items}
        onChange={handleSelect}
        style={{ maxWidth: 100 }}
      />
      {!isEdit && (
        <Tooltip label="Add/edit macros" withArrow>
          <ActionIcon
            size="sm"
            color="gray"
            variant="filled"
            onClick={open}
            radius="xl"
          >
            <IconCodePlus size={12} />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
};

const styleH100 = { height: "100%" };

export const TextAreaAugmenter = memo(() => {
  const [textarea, edits] = store((s) => [s.main.textarea, s.edits]);
  return (
    <>
      {textarea && <Worker textarea={textarea} isEdit={false} />}
      {edits.map((edit, idx) => {
        return (
          <Portal target={edit.target} key={idx} style={styleH100}>
            <Group noWrap spacing="xs" align="center" pl="xs" style={styleH100}>
              <Worker textarea={edit.textarea} isEdit />
            </Group>
          </Portal>
        );
      })}
    </>
  );
});
