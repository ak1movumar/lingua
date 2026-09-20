type ScrollTarget = { style: { overflow: string } };
const locks = new WeakMap<ScrollTarget, { count: number; original: string }>();
/** Nested dialogs must not restore another dialog's temporary hidden overflow. */
export function acquireScrollLock(target: ScrollTarget) {
  const state = locks.get(target) ?? {
    count: 0,
    original: target.style.overflow,
  };
  state.count += 1;
  locks.set(target, state);
  target.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.count -= 1;
    if (state.count === 0) {
      target.style.overflow = state.original;
      locks.delete(target);
    }
  };
}
