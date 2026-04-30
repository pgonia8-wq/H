import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

function applyLock() {
  if (lockCount === 0) {
    const root = document.getElementById("root");
    savedScrollY = root ? root.scrollTop : window.scrollY;
    document.body.classList.add("modal-open");
    if (root) root.style.top = `-${savedScrollY}px`;
  }
  lockCount += 1;
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const root = document.getElementById("root");
    document.body.classList.remove("modal-open");
    if (root) {
      root.style.top = "";
      root.scrollTop = savedScrollY;
    }
  }
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    let isLocked = false; // Flag local para este useEffect

    if (active) {
      applyLock();
      isLocked = true;
    }

    return () => {
      // SOLO liberar si este useEffect específico activó el lock
      if (isLocked) {
        releaseLock();
      }
    };
  }, [active]);
}

export default useBodyScrollLock;
