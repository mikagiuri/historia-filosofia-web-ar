"use strict";
/* ===== Vista de mapas conceptuales ===== depende de: maps.js + markmap (autoloader) =====
   Markmap se carga por CDN (markmap-autoloader). Aquí usamos su API
   (window.markmap.Transformer / Markmap) para dibujar bajo demanda. */

let mapKey = Object.keys(MAPS)[0];
let _mm = null, _tf = null, _pending = false;
let mapSubject = "all", mapBlock = "all";
let mapAmb = "all";   // (12-10) 1.º: fila «Ámbito»

const MAP_SUBJECTS = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة", ipc: "التفكير النقدي" };
const MAP_EPOCAS = { ant: "القديمة", med: "الوسيطة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة" };
/* (12-10) criterio del profesor: en 1.º Mapas criba por ámbito filosófico (orden del curso). Los dos mapas de 1.º
   sin número en el rótulo van con Conocimiento (EDITABLE: mapas nuevos de 1.º sin «Tema N», apuntarlos aquí). */
const MAP_AMBS = { int: "مدخل", ant: "الأنثروبولوجيا", con: "المعرفة", met: "ميتافيزيقا", log: "المنطق", eti: "الأخلاق", pol: "السياسة", est: "علم الجمال" };
const MAP_AMB_ORDEN = ["int", "ant", "con", "met", "log", "eti", "pol", "est"];
const MAP_AMB_CLAVE = { "map-filosofia-ciencia": "con", "map-racionalismo-empirismo": "con" };
function mapEsFil(){ return typeof SUBJECTS !== "undefined" && !!SUBJECTS.fil && !SUBJECTS.hf; }
function mapAmbOf(k, m){
  if (MAP_AMB_CLAVE[k]) return MAP_AMB_CLAVE[k];
  const T = String(m && m.tema || "");
  if (/·\s*M(?:\s|$|\()/.test(T)) return "met";
  const mm = /(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/.exec(T);   /* rótulo ya traducido (EU «5. gaia»…) */
  const n = mm ? +(mm[1] || mm[2]) : null;
  return ({ 1: "int", 2: "ant", 3: "con", 4: "log", 5: "eti", 6: "pol", 7: "est" })[n] || null;
}
function renderMapFilter(){
  const box = document.getElementById("mapfilter");
  if (!box) return;
  const subjBtns = ["all", "fil", "hf", "ipc"].map(s =>
    '<button class="fbtn" data-subj="' + s + '" aria-pressed="' + (s === mapSubject) + '">' +
    (s === "all" ? "الكل" : MAP_SUBJECTS[s]) + '</button>').join("");
  let blockBtns = "";
  if (mapSubject === "hf"){
    blockBtns = ["all", "ant", "med", "mod", "ilu", "con"].map(b =>
      '<button class="fbtn" data-era="' + b + '" aria-pressed="' + (b === mapBlock) + '">' +
      (b === "all" ? "الكل" : MAP_EPOCAS[b]) + '</button>').join("");
  }
  let ambBtns = "";   // (12-10) 1.º: criba por ámbito, en el orden del curso
  if (mapEsFil()){
    const amb = MAP_AMB_ORDEN.filter(r => Object.keys(MAPS).some(k => MAPS[k].subject === "fil" && mapAmbOf(k, MAPS[k]) === r));
    if (mapAmb !== "all" && !amb.includes(mapAmb)) mapAmb = "all";
    ambBtns = ["all"].concat(amb).map(b =>
      '<button class="fbtn" data-amb="' + b + '" aria-pressed="' + (b === mapAmb) + '">' +
      (b === "all" ? "الكل" : MAP_AMBS[b]) + '</button>').join("");
  }
  box.innerHTML = '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' +
    (blockBtns ? '<div class="fgroup"><span class="flabel">العصر</span>' + blockBtns + '</div>' : '') +
    (ambBtns ? '<div class="fgroup"><span class="flabel">المجال</span>' + ambBtns + '</div>' : '');
  box.querySelectorAll("[data-subj]").forEach(b => b.addEventListener("click", () => {
    mapSubject = b.dataset.subj;
    if (mapSubject !== "hf") mapBlock = "all";
    renderMapFilter(); renderMapChips();
  }));
  box.querySelectorAll("[data-era]").forEach(b => b.addEventListener("click", () => {
    mapBlock = b.dataset.era;
    renderMapFilter(); renderMapChips();
  }));
  box.querySelectorAll("[data-amb]").forEach(b => b.addEventListener("click", () => {
    mapAmb = b.dataset.amb;
    renderMapFilter(); renderMapChips();
  }));
}

function renderMapChips(){
  const box = document.getElementById("mapchips");
  const entries = Object.entries(MAPS).filter(([k, m]) => {
    if (mapSubject !== "all" && m.subject !== mapSubject) return false;
    if (mapSubject === "hf" && mapBlock !== "all" && window.Epocas && window.Epocas.epocaDe("mapas", k, m) !== mapBlock) return false;
    if (mapEsFil() && mapAmb !== "all" && mapAmbOf(k, m) !== mapAmb) return false;
    return true;
  });
  box.innerHTML = entries
    .map(([k, m]) => `<button class="chip" data-mp="${k}" aria-pressed="${k === mapKey}">${m.title}</button>`).join("");
  box.querySelectorAll("[data-mp]").forEach(b => b.addEventListener("click", () => loadMap(b.dataset.mp)));
}

function _ready(){
  const mk = window.markmap;
  return mk && typeof mk.Transformer === "function" && mk.Markmap && typeof mk.Markmap.create === "function";
}

function drawMap(){
  const m = MAPS[mapKey];
  if (!m) return;
  const head = document.getElementById("maphead");
  if (head) head.innerHTML = '<span class="kick" style="color:var(--' + m.subject + ')">' + m.tema + '</span><h2>' + m.title + '</h2>';

  if (!_ready()){                 // Markmap aún cargando desde el CDN: reintentar
    if (_pending) return;
    _pending = true;
    const mk = window.markmap;
    const again = () => { _pending = false; drawMap(); };
    if (mk && mk.autoLoader && mk.autoLoader.ready && typeof mk.autoLoader.ready.then === "function") mk.autoLoader.ready.then(again, () => setTimeout(again, 200));
    else setTimeout(again, 200);
    return;
  }

  const mk = window.markmap;
  if (!_tf) _tf = new mk.Transformer();
  const data = _tf.transform(m.md).root;
  const svg = document.getElementById("mapsvg");
  if (!_mm) _mm = mk.Markmap.create(svg, { autoFit: false, initialExpandLevel: 3, colorFreezeLevel: 2, spacingVertical: 6, spacingHorizontal: 90, paddingX: 16, duration: 250 }, data);
  else _mm.setData(data);
  requestAnimationFrame(() => { try { _mm.fit(); } catch (e) {} });
}

function loadMap(k){
  if (!(k in MAPS)) return;
  mapKey = k;
  renderMapChips();
  drawMap();
}

renderMapFilter();
renderMapChips();
/* Forzar que el autoloader cargue sus dependencias (d3, markmap-view, markmap-lib)
   aunque no haya elementos .markmap que auto-renderizar. */
(function(){
  const al = window.markmap && window.markmap.autoLoader;
  if (al && typeof al.renderAll === "function") { try { al.renderAll(); } catch (e) {} }
})();
/* Redibujar/ajustar al entrar en la pestaña Mapas (la vista está oculta al cargar,
   así que el primer dibujo se hace cuando ya es visible y tiene tamaño). */
(function(){
  const tab = document.querySelector('#tabs [data-view="mapas"]');
  if (tab) tab.addEventListener("click", () => requestAnimationFrame(drawMap));
})();
