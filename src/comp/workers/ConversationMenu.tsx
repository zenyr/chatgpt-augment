import { useConversationMenu } from "@/lib/hooks/workers/useConversationMenu";
import { ClassNames } from "@emotion/react";
import { MantineProvider, Menu, Portal } from "@mantine/core";
import { IconCaretUp, IconCopy, IconEdit, IconMessage, IconShare2, IconTrash, IconX } from "@tabler/icons-react";

export const ConversationMenu = () => {
  const { target, pos, ref, isDeleting, isOpened, setTarget, handlers } =
    useConversationMenu();
  return target ? (
    <ClassNames>
      {({ css }) => (
        <Portal>
          <MantineProvider theme={{ colorScheme: "dark" }}>
            <div
              // shadow="md"
              // withBorder
              className={css`
                position: fixed;
                left: ${pos.x}px;
                top: ${pos.y}px;
                z-index: 9999;
                user-select: none;
              `}
              ref={ref}
            >
              <Menu
                opened={!isDeleting}
                onChange={() => setTarget(null)}
                position="right"
                withArrow
              >
                <Menu.Target>
                  <span />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{target.textContent}</Menu.Label>
                  <Menu.Divider />

                  {isOpened ? (
                    <Menu.Item
                      icon={<IconX size={12} />}
                      onClick={handlers.close}
                      color="indigo"
                    >
                      Close
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      icon={<IconMessage size={12} />}
                      onClick={handlers.click}
                      color="indigo"
                    >
                      Open
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconEdit size={12} />}
                    onClick={handlers.edit}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconShare2 size={12} />}
                    onClick={handlers.share}
                  >
                    Share...
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCopy size={12} />}
                    onClick={handlers.copyUrl}
                  >
                    Copy URL
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconCaretUp size={12} />}
                    onClick={handlers.pullToTop}
                  >
                    Pull to top
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconTrash size={12} />}
                    onClick={handlers.delete}
                    color="red"
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </MantineProvider>
        </Portal>
      )}
    </ClassNames>
  ) : null;
};
