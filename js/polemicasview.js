"use strict";
/* ===== «Polémicas: cara a cara» (11-10, Bachillerato) — vista sobre polemicas.js (POLEMICAS) =====
   Criterio del profesor: solo pensadores COETÁNEOS que se enfrentaron de verdad: cara a cara, por cartas, con libros
   que se responden en vida de ambos o desde escuelas rivales que convivieron. Nada de críticas póstumas.
   Lista filtrable por época y por vía; cada caso: la pregunta, el contexto, la tesis de cada bando (con cita si la hay),
   «¿Con quién vas?» (eliges, escribes tu razón y solo entonces ves el argumento más fuerte del otro lado; puedes cambiar),
   cómo acabó, los trucos retóricos (con enlace al Duelo de razones), los temas y las fuentes. Sin nota y sin guardar nada.
   También: modo «Cara a cara» en Genealogías (polGenea) y enlaces desde la ficha de cada pensador en Ilustres (polDe).
   Duelo de razones: si la ficha tiene «duelo» (id del tema, p. ej. pol-erasmo-lutero, lo añade la sesión 40), abre la sección #duelo/<hf|fil>/<duelo>.
   Enlace profundo: #polemicas/<id>. Los temas y los pensadores se enlazan solo si existen en esta web. */
const POL_TXT = {
  epoca: "العصر", via: "الوسيلة", todas: "الكل", todos: "الكل",
  ant: "القديمة", med: "الوسيطة", ren: "عصر النهضة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة",
  cara: "وجهًا لوجه", cartas: "بالرسائل", libros: "كتاب مقابل كتاب", escuelas: "مدارس متنافسة",
  cuenta: "{n} سجالات", cuenta1: "سجال واحد", ninguna: "لا توجد سجالات بهذه المرشِّحات.",
  criterio: "هنا فقط مواجهات بين مفكرين عاشوا في الزمن نفسه وتواجهوا حقًّا: شخصيًّا، أو بالرسائل، أو بكتب يردّ بعضها على بعض، أو من مدارس متنافسة. نقدُ شخصٍ كان قد مات لا يُحسب.",
  volver: "← كل السجالات", anterior: "‹ السابق", siguiente: "التالي ›",
  contexto: "ماذا كان يحدث", defiende: "ما كان يدافع عنه", cita: "بكلماته",
  conQuien: "مع مَن أنتم؟", conQuienAyuda: "اختاروا طرفًا واكتبوا السبب. بعد ذلك سترون أقوى حجة للطرف الآخر ويمكنكم تغيير رأيكم. لا توجد إجابة صحيحة ولا يُحفظ شيء.",
  noClaro: "لستُ متأكدًا", tuRazon: "سببكم (على الأقل {m} كلمة):", nPal: "{n} كلمة",
  verOtro: "عرض أقوى حجة للطرف الآخر", otroLado: "أقوى حجة لدى {n}:", ambos: "أقوى حجة لكل طرف:",
  ahora: "والآن؟", mantengo: "أتمسّك بموقفي", cambio: "أغيّر رأيي", matizo: "أعدّله",
  porQueAhora: "ما الذي جعلكم تتمسّكون به أو تغيّرونه أو تعدّلونه؟", listo: "عرض كيف انتهى",
  desenlace: "كيف انتهى", trucos: "حِيَل وضربات تحت الحزام", duelo: "تدرّبوا على كشفها في «مبارزة الحجج»",
  temas: "في المواضيع:", fuentes: "لمعرفة المزيد:", verBio: "عرض سيرة {n}",
  generaTit: "وجهًا لوجه", generaLead: "السجالات بين مفكرين عاشوا في الزمن نفسه، من أثينا سقراط إلى فلسفة القرن العشرين. اضغطوا على واحد منها لفتحه في «سجالات».",
  enIlustres: "سجالات", contra: "في مواجهة {n}"
};
const polT = (k, v) => String(POL_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const POL_EPOCAS = ["ant", "med", "ren", "mod", "ilu", "con"];
const POL_VIAS = [["cara", "🗣️"], ["cartas", "✉️"], ["libros", "📚"], ["escuelas", "🏛️"]];
const POL_MIN = 12;
let polEp = "all", polVia = "all", polAmb = "all", polSel = null, POL_ESTADO = {};
function polEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function polBox(){ return document.getElementById("polemicasbox"); }
function polIcono(v){ const x = POL_VIAS.find(p => p[0] === v); return x ? x[1] : ""; }
function polHayIlu(id){ return typeof ILUSTRES !== "undefined" && ILUSTRES[id] && typeof loadIlustre === "function"; }
function polHayTema(k){ return typeof THEORY !== "undefined" && THEORY[k]; }
/* (12-10, rediseño Lote 1 · F2) una polémica solo se ve si esta web tiene alguno de sus temas:
   en 1.º quedan las 27 con algún «fil-…»; las 7 que solo tocan temas de HF ni se listan ni se enlazan.
   En HF (34) y en la web local del profesor (todas las materias) no cambia nada. */
function polVisible(p){ return (p.temas || []).some(polHayTema); }
/* (12-10) criterio del profesor: en la web de 1.º Polémicas criba por ÁMBITO filosófico en vez de por época
   (la asignatura va por problemas; las fechas y la época siguen en cada tarjeta y ficha). En HF y en la web
   local el selector sigue por época y vía. */
const POL_RAMAS = { int: "مدخل", ant: "الأنثروبولوجيا", con: "المعرفة", met: "ميتافيزيقا", log: "المنطق", eti: "الأخلاق", pol: "السياسة", est: "علم الجمال" };
const POL_RAMA_ORDEN = ["int", "ant", "con", "met", "log", "eti", "pol", "est"];
function polEsFil(){ return typeof SUBJECTS !== "undefined" && !!SUBJECTS.fil && !SUBJECTS.hf; }
function polRamas(p){
  const s = new Set(), MAP = { 1: "int", 2: "ant", 3: "con", 4: "log", 5: "eti", 6: "pol", 7: "est" };
  for (const k of p.temas || []){
    if (typeof THEORY === "undefined" || !THEORY[k]) continue;
    const t = THEORY[k], T = String(t.tema || "");   // nº tema declarado: temaN (anexos) o el rótulo (ya traducido en las webs EU/FR/EN/AR)
    const mm = /(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/.exec(T);
    const n = typeof t.temaN === "number" ? t.temaN : (/·\s*M(?:\s|$|\()/.test(T) ? 3.5 : (mm ? +(mm[1] || mm[2]) : null));
    if (n === 3.5) s.add("met"); else if (MAP[n]) s.add(MAP[n]);
  }
  return [...s];
}
function polPal(s){ return (String(s).trim().match(/\S+/g) || []).length; }
function polLista(){
  let ls = (typeof POLEMICAS === "undefined" ? [] : POLEMICAS).filter(polVisible).filter(p => (polEp === "all" || p.pol_epoca === polEp) && (polVia === "all" || p.pol_via === polVia));
  if (polEsFil() && polAmb !== "all") ls = ls.filter(p => polRamas(p).includes(polAmb));   // (12-10) 1.º: por ámbito
  return ls;
}
/* nombre de un bando con enlace a Ilustres si hay ficha (y solo uno: si el bando son varios, se enlaza cada nombre aparte en la línea de debajo) */
function polBando(p, lado){
  const ids = (p["ilu_" + lado] || []).filter(polHayIlu), nom = p[lado];
  if (ids.length === 1) return '<button type="button" class="pol-ilu" data-ilu="' + ids[0] + '" title="' + polEsc(polT("verBio", { n: ILUSTRES[ids[0]].name })) + '">' + polEsc(nom) + '</button>';
  return polEsc(nom) + (ids.length > 1 ? ' <span class="pol-ilus">(' + ids.map(id => '<button type="button" class="pol-ilu" data-ilu="' + id + '">' + polEsc(ILUSTRES[id].name) + '</button>').join(", ") + ')</span>' : "");
}
function polFiltro(){
  const f = document.getElementById("polemicasfilter"); if (!f) return;
  /* en una ficha, fuera el filtro; vaciándolo, compacto.js tampoco pinta su línea plegada del móvil (no empuja el texto) */
  if (polSel){ f.hidden = true; f.innerHTML = ""; return; }
  f.hidden = false;
  if (polEsFil()){   // (12-10) 1.º: filas «Ámbito» y «Vía» (la época no filtra; está en cada tarjeta)
    const visibles = typeof POLEMICAS === "undefined" ? [] : POLEMICAS.filter(polVisible);
    const amb = POL_RAMA_ORDEN.filter(r => visibles.some(p => polRamas(p).includes(r)));
    if (polAmb !== "all" && !amb.includes(polAmb)) polAmb = "all";
    f.innerHTML = '<div class="fgroup"><span class="flabel">المجال</span>' +
      ["all"].concat(amb).map(b => '<button type="button" class="fbtn" data-pol-amb="' + b + '" aria-pressed="' + (b === polAmb) + '">' + (b === "all" ? polT("todas") : POL_RAMAS[b]) + '</button>').join("") + '</div>' +
      '<div class="fgroup"><span class="flabel">' + polT("via") + '</span>' +
      [["all", ""]].concat(POL_VIAS).map(v => '<button type="button" class="fbtn" data-pol-via="' + v[0] + '" aria-pressed="' + (v[0] === polVia) + '">' + (v[1] ? v[1] + " " : "") + polT(v[0] === "all" ? "todas" : v[0]) + '</button>').join("") + '</div>';
    return;
  }
  f.innerHTML = '<div class="fgroup"><span class="flabel">' + polT("epoca") + '</span>' +
    ["all"].concat(POL_EPOCAS).filter(e => e === "all" || (typeof POLEMICAS === "undefined" ? [] : POLEMICAS).filter(polVisible).some(p => p.pol_epoca === e)).map(e => '<button type="button" class="fbtn" data-pol-ep="' + e + '" aria-pressed="' + (e === polEp) + '">' + polT(e === "all" ? "todas" : e) + '</button>').join("") + '</div>' +
    '<div class="fgroup"><span class="flabel">' + polT("via") + '</span>' +
    [["all", ""]].concat(POL_VIAS).map(v => '<button type="button" class="fbtn" data-pol-via="' + v[0] + '" aria-pressed="' + (v[0] === polVia) + '">' + (v[1] ? v[1] + " " : "") + polT(v[0] === "all" ? "todas" : v[0]) + '</button>').join("") + '</div>';
}
function polTarjeta(p){
  return '<button type="button" class="pol-card" data-ep="' + p.pol_epoca + '" data-pol="' + p.id + '">' +
    '<span class="pol-quien">' + polEsc(p.a) + ' <span class="pol-vs" aria-hidden="true">⚔</span> ' + polEsc(p.b) + '</span>' +
    '<span class="pol-meta">' + polEsc(p.fechas) + ' · <span aria-hidden="true">' + polIcono(p.pol_via) + '</span> ' + polT(p.pol_via) + '</span>' +
    '<span class="pol-preg">' + polEsc(p.pregunta) + '</span></button>';
}
function polRenderLista(){
  const box = polBox(); if (!box) return;
  const ls = polLista();
  box.innerHTML = '<p class="pol-criterio">' + polT("criterio") + '</p>' +
    '<p class="pol-cuenta">' + (ls.length === 1 ? polT("cuenta1") : polT("cuenta", { n: ls.length })) + '</p>' +
    (ls.length ? '<div class="pol-grid">' + ls.map(polTarjeta).join("") + '</div>' : '<p>' + polT("ninguna") + '</p>');
}
function polCita(c){ return c && c.t ? '<blockquote class="pol-cita"><p>«' + polEsc(c.t) + '»</p><cite>' + polEsc(c.ref) + '</cite></blockquote>' : ""; }
function polLado(p, lado){
  return '<div class="pol-lado pol-lado-' + lado + '"><h3>' + polBando(p, lado) + '</h3><p class="pol-k">' + polT("defiende") + '</p><p>' + polEsc(p["tesis_" + lado]) + '</p>' + polCita(p["cita_" + lado]) + '</div>';
}
function polActividad(p){
  const st = POL_ESTADO[p.id] || {};
  let h = '<section class="pol-act"><h3>' + polT("conQuien") + '</h3><p class="pol-ayuda">' + polT("conQuienAyuda") + '</p>' +
    '<div class="pol-elige" role="group" aria-label="' + polEsc(polT("conQuien")) + '">' +
    [["a", p.a], ["b", p.b], ["n", polT("noClaro")]].map(([k, l]) => '<button type="button" class="pol-op" data-pol-op="' + k + '" aria-pressed="' + (st.op === k) + '"' + (st.visto ? " disabled" : "") + '>' + polEsc(l) + '</button>').join("") + '</div>';
  if (st.op){
    h += '<label class="pol-lbl" for="pol-razon">' + polT("tuRazon", { m: POL_MIN }) + '</label><textarea id="pol-razon" rows="3"' + (st.visto ? " readonly" : "") + '>' + polEsc(st.razon || "") + '</textarea>' +
      '<p class="pol-npal" aria-live="polite">' + polT("nPal", { n: polPal(st.razon || "") }) + '</p>';
    if (!st.visto) h += '<button type="button" class="pol-btn" data-pol-ver' + (polPal(st.razon || "") < POL_MIN ? " disabled" : "") + '>' + polT("verOtro") + '</button>';
  }
  if (st.visto){
    const otros = st.op === "a" ? ["b"] : st.op === "b" ? ["a"] : ["a", "b"];
    h += '<div class="pol-otro"><p class="pol-k">' + (otros.length === 2 ? polT("ambos") : polT("otroLado", { n: p[otros[0]] })) + '</p>' +
      otros.map(o => '<p>' + (otros.length === 2 ? '<strong>' + polEsc(p[o]) + ':</strong> ' : '') + polEsc(p["fuerte_" + o]) + '</p>').join("") + '</div>' +
      '<p class="pol-k">' + polT("ahora") + '</p><div class="pol-elige" role="group">' +
      [["m", "mantengo"], ["c", "cambio"], ["t", "matizo"]].map(([k, l]) => '<button type="button" class="pol-op" data-pol-ahora="' + k + '" aria-pressed="' + (st.ahora === k) + '">' + polT(l) + '</button>').join("") + '</div>';
    if (st.ahora) h += '<label class="pol-lbl" for="pol-porque">' + polT("porQueAhora") + '</label><textarea id="pol-porque" rows="3">' + polEsc(st.porque || "") + '</textarea>' +
      (st.fin ? "" : '<button type="button" class="pol-btn" data-pol-fin>' + polT("listo") + '</button>');
  }
  return h + '</section>';
}
function polDetalle(p){
  const box = polBox(); if (!box) return;
  const ls = polLista().some(x => x.id === p.id) ? polLista() : POLEMICAS, i = ls.findIndex(x => x.id === p.id), prev = ls[i - 1], next = ls[i + 1];
  const st = POL_ESTADO[p.id] || {};
  const temas = (p.temas || []).filter(polHayTema);
  box.innerHTML = '<div class="pol-nav"><button type="button" class="btn ghost" data-pol-back>' + polT("volver") + '</button><span>' +
      (prev ? '<button type="button" class="btn ghost" data-pol="' + prev.id + '" title="' + polEsc(prev.a + " / " + prev.b) + '">' + polT("anterior") + '</button>' : '') +
      (next ? '<button type="button" class="btn ghost" data-pol="' + next.id + '" title="' + polEsc(next.a + " / " + next.b) + '">' + polT("siguiente") + '</button>' : '') + '</span></div>' +
    '<article class="pol-ficha" data-ep="' + p.pol_epoca + '">' +
      '<p class="pol-meta">' + polT(p.pol_epoca) + ' · ' + polEsc(p.fechas) + (p.lugar ? ' · ' + polEsc(p.lugar) : '') + ' · <span aria-hidden="true">' + polIcono(p.pol_via) + '</span> ' + polT(p.pol_via) + '</p>' +
      '<h2 class="pol-tit">' + polBando(p, "a") + ' <span class="pol-vs" aria-hidden="true">⚔</span> ' + polBando(p, "b") + '</h2>' +
      '<p class="pol-pregunta">' + polEsc(p.pregunta) + '</p>' +
      '<div class="pol-sec"><p class="pol-k">' + polT("contexto") + '</p><p>' + polEsc(p.contexto) + '</p></div>' +
      '<div class="pol-lados">' + polLado(p, "a") + polLado(p, "b") + '</div>' +
      polActividad(p) +
      (st.fin ? '<div class="pol-sec pol-desen"><p class="pol-k">' + polT("desenlace") + '</p><p>' + polEsc(p.desenlace) + '</p></div>' : '') +
      (p.trucos ? '<div class="pol-sec pol-trucos"><p class="pol-k">' + polT("trucos") + '</p><p>' + polEsc(p.trucos) + '</p>' +
        '<p><a class="pol-duelo" href="#duelo/' + polMateria() + (p.duelo ? '/' + polEsc(p.duelo) : '') + '">' + polT("duelo") + '</a></p></div>' : '') +
      (temas.length ? '<div class="pol-temas"><span class="pol-k">' + polT("temas") + '</span> ' + temas.map(k => '<button type="button" class="pol-tema" data-th="' + k + '" title="' + polEsc(THEORY[k].title) + '">' + polEsc(THEORY[k].title) + '</button>').join("") + '</div>' : '') +
      ((p.fuentes || []).length ? '<div class="pol-fuentes"><span class="pol-k">' + polT("fuentes") + '</span><ul>' + p.fuentes.map(f => '<li><a href="' + polEsc(f.url) + '" target="_blank" rel="noopener">' + polEsc(f.t) + '</a></li>').join("") + '</ul></div>' : '') +
    '</article>';
}
function polMateria(){ return typeof SUBJECTS !== "undefined" && SUBJECTS.hf && document.getElementById("hf") ? "hf" : "fil"; }
function polAbrir(id, sinScroll){
  const p = (typeof POLEMICAS === "undefined" ? [] : POLEMICAS).find(x => x.id === id);
  if (!p || !polVisible(p)){ polSel = null; polFiltro(); polRenderLista(); return; }   // (12-10, F2) el enlace a una polémica oculta lleva a la lista
  polSel = id; polFiltro(); polDetalle(p);
  if (typeof setDeepHash === "function") setDeepHash("polemicas", id);
  if (!sinScroll) window.scrollTo(0, 0);
}
function polVolver(){ polSel = null; polFiltro(); polRenderLista(); if (typeof setDeepHash === "function") setDeepHash("polemicas", ""); window.scrollTo(0, 0); }
function loadPolemicas(arg){
  if (typeof POLEMICAS === "undefined") return;
  const id = String(arg || "").split("/")[0];
  if (id && POLEMICAS.some(p => p.id === id)){ polAbrir(id); return; }
  polSel = null; polFiltro(); polRenderLista();
}
window.loadPolemicas = loadPolemicas;

/* ---- eventos (delegados: la vista se redibuja entera) ---- */
document.addEventListener("click", e => {
  const t = e.target; if (!t.closest) return;
  const enGen = t.closest("#geneabox [data-pol]");
  if (enGen){ (window.show || show)("polemicas"); polAbrir(enGen.dataset.pol); return; }
  const enIlu = t.closest("#ilubox [data-pol]");
  if (enIlu){ (window.show || show)("polemicas"); polAbrir(enIlu.dataset.pol); return; }
  if (!t.closest("#polemicas")) return;
  const ep = t.closest("[data-pol-ep]"); if (ep){ polEp = ep.dataset.polEp; polFiltro(); polRenderLista(); return; }
  const amb = t.closest("[data-pol-amb]"); if (amb){ polAmb = amb.dataset.polAmb; polFiltro(); polRenderLista(); return; }
  const vi = t.closest("[data-pol-via]"); if (vi){ polVia = vi.dataset.polVia; polFiltro(); polRenderLista(); return; }
  if (t.closest("[data-pol-back]")){ polVolver(); return; }
  const c = t.closest("[data-pol]"); if (c){ polAbrir(c.dataset.pol); return; }
  const il = t.closest("[data-ilu]"); if (il){ (window.show || show)("ilustres"); loadIlustre(il.dataset.ilu); return; }
  const th = t.closest("[data-th]"); if (th){ (window.show || show)("teoria"); if (typeof window.loadTheory === "function") window.loadTheory(th.dataset.th); return; }
  if (!polSel) return;
  const st = POL_ESTADO[polSel] = POL_ESTADO[polSel] || {};
  const op = t.closest("[data-pol-op]"); if (op && !st.visto){ st.op = op.dataset.polOp; polRedibujar("pol-razon"); return; }
  if (t.closest("[data-pol-ver]")){ if (polPal(st.razon || "") >= POL_MIN){ st.visto = true; polRedibujar(); } return; }
  const ah = t.closest("[data-pol-ahora]"); if (ah){ st.ahora = ah.dataset.polAhora; polRedibujar("pol-porque"); return; }
  if (t.closest("[data-pol-fin]")){ st.fin = true; polRedibujar(); const d = document.querySelector("#polemicas .pol-desen"); if (d) d.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
});
document.addEventListener("input", e => {
  if (!polSel || !e.target.closest || !e.target.closest("#polemicas")) return;
  const st = POL_ESTADO[polSel] = POL_ESTADO[polSel] || {};
  if (e.target.id === "pol-razon"){
    st.razon = e.target.value;
    const n = document.querySelector("#polemicas .pol-npal"); if (n) n.textContent = polT("nPal", { n: polPal(st.razon) });
    const b = document.querySelector("#polemicas [data-pol-ver]"); if (b) b.disabled = polPal(st.razon) < POL_MIN;
  }
  if (e.target.id === "pol-porque") st.porque = e.target.value;
});
function polRedibujar(foco){
  const p = POLEMICAS.find(x => x.id === polSel); if (!p) return;
  const y = window.scrollY; polDetalle(p); window.scrollTo(0, y);
  if (foco){ const el = document.getElementById(foco); if (el) el.focus(); }
}

/* ---- Genealogías: modo «Cara a cara» (lo pinta genealogiasview.js si existe polGenea) ---- */
function polGenea(){
  if (typeof POLEMICAS === "undefined") return "";
  return '<div class="pol-gen"><p class="pol-gen-lead">' + polT("generaLead") + '</p>' + POL_EPOCAS.map(ep => {
    const ls = POLEMICAS.filter(polVisible).filter(p => p.pol_epoca === ep); if (!ls.length) return "";
    return '<div class="pol-gen-ep" data-ep="' + ep + '"><h3>' + polT(ep) + '</h3><ol>' + ls.map(p =>
      '<li><button type="button" class="pol-gen-a" data-pol="' + p.id + '"><span class="pol-gen-f">' + polEsc(p.fechas) + '</span> <strong>' + polEsc(p.a) + '</strong> <span class="pol-vs" aria-hidden="true">⚔</span> <strong>' + polEsc(p.b) + '</strong> <span class="pol-gen-v" aria-hidden="true">' + polIcono(p.pol_via) + '</span><span class="pol-gen-p">' + polEsc(p.pregunta) + '</span></button></li>').join("") + '</ol></div>';
  }).join("") + '</div>';
}
window.polGenea = polGenea;
/* ---- Ilustres: las polémicas de un pensador (las pinta biografiasview.js si existe polDe) ---- */
function polDe(id){
  if (typeof POLEMICAS === "undefined") return "";
  const ls = POLEMICAS.filter(polVisible).filter(p => (p.ilu_a || []).includes(id) || (p.ilu_b || []).includes(id));   // (12-10, F2) Ilustres no enlaza polémicas ocultas
  if (!ls.length) return "";
  return '<li><span class="ilu-rel-op">' + polT("enIlustres") + '</span> ' + ls.map(p => {
    const otro = (p.ilu_a || []).includes(id) ? p.b : p.a;
    return '<button type="button" class="ilu-rel-a" data-pol="' + p.id + '" title="' + polEsc(p.pregunta) + '">' + polEsc(polT("contra", { n: otro })) + ' (' + polEsc(p.fechas) + ')</button>';
  }).join(" · ") + '</li>';
}
window.polDe = polDe;
/* primera pintura (como Adagios): la lista, sin esperar al enrutado */
if (polBox() && typeof POLEMICAS !== "undefined"){ polFiltro(); polRenderLista(); }
