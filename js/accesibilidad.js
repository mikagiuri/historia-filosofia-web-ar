/* accesibilidad.js — DUA, Ola 1 (ficha D1.2): el panel de lectura «Aa».
 *
 * Decisiones del profesor del 24-10 (docs/36): panel completo (P1), fuentes Atkinson
 * Hyperlegible, la del sistema y OpenDyslexic como preferencia personal (P2), y
 * también en la ESO (P7). «Escuchar esta página» va aparte, en js/escuchar.js.
 *
 * Cómo funciona. Cada ajuste es un atributo de <html> (data-a11y-*, data-motion) y
 * css/accesibilidad.css hace el resto; el tamaño cambia html{font-size}, y como las
 * hojas van en rem (DUA D0.3) todo crece a la vez. Si no se toca nada, no se pone
 * ningún atributo y la web se ve como siempre. Los ajustes se guardan en el propio
 * dispositivo, en la clave «aula-a11y», que «Mi progreso» no exporta (progreso.js).
 * El panel es un popover fijo: no ocupa sitio ni desplaza contenido (regla 4.1).
 */
(function () {
  "use strict";

  var KEY = "aula-a11y";
  var DEF = { tam: "100", lh: "normal", esp: "normal", fuente: "web", izq: false, contraste: false, mov: false };
  var ATKINSON = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
  var html = document.documentElement;

  function leer() {
    var s = store.get(KEY, {}) || {}, o = {};
    for (var k in DEF) o[k] = Object.prototype.hasOwnProperty.call(s, k) ? s[k] : DEF[k];
    return o;
  }
  var st = leer();

  function attr(nombre, valor) {
    if (valor) html.setAttribute(nombre, valor === true ? "" : valor);
    else html.removeAttribute(nombre);
  }

  /* Atkinson se pide a Google Fonts solo cuando alguien la elige (como las demás letras
     de la web). OpenDyslexic va en media/fuentes y su @font-face solo se descarga al usarla. */
  function cargarAtkinson() {
    if (document.getElementById("a11y-atkinson")) return;
    var l = document.createElement("link");
    l.id = "a11y-atkinson"; l.rel = "stylesheet"; l.href = ATKINSON;
    document.head.appendChild(l);
  }

  function aplicar() {
    html.style.fontSize = st.tam === "100" ? "" : st.tam + "%";
    attr("data-a11y-lh", st.lh === "amplio" ? "amplio" : null);
    attr("data-a11y-esp", st.esp === "amplio" ? "amplio" : null);
    /* En árabe la letra no cambia: sigue Noto (GUIA_TRADUCCION_ar.md); solo tamaño y espaciado. */
    var fuente = html.lang === "ar" ? "web" : st.fuente;
    attr("data-a11y-fuente", fuente === "web" ? null : fuente);
    if (fuente === "atkinson") cargarAtkinson();
    attr("data-a11y-izq", !!st.izq);
    attr("data-a11y-contraste", !!st.contraste);
    if (st.mov) html.dataset.motion = "reduce"; else delete html.dataset.motion;
  }
  aplicar();

  function guardar() {
    var cambiado = false;
    for (var k in DEF) if (st[k] !== DEF[k]) cambiado = true;
    store.set(KEY, cambiado ? st : {});
    aplicar();
    pintar();
  }

  var btn = document.getElementById("a11ybtn");
  var panel = document.getElementById("a11ypanel");
  if (!btn || !panel) return;

  /* Refleja el estado en los controles. */
  function pintar() {
    panel.querySelectorAll(".a11y-seg").forEach(function (seg) {
      var clave = seg.getAttribute("data-a11y");
      seg.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === st[clave]));
      });
    });
    panel.querySelectorAll('input[type="checkbox"][data-a11y]').forEach(function (c) {
      c.checked = !!st[c.getAttribute("data-a11y")];
    });
    var sel = document.getElementById("a11yfuente");
    if (sel) sel.value = st.fuente;
    var nota = document.getElementById("a11ynotaod");
    if (nota) nota.hidden = st.fuente !== "opendyslexic";
  }

  panel.querySelectorAll(".a11y-seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]");
      if (!b) return;
      st[seg.getAttribute("data-a11y")] = b.getAttribute("data-v");
      guardar();
    });
  });
  panel.querySelectorAll('input[type="checkbox"][data-a11y]').forEach(function (c) {
    c.addEventListener("change", function () { st[c.getAttribute("data-a11y")] = c.checked; guardar(); });
  });
  var selFuente = document.getElementById("a11yfuente");
  if (selFuente) {
    if (html.lang === "ar") { var fila = selFuente.closest(".a11y-fila"); if (fila) fila.hidden = true; }
    selFuente.addEventListener("change", function () { st.fuente = selFuente.value; guardar(); });
  }
  var reset = document.getElementById("a11yreset");
  if (reset) reset.addEventListener("click", function () {
    for (var k in DEF) st[k] = DEF[k];
    guardar();
  });

  /* Abrir y cerrar: con el botón, con Esc o pulsando fuera. El panel no es modal. */
  function colocar() {
    var r = btn.getBoundingClientRect();
    panel.style.setProperty("--a11y-top", Math.round(r.bottom + 6) + "px");
  }
  function abrir() {
    colocar(); pintar();
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var primero = panel.querySelector("button, select, input");
    if (primero) primero.focus();
  }
  function cerrar(devolverFoco) {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (devolverFoco) btn.focus();
  }
  btn.addEventListener("click", function () { if (panel.hidden) abrir(); else cerrar(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { e.stopPropagation(); cerrar(true); }
  }, true);
  document.addEventListener("pointerdown", function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) cerrar(false);
  });
  window.addEventListener("resize", function () { if (!panel.hidden) colocar(); });

  window.A11y = window.A11y || {};
  A11y.cerrarPanel = cerrar;
})();
