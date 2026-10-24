"use strict";
/* ===== «Pilares» (22-10-2026, Bachillerato: Filosofía 1.º e Historia de la Filosofía 2.º) =====
   Decisión del profesor (22-10): una sección propia, no una pestaña del Diccionario. El diccionario sirve para repasar;
   un pilar es un ejercicio duro: diez peldaños por la historia de un concepto (razón, idea, causa), y en cada uno
   comprender, aplicar, enlazar con lo ya subido y comprobar. Los mismos diez peldaños en las dos webs.
   Textos en pilares.js (PILARES). Sección #pilares; enlaces #pilares/<pilar> y #pilares/<pilar>-<n>.
   Progreso: solo en el navegador del alumno (localStorage «pilaresHechos», siempre dentro de try/catch). */

const plT = (k, v) => String((PILARES.t && PILARES.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const plBox = () => document.getElementById("pilaresbox");
const PL_CLAVE = "pilaresHechos";
const PL = { pilar: (PILARES.pilares[0] || {}).id, abrir: null };
function plHechos() { try { const o = JSON.parse(localStorage.getItem(PL_CLAVE) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
function plGuardar(o) { try { localStorage.setItem(PL_CLAVE, JSON.stringify(o)); } catch (e) { /* sin almacenamiento: no se recuerda */ } }
const plEsc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const plPilar = (id) => PILARES.pilares.find((p) => p.id === id);

/* Solo se enlaza lo que existe en la web en que se abre (en HF no está el tema 4 de Filosofía, por ejemplo);
   lo que no existe no se muestra. Mismo criterio que el Itinerario de lógica (logicaview.js). */
function plHay(h) {
  const m = /^#([\w-]+)(?:\/(.+))?$/.exec(h || ""); if (!m) return false;
  if (m[1] === "pilares") return true;
  const VL = window.VIEW_LOADERS || {}, ld = VL[m[1]];
  if (!ld || typeof window[ld] !== "function" || !document.getElementById(m[1])) return false;
  const ok = typeof ROUTE_KEY_OK !== "undefined" && ROUTE_KEY_OK[m[1]];
  return !m[2] || !ok || ok(m[2]);
}

function plPeldano(p, v, hechos, abierto) {
  const hecho = hechos.includes(v.n);
  const enl = (v.enl || []).filter((x) => plHay(x.h));
  return '<details class="pl-nivel' + (hecho ? " pl-hecho" : "") + '" id="pl-' + p.id + "-" + v.n + '" data-ep="' + plEsc(v.epoca || "int") + '"' + (abierto ? " open" : "") + ">" +
    '<summary><span class="pl-n">' + plEsc(plT("peldano", { n: v.n })) + "</span>" + '<span class="pl-tit">' + v.titulo + "</span>" +
      (v.quien ? '<span class="pl-quien">' + plEsc(v.quien) + "</span>" : "") + "</summary>" +
    '<div class="pl-cuerpo">' +
      '<p class="pl-dice">' + v.dice + "</p>" +
      (v.cita ? '<blockquote class="pl-cita"><p>' + v.cita.t + "</p><cite>" + v.cita.ref + "</cite></blockquote>" : "") +
      '<div class="pl-tarea pl-aplica"><p class="pl-k">' + plEsc(plT("aplica")) + "</p><p>" + v.aplica + "</p></div>" +
      '<div class="pl-tarea pl-enlaza"><p class="pl-k">' + plEsc(plT("enlaza")) + "</p><p>" + v.enlaza + "</p></div>" +
      '<div class="pl-tarea pl-comprueba"><p class="pl-k">' + plEsc(plT("comprueba")) + "</p><p>" + v.comprueba + "</p>" +
        '<details class="pl-sale"><summary>' + plEsc(plT("sale")) + "</summary><p>" + v.sale + "</p></details></div>" +
      '<p class="pl-lim"><strong>' + plEsc(plT("limite")) + "</strong> " + v.limite + "</p>" +
      (enl.length ? '<p class="pl-enl"><strong>' + plEsc(plT("seguir")) + "</strong> " + enl.map((x) => '<a href="' + x.h + '">' + plEsc(x.t) + "</a>").join(" · ") + "</p>" : "") +
      '<label class="pl-check"><input type="checkbox" data-plhecho="' + p.id + ":" + v.n + '"' + (hecho ? " checked" : "") + "> " + plEsc(plT("hecho")) + "</label>" +
    "</div></details>";
}

function plProgreso(p, hechos) {
  return hechos.length ? plT("progreso", { n: hechos.length, t: p.niveles.length }) : plT("progresoNada");
}

function plRender() {
  const box = plBox(); if (!box) return;
  const p = plPilar(PL.pilar) || PILARES.pilares[0]; if (!p) return;
  const todos = plHechos(), hechos = Array.isArray(todos[p.id]) ? todos[p.id] : [];
  const abrir = PL.abrir != null ? PL.abrir : (p.niveles.find((v) => !hechos.includes(v.n)) || {}).n;
  box.innerHTML =
    '<p class="pl-intro">' + plT("intro") + "</p>" +
    '<details class="pl-como"><summary>' + plEsc(plT("comoTit")) + "</summary><ol>" + (PILARES.t.como || []).map((x) => "<li>" + x + "</li>").join("") + "</ol></details>" +
    '<div class="fgroup pl-pilares" role="group" aria-label="' + plEsc(plT("elegir")) + '">' +
      PILARES.pilares.map((x) => '<button type="button" class="fbtn" data-plpilar="' + x.id + '" aria-pressed="' + (x.id === p.id) + '">' + plEsc(x.titulo) + "</button>").join("") + "</div>" +
    '<section class="pl-pilar" aria-labelledby="pl-tit-' + p.id + '">' +
      '<h2 class="pl-titulo" id="pl-tit-' + p.id + '">' + plEsc(p.titulo) + (p.voces ? ' <span class="pl-voces">' + p.voces + "</span>" : "") + "</h2>" +
      '<p class="pl-lema">' + p.lema + "</p>" +
      '<p class="pl-prog" aria-live="polite">' + plEsc(plProgreso(p, hechos)) + "</p>" +
      '<div class="pl-escalera">' + p.niveles.map((v) => plPeldano(p, v, hechos, v.n === abrir)).join("") + "</div>" +
      (p.cierre ? '<p class="pl-cierre">' + p.cierre + "</p>" : "") +
    "</section>";
}

function plWire() {
  const box = plBox(); if (!box || box.dataset.plWired) return;
  box.dataset.plWired = "1";
  box.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-plpilar]"); if (!b) return;
    PL.pilar = b.dataset.plpilar; PL.abrir = null; plRender();
  });
  box.addEventListener("change", (ev) => {
    const c = ev.target.closest("input[data-plhecho]"); if (!c) return;
    const [id, n] = c.dataset.plhecho.split(":"), o = plHechos(), l = new Set(Array.isArray(o[id]) ? o[id] : []);
    if (c.checked) l.add(+n); else l.delete(+n);
    o[id] = [...l].sort((a, z) => a - z); plGuardar(o);
    const d = c.closest(".pl-nivel"); if (d) d.classList.toggle("pl-hecho", c.checked);
    const pr = box.querySelector(".pl-prog"), p = plPilar(id); if (pr && p) pr.textContent = plProgreso(p, o[id]);
  });
}

/* #pilares, #pilares/causa, #pilares/causa-4 */
function loadPilares(arg) {
  const m = /^([a-z]+)(?:-(\d+))?$/.exec(arg || "");
  if (m && plPilar(m[1])) { PL.pilar = m[1]; PL.abrir = m[2] ? +m[2] : null; }
  plWire(); plRender();
  if (m && m[2]) { const d = document.getElementById("pl-" + PL.pilar + "-" + m[2]); if (d && d.scrollIntoView) d.scrollIntoView({ block: "start" }); }
  PL.abrir = null;
}
if (plBox()) { plWire(); plRender(); }
