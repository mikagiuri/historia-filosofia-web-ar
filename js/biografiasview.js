"use strict";
/* ===== Vista Ilustres ===== depende de: biografias.js (BIOGRAFIAS), biografias_retratos.js (BIOGRAFIAS_RETRATOS, opcional),
   theory.js (THEORY, para los enlaces a los temas) =====
   Biografías de los pensadores que aparecen en la teoría de Filosofía 1.º y de Historia de la
   Filosofía 2.º. Listado en orden cronológico, filtrable por materia (si la web trae las dos),
   época y búsqueda; cada tarjeta abre la ficha del pensador (enlace profundo #biografias/<id>).
   Retrato de dominio público o CC (Wikimedia Commons) cuando lo hay; si no, un monograma. */

const ILU_EPOCAS = [
  ["ant", "القديمة"], ["med", "الوسيطة"], ["ren", "عصر النهضة"], ["mod", "الحديثة"], ["ilu", "الأنوار"], ["con", "المعاصرة"]
];
const ILU_SUBJECTS = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة" };
let bioSubject = "all", bioEpoca = "all", bioQuery = "";
let bioAmb = "all";   // (12-10) 1.º: fila «Ámbito»
/* (18-10) petición del profesor: elegir el orden de la lista, por fecha (épocas, como siempre) o alfabético
   (agrupado por letra). Se recuerda en este navegador. */
let iluOrden = (() => { try { return localStorage.getItem("iluOrden") === "alfa" ? "alfa" : "cron"; } catch (e) { return "cron"; } })();
/* (18-10, decisión del profesor) todo perseguido tiene ficha aquí: etiqueta en la ficha y filtro en el índice (casos de perseguidos.js por cas_ilu) */
let bioPers = false;
let bioImp = false;   // (19-10) filtro «solo imprescindibles y esenciales» (niveles 5 y 4: imprescindibles.js)
function bioCasosPer(id){ return (typeof PERSEGUIDOS !== "undefined" && Array.isArray(PERSEGUIDOS)) ? PERSEGUIDOS.filter(c => (c.cas_ilu || []).includes(id)) : []; }
/* clave alfabética: el apellido; en la Antigüedad y la Edad Media, o con «de/da/della + lugar o familia» antes
   del Renacimiento-Moderna temprana (Nicolás de Cusa, Erasmo de Róterdam, Isabel de Bohemia), el nombre de pila;
   partículas en mayúscula (La Mettrie, De Morgan) y «X y Y» (Ortega y Gasset) se resuelven aquí. En las webs
   traducidas se aplica la misma regla al nombre traducido (las excepciones de lugar están en castellano). */
function bioClave(p){
  const n = String(p.name || "").replace(/\(.*?\)/g, "").trim(), w = n.split(/\s+/);
  if (w.length === 1 || p.block === "ant" || p.block === "med") return n;
  const i = w.findIndex((x, k) => k > 0 && /^(de|da|della|di)$/.test(x));
  if (i > 0 && (p.block === "ren" || p.block === "mod") && /^(Cusa|Vinci|Mirandola|Róterdam|Bohemia)$/.test(w[w.length - 1])) return w[0] === "Giovanni" ? w[1] : w[0];
  const y = w.indexOf("و"); if (y > 0) return w[y - 1];
  const k = w.length - 1;
  if (k > 0 && /^(La|Le|De|Du|Van|Von)$/.test(w[k - 1])) return w[k - 1] + " " + w[k];
  return w[k].replace(/^(d['’]|l['’])/i, "");
}
function bioLetra(p){ return bioFold(bioClave(p)).charAt(0).toUpperCase() || "#"; }
/* (12-10) criterio del profesor: en la web de 1.º Ilustres criba por ÁMBITO filosófico (los años y la época
   siguen en cada ficha —«aunque incluyamos la información temporal»—). En HF y en la web local sigue por época.
   Ámbito = el de los temas de teoría que cita la ficha (temaN o el rótulo, ya traducido en las webs). */
const ILU_AMBS = { int: "مدخل", ant: "الأنثروبولوجيا", con: "المعرفة", met: "ميتافيزيقا", log: "المنطق", eti: "الأخلاق", pol: "السياسة", est: "علم الجمال" };
const ILU_AMB_ORDEN = ["int", "ant", "con", "met", "log", "eti", "pol", "est"];
function bioEsFil(){ return typeof SUBJECTS !== "undefined" && !!SUBJECTS.fil && !SUBJECTS.hf; }
function bioRamas(p){
  const s = new Set(), MAP = { 1: "int", 2: "ant", 3: "con", 4: "log", 5: "eti", 6: "pol", 7: "est" };
  for (const k of p.temas || []){
    if (typeof THEORY === "undefined" || !THEORY[k]) continue;
    const t = THEORY[k], T = String(t.tema || "");
    const mm = /(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/.exec(T);
    const n = typeof t.temaN === "number" ? t.temaN : (/·\s*M(?:\s|$|\()/.test(T) ? 3.5 : (mm ? +(mm[1] || mm[2]) : null));
    if (n === 3.5) s.add("met"); else if (MAP[n]) s.add(MAP[n]);
  }
  return [...s];
}

function bioFold(s){ return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function bioEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
/* (29-09) orden: por época (ILU_EPOCAS) y, dentro de cada una, por nacimiento; así cada época sale una
   sola vez aunque la época del eje del dpto. no coincida con las fechas (Hipatia, Hume, Bentham, Mill…) */
function bioList(){
  if (typeof BIOGRAFIAS === "undefined" || !BIOGRAFIAS) return [];
  const ep = b => { const i = ILU_EPOCAS.findIndex(e => e[0] === b); return i < 0 ? ILU_EPOCAS.length : i; };
  return Object.keys(BIOGRAFIAS).map(k => Object.assign({ id: k }, BIOGRAFIAS[k]))
    .sort((a, b) => ep(a.block) - ep(b.block) || (a.born ?? 0) - (b.born ?? 0));
}
function bioPresent(){ const all = bioList(); return ["fil", "hf"].filter(s => all.some(p => (p.subjects || []).includes(s))); }
function bioEpocaName(b){ const e = ILU_EPOCAS.find(x => x[0] === b); return e ? e[1] : ""; }
/* retrato: {f, pie, page?} de biografias_retratos.js (generado por tools/build_ilustres.js) */
function bioRetrato(p){
  return typeof BIOGRAFIAS_RETRATOS !== "undefined" && BIOGRAFIAS_RETRATOS[p.id] || null;
}
function bioInitials(name){
  const w = String(name || "").replace(/\(.*?\)/g, "").split(/\s+/).filter(x => x && /^[A-ZÁÉÍÓÚÑÄÖÜ]/.test(x));
  return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
}
/* (23-10, DUA D0.1) alt = «Retrato de X»; si la imagen no es un retrato (ruinas, una biblioteca…), lo que se ve:
   se mira en el pie original (sin traducir) y se toma la primera parte del pie traducido de BIOGRAFIAS_PIES. */
function bioAlt(p, r){
  const pie = typeof BIOGRAFIAS_PIES !== "undefined" && BIOGRAFIAS_PIES[p.id] || "";
  if (pie && /\(no (se conserva|hay) (ningún )?retrato/.test(r.pie || "")) return pie.split(" · ")[0];
  return "صورة {n}".replace("{n}", p.name);
}
function bioAvatar(p, big){
  const r = bioRetrato(p);
  if (r) return '<img class="bio-img' + (big ? " figimg" : "") + '" loading="lazy" src="' + bioEsc(r.f) + '" alt="' + bioEsc(bioAlt(p, r)) + '">';
  return '<span class="bio-mono" aria-hidden="true">' + bioEsc(bioInitials(p.name)) + '</span>';
}
function bioHi(escaped, q){
  if (!q || q.length < 2) return escaped;
  const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  return escaped.replace(rx, "<mark>$1</mark>");
}

function bioFiltered(){
  const q = bioFold(bioQuery);
  const lista = bioList();
  if (iluOrden === "alfa"){
    const loc = (document.documentElement.lang || "es").slice(0, 2);
    lista.sort((a, b) => bioClave(a).localeCompare(bioClave(b), loc, { sensitivity: "base" }) || (a.born ?? 0) - (b.born ?? 0));
  }
  return lista.filter(p => {
    if (bioSubject !== "all" && !(p.subjects || []).includes(bioSubject)) return false;
    if (!bioEsFil() && bioEpoca !== "all" && p.block !== bioEpoca) return false;
    if (bioEsFil() && bioAmb !== "all" && !bioRamas(p).includes(bioAmb)) return false;
    if (bioPers && !bioCasosPer(p.id).length) return false;
    if (bioImp && ((typeof impNivel === "function" && impNivel("autor", p.id)) || { n: 0 }).n < 4) return false;
    if (q && !bioFold([p.name, p.role, p.idea, (p.obras || []).join(" "), p.bio, p.anecdota].join(" ")).includes(q)) return false;
    return true;
  });
}

function renderIluControls(){
  const box = document.getElementById("biofilter");
  if (!box) return;
  const present = bioPresent();
  if (bioSubject !== "all" && !present.includes(bioSubject)) bioSubject = "all";
  const subjBtns = ["all"].concat(present).map(s =>
    '<button class="fbtn" data-isub="' + s + '" aria-pressed="' + (s === bioSubject) + '">' +
    (s === "all" ? "الكل" : ILU_SUBJECTS[s]) + '</button>').join("");
  const epBtns = [["all", "الكل"]].concat(ILU_EPOCAS).map(e =>
    '<button class="fbtn" data-iep="' + e[0] + '" aria-pressed="' + (e[0] === bioEpoca) + '">' +
    (e[0] === "all" ? "" : '<i class="bio-dot" data-b="' + e[0] + '" aria-hidden="true"></i>') + e[1] + '</button>').join("");
  let ambBtns = "";   // (12-10) 1.º: ámbito en lugar de época
  if (bioEsFil()){
    const vis = bioList().filter(p => (p.subjects || []).includes("fil"));
    const amb = ILU_AMB_ORDEN.filter(r => vis.some(p => bioRamas(p).includes(r)));
    if (bioAmb !== "all" && !amb.includes(bioAmb)) bioAmb = "all";
    ambBtns = ["all"].concat(amb).map(b =>
      '<button class="fbtn" data-iamb="' + b + '" aria-pressed="' + (b === bioAmb) + '">' +
      (b === "all" ? "الكل" : ILU_AMBS[b]) + '</button>').join("");
  }
  box.innerHTML =
    (present.length > 1 ? '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' : '') +
    (ambBtns ? '<div class="fgroup"><span class="flabel">المجال</span>' + ambBtns + '</div>'
             : '<div class="fgroup"><span class="flabel">العصر</span>' + epBtns + '</div>') +
    (bioList().some(p => bioCasosPer(p.id).length)
      ? '<div class="fgroup"><button class="fbtn" data-ipers aria-pressed="' + bioPers + '">' + "مضطهَدون بسبب أفكارهم" + '</button></div>' : '') +
    (!bioEsFil() && typeof impBadge === "function" && typeof IMPRESCINDIBLES !== "undefined"
      ? '<div class="fgroup"><button class="fbtn" data-iimp aria-pressed="' + bioImp + '">' + impBadge("autor", "platon") + ' ' + impT("filtro") + '</button></div>' + impLeyenda() : '') +
    '<div class="fgroup"><span class="flabel">الترتيب</span>' +
      '<button class="fbtn" data-iord="cron" aria-pressed="' + (iluOrden === "cron") + '">حسب التاريخ</button>' +
      '<button class="fbtn" data-iord="alfa" aria-pressed="' + (iluOrden === "alfa") + '">أبجدي</button></div>' +
    '<div class="bio-tools"><input class="bio-search" id="biosearch" type="search" placeholder="ابحثوا عن مفكر أو عمل أو فكرة…" autocomplete="off" aria-label="البحث في السِّيَر"></div>';
  box.querySelectorAll("[data-iamb]").forEach(b => b.addEventListener("click", () => {
    bioAmb = b.dataset.iamb;
    box.querySelectorAll("[data-iamb]").forEach(x => x.setAttribute("aria-pressed", x.dataset.iamb === bioAmb));
    renderBioList();
  }));
  box.querySelectorAll("[data-iimp]").forEach(b => b.addEventListener("click", () => {
    bioImp = !bioImp;
    b.setAttribute("aria-pressed", bioImp);
    renderBioList();
  }));
  box.querySelectorAll("[data-ipers]").forEach(b => b.addEventListener("click", () => {
    bioPers = !bioPers;
    b.setAttribute("aria-pressed", bioPers);
    renderBioList();
  }));
  box.querySelectorAll("[data-iord]").forEach(b => b.addEventListener("click", () => {
    iluOrden = b.dataset.iord;
    try { localStorage.setItem("iluOrden", iluOrden); } catch (e) {}
    box.querySelectorAll("[data-iord]").forEach(x => x.setAttribute("aria-pressed", x.dataset.iord === iluOrden));
    renderBioList();
  }));
  box.querySelectorAll("[data-isub]").forEach(b => b.addEventListener("click", () => {
    bioSubject = b.dataset.isub;
    box.querySelectorAll("[data-isub]").forEach(x => x.setAttribute("aria-pressed", x.dataset.isub === bioSubject));
    renderBioList();
  }));
  box.querySelectorAll("[data-iep]").forEach(b => b.addEventListener("click", () => {
    bioEpoca = b.dataset.iep;
    box.querySelectorAll("[data-iep]").forEach(x => x.setAttribute("aria-pressed", x.dataset.iep === bioEpoca));
    renderBioList();
  }));
  const inp = document.getElementById("biosearch");
  inp.value = bioQuery;
  let t = null;
  inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { bioQuery = inp.value.trim(); renderBioList(); }, 120); });
}

function renderBioList(){
  const box = document.getElementById("biobox"), cnt = document.getElementById("biocount"), fb = document.getElementById("biofilter");
  if (!box) return;
  if (fb) fb.hidden = false;
  // (18-10) perseguidos.js se carga después que este fichero: si al pintar la lista ya hay perseguidos y falta su filtro, se repintan los controles
  if (fb && !fb.querySelector("[data-ipers]") && bioList().some(p => bioCasosPer(p.id).length)) renderIluControls();
  const rows = bioFiltered(), total = bioList().length;
  if (cnt){
    cnt.hidden = false;
    cnt.textContent = rows.length + (rows.length === 1 ? " مفكر" : " مفكرين") + (rows.length !== total ? " (من " + total + ")" : "");
  }
  if (!rows.length){ box.innerHTML = '<p class="bio-empty">لا يوجد مفكرون يطابقون البحث.</p>'; return; }
  const q = bioQuery;
  let html = "", last = null;
  rows.forEach(p => {
    if (iluOrden === "alfa"){   // (18-10) orden alfabético: un encabezado por letra; el punto de color sigue diciendo la época
      const L = bioLetra(p);
      if (L !== last){
        if (last !== null) html += "</div>";
        html += '<h2 class="bio-era bio-letra">' + bioEsc(L) + '</h2><div class="bio-grid">';
        last = L;
      }
    } else if (p.block !== last){
      if (last !== null) html += "</div>";
      html += '<h2 class="bio-era" data-b="' + p.block + '">' + (bioFichaEpoca(p.block)
        ? '<button type="button" class="bio-era-btn" data-epoca="' + p.block + '" title="' + ILU_EPO.ver + '">' + bioEsc(bioEpocaName(p.block)) + ' <span aria-hidden="true">›</span></button>'
        : bioEsc(bioEpocaName(p.block))) + '</h2><div class="bio-grid">';
      last = p.block;
    }
    html += '<button class="bio-card" data-b="' + p.block + '" data-bio="' + bioEsc(p.id) + '">' +
      '<span class="bio-av">' + bioAvatar(p) + '</span>' +
      '<span class="bio-txt"><b>' + bioHi(bioEsc(p.name), q) + '</b>' +
      '<span class="bio-dates">' + bioEsc(p.dates) + (!bioEsFil() && typeof impBadge === "function" ? impBadge("autor", p.id) : '') + '</span>' +
      '<span class="bio-role">' + bioHi(bioEsc(p.role), q) + '</span></span></button>';
  });
  html += "</div>";
  box.innerHTML = html;
  box.querySelectorAll("[data-bio]").forEach(b => b.addEventListener("click", () => loadBiografia(b.dataset.bio)));
  box.querySelectorAll("[data-epoca]").forEach(b => b.addEventListener("click", () => loadBiografia("epoca-" + b.dataset.epoca)));
}

function bioTemaChips(p){
  if (typeof THEORY === "undefined") return "";
  const ks = (p.temas || []).filter(k => THEORY[k]);
  if (!ks.length) return "";
  return '<div class="bio-sec bio-sec-temas"><h3>يرد في الدرس</h3><div class="bio-temas">' +
    ks.map(k => '<button class="bio-tema" data-th="' + bioEsc(k) + '"><span>' + bioEsc(THEORY[k].tema) + '</span>' + bioEsc(THEORY[k].title) + '</button>').join("") +
    '</div></div>';
}

/* (29-09) Sus frases (citas.js, enlazadas por «id»), con el estilo de la sección Frases */
const ILU_FRASES = "أقوال", ILU_CLASE = "في القسم";
function bioCitas(p){
  if (typeof CITAS === "undefined") return "";
  const cs = CITAS.filter(c => c.id === p.id).sort((a, b) => (b.dest ? 1 : 0) - (a.dest ? 1 : 0));
  if (!cs.length) return "";
  return '<div class="bio-sec bio-cits"><h3>' + ILU_FRASES + '</h3>' + cs.map(c =>
    '<figure class="bio-cit' + (c.dest ? ' bio-cit-dest' : '') + '">' + (c.dest ? '<span class="bio-cit-badge">' + ILU_CLASE + '</span>' : '') +
    '<blockquote class="bio-cit-q">' + bioEsc(c.c) + '</blockquote>' +
    (c.o ? '<figcaption class="bio-cit-o">' + bioEsc(c.o) + '</figcaption>' : '') + '</figure>').join("") + '</div>';
}

/* (10-10) «Afines y opuestos» y «Conceptos del glosario», al final de la ficha (idea tomada de las fichas de
   cerebrofilosofico.com, sin contenido nuevo: todo sale de datos ya revisados).
   · Afines y opuestos: sus líneas de Genealogías (GENEALOGIAS.lineas, con quién va antes y después), sus
     oposiciones (GENEALOGIAS.op) y los acuerdos y desacuerdos de sus tesis (GEN_TESIS.enlaces, con el porqué).
   · Conceptos del glosario: los términos con su id en el campo «ilustre» (tools/build_glosario_ilustres.js).
   Solo se enlaza a pensadores que están en esta web (build_subject.js filtra BIOGRAFIAS por materia). */
const ILU_REL = { tit: "الأقربون والخصوم", frente: "في مواجهة", tesis: "أطروحاته في النقاش", acuerdo: "يتفق مع", desacuerdo: "يختلف مع",
  conceptos: "مفاهيم من المسرد", mas: "و{n} أخرى" };
function bioLink(id, cl){
  const q = BIOGRAFIAS[id]; if (!q) return "";
  return '<button type="button" class="bio-rel-a' + (cl ? " " + cl : "") + '" data-go-ilu="' + bioEsc(id) + '">' + bioEsc(q.name) + '</button>';
}
function bioRelaciones(p){
  const out = [];
  if (typeof GENEALOGIAS !== "undefined" && GENEALOGIAS){
    (GENEALOGIAS.lineas || []).forEach(l => {
      const ids = (l.ilustre || []).filter(id => id === p.id || BIOGRAFIAS[id]), i = ids.indexOf(p.id);
      if (i < 0) return;
      const tramo = ids.slice(Math.max(0, i - 1), i + 2).map(id => id === p.id ? '<b>' + bioEsc(p.name) + '</b>' : bioLink(id));
      out.push('<li><span class="bio-rel-linea" style="--l:' + bioEsc(l.color) + '">' + bioEsc(l.name) + '</span> ' + tramo.join(' <span aria-hidden="true">→</span> ') + '</li>');
    });
    const op = (GENEALOGIAS.op || []).map(o => o.ilustre || []).filter(o => o.includes(p.id))
      .map(o => o.find(id => id !== p.id)).filter(id => BIOGRAFIAS[id]);
    if (op.length) out.push('<li><span class="bio-rel-op">' + ILU_REL.frente + '</span> ' + op.map(id => bioLink(id)).join(" · ") + '</li>');
  }
  {   /* (11-10) sus polémicas con coetáneos (polemicasview.js): enlazan a #polemicas/<id> */
    const pol = typeof window.polDe === "function" ? window.polDe(p.id) : "";
    if (pol) out.push(pol);
    /* (11-10) perseguidos y comunidades en que aparece (casosview.js) */
    const cas = typeof window.casosDe === "function" ? window.casosDe(p.id) : "";
    if (cas) out.push(cas);
  }
  let deb = "";
  if (typeof GEN_TESIS !== "undefined" && GEN_TESIS){
    const de = {}; (GEN_TESIS.tesis || []).forEach(t => { de[t.id] = t.ilustre; });
    const rows = (GEN_TESIS.enlaces || []).map(e => {
      const [a, b] = String(e.k).split("|"), otro = de[a] === p.id ? de[b] : de[b] === p.id ? de[a] : null;
      if (!otro || otro === p.id || !BIOGRAFIAS[otro]) return "";
      const ok = e.tipo === "acuerdo";
      return '<li class="' + (ok ? "bio-rel-si" : "bio-rel-no") + '"><span class="bio-rel-tipo">' + (ok ? ILU_REL.acuerdo : ILU_REL.desacuerdo) + '</span> ' +
        bioLink(otro) + (e.por ? '<span class="bio-rel-por">' + bioEsc(e.por) + '</span>' : '') + '</li>';
    }).filter(Boolean);
    if (rows.length) deb = '<h4>' + ILU_REL.tesis + '</h4><ul class="bio-rel-tesis">' + rows.join("") + '</ul>';
  }
  if (!out.length && !deb) return "";
  return '<div class="bio-sec bio-rel"><h3>' + ILU_REL.tit + '</h3>' + (out.length ? '<ul class="bio-rel-list">' + out.join("") + '</ul>' : '') + deb + '</div>';
}
const ILU_CONC_VISIBLES = 12;
function bioConceptos(p){
  if (typeof GLOSARIO === "undefined" || !Array.isArray(GLOSARIO)) return "";
  const ts = GLOSARIO.filter(g => (g.ilustre || []).includes(p.id) && (!p.subjects || p.subjects.includes(g.subject)));
  if (!ts.length) return "";
  const a = g => '<button type="button" class="bio-conc-a" data-glo="' + bioEsc(g.t) + '" data-glo-sub="' + bioEsc(g.subject) + '">' + bioEsc(g.t) + '</button>';
  const vis = ts.slice(0, ILU_CONC_VISIBLES).map(a).join(", "), resto = ts.slice(ILU_CONC_VISIBLES);
  return '<div class="bio-sec bio-conc"><h3>' + ILU_REL.conceptos + '</h3><div class="bio-conc-txt">' + vis +
    (resto.length ? ' <details class="bio-conc-mas"><summary>' + ILU_REL.mas.replace("{n}", resto.length) + '</summary>' + resto.map(a).join(", ") + '</details>' : '') + '</div></div>';
}
/* abrir el glosario filtrado por un término (como el buscador general, search.js) */
function bioAbrirGlosario(t, sub){
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
  ciencia: "العلم والتقنية", arte: "الفن", pensamiento: "الفكر", pensadores: "مفكرو هذه الحقبة", rupturas: "القطائع والتحولات",
  trampa: "فخّ", epoca: "العصر", volver: "→ كل السِّيَر" };
function bioListaPlegada(items, n){
  const resto = items.slice(n);
  return items.slice(0, n).join(", ") + (resto.length ? ' <details class="bio-conc-mas"><summary>' + ILU_REL.mas.replace("{n}", resto.length) + '</summary>' + resto.join(", ") + '</details>' : '');
}
function bioFichaEpoca(b){ return typeof EPOCAS_FICHAS !== "undefined" && EPOCAS_FICHAS && EPOCAS_FICHAS[b] || null; }
/* (10-10, Fase 3) una época de BIOGRAFIAS puede tener varias fichas (Contemporánea: con y con2), con su propio
   «block», «nombre» y rango de «nacidos»; estas funciones resuelven la ficha de un pensador y su título. */
function bioEnFicha(p, k){ const f = bioFichaEpoca(k); return !!f && (f.block || k) === p.block && (!f.nacidos || (p.born >= f.nacidos[0] && p.born <= f.nacidos[1])); }
function bioFichaDe(p){ if (typeof EPOCAS_FICHAS === "undefined") return null; return Object.keys(EPOCAS_FICHAS).find(k => bioEnFicha(p, k)) || (bioFichaEpoca(p.block) ? p.block : null); }
function bioNombreFicha(k){ const f = bioFichaEpoca(k); return f && f.nombre || bioEpocaName(f && f.block || k); }
function loadEpoca(b){
  const box = document.getElementById("biobox"), f = bioFichaEpoca(b);
  if (!box || !f){ renderBioList(); return; }
  const fb = document.getElementById("biofilter"), cnt = document.getElementById("biocount");
  if (fb) fb.hidden = true;
  if (cnt) cnt.hidden = true;
  const orden = Object.keys(EPOCAS_FICHAS), i = orden.indexOf(b), prev = orden[i - 1], next = orden[i + 1], blk = f.block || b;
  const navEp = (k, txt) => k ? '<button class="btn ghost" data-epoca="' + k + '">' + txt.replace("{e}", bioEsc(bioNombreFicha(k))) + '</button>' : '';
  const sec = (k, cls) => f[k] ? '<div class="bio-sec' + (cls ? " " + cls : "") + '"><h3>' + ILU_EPO[k] + '</h3>' + f[k] + '</div>' : '';
  const ps = bioList().filter(p => bioEnFicha(p, b));
  box.innerHTML =
    '<div class="bio-nav"><button class="btn ghost" data-back>' + ILU_EPO.volver + '</button>' +
    '<span class="bio-pn">' + navEp(prev, "‹ {e}") + navEp(next, "{e} ›") + '</span></div>' +
    '<article class="bio-ficha bio-epoca" data-b="' + blk + '">' +
      '<header class="bio-epo-head"><p class="bio-era-tag"><i class="bio-dot" data-b="' + blk + '" aria-hidden="true"></i>' + ILU_EPO.epoca + '</p>' +
        '<h2>' + bioEsc(bioNombreFicha(b)) + '</h2>' + (f.anos ? '<p class="bio-life">' + bioEsc(f.anos) + '</p>' : '') + '</header>' +
      sec("abre") + sec("social") + sec("politico") + sec("ciencia") + sec("arte") + sec("pensamiento") +
      (ps.length ? '<div class="bio-sec bio-conc"><h3>' + ILU_EPO.pensadores + '</h3><div class="bio-conc-txt">' +
        bioListaPlegada(ps.map(p => '<button type="button" class="bio-rel-a" data-go-ilu="' + bioEsc(p.id) + '" title="' + bioEsc(p.dates) + '">' + bioEsc(p.name) + '</button>'), 20) + '</div></div>' : '') +
      sec("rupturas") + sec("trampa", "bio-anec") +
    '</article>';
  box.querySelector("[data-back]").addEventListener("click", () => {
    renderBioList();
    try { history.replaceState(null, "", "#biografias"); } catch (e){}
    window.scrollTo(0, 0);
  });
  box.querySelectorAll("[data-go-ilu]").forEach(x => x.addEventListener("click", () => loadBiografia(x.dataset.goIlu)));
  box.querySelectorAll("[data-epoca]").forEach(x => x.addEventListener("click", () => loadEpoca(x.dataset.epoca)));
  try { history.replaceState(null, "", "#biografias/epoca-" + b); } catch (e){}
  window.scrollTo(0, 0);
}

/* Ficha de un pensador. Sin argumento (o id desconocido) vuelve al listado. */
/* (01-10) «Su vida en fechas»: una sola línea vertical, de arriba abajo, con lo esencial (nace, los hechos del campo
   «vida» {a, b?, t} y muere). No toca la biografía: va detrás, como una sección más de la ficha. */
const ILU_VIDA = { tit: "حياته بالتواريخ", nace: "وُلد", muere: "توفي", ac: "{n} ق.م" };
function bioAno(y){ return y < 0 ? ILU_VIDA.ac.replace("{n}", -y) : String(y); }
function bioVida(p){
  const v = (p.vida || []).filter(e => !e.ctx).slice().sort((x, y) => x.a - y.a);
  if (!v.length || p.born == null) return "";
  const c = /^c\./.test(p.dates || "") ? "c. " : "";
  const fecha = e => e.b == null ? bioAno(e.a) : e.a < 0 && e.b < 0 ? ILU_VIDA.ac.replace("{n}", -e.a + "–" + -e.b) : bioAno(e.a) + "–" + bioAno(e.b);
  const fila = (f, t, cl) => '<li' + (cl ? ' class="' + cl + '"' : '') + '><span class="vida-a">' + bioEsc(f) + '</span><span class="vida-t">' + bioEsc(t) + '</span></li>';
  return '<div class="bio-sec bio-vida"><h3>' + ILU_VIDA.tit + '</h3><ol class="vida-linea">' +
    fila(c + bioAno(p.born), ILU_VIDA.nace + (p.place ? " · " + p.place : ""), "vida-extremo") +
    v.map(e => fila(fecha(e), e.t)).join("") +
    (p.died != null ? fila(bioAno(p.died), ILU_VIDA.muere, "vida-extremo") : "") + '</ol></div>';
}

function loadBiografia(id){
  const box = document.getElementById("biobox");
  if (!box) return;
  if (/^epoca-/.test(id || "") && bioFichaEpoca(id.slice(6))){ loadEpoca(id.slice(6)); return; }
  const all = bioList(), p = all.find(x => x.id === id);
  if (!p){ renderBioList(); return; }
  const fb = document.getElementById("biofilter"), cnt = document.getElementById("biocount");
  if (fb) fb.hidden = true;
  if (cnt) cnt.hidden = true;
  const seq = bioFiltered().some(x => x.id === id) ? bioFiltered() : all;
  const i = seq.findIndex(x => x.id === id), prev = seq[i - 1], next = seq[i + 1];
  const r = bioRetrato(p);
  box.innerHTML =
    '<div class="bio-nav"><button class="btn ghost" data-back>→ كل السِّيَر</button>' +
    '<span class="bio-pn">' +
      (prev ? '<button class="btn ghost" data-go-ilu="' + bioEsc(prev.id) + '" title="' + bioEsc(prev.name) + '">‹ السابق</button>' : '') +
      (next ? '<button class="btn ghost" data-go-ilu="' + bioEsc(next.id) + '" title="' + bioEsc(next.name) + '">التالي ›</button>' : '') +
    '</span></div>' +
    '<article class="bio-ficha" data-b="' + p.block + '">' +
      '<header class="bio-head">' +
        '<figure class="bio-portrait">' + bioAvatar(p, true) +
          (r ? '<figcaption>' + bioEsc((typeof BIOGRAFIAS_PIES !== "undefined" && BIOGRAFIAS_PIES[p.id]) || r.pie) + ' · ' + (r.page ? '<a href="' + bioEsc(r.page) + '" target="_blank" rel="noopener">' + (/wikipedia\.org/.test(r.page) ? "Wikipedia" : "Wikimedia Commons") + '</a>' : 'Wikimedia Commons') + '</figcaption>' : '') +
        '</figure>' +
        '<div class="bio-id">' +
          '<p class="bio-era-tag"><i class="bio-dot" data-b="' + p.block + '" aria-hidden="true"></i>' + (bioFichaDe(p)
            ? '<button type="button" class="bio-era-link" data-epoca="' + bioFichaDe(p) + '" title="' + ILU_EPO.ver + '">' + bioEsc(bioEpocaName(p.block)) + '</button>'
            : bioEsc(bioEpocaName(p.block))) + ' · ' + bioEsc(p.role) + '</p>' +
          '<h2>' + bioEsc(p.name) + '</h2>' +
          '<p class="bio-life">' + bioEsc(p.dates) + (p.place ? ' · ' + bioEsc(p.place) : '') + '</p>' +
          (!bioEsFil() && typeof impBadge === "function" && impNivel("autor", p.id) ? '<div class="imp-ficha">' + impBadge("autor", p.id, "completa") + impMotivo("autor", p.id) + '</div>' : '') +
          bioCasosPer(p.id).map(c => '<p class="bio-pers-tag"><button type="button" class="bio-rel-a" data-cas-v="perseguidos" data-cas="' + bioEsc(c.id) + '">' + "مضطهَدون بسبب أفكارهم" + ' ›</button></p>').join("") +
          (p.idea ? '<p class="bio-idea">' + bioEsc(p.idea) + '</p>' : '') +
        '</div>' +
      '</header>' +
      '<div class="bio-bio">' + (p.bio || "") + '</div>' +
      bioVida(p) +
      bioCitas(p) +
      (p.anecdota ? '<div class="bio-sec bio-anec"><h3><span>طُرفة</span>' + (p.tradicion ? ' <span class="bio-trad">حسب التقليد</span>' : '') + '</h3>' +
        p.anecdota + (p.fuente ? '<p class="bio-fuente"><span>المصدر</span>: ' + bioEsc(p.fuente) + '</p>' : '') + '</div>' : '') +
      ((p.obras || []).length ? '<div class="bio-sec"><h3>الأعمال الرئيسية</h3><ul class="bio-obras">' + p.obras.map(o => '<li>' + bioEsc(o) + '</li>').join("") + '</ul></div>' : '') +
      bioVideosEu(p) +
      bioTemaChips(p) +
      bioRelaciones(p) +
      bioConceptos(p) +
    '</article>';
  box.querySelector("[data-back]").addEventListener("click", () => {
    renderBioList();
    try { history.replaceState(null, "", "#biografias"); } catch (e){}
    window.scrollTo(0, 0);
  });
  box.querySelectorAll("[data-go-ilu]").forEach(b => b.addEventListener("click", () => loadBiografia(b.dataset.goIlu)));
  box.querySelectorAll("[data-glo]").forEach(b => b.addEventListener("click", () => bioAbrirGlosario(b.dataset.glo, b.dataset.gloSub)));
  box.querySelectorAll("[data-epoca]").forEach(b => b.addEventListener("click", () => loadBiografia("epoca-" + b.dataset.epoca)));
  box.querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => {
    (window.show || show)("teoria");
    if (typeof window.loadTheory === "function") window.loadTheory(b.dataset.th);
  }));
  const img = box.querySelector(".bio-portrait img");
  if (img) img.addEventListener("click", () => { if (typeof openLightbox === "function") openLightbox(img.src, img.alt); });
  window.scrollTo(0, 0);
}

/* (18-10) Vídeos en euskera de Ikusgela sobre la persona (videos_eu.js, «ilustre»): enlaces externos, como «Obras principales»;
   en la web en euskera, con el título original del vídeo. */
function bioVideosEu(p){
  const V = typeof VIDEOS_EU !== "undefined" && Array.isArray(VIDEOS_EU) ? VIDEOS_EU.filter(v => (v.ilustre || []).includes(p.id)) : [];
  if (!V.length) return "";
  const eu = (document.documentElement.lang || "").slice(0, 2) === "eu";
  return '<div class="bio-sec"><h3>فيديو بالباسكية</h3><ul class="bio-obras">' + V.map(v => '<li><a href="https://www.youtube.com/watch?v=' + bioEsc(v.id) +
    '" target="_blank" rel="noopener" hreflang="eu">' + bioEsc(eu ? v.eu_titulo : v.es) + '</a> · Ikusgela, ' + bioEsc(v.dur) + (eu ? '' : ' · <span lang="eu">«' + bioEsc(v.eu_titulo) + '»</span>') +
    ' · <a href="media/ikusgela/' + bioEsc(v.id) + '.html" target="_blank" rel="noopener" hreflang="eu" title="نص الفيديو: الترجمة المكتوبة من Ikusgela">النص المكتوب</a></li>').join("") + '</ul></div>';
}

/* En la teoría: al final de cada unidad, una tira con los ilustres que aparecen en ella (enlaza a su
   ficha). Envuelve loadTheory() igual que retratosview.js, sin tocar theory.js ni theoryview.js. */
function bioInjectTheory(){
  const body = document.getElementById("theorybody");
  if (!body) return;
  const old = body.querySelector(".bio-strip"); if (old) old.remove();
  const k = typeof theoryKey !== "undefined" ? theoryKey : null;   // unidad abierta (theoryview.js)
  const ps = k ? bioList().filter(p => (p.temas || []).includes(k)) : [];
  if (!ps.length) return;
  const strip = document.createElement("aside");
  strip.className = "bio-strip";
  strip.innerHTML = '<h3>سِيَر هذا الموضوع</h3><div class="bio-strip-list">' +
    ps.map(p => '<button data-bio="' + bioEsc(p.id) + '" data-b="' + p.block + '">' + bioEsc(p.name) + '<span>' + bioEsc(p.dates) + '</span></button>').join("") + '</div>';
  body.appendChild(strip);
  strip.querySelectorAll("[data-bio]").forEach(b => b.addEventListener("click", () => {
    (window.show || show)("biografias");
    loadBiografia(b.dataset.bio);
  }));
}
if (typeof loadTheory === "function"){
  const origTheory = loadTheory;
  loadTheory = function(k){ const out = origTheory.apply(this, arguments); try { bioInjectTheory(); } catch (e){} return out; };
}

/* «#biografias» sin argumento (atrás del navegador, enlace) con una ficha abierta → vuelve al listado */
window.addEventListener("hashchange", () => {
  if (location.hash === "#biografias" && document.querySelector("#biobox .bio-ficha")) renderBioList();
});

/* (12-10) Vista «Épocas» (grupo «Historia» del menú): índice de las fichas de época, cada una con el dibujo de su
   cosmos (el primer diagrama de su campo «ciencia») y el enlace a la ficha completa (#biografias/epoca-<k>). */
function renderEpocas(){
  const box = document.getElementById("epocasbox");
  if (!box || typeof EPOCAS_FICHAS === "undefined") return;
  box.innerHTML = Object.keys(EPOCAS_FICHAS).map(k => {
    const f = EPOCAS_FICHAS[k], blk = f.block || k, m = (f.ciencia || "").match(/<div class="figwrap diag">[\s\S]*?<\/figure><\/div>/);
    return '<article class="epo-card" data-b="' + blk + '">' +
      '<h2><i class="bio-dot" data-b="' + blk + '" aria-hidden="true"></i><a href="#biografias/epoca-' + k + '">' + bioEsc(bioNombreFicha(k)) + '</a></h2>' +
      (f.anos ? '<p class="bio-life">' + bioEsc(f.anos) + '</p>' : '') + (m ? m[0] : '') +
      '<p class="epo-ir"><a class="btn ghost" href="#biografias/epoca-' + k + '">' + ILU_EPO.ver + ' <span class="epo-arr" aria-hidden="true">›</span></a></p></article>';
  }).join("");
}
function loadEpocas(){ renderEpocas(); }

renderIluControls();
renderBioList();
renderEpocas();
try { bioInjectTheory(); } catch (e){}   // la primera unidad ya está pintada al cargar theoryview.js
