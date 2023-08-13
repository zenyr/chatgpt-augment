import { useApplyClassName } from "@/lib/hooks/useApplyClassName";
import { store } from "@/lib/hooks/workers/useElements";
import { ClassNames } from "@emotion/react";

const Worker = ({
  className,
  parent,
}: {
  parent: HTMLElement;
  className: string;
}) => {
  useApplyClassName(parent, className);
  return null;
};
export const ClickThrougher = () => {
  const [node] = store((s) => [s.main.form?.parentElement]);
  return (
    <ClassNames>
      {({ css }) =>
        node ? (
          <Worker
            parent={node}
            className={css`
              &,
              div {
                pointer-events: none;
                button,
                textarea,
                .rounded-xl,
                [role="menu"] {
                  pointer-events: auto;
                }
              }
              form + div {
                &,
                div {
                  pointer-events: auto;
                  user-select: none;
                }
                input {
                  user-select: text;
                }
              }
              .cgpt-agmt {
                letter-spacing: -1px;
                margin-bottom: -0.4rem;
                input[type="checkbox"] {
                  display: none;
                }
                [data-position="top"] {
                  letter-spacing: initial;
                }
              }
            `}
          />
        ) : null
      }
    </ClassNames>
  );
};
