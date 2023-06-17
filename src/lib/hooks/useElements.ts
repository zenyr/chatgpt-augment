import { useRef } from "react";

export const useElements = () => {
  const formRef = useRef<HTMLFormElement>(
    document.querySelector("main form") as HTMLFormElement
  );
  const textareaRef = useRef<HTMLTextAreaElement>(
    formRef.current.querySelector("textarea") as HTMLTextAreaElement
  );
  const root = useRef<HTMLDivElement>(
    document.getElementById("__next") as HTMLDivElement
  );
  const parent = useRef(formRef.current.parentElement);
  if (!parent.current) throw new Error("Impossiburu!");

  return {
    form: formRef.current,
    textarea: textareaRef.current,
    parent: parent.current,
    root: root.current,
  };
};
