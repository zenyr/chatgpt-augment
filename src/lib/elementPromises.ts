const testText = (
  el: NodeListOf<Element> | HTMLElement | null,
  textReg?: RegExp
) =>
  !!(
    !textReg ||
    (el instanceof NodeList
      ? [...el].every((e) => textReg.test(e.textContent || ""))
      : el && textReg.test(el.textContent || ""))
  );

type WaitElementParams<E> = {
  selector: string;
  parent?: E;
  textReg?: RegExp;
  timeout?: number;
};

type WaitElementType<
  E extends HTMLElement,
  M extends boolean,
  A extends boolean
> = M extends false ? null : A extends true ? NodeListOf<E> : E;

export async function waitElement<
  E extends HTMLElement = HTMLElement,
  M extends boolean = true,
  A extends boolean = false
>(
  { selector, parent, textReg, timeout = 10_000 }: WaitElementParams<E>,
  waitMount: M,
  all: A = false as A
): Promise<WaitElementType<E, M, A>> {
  type El = NodeListOf<E> | E;
  let tgtEl: El | null;
  const t = timeout ? Date.now() + timeout : Number.POSITIVE_INFINITY;
  do {
    const fn = parent
      ? (all ? parent.querySelectorAll : parent.querySelector).bind(parent)
      : (all ? document.querySelectorAll : document.querySelector).bind(
          document
        );

    tgtEl = fn(selector) as El | null;
    const found = tgtEl instanceof NodeList ? !![...tgtEl].length : !!tgtEl;
    if (found !== waitMount) {
      if (waitMount) {
        // wait for mount but not found
        await new Promise((r) => setTimeout(r, 100));
      } else {
        // found, wait for unmount but now text doesn't match
        if (!testText(tgtEl, textReg)) break;
      }
    } else {
      // target status is matched
      if (waitMount) {
        // test text and return
        if (testText(tgtEl, textReg)) break;
      } else {
        // waited for unmount, now it's gone
        break;
      }
    }
  } while (Date.now() < t);
  return tgtEl as WaitElementType<E, M, A>;
}
