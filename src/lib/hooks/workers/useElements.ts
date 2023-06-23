import { shallowEqual, useElementSize } from "@mantine/hooks";
import throttle from "lodash/throttle";
import { useLayoutEffect, useMemo } from "react";
import { create } from "zustand";
import { combine } from "zustand/middleware";

const initialElements = {
  changeT: 0,
  main: {
    form: null as HTMLFormElement | null,
    textarea: null as HTMLTextAreaElement | null,
    submit: null as HTMLButtonElement | null,
    target: null as HTMLDivElement | null,
  },
  edits: [] as {
    textarea: HTMLTextAreaElement;
    submit: HTMLButtonElement;
    target: HTMLDivElement;
  }[],
  button: {
    new: null as HTMLButtonElement | null,
    continue: null as HTMLButtonElement | null,
    regen: null as HTMLButtonElement | null,
    stop: null as HTMLButtonElement | null,
    gptActive: null as HTMLDivElement | null,
    gpt3: null as HTMLDivElement | null,
    gpt4: null as HTMLDivElement | null,
  },
  container: {
    list: null as HTMLDivElement[] | null,
    conversations: null as HTMLDivElement[] | null,
    lastConversation: null as HTMLDivElement | null,
    continue: null as HTMLDivElement | null,
  },
};

export type Els = typeof initialElements;
export const store = create(
  combine(initialElements, (set, get) => ({
    handlers: {
      setMain: (main: Els["main"]) => set({ main }),
      setEdits: (edits: Els["edits"]) => set({ edits }),
      addEdit: (els: NonNullable<Els["edits"][number]>) =>
        set(({ edits }) => ({ edits: [...edits, els] })),
      setEdit: (idx: number, els: NonNullable<Els["edits"][number]>) =>
        set(({ edits }) => ({ edits: [...edits].splice(idx, 1, els) })),
      delEdit: (elTextarea: HTMLTextAreaElement) =>
        set(({ edits }) => ({
          edits: [...edits].filter((e) => e.textarea !== elTextarea),
        })),
      setButtons: (button: Els["button"]) => set({ button }),
      setContainer: (container: Els["container"]) =>
        set({ container, changeT: Date.now() }),
      getExisting: () => {
        const { main, edits, button, container } = get();
        const aMain = Object.values(main).filter(Boolean);
        const aEdits = Object.values(edits).flatMap((e) =>
          Object.values(e || {})
        );
        const aButton = Object.values(button).filter(Boolean);
        const aContainer = Object.values(container).flat().filter(Boolean);
        return [...aMain, ...aEdits, ...aButton, ...aContainer];
      },
    },
  }))
);

const SELECTORS = {
  main_form: "main form",
  main_textarea: "main form textarea",
  main_submit: "main form textarea + button",
  main_target: "main form + div",
  edit_textarea: "main .group textarea",
  edit_submit: "main .group textarea + div button.btn-primary",
  edit_target: "main .group textarea + div",
  button_new: ["nav a.flex-grow, .sticky h1 + button"] as const,
  button_regen: [
    "form .h-full.justify-center button.-z-0",
    /Regenerate/,
  ] as const,
  button_continue: ["form .h-full.justify-center button", /Continue/] as const,
  button_stop: ["form .h-full.justify-center button", /Stop/] as const,
  button_active: ["main .justify-center button div.bg-white"] as const,
  button_gpt3: ["main .justify-center button div", /GPT-3/] as const,
  button_gpt4: ["main .justify-center button div", /GPT-4/] as const,
  container_continue: "form .justify-center",
  container_list: "nav li.relative",
  container_conversations: "main .group",
};

// monitor document and update elsStore
export const useElsUpdater = () => {
  const elSize = useElementSize<HTMLDivElement>();
  const update = useMemo(
    () =>
      throttle(
        () => {
          const els = store.getState();
          const mainForm = document.querySelector<HTMLFormElement>(
            SELECTORS.main_form
          );
          const mainTextarea = document.querySelector<HTMLTextAreaElement>(
            SELECTORS.main_textarea
          );
          const mainSubmit = document.querySelector<HTMLButtonElement>(
            SELECTORS.main_submit
          );
          const mainTarget = document.querySelector<HTMLDivElement>(
            SELECTORS.main_target
          );
          const main = {
            form: mainForm,
            textarea: mainTextarea,
            submit: mainSubmit,
            target: mainTarget,
          };
          if (mainTarget) elSize.ref.current = mainTarget;
          if (!shallowEqual(main, els.main)) els.handlers.setMain(main);

          // BUTTONS
          const scanButton = <T extends HTMLElement>(
            selector: string,
            reg?: RegExp
          ) =>
            [...document.querySelectorAll<T>(selector)].find((el) =>
              reg ? el.textContent?.match(reg) : true
            ) || null;
          const buttonNew = scanButton<HTMLButtonElement>(
            ...SELECTORS.button_new
          );
          const buttonRegen = scanButton<HTMLButtonElement>(
            ...SELECTORS.button_regen
          );
          const buttonContinue = scanButton<HTMLButtonElement>(
            ...SELECTORS.button_continue
          );
          const buttonStop = scanButton<HTMLButtonElement>(
            ...SELECTORS.button_stop
          );
          const buttonGptActive = scanButton<HTMLDivElement>(
            ...SELECTORS.button_active
          );
          const buttonGpt3 = scanButton<HTMLDivElement>(
            ...SELECTORS.button_gpt3
          );
          const buttonGpt4 = scanButton<HTMLDivElement>(
            ...SELECTORS.button_gpt4
          );

          const button = {
            new: buttonNew,
            regen: buttonRegen,
            continue: buttonContinue,
            stop: buttonStop,
            gptActive: buttonGptActive,
            gpt3: buttonGpt3,
            gpt4: buttonGpt4,
          };
          if (!shallowEqual(button, els.button))
            els.handlers.setButtons(button);

          // EDIT
          const editTextareas = document.querySelectorAll<HTMLTextAreaElement>(
            SELECTORS.edit_textarea
          );
          const editSubmits = document.querySelectorAll<HTMLButtonElement>(
            SELECTORS.edit_submit
          );
          const editTargets = document.querySelectorAll<HTMLDivElement>(
            SELECTORS.edit_target
          );
          const edits = [...editTextareas].map((textarea, idx) => ({
            textarea,
            submit: editSubmits[idx],
            target: editTargets[idx],
          }));
          els.handlers.setEdits(edits);

          // CONTAINER
          const containerList = document.querySelectorAll<HTMLDivElement>(
            SELECTORS.container_list
          );
          const containerConversations =
            document.querySelectorAll<HTMLDivElement>(
              SELECTORS.container_conversations
            );
          const containerLastConversation =
            containerConversations[containerConversations.length - 1];
          const containerContinue = document.querySelector<HTMLDivElement>(
            SELECTORS.container_continue
          );
          const container = {
            list: [...containerList],
            conversations: [...containerConversations],
            lastConversation: containerLastConversation,
            continue: containerContinue,
          };
          const listMatch = shallowEqual(container.list, els.container.list);
          const conversationsMatch = shallowEqual(
            container.conversations,
            els.container.conversations
          );
          const lastConversationMatch =
            container.lastConversation === els.container.lastConversation;
          const continueMatch = container.continue === els.container.continue;
          const containerSame =
            listMatch &&
            conversationsMatch &&
            lastConversationMatch &&
            continueMatch;
          if (!containerSame) els.handlers.setContainer(container);
        },
        100,
        { leading: true, trailing: true }
      ),
    []
  );
  useLayoutEffect(() => {
    const handler = (_ms: MutationRecord[]) => {
      let shouldScan = false;
      const ms = [..._ms];
      for (let m of ms) {
        if (m.removedNodes.length) {
          const removed = [...m.removedNodes];
          if (
            removed.some((n) =>
              store
                .getState()
                .handlers.getExisting()
                .some((nn) => n.contains(nn))
            )
          ) {
            shouldScan = true;
            break;
          }
        }
        if (m.addedNodes.length) {
          shouldScan = true;
        }
      }
      if (shouldScan) update();
    };
    const m = new MutationObserver(handler);
    update();
    m.observe(document.documentElement, { childList: true, subtree: true });
    return () => m.disconnect();
  }, [update]);

  return elSize;
};

export const useElsMain = () => store((s) => s.main);
export const useElsEdits = () => store((s) => s.edits);
export const useElsButtons = () => store((s) => s.button);
export const useElsContainer = () => store((s) => s.container);
