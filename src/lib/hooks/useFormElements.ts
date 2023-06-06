import { useRef } from "react";

export const useFormElements = () => {
  const formRef = useRef<HTMLFormElement>(
    document.querySelector("main form") as HTMLFormElement
  );
  const textareaRef = useRef<HTMLTextAreaElement>(
    formRef.current.querySelector("textarea")
  );
  const parent = useRef(formRef.current.parentElement);
  if (!parent.current) throw new Error("Impossiburu!");

  return {
    form: formRef.current,
    textarea: textareaRef.current,
    parent: parent.current,
  };
};
