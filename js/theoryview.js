"use strict";
/* ===== Vista de teoría ===== depende de: theory.js ===== */

let theoryKey = Object.keys(THEORY)[0];
let theorySubject = "all";
let theoryBlock = "all";
let theoryShowAnexos = false;   /* (12-10, rediseño) las exploraciones salen ocultas por defecto */

const THEORY_SUBJECTS = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة", ipc: "التفكير النقدي" };
const THEORY_BLOCKS = { A: "المحور A · القديمة", B: "المحور B · الوسيطة والحديثة", C: "المحور C · المعاصرة" };

function blockOf(t){
  if (t.sigla) return t.sigla.charAt(0);   /* (07-10) AP/AA: temas sin número; la sigla empieza por su bloque */
  /* «Tema 19» en castellano; «19. gaia» en euskera (antes, en la web vasca, el filtro de bloque vaciaba la lista) */
  const m = (t.tema || "").match(/(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/);   /* también «Thème N» (francés), «Topic N» (inglés) y «الموضوع N» (árabe) */
  if (!m && typeof t.temaN !== "number") return null;   /* anexos: sin «Tema N» en el nombre, con temaN */
  const n = typeof t.temaN === "number" ? t.temaN : +(m[1] || m[2]);
  if (n >= 1 && n <= 10) return "A";
  if (n >= 11 && n <= 17) return "B";
  if (n >= 18 && n <= 27) return "C";
  return null;
}

function renderTheoryFilter(){
  const box = document.getElementById("theoryfilter");
  const subjBtns = ["all", "fil", "hf", "ipc"].map(s =>
    '<button class="fbtn" data-subj="' + s + '" aria-pressed="' + (s === theorySubject) + '">' +
    (s === "all" ? "الكل" : THEORY_SUBJECTS[s]) + '</button>'
  ).join("");
  let blockBtns = "";
  if (theorySubject === "hf"){
    blockBtns = ["all", "A", "B", "C"].map(b =>
      '<button class="fbtn" data-block="' + b + '" aria-pressed="' + (b === theoryBlock) + '">' +
      (b === "all" ? "كل المحاور" : THEORY_BLOCKS[b]) + '</button>'
    ).join("");
  }
  box.innerHTML = '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' +
    (blockBtns ? '<div class="fgroup"><span class="flabel">المحور</span>' + blockBtns + '</div>' : '');
  box.querySelectorAll("[data-subj]").forEach(b => b.addEventListener("click", () => {
    theorySubject = b.dataset.subj;
    if (theorySubject !== "hf") theoryBlock = "all";
    renderTheoryFilter();
    renderTheoryChips();
  }));
  box.querySelectorAll("[data-block]").forEach(b => b.addEventListener("click", () => {
    theoryBlock = b.dataset.block;
    renderTheoryFilter();
    renderTheoryChips();
  }));
}

function renderTheoryChips(){
  const box = document.getElementById("theorychips");
  const entries = Object.entries(THEORY).filter(([k, t]) => {
    if (theorySubject !== "all" && t.subject !== theorySubject) return false;
    if (theorySubject === "hf" && theoryBlock !== "all" && blockOf(t) !== theoryBlock) return false;
    if (theoryBlock !== "all" && window.Epocas && window.Epocas.soloTodos("teoria", k)) return false;   // (30-09) temas 1-2 de HF: solo con «Todos los bloques» (epocas.js)
    return true;
  });
  /* (12-10, rediseño) las exploraciones (anexos: con `temaN`) van aparte y ocultas por defecto;
     el alumno las muestra con el botón «Exploraciones (n)» */
  const temas = entries.filter(([k, t]) => typeof t.temaN !== "number");
  const anexos = entries.filter(([k, t]) => typeof t.temaN === "number");
  const chip = ([k, t]) => '<button class="chip" data-th="' + k + '" aria-pressed="' + (k === theoryKey) + '">' + t.title + '</button>';
  const anexoHtml = anexos.length
    ? '<div class="theory-anexos"><button type="button" class="fbtn" data-ttexp aria-expanded="' + (theoryShowAnexos ? "true" : "false") + '">' + "استكشافات" + ' (' + anexos.length + ')' + '</button>' +
      '<div class="theory-anexos-list"' + (theoryShowAnexos ? '' : ' hidden') + '>' + anexos.map(chip).join("") + '</div></div>'
    : "";
  box.innerHTML = temas.map(chip).join("") + anexoHtml;
  box.querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => loadTheory(b.dataset.th)));
  const tg = box.querySelector("[data-ttexp]");
  if (tg) tg.addEventListener("click", () => { theoryShowAnexos = !theoryShowAnexos; renderTheoryChips(); });
}

/* Mapa curado: infografía de autor → nº de tema del currículo de HF.
   Da a esas infografías (con clave de persona, sin campo `tema`) un ancla al temario para
   que la tira «De este tema» las enlace con su teoría/lectura.
   EDITABLE: para cambiar el tema de un autor, edita aquí su nº (ver los títulos en theory.js).
   Los autores sin tema propio en el temario se anclan al más afín (criterio del profesorado):
   Aristóteles→8 (ética; alt. 7/9), Locke/Spinoza→14 (empirismo/racionalismo; alt. 16/17/15),
   Schopenhauer→23 (precursor de Nietzsche; alt. 21), Hegel→21 (idealismo→Marx; el más forzado),
   Arendt→27 (sociedad actual; alt. 25). */
const TEMA_ALIAS = {
  "hf-presocraticos": 4, "hf-socrates": 5, "hf-aristoteles": 8, "hf-agustin": 12,
  "hf-tomas": 12, "hf-descartes": 14, "hf-hume": 14, "hf-locke": 14, "hf-spinoza": 14,
  "hf-maquiavelo": 16, "hf-hobbes": 16, "hf-rousseau": 16, "hf-marx": 21, "hf-freud": 21,
  "hf-hegel": 21, "hf-nietzsche": 23, "hf-schopenhauer": 23, "hf-sartre": 25, "hf-arendt": 27
};

/* ===== Enlaces contextuales «De este tema» (compartido por Teoría, Lecturas e Infografías) =====
   Reúne los recursos del MISMO tema sin cambiar la navegación: reutiliza el mapa curado
   UNIDADES (HF) y la coincidencia directa de clave (Filosofía e infografías). `self` es la
   vista actual, que se excluye para no enlazar a sí misma. typeof-guards por el orden de carga. */
function relatedFor(key, self){
  const out = [];
  const has = (o, k) => typeof o !== "undefined" && o && o[k];
  const add = (go, arg, label) => { if (arg && go !== self && !out.some(r => r.go === go)) out.push({ go, arg, label }); };
  if (typeof UNIDADES !== "undefined"){
    for (const n of Object.keys(UNIDADES)){
      const u = UNIDADES[n];
      if (u && (u.teoria === key || u.lectura === key)){
        if (document.getElementById("unidad")) add("unidad", n, "عرض الموضوع كاملًا ←");
        if (u.teoria && has(THEORY, u.teoria)) add("teoria", u.teoria, "الدروس");
        if (u.quiz && has(QUIZZES, u.quiz)) add("cuestionarios", u.quiz, "اختبار");
        if (u.lectura && has(LECTURAS, u.lectura)) add("lecturas", u.lectura, "قراءة النص");
        break;
      }
    }
  }
  /* typeof-guards obligatorios: estos objetos globales (const) se cargan DESPUÉS de este
     archivo, y nombrar el identificador antes de existir lanza ReferenceError (no basta con
     has(): el argumento se evalúa antes de la llamada). El && cortocircuita sin tocarlo. */
  if (typeof THEORY !== "undefined" && THEORY[key]) add("teoria", key, "الدروس");
  if (typeof QUIZZES !== "undefined" && QUIZZES[key]) add("cuestionarios", key, "اختبار");
  if (typeof LECTURAS !== "undefined" && LECTURAS[key]) add("lecturas", key, "قراءة النص");
  if (typeof INFOGRAFIAS !== "undefined" && INFOGRAFIAS[key]) add("infografias", key, "إنفوغرافيك");
  /* Fallback por tema (mismo nº de tema y misma materia): conecta las lecturas e infografías
     "de paquete" con su teoría/cuestionario aunque no compartan clave. */
  const src = (typeof THEORY !== "undefined" && THEORY[key]) ||
              (typeof LECTURAS !== "undefined" && LECTURAS[key]) ||
              (typeof QUIZZES !== "undefined" && QUIZZES[key]) ||
              (typeof INFOGRAFIAS !== "undefined" && INFOGRAFIAS[key]) || null;
  if (src){
    const temaN = o => { if (!o) return null; if (typeof o.tema === "number") return o.tema; if (typeof o.temaN === "number") return o.temaN;
      const m = String(o.tema || "").match(/(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/); return m ? +(m[1] || m[2]) : null; };
    let tn = temaN(src);
    if (tn == null && typeof TEMA_ALIAS !== "undefined" && TEMA_ALIAS[key] != null) tn = TEMA_ALIAS[key];
    const subj = src.subject;
    if (tn != null){
      const firstBy = coll => { if (typeof coll === "undefined" || !coll) return null;
        return Object.keys(coll).find(kk => kk !== key && coll[kk].subject === subj && temaN(coll[kk]) === tn) || null; };
      add("teoria", firstBy(typeof THEORY !== "undefined" ? THEORY : null), "الدروس");
      add("cuestionarios", firstBy(typeof QUIZZES !== "undefined" ? QUIZZES : null), "اختبار");
      add("lecturas", firstBy(typeof LECTURAS !== "undefined" ? LECTURAS : null), "قراءة النص");
      add("infografias", firstBy(typeof INFOGRAFIAS !== "undefined" ? INFOGRAFIAS : null), "إنفوغرافيك");
    }
  }
  /* Dilemas éticos de Bachillerato (25-09): cada dilema declara la unidad de teoría de su debate
     (debate.unidad); se enlazan todos los de esta unidad (no se deduplica por vista: puede haber varios). */
  if (typeof DILEMAS !== "undefined" && Array.isArray(DILEMAS) && self !== "dilemas"){
    for (const d of DILEMAS) if (d && d.debate && d.debate.unidad === key) out.push({ go: "dilemas", arg: d.id, label: "المعضلة: " + d.titulo });
  }
  /* (11-10) ficha de la época del tema (HF), en Ilustres */
  if (src && window.Itinerario && window.Itinerario.epocaFicha && document.getElementById("ilustres") && typeof iluNombreFicha === "function"){
    const tn = (TEMA_ALIAS[key] != null ? TEMA_ALIAS[key] : (typeof src.temaN === "number" ? src.temaN : (String(src.tema || "").match(/(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/) || []).slice(1).find(Boolean)));
    const ep = tn != null ? window.Itinerario.epocaFicha(src.subject, +tn) : null;
    if (ep) out.push({ go: "ilustres", arg: "epoca-" + ep, label: TV_EPOCA_DE.replace("{e}", iluNombreFicha(ep)) });
  }
  return out;
}

function relatedStripHtml(key, self){
  const rel = relatedFor(key, self);
  if (!rel.length) return "";
  return '<div class="toolrow related-row" style="margin:.1rem 0 1.1rem"><span class="flabel" style="align-self:center">من هذا الموضوع:</span>' +
    rel.map(r => '<button class="btn" data-go="' + r.go + '" data-arg="' + r.arg + '">' + r.label + '</button>').join(" ") + '</div>';
}

const TV_EPOCA_DE = "الحقبة: {e}";
function goRelated(go, arg){
  if (typeof show === "function") show(go);
  if (go === "ilustres" && typeof loadIlustre === "function"){ loadIlustre(arg); return; }
  if (go === "cuestionarios" && typeof loadQuiz === "function") loadQuiz(arg);
  else if (go === "lecturas" && typeof loadLectura === "function") loadLectura(arg);
  else if (go === "infografias" && typeof loadInfografia === "function") loadInfografia(arg);
  else if (go === "teoria" && typeof loadTheory === "function") loadTheory(arg);
  else if (go === "dilemas" && typeof openDil === "function"){
    if (typeof dil !== "undefined" && typeof dilById === "function"){ const d = dilById(arg); if (d) dil.group = d.grupo; }   // «Siguiente» recorre su grupo
    openDil(arg);
  }
  else if (go === "unidad" && typeof unidadKey !== "undefined"){
    unidadKey = +arg;
    if (typeof renderUnidadChips === "function") renderUnidadChips();
    if (typeof renderUnidadBody === "function") renderUnidadBody();
  }
}

function wireRelated(container){
  (container || document).querySelectorAll(".related-row [data-go]").forEach(b => b.addEventListener("click", () => goRelated(b.dataset.go, b.dataset.arg)));
}

/* ===== Teoría por apartados (30-09, Filosofía 1.º) =====
   Los temas de estas materias se ven de apartado en apartado (cada <h2> abre uno; lo previo al
   primer <h2> va con el primero). Solo cambia la vista: theory.js sigue igual. «Ver el tema entero»
   lo muestra seguido, como antes. */
const THEORY_POR_APARTADOS = ["fil"];
/* HF (01-10): solo los temas largos (los ampliados con el contenido del euskera) van por apartados, y sus bloques
   muy largos se parten por los <h3> en páginas de lectura tranquila: «Agustín de Hipona (2/3)». */
const THEORY_LARGO = { hf: 9000 }, THEORY_TROZO = 4500;
const theoryTextLen = html => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").length; };
function theoryPorApartados(t){ return THEORY_POR_APARTADOS.includes(t.subject) || (THEORY_LARGO[t.subject] && theoryTextLen(t.html) > THEORY_LARGO[t.subject]); }
let theoryPart = 0, theoryWhole = false;
/* al imprimir sale siempre el tema entero, sin la barra de apartados */
document.head.insertAdjacentHTML("beforeend",
  '<style>.th-sec{margin-left:.4em;font-size:.6em;font-weight:400;color:var(--muted);text-decoration:none;opacity:.55;vertical-align:middle}.th-sec:hover,.th-sec:focus{opacity:1;text-decoration:underline}.th-partnav{flex-wrap:nowrap;gap:.5rem}.th-partnav .btn:disabled{visibility:hidden}.th-partnav .th-partpos{text-align:center;flex:1}' +
  '@media print{.th-part[hidden]{display:block!important}.th-partnav,[data-thwhole]{display:none!important}}</style>');

function theoryShowPart(body, i, scroll){
  const parts = [...body.querySelectorAll(".th-part")];
  if (!parts.length) return;
  theoryPart = Math.max(0, Math.min(i, parts.length - 1));
  parts.forEach((p, j) => { p.hidden = !theoryWhole && j !== theoryPart; });
  body.querySelectorAll(".th-partnav").forEach(nav => { nav.hidden = theoryWhole; });
  body.querySelectorAll("[data-thprev]").forEach(b => { b.disabled = theoryPart === 0; });
  body.querySelectorAll("[data-thnext]").forEach(b => { b.disabled = theoryPart === parts.length - 1; });
  body.querySelectorAll(".th-partpos").forEach(s => { s.textContent = "Apartado " + (theoryPart + 1) + " de " + parts.length; });
  body.querySelectorAll("[data-thwhole]").forEach(b => { b.textContent = theoryWhole ? "عرض حسب الفقرات" : "عرض الموضوع كاملًا"; b.setAttribute("aria-pressed", theoryWhole); });
  document.querySelectorAll("#toc [data-thpart]").forEach(a => a.classList.toggle("on", !theoryWhole && +a.dataset.thpart === theoryPart));
  if (scroll) body.scrollIntoView({ block: "start" });
}

function theorySplitParts(body, html, trocear){
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const groups = [[]];
  [...tmp.childNodes].forEach(n => {
    if (n.nodeType === 1 && n.tagName === "H2" && groups[groups.length - 1].some(x => x.nodeType === 1 && x.tagName === "H2")) groups.push([]);
    groups[groups.length - 1].push(n);
  });
  if (trocear){   /* un bloque muy largo se reparte en varias páginas, cortando solo delante de un <h3> */
    const len = ns => ns.reduce((a, n) => a + (n.textContent || "").replace(/\s+/g, " ").length, 0);
    for (let gi = groups.length - 1; gi >= 0; gi--){
      const g = groups[gi], h2 = g.find(x => x.nodeType === 1 && x.tagName === "H2");
      if (!h2 || len(g) <= THEORY_TROZO * 1.5) continue;
      const trozos = [[]];
      g.forEach(n => {
        const cur = trozos[trozos.length - 1];
        if (n.nodeType === 1 && n.tagName === "H3" && len(cur) >= THEORY_TROZO) trozos.push([]);
        trozos[trozos.length - 1].push(n);
      });
      if (trozos.length < 2) continue;
      const tit = h2.textContent;
      h2.textContent = tit + " (1/" + trozos.length + ")";
      trozos.forEach((tz, ti) => { if (ti){ const h = document.createElement("h2"); h.textContent = tit + " (" + (ti + 1) + "/" + trozos.length + ")"; tz.unshift(h); } });
      groups.splice(gi, 1, ...trozos);
    }
  }
  const navHtml = '<div class="toolrow th-partnav" style="justify-content:space-between;align-items:center;margin:1.2rem 0">' +
    '<button class="btn" data-thprev>→ السابق</button><span class="flabel th-partpos"></span>' +
    '<button class="btn" data-thnext>التالي ←</button></div>';
  const top = '<div class="toolrow" style="justify-content:flex-end;margin:.2rem 0 .6rem"><button class="fbtn" data-thwhole></button></div>';
  body.insertAdjacentHTML("beforeend", top);
  groups.forEach(g => {
    const sec = document.createElement("section");
    sec.className = "th-part";
    g.forEach(n => sec.appendChild(n));
    body.appendChild(sec);
  });
  body.insertAdjacentHTML("beforeend", navHtml);
  body.querySelectorAll("[data-thprev]").forEach(b => b.addEventListener("click", () => theoryShowPart(body, theoryPart - 1, true)));
  body.querySelectorAll("[data-thnext]").forEach(b => b.addEventListener("click", () => theoryShowPart(body, theoryPart + 1, true)));
  body.querySelectorAll("[data-thwhole]").forEach(b => b.addEventListener("click", () => { theoryWhole = !theoryWhole; theoryShowPart(body, theoryPart, true); }));
}

/* (10-10) Diagramas de Venn dentro de la teoría (exploración «Clases, conjuntos y diagramas de Venn»).
   En theory.js cada figura es una línea traducible: <figure class="tv-venn" data-venn="…"><figcaption>…</figcaption></figure>.
   data-venn: «c=A,B» (nombres de los círculos, 2 o 3) y, separadas por «;», las regiones de cada marca:
   sel = resultado de una operación (color), vac = vacía (gris), x = hay al menos uno (✕). Una región es una
   cadena de 0 y 1 en el orden de los círculos («10» = dentro de A y fuera de B; «00» = fuera de todos);
   «110|111» pone el ✕ sobre la línea entre las dos regiones (no se sabe en cuál está). */
const TVV = {
  2: { vb: "0 0 300 190", c: [[118, 98], [182, 98]], r: 64, etq: [[56, 34, "end"], [244, 34, "start"]],
    cen: { "10": [84, 98], "01": [216, 98], "11": [150, 98], "00": [30, 170] } },
  3: { vb: "0 0 320 300", c: [[120, 118], [200, 118], [160, 188]], r: 74, etq: [[34, 44, "start"], [286, 44, "end"], [160, 290, "middle"]],
    cen: { "100": [86, 92], "010": [234, 92], "110": [160, 78], "001": [160, 236], "101": [112, 166], "011": [208, 166], "111": [160, 136], "000": [26, 280] } }
};
let tvvN = 0;
function tvVennSvg(spec){
  const o = {}; spec.split(";").forEach(p => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  const nom = (o.c || "A,B").split(","), n = nom.length === 3 ? 3 : 2, G = TVV[n], id = "tvv" + (++tvvN);
  const [, , W, H] = G.vb.split(" ").map(Number), lista = k => (o[k] ? o[k].split(",").map(s => s.trim()).filter(Boolean) : []);
  const circ = (j, extra) => '<circle cx="' + G.c[j][0] + '" cy="' + G.c[j][1] + '" r="' + G.r + '"' + (extra || "") + "/>";
  let defs = "<defs>" + G.c.map((_, j) => '<clipPath id="' + id + "c" + j + '">' + circ(j) + "</clipPath>").join("");
  const region = (r, cls) => {   /* rectángulo del universo recortado por los círculos de dentro y enmascarado por los de fuera */
    const fuera = [...r].map((b, j) => b === "0" ? j : -1).filter(j => j >= 0), mid = id + "m" + r;
    if (!defs.includes('id="' + mid + '"')) defs += '<mask id="' + mid + '"><rect width="' + W + '" height="' + H + '" fill="#fff"/>' + fuera.map(j => circ(j, ' fill="#000"')).join("") + "</mask>";
    let g = '<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" class="' + cls + '" mask="url(#' + mid + ')"/>';
    [...r].forEach((b, j) => { if (b === "1") g = '<g clip-path="url(#' + id + "c" + j + ')">' + g + "</g>"; });
    return g;
  };
  const zonas = lista("sel").map(r => region(r, "tvv-sel")).join("") + lista("vac").map(r => region(r, "tvv-vac")).join("") +
    lista("h1").map(r => region(r, "tvv-h1")).join("") + lista("h2").map(r => region(r, "tvv-h2")).join("");   /* (12-10) rayados del Rincón de lógica */
  const xs = lista("x").map(x => { const ps = x.split("|").map(r => G.cen[r]).filter(Boolean); if (!ps.length) return "";
    const px = ps.reduce((a, p) => a + p[0], 0) / ps.length, py = ps.reduce((a, p) => a + p[1], 0) / ps.length;
    return '<text x="' + px + '" y="' + (py + 7) + '" text-anchor="middle" class="tvv-x">✕</text>'; }).join("");
  const marco = '<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" rx="4" class="tvv-u"/><text x="14" y="26" class="tvv-t tvv-tu">U</text>';
  const etq = nom.slice(0, n).map((t, j) => '<text x="' + G.etq[j][0] + '" y="' + G.etq[j][1] + '" text-anchor="' + G.etq[j][2] + '" class="tvv-t">' + t.replace(/[&<>]/g, "") + "</text>").join("");
  return '<svg viewBox="' + G.vb + '" role="img" aria-hidden="true">' + defs + "</defs>" + marco + zonas + G.c.map((_, j) => circ(j, ' class="tvv-c"')).join("") + etq + xs + "</svg>";
}
/* Diagramas de Euler: <figure class="tv-venn" data-euler="c=S@cx,cy,r|P@cx,cy,r[,lx,ly];x=cx,cy|…;q=cx,cy;p=nombre@cx,cy[,lx,ly]">.
   Cada círculo es una clase en la posición que expresa la relación (dentro, fuera, cruzados); ✕ = hay al menos uno,
   ? = puede haber o no, p = un individuo (punto con su nombre). La caja es 0 0 300 200, o la de «vb=…». */
function tvEulerSvg(spec){
  const o = {}; spec.split(";").forEach(p => { const i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
  const num = s => s.split(",").map(Number), esc = t => t.replace(/[&<>"]/g, "");
  const circ = (o.c || "").split("|").filter(Boolean).map((c, j) => {
    const [nom, pos] = c.split("@"), [cx, cy, r, lx, ly] = num(pos);
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="tvv-c tve-' + (j % 3) + '"/><text x="' + (lx != null ? lx : cx) + '" y="' + (ly != null ? ly : cy - r + 26) + '" text-anchor="middle" class="tvv-t">' + esc(nom) + "</text>";
  }).join("");
  const marca = (k, ch, cls) => (o[k] || "").split("|").filter(Boolean).map(p => { const [x, y] = num(p); return '<text x="' + x + '" y="' + (y + 9) + '" text-anchor="middle" class="' + cls + '">' + ch + "</text>"; }).join("");
  const puntos = (o.p || "").split("|").filter(Boolean).map(p => { const [nom, pos] = p.split("@"), [x, y, lx, ly] = num(pos);
    return '<circle cx="' + x + '" cy="' + y + '" r="5" class="tve-p"/><text x="' + (lx != null ? lx : x) + '" y="' + (ly != null ? ly : y + 24) + '" text-anchor="middle" class="tvv-t tve-pt">' + esc(nom) + "</text>"; }).join("");
  return '<svg viewBox="' + (o.vb || "0 0 300 200") + '" role="img" aria-hidden="true">' + circ + puntos + marca("x", "✕", "tvv-x") + marca("q", "?", "tvv-x tve-q") + "</svg>";
}
/* (11-10) Diagramas lineales de Leibniz (h. 1686): <figure class="tv-venn" data-lineas="S:50-230:50-160|P:160-330:230-330">.
   Cada clase es un segmento «etiqueta:desde-hasta[:tramos de puntos a-b,c-d]» en una caja de 380 de ancho; el tramo
   de puntos es la parte que puede existir o no. Mismo dibujo que el Taller de Leibniz (leibnizview.js, lzLin). */
function tvLineasSvg(spec){
  const L = spec.split("|").filter(Boolean).map(r => { const [t, ab, pts] = r.split(":"), [a, b] = ab.split("-").map(Number);
    return { t, a, b, p: (pts || "").split(",").filter(Boolean).map(x => x.split("-").map(Number)) }; });
  const h = 40;
  let s = '<svg viewBox="0 0 380 ' + (L.length * h + 16) + '" role="img" aria-hidden="true">';
  L.forEach((r, i) => {
    const y = 26 + i * h, cortes = [r.a];
    r.p.forEach(p => cortes.push(p[0], p[1])); cortes.push(r.b);
    s += '<text x="18" y="' + (y + 8) + '" class="tvv-t">' + r.t.replace(/[&<>]/g, "") + "</text>";
    for (let k = 0; k < cortes.length; k += 2) if (cortes[k + 1] > cortes[k]) s += '<line x1="' + cortes[k] + '" y1="' + y + '" x2="' + cortes[k + 1] + '" y2="' + y + '" class="tvl-seg"/>';
    r.p.forEach(p => { s += '<line x1="' + p[0] + '" y1="' + y + '" x2="' + p[1] + '" y2="' + y + '" class="tvl-seg tvl-puntos"/>'; });
    s += '<line x1="' + r.a + '" y1="' + (y - 9) + '" x2="' + r.a + '" y2="' + (y + 9) + '" class="tvl-tope"/><line x1="' + r.b + '" y1="' + (y - 9) + '" x2="' + r.b + '" y2="' + (y + 9) + '" class="tvl-tope"/>';
  });
  return s + "</svg>";
}
function tvVennFiguras(root){
  root.querySelectorAll("figure.tv-venn[data-lineas]").forEach(f => { if (!f.querySelector("svg")) f.insertAdjacentHTML("afterbegin", tvLineasSvg(f.dataset.lineas)); });
  root.querySelectorAll("figure.tv-venn[data-venn]").forEach(f => { if (!f.querySelector("svg")) f.insertAdjacentHTML("afterbegin", tvVennSvg(f.dataset.venn)); });
  root.querySelectorAll("figure.tv-venn[data-euler]").forEach(f => { if (!f.querySelector("svg")) f.insertAdjacentHTML("afterbegin", tvEulerSvg(f.dataset.euler)); });
}
document.head.insertAdjacentHTML("beforeend",
  '<style>.tv-venns{display:grid;grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr));gap:.8rem;margin:1rem 0}.tv-venn{margin:0;text-align:center}.tv-venn svg{width:100%;max-width:17rem;display:block;margin:0 auto}' +
  '.tv-venn figcaption{font-size:.86rem;color:var(--muted);margin-top:.25rem;line-height:1.35}.tvv-u{fill:none;stroke:var(--line);stroke-width:1.5}.tvv-c{fill:none;stroke:var(--ink);stroke-width:2}' +
  '.tvv-sel{fill:var(--fil,var(--accent));fill-opacity:.45}.tvv-vac{fill:var(--muted);fill-opacity:.5}.tvv-t{font:700 24px var(--sans);fill:var(--ink)}.tvv-tu{font-size:16px;fill:var(--muted)}.tvv-x{font:700 30px var(--sans);fill:var(--bad,#b3261e)}' +
  '.tve-0{fill:var(--fil,var(--accent));fill-opacity:.16}.tve-1{fill:var(--ink);fill-opacity:.06}.tve-2{fill:var(--ok,#2f7a4d);fill-opacity:.12}.tve-q{fill:var(--muted)}.tve-p{fill:var(--ink)}.tve-pt{font-size:18px;font-weight:600}.tv-f{white-space:nowrap}.tvl-seg{stroke:var(--fil,var(--accent));stroke-width:7;stroke-linecap:butt}.tvl-puntos{stroke-dasharray:3 6;stroke-width:5}.tvl-tope{stroke:var(--ink);stroke-width:2}</style>');

/* (07-10) apartados con número estable: «#teoria/<clave>/<n>» (o «<clave>§<n>») abre el tema en su n-ésimo <h2>
   original, aunque el tema se lea por páginas; cada apartado lleva un «§» con su enlace. */
function theorySecArg(k){ const m = /^(.*?)(?:\/|§)(\d+)$/.exec(k || ""); return m && THEORY[m[1]] ? { k: m[1], sec: +m[2] } : { k: k, sec: null }; }
function theoryMarcaSecs(html){ const d = document.createElement("div"); d.innerHTML = html; [...d.children].filter(n => n.tagName === "H2").forEach((h, i) => { h.dataset.sec = i + 1; }); return d.innerHTML; }
function loadTheory(k){
  const _sa = theorySecArg(k); k = _sa.k; const _sec = _sa.sec;
  if (k !== theoryKey) theoryPart = 0;
  theoryKey = k;
  /* los filtros siguen al tema abierto (enlace profundo, buscador…): antes, con el tema 19 abierto,
     seguía marcado «Bloque A» (el que preselecciona navctx.js) */
  const tk = THEORY[k];
  if (tk){
    let cambia = false;
    if (theorySubject !== "all" && tk.subject && theorySubject !== tk.subject){ theorySubject = tk.subject; theoryBlock = "all"; cambia = true; }
    const bk = blockOf(tk);
    if (theorySubject === "hf" && theoryBlock !== "all" && bk && bk !== theoryBlock){ theoryBlock = bk; cambia = true; }
    if (theoryBlock !== "all" && window.Epocas && window.Epocas.soloTodos("teoria", k)){ theoryBlock = "all"; cambia = true; }   // tema introductorio: se ve con «Todos»
    if (cambia && document.getElementById("theoryfilter")) renderTheoryFilter();
  }
  renderTheoryChips();
  const t = THEORY[k], body = document.getElementById("theorybody");
  const relHtml = (typeof relatedStripHtml === "function") ? relatedStripHtml(k, "teoria") : "";
  const porApartados = theoryPorApartados(t), trocear = !THEORY_POR_APARTADOS.includes(t.subject);
  const head = '<div class="theory-head"><span class="kick" style="color:var(--' + t.subject + ')">' + t.tema + '</span><h1>' + t.title + '</h1>' + (t.clase ? '<span class="en-clase">في القسم</span>' : '')   /* solo las exploraciones que el profesor ya ha trabajado en clase (campo clase:true en theory.js) */ + '</div>' + relHtml;
  const htmlSecs = theoryMarcaSecs(t.html);
  if (porApartados){ body.innerHTML = head; theorySplitParts(body, htmlSecs, trocear); }
  else body.innerHTML = head + htmlSecs;
  if (typeof wireRelated === "function") wireRelated(body);
  const hs = [...body.querySelectorAll("h2")];
  hs.forEach((h, i) => { h.id = "th-" + i; });
  body.querySelectorAll(".figimg").forEach(img => img.addEventListener("click", () => openLightbox(img.src, img.alt)));
  tvVennFiguras(body);
  /* (09-10) estantería de libros (anexo de la biblioteca de Marx): el lomo abre su ficha y la muestra */
  body.querySelectorAll(".lomo[data-libro]").forEach(b => b.addEventListener("click", () => {
    const d = body.querySelector("#libro-" + b.dataset.libro); if (!d) return;
    d.open = true; d.scrollIntoView({ block: "center", behavior: "smooth" });
    d.classList.add("ficha-flash"); setTimeout(() => d.classList.remove("ficha-flash"), 1400);
  }));
  const toc = document.getElementById("toc");
  if (porApartados){
    /* índice = selector de apartado (en «tema entero», salta al ancla como antes) */
    toc.innerHTML = '<div class="toc-title">فقرات الموضوع</div><ol>' +
      hs.map((h, i) => '<li><a href="#th-' + i + '" data-thpart="' + i + '">' + h.textContent + '</a></li>').join("") + '</ol>';
    toc.querySelectorAll("[data-thpart]").forEach(a => a.addEventListener("click", ev => {
      if (theoryWhole) return;
      ev.preventDefault();
      theoryShowPart(body, +a.dataset.thpart, true);
    }));
    theoryShowPart(body, theoryPart, false);
    if (_sec){ const h = body.querySelector('h2[data-sec="' + _sec + '"]'), parts = [...body.querySelectorAll(".th-part")], pi = h ? parts.indexOf(h.closest(".th-part")) : -1;
      if (pi >= 0){ theoryShowPart(body, pi, false); h.scrollIntoView({ block: "start" }); } }
  } else {
    toc.innerHTML = '<div class="toc-title">في هذا الموضوع</div><ol>' +
      hs.map((h, i) => '<li><a href="#th-' + i + '">' + h.textContent + '</a></li>').join("") + '</ol>';
    if (_sec){ const h = body.querySelector('h2[data-sec="' + _sec + '"]'); if (h) h.scrollIntoView({ block: "start" }); }
  }
  body.querySelectorAll("h2[data-sec]").forEach(h => h.insertAdjacentHTML("beforeend", ' <a class="th-sec" href="#teoria/' + k + '/' + h.dataset.sec + '" title="رابط إلى هذه الفقرة" aria-label="رابط إلى هذه الفقرة">§' + h.dataset.sec + '</a>'));   // tras el índice: el «§» no entra en sus títulos
}

renderTheoryFilter();
loadTheory(theoryKey);
