import { ClassNames } from "@emotion/react";
import { MantineProvider, Paper, Portal } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import throttle from "lodash/throttle";
import { useCallback, useEffect, useId, useMemo } from "react";

// type Props = {
//   // onExecute: (prompt: string) => Promise<string>;
//   // onDone: () => void;
// };

export const TreeSorter = () => {
  const id = `tree-${(useId() || "").replace(/:/g, "")}`;
  const update = useForceUpdate();
  const target = document.getElementById(id);
  const installer = useMemo(
    () =>
      throttle(
        () => {
          const el = document.querySelector("nav .overflow-y-auto > div > div");
          if (!el) return;

          const hasWiped = el.id !== id;
          if (hasWiped) {
            // install!
            el.id = id;
            el.classList.add("relative");
            update();
          }
        },
        1000,
        { trailing: true }
      ),
    [id]
  );

  const mounter = useCallback<MutationCallback>(
    (mutation) => {
      const added = mutation.filter(
        (m) => m.type === "childList" && m.addedNodes
      );
      console.log(added);
      if (!added) return;

      installer();
    },
    [id]
  );

  useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;

    const mo = new MutationObserver(mounter);
    mo.observe(nav, { childList: true, subtree: true });
    installer();
    return () => {
      try {
        mo.disconnect();
      } catch {
        // ignore
      }
    };
  }, [mounter, installer]);

  return target ? (
    <Portal target={target}>
      <MantineProvider theme={{ colorScheme: "dark" }}>
        <ClassNames>
          {({ css }) => (
            <Paper
              className={css`
                position: absolute;
                inset: 0;
                left: 50%;
                z-index: 1000;
              `}
            >
              Hello!
            </Paper>
          )}
        </ClassNames>
      </MantineProvider>
    </Portal>
  ) : null;
};
