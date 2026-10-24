"use strict";
/* ===== Vista Diccionario ===== depende de: diccionario.js =====
   Lista de referencia buscable y filtrable: Historia de la Filosofía (libro MDLTFH,
   bloque A/B/C) + Filosofía 1.º Bach (temas 1-3, 5, 7 y taller). Filtra por materia,
   bloque (solo HF) y área temática; busca en término + definición sin distinguir
   mayúsculas ni acentos. Estilos propios inyectados una vez (usan las variables de
   tema de styles.css, así que respetan claro/oscuro). */

const GLO_EPOCAS = { ant: "القديمة", med: "الوسيطة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة" };
/* (12-10) época de un término de HF por su tema (Itinerario.gloTema, vía la unidad del libro); fil/ipc no tienen época */
function gloEpoca(g){
  if (g.subject !== "hf") return null;
  if (window.Itinerario && window.Itinerario.gloTema && window.Epocas && window.Epocas.epocaDeTema){
    var n = window.Itinerario.gloTema(g);
    if (typeof n === "number") return window.Epocas.epocaDeTema(n);
  }
  return ({ A: "ant", B: "med", C: "con" }[g.bloque] || null);   /* respaldo si Itinerario aún no ha cargado */
}
const GLO_SUBJECTS = { hf: "تاريخ الفلسفة", fil: "الفلسفة 1", ipc: "التفكير النقدي" };
/* materias con términos en ESTE diccionario (cada web de alumnado trae solo la suya) */
function gloPresent(){ return ["hf", "fil", "ipc"].filter(s => DICCIONARIO.some(g => g.subject === s)); }
let gloSubject = "hf", gloBloque = "ant", gloArea = "all", gloQuery = "";  /* materia y época concretas por defecto, nunca «Todos» */

const GLO_CSS = `
#diccionario #dicgrids{margin:6px 0 14px}
#diccionario .dicgrid-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}
#diccionario .dicgrid-stage{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;overflow:hidden}
#diccionario .dicgrid-head{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:0 0 10px;margin:0 0 12px}
#diccionario .dicgrid-head h3{margin:0;font-family:var(--serif);font-size:1.3rem;color:var(--ink)}
#diccionario .esq2-q{font-family:var(--serif);font-size:1.1rem;font-style:italic;color:var(--muted);margin:0}
#diccionario .esq2-hint{color:var(--muted);font-size:.85rem;margin:8px 0 0;text-align:center}
#diccionario .esq2-xtog{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:.9rem;color:var(--muted);cursor:pointer;white-space:nowrap}
#diccionario .esq2-xtog input{width:18px;height:18px}
#diccionario .dictools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0 4px}
#diccionario .dicsearch{flex:1;min-width:220px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;font:inherit;background:var(--surface);color:var(--ink)}
#diccionario .dicsearch:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
#diccionario .dicarea{padding:10px 12px;border:1px solid var(--line);border-radius:12px;font:inherit;background:var(--surface);color:var(--ink);max-width:100%}
#diccionario .diccount{color:var(--muted);font-size:13px;margin:10px 0 16px}
#diccionario .diclist{display:grid;gap:10px}
#diccionario .dicitem{border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:var(--radius);padding:13px 16px 14px;background:var(--surface);box-shadow:var(--shadow)}
#diccionario .dicitem .top{display:flex;flex-wrap:wrap;justify-content:space-between;column-gap:12px;align-items:baseline}
#diccionario .dicitem h4{margin:0 0 5px;font-size:17px;font-family:var(--serif);color:var(--ink)}
#diccionario .dicitem .tag{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:600;white-space:nowrap}
#diccionario .dicitem p{margin:0;font-size:14.5px;line-height:1.55;color:var(--ink)}
#diccionario .dicitem .src{color:var(--muted);font-size:12px;margin-top:7px}
#diccionario .dicitem .dic-bio{font-size:12.5px;margin-top:5px;color:var(--muted)}
#diccionario .dicitem .dic-bio b{font-weight:600;margin-inline-end:3px}
#diccionario .dicitem .dic-bio button{background:none;border:0;padding:0;font:inherit;color:var(--accent);cursor:pointer;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}
#diccionario .dicitem .ety{color:var(--muted);font-size:13px;line-height:1.5;margin-top:8px;padding-top:7px;border-top:1px dashed var(--line-soft)}
#diccionario .dicitem .ety[hidden]{display:none}
#diccionario .dicitem .ety b{font-weight:600;color:var(--ink)}
#diccionario .dicitem .ety i{color:var(--ink)}
#diccionario .dic-root{display:inline-flex;align-items:center;justify-content:center;width:1.55em;height:1.55em;margin-left:.4em;vertical-align:.12em;padding:0;border:1px solid var(--line);border-radius:50%;background:var(--surface-2);color:var(--muted);font:600 13px var(--serif);line-height:1;cursor:pointer}
#diccionario .dic-root:hover,#diccionario .dic-root[aria-expanded="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
#diccionario mark{background:var(--accent);color:var(--on-accent);padding:0 2px;border-radius:3px}
#diccionario .dicempty{color:var(--muted);padding:24px 2px}
#diccionario .dicitem.dic-hit{outline:2px solid var(--accent);outline-offset:2px}
`;

function gloFold(s){ return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function gloEsc(s){ return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function gloBold(s){ return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
/* (08-10) raíz de la palabra (campo `et`): plegada tras el botón λ (de lógos, «palabra») junto al término; solo lo llevan los términos
   con raíz. Dentro, la palabra en su alfabeto y, entre paréntesis, transliterada (*así*, en cursiva). Se abre sola
   cuando lo buscado solo aparece en la raíz. */
function gloIt(s){ return s.replace(/\*([^*]+)\*/g, "<i>$1</i>"); }
const GLO_ETY = "الجذر:", GLO_ETY_BTN = "اعرفوا من أين جاءت الكلمة";
function gloHi(escaped, q){
  if (!q || q.length < 2) return escaped;
  const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  return escaped.replace(rx, "<mark>$1</mark>");
}

let _gloReady = false;
function gloInject(){
  if (_gloReady) return;
  const st = document.createElement("style"); st.textContent = GLO_CSS;
  document.head.appendChild(st); _gloReady = true;
}

/* Términos visibles para la materia elegida (para el desplegable de áreas). */
let gloImp = false;   // (19-10) filtro «solo imprescindibles y esenciales» (niveles 5 y 4, en g.imp; imprescindibles.js)
function gloTermsForSubject(){
  return DICCIONARIO.filter(g => gloSubject === "all" || g.subject === gloSubject);
}

function renderGloControls(){
  const box = document.getElementById("dicfilter");
  if (!box) return;
  gloInject();
  const present = gloPresent();
  if (gloSubject !== "all" && !present.includes(gloSubject) && present.length) gloSubject = present[0];
  const areas = Array.from(new Set(gloTermsForSubject().map(g => g.area).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  const subjBtns = ["all"].concat(present).map(s =>
    '<button class="fbtn" data-sub="' + s + '" aria-pressed="' + (s === gloSubject) + '">' +
    (s === "all" ? "الكل" : GLO_SUBJECTS[s]) + '</button>').join("");
  const blkBtns = ["all", "ant", "med", "mod", "ilu", "con"].map(b =>
    '<button class="fbtn" data-era="' + b + '" aria-pressed="' + (b === gloBloque) + '">' +
    (b === "all" ? "الكل" : GLO_EPOCAS[b]) + '</button>').join("");
  const areaOpts = ['<option value="all">كل المجالات</option>']
    .concat(areas.map(a => '<option value="' + a + '">' + a + '</option>')).join("");
  box.innerHTML =
    (present.length > 1 ? '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' : '') +
    (gloSubject === "hf" || (gloSubject === "all" && present.includes("hf"))
      ? '<div class="fgroup"><span class="flabel">العصر</span>' + blkBtns + '</div>'
      : '') +
    (typeof impBadge === "function" && typeof IMPRESCINDIBLES !== "undefined" && present.includes("hf") && gloSubject !== "fil" && gloSubject !== "ipc"
      ? '<div class="fgroup"><button class="fbtn" data-gimp aria-pressed="' + gloImp + '">' + impT("filtro") + '</button></div>' + impLeyenda() : '') +
    '<div class="dictools">' +
      '<input class="dicsearch" id="dicsearch" type="search" placeholder="ابحثوا عن مصطلح أو تعريف…" autocomplete="off" aria-label="البحث في القاموس">' +
      '<select class="dicarea" id="dicarea" aria-label="تصفية حسب المجال">' + areaOpts + '</select>' +
    '</div>';

  box.querySelectorAll("[data-sub]").forEach(b => b.addEventListener("click", () => {
    gloSubject = b.dataset.sub;
    if (gloSubject !== "hf") gloArea = "all";
    renderGloControls(); renderGloList();
  }));
  box.querySelectorAll("[data-gimp]").forEach(b => b.addEventListener("click", () => {
    gloImp = !gloImp;
    b.setAttribute("aria-pressed", gloImp);
    renderGloList();
  }));
  box.querySelectorAll("[data-era]").forEach(b => b.addEventListener("click", () => {
    gloBloque = b.dataset.era;
    box.querySelectorAll("[data-era]").forEach(x => x.setAttribute("aria-pressed", x.dataset.era === gloBloque));
    renderGloList();
  }));
  const sel = document.getElementById("dicarea");
  sel.value = gloArea;
  sel.addEventListener("change", () => { gloArea = sel.value; renderGloList(); });
  const inp = document.getElementById("dicsearch");
  inp.value = gloQuery;
  let t = null;
  inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { gloQuery = inp.value.trim(); renderGloList(); }, 120); });
}

/* (08-10) Cuadrículas de conceptos (js/diccionario_grids.js + js/esq_grid.js): un botón por tema que tenga su árbol,
   según la materia y el bloque elegidos; se dibuja encima de la lista con el estilo de la Cuadrícula de Esquemas. */
let gloGrid = null;
function gloGridsVisibles(){
  if (typeof DICCIONARIO_GRIDS === "undefined") return [];   /* EsqGrid (esq_grid.js) se carga después: se comprueba al dibujar */
  const present = gloPresent();
  return Object.entries(DICCIONARIO_GRIDS).filter(([k, g]) => {
    if (!present.includes(g.subject) || (gloSubject !== "all" && g.subject !== gloSubject)) return false;
    if (g.subject === "hf" && gloBloque !== "all"){
      const e = DICCIONARIO.find(x => x.tema === g.tema && x.bloque); if (e && e.bloque !== gloBloque) return false;
    }
    return true;
  });
}
function renderGloGrids(){
  const list = document.getElementById("diclist"); if (!list) return;
  let box = document.getElementById("dicgrids");
  if (!box){ box = document.createElement("div"); box.id = "dicgrids"; list.parentNode.insertBefore(box, list); }
  const vis = gloGridsVisibles();
  if (gloGrid && !vis.some(([k]) => k === gloGrid)) gloGrid = null;
  if (!vis.length){ box.innerHTML = ""; return; }
  box.innerHTML = '<div class="dicgrid-bar"><span class="flabel">شبكات المفاهيم</span>' +
    vis.map(([k, g]) => '<button type="button" class="fbtn" data-gg="' + k + '" aria-pressed="' + (k === gloGrid) + '">' + gloEsc(g.tema) + "</button>").join("") + "</div>" +
    (gloGrid ? '<div class="dicgrid-stage"><div class="dicgrid-head"><h3>' + gloEsc(DICCIONARIO_GRIDS[gloGrid].tema) + '</h3><button type="button" class="fbtn" data-gg="">إغلاق</button></div><div id="dicgridbox"></div></div>' : "");
  box.querySelectorAll("[data-gg]").forEach(b => b.addEventListener("click", () => {
    gloGrid = b.dataset.gg && b.dataset.gg !== gloGrid ? b.dataset.gg : null; renderGloGrids();
    if (gloGrid) document.getElementById("dicgrids").scrollIntoView({ block: "start", behavior: A11y.motion() });
  }));
  if (gloGrid && typeof EsqGrid !== "undefined"){ const g = DICCIONARIO_GRIDS[gloGrid]; EsqGrid.render({ subject: g.subject, v2: g.v2 }, document.getElementById("dicgridbox")); }
}

/* (10-10) Al pie de cada término, los pensadores que nombra (campo «biografia», tools/build_diccionario_biografias.js),
   con enlace a su ficha de Biografías; solo los que están en esta web. */
const GLO_ILU = "مفكرون", GLO_EPOCA = "العصر";
function dicBiografias(g){
  if (typeof BIOGRAFIAS === "undefined" || !BIOGRAFIAS) return "";
  const ids = (g.biografia || []).filter(id => BIOGRAFIAS[id]);
  /* (11-10) la ficha de época del tema de HF del término (epocas_fichas.js), si está en esta web */
  const It = window.Itinerario, n = g.subject === "hf" && It && It.gloTema && It.epocaFicha ? It.gloTema(g) : null;
  const ep = typeof n === "number" && typeof bioNombreFicha === "function" && document.getElementById("biografias") ? It.epocaFicha("hf", n) : null;
  return (ids.length ? '<div class="dic-bio"><b>' + GLO_ILU + '</b> ' + ids.map(id => '<button type="button" data-dic-biografia="' + gloEsc(id) + '">' + gloEsc(BIOGRAFIAS[id].name) + '</button>').join(" · ") + '</div>' : "") +
    (ep ? '<div class="dic-bio"><b>' + GLO_EPOCA + '</b> <button type="button" data-dic-biografia="epoca-' + ep + '">' + gloEsc(bioNombreFicha(ep)) + '</button></div>' : "");
}

function renderGloList(){
  renderGloGrids();
  const list = document.getElementById("diclist");
  const cnt = document.getElementById("diccount");
  if (!list) return;
  const q = gloFold(gloQuery), present = gloPresent();
  const rows = DICCIONARIO.filter(g => {
    if (gloSubject !== "all" && g.subject !== gloSubject) return false;
    if ((gloSubject === "hf" || gloSubject === "all") && present.includes("hf") && gloBloque !== "all" && g.bloque && gloEpoca(g) !== gloBloque) return false;
    if (gloArea !== "all" && g.area !== gloArea) return false;
    if (gloImp && !(g.imp >= 4)) return false;
    if (q && !gloFold(g.t + " " + g.def + " " + g.area + " " + (g.et || "").replace(/\*/g, "")).includes(q)) return false;
    return true;
  });
  if (cnt) cnt.textContent = rows.length + (rows.length === 1 ? " مصطلح" : " مصطلحات") +
    (rows.length !== DICCIONARIO.length ? " (من " + DICCIONARIO.length + ")" : "");
  if (!rows.length){ list.innerHTML = '<p class="dicempty">لا توجد مصطلحات تطابق البحث.</p>'; return; }
  list.innerHTML = rows.map(g => {
    const term = gloHi(gloEsc(g.t), gloQuery);
    const def = gloHi(gloIt(gloBold(gloEsc(g.def))), gloQuery);   // (20-10) también *cursiva* (antes se veían los asteriscos)
    const tag = (g.area ? g.area : "") + (g.bloque ? " · " + (GLO_EPOCAS[gloEpoca(g)] || g.bloque) : "");
    const abre = g.et && q && !gloFold(g.t + " " + g.def + " " + g.area).includes(q);   // lo buscado está solo en la raíz
    const ety = g.et ? '<div class="ety"' + (abre ? "" : " hidden") + "><b>" + GLO_ETY + "</b> " + gloIt(gloHi(gloEsc(g.et), gloQuery)) + "</div>" : "";
    const btn = g.et ? '<button type="button" class="dic-root" aria-expanded="' + !!abre + '" aria-label="' + GLO_ETY_BTN + '" title="' + GLO_ETY_BTN + '">λ</button>' : "";
    const src = g.tema ? '<div class="src">' + gloEsc(g.tema) + (g.unidad ? " · " + g.unidad : "") + '</div>' : "";
    const ilu = dicBiografias(g);
    const ep = g.subject === "hf" && { A: "ant", B: "medmod", C: "con" }[g.bloque];   // (30-09) color del bloque de HF (styles.css)
    return '<article class="dicitem"' + (g.id ? ' data-gid="' + g.id + '"' : '') + (ep ? ' data-ep="' + ep + '"' : '') + '><div class="top"><h4>' + term + btn + (g.subject === "hf" && typeof impBadge === "function" && typeof IMPRESCINDIBLES !== "undefined" ? ' ' + impBadge("glo", g) : '') + '</h4><span class="tag">' + gloEsc(tag) + '</span></div><p>' + def + '</p>' + ety + src + ilu + '</article>';
  }).join("");
  if (window.langFragGrc) window.langFragGrc(list);   // DUA D0.6: el griego de las etimologías y definiciones se marca con lang="grc"
}

/* el botón √ abre y cierra la raíz de su tarjeta (delegado: la lista se repinta en cada filtro) */
(() => {
  const list = document.getElementById("diclist");
  if (list) list.addEventListener("click", e => {
    const il = e.target.closest("[data-dic-biografia]");
    if (il){ (window.show || show)("biografias"); if (typeof loadBiografia === "function") loadBiografia(il.dataset.dicBiografia); return; }
    const b = e.target.closest(".dic-root"); if (!b) return;
    const ety = b.closest(".dicitem").querySelector(".ety"); if (!ety) return;
    ety.hidden = !ety.hidden; b.setAttribute("aria-expanded", String(!ety.hidden));
  });
})();

/* (20-10) Enlace profundo #diccionario/<id> (id neutro de cada término, tools/diccionario_ids.js): no depende de la lengua.
   Pone los filtros en la materia y la época del término, lo enmarca y lo trae a la vista. Lo usan las Pistas. */
function gloPorId(id){ return typeof DICCIONARIO !== "undefined" ? DICCIONARIO.find(g => g.id === id) || null : null; }
function loadDiccionario(id){
  const g = gloPorId(id);
  if (!g){ renderGloControls(); renderGloList(); return; }
  gloSubject = g.subject; gloBloque = gloEpoca(g) || "all"; gloArea = "all"; gloQuery = ""; gloImp = false;
  renderGloControls(); renderGloList();
  const el = document.querySelector('#diclist [data-gid="' + id + '"]'); if (!el) return;
  el.classList.add("dic-hit");
  setTimeout(() => el.scrollIntoView({ block: "center", behavior: A11y.motion() }), 60);
}

renderGloControls();
renderGloList();
