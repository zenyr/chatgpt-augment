import { encode } from "gpt-tokenizer";

export const getTokenLength = (text: string) => {
  const tokens = encode(text) || []; // CODE-SPLITTING AT ITS FINEST HOT DANG
  return tokens.length;
};
