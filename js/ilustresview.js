"use strict";
/* ===== Vista Ilustres ===== depende de: ilustres.js (ILUSTRES), ilustres_retratos.js (ILUSTRES_RETRATOS, opcional),
   theory.js (THEORY, para los enlaces a los temas) =====
   Biografías de los pensadores que aparecen en la teoría de Filosofía 1.º y de Historia de la
   Filosofía 2.º. Listado en orden cronológico, filtrable por materia (si la web trae las dos),
   época y búsqueda; cada tarjeta abre la ficha del pensador (enlace profundo #ilustres/<id>).
   Retrato de dominio público o CC (Wikimedia Commons) cuando lo hay; si no, un monograma. */

const ILU_EPOCAS = [
  ["ant", "القديمة"], ["med", "الوسيطة"], ["ren", "عصر النهضة"], ["mod", "الحديثة"], ["ilu", "الأنوار"], ["con", "المعاصرة"]
];
const ILU_SUBJECTS = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة" };
let iluSubject = "all", iluEpoca = "all", iluQuery = "";

function iluFold(s){ return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function iluEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
/* (29-09) orden: por época (ILU_EPOCAS) y, dentro de cada una, por nacimiento; así cada época sale una
   sola vez aunque la época del eje del dpto. no coincida con las fechas (Hipatia, Hume, Bentham, Mill…) */
function iluList(){
  if (typeof ILUSTRES === "undefined" || !ILUSTRES) return [];
  const ep = b => { const i = ILU_EPOCAS.findIndex(e => e[0] === b); return i < 0 ? ILU_EPOCAS.length : i; };
  return Object.keys(ILUSTRES).map(k => Object.assign({ id: k }, ILUSTRES[k]))
    .sort((a, b) => ep(a.block) - ep(b.block) || (a.born ?? 0) - (b.born ?? 0));
}
function iluPresent(){ const all = iluList(); return ["fil", "hf"].filter(s => all.some(p => (p.subjects || []).includes(s))); }
function iluEpocaName(b){ const e = ILU_EPOCAS.find(x => x[0] === b); return e ? e[1] : ""; }
/* retrato: {f, pie, page?} de ilustres_retratos.js (generado por tools/build_ilustres.js) */
function iluRetrato(p){
  return typeof ILUSTRES_RETRATOS !== "undefined" && ILUSTRES_RETRATOS[p.id] || null;
}
function iluInitials(name){
  const w = String(name || "").replace(/\(.*?\)/g, "").split(/\s+/).filter(x => x && /^[A-ZÁÉÍÓÚÑÄÖÜ]/.test(x));
  return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
}
function iluAvatar(p, big){
  const r = iluRetrato(p);
  if (r) return '<img class="ilu-img' + (big ? " figimg" : "") + '" loading="lazy" src="' + iluEsc(r.f) + '" alt="' + iluEsc(p.name) + '">';
  return '<span class="ilu-mono" aria-hidden="true">' + iluEsc(iluInitials(p.name)) + '</span>';
}
function iluHi(escaped, q){
  if (!q || q.length < 2) return escaped;
  const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  return escaped.replace(rx, "<mark>$1</mark>");
}

function iluFiltered(){
  const q = iluFold(iluQuery);
  return iluList().filter(p => {
    if (iluSubject !== "all" && !(p.subjects || []).includes(iluSubject)) return false;
    if (iluEpoca !== "all" && p.block !== iluEpoca) return false;
    if (q && !iluFold([p.name, p.role, p.idea, (p.obras || []).join(" "), p.bio, p.anecdota].join(" ")).includes(q)) return false;
    return true;
  });
}

function renderIluControls(){
  const box = document.getElementById("ilufilter");
  if (!box) return;
  const present = iluPresent();
  if (iluSubject !== "all" && !present.includes(iluSubject)) iluSubject = "all";
  const subjBtns = ["all"].concat(present).map(s =>
    '<button class="fbtn" data-isub="' + s + '" aria-pressed="' + (s === iluSubject) + '">' +
    (s === "all" ? "الكل" : ILU_SUBJECTS[s]) + '</button>').join("");
  const epBtns = [["all", "الكل"]].concat(ILU_EPOCAS).map(e =>
    '<button class="fbtn" data-iep="' + e[0] + '" aria-pressed="' + (e[0] === iluEpoca) + '">' +
    (e[0] === "all" ? "" : '<i class="ilu-dot" data-b="' + e[0] + '" aria-hidden="true"></i>') + e[1] + '</button>').join("");
  box.innerHTML =
    (present.length > 1 ? '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' : '') +
    '<div class="fgroup"><span class="flabel">العصر</span>' + epBtns + '</div>' +
    '<div class="ilu-tools"><input class="ilu-search" id="ilusearch" type="search" placeholder="ابحثوا عن مفكر أو عمل أو فكرة…" autocomplete="off" aria-label="البحث في الأعلام"></div>';
  box.querySelectorAll("[data-isub]").forEach(b => b.addEventListener("click", () => {
    iluSubject = b.dataset.isub;
    box.querySelectorAll("[data-isub]").forEach(x => x.setAttribute("aria-pressed", x.dataset.isub === iluSubject));
    renderIluList();
  }));
  box.querySelectorAll("[data-iep]").forEach(b => b.addEventListener("click", () => {
    iluEpoca = b.dataset.iep;
    box.querySelectorAll("[data-iep]").forEach(x => x.setAttribute("aria-pressed", x.dataset.iep === iluEpoca));
    renderIluList();
  }));
  const inp = document.getElementById("ilusearch");
  inp.value = iluQuery;
  let t = null;
  inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { iluQuery = inp.value.trim(); renderIluList(); }, 120); });
}

function renderIluList(){
  const box = document.getElementById("ilubox"), cnt = document.getElementById("ilucount"), fb = document.getElementById("ilufilter");
  if (!box) return;
  if (fb) fb.hidden = false;
  const rows = iluFiltered(), total = iluList().length;
  if (cnt){
    cnt.hidden = false;
    cnt.textContent = rows.length + (rows.length === 1 ? " مفكر" : " مفكرين") + (rows.length !== total ? " (من " + total + ")" : "");
  }
  if (!rows.length){ box.innerHTML = '<p class="ilu-empty">لا يوجد مفكرون يطابقون البحث.</p>'; return; }
  const q = iluQuery;
  let html = "", last = null;
  rows.forEach(p => {
    if (p.block !== last){
      if (last !== null) html += "</div>";
      html += '<h2 class="ilu-era" data-b="' + p.block + '">' + (iluFichaEpoca(p.block)
        ? '<button type="button" class="ilu-era-btn" data-epoca="' + p.block + '" title="' + ILU_EPO.ver + '">' + iluEsc(iluEpocaName(p.block)) + ' <span aria-hidden="true">›</span></button>'
        : iluEsc(iluEpocaName(p.block))) + '</h2><div class="ilu-grid">';
      last = p.block;
    }
    html += '<button class="ilu-card" data-b="' + p.block + '" data-ilu="' + iluEsc(p.id) + '">' +
      '<span class="ilu-av">' + iluAvatar(p) + '</span>' +
      '<span class="ilu-txt"><b>' + iluHi(iluEsc(p.name), q) + '</b>' +
      '<span class="ilu-dates">' + iluEsc(p.dates) + '</span>' +
      '<span class="ilu-role">' + iluHi(iluEsc(p.role), q) + '</span></span></button>';
  });
  html += "</div>";
  box.innerHTML = html;
  box.querySelectorAll("[data-ilu]").forEach(b => b.addEventListener("click", () => loadIlustre(b.dataset.ilu)));
  box.querySelectorAll("[data-epoca]").forEach(b => b.addEventListener("click", () => loadIlustre("epoca-" + b.dataset.epoca)));
}

function iluTemaChips(p){
  if (typeof THEORY === "undefined") return "";
  const ks = (p.temas || []).filter(k => THEORY[k]);
  if (!ks.length) return "";
  return '<div class="ilu-sec ilu-sec-temas"><h3>يرد في الدرس</h3><div class="ilu-temas">' +
    ks.map(k => '<button class="ilu-tema" data-th="' + iluEsc(k) + '"><span>' + iluEsc(THEORY[k].tema) + '</span>' + iluEsc(THEORY[k].title) + '</button>').join("") +
    '</div></div>';
}

/* (29-09) Sus frases (citas.js, enlazadas por «id»), con el estilo de la sección Frases */
const ILU_FRASES = "أقوال", ILU_CLASE = "في القسم";
function iluCitas(p){
  if (typeof CITAS === "undefined") return "";
  const cs = CITAS.filter(c => c.id === p.id).sort((a, b) => (b.dest ? 1 : 0) - (a.dest ? 1 : 0));
  if (!cs.length) return "";
  return '<div class="ilu-sec ilu-cits"><h3>' + ILU_FRASES + '</h3>' + cs.map(c =>
    '<figure class="ilu-cit' + (c.dest ? ' ilu-cit-dest' : '') + '">' + (c.dest ? '<span class="ilu-cit-badge">' + ILU_CLASE + '</span>' : '') +
    '<blockquote class="ilu-cit-q">' + iluEsc(c.c) + '</blockquote>' +
    (c.o ? '<figcaption class="ilu-cit-o">' + iluEsc(c.o) + '</figcaption>' : '') + '</figure>').join("") + '</div>';
}

/* (10-10) «Afines y opuestos» y «Conceptos del glosario», al final de la ficha (idea tomada de las fichas de
   cerebrofilosofico.com, sin contenido nuevo: todo sale de datos ya revisados).
   · Afines y opuestos: sus líneas de Genealogías (GENEALOGIAS.lineas, con quién va antes y después), sus
     oposiciones (GENEALOGIAS.op) y los acuerdos y desacuerdos de sus tesis (GEN_TESIS.enlaces, con el porqué).
   · Conceptos del glosario: los términos con su id en el campo «ilustre» (tools/build_glosario_ilustres.js).
   Solo se enlaza a pensadores que están en esta web (build_subject.js filtra ILUSTRES por materia). */
const ILU_REL = { tit: "الأقربون والخصوم", frente: "في مواجهة", tesis: "أطروحاته في النقاش", acuerdo: "يتفق مع", desacuerdo: "يختلف مع",
  conceptos: "مفاهيم من المسرد", mas: "و{n} أخرى" };
function iluLink(id, cl){
  const q = ILUSTRES[id]; if (!q) return "";
  return '<button type="button" class="ilu-rel-a' + (cl ? " " + cl : "") + '" data-go-ilu="' + iluEsc(id) + '">' + iluEsc(q.name) + '</button>';
}
function iluRelaciones(p){
  const out = [];
  if (typeof GENEALOGIAS !== "undefined" && GENEALOGIAS){
    (GENEALOGIAS.lineas || []).forEach(l => {
      const ids = (l.ilustre || []).filter(id => id === p.id || ILUSTRES[id]), i = ids.indexOf(p.id);
      if (i < 0) return;
      const tramo = ids.slice(Math.max(0, i - 1), i + 2).map(id => id === p.id ? '<b>' + iluEsc(p.name) + '</b>' : iluLink(id));
      out.push('<li><span class="ilu-rel-linea" style="--l:' + iluEsc(l.color) + '">' + iluEsc(l.name) + '</span> ' + tramo.join(' <span aria-hidden="true">→</span> ') + '</li>');
    });
    const op = (GENEALOGIAS.op || []).map(o => o.ilustre || []).filter(o => o.includes(p.id))
      .map(o => o.find(id => id !== p.id)).filter(id => ILUSTRES[id]);
    if (op.length) out.push('<li><span class="ilu-rel-op">' + ILU_REL.frente + '</span> ' + op.map(id => iluLink(id)).join(" · ") + '</li>');
  }
  let deb = "";
  if (typeof GEN_TESIS !== "undefined" && GEN_TESIS){
    const de = {}; (GEN_TESIS.tesis || []).forEach(t => { de[t.id] = t.ilustre; });
    const rows = (GEN_TESIS.enlaces || []).map(e => {
      const [a, b] = String(e.k).split("|"), otro = de[a] === p.id ? de[b] : de[b] === p.id ? de[a] : null;
      if (!otro || otro === p.id || !ILUSTRES[otro]) return "";
      const ok = e.tipo === "acuerdo";
      return '<li class="' + (ok ? "ilu-rel-si" : "ilu-rel-no") + '"><span class="ilu-rel-tipo">' + (ok ? ILU_REL.acuerdo : ILU_REL.desacuerdo) + '</span> ' +
        iluLink(otro) + (e.por ? '<span class="ilu-rel-por">' + iluEsc(e.por) + '</span>' : '') + '</li>';
    }).filter(Boolean);
    if (rows.length) deb = '<h4>' + ILU_REL.tesis + '</h4><ul class="ilu-rel-tesis">' + rows.join("") + '</ul>';
  }
  if (!out.length && !deb) return "";
  return '<div class="ilu-sec ilu-rel"><h3>' + ILU_REL.tit + '</h3>' + (out.length ? '<ul class="ilu-rel-list">' + out.join("") + '</ul>' : '') + deb + '</div>';
}
const ILU_CONC_VISIBLES = 12;
function iluConceptos(p){
  if (typeof GLOSARIO === "undefined" || !Array.isArray(GLOSARIO)) return "";
  const ts = GLOSARIO.filter(g => (g.ilustre || []).includes(p.id) && (!p.subjects || p.subjects.includes(g.subject)));
  if (!ts.length) return "";
  const a = g => '<button type="button" class="ilu-conc-a" data-glo="' + iluEsc(g.t) + '" data-glo-sub="' + iluEsc(g.subject) + '">' + iluEsc(g.t) + '</button>';
  const vis = ts.slice(0, ILU_CONC_VISIBLES).map(a).join(", "), resto = ts.slice(ILU_CONC_VISIBLES);
  return '<div class="ilu-sec ilu-conc"><h3>' + ILU_REL.conceptos + '</h3><div class="ilu-conc-txt">' + vis +
    (resto.length ? ' <details class="ilu-conc-mas"><summary>' + ILU_REL.mas.replace("{n}", resto.length) + '</summary>' + resto.map(a).join(", ") + '</details>' : '') + '</div></div>';
}
/* abrir el glosario filtrado por un término (como el buscador general, search.js) */
function iluAbrirGlosario(t, sub){
  (window.show || show)("glosario");
  try {
    if (typeof gloSubject !== "undefined"){ gloSubject = sub || gloSubject; gloBloque = "all"; gloArea = "all"; gloQuery = t; }
    if (typeof renderGloControls === "function") renderGloControls();
    if (typeof renderGloList === "function") renderGloList();
  } catch (e){}
  window.scrollTo(0, 0);
}

/* (10-10) Fichas de época (epocas_fichas.js): mismo marco que la ficha de un pensador. Apartados fijos y, al final,
   los pensadores de esa época en Ilustres (calculado) y el paso a la época siguiente. */
const ILU_EPO = { ver: "عرض بطاقة الحقبة", abre: "ما الذي يفتتحها", social: "المجتمع", politico: "السياسة",
  ciencia: "العلم والتقنية", pensamiento: "الفكر", pensadores: "مفكرو هذه الحقبة", rupturas: "القطائع والتحولات",
  trampa: "فخّ", epoca: "العصر", volver: "→ كل الأعلام" };
function iluListaPlegada(items, n){
  const resto = items.slice(n);
  return items.slice(0, n).join(", ") + (resto.length ? ' <details class="ilu-conc-mas"><summary>' + ILU_REL.mas.replace("{n}", resto.length) + '</summary>' + resto.join(", ") + '</details>' : '');
}
function iluFichaEpoca(b){ return typeof EPOCAS_FICHAS !== "undefined" && EPOCAS_FICHAS && EPOCAS_FICHAS[b] || null; }
function loadEpoca(b){
  const box = document.getElementById("ilubox"), f = iluFichaEpoca(b);
  if (!box || !f){ renderIluList(); return; }
  const fb = document.getElementById("ilufilter"), cnt = document.getElementById("ilucount");
  if (fb) fb.hidden = true;
  if (cnt) cnt.hidden = true;
  const i = ILU_EPOCAS.findIndex(e => e[0] === b), prev = ILU_EPOCAS[i - 1], next = ILU_EPOCAS[i + 1];
  const navEp = (e, txt) => e && iluFichaEpoca(e[0]) ? '<button class="btn ghost" data-epoca="' + e[0] + '">' + txt.replace("{e}", iluEsc(iluEpocaName(e[0]))) + '</button>' : '';
  const sec = (k, cls) => f[k] ? '<div class="ilu-sec' + (cls ? " " + cls : "") + '"><h3>' + ILU_EPO[k] + '</h3>' + f[k] + '</div>' : '';
  const ps = iluList().filter(p => p.block === b);
  box.innerHTML =
    '<div class="ilu-nav"><button class="btn ghost" data-back>' + ILU_EPO.volver + '</button>' +
    '<span class="ilu-pn">' + navEp(prev, "‹ {e}") + navEp(next, "{e} ›") + '</span></div>' +
    '<article class="ilu-ficha ilu-epoca" data-b="' + b + '">' +
      '<header class="ilu-epo-head"><p class="ilu-era-tag"><i class="ilu-dot" data-b="' + b + '" aria-hidden="true"></i>' + ILU_EPO.epoca + '</p>' +
        '<h2>' + iluEsc(iluEpocaName(b)) + '</h2>' + (f.anos ? '<p class="ilu-life">' + iluEsc(f.anos) + '</p>' : '') + '</header>' +
      sec("abre") + sec("social") + sec("politico") + sec("ciencia") + sec("pensamiento") +
      (ps.length ? '<div class="ilu-sec ilu-conc"><h3>' + ILU_EPO.pensadores + '</h3><div class="ilu-conc-txt">' +
        iluListaPlegada(ps.map(p => '<button type="button" class="ilu-rel-a" data-go-ilu="' + iluEsc(p.id) + '" title="' + iluEsc(p.dates) + '">' + iluEsc(p.name) + '</button>'), 20) + '</div></div>' : '') +
      sec("rupturas") + sec("trampa", "ilu-anec") +
    '</article>';
  box.querySelector("[data-back]").addEventListener("click", () => {
    renderIluList();
    try { history.replaceState(null, "", "#ilustres"); } catch (e){}
    window.scrollTo(0, 0);
  });
  box.querySelectorAll("[data-go-ilu]").forEach(x => x.addEventListener("click", () => loadIlustre(x.dataset.goIlu)));
  box.querySelectorAll("[data-epoca]").forEach(x => x.addEventListener("click", () => loadEpoca(x.dataset.epoca)));
  try { history.replaceState(null, "", "#ilustres/epoca-" + b); } catch (e){}
  window.scrollTo(0, 0);
}

/* Ficha de un pensador. Sin argumento (o id desconocido) vuelve al listado. */
/* (01-10) «Su vida en fechas»: una sola línea vertical, de arriba abajo, con lo esencial (nace, los hechos del campo
   «vida» {a, b?, t} y muere). No toca la biografía: va detrás, como una sección más de la ficha. */
const ILU_VIDA = { tit: "حياته بالتواريخ", nace: "وُلد", muere: "توفي", ac: "{n} ق.م" };
function iluAno(y){ return y < 0 ? ILU_VIDA.ac.replace("{n}", -y) : String(y); }
function iluVida(p){
  const v = (p.vida || []).filter(e => !e.ctx).slice().sort((x, y) => x.a - y.a);
  if (!v.length || p.born == null) return "";
  const c = /^c\./.test(p.dates || "") ? "c. " : "";
  const fecha = e => e.b == null ? iluAno(e.a) : e.a < 0 && e.b < 0 ? ILU_VIDA.ac.replace("{n}", -e.a + "–" + -e.b) : iluAno(e.a) + "–" + iluAno(e.b);
  const fila = (f, t, cl) => '<li' + (cl ? ' class="' + cl + '"' : '') + '><span class="vida-a">' + iluEsc(f) + '</span><span class="vida-t">' + iluEsc(t) + '</span></li>';
  return '<div class="ilu-sec ilu-vida"><h3>' + ILU_VIDA.tit + '</h3><ol class="vida-linea">' +
    fila(c + iluAno(p.born), ILU_VIDA.nace + (p.place ? " · " + p.place : ""), "vida-extremo") +
    v.map(e => fila(fecha(e), e.t)).join("") +
    (p.died != null ? fila(iluAno(p.died), ILU_VIDA.muere, "vida-extremo") : "") + '</ol></div>';
}

function loadIlustre(id){
  const box = document.getElementById("ilubox");
  if (!box) return;
  if (/^epoca-/.test(id || "") && iluFichaEpoca(id.slice(6))){ loadEpoca(id.slice(6)); return; }
  const all = iluList(), p = all.find(x => x.id === id);
  if (!p){ renderIluList(); return; }
  const fb = document.getElementById("ilufilter"), cnt = document.getElementById("ilucount");
  if (fb) fb.hidden = true;
  if (cnt) cnt.hidden = true;
  const seq = iluFiltered().some(x => x.id === id) ? iluFiltered() : all;
  const i = seq.findIndex(x => x.id === id), prev = seq[i - 1], next = seq[i + 1];
  const r = iluRetrato(p);
  box.innerHTML =
    '<div class="ilu-nav"><button class="btn ghost" data-back>→ كل الأعلام</button>' +
    '<span class="ilu-pn">' +
      (prev ? '<button class="btn ghost" data-go-ilu="' + iluEsc(prev.id) + '" title="' + iluEsc(prev.name) + '">‹ السابق</button>' : '') +
      (next ? '<button class="btn ghost" data-go-ilu="' + iluEsc(next.id) + '" title="' + iluEsc(next.name) + '">التالي ›</button>' : '') +
    '</span></div>' +
    '<article class="ilu-ficha" data-b="' + p.block + '">' +
      '<header class="ilu-head">' +
        '<figure class="ilu-portrait">' + iluAvatar(p, true) +
          (r ? '<figcaption>' + iluEsc(r.pie) + ' · ' + (r.page ? '<a href="' + iluEsc(r.page) + '" target="_blank" rel="noopener">' + (/wikipedia\.org/.test(r.page) ? "Wikipedia" : "Wikimedia Commons") + '</a>' : 'Wikimedia Commons') + '</figcaption>' : '') +
        '</figure>' +
        '<div class="ilu-id">' +
          '<p class="ilu-era-tag"><i class="ilu-dot" data-b="' + p.block + '" aria-hidden="true"></i>' + (iluFichaEpoca(p.block)
            ? '<button type="button" class="ilu-era-link" data-epoca="' + p.block + '" title="' + ILU_EPO.ver + '">' + iluEsc(iluEpocaName(p.block)) + '</button>'
            : iluEsc(iluEpocaName(p.block))) + ' · ' + iluEsc(p.role) + '</p>' +
          '<h2>' + iluEsc(p.name) + '</h2>' +
          '<p class="ilu-life">' + iluEsc(p.dates) + (p.place ? ' · ' + iluEsc(p.place) : '') + '</p>' +
          (p.idea ? '<p class="ilu-idea">' + iluEsc(p.idea) + '</p>' : '') +
        '</div>' +
      '</header>' +
      '<div class="ilu-bio">' + (p.bio || "") + '</div>' +
      iluVida(p) +
      iluCitas(p) +
      (p.anecdota ? '<div class="ilu-sec ilu-anec"><h3><span>طُرفة</span>' + (p.tradicion ? ' <span class="ilu-trad">حسب التقليد</span>' : '') + '</h3>' +
        p.anecdota + (p.fuente ? '<p class="ilu-fuente"><span>المصدر</span>: ' + iluEsc(p.fuente) + '</p>' : '') + '</div>' : '') +
      ((p.obras || []).length ? '<div class="ilu-sec"><h3>الأعمال الرئيسية</h3><ul class="ilu-obras">' + p.obras.map(o => '<li>' + iluEsc(o) + '</li>').join("") + '</ul></div>' : '') +
      iluTemaChips(p) +
      iluRelaciones(p) +
      iluConceptos(p) +
    '</article>';
  box.querySelector("[data-back]").addEventListener("click", () => {
    renderIluList();
    try { history.replaceState(null, "", "#ilustres"); } catch (e){}
    window.scrollTo(0, 0);
  });
  box.querySelectorAll("[data-go-ilu]").forEach(b => b.addEventListener("click", () => loadIlustre(b.dataset.goIlu)));
  box.querySelectorAll("[data-glo]").forEach(b => b.addEventListener("click", () => iluAbrirGlosario(b.dataset.glo, b.dataset.gloSub)));
  box.querySelectorAll("[data-epoca]").forEach(b => b.addEventListener("click", () => loadIlustre("epoca-" + b.dataset.epoca)));
  box.querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => {
    (window.show || show)("teoria");
    if (typeof window.loadTheory === "function") window.loadTheory(b.dataset.th);
  }));
  const img = box.querySelector(".ilu-portrait img");
  if (img) img.addEventListener("click", () => { if (typeof openLightbox === "function") openLightbox(img.src, img.alt); });
  window.scrollTo(0, 0);
}

/* En la teoría: al final de cada unidad, una tira con los ilustres que aparecen en ella (enlaza a su
   ficha). Envuelve loadTheory() igual que retratosview.js, sin tocar theory.js ni theoryview.js. */
function iluInjectTheory(){
  const body = document.getElementById("theorybody");
  if (!body) return;
  const old = body.querySelector(".ilu-strip"); if (old) old.remove();
  const k = typeof theoryKey !== "undefined" ? theoryKey : null;   // unidad abierta (theoryview.js)
  const ps = k ? iluList().filter(p => (p.temas || []).includes(k)) : [];
  if (!ps.length) return;
  const strip = document.createElement("aside");
  strip.className = "ilu-strip";
  strip.innerHTML = '<h3>أعلام هذا الموضوع</h3><div class="ilu-strip-list">' +
    ps.map(p => '<button data-ilu="' + iluEsc(p.id) + '" data-b="' + p.block + '">' + iluEsc(p.name) + '<span>' + iluEsc(p.dates) + '</span></button>').join("") + '</div>';
  body.appendChild(strip);
  strip.querySelectorAll("[data-ilu]").forEach(b => b.addEventListener("click", () => {
    (window.show || show)("ilustres");
    loadIlustre(b.dataset.ilu);
  }));
}
if (typeof loadTheory === "function"){
  const origTheory = loadTheory;
  loadTheory = function(k){ const out = origTheory.apply(this, arguments); try { iluInjectTheory(); } catch (e){} return out; };
}

/* «#ilustres» sin argumento (atrás del navegador, enlace) con una ficha abierta → vuelve al listado */
window.addEventListener("hashchange", () => {
  if (location.hash === "#ilustres" && document.querySelector("#ilubox .ilu-ficha")) renderIluList();
});

renderIluControls();
renderIluList();
try { iluInjectTheory(); } catch (e){}   // la primera unidad ya está pintada al cargar theoryview.js
