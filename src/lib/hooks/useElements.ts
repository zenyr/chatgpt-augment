import { useLayoutEffect, useState } from "react";
import { useSelector } from "./useTarget";

export const useElements = () => {
  const form = useSelector("main form");
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);
  const [parent, setParent] = useState<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (form) {
      setTextarea(form.querySelector("textarea") as HTMLTextAreaElement);
      setParent(form.parentElement as HTMLDivElement);
      setTextarea(form.querySelector("textarea") as HTMLTextAreaElement);
      setRoot(document.getElementById("__next") as HTMLDivElement);
    }
  }, [form]);

  return {
    form,
    textarea,
    parent,
    root,
  };
};
