"use strict";
/* ===== Vista Genealogías ===== depende de: genealogias.js (GENEALOGIAS), biografias.js (BIOGRAFIAS; opcional loadBiografia)
   (29-09) Plano de «metro» diacrónico: cada tradición es una línea horizontal de color y sus
   estaciones son pensadores, colocados en el orden en que nacieron (sin escala de años: lo que
   importa es la sucesión). Un pensador en varias líneas es un transbordo (cápsula vertical). Las
   oposiciones clave, en rojo discontinuo. Botones para mostrar u ocultar líneas y oposiciones;
   al ocultar líneas, el plano se recoloca y se compacta. */
const GEN_T = { lineas: "الخطوط", todas: "الكل", ninguna: "لا شيء", op: "التعارضات",
  none: "لا يوجد أي خط مفعّل: انقروا على خط لرؤيته.", hint: "اسحبوا للتنقل عبر التاريخ ←",
  mLineas: "مخطط الخطوط", mTesis: "شبكة الأطروحات", mVR: "أخضر أم أحمر؟", mCara: "وجهًا لوجه",
  ruta: "مساركم في الحجلة: {n} مفكرين على {m} خطوط. تظهر الخطوط التي سافرتم عليها (وفيها اثنان على الأقل من مفكريكم)، ويتبع الخط المنقّط ترتيب رحلتكم.",
  quitarRuta: "إزالة المسار", plano: "مخطط", planoGeneral: "التقاليد الكبرى" };   // (09-10) modos: plano, red de tesis y ejercicio (genealogias_tesisview.js)
const GEN_EPOCAS = [["ant", "القديمة"], ["med", "الوسيطة"], ["ren", "عصر النهضة"], ["mod", "الحديثة"], ["ilu", "الأنوار"], ["con", "المعاصرة"]];
/* (30-09) al entrar, solo dos líneas activas (con todas a la vez el plano abruma); «Todas» sigue a un clic */
const GEN_DEFECTO = ["idea", "dual"];
/* (18-10) plano activo: "" = el general (GENEALOGIAS); si no, uno de GENEALOGIAS_PLANOS, que se ve entero al entrar */
let genPlano = "";
function genG(){ if (genPlano && typeof GENEALOGIAS_PLANOS !== "undefined"){ const p = GENEALOGIAS_PLANOS.find(x => x.id === genPlano); if (p) return p; } return GENEALOGIAS; }
function genDefecto(){ if (genPlano) return new Set(); return new Set(typeof GENEALOGIAS === "undefined" ? [] : GENEALOGIAS.lineas.filter(l => !GEN_DEFECTO.includes(l.id)).map(l => "l:" + l.id)); }
let genHidden = genDefecto();
let genModo = "lineas";   // "lineas" | "tesis" | "verde-roja"
/* (11-10) «Tu recorrido en el metro»: los pensadores de un viaje de la Rayuela, en el orden del viaje (#genealogias/ruta/id,id…) */
let genRuta = null;
function genModos(){
  if (typeof GEN_TESIS === "undefined") return "";
  return '<div class="fgroup gen-modos" role="group">' + [["lineas", GEN_T.mLineas], ["tesis", GEN_T.mTesis], ["verde-roja", GEN_T.mVR]].concat(typeof window.polGenea === "function" ? [["cara-a-cara", GEN_T.mCara]] : [])
    .map(([k, l]) => '<button type="button" class="fbtn" data-gmodo="' + k + '" aria-pressed="' + (genModo === k) + '">' + l + "</button>").join("") + "</div>";
}

function genEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function genPerson(id){ return typeof BIOGRAFIAS !== "undefined" && BIOGRAFIAS[id] ? BIOGRAFIAS[id] : null; }

/* (18-10) selector de plano: el general y los temáticos */
function genPlanos(){
  if (typeof GENEALOGIAS_PLANOS === "undefined" || !GENEALOGIAS_PLANOS.length) return "";
  const p = genPlano ? GENEALOGIAS_PLANOS.find(x => x.id === genPlano) : null;
  return '<div class="fgroup gen-planos" role="group" aria-label="' + GEN_T.plano + '"><span class="flabel">' + GEN_T.plano + '</span>' +
    [["", GEN_T.planoGeneral]].concat(GENEALOGIAS_PLANOS.map(x => [x.id, x.name])).map(([k, l]) =>
      '<button type="button" class="fbtn" data-gplano="' + k + '" aria-pressed="' + (genPlano === k) + '">' + genEsc(l) + "</button>").join("") + "</div>" +
    (p && p.desc ? '<p class="gen-hint">' + genEsc(p.desc) + "</p>" : "");
}
function genLegend(){
  const G = genG();
  return '<div class="gen-legend" role="group" aria-label="' + GEN_T.lineas + '"><span class="flabel">' + GEN_T.lineas + '</span>' +
    G.lineas.map(l => '<button type="button" class="gen-leg" data-gfil="l:' + l.id + '" aria-pressed="' + !genHidden.has("l:" + l.id) + '" title="' + genEsc(l.desc) + '">' +
      '<i style="background:' + l.color + '"></i><span>' + genEsc(l.name) + '</span></button>').join("") +
    '<button type="button" class="gen-leg gen-leg-all" data-gfil="l:all">' + GEN_T.todas + '</button>' +
    '<button type="button" class="gen-leg gen-leg-all" data-gfil="l:none">' + GEN_T.ninguna + '</button>' +
    '<button type="button" class="gen-leg gen-leg-op" data-gfil="op" aria-pressed="' + !genHidden.has("op") + '">' +
      '<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M1,5 L27,5"/></svg><span>' + GEN_T.op + '</span></button></div>';
}

function genSvg(){
  const G = genG();
  const lines = G.lineas.filter(l => !genHidden.has("l:" + l.id))
    .map(l => Object.assign({}, l, { biografia: l.biografia.filter(genPerson).sort((a, b) => genPerson(a).born - genPerson(b).born) }))
    .filter(l => l.biografia.length);
  if (!lines.length) return '<p class="lead gen-none">' + GEN_T.none + '</p>';
  // estaciones: todos los pensadores visibles, en orden de nacimiento
  const ids = [...new Set(lines.flatMap(l => l.biografia))].sort((a, b) => genPerson(a).born - genPerson(b).born);
  const rank = new Map(ids.map((id, i) => [id, i]));
  const DX = 60, DY = 76, X0 = 300, Y0 = 118, padR = 120, LBL = 14;
  const W = X0 + (ids.length - 1) * DX + padR, H = Y0 + (lines.length - 1) * DY + 40;
  const xOf = id => X0 + rank.get(id) * DX;
  const laneOf = new Map();                       // id → carriles en los que aparece
  lines.forEach((l, li) => l.biografia.forEach(id => { if (!laneOf.has(id)) laneOf.set(id, []); laneOf.get(id).push(li); }));
  const yOf = li => Y0 + li * DY;

  let s = '<svg class="gen-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="الأنساب الفكرية">';
  // franja de épocas (según la época de cada pensador en Biografías)
  let i0 = 0;
  while (i0 < ids.length){
    const b = genPerson(ids[i0]).block; let i1 = i0;
    while (i1 + 1 < ids.length && genPerson(ids[i1 + 1]).block === b) i1++;
    const xa = X0 + i0 * DX - DX / 2, xb = X0 + i1 * DX + DX / 2, ep = GEN_EPOCAS.find(e => e[0] === b);
    s += '<rect class="gen-era" data-b="' + b + '" x="' + xa + '" y="6" width="' + (xb - xa - 2) + '" height="20" rx="6"/>';
    if (xb - xa > 60 && ep) s += '<text class="gen-era-lbl" x="' + (xa + 8) + '" y="20">' + ep[1] + '</text>';
    s += '<rect class="gen-era-band" data-b="' + b + '" x="' + xa + '" y="30" width="' + (xb - xa - 2) + '" height="' + (H - 34) + '"/>';
    i0 = i1 + 1;
  }
  // líneas (tramo horizontal de la primera a la última estación) y su nombre al principio
  lines.forEach((l, li) => {
    const y = yOf(li), xa = xOf(l.biografia[0]), xb = xOf(l.biografia[l.biografia.length - 1]);
    // nombre en la columna fija de la izquierda y guía punteada hasta la primera estación
    s += '<g class="gen-line" data-line="' + l.id + '">' +
      '<path class="gen-guide" d="M' + (X0 - 40) + ',' + y + ' L' + (xa - 14) + ',' + y + '" stroke="' + l.color + '"/>' +
      '<path class="gen-track" d="M' + (xa - 14) + ',' + y + ' L' + (xb + 14) + ',' + y + '" stroke="' + l.color + '"/>' +
      '<text class="gen-line-lbl" x="' + LBL + '" y="' + (y + 4) + '" fill="' + l.color + '">' + genEsc(l.name) + '</text></g>';
  });
  // transbordos: cápsula vertical que une las apariciones de un mismo pensador
  laneOf.forEach((ls, id) => {
    if (ls.length < 2) return;
    const x = xOf(id), ya = yOf(Math.min(...ls)), yb = yOf(Math.max(...ls));
    s += '<rect class="gen-xfer" x="' + (x - 5) + '" y="' + (ya - 5) + '" width="10" height="' + (yb - ya + 10) + '" rx="5"/>';
  });
  // oposiciones: arco rojo discontinuo entre la primera aparición de cada uno
  if (!genHidden.has("op")) (G.op || []).forEach(({ biografia: [a, b] }) => {
    if (!laneOf.has(a) || !laneOf.has(b)) return;
    const xa = xOf(a), ya = yOf(laneOf.get(a)[0]), xb = xOf(b), yb = yOf(laneOf.get(b)[0]);
    const lift = 34 + Math.min(60, Math.abs(xb - xa) / 6), top = Math.min(ya, yb) - lift;
    s += '<path class="gen-op" data-a="' + a + '" data-b="' + b + '" d="M' + xa + ',' + ya + ' C' + xa + ',' + top + ' ' + xb + ',' + top + ' ' + xb + ',' + yb + '"/>';
  });
  // (11-10) recorrido de la Rayuela: línea de puntos por los pensadores del viaje, en su orden
  const enRuta = id => !!(genRuta && genRuta.includes(id));
  if (genRuta){
    const pts = genRuta.filter(id => laneOf.has(id)).map(id => xOf(id) + "," + yOf(laneOf.get(id)[0]));
    if (pts.length > 1) s += '<path class="gen-rutapath" d="M' + pts.join(" L") + '"/>';
  }
  // estaciones y nombres (el nombre, una sola vez, en el carril más alto)
  lines.forEach((l, li) => l.biografia.forEach(id => {
    const x = xOf(id), y = yOf(li), first = laneOf.get(id)[0] === li;
    s += '<g class="gen-st' + (genRuta ? (enRuta(id) ? " gen-ruta" : " gen-noruta") : "") + '" data-biografia="' + id + '" data-line="' + l.id + '" tabindex="0" role="link" aria-label="' + genEsc(genPerson(id).name) + '">' +
      '<circle cx="' + x + '" cy="' + y + '" r="6" stroke="' + l.color + '"/>' +
      (first ? '<text class="gen-st-lbl" transform="translate(' + (x + 4) + ',' + (y - 11) + ') rotate(-38)">' + genEsc(genShort(genPerson(id).name, id)) + '</text>' : '') + '</g>';
  }));
  return s + '</svg>';
}
/* nombre corto para la estación: sin «de …»/«-koa» largos si pasa de 18 caracteres */
const GEN_CORTO = { ockham: "أوكام", lamettrie: "La Mettrie", ortega: "Ortega y Gasset" };   // donde la regla falla
function genShort(n, id){
  if (GEN_CORTO[id]) return GEN_CORTO[id];
  if (n.length <= 18) return n;
  const w = n.split(/\s+/);
  if (/\s(de|del|d'|von|van|della)\s/i.test(n) || /[kg]oa$/i.test(n)) return w[0];
  return w[w.length - 1];
}

function drawGenea(){
  const box = document.getElementById("geneabox"); if (!box || typeof GENEALOGIAS === "undefined") return;
  /* (11-10) «Cara a cara»: las polémicas entre coetáneos (polemicasview.js) */
  if (genModo === "cara-a-cara" && typeof window.polGenea === "function"){ box.innerHTML = genModos() + window.polGenea(); return; }
  if (genModo !== "lineas" && typeof genTesisRender === "function"){
    box.innerHTML = genModos() + '<div id="gentesisbox" data-modo="' + genModo + '"></div>'; genTesisRender(genModo); return;
  }
  const keep = box.querySelector(".gen-scroll"), sl = keep ? keep.scrollLeft : 0;
  const rutaInfo = genRuta ? (function(){
    const ls = genG().lineas.filter(l => !genHidden.has("l:" + l.id) && l.biografia.some(id => genRuta.includes(id)));
    return '<p class="gen-rutainfo">' + GEN_T.ruta.replace("{n}", genRuta.filter(id => ls.some(l => l.biografia.includes(id))).length).replace("{m}", ls.length) +
      ' <button type="button" class="btn ghost" data-gruta="off">' + GEN_T.quitarRuta + '</button></p>';
  })() : "";
  box.innerHTML = genModos() + genPlanos() + rutaInfo + genLegend() + '<p class="gen-hint">' + GEN_T.hint + '</p><div class="gen-scroll">' + genSvg() + '</div>';
  const sc = box.querySelector(".gen-scroll"); if (sc) sc.scrollLeft = sl;
}
/* enlace profundo #genealogias/<línea>: solo esa línea visible; #genealogias/tesis y #genealogias/verde-roja: los otros modos */
function loadGenea(k){
  if (typeof GENEALOGIAS === "undefined") return;
  /* (18-10) #genealogias/plano/<id>: un plano temático entero */
  const mp = /^plano\/([\w-]+)$/.exec(k || "");
  if (mp && typeof GENEALOGIAS_PLANOS !== "undefined" && GENEALOGIAS_PLANOS.some(x => x.id === mp[1])){ genPlano = mp[1]; genRuta = null; genModo = "lineas"; genHidden = genDefecto(); drawGenea(); return; }
  if (k === "tesis" || k === "verde-roja" || (k === "cara-a-cara" && typeof window.polGenea === "function")){ genModo = k; drawGenea(); return; }
  /* (11-10) #genealogias/tesis/<id>: la Red de tesis con esa tesis abierta (enlaces desde Nudos y Rayuela) */
  const mt = /^tesis\/([\w-]+)$/.exec(k || "");
  if (mt && typeof GT !== "undefined" && typeof GEN_TESIS !== "undefined" && GEN_TESIS.tesis.some(t => t.id === mt[1])){
    GT.sel = mt[1]; genModo = "tesis"; drawGenea();
    setTimeout(() => { const el = document.querySelector('#geneabox .gt-tesis[data-gt="' + mt[1] + '"]'); if (el) el.scrollIntoView({ block: "center" }); }, 60);
    return;
  }
  /* (11-10) #genealogias/ruta/id,id…: recorrido de la Rayuela; solo las líneas que lo tocan */
  const mr = /^ruta\/([\w,-]+)$/.exec(k || "");
  if (mr){
    genRuta = mr[1].split(",").filter(genPerson); genPlano = "";
    genModo = "lineas"; genHidden = new Set();
    /* las líneas con al menos dos pensadores del viaje (las que de verdad has recorrido); si no hay ninguna, las que toquen uno */
    const n = l => l.biografia.filter(id => genRuta.includes(id)).length, min = GENEALOGIAS.lineas.some(l => n(l) >= 2) ? 2 : 1;
    GENEALOGIAS.lineas.forEach(l => { if (n(l) < min) genHidden.add("l:" + l.id); });
    drawGenea(); return;
  }
  genRuta = null; genPlano = "";
  genModo = "lineas";
  genHidden = new Set();
  if (k && GENEALOGIAS.lineas.some(l => l.id === k)) GENEALOGIAS.lineas.forEach(l => { if (l.id !== k) genHidden.add("l:" + l.id); });
  else genHidden = genDefecto();
  drawGenea();
}

document.addEventListener("click", e => {
  const m = e.target.closest && e.target.closest("#geneabox [data-gmodo]");
  if (m){ genModo = m.dataset.gmodo; drawGenea(); if (typeof setDeepHash === "function") setDeepHash("genealogias", genModo === "lineas" ? "" : genModo); const again = document.querySelector('#geneabox [data-gmodo="' + genModo + '"]'); if (again) again.focus(); return; }
  const pl = e.target.closest && e.target.closest("#geneabox [data-gplano]");
  if (pl){ genPlano = pl.dataset.gplano; genRuta = null; genHidden = genDefecto(); drawGenea(); if (typeof setDeepHash === "function") setDeepHash("genealogias", genPlano ? "plano/" + genPlano : ""); const again = document.querySelector('#geneabox [data-gplano="' + genPlano + '"]'); if (again) again.focus(); return; }
  const q = e.target.closest && e.target.closest("#geneabox [data-gruta]");
  if (q){ genRuta = null; genHidden = genDefecto(); drawGenea(); if (typeof setDeepHash === "function") setDeepHash("genealogias", ""); return; }
  const b = e.target.closest && e.target.closest("#geneabox [data-gfil]");
  if (b){
    const k = b.dataset.gfil;
    if (k === "l:all") genG().lineas.forEach(l => genHidden.delete("l:" + l.id));
    else if (k === "l:none") genG().lineas.forEach(l => genHidden.add("l:" + l.id));
    else genHidden.has(k) ? genHidden.delete(k) : genHidden.add(k);
    drawGenea();
    const again = document.querySelector('#geneabox [data-gfil="' + k + '"]'); if (again) again.focus();
    return;
  }
  const st = e.target.closest && e.target.closest("#geneabox .gen-st[data-biografia]");
  if (st && typeof loadBiografia === "function"){ (window.show || show)("biografias"); loadBiografia(st.dataset.biografia); }
});
document.addEventListener("keydown", e => {
  const st = e.target.closest && e.target.closest("#geneabox .gen-st[data-biografia]");
  if (st && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); st.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});
/* resaltar una línea (y sus oposiciones) al pasar por ella; el resto se apaga */
document.addEventListener("mouseover", e => {
  const svg = e.target.closest && e.target.closest("#geneabox .gen-svg"); if (!svg) return;
  const g = e.target.closest("[data-line]"), id = g ? g.dataset.line : null;
  svg.classList.toggle("gen-focus", !!id);
  svg.querySelectorAll("[data-line]").forEach(x => x.classList.toggle("on", x.dataset.line === id));
  const on = new Set([...svg.querySelectorAll('.gen-st.on')].map(x => x.dataset.biografia));
  svg.querySelectorAll(".gen-op").forEach(p => p.classList.toggle("on", on.has(p.dataset.a) || on.has(p.dataset.b)));
});
document.addEventListener("mouseout", e => {
  const svg = e.target.closest && e.target.closest("#geneabox .gen-svg");
  if (svg && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("#geneabox .gen-svg"))) svg.classList.remove("gen-focus");
});

function initGenea(){ const b = document.getElementById("geneabox"); if (b && !b.firstChild) drawGenea(); }
document.addEventListener("DOMContentLoaded", initGenea);
(function(){ const nav = document.getElementById("tabs"); if (nav) nav.addEventListener("click", e => {
  const b = e.target.closest("button"); if (b && b.dataset.view === "genealogias") initGenea();
}); })();
