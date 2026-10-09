import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` khi render ở server và lần hydrate đầu, `true` sau đó — thay cho `useEffect(() => setMounted(true))` */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
