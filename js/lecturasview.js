"use strict";
/* ===== Vista de lecturas ===== depende de: lecturas.js ===== */

let lecturaKey = Object.keys(LECTURAS)[0];
let lecturaBlock = "ant";  /* época concreta por defecto, nunca «Todos» */

const LECTURA_EPOCAS = { ant: "القديمة", med: "الوسيطة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة" };

/* (12-10) criterio del profesor: en la web de 1.º el selector de Lecturas criba por ÁMBITO filosófico
   (la asignatura se organiza por problemas, no por periodos); solo se muestran los ámbitos que tienen
   alguna lectura. En HF (y en la web local del profesor, con todas las materias) sigue por bloques. */
const LECTURA_RAMAS = { int: "مدخل", ant: "الأنثروبولوجيا", con: "المعرفة", met: "ميتافيزيقا", log: "المنطق", eti: "الأخلاق", pol: "السياسة", est: "علم الجمال" };
const LEC_RAMA_ORDEN = ["int", "ant", "con", "met", "log", "eti", "pol", "est"];
function lecEsFil(){ return typeof SUBJECTS !== "undefined" && !!SUBJECTS.fil && !SUBJECTS.hf && !SUBJECTS.ipc; }
function lecRama(t){
  const T = String(t.tema || "");
  if (/·\s*M(?:\s|$|\()/.test(T)) return "met";   /* «Filosofía · M» (la sigla M no se traduce) */
  /* multilingüe: ES «Tema 5», EU «5. gaia», FR «Thème 5», EN «Topic 5», AR «الموضوع 5» (el rótulo llega traducido) */
  const m = T.match(/(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/);
  const n = m ? +(m[1] || m[2]) : null;
  return n ? ({ 1: "int", 2: "ant", 3: "con", 4: "log", 5: "eti", 6: "pol", 7: "est" }[n] || "int") : "int";
}

function renderLecturaFilter(){
  const box = document.getElementById("lecturafilter");
  if (lecEsFil()){   /* 1.º: filtro por ámbito filosófico; por defecto «Todas» */
    const presentes = LEC_RAMA_ORDEN.filter(r => Object.values(LECTURAS).some(t => lecRama(t) === r));
    if (lecturaBlock !== "all" && !presentes.includes(lecturaBlock)) lecturaBlock = "all";
    box.innerHTML = '<div class="fgroup"><span class="flabel">المجال</span>' +
      ["all"].concat(presentes).map(b =>
        '<button class="fbtn" data-block="' + b + '" aria-pressed="' + (b === lecturaBlock) + '">' +
        (b === "all" ? "الكل" : LECTURA_RAMAS[b]) + '</button>').join("") + '</div>';
    box.querySelectorAll("[data-block]").forEach(b => b.addEventListener("click", () => {
      lecturaBlock = b.dataset.block;
      renderLecturaFilter();
      renderLecturaChips();
    }));
    return;
  }
  const blockBtns = ["all", "ant", "med", "mod", "ilu", "con"].map(b =>
    '<button class="fbtn" data-era="' + b + '" aria-pressed="' + (b === lecturaBlock) + '">' +
    (b === "all" ? "الكل" : LECTURA_EPOCAS[b]) + '</button>'
  ).join("");
  box.innerHTML = '<div class="fgroup"><span class="flabel">العصر</span>' + blockBtns + '</div>';
  box.querySelectorAll("[data-era]").forEach(b => b.addEventListener("click", () => {
    lecturaBlock = b.dataset.era;
    renderLecturaFilter();
    renderLecturaChips();
  }));
}

function renderLecturaChips(){
  const box = document.getElementById("lecturachips");
  const fil = lecEsFil();
  const entries = Object.entries(LECTURAS).filter(([k, t]) =>
    lecturaBlock === "all" || (fil ? lecRama(t) === lecturaBlock : (window.Epocas && window.Epocas.epocaDe("lecturas", k, t) === lecturaBlock))
  );
  box.innerHTML = entries
    .map(([k, t]) => '<button class="chip" data-lec="' + k + '" aria-pressed="' + (k === lecturaKey) + '">' + t.title + '</button>').join("");
  box.querySelectorAll("[data-lec]").forEach(b => b.addEventListener("click", () => loadLectura(b.dataset.lec)));
}

function loadLectura(k){
  lecturaKey = k;
  renderLecturaChips();
  const t = LECTURAS[k], body = document.getElementById("lecturabody");
  if (!t || !body) return;
  const relHtml = (typeof relatedStripHtml === "function") ? relatedStripHtml(k, "lecturas") : "";
  body.innerHTML = '<div class="theory-head"><span class="kick" style="color:var(--' + t.subject + ')">' + t.tema + '</span><h1>' + t.title + '</h1></div>' + relHtml + t.html;
  if (typeof wireRelated === "function") wireRelated(body);
  // Enlazar con el comentario de texto guiado si existe la vista
  const comentBtn = document.getElementById("comentariolink");
  if (comentBtn) comentBtn.style.display = "inline-flex";
  const hs = [...body.querySelectorAll("h2")];
  hs.forEach((h, i) => { h.id = "lh-" + i; });
  const toc = document.getElementById("ltoc");
  toc.innerHTML = '<div class="toc-title">في هذه القراءة</div><ol>' +
    hs.map((h, i) => '<li><a href="#lh-' + i + '">' + h.textContent + '</a></li>').join("") + '</ol>';
}

if (document.getElementById("lecturabody")){   // solo si la vista de Lecturas existe (no en la web de 2.º ESO)
  renderLecturaFilter();
  if (lecturaKey) loadLectura(lecturaKey);
}
