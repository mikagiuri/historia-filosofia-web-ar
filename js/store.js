"use strict";
/* Almacenamiento seguro en el navegador (envuelto en try/catch). */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
/* (DUA D0.2, 23-10) Desplazamiento «smooth» o «auto»: mira prefers-reduced-motion
   y, para el futuro panel «Aa», <html data-motion="reduce">. */
window.A11y = window.A11y || {};
A11y.motion = function(){
  try {
    if (document.documentElement.dataset.motion === "reduce") return "auto";
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return "auto";
  } catch (e) {}
  return "smooth";
};
