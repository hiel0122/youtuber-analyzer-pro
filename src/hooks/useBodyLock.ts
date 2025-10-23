import { useEffect } from "react";

export function useBodyLock(locked: boolean) {
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", locked);
    return () => document.body.classList.remove("overflow-hidden");
  }, [locked]);
}
