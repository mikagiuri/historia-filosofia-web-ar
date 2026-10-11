"use strict";
/* ===== Genealogías · «Red de tesis» y «¿Verde o roja?» (09-10) ===== depende de: genealogias_tesis.js (GEN_TESIS),
   ilustres.js (ILUSTRES; opcional loadIlustre). La llama genealogiasview.js según el modo.
   · Red de tesis: las tesis en orden cronológico, agrupadas por autor; a la derecha, arcos verdes (acuerdo) y
     rojos (desacuerdo) entre tesis. Al pulsar una tesis se apaga lo demás y se despliegan sus enlaces con su «por qué».
     En pantallas estrechas no hay arcos: solo el desplegable.
   · ¿Verde o roja?: dos tesis enlazadas; el alumno decide si concuerdan o se oponen y ESCRIBE por qué antes de
     ver la explicación (sin puntuación ni perfil: criterios de criba de actividades gamificadas). */

/* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
const GT_TXT = {
  acuerdo: "اتفاق", desacuerdo: "الاختلاف",
  intro: "كل خط يربط بين أطروحتين، لا بين مؤلفين: أخضر إذا اتفقتا، وأحمر إذا تعارضتا. انقروا على أطروحة لتروا مع أي الأطروحات ترتبط ولماذا. العلاقات قابلة للنقاش عن قصد: هل ستضعون خطًا آخر، أو تغيّرون لونًا؟",
  concuerda: "يتفق مع", seOpone: "يتعارض مع", ficha: "عرض البطاقة", cerrar: "إغلاق",
  vrIntro: "اقرؤوا الأطروحتين. هل تتفقان أم تتعارضان؟ اكتبوا السبب قبل أن تروا الشرح.",
  tuRazon: "سببكم ({n} كلمة على الأقل)", nPal: "{n} كلمة", comprobar: "عرض الشرح",
  bien: "يتفق مع الشبكة: إنه خط {c}.", distinto: "في الشبكة هو خط {c}. هل الشرح مقنع لكم، أم ستدافعون عن لونكم؟",
  verde: "أخضر", roja: "أحمر", otra: "زوج آخر", nota: "لا توجد نقطة: ما يهم هو السبب الذي كتبتموه. قارنوه بالشرح."
};
const gtT = (k, v) => String(GT_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const GT = { sel: null, ver: new Set(["acuerdo", "desacuerdo"]), vr: null };
function gtP(id){ return typeof ILUSTRES !== "undefined" && ILUSTRES[id] ? ILUSTRES[id] : null; }
function gtTesis(id){ return GEN_TESIS.tesis.find(t => t.id === id); }
function gtPar(e){ return e.k.split("|"); }
function gtEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function gtOrden(){ return GEN_TESIS.tesis.filter(t => gtP(t.ilustre)).slice().sort((a, b) => gtP(a.ilustre).born - gtP(b.ilustre).born); }

/* ---------- Red de tesis ---------- */
function gtRed(){
  const lista = gtOrden(); let html = "", prev = null;
  lista.forEach(t => {
    if (t.ilustre !== prev){
      if (prev) html += "</div>";
      const p = gtP(t.ilustre);
      html += '<div class="gt-autor" data-b="' + p.block + '"><button type="button" class="gt-nombre" data-gtilu="' + t.ilustre + '">' + gtEsc(p.name) + "</button>";
      prev = t.ilustre;
    }
    html += '<div class="gt-tesis' + (GT.sel === t.id ? " sel" : "") + '" data-gt="' + t.id + '"><button type="button" class="gt-t" aria-expanded="' + (GT.sel === t.id) + '">' + gtEsc(t.t) + "</button>" +
      '<span class="gt-ref">' + gtEsc(t.forma) + " · " + gtEsc(t.ref) + "</span>" + (GT.sel === t.id ? gtEnlaces(t.id) : "") + "</div>";
  });
  html += "</div>";
  return '<p class="gt-intro">' + gtT("intro") + '</p><div class="gt-filtros" role="group">' +
    ["acuerdo", "desacuerdo"].map(k => '<button type="button" class="gen-leg gt-fil gt-' + k + '" data-gtfil="' + k + '" aria-pressed="' + GT.ver.has(k) + '"><i></i><span>' + gtT(k) + "</span></button>").join("") +
    '</div><div class="gt-wrap' + (GT.sel ? " gt-focus" : "") + '"><div class="gt-col">' + html + '</div><svg class="gt-arcs" aria-hidden="true"></svg></div>';
}
function gtEnlaces(id){
  const es = GEN_TESIS.enlaces.filter(e => gtPar(e).includes(id) && GT.ver.has(e.tipo));
  const jg = typeof cruJuegosDeTesis === "function" ? cruJuegosDeTesis(id) : "";   // (11-10) Nudos y Rayuela (cruces_tesis.js)
  if (!es.length) return jg ? '<div class="gt-enl">' + jg + "</div>" : "";
  return '<div class="gt-enl">' + ["acuerdo", "desacuerdo"].map(tipo => {
    const xs = es.filter(e => e.tipo === tipo); if (!xs.length) return "";
    return '<p class="gt-enl-tit gt-' + tipo + '">' + gtT(tipo === "acuerdo" ? "concuerda" : "seOpone") + "</p><ul>" + xs.map(e => {
      const otro = gtTesis(gtPar(e).find(x => x !== id)), p = gtP(otro.ilustre);
      return '<li><button type="button" class="gt-salto" data-gtgo="' + otro.id + '"><strong>' + gtEsc(p.name) + "</strong>: «" + gtEsc(otro.t) + '»</button><span class="gt-por">' + gtEsc(e.por) + "</span></li>";
    }).join("") + "</ul>";
  }).join("") + jg + "</div>";
}
/* arcos a la derecha de la columna, entre el centro vertical de cada tesis */
function gtArcos(){
  const wrap = document.querySelector("#geneabox .gt-wrap"); if (!wrap) return;
  const svg = wrap.querySelector(".gt-arcs"), col = wrap.querySelector(".gt-col");
  if (!svg || getComputedStyle(svg).display === "none"){ return; }
  const r0 = wrap.getBoundingClientRect(), W = svg.getBoundingClientRect().width, H = col.offsetHeight;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("height", H);
  const y = id => { const el = wrap.querySelector('.gt-tesis[data-gt="' + id + '"] > .gt-t'); if (!el) return null; const r = el.getBoundingClientRect(); return r.top - r0.top + r.height / 2; };
  let s = "";
  GEN_TESIS.enlaces.forEach(e => {
    if (!GT.ver.has(e.tipo)) return;
    const [a, b] = gtPar(e), ya = y(a), yb = y(b); if (ya == null || yb == null) return;
    const d = Math.abs(yb - ya), cx = Math.min(W - 6, 14 + d * 0.22);
    const on = GT.sel && (a === GT.sel || b === GT.sel);
    s += '<path class="gt-arc gt-' + e.tipo + (on ? " on" : "") + '" d="M2,' + ya + " C" + cx + "," + ya + " " + cx + "," + yb + " 2," + yb + '"/>';
  });
  svg.innerHTML = s;
}

/* ---------- ¿Verde o roja? ---------- */
function gtNuevaPareja(){
  const es = GEN_TESIS.enlaces, prev = GT.vr && GT.vr.e;
  let e; do { e = es[Math.floor(Math.random() * es.length)]; } while (es.length > 1 && e === prev);
  GT.vr = { e, hecho: false, razon: "" };
}
function gtVR(){
  if (!GT.vr) gtNuevaPareja();
  const { e, hecho, razon, elegido } = GT.vr, [a, b] = gtPar(e).map(gtTesis);
  const tarj = t => '<div class="gt-vr-t"><strong>' + gtEsc(gtP(t.ilustre).name) + "</strong><p>«" + gtEsc(t.t) + '»</p><span class="gt-ref">' + gtEsc(t.ref) + "</span></div>";
  const min = 10, n = (razon.trim().match(/\S+/g) || []).length;
  return '<p class="gt-intro">' + gtT("vrIntro") + '</p><div class="gt-vr">' + tarj(a) + tarj(b) + "</div>" +
    '<div class="gt-vr-elige" role="group">' + ["acuerdo", "desacuerdo"].map(k => '<button type="button" class="gen-leg gt-fil gt-' + k + '" data-gtvr="' + k + '" aria-pressed="' + (elegido === k) + '"' + (hecho ? " disabled" : "") + "><i></i><span>" + gtT(k) + "</span></button>").join("") + "</div>" +
    '<label class="gt-lab" for="gt-razon">' + gtT("tuRazon", { n: min }) + '</label><textarea id="gt-razon" class="gt-razon"' + (hecho ? " readonly" : "") + ">" + gtEsc(razon) + "</textarea>" +
    '<p class="gt-acc"><span class="gt-cnt">' + gtT("nPal", { n }) + "</span> " +
    (hecho ? "" : '<button type="button" class="btn" data-gtvr="ver"' + (!elegido || n < min ? " disabled" : "") + ">" + gtT("comprobar") + "</button>") +
    ' <button type="button" class="btn ghost" data-gtvr="otra">' + gtT("otra") + "</button></p>" +
    (hecho ? '<div class="gt-vr-res gt-' + e.tipo + '"><p><strong>' + gtT(elegido === e.tipo ? "bien" : "distinto", { c: gtT(e.tipo === "acuerdo" ? "أخضر" : "أحمر") }) + "</strong></p><p>" + gtEsc(e.por) + '</p><p class="gt-ref">' + gtT("nota") + "</p></div>" : "");
}

/* ---------- pintar y eventos ---------- */
function genTesisRender(modo){
  const box = document.getElementById("gentesisbox"); if (!box || typeof GEN_TESIS === "undefined") return;
  box.innerHTML = modo === "verde-roja" ? gtVR() : gtRed();
  if (modo === "verde-roja") return;
  requestAnimationFrame(gtArcos);
  /* si la sección aún no es visible (se pinta antes de mostrarse), los arcos se dibujan cuando la columna cobra tamaño */
  const col = box.querySelector(".gt-col");
  if (col && typeof ResizeObserver !== "undefined"){ if (GT.ro) GT.ro.disconnect(); GT.ro = new ResizeObserver(() => gtArcos()); GT.ro.observe(col); }
}
function gtModo(){ const b = document.getElementById("gentesisbox"); return b ? b.dataset.modo : null; }
document.addEventListener("click", e => {
  const box = document.getElementById("gentesisbox"); if (!box || !box.contains(e.target)) return;
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.gtfil){ const k = b.dataset.gtfil; GT.ver.has(k) ? GT.ver.delete(k) : GT.ver.add(k); genTesisRender(gtModo()); return; }
  if (b.dataset.gtilu && typeof loadIlustre === "function"){ (window.show || show)("ilustres"); loadIlustre(b.dataset.gtilu); return; }
  if (b.dataset.gtgo){ GT.sel = b.dataset.gtgo; genTesisRender(gtModo()); const el = box.querySelector('.gt-tesis[data-gt="' + GT.sel + '"]'); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
  if (b.classList.contains("gt-t")){ const id = b.closest(".gt-tesis").dataset.gt; GT.sel = GT.sel === id ? null : id; genTesisRender(gtModo()); const el = box.querySelector('.gt-tesis[data-gt="' + id + '"] > .gt-t'); if (el) el.focus(); return; }
  const v = b.dataset.gtvr;
  if (v === "acuerdo" || v === "desacuerdo"){ GT.vr.elegido = v; GT.vr.razon = (document.getElementById("gt-razon") || {}).value || GT.vr.razon; genTesisRender("verde-roja"); }
  else if (v === "ver"){ GT.vr.razon = document.getElementById("gt-razon").value; GT.vr.hecho = true; genTesisRender("verde-roja"); }
  else if (v === "otra"){ gtNuevaPareja(); genTesisRender("verde-roja"); }
});
document.addEventListener("input", e => {
  if (e.target.id !== "gt-razon" || !GT.vr) return;
  GT.vr.razon = e.target.value; const n = (GT.vr.razon.trim().match(/\S+/g) || []).length;
  const c = document.querySelector("#gentesisbox .gt-cnt"); if (c) c.textContent = gtT("nPal", { n });
  const btn = document.querySelector('#gentesisbox [data-gtvr="ver"]'); if (btn) btn.disabled = !GT.vr.elegido || n < 10;
});
