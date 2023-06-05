import { encode } from "gpt-tokenizer";

export const getTokenLength = (text: string) => {
  const tokens = encode(text);
  return tokens.length;
};

if (import.meta.hot) {
  import.meta.hot.accept(() => {});
}
