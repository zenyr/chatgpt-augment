import { notifications } from "@mantine/notifications";
import { IconCheck, IconExclamationMark } from "@tabler/icons-react";
import { ChangeEvent, MouseEvent, createElement } from "react";
import { create } from "zustand";
import { waitElement } from "../elementPromises";
import { serializeMessageElement } from "../messageSerializer";
import json5 from "json5";
import { store } from "./workers/useElements";
export type MemFile = {
  path: string;
  purpose: string;
  content: string;
  reviewed: boolean;
};

const PROMPTS = {
  initial:
    `You are a seasoned {{language}} developer. ` +
    `Let's make {{appName}}.\n` +
    `Let's begin with defining features. Ask me and get answers for up to {{count}} questions.\n` +
    `Once I answer the questions, show me the whole list of a viable file structure without empty folders. Don't include folders as an item in the list.\n` +
    `Please do not snip out details and list a whole list.\n` +
    `The JSON5 format should look like this:
\`\`\`json5
[
  {
  'path': relativePath/filename.ext,
  'reviewed': false,
  'purpose': purpose-of-the-file,
  'content': ''
  },
  ...
]
\`\`\`
`,
  startReview:
    `Now considering my answer and the file structure you created, ` +
    `we need to make a working code without further human intervention.\n` +
    `Can you show me each file contents with their full relative path intact, ` +
    `starting from the most important ones, never snipping out implementation details?\n` +
    `
  - Show me one file per a response. Do not show me multiple files in one response.
  - The code you provided should work right away.
  - The code you provided should be using easy to read yet very concise syntax whenever possible.
  - When you don't have any remaining unreviewed files to show, just say "!DONE!".
  - Otherwise, the answer format should be like this:
    - \`relativePath/filename.ext\`: purpose-of-this-file
  \`\`\`filetype
  code-without-snipping
  \`\`\`
  `,
  applyReview: `Show me the updated last file in the following format:
  \`relativePath/filename.ext\`: purpose-of-this-file
  \`\`\`filetype
  code-without-snipping
  \`\`\` 
  `,
  continueReview: `Mark this file as reviewed and continue to the next file. If there's nothing left, just say !DONE!.`,
} as const;

const TOKENS_FILE_STRUCTURE = [
  "```json5",
  "path",
  "reviewed",
  "purpose",
  "content",
  "```",
] as const;
const regFileStart = /[`*]+([^`*]+)[`*]+\s?:\s*([^`]+)\n+`{3}([^\n]+)\n/;

const initialState = {
  step: 1,
  files: [] as MemFile[],
  isChatNew: false,
  isChatGpt4: false,
  appName: "a click counter app",
  language: "",
  questionCount: 5,
  currentFile: "",
  currentMessage: "",
  isBusy: false,
  questions: [] as string[],
  answers: [] as string[],
  userInput: "",
  conversations: [] as string[],
};

type State = typeof initialState & {
  computed: {
    prepared: boolean;
    prepareValues: string[];
    promptInitial: string;
  };
  handlers: {
    handleLanguage: (language: string) => void;
    handleQuestionCount: (e: ChangeEvent<HTMLInputElement>) => void;
    handleAppName: (e: ChangeEvent<HTMLInputElement>) => void;
    clearAppName: () => void;
    setFileContent: (path: string, content: string) => void;
    openNewChat: () => void;
    toggleGpt4Chat: () => void;
    handlePrepared: () => void;
    handleFileSelect: (e: MouseEvent<HTMLButtonElement>) => void;
    handleAnswerInput: (e: ChangeEvent<HTMLInputElement>) => void;
    handleUserInput: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    stopOrRegenerate: (isStop: boolean) => Promise<boolean | Error>;
    parseMessage: (text: string) => void;
    submitResponse: () => Promise<string | Error>;
    submitInitialPrompt: () => Promise<string | Error>;
    onFinish: () => void;
    parseFiles: (text: string) => void;
    sendPrompt: (prompt: string) => Promise<string | Error>;
    receiveStream: () => Promise<void>;
    finalizeStream: () => string;
    reset: () => void;
  };
};

export const useCoder = create<State>()((set, get) => {
  const computed = {
    get prepared() {
      const { isChatNew, appName, language, questionCount } = get();
      return !!(isChatNew && appName && language && questionCount);
    },
    get prepareValues() {
      const { isChatNew, appName, language, questionCount, isChatGpt4 } = get();
      return [
        isChatNew ? "newchat" : "",
        appName ? "appname" : "",
        language ? "language" : "",
        questionCount ? "questionCount" : "",
        isChatGpt4 ? "chatGpt4" : "",
      ].filter(Boolean);
    },
    get promptInitial() {
      const { language, questionCount: count, appName } = get();
      return PROMPTS.initial
        .replace("{{language}}", language)
        .replace("{{count}}", count.toString())
        .replace("{{appName}}", appName);
    },
    get promptStartReview() {
      return PROMPTS.startReview;
    },
    get promptReview() {
      const { answers, userInput, files } = get();
      return [
        ...answers.map((a, i) => `${i + 1}. ${a || "Not sure."}`),
        userInput,
        files.length &&
          (userInput ? PROMPTS.applyReview : PROMPTS.continueReview),
      ]
        .filter(Boolean)
        .join("\n");
    },
  };

  const handlers = {
    handleLanguage: (language: string) => set({ language }),
    handleQuestionCount: (e: ChangeEvent<HTMLInputElement>) =>
      set({ questionCount: parseInt(e.target.value, 10) || 0 }),
    handleAppName: (e: ChangeEvent<HTMLInputElement>) =>
      set({ appName: e.target.value }),
    clearAppName: () => set({ appName: "" }),
    setFileContent: (path: string, content: string) => {
      const { files: _files } = get();
      const files = [..._files];
      const file = files.find((f) => f.path === path);
      if (file) {
        file.content = content;
        set({ files });
      }
    },
    openNewChat: () => {
      const btnNew = store.getState().button.new;
      btnNew?.click();
    },
    toggleGpt4Chat: () => {
      const btnGpt3 = store.getState().button.gpt3;
      const btnGpt4 = store.getState().button.gpt4;
      const { isChatGpt4 } = get();
      const el = isChatGpt4 ? btnGpt3 : btnGpt4;
      (el as HTMLElement)?.click();
    },
    handlePrepared: () => {
      const prepared = get().computed.prepared;
      if (!prepared) return;
      set({ step: 2 });
      // trigger the chat
      handlers.submitInitialPrompt();
    },
    handleFileSelect: (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const currentFile = e.currentTarget.getAttribute("data-path");
      if (!currentFile) return;
      set({ currentFile });
    },
    handleAnswerInput: (e: ChangeEvent<HTMLInputElement>) => {
      const { answers: _answers } = get();
      const answers = [..._answers];
      const idx = parseInt(e.target.getAttribute("data-idx") || "0", 10);
      const value = e.target.value;
      answers[idx] = value;
      set({ answers });
    },
    handleUserInput: (e: ChangeEvent<HTMLTextAreaElement>) => {
      const userInput = e.target.value;
      set({ userInput });
    },
    reset: () => set(initialState),

    sendPrompt: async (prompt: string): Promise<string | Error> => {
      try {
        const isBusy = get().isBusy;
        if (isBusy) throw new Error("Another request is in progress.");
        set({ isBusy: true, questions: [], answers: [] });
        const [elTxt, elSubmit] = await Promise.all([
          await waitElement({ selector: "form textarea" }, true),
          await waitElement({ selector: "form textarea + button" }, true),
        ]);
        if (!elTxt || !elSubmit) throw new Error("no textarea found");
        (elTxt as HTMLTextAreaElement).value = prompt;
        (elTxt as HTMLTextAreaElement).dispatchEvent(
          new Event("input", { bubbles: true })
        );
        elSubmit.click();
        set((s) => ({ conversations: [...s.conversations, prompt, ""] }));
        await new Promise((r) => setTimeout(r, 500));

        await handlers.receiveStream();
        const message = handlers.finalizeStream();
        notifications.show({
          icon: createElement(IconCheck),
          color: "green",
          title: "Coder",
          message: `Successfully submitted a message.`,
        });
        return message;
      } catch (e) {
        if (e instanceof Error) {
          notifications.show({
            title: "Error",
            message: e.message,
            color: "red",
            icon: createElement(IconExclamationMark),
          });
          return e;
        }
        return new Error("Unknown error.");
      } finally {
        set({ isBusy: false });
      }
    },

    receiveStream: async () => {
      let completed = false;
      while (!completed) {
        let elStreaming: HTMLElement | null;
        while (
          (elStreaming = await waitElement(
            { selector: "div.result-streaming", timeout: 200 },
            true
          ))
        ) {
          const interim = serializeMessageElement(elStreaming);
          if (!interim)
            throw new Error("Failed to parse the interim response.");
          const [, currentMessage] = interim;
          set({ currentMessage });
          await new Promise((r) => setTimeout(r, 200));
        }

        const elContinue = await waitElement(
          { selector: "form .flex button + button", timeout: 200 },
          true
        );
        if (!elContinue) break;
      }
    },

    parseMessage: (text: string) => {
      const { conversations } = get();
      const isUser = conversations.length % 2;
      if (isUser) return;

      // update file structure and auto start review process
      if (TOKENS_FILE_STRUCTURE.every((t) => text.includes(t))) {
        const start =
          text.indexOf(TOKENS_FILE_STRUCTURE[0]) +
          TOKENS_FILE_STRUCTURE[0].length;
        const end = start + text.slice(start).indexOf(TOKENS_FILE_STRUCTURE[5]);

        handlers.parseFiles(text.slice(start, end));

        if (get().files.length === 0) {
          // could not parse anything.
          return handlers.stopOrRegenerate(false);
        } else {
          // file list received. continue to review.
          return new Promise((r) => {
            setTimeout(
              () => handlers.sendPrompt(computed.promptStartReview).then(r),
              10
            );
          });
        }
      }

      // update questions and prepare empty answers
      const regQuestion =
        /^\d+\. ((?:.)+[?.])\s*|((?:(?:Could|Can) you|(?:Is|Are) there)(?:[^?.])+[?.])\s*$/gim;
      const questions = Array.from(
        text.matchAll(regQuestion),
        (match) => match[1] || match[2]
      );
      set({
        questions,
        answers: Array.from({ length: questions.length }).fill("") as string[],
      });

      // update file content
      let txt = text;
      while (true) {
        const match = txt.match(regFileStart);
        if (!match) break;
        const [full, path] = match;
        const start = txt.indexOf(full) + full.length;
        const end = start + txt.slice(start).indexOf("```");
        const content = txt.slice(start, end);
        txt = txt.slice(end + 3);
        set((s) => {
          const newState: State = {
            ...s,
            currentFile: path,
            files: [...s.files],
          };
          const idx = newState.files.findIndex((f) => path === f.path);
          newState.files[idx] = {
            ...newState.files[idx],
            reviewed: true,
            content,
          };
          return newState;
        });
      }

      // detect !DONE!.
      const currFiles = get().files;
      const isDoneFound = /!DONE!/.test(text);
      const unReviewedFile = currFiles.find((f) => !f.reviewed);
      const unReadFile = currFiles.find((f) => !f.content);
      if (isDoneFound) {
        if (unReviewedFile || unReadFile) {
          // there are still unreviewed files. try again.
          setTimeout(() => handlers.sendPrompt(computed.promptReview), 10);
        } else {
          return handlers.onFinish();
        }
      }
    },

    parseFiles: (text: string) => {
      try {
        set({
          files: json5
            .parse(text)
            .map((file: MemFile) => ({ ...file, reviewed: false })),
        });
      } catch (e) {
        if (e instanceof Error)
          notifications.show({
            icon: createElement(IconExclamationMark),
            color: "red",
            title: "Failed to parse file structure.",
            message: e.message,
          });
        set({ files: [] });
      }
    },

    stopOrRegenerate: async (isStop: boolean): Promise<boolean | Error> => {
      try {
        const btnStop = store.getState().button.stop;
        const btnRegen = store.getState().button.regen;
        const el = isStop ? btnStop : btnRegen;
        if (!el) throw new Error("no button found");
        const text = el.textContent;
        const isRegen = text === "Regenerate response";
        if (isStop !== isRegen) {
          el.click();
          if (isRegen) {
            try {
              set((s) => ({
                conversations: [...s.conversations.slice(0, -1), ""],
                isBusy: true,
              }));

              await handlers.receiveStream();
              handlers.finalizeStream();
            } finally {
              set({ isBusy: false });
            }
          }
          notifications.show({
            icon: createElement(IconCheck),
            title: "Success",
            color: "green",
            message: `Successfully ${isRegen ? "restarted" : "stopped"}.`,
          });
        }
        return isRegen;
      } catch (e) {
        if (e instanceof Error) {
          notifications.show({
            icon: createElement(IconExclamationMark),
            color: "red",
            title: "Failed to stop nor regenerate response.",
            message: e.message,
          });
        }
      }
      return new Error("Unknown error.");
    },
    submitInitialPrompt: () => {
      return handlers.sendPrompt(computed.promptInitial);
    },
    submitResponse: async (): Promise<string | Error> => {
      const prompt = computed.promptReview;
      set({ userInput: "", questions: [], answers: [] });
      const response = await handlers.sendPrompt(prompt);

      return response;
    },

    finalizeStream: () => {
      const elResponses = document.querySelectorAll("main .flex-col .group");
      if (!elResponses.length) throw new Error("No response found.");
      const elLastResponse = elResponses[elResponses.length - 1];
      const final = serializeMessageElement(elLastResponse as HTMLElement);
      if (!final) throw new Error("Failed to parse the response.");
      const [isUser, currentMessage] = final;
      if (isUser) throw new Error("No assistant response found.");
      set({ currentMessage });
      handlers.parseMessage(currentMessage);
      return currentMessage;
    },

    onFinish: () => {
      set({ step: 3 });
    },
  };

  return {
    ...initialState,
    computed,
    handlers,
  };
});
