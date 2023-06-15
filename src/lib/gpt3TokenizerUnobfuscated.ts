// Source: https://github.com/openai/GPT-3-Encoder/blob/79387f/Encoder.js
import { encoder, bpe_file } from "./gpt3Tokens.data";
import memoize from "lodash/memoize";

const range = (x: number, y: number) => Array.from(Array(y).keys()).slice(x);

const ord = (x: string) => x.charCodeAt(0);

const chr = (x: number) => String.fromCharCode(x);

const textEncoder = new TextEncoder();

const encodeStr = (str: string | undefined) =>
  Array.from(textEncoder.encode(str)).map((x) => x.toString());

const textDecoder = new TextDecoder("utf-8");
const decodeStr = (arr: number[]) => {
  return textDecoder.decode(new Uint8Array(arr));
};

const dictZip = (x: string[][], y: number[]) => {
  const result: Record<string, number> = {};
  x.forEach((v: string[], i: number) => (result[v.join(",")] = y[i]));
  return result;
};

function bytes_to_unicode() {
  const bs = range(ord("!"), ord("~") + 1).concat(
    range(ord("¡"), ord("¬") + 1),
    range(ord("®"), ord("ÿ") + 1)
  );

  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 2 ** 8; b++) {
    if (!bs.includes(b)) {
      bs.push(b);
      cs.push(2 ** 8 + n);
      n = n + 1;
    }
  }

  const ss = cs.map(chr);

  const result: Record<number, string> = {};
  bs.forEach((v, i) => (result[v] = ss[i]));
  return result;
}

function get_pairs(word: string | string[]) {
  const pairs = new Set<[string, string]>();
  let prev_char = word[0];
  for (let i = 1; i < word.length; i++) {
    const char = word[i];
    pairs.add([prev_char, char]);
    prev_char = char;
  }
  return pairs;
}

const pat =
  /'s|'t|'re|'ve|'m|'l l|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

const decoder: Record<number, string> = {};
Object.keys(encoder).forEach(
  (x) => (decoder[encoder[x as keyof typeof encoder]] = x)
);

const lines: string[] = bpe_file.split("\n");

// bpe_merges = [tuple(merge_str.split()) for merge_str in bpe_data.split("\n")[1:-1]]
const bpe_merges = lines
  .slice(1, lines.length - 1)
  .map((x: string) => x.split(/(\s+)/).filter((s) => !!s.trim()));

const byte_encoder = bytes_to_unicode();
const byte_decoder: Record<string, string> = {};
Object.keys(byte_encoder).map((x) => {
  byte_decoder[byte_encoder[parseInt(x, 10)]] = x;
});

const bpe_ranks = dictZip(bpe_merges, range(0, bpe_merges.length));
const cache: Record<string, string> = {};

function bpe(token: string) {
  if (token in cache) {
    return cache[token];
  }

  let word = token.split("");

  let pairs = get_pairs(word);

  if (!pairs) {
    return token;
  }

  while (true) {
    const minPairs: Record<number, [string, string]> = {};
    Array.from(pairs).map((pair) => {
      const rank = bpe_ranks[pair.join(",")];
      minPairs[isNaN(rank) ? 10e10 : rank] = pair;
    });

    const bigram: [string, string] | undefined =
      minPairs[
        Math.min(
          ...Object.keys(minPairs).map((x) => {
            return parseInt(x);
          })
        )
      ];

    if (bigram && bigram.length === 2 && !(bigram.join(",") in bpe_ranks)) {
      break;
    }
    if (bigram?.length !== 2) break;

    const first = bigram[0];
    const second = bigram[1];
    let new_word: any[] = [];
    let i = 0;

    while (i < word.length) {
      const j = word.indexOf(first, i);
      if (j === -1) {
        new_word = new_word.concat(word.slice(i));
        break;
      }
      new_word = new_word.concat(word.slice(i, j));
      i = j;

      if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
        new_word.push(first + second);
        i = i + 2;
      } else {
        new_word.push(word[i]);
        i = i + 1;
      }
    }

    word = new_word;
    if (word.length === 1) {
      break;
    } else {
      pairs = get_pairs(word);
    }
  }

  const result = word.join(" ");
  cache[token] = result;

  return result;
}

export const encode = memoize((text: string) => {
  if (!text) return [];
  let bpe_tokens: number[] = [];
  const matches = Array.from(text.matchAll(pat)).map((x) => x[0]);
  for (let token of matches) {
    token = encodeStr(token)
      .map((x) => byte_encoder[parseInt(x, 10)])
      .join("");

    const new_tokens = bpe(token)
      .split(" ")
      .map((x: string) => encoder[x as keyof typeof encoder]);
    bpe_tokens = bpe_tokens.concat(new_tokens);
  }
  return bpe_tokens;
});

export const decodeToken = memoize((token: number) => decoder[token]);

export const decode = (tokens: number[]) => {
  let text = tokens.map(decodeToken).join("");
  text = decodeStr(text.split("").map((x) => parseInt(byte_decoder[x], 10)));
  return text;
};
