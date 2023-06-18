import { NodeHtmlMarkdown, PostProcessResult } from "node-html-markdown";
import { marked } from "marked";
export const surround = (source: string, surroundStr: string) =>
  `${surroundStr}${source}${surroundStr}`;

const nhm = new NodeHtmlMarkdown(
  {},
  {
    div: {
      postprocess({ node }) {
        if (node.classList.contains("items-center"))
          return PostProcessResult.RemoveNode;
        return PostProcessResult.NoChange;
      },
    },
    code: ({
      node,
      parent,
      options: { codeFence, codeBlockStyle },
      visitor,
    }) => {
      const isCodeBlock =
        node.classList.contains("!whitespace-pre") ||
        (["PRE", "WRAPPED-PRE"].includes(parent?.tagName!) &&
          parent!.childNodes.length < 2);

      /* Handle code (non-block) */
      if (!isCodeBlock)
        return {
          spaceIfRepeatingChar: true,
          noEscape: true,
          postprocess: ({ content }) => {
            // Find longest occurring sequence of running backticks and add one more (so content is escaped)
            const delimiter =
              "`" +
              (content.match(/`+/g)?.sort((a, b) => b.length - a.length)?.[0] ||
                "");
            const padding = delimiter.length > 1 ? " " : "";

            return surround(surround(content, padding), delimiter);
          },
        };

      /* Handle code block */
      if (codeBlockStyle === "fenced") {
        const language =
          node.getAttribute("class")?.match(/language-(\S+)/)?.[1] || "";
        const betterFence =
          node.innerHTML.indexOf(codeFence) > -1 ? "~~~" : codeFence;
        return {
          noEscape: true,
          prefix: betterFence + language + "\n",
          postfix: "\n" + betterFence,
          childTranslators: visitor.instance.codeBlockTranslators,
        };
      } else {
        return {
          noEscape: true,
          postprocess: ({ content }) => content.replace(/^/gm, "    "),
          childTranslators: visitor.instance.codeBlockTranslators,
        };
      }
    },
  }
);

export const deserializeMessage = (text: string) => {
  return marked(text, { headerIds: false, mangle: false });
};

export const serializeMessageElement = (el: HTMLElement) => {
  const assistantEl = el.querySelector(".markdown");
  const isUser = !assistantEl;
  if (assistantEl) {
    const parsed = nhm.translate((assistantEl as HTMLElement).innerHTML);
    return [isUser, parsed] as const;
  }
  const userEl = el.querySelector(".whitespace-pre-wrap, textarea");
  if (userEl) {
    if (userEl.tagName === "TEXTAREA") {
      return [true, (userEl as HTMLTextAreaElement).value] as const;
    }
    return [true, (userEl as HTMLElement).textContent || ""] as const;
  }
  return null;
};
