import { ClassNames } from "@emotion/react";
import { Loader, Paper } from "@mantine/core";
import { marked } from "marked";

export const CoderMarkdown = ({
  md,
  loading,
}: {
  md: string;
  loading?: boolean;
}) => (
  <ClassNames>
    {({ css }) => (
      <Paper
        p="xs"
        withBorder
        className={css`
          max-width: 100%;
          font-size: 0.7rem;
          pre {
            overflow-wrap: break-word;
            word-break: break-all;
            white-space: pre-wrap;
          }
          p:last-child {
            margin-bottom: 0;
          }
          li {
            list-style: auto;
            margin-left: 1rem;
          }
        `}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: marked(md, { headerIds: false, mangle: false }),
          }}
        />
        {loading && <Loader variant="bars" size="1rem" />}
      </Paper>
    )}
  </ClassNames>
);
