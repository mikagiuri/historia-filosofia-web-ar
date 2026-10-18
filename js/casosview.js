"use strict";
/* ===== (11-10, Bachillerato) Dos secciones de fichas con el mismo visor =====
   «Perseguidos por sus ideas» (perseguidos.js, PERSEGUIDOS) y «Comunidades de filósofos» (comunidades.js, COMUNIDADES).
   Lista filtrable por época (y, en Perseguidos, por lo que les pasó); cada ficha: retrato(s) de Ilustres, el relato,
   una cita con su referencia, el «caso trampa», una pregunta para pensar, los temas y las fuentes. Sin nota y sin guardar nada.
   Enlace profundo: #perseguidos/<id> y #comunidades/<id>. Los temas y los pensadores se enlazan solo si existen en esta web.
   Ilustres: casosDe(id) añade a la ficha de cada pensador los casos en que aparece (lo pinta ilustresview.js si existe). */
const CAS_TXT = {
  epoca: "العصر", todas: "الكل", todos: "الكل", castigo: "ماذا حدث لهم",
  ant: "القديمة", med: "الوسيطة", ren: "عصر النهضة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة",
  muerte: "الموت", carcel: "السجن", exilio: "المنفى", censura: "الرقابة",
  volver: "→ العودة إلى القائمة", anterior: "‹ السابق", siguiente: "التالي ›",
  ninguno: "لا توجد بطاقات تطابق هذه التصفية.", verBio: "عرض سيرة {n}", biografias: "السير:",
  temas: "في المواضيع:", fuentes: "لمعرفة المزيد:", trampa: "فخّ", pensar: "للتفكير", cita: "بكلماته",
  // Perseguidos
  perCuenta: "{n} حالات", perCuenta1: "حالة واحدة",
  perCriterio: "فلاسفة وعلماء عوقبوا بسبب ما كانوا يفكرون فيه أو يعلّمونه أو يبحثون فيه: بالموت، أو السجن، أو المنفى، أو الرقابة. كل بطاقة تميّز ما نعرفه مما يُروى عادةً بشكل خاطئ.",
  ideas: "ما الأفكار التي أزعجت", poder: "من اضطهده", relato: "ماذا حدث", despues: "بعد ذلك",
  // Comunidades
  comCuenta: "{n} جماعات", comCuenta1: "جماعة واحدة",
  comCriterio: "مجموعات من المفكرين عاشوا أو درّسوا أو تناقشوا معًا، والأماكن المادية التي كانوا يجتمعون فيها: حدائق، وجمنازيومات، وبيوت، وقاعات.",
  lugar: "المكان", hoy: "ماذا بقي اليوم", miembros: "من كانوا", vida: "كيف كانوا يعيشون ويعملون", comunes: "ما الأفكار المشتركة بينهم", fin: "كيف انتهى",
  enPer: "المضطهَدون", enCom: "الجماعات",
  cronologia: "التسلسل الزمني", etapas: "المراحل",
  verCommons: "عرض في Wikimedia Commons",
};
const casT = (k, v) => String(CAS_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const CAS_EPOCAS = ["ant", "med", "ren", "mod", "ilu", "con"];
const CAS_CASTIGOS = ["muerte", "carcel", "exilio", "censura"];
const CAS = {
  perseguidos: { datos: () => typeof PERSEGUIDOS === "undefined" ? [] : PERSEGUIDOS, ep: "all", ca: "all", sel: null, cuenta: "perCuenta", cuenta1: "perCuenta1", criterio: "perCriterio" },
  comunidades: { datos: () => typeof COMUNIDADES === "undefined" ? [] : COMUNIDADES, ep: "all", sel: null, cuenta: "comCuenta", cuenta1: "comCuenta1", criterio: "comCriterio" }
};
function casEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function casHayIlu(id){ return typeof ILUSTRES !== "undefined" && ILUSTRES[id] && typeof loadIlustre === "function"; }
function casHayTema(k){ return typeof THEORY !== "undefined" && THEORY[k]; }
function casRetrato(id){ return typeof ILUSTRES_RETRATOS !== "undefined" && ILUSTRES_RETRATOS[id] ? ILUSTRES_RETRATOS[id] : null; }
function casLista(v){ const C = CAS[v]; return C.datos().filter(x => (C.ep === "all" || x.cas_epoca === C.ep) && (!C.ca || C.ca === "all" || x.cas_castigo === C.ca)); }
function casFiltro(v){
  const C = CAS[v], f = document.getElementById(v + "filter"); if (!f) return;
  if (C.sel){ f.hidden = true; f.innerHTML = ""; return; }   // en una ficha, fuera el filtro (no empuja el texto en el móvil)
  const d = C.datos();
  f.hidden = false;
  f.innerHTML = '<div class="fgroup"><span class="flabel">' + casT("epoca") + '</span>' +
    ["all"].concat(CAS_EPOCAS).filter(e => e === "all" || d.some(x => x.cas_epoca === e)).map(e => '<button type="button" class="fbtn" data-cas-ep="' + e + '" aria-pressed="' + (e === C.ep) + '">' + casT(e === "all" ? "todas" : e) + '</button>').join("") + '</div>' +
    (C.ca ? '<div class="fgroup"><span class="flabel">' + casT("castigo") + '</span>' +
      ["all"].concat(CAS_CASTIGOS).filter(c => c === "all" || d.some(x => x.cas_castigo === c)).map(c => '<button type="button" class="fbtn" data-cas-ca="' + c + '" aria-pressed="' + (c === C.ca) + '">' + casT(c === "all" ? "todos" : c) + '</button>').join("") + '</div>' : '');
}
function casMini(x){
  const r = (x.cas_ilu || []).map(casRetrato).filter(Boolean).slice(0, 3);
  return r.length ? '<span class="cas-minis" aria-hidden="true">' + r.map(p => '<img src="' + casEsc(p.f) + '" alt="" loading="lazy">').join("") + '</span>' : '';
}
function casTarjeta(v, x){
  return '<button type="button" class="cas-card" data-ep="' + x.cas_epoca + '" data-cas="' + x.id + '">' + casMini(x) +
    '<span class="cas-txt"><span class="cas-nom">' + casEsc(x.nombre) + '</span>' +
    '<span class="cas-meta">' + casEsc(x.fechas) + (x.cas_castigo ? ' · ' + casT(x.cas_castigo) : '') + '</span>' +
    '<span class="cas-preg">' + casEsc(x.pregunta) + '</span></span></button>';
}
function casRenderLista(v){
  const C = CAS[v], box = document.getElementById(v + "box"); if (!box) return;
  const ls = casLista(v);
  box.innerHTML = '<p class="cas-criterio">' + casT(C.criterio) + '</p>' +
    '<p class="cas-cuenta">' + (ls.length === 1 ? casT(C.cuenta1) : casT(C.cuenta, { n: ls.length })) + '</p>' +
    (ls.length ? '<div class="cas-grid">' + ls.map(x => casTarjeta(v, x)).join("") + '</div>' : '<p>' + casT("ninguno") + '</p>');
}
function casSec(k, txt){ return txt ? '<div class="cas-sec"><p class="cas-k">' + casT(k) + '</p><p>' + casEsc(txt) + '</p></div>' : ''; }
function casGente(x){
  const ids = (x.cas_ilu || []).filter(casHayIlu); if (!ids.length) return "";
  const con = ids.filter(casRetrato), sin = ids.filter(id => !casRetrato(id));
  const boton = id => '<button type="button" class="cas-per" data-ilu="' + id + '" title="' + casEsc(casT("verBio", { n: ILUSTRES[id].name })) + '"><img src="' + casEsc(casRetrato(id).f) + '" alt="" loading="lazy"><span>' + casEsc(ILUSTRES[id].name) + '</span></button>';
  const enlace = id => '<button type="button" class="cas-per-txt" data-ilu="' + id + '">' + casEsc(ILUSTRES[id].name) + '</button>';
  return (con.length ? '<div class="cas-gente">' + con.map(boton).join("") + '</div>' : "") +
    (sin.length ? '<p class="cas-gente-txt">' + casT("biografias") + ' ' + sin.map(enlace).join(" · ") + '</p>' : "");
}
function casImgs(x){
  return (x.imgs || []).length ? '<div class="cas-imgs">' + x.imgs.map(im => '<figure class="cas-fig"><a href="' + casEsc(im.page) + '" target="_blank" rel="noopener" title="' + casEsc(casT("verCommons")) + '"><img src="' + casEsc(im.f) + '" alt="' + casEsc(im.pie) + '" loading="lazy"></a><figcaption>' + casEsc(im.pie) + '</figcaption></figure>').join("") + '</div>' : "";
}
function casCrono(x){
  return (x.cronologia || []).length ? '<div class="cas-sec"><p class="cas-k">' + casT("cronologia") + '</p><ol class="cas-crono">' +
    x.cronologia.map(c => '<li><span class="cas-anio">' + casEsc(c.a) + '</span><span class="cas-suc">' + casEsc(c.t) + '</span></li>').join("") + '</ol></div>' : "";
}
function casEtapas(x){
  return (x.etapas || []).length ? '<div class="cas-sec"><p class="cas-k">' + casT("etapas") + '</p><ol class="cas-etapas">' +
    x.etapas.map(e => '<li><p class="cas-et-n">' + casEsc(e.nom) + ' <span class="cas-et-a">' + casEsc(e.a) + '</span></p><p class="cas-et-q">' + casEsc(e.q) + '</p><p>' + casEsc(e.d) + '</p></li>').join("") + '</ol></div>' : "";
}
function casDetalle(v, x){
  const box = document.getElementById(v + "box"); if (!box) return;
  const all = CAS[v].datos(), ls = casLista(v).some(y => y.id === x.id) ? casLista(v) : all, i = ls.findIndex(y => y.id === x.id), prev = ls[i - 1], next = ls[i + 1];
  const temas = (x.temas || []).filter(casHayTema);
  const cuerpo = v === "perseguidos" ?
      casImgs(x) + casSec("ideas", x.ideas) + casSec("poder", x.poder) + casSec("relato", x.relato) + casCrono(x) :
      casImgs(x) + casSec("lugar", x.lugar) + casSec("hoy", x.hoy) + casSec("miembros", x.miembros) + casEtapas(x) + casSec("vida", x.vida) + casSec("comunes", x.ideas) + casCrono(x);
  box.innerHTML = '<div class="cas-nav"><button type="button" class="btn ghost" data-cas-back>' + casT("volver") + '</button><span>' +
      (prev ? '<button type="button" class="btn ghost" data-cas="' + prev.id + '" title="' + casEsc(prev.nombre) + '">' + casT("anterior") + '</button>' : '') +
      (next ? '<button type="button" class="btn ghost" data-cas="' + next.id + '" title="' + casEsc(next.nombre) + '">' + casT("siguiente") + '</button>' : '') + '</span></div>' +
    '<article class="cas-ficha" data-ep="' + x.cas_epoca + '">' +
      '<p class="cas-meta">' + casT(x.cas_epoca) + ' · ' + casEsc(x.fechas) + (x.cas_castigo ? ' · ' + casT(x.cas_castigo) : '') + '</p>' +
      '<h2 class="cas-tit">' + casEsc(x.nombre) + '</h2>' + casGente(x) + cuerpo +
      (x.cita && x.cita.t ? '<blockquote class="cas-cita"><p>«' + casEsc(x.cita.t) + '»</p><cite>' + casEsc(x.cita.ref) + '</cite></blockquote>' : '') +
      casSec(v === "perseguidos" ? "despues" : "fin", v === "perseguidos" ? x.despues : x.fin) +
      (x.trampa ? '<div class="cas-sec cas-trampa"><p class="cas-k">' + casT("trampa") + '</p><p>' + casEsc(x.trampa) + '</p></div>' : '') +
      (x.pregunta ? '<p class="aporia cas-pensar"><strong>' + casT("pensar") + ':</strong> ' + casEsc(x.pregunta) + '</p>' : '') +
      (temas.length ? '<div class="cas-temas"><span class="cas-k">' + casT("temas") + '</span> ' + temas.map(k => '<button type="button" class="cas-tema" data-th="' + k + '" title="' + casEsc(THEORY[k].title) + '">' + casEsc(THEORY[k].title) + '</button>').join("") + '</div>' : '') +
      ((x.fuentes || []).length ? '<div class="cas-fuentes"><span class="cas-k">' + casT("fuentes") + '</span><ul>' + x.fuentes.map(f => '<li><a href="' + casEsc(f.url) + '" target="_blank" rel="noopener">' + casEsc(f.t) + '</a></li>').join("") + '</ul></div>' : '') +
    '</article>';
}
function casAbrir(v, id, sinScroll){
  const C = CAS[v], x = C.datos().find(y => y.id === id);
  if (!x){ C.sel = null; casFiltro(v); casRenderLista(v); return; }
  C.sel = id; casFiltro(v); casDetalle(v, x);
  if (typeof setDeepHash === "function") setDeepHash(v, id);
  if (!sinScroll) window.scrollTo(0, 0);
}
function casVolver(v){ CAS[v].sel = null; casFiltro(v); casRenderLista(v); if (typeof setDeepHash === "function") setDeepHash(v, ""); window.scrollTo(0, 0); }
function casCargar(v, arg){
  const C = CAS[v]; if (!C.datos().length) return;
  const id = String(arg || "").split("/")[0];
  if (id && C.datos().some(x => x.id === id)){ casAbrir(v, id); return; }
  C.sel = null; casFiltro(v); casRenderLista(v);
}
function loadPerseguidos(arg){ casCargar("perseguidos", arg); }
function loadComunidades(arg){ casCargar("comunidades", arg); }
window.loadPerseguidos = loadPerseguidos; window.loadComunidades = loadComunidades;

document.addEventListener("click", e => {
  const t = e.target; if (!t.closest) return;
  const enIlu = t.closest("#ilubox [data-cas-v]");
  if (enIlu){ (window.show || show)(enIlu.dataset.casV); casAbrir(enIlu.dataset.casV, enIlu.dataset.cas); return; }
  const sec = t.closest("#perseguidos, #comunidades"); if (!sec) return;
  const v = sec.id, C = CAS[v];
  const ep = t.closest("[data-cas-ep]"); if (ep){ C.ep = ep.dataset.casEp; casFiltro(v); casRenderLista(v); return; }
  const ca = t.closest("[data-cas-ca]"); if (ca){ C.ca = ca.dataset.casCa; casFiltro(v); casRenderLista(v); return; }
  if (t.closest("[data-cas-back]")){ casVolver(v); return; }
  const c = t.closest("[data-cas]"); if (c){ casAbrir(v, c.dataset.cas); return; }
  const il = t.closest("[data-ilu]"); if (il){ (window.show || show)("ilustres"); loadIlustre(il.dataset.ilu); return; }
  const th = t.closest("[data-th]"); if (th){ (window.show || show)("teoria"); if (typeof window.loadTheory === "function") window.loadTheory(th.dataset.th); }
});

/* ---- Ilustres: perseguidos y comunidades de un pensador (las pinta ilustresview.js si existe casosDe) ---- */
function casosDe(id){
  return [["perseguidos", "enPer"], ["comunidades", "enCom"]].map(([v, k]) => {
    const ls = CAS[v].datos().filter(x => (x.cas_ilu || []).includes(id)); if (!ls.length) return "";
    return '<li><span class="ilu-rel-op">' + casT(k) + '</span> ' + ls.map(x => '<button type="button" class="ilu-rel-a" data-cas-v="' + v + '" data-cas="' + x.id + '" title="' + casEsc(x.pregunta) + '">' + casEsc(x.nombre) + ' (' + casEsc(x.fechas) + ')</button>').join(" · ") + '</li>';
  }).join("");
}
window.casosDe = casosDe;
/* (18-10) Biografías se pinta antes de que existan PERSEGUIDOS: ahora que están, se repintan sus controles (filtro «Perseguidos por sus ideas») */
if (typeof renderIluControls === "function") renderIluControls();
/* primera pintura: la lista, sin esperar al enrutado */
["perseguidos", "comunidades"].forEach(v => { if (document.getElementById(v + "box") && CAS[v].datos().length){ casFiltro(v); casRenderLista(v); } });
