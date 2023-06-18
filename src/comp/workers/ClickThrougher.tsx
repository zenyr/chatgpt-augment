import { ClassNames } from "@emotion/react";
import { useLayoutEffect } from "react";

const ClickThroughWorker = ({
  parent,
  className,
}: {
  parent: HTMLDivElement;
  className: string;
}) => {
  useLayoutEffect(() => {
    if (parent.classList.contains(className)) return;
    parent.classList.add(className);
    return () => parent.classList.remove(className);
  }, [className, parent]);
  return null;
};

export const ClickThrougher = ({ parent }: { parent: HTMLDivElement }) => {
  return (
    <ClassNames>
      {({ css }) => (
        <ClickThroughWorker
          parent={parent}
          className={css`
            &,
            div {
              pointer-events: none;
              button,
              textarea,
              .rounded-xl {
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
      )}
    </ClassNames>
  );
};
