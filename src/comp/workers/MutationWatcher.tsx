import { useSelector, useSelectors } from "@/lib/hooks/useTarget";
import { useEffect, useState } from "react";
import { EditWatcher } from "./EditWatcher";
import { ContinueClicker } from "./ContinueClicker";

export const MutationWatcher = () => {
  const continueEl = useSelector(
    "form .h-full.justify-center button:nth-of-type(2)"
  );
  const editEls = useSelectors("main .group textarea + div");

  const [t, setT] = useState(0);
  const [mountT] = useState(Date.now());
  const shouldWait = t - mountT < 3000;
  useEffect(() => void setT(Date.now()), [continueEl]);

  return (
    <>
      {!shouldWait && continueEl && <ContinueClicker node={continueEl} />}
      {editEls.map((node, idx) => (
        <EditWatcher key={`${idx}_${editEls.length}`} node={node} />
      ))}
    </>
  );
};
