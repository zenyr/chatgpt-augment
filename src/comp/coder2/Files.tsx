import { useCoder } from "@/lib/hooks/useCoder2";
import { ClassNames } from "@emotion/react";
import { Paper, UnstyledButton, rem, useMantineTheme } from "@mantine/core";
import { IconCircleDashed, IconFile, IconFileCheck } from "@tabler/icons-react";

export const Coder2Files = () => {
  const [files, currentFile, handleFileSelect] = useCoder((s) => [
    s.files,
    s.currentFile,
    s.handlers.handleFileSelect,
  ]);
  const theme = useMantineTheme();
  return (
    <ClassNames>
      {({ css }) => (
        <Paper>
          {files.map((file) => (
            <UnstyledButton
              key={file.path}
              data-path={file.path}
              onClick={handleFileSelect}
              className={css`
                display: flex;
                align-items: center;
                gap: ${theme.spacing.xs};
                width: 100%;
                text-decoration: none;
                color: ${theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black};

                line-height: 1.2;
                font-size: ${theme.fontSizes.sm};
                padding: ${theme.spacing.xs};
                border-top-right-radius: ${theme.radius.sm};
                border-bottom-right-radius: ${theme.radius.sm};
                border-left: ${rem(1)} solid
                  ${theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[3]};

                background-color: ${currentFile === file.path
                  ? theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0]
                  : "transparent"};
                &:hover {
                  background-color: ${theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0]};
                }
              `}
            >
              {!file.content ? (
                <IconCircleDashed />
              ) : file.reviewed ? (
                <IconFileCheck />
              ) : (
                <IconFile />
              )}{" "}
              {file.path}
            </UnstyledButton>
          ))}
        </Paper>
      )}
    </ClassNames>
  );
};
