import { parse } from "chrono-node";
import compose from "lodash/fp/compose";
import memoize from "lodash/memoize";
import { emojify } from "node-emoji";

const tryChrono = (input: string | Error) => {
  if (input instanceof Error || !parse) return input;
  const results = parse(input, new Date());
  if (results.length === 0) return input; // continue
  if (results.length > 1) return input; // don't know how to deal with this
  const [res] = results;

  const { start, end } = res;
  const isHourCertain = start.isCertain("hour");
  if (isHourCertain) {
    // datetime
    if (!end) return start.date().toISOString();
    return `${start.date().toISOString()} - ${end.date().toISOString()}`;
  } else {
    // date
    if (!end) return start.date().toISOString().slice(0, 10);
    return `${start.date().toISOString().slice(0, 10)} - ${end
      .date()
      .toISOString()
      .slice(0, 10)}`;
  }
};

const tryEmoji = (input: string | Error) => {
  if (input instanceof Error || !emojify) return input;
  return emojify(input);
};

const tryStringify = (input: string | Error) => {
  if (input instanceof Error) return input;
  if (!input.startsWith("stringify: ")) return input;
  try {
    return JSON.stringify(input.slice(11));
  } catch (e) {
    if (e instanceof Error) return e;
  }
};

const tryURLDecode = (input: string | Error) => {
  if (input instanceof Error) return input;
  if (!input.startsWith("urldecode: ")) return input;
  try {
    return decodeURIComponent(input.slice(11));
  } catch (e) {
    if (e instanceof Error) return e;
  }
};

const tryMacros = memoize(
  (macros: Record<string, string>) => (input: string | Error) => {
    if (input instanceof Error) return input;
    let target = input.trim();
    const found = Object.entries(macros).find(([k]) => {
      if (k === target) {
        return true;
      }
    });
    if (!found) return input;
    const [k, v] = found;
    return input.replace(k, v);
  }
);
export const getTextExpander: (
  macros: Record<string, string>
) => (t: string) => string | Error = (macros) =>
  compose(tryChrono, tryEmoji, tryStringify, tryURLDecode, tryMacros(macros));
