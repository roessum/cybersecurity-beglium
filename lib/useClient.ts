"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True once mounted on the client; false during SSR and the first hydration render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Reads a localStorage value without a setState-in-effect. Returns null on the
 * server and when the key is absent.
 */
export function useLocalValue(key: string): string | null {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => localStorage.getItem(key),
    () => null
  );
}
