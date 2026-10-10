"use strict";
/* ===== Vista Glosario ===== depende de: glosario.js =====
   Lista de referencia buscable y filtrable: Historia de la Filosofía (libro MDLTFH,
   bloque A/B/C) + Filosofía 1.º Bach (temas 1-3, 5, 7 y taller). Filtra por materia,
   bloque (solo HF) y área temática; busca en término + definición sin distinguir
   mayúsculas ni acentos. Estilos propios inyectados una vez (usan las variables de
   tema de styles.css, así que respetan claro/oscuro). */

const GLO_BLOCKS = { A: "القديمة", B: "الوسيطة والحديثة", C: "المعاصرة" };
const GLO_SUBJECTS = { hf: "تاريخ الفلسفة", fil: "الفلسفة 1", ipc: "التفكير النقدي" };
/* materias con términos en ESTE glosario (cada web de alumnado trae solo la suya) */
function gloPresent(){ return ["hf", "fil", "ipc"].filter(s => GLOSARIO.some(g => g.subject === s)); }
let gloSubject = "hf", gloBloque = "A", gloArea = "all", gloQuery = "";  /* materia y bloque concretos por defecto, nunca «Todos» */

const GLO_CSS = `
#glosario #glogrids{margin:6px 0 14px}
#glosario .glogrid-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}
#glosario .glogrid-stage{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;overflow:hidden}
#glosario .glogrid-head{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:0 0 10px;margin:0 0 12px}
#glosario .glogrid-head h3{margin:0;font-family:var(--serif);font-size:1.3rem;color:var(--ink)}
#glosario .esq2-q{font-family:var(--serif);font-size:1.1rem;font-style:italic;color:var(--muted);margin:0}
#glosario .esq2-hint{color:var(--muted);font-size:.85rem;margin:8px 0 0;text-align:center}
#glosario .esq2-xtog{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:.9rem;color:var(--muted);cursor:pointer;white-space:nowrap}
#glosario .esq2-xtog input{width:18px;height:18px}
#glosario .glotools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0 4px}
#glosario .glosearch{flex:1;min-width:220px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;font:inherit;background:var(--surface);color:var(--ink)}
#glosario .glosearch:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
#glosario .gloarea{padding:10px 12px;border:1px solid var(--line);border-radius:12px;font:inherit;background:var(--surface);color:var(--ink);max-width:100%}
#glosario .glocount{color:var(--muted);font-size:13px;margin:10px 0 16px}
#glosario .glolist{display:grid;gap:10px}
#glosario .gloitem{border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:var(--radius);padding:13px 16px 14px;background:var(--surface);box-shadow:var(--shadow)}
#glosario .gloitem .top{display:flex;flex-wrap:wrap;justify-content:space-between;column-gap:12px;align-items:baseline}
#glosario .gloitem h4{margin:0 0 5px;font-size:17px;font-family:var(--serif);color:var(--ink)}
#glosario .gloitem .tag{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:600;white-space:nowrap}
#glosario .gloitem p{margin:0;font-size:14.5px;line-height:1.55;color:var(--ink)}
#glosario .gloitem .src{color:var(--muted);font-size:12px;margin-top:7px}
#glosario .gloitem .glo-ilu{font-size:12.5px;margin-top:5px;color:var(--muted)}
#glosario .gloitem .glo-ilu b{font-weight:600;margin-inline-end:3px}
#glosario .gloitem .glo-ilu button{background:none;border:0;padding:0;font:inherit;color:var(--accent);cursor:pointer;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}
#glosario .gloitem .ety{color:var(--muted);font-size:13px;line-height:1.5;margin-top:8px;padding-top:7px;border-top:1px dashed var(--line-soft)}
#glosario .gloitem .ety[hidden]{display:none}
#glosario .gloitem .ety b{font-weight:600;color:var(--ink)}
#glosario .gloitem .ety i{color:var(--ink)}
#glosario .glo-root{display:inline-flex;align-items:center;justify-content:center;width:1.55em;height:1.55em;margin-left:.4em;vertical-align:.12em;padding:0;border:1px solid var(--line);border-radius:50%;background:var(--surface-2);color:var(--muted);font:600 13px var(--serif);line-height:1;cursor:pointer}
#glosario .glo-root:hover,#glosario .glo-root[aria-expanded="true"]{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
#glosario mark{background:var(--accent);color:var(--on-accent);padding:0 2px;border-radius:3px}
#glosario .gloempty{color:var(--muted);padding:24px 2px}
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
function gloTermsForSubject(){
  return GLOSARIO.filter(g => gloSubject === "all" || g.subject === gloSubject);
}

function renderGloControls(){
  const box = document.getElementById("glofilter");
  if (!box) return;
  gloInject();
  const present = gloPresent();
  if (gloSubject !== "all" && !present.includes(gloSubject) && present.length) gloSubject = present[0];
  const areas = Array.from(new Set(gloTermsForSubject().map(g => g.area).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  const subjBtns = ["all"].concat(present).map(s =>
    '<button class="fbtn" data-sub="' + s + '" aria-pressed="' + (s === gloSubject) + '">' +
    (s === "all" ? "الكل" : GLO_SUBJECTS[s]) + '</button>').join("");
  const blkBtns = ["all", "A", "B", "C"].map(b =>
    '<button class="fbtn" data-blk="' + b + '" aria-pressed="' + (b === gloBloque) + '">' +
    (b === "all" ? "الكل" : GLO_BLOCKS[b]) + '</button>').join("");
  const areaOpts = ['<option value="all">كل المجالات</option>']
    .concat(areas.map(a => '<option value="' + a + '">' + a + '</option>')).join("");
  box.innerHTML =
    (present.length > 1 ? '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' : '') +
    (gloSubject === "hf" || (gloSubject === "all" && present.includes("hf"))
      ? '<div class="fgroup"><span class="flabel">المحور</span>' + blkBtns + '</div>'
      : '') +
    '<div class="glotools">' +
      '<input class="glosearch" id="glosearch" type="search" placeholder="ابحثوا عن مصطلح أو تعريف…" autocomplete="off" aria-label="البحث في المسرد">' +
      '<select class="gloarea" id="gloarea" aria-label="Filtrar por área">' + areaOpts + '</select>' +
    '</div>';

  box.querySelectorAll("[data-sub]").forEach(b => b.addEventListener("click", () => {
    gloSubject = b.dataset.sub;
    if (gloSubject !== "hf") gloArea = "all";
    renderGloControls(); renderGloList();
  }));
  box.querySelectorAll("[data-blk]").forEach(b => b.addEventListener("click", () => {
    gloBloque = b.dataset.blk;
    box.querySelectorAll("[data-blk]").forEach(x => x.setAttribute("aria-pressed", x.dataset.blk === gloBloque));
    renderGloList();
  }));
  const sel = document.getElementById("gloarea");
  sel.value = gloArea;
  sel.addEventListener("change", () => { gloArea = sel.value; renderGloList(); });
  const inp = document.getElementById("glosearch");
  inp.value = gloQuery;
  let t = null;
  inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { gloQuery = inp.value.trim(); renderGloList(); }, 120); });
}

/* (08-10) Cuadrículas de conceptos (js/glosario_grids.js + js/esq_grid.js): un botón por tema que tenga su árbol,
   según la materia y el bloque elegidos; se dibuja encima de la lista con el estilo de la Cuadrícula de Esquemas. */
let gloGrid = null;
function gloGridsVisibles(){
  if (typeof GLOSARIO_GRIDS === "undefined") return [];   /* EsqGrid (esq_grid.js) se carga después: se comprueba al dibujar */
  const present = gloPresent();
  return Object.entries(GLOSARIO_GRIDS).filter(([k, g]) => {
    if (!present.includes(g.subject) || (gloSubject !== "all" && g.subject !== gloSubject)) return false;
    if (g.subject === "hf" && gloBloque !== "all"){
      const e = GLOSARIO.find(x => x.tema === g.tema && x.bloque); if (e && e.bloque !== gloBloque) return false;
    }
    return true;
  });
}
function renderGloGrids(){
  const list = document.getElementById("glolist"); if (!list) return;
  let box = document.getElementById("glogrids");
  if (!box){ box = document.createElement("div"); box.id = "glogrids"; list.parentNode.insertBefore(box, list); }
  const vis = gloGridsVisibles();
  if (gloGrid && !vis.some(([k]) => k === gloGrid)) gloGrid = null;
  if (!vis.length){ box.innerHTML = ""; return; }
  box.innerHTML = '<div class="glogrid-bar"><span class="flabel">شبكات المفاهيم</span>' +
    vis.map(([k, g]) => '<button type="button" class="fbtn" data-gg="' + k + '" aria-pressed="' + (k === gloGrid) + '">' + gloEsc(g.tema) + "</button>").join("") + "</div>" +
    (gloGrid ? '<div class="glogrid-stage"><div class="glogrid-head"><h3>' + gloEsc(GLOSARIO_GRIDS[gloGrid].tema) + '</h3><button type="button" class="fbtn" data-gg="">إغلاق</button></div><div id="glogridbox"></div></div>' : "");
  box.querySelectorAll("[data-gg]").forEach(b => b.addEventListener("click", () => {
    gloGrid = b.dataset.gg && b.dataset.gg !== gloGrid ? b.dataset.gg : null; renderGloGrids();
    if (gloGrid) document.getElementById("glogrids").scrollIntoView({ block: "start", behavior: "smooth" });
  }));
  if (gloGrid && typeof EsqGrid !== "undefined"){ const g = GLOSARIO_GRIDS[gloGrid]; EsqGrid.render({ subject: g.subject, v2: g.v2 }, document.getElementById("glogridbox")); }
}

/* (10-10) Al pie de cada término, los pensadores que nombra (campo «ilustre», tools/build_glosario_ilustres.js),
   con enlace a su ficha de Ilustres; solo los que están en esta web. */
const GLO_ILU = "مفكرون";
function gloIlustres(g){
  if (typeof ILUSTRES === "undefined" || !ILUSTRES) return "";
  const ids = (g.ilustre || []).filter(id => ILUSTRES[id]);
  if (!ids.length) return "";
  return '<div class="glo-ilu"><b>' + GLO_ILU + '</b> ' + ids.map(id => '<button type="button" data-glo-ilu="' + gloEsc(id) + '">' + gloEsc(ILUSTRES[id].name) + '</button>').join(" · ") + '</div>';
}

function renderGloList(){
  renderGloGrids();
  const list = document.getElementById("glolist");
  const cnt = document.getElementById("glocount");
  if (!list) return;
  const q = gloFold(gloQuery), present = gloPresent();
  const rows = GLOSARIO.filter(g => {
    if (gloSubject !== "all" && g.subject !== gloSubject) return false;
    if ((gloSubject === "hf" || gloSubject === "all") && present.includes("hf") && gloBloque !== "all" && g.bloque && g.bloque !== gloBloque) return false;
    if (gloArea !== "all" && g.area !== gloArea) return false;
    if (q && !gloFold(g.t + " " + g.def + " " + g.area + " " + (g.et || "").replace(/\*/g, "")).includes(q)) return false;
    return true;
  });
  if (cnt) cnt.textContent = rows.length + (rows.length === 1 ? " مصطلح" : " مصطلحات") +
    (rows.length !== GLOSARIO.length ? " (من " + GLOSARIO.length + ")" : "");
  if (!rows.length){ list.innerHTML = '<p class="gloempty">لا توجد مصطلحات تطابق البحث.</p>'; return; }
  list.innerHTML = rows.map(g => {
    const term = gloHi(gloEsc(g.t), gloQuery);
    const def = gloHi(gloBold(gloEsc(g.def)), gloQuery);
    const tag = (g.area ? g.area : "") + (g.bloque ? " · " + (GLO_BLOCKS[g.bloque] || g.bloque) : "");
    const abre = g.et && q && !gloFold(g.t + " " + g.def + " " + g.area).includes(q);   // lo buscado está solo en la raíz
    const ety = g.et ? '<div class="ety"' + (abre ? "" : " hidden") + "><b>" + GLO_ETY + "</b> " + gloIt(gloHi(gloEsc(g.et), gloQuery)) + "</div>" : "";
    const btn = g.et ? '<button type="button" class="glo-root" aria-expanded="' + !!abre + '" aria-label="' + GLO_ETY_BTN + '" title="' + GLO_ETY_BTN + '">λ</button>' : "";
    const src = g.tema ? '<div class="src">' + gloEsc(g.tema) + (g.unidad ? " · " + g.unidad : "") + '</div>' : "";
    const ilu = gloIlustres(g);
    const ep = g.subject === "hf" && { A: "ant", B: "medmod", C: "con" }[g.bloque];   // (30-09) color del bloque de HF (styles.css)
    return '<article class="gloitem"' + (ep ? ' data-ep="' + ep + '"' : '') + '><div class="top"><h4>' + term + btn + '</h4><span class="tag">' + gloEsc(tag) + '</span></div><p>' + def + '</p>' + ety + src + ilu + '</article>';
  }).join("");
}

/* el botón √ abre y cierra la raíz de su tarjeta (delegado: la lista se repinta en cada filtro) */
(() => {
  const list = document.getElementById("glolist");
  if (list) list.addEventListener("click", e => {
    const il = e.target.closest("[data-glo-ilu]");
    if (il){ (window.show || show)("ilustres"); if (typeof loadIlustre === "function") loadIlustre(il.dataset.gloIlu); return; }
    const b = e.target.closest(".glo-root"); if (!b) return;
    const ety = b.closest(".gloitem").querySelector(".ety"); if (!ety) return;
    ety.hidden = !ety.hidden; b.setAttribute("aria-expanded", String(!ety.hidden));
  });
})();

renderGloControls();
renderGloList();
