"use strict";
/* Menú móvil: el botón ☰ abre/cierra el menú; dentro, los grupos son plegables
   (acordeón), así que al abrir solo se ven Inicio + los 5 grupos. En escritorio el
   botón y los encabezados están ocultos (mobile.css) y esto no tiene efecto visible. */
(function () {
  const t = document.getElementById("navtoggle");
  const tabs = document.getElementById("tabs");
  if (!t || !tabs) return;
  const secs = Array.prototype.slice.call(tabs.querySelectorAll(".navsec"));

  function collapseAll() {
    secs.forEach(function (s) {
      s.classList.remove("open");
      const g = s.querySelector(".navgroup");
      if (g) g.setAttribute("aria-expanded", "false");
    });
  }
  function openSec(s) {
    s.classList.add("open");
    const g = s.querySelector(".navgroup");
    if (g) g.setAttribute("aria-expanded", "true");
  }
  function closeMenu() { tabs.classList.remove("open"); t.setAttribute("aria-expanded", "false"); collapseAll(); }
  function openMenu() {
    tabs.classList.add("open"); t.setAttribute("aria-expanded", "true");
    collapseAll();
    /* desplegar el grupo de la sección activa, para dar contexto */
    const cur = tabs.querySelector('button[aria-current="true"]');
    const sec = cur && cur.closest(".navsec");
    if (sec) openSec(sec);
  }

  t.addEventListener("click", function (e) { e.stopPropagation(); tabs.classList.contains("open") ? closeMenu() : openMenu(); });

  /* Acordeón: al pulsar un encabezado de grupo, abrir ese (y cerrar los demás). */
  secs.forEach(function (s) {
    const g = s.querySelector(".navgroup");
    if (!g) return;
    function toggleSec(e) { e.stopPropagation(); const wasOpen = s.classList.contains("open"); collapseAll(); if (!wasOpen) openSec(s); }
    g.addEventListener("click", toggleSec);
    /* Teclado (patrón «botón de menú»): Enter/Espacio/↓ abren y llevan al primer elemento,
       ↑ al último; dentro, ↑↓ recorren (circular), Inicio/Fin saltan a los extremos y Escape
       cierra devolviendo el foco al encabezado. Al salir el foco del grupo, se cierra. */
    const m = s.querySelector(".navmenu");
    function items() { return m ? Array.prototype.filter.call(m.querySelectorAll("button"), function (b) { return !b.hidden && !b.disabled && b.offsetParent !== null; }) : []; }
    function focusItem(i) { const it = items(); if (it.length) it[i < 0 ? it.length - 1 : i].focus(); }
    g.addEventListener("keydown", function (e) {
      const isOpen = s.classList.contains("open");
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSec(e); if (!isOpen) focusItem(0); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); if (!isOpen) { collapseAll(); openSec(s); } focusItem(e.key === "ArrowDown" ? 0 : -1); }
      else if (e.key === "Escape" && isOpen) { e.stopPropagation(); collapseAll(); }
    });
    if (m) m.addEventListener("keydown", function (e) {
      const it = items(), i = it.indexOf(document.activeElement);
      if (i < 0) return;
      let n = -1;
      if (e.key === "ArrowDown") n = (i + 1) % it.length;
      else if (e.key === "ArrowUp") n = (i - 1 + it.length) % it.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = it.length - 1;
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); collapseAll(); g.focus(); return; }
      else return;
      e.preventDefault(); it[n].focus();
    });
    s.addEventListener("focusout", function (e) {
      if (s.classList.contains("open") && e.relatedTarget && !s.contains(e.relatedTarget)) { s.classList.remove("open"); g.setAttribute("aria-expanded", "false"); }
    });
  });

  /* Al pulsar una sección (botón con data-view), cerrar el menú. */
  tabs.addEventListener("click", function (e) { if (e.target.closest("button[data-view]")) closeMenu(); });
  /* Cerrar al pulsar fuera: en móvil con el menú ☰ abierto; en escritorio cuando
     hay un "cajón" desplegado (.navsec.open). */
  document.addEventListener("click", function (e) {
    const anyOpen = tabs.classList.contains("open") || tabs.querySelector(".navsec.open");
    if (anyOpen && !tabs.contains(e.target) && e.target !== t) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    const back = tabs.classList.contains("open") && tabs.contains(document.activeElement);  // foco dentro del menú ☰: volver al botón
    closeMenu(); if (back) t.focus();
  });
})();
