"use strict";
/* ===== Vista "ملخصات" (antes «Esquemas de autor») ===== depende de: esquemas_autor.js (HF) y/o resumenes_fil.js (Filosofía 1.º) =====
   Muestra los esquemas por tema/autor (mapas ds-* del departamento) en formato
   textual limpio, imprimible. Complementa la vista "خطاطات" (grafos mermaid). */

let eaBlock = "all";
const EA_BLOCKS = { A: "القديمة", B: "الوسيطة والحديثة", C: "المعاصرة", F1: "الفلسفة 1" };
/* (12-10) HF (ESQUEMAS_AUTOR) y Filosofía 1.º (RESUMENES_FIL): cada web publicada trae solo los suyos; la del profesor, los dos */
const EA_LIST = (typeof ESQUEMAS_AUTOR !== "undefined" ? ESQUEMAS_AUTOR : []).concat(typeof RESUMENES_FIL !== "undefined" ? RESUMENES_FIL : []);
const EA_HAS = ["A", "B", "C", "F1"].filter(function (b){ return EA_LIST.some(function (e){ return e.block === b; }); });
/* (07-10) formato: esquema (listas), tabla por autor o tabla sinóptica del bloque (una fila por autor) */
let eaFmt = "esq";
try { const f = localStorage.getItem("eaFmt"); if (f === "tab" || f === "sin") eaFmt = f; } catch (e) {}
const EA_FMTS = { esq: "خطاطات", tab: "جداول", sin: "خلاصة" };

const EA_CSS = `
#esqautor .ea-actions{display:flex;align-items:center;gap:12px;margin:6px 0 16px;flex-wrap:wrap}
#esqautor .ea-print{background:var(--accent);color:var(--on-accent);border:0;border-radius:10px;
  padding:9px 16px;font-size:.92rem;font-weight:600}
#esqautor .ea-print:hover{background:var(--accent-2)}
#esqautor .easchema{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:18px 20px;margin:0 0 14px;break-inside:avoid}
#esqautor .easchema h2{font-family:var(--serif);font-weight:600;font-size:1.25rem;margin:0 0 10px;color:var(--ink)}
#esqautor .easchema h3{font-family:var(--serif);font-weight:600;font-size:1.02rem;margin:14px 0 6px;color:var(--hf)}
#esqautor .easchema ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}
#esqautor .easchema li{font-size:.94rem;color:var(--ink);padding-left:16px;position:relative}
#esqautor .easchema li::before{content:"";position:absolute;left:2px;top:.55em;width:6px;height:6px;
  border-radius:50%;background:var(--ipc)}
#esqautor .easchema li ul{margin:4px 0 2px;gap:3px}
#esqautor .easchema li li::before{background:var(--line);width:5px;height:5px}
#esqautor .ea-q{font-family:var(--serif);font-style:italic;color:var(--muted);margin:-4px 0 8px}
#esqautor .ea-d{margin:0 0 6px;font-size:.94rem}
#esqautor .ea-a{color:var(--muted);font-style:italic}
#esqautor .ea-idea{margin:14px 0 0;padding:10px 12px;border-left:4px solid var(--hf);background:var(--surface-2);border-radius:8px;font-size:.94rem}
#esqautor .ea-tw{overflow-x:auto;margin:4px 0 0}
#esqautor table.ea-tab{width:100%;border-collapse:collapse;font-size:.9rem;line-height:1.45}
#esqautor table.ea-tab th,#esqautor table.ea-tab td{border:1px solid var(--line);padding:7px 9px;vertical-align:top;text-align:left}
#esqautor table.ea-tab thead th{background:var(--surface-2);color:var(--ink);font-weight:600}
#esqautor table.ea-tab td:first-child{font-weight:600;color:var(--hf);width:20%}
#esqautor table.ea-tab ul{list-style:none;margin:0;padding:0;display:grid;gap:3px}
#esqautor table.ea-tab li{padding-left:0}
#esqautor table.ea-tab li::before{display:none}
#esqautor table.ea-sin{min-width:760px}
#esqautor table.ea-sin td:first-child{width:16%}
#esqautor table.ea-sin td:nth-child(2){width:22%;font-style:italic;color:var(--muted)}
#esqautor table.ea-ejes{min-width:1100px;table-layout:fixed}
#esqautor table.ea-ejes td:first-child{width:11%}
#esqautor table.ea-ejes td:nth-child(2){width:auto;font-style:normal;color:var(--ink)}
#esqautor table.ea-ejes td,#esqautor table.ea-ejes th{font-size:.84rem}
/* Solo cuando esta vista es la activa: este script se carga en todas las vistas y un
   body *{visibility:hidden} sin acotar dejaba en blanco la impresión de las demás. */
@media print{
  body:has(#esqautor.active) *{visibility:hidden}
  body:has(#esqautor.active) #esqautor, body:has(#esqautor.active) #esqautor *{visibility:visible}
  #esqautor{position:absolute;left:0;top:0;width:100%;padding:0;margin:0}
  #esqautor .ea-actions, #esqautor .filterbar, #esqautor .eyebrow, #esqautor .lead{display:none}
  #esqautor .easchema{border:1px solid #ccc;box-shadow:none;break-inside:avoid}
}
`;
let _eaCss = false;
function eaInjectCss(){ if (_eaCss) return; const s = document.createElement("style"); s.textContent = EA_CSS; document.head.appendChild(s); _eaCss = true; }

function eaEsc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function renderEAFilter(){
  const box = document.getElementById("eafilter");
  if (!box) return;
  box.innerHTML = (EA_HAS.length < 2 ? '' : '<div class="fgroup"><span class="flabel">المحور</span>' +
    ["all"].concat(EA_HAS).map(function (b){
      return '<button class="fbtn" data-eb="' + b + '" aria-pressed="' + (b === eaBlock) + '">' +
        (b === "all" ? "الكل" : EA_BLOCKS[b]) + '</button>'; }).join("") + '</div>') +
    '<div class="fgroup"><span class="flabel">الصيغة</span>' +
    Object.keys(EA_FMTS).map(function (f){
      return '<button class="fbtn" data-ef="' + f + '" aria-pressed="' + (f === eaFmt) + '">' + EA_FMTS[f] + '</button>'; }).join("") + '</div>';
  box.querySelectorAll("[data-eb]").forEach(function (b){ b.addEventListener("click", function (){
    eaBlock = b.dataset.eb; renderEAFilter(); renderEABody(); }); });
  box.querySelectorAll("[data-ef]").forEach(function (b){ b.addEventListener("click", function (){
    eaFmt = b.dataset.ef; try { localStorage.setItem("eaFmt", eaFmt); } catch (e) {}
    renderEAFilter(); renderEABody(); }); });
}

function renderEABody(){
  const box = document.getElementById("eabody");
  if (!box) return;
  const list = EA_LIST.filter(function (e){ return eaBlock === "all" || e.block === eaBlock; });
  /* ítems: texto (formato antiguo) u objeto {t, d, a, c} (desde el 25-09, sacados de los esquemas v2) */
  function item(i){
    if (typeof i === "string") return '<li>' + eaEsc(i) + '</li>';
    return '<li><strong>' + eaEsc(i.t) + '</strong>' + (i.d ? ': ' + eaEsc(i.d) : '') +
      (i.a ? ' <span class="ea-a">(' + eaEsc(i.a) + ')</span>' : '') +
      (Array.isArray(i.c) && i.c.length ? '<ul>' + i.c.map(item).join("") + '</ul>' : '') + '</li>';
  }
  /* Sinóptica: una fila por autor/tema del bloque (o de todos), columnas comunes */
  /* (08-10) con ejes comunes (esquemas_ejes.js): una tabla por bloque, una fila por tema y una columna por eje */
  if (eaFmt === "sin" && typeof EA_EJES !== "undefined" && typeof ESQUEMAS_AUTOR !== "undefined" && eaBlock !== "F1"){
    box.innerHTML = ["A", "B", "C"].filter(function (b){ return (eaBlock === "all" || eaBlock === b) && EA_EJES[b]; }).map(function (b){
      const E = EA_EJES[b];
      return '<article class="easchema"><h2>' + eaEsc(EA_BLOCKS[b]) + '</h2><div class="ea-tw"><table class="ea-tab ea-sin ea-ejes"><thead><tr><th>الموضوع</th>' +
        E.ejes.map(function (x){ return '<th>' + eaEsc(x) + '</th>'; }).join("") + '</tr></thead><tbody>' +
        E.filas.map(function (f){
          const sch = ESQUEMAS_AUTOR[f.i] || {};
          return '<tr><td>' + eaEsc(sch.title || "") + '</td>' + f.c.map(function (x){ return '<td>' + eaEsc(x) + '</td>'; }).join("") + '</tr>';
        }).join("") + '</tbody></table></div></article>';
    }).join("") + (eaBlock === "all" && list.some(function (e){ return e.block === "F1"; }) ?
      '<h2>' + eaEsc(EA_BLOCKS.F1) + '</h2>' + sinGen(list.filter(function (e){ return e.block === "F1"; })) : '');
    eaIlu();
    return;
  }
  function sinGen(lst){ return '<article class="easchema"><div class="ea-tw"><table class="ea-tab ea-sin"><thead><tr>' +
      '<th>المؤلف أو الموضوع</th><th>سؤال</th><th>الفقرات</th><th>الفكرة الأساسية</th></tr></thead><tbody>' +
      lst.map(function (sch){
        const heads = (sch.sections || []).filter(function (s){ return s.heading; }).map(function (s){
          return '<li><strong>' + eaEsc(s.heading) + '</strong>' + (s.d ? ': ' + eaEsc(s.d) : '') + '</li>'; }).join("");
        return '<tr><td>' + eaEsc(sch.title) + '</td><td>' + eaEsc(sch.pregunta || "") + '</td><td>' +
          (heads ? '<ul>' + heads + '</ul>' : '') + '</td><td>' + eaEsc(sch.idea || "") + '</td></tr>';
      }).join("") + '</tbody></table></div></article>'; }
  if (eaFmt === "sin"){ box.innerHTML = sinGen(list); eaIlu(); return; }
  box.innerHTML = list.map(function (sch){
    if (eaFmt === "tab"){   /* tabla por autor: una fila por apartado */
      const rows = (sch.sections || []).map(function (s){
        const items = (s.items || []).map(item).join("");
        return '<tr><td>' + eaEsc(s.heading || "") + '</td><td>' + (s.d ? eaEsc(s.d) : '') +
          (s.a ? ' <span class="ea-a">(' + eaEsc(s.a) + ')</span>' : '') + '</td><td>' + (items ? '<ul>' + items + '</ul>' : '') + '</td></tr>';
      }).join("");
      return '<article class="easchema"><h2>' + eaEsc(sch.title) + '</h2>' +
        (sch.pregunta ? '<p class="ea-q">' + eaEsc(sch.pregunta) + '</p>' : '') +
        '<div class="ea-tw"><table class="ea-tab"><thead><tr><th>الفقرة</th><th>فكرة</th><th>المفاهيم والفلاسفة</th></tr></thead><tbody>' +
        rows + '</tbody></table></div>' +
        (sch.idea ? '<p class="ea-idea"><strong>الفكرة الأساسية:</strong> ' + eaEsc(sch.idea) + '</p>' : '') + '</article>';
    }
    const secs = (sch.sections || []).map(function (s){
      const h = s.heading ? '<h3>' + eaEsc(s.heading) + '</h3>' : '';
      const d = s.d || s.a ? '<p class="ea-d">' + (s.d ? eaEsc(s.d) : '') + (s.a ? ' <span class="ea-a">(' + eaEsc(s.a) + ')</span>' : '') + '</p>' : '';
      const items = (s.items || []).map(item).join("");
      return h + d + (items ? '<ul>' + items + '</ul>' : '');
    }).join("");
    return '<article class="easchema"><h2>' + eaEsc(sch.title) + '</h2>' +
      (sch.pregunta ? '<p class="ea-q">' + eaEsc(sch.pregunta) + '</p>' : '') + secs +
      (sch.idea ? '<p class="ea-idea"><strong>الفكرة الأساسية:</strong> ' + eaEsc(sch.idea) + '</p>' : '') + '</article>';
  }).join("");
  eaIlu();
}

/* (29-09) Nombres de pensadores → su ficha en «Ilustres», con el mismo enlazador que los
   cronogramas (cronoIlu, en cronogramasview.js, que se carga después: de ahí el DOMContentLoaded). */
function eaIlu(){ if (typeof cronoIlu === "function") try { cronoIlu(document.getElementById("eabody")); } catch (e) {} }
document.addEventListener("DOMContentLoaded", eaIlu);

eaInjectCss();
renderEAFilter();
renderEABody();

/* Botón imprimir (se conecta en index.html o aquí por id). */
(function(){
  const b = document.getElementById("eaprint");
  if (b) b.addEventListener("click", function(){ void 0 /* sin imprimir en la web de alumnado */; });
})();
