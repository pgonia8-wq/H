import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

function applyLock() {
  if (lockCount === 0) {
    const root = document.getElementById("root");
    savedScrollY = root ? root.scrollTop : window.scrollY;
    document.body.classList.add("modal-open");
    if (root) {
      root.style.top = `-${savedScrollY}px`;
    }
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
      
      // EL TRUCO PARA ANDROID: Al pedirle el offsetHeight, 
      // obligamos al navegador a redibujar la pantalla inmediatamente (Force Repaint).
      void root.offsetHeight; 
      
      // El pequeño retraso para que iOS/Safari no colapse
      setTimeout(() => {
        root.scrollTop = savedScrollY;
      }, 10);
    }
  }
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    // Si está activo, aplicamos candado.
    if (active) {
      applyLock();
      // Solo liberamos cuando este modal en específico se cierre.
      return () => releaseLock();
    }
  }, [active]);
}

export default useBodyScrollLock;
