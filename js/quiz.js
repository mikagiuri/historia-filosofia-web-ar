"use strict";
/* ===== Cuestionarios ===== depende de: store.js, data.js ===== */

let quizKey = Object.keys(QUIZZES)[0];
let qpos = 0, qscore = 0, qdone = false;
let quizSubject = "all";
let quizBlock = "all";
let quizTema = "all";
let quizPool = [];          // items en juego (todo el cuestionario o solo los fallados)
let quizOrder = [];         // orden barajado de índices sobre quizPool
let quizOptOrder = [];      // orden barajado de las opciones de la pregunta actual
let quizFailed = [];        // items fallados en esta partida (para «Repasar las que fallé»)
/* (10-10) rótulos como cadenas exactas: el diccionario ui/<lang>.json solo traduce cadenas completas entre comillas */
const QUIZ_TXT = { repasar: "راجِع الأسئلة التي أخطأت فيها", correcto: "صحيح.", correctaEs: "الجواب الصحيح هو" };
let quizReviewing = false;  // true si repasamos solo los fallos (no toca la mejor marca)

function quizShuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const QUIZ_SUBJECTS = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة", ipc: "التفكير النقدي" };
const QUIZ_BLOCKS = { A: "المحور A · القديمة", B: "المحور B · الوسيطة والحديثة", C: "المحور C · المعاصرة" };

/* Clasificador de temas: temas de cada materia (en orden) y tema de cada cuestionario.
   Al añadir un cuestionario a QUIZZES, añadir aquí su clave; si falta, sale en «Otros». */
const QUIZ_TEMAS = {
  fil: { T1: "ما الفلسفة؟", T2: "الإنسان", T3: "المعرفة والحقيقة", M: "La realidad (Metafísica)", T4: "المنطق والحجاج", T5: "الأخلاق", T6: "الحياة في المجتمع: السياسة", T7: "الجمال: ما الفن؟" },
  hf: { T1: "التاريخية والكونية", T2: "مناهج الفلسفة", T3: "من الأسطورة إلى اللوغوس", T4: "فلاسفة ما قبل سقراط", T5: "السفسطائيون وسقراط وأسباسيا", T6: "أفلاطون: المُثُل والجمهورية", T7: "الأنثروبولوجيا الكلاسيكية", T8: "الأخلاق الكلاسيكية", T9: "السياسة الكلاسيكية", T10: "العصر الهلنستي",
    T11: "الفلسفة في العصر الوسيط والكليات", T12: "الإيمان والعقل", T13: "عصر النهضة والثورة العلمية", T14: "العقلانية والتجريبية", T15: "الثنائية والمادية", T16: "المجتمع والسلطة: العقد الاجتماعي", T17: "مذهب المنفعة والليبرالية",
    T18: "الأنوار", T19: "كانط: النقد والميتافيزيقا", T20: "أخلاق السعادة وأخلاق الواجب", T21: "فلاسفة الارتياب", T22: "نقد الرأسمالية: من ماركس إلى رولز", T23: "نيتشه وما بعد الحداثة", T24: "الفلسفة التحليلية", T25: "الوجودية", T26: "النسوية", T27: "تحديات القرن 21" },
  ipc: { pensar: "أن نفكر بأنفسنا", argumentar: "الحجاج الجيد", falacias: "المغالطات والأخبار الزائفة", sesgos: "التحيّزات", dialogo: "الحوار", medios: "الإعلام والإعلان", grupo: "الجماعة", huella: "بصمتي على الكوكب" }
};
const QUIZ_TEMA = {
  "fil-t1": "T1", "fil-metodo-q": "T1", "fil-ramas-q": "T1", "fil-t1-banco": "T1", "fil-presocraticos-q": "T1", "fil-presocraticos-banco": "T1",
  "fil-t2": "T2", "fil-mente-q": "T2", "fil-t2-banco": "T2", "fil-t3": "T3", "fil-ciencia-q": "T3", "fil-t3-banco": "T3", "fil-metafisica": "M",
  "fil-logica-q": "T4", "fil-t4-banco": "T4", "fil-etica-q": "T5", "fil-t5-banco": "T5", "fil-helenismo-q": "T5", "fil-helenismo-banco": "T5",
  "fil-politica-q": "T6", "fil-t6-banco": "T6", "fil-t7": "T7", "fil-t7-banco": "T7",
  "hf-t1-historicidad": "T1", "hf-a01-banco": "T1", "ltfh-A1": "T1", "hf-t2-metodos": "T2", "hf-a02-banco": "T2", "hf-a03-banco": "T3",
  "preso": "T4", "hf-a04-banco": "T4", "hf25": "T5", "hf-a05-banco": "T5", "hf-a06-banco": "T6", "ltfh-AP": "T6", "ltfh-A6": "T6",
  "plat-antro": "T7", "hf-a07-banco": "T7", "ltfh-AA": "T7", "hf-a08-banco": "T8", "ltfh-A8": "T8", "hf-a09-banco": "T9", "ltfh-A9": "T9", "hf-a10-banco": "T10", "ltfh-A10": "T10",
  "hf-b11-banco": "T11", "ltfh-BHvB": "T11", "ltfh-BOC": "T11", "hf-t12-fe-razon": "T12", "hf-b12-banco": "T12", "ltfh-B1": "T12", "ltfh-BAV": "T12", "ltfh-BT": "T12",
  "hf-b13-banco": "T13", "ltfh-B3": "T13", "hf-b14-banco": "T14", "makro-descartes": "T14", "ltfh-B4": "T14", "ltfh-BD": "T14", "ltfh-BL": "T14", "ltfh-BH": "T14",
  "hf-b15-banco": "T15", "ltfh-B5": "T15", "ltfh-BS": "T15", "hf-b16-banco": "T16", "ltfh-B6": "T16", "hf-b17-banco": "T17", "ltfh-B7": "T17",
  "hf-c18-banco": "T18", "ltfh-C1": "T18", "hf-c19-banco": "T19", "ltfh-CK": "T19", "hf-t20-etica-deber": "T20", "hf-c20-banco": "T20",
  "hf-c21-banco": "T21", "ltfh-C4": "T21", "ltfh-CXIX": "T21", "ltfh-CM": "T21", "ltfh-CN": "T21", "hf-c22-banco": "T22", "ltfh-C5A": "T22",
  "hf-c23-banco": "T23", "ltfh-C6": "T23", "hf-c24-banco": "T24", "ltfh-C7": "T24", "hf-c25-banco": "T25", "ltfh-C8": "T25",
  "hf-c26-banco": "T26", "ltfh-CdB": "T26", "ltfh-C9": "T26", "hf-c27-banco": "T27", "ltfh-C10": "T27", "ltfh-C5B": "T27",
  "ipc-pensar-banco": "pensar", "ipc-hecho-q": "pensar", "ipc-argumentar-banco": "argumentar", "falacias": "falacias", "ipc-falacias-banco": "falacias", "ipc-bulos-q": "falacias",
  "ipc-sesgos-q": "sesgos", "ipc-sesgos-banco": "sesgos", "ipc-dialogo-banco": "dialogo", "ipc-medios-q": "medios", "ipc-medios-banco": "medios",
  "ipc-grupo-banco": "grupo", "ipc-huella-q": "huella", "ipc-huella-banco": "huella", "ipc-moda-q": "huella",
  /* REPASO */ "fil-t1-repaso": "T1", "fil-t2-repaso": "T2", "fil-t3-repaso": "T3", "fil-t4-repaso": "T4", "fil-t5-repaso": "T5", "fil-t6-repaso": "T6", "fil-t7-repaso": "T7", "hf-t1-repaso": "T1", "hf-t3-repaso": "T3", "hf-t4-repaso": "T4", "hf-t5-repaso": "T5", "hf-t6-repaso": "T6", "hf-t7-repaso": "T7", "hf-t8-repaso": "T8", "hf-t9-repaso": "T9", "hf-t10-repaso": "T10", "hf-t11-repaso": "T11", "hf-t12-repaso": "T12", "hf-t13-repaso": "T13", "hf-t14-repaso": "T14", "hf-t15-repaso": "T15", "hf-t16-repaso": "T16", "hf-t17-repaso": "T17", "hf-t18-repaso": "T18", "hf-t19-repaso": "T19", "hf-t20-repaso": "T20", "hf-t21-repaso": "T21", "hf-t22-repaso": "T22", "hf-t23-repaso": "T23", "hf-t24-repaso": "T24", "hf-t25-repaso": "T25", "hf-t26-repaso": "T26", "hf-t27-repaso": "T27"
};
/* Orden dentro de un tema: banco ampliado, cuestionario breve, libro, léxico. */
function quizTipo(k){ return /-banco$/.test(k) ? 0 : /^ltfh-/.test(k) ? 2 : /^lex-/.test(k) ? 3 : 1; }

/* ===== Test de léxico (05-10) =====
   Un cuestionario por tema generado del glosario (GLOSARIO, glosario.js; se carga después de este
   archivo, por eso se monta en DOMContentLoaded). Cada partida saca preguntas nuevas, en las dos
   direcciones (definición → término y término → definición), con distractores del mismo tema y, si
   no llegan, de su bloque o materia. Se tapa el término en su definición y no se usan como distractor
   variantes del mismo término (arché / arjé, átomo / átomos). Idea tomada del Gem LéxicoSofía. */
const LEX_MIN = 5, LEX_N = 10;
const LEX_NAME = "معجم · {tema}";
const LEX_Q_TERM = "أي مصطلح يوافق هذا التعريف؟";
const LEX_Q_DEF = "ماذا تعني «{t}»؟";
/* unidades del glosario de HF sin cuestionario del libro (las demás: QUIZ_TEMA["ltfh-" + unidad]) */
const LEX_UNIDAD = { "A1-A2": "T1", A3: "T3", A4: "T4", A5: "T5", DM: "T14" };
/* temas de Pensamiento crítico por el nombre del glosario, en castellano y en euskera */
const LEX_IPC = [["pensar", /pensar|pentsatu/i], ["argumentar", /argument|argudi/i], ["falacias", /falac|faltsu/i], ["sesgos", /sesgo|alborap/i],
  ["dialogo", /di[aá]logo|elkarrizk/i], ["medios", /medios|hedabide/i], ["huella", /huella|aztarna/i], ["grupo", /grupo|taldea/i]];
const LEX = {};   // clave → { terms: términos del tema, extra: resto del bloque o la materia }

const lexFold = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
/* esqueleto para comparar términos: sin tildes, plural ni grafías griegas alternativas */
const lexSkel = s => lexFold(s).replace(/ch|kh/g, "j").replace(/ph/g, "f").replace(/th/g, "t").replace(/y/g, "i").replace(/k/g, "c").replace(/s\b/g, "");
const lexClean = s => String(s || "").replace(/\*\*/g, "");
/* tapa en un texto las palabras del término (o de su misma familia: idealismo → ideal…) */
function lexMask(text, term){
  const stems = lexFold(term).split(" ").filter(w => w.length >= 4).map(w => w.slice(0, Math.max(4, Math.ceil(w.length * 0.6))));   // participación → particip(ar)
  if (!stems.length) return text;
  return text.replace(/[\p{L}\p{N}]+/gu, w => stems.some(s => lexFold(w).startsWith(s)) ? "___" : w);
}
function lexTemaDe(g){
  if (g.subject === "hf"){ const t = LEX_UNIDAD[g.unidad] || QUIZ_TEMA["ltfh-" + g.unidad]; return t ? { id: t } : null; }
  if (g.subject === "fil" && /· M$/.test(g.tema || "")) return { id: "M" };   // (08-10) tema M (metafísica), sin número
  if (g.subject === "fil"){ const m = /(\d+)/.exec(g.tema || ""); return { id: m ? "T" + m[1] : "T4" }; }   // sin número: el taller de argumentación (tema 4)
  const hit = LEX_IPC.find(([, re]) => re.test(g.tema || ""));
  return { id: hit ? hit[0] : "otros", etq: String(g.tema || "").split(" · ").pop() };
}
function lexUnicos(list){ const seen = new Set(); return list.filter(g => { const s = lexSkel(g.t); if (seen.has(s)) return false; seen.add(s); return true; }); }
/* Casos trampa (GLOSARIO_TRAMPAS, glosario.js): si el término preguntado tiene pareja en su tema, la pareja
   va siempre entre las opciones y la explicación da las dos definiciones. Cada partida incluye hasta
   LEX_TRAMPAS_N de ellas (en orden barajado); el resto, al azar. */
const LEX_TRAMPA = "حالة فخ:", LEX_TRAMPAS_N = 2;
function lexPareja(L, g){ const s = L.pairs.get(lexSkel(g.t)); return s ? L.terms.find(c => lexSkel(c.t) === s) : null; }
function lexItems(k){
  const L = LEX[k], items = [];
  const conPareja = quizShuffle(L.terms.filter(g => lexPareja(L, g))).slice(0, LEX_TRAMPAS_N);
  const targets = conPareja.concat(quizShuffle(L.terms.filter(g => !conPareja.includes(g)))).slice(0, LEX_N);
  for (const g of targets){
    const ok = c => c !== g && lexSkel(c.t) !== lexSkel(g.t) && lexFold(c.def) !== lexFold(g.def);
    const par = lexPareja(L, g);
    const dis = (par ? [par] : []).concat(quizShuffle(L.terms.filter(c => ok(c) && c !== par)), quizShuffle(L.extra.filter(ok))).slice(0, 3);
    if (dis.length < 3) continue;
    const def = lexClean(g.def), pre = par ? LEX_TRAMPA + " " : "";
    const fb = "<b>" + g.t + "</b>: " + def + (par ? "<br><b>" + par.t + "</b>: " + lexClean(par.def) : "");
    if (Math.random() < 0.5) items.push({ q: pre + LEX_Q_TERM + "<br>«" + lexMask(def, g.t) + "»", o: [g.t].concat(dis.map(c => c.t)), a: 0, fb });
    else items.push({ q: pre + LEX_Q_DEF.replace("{t}", g.t), o: [def].concat(dis.map(c => lexClean(c.def))).map(d => lexMask(d, g.t)), a: 0, fb });
  }
  return items;
}
function lexMontar(){
  if (typeof GLOSARIO === "undefined" || !Array.isArray(GLOSARIO)) return;
  const grupos = {};
  GLOSARIO.forEach(g => {
    if (!g.t || !g.def || !QUIZ_TEMAS[g.subject]) return;
    const tema = lexTemaDe(g); if (!tema) return;
    const k = "lex-" + g.subject + "-" + (tema.id === "otros" ? lexFold(tema.etq).replace(/ /g, "-") : tema.id);
    (grupos[k] = grupos[k] || { subject: g.subject, block: g.bloque, tema: tema.id, etq: tema.etq, terms: [] }).terms.push(g);
  });
  Object.entries(grupos).forEach(([k, gr]) => {
    const terms = lexUnicos(gr.terms);
    if (terms.length < LEX_MIN) return;
    const extra = lexUnicos(GLOSARIO.filter(g => g.subject === gr.subject && g.t && g.def && (gr.subject !== "hf" || g.bloque === gr.block) && !gr.terms.includes(g)));
    const pairs = new Map(), skels = new Set(terms.map(g => lexSkel(g.t)));
    const tr = typeof GLOSARIO_TRAMPAS !== "undefined" ? GLOSARIO_TRAMPAS[gr.subject] || [] : [];
    tr.forEach(([a, b]) => { const sa = lexSkel(a), sb = lexSkel(b); if (skels.has(sa) && skels.has(sb)){ if (!pairs.has(sa)) pairs.set(sa, sb); if (!pairs.has(sb)) pairs.set(sb, sa); } });
    LEX[k] = { terms, extra, pairs };
    const etq = gr.tema === "otros" ? gr.etq : QUIZ_TEMAS[gr.subject][gr.tema];
    QUIZZES[k] = { name: LEX_NAME.replace("{tema}", etq), subject: gr.subject, block: gr.block, lex: true, items: lexItems(k) };
    if (gr.tema !== "otros") QUIZ_TEMA[k] = gr.tema;
  });
}
function quizTemaDe(k){ const m = QUIZ_TEMAS[QUIZZES[k].subject] || {}; return m[QUIZ_TEMA[k]] ? QUIZ_TEMA[k] : "otros"; }
function quizEnFiltro(k, q, conTema){
  if (quizSubject !== "all" && q.subject !== quizSubject) return false;
  if (quizSubject === "hf" && quizBlock !== "all" && q.block !== quizBlock) return false;
  if (quizBlock !== "all" && window.Epocas && window.Epocas.soloTodos("cuestionarios", k)) return false;   // (30-09) temas 1-2 de HF: solo con «Todos los bloques» (epocas.js)
  if (conTema && quizTema !== "all" && quizTemaDe(k) !== quizTema) return false;
  return true;
}
/* Temas con algún cuestionario en la materia (y el bloque) elegidos, en el orden de QUIZ_TEMAS. */
function quizTemasVisibles(){
  const hay = new Set(Object.entries(QUIZZES).filter(([k, q]) => quizEnFiltro(k, q, false)).map(([k]) => quizTemaDe(k)));
  return Object.keys(QUIZ_TEMAS[quizSubject] || {}).concat("otros").filter(t => hay.has(t));
}
function quizTemaEtq(t){ return t === "otros" ? "أخرى" : (QUIZ_TEMAS[quizSubject] || {})[t] || t; }
const quizTemaNum = t => /^T\d+$/.test(t);

function renderQuizFilter(){
  const box = document.getElementById("quizfilter");
  const subjBtns = ["all", "fil", "hf", "ipc"].map(s =>
    '<button class="fbtn" data-subj="' + s + '" aria-pressed="' + (s === quizSubject) + '">' +
    (s === "all" ? "الكل" : QUIZ_SUBJECTS[s]) + '</button>'
  ).join("");
  let blockBtns = "";
  if (quizSubject === "hf"){
    blockBtns = ["all", "A", "B", "C"].map(b =>
      '<button class="fbtn" data-block="' + b + '" aria-pressed="' + (b === quizBlock) + '">' +
      (b === "all" ? "كل المحاور" : QUIZ_BLOCKS[b]) + '</button>'
    ).join("");
  }
  let temaBtns = "";
  if (quizSubject !== "all"){
    const temas = quizTemasVisibles();
    if (!temas.includes(quizTema)) quizTema = "all";
    temaBtns = ["all"].concat(temas).map(t =>
      '<button class="fbtn" data-tema="' + t + '" aria-pressed="' + (t === quizTema) + '" title="' + (t === "all" ? "Todos los temas" : quizTemaEtq(t)) + '">' +
      (t === "all" ? "الكل" : quizTemaNum(t) ? t : quizTemaEtq(t)) + '</button>'
    ).join("");
  }
  box.innerHTML = '<div class="fgroup"><span class="flabel">المادة</span>' + subjBtns + '</div>' +
    (blockBtns ? '<div class="fgroup"><span class="flabel">المحور</span>' + blockBtns + '</div>' : '') +
    (temaBtns ? '<div class="fgroup"><span class="flabel">الموضوع</span>' + temaBtns + '</div>' : '');
  box.querySelectorAll("[data-subj]").forEach(b => b.addEventListener("click", () => {
    quizSubject = b.dataset.subj;
    if (quizSubject !== "hf") quizBlock = "all";
    quizTema = "all";
    renderQuizFilter();
    renderQuizChips();
  }));
  box.querySelectorAll("[data-block]").forEach(b => b.addEventListener("click", () => {
    quizBlock = b.dataset.block;
    quizTema = "all";
    renderQuizFilter();
    renderQuizChips();
  }));
  box.querySelectorAll("[data-tema]").forEach(b => b.addEventListener("click", () => {
    quizTema = b.dataset.tema;
    renderQuizFilter();
    renderQuizChips();
  }));
}

function renderQuizChips(){
  const box = document.getElementById("quizchips");
  const entries = Object.entries(QUIZZES).filter(([k, q]) => quizEnFiltro(k, q, true));
  const chip = ([k, q]) => `<button class="chip" data-quiz="${k}" aria-pressed="${k === quizKey}">${q.name}</button>`;
  if (quizSubject === "all") box.innerHTML = entries.map(chip).join("");
  else {
    /* agrupados por tema, con su título; dentro de cada tema: banco ampliado, breve, libro */
    box.innerHTML = quizTemasVisibles().filter(t => quizTema === "all" || t === quizTema).map(t => {
      const del = entries.filter(([k]) => quizTemaDe(k) === t).sort((a, b) => quizTipo(a[0]) - quizTipo(b[0]));
      return del.length ? '<div class="quiz-tema"><span class="flabel">' + (quizTemaNum(t) ? t + " · " : "") + quizTemaEtq(t) + '</span><div class="quiz-tema-chips">' + del.map(chip).join("") + '</div></div>' : "";
    }).join("");
  }
  box.querySelectorAll("[data-quiz]").forEach(b => b.addEventListener("click", () => loadQuiz(b.dataset.quiz)));
}

function loadQuiz(k){ quizKey = k;
  if (quizBlock !== "all" && window.Epocas && window.Epocas.soloTodos("cuestionarios", k)){ quizBlock = "all"; if (document.getElementById("quizfilter")) renderQuizFilter(); } quizReviewing = false; quizPool = QUIZZES[k].lex ? (QUIZZES[k].items = lexItems(k)) : QUIZZES[k].items; renderQuizChips(); startQuizRun(); }
function startQuizRun(){ qpos = 0; qscore = 0; qdone = false; quizFailed = []; quizOrder = quizShuffle(quizPool.map((_, i) => i)); drawQuiz(); }

function drawQuiz(){
  const quiz = QUIZZES[quizKey], box = document.getElementById("quizbox");

  if (qdone){
    const total = quizPool.length;
    let bestLine = "";
    if (!quizReviewing){
      const bestMap = store.get("aula-best", {});
      const prevBest = bestMap[quizKey] || 0;
      if (qscore > prevBest){ bestMap[quizKey] = qscore; store.set("aula-best", bestMap); }
      bestLine = `<p class="best">أفضل نتيجة في هذا المتصفح: ${Math.max(prevBest, qscore)} / ${total}</p>`;
    }
    const reviewBtn = quizFailed.length
      ? `<button class="btn" id="qreview">${QUIZ_TXT.repasar} (${quizFailed.length})</button>` : "";
    box.innerHTML = `<div class="q-result"><p class="eyebrow">${quizReviewing ? "مراجعة" : "النتيجة"}</p>
      <div class="big">${qscore} / ${total}</div>
      ${bestLine}
      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn" id="qretry">إعادة</button>${reviewBtn}</div></div>`;
    document.getElementById("qretry").addEventListener("click", () => loadQuiz(quizKey));
    const rv = document.getElementById("qreview");
    if (rv) rv.addEventListener("click", () => { const fails = quizFailed.slice(); quizReviewing = true; quizPool = fails; startQuizRun(); });
    return;
  }

  const total = quizPool.length;
  const it = quizPool[quizOrder[qpos]];
  quizOptOrder = quizShuffle(it.o.map((_, i) => i));
  box.innerHTML = `<div class="q-top"><span>السؤال ${qpos + 1} من ${total}</span><span class="score">الإجابات الصحيحة: ${qscore}</span></div>
    <div class="q-card">
      <div class="q-num">${quiz.name}</div>
      <p class="q-text">${it.q}</p>
      <div class="opts" id="opts">${quizOptOrder.map((orig, disp) => `<button class="opt" data-i="${orig}"><span class="k">${"ABCD"[disp]}</span><span>${it.o[orig]}</span></button>`).join("")}</div>
      <div class="fb" id="fb" role="status" aria-live="polite"></div>
      <div class="q-foot"><button class="btn hide" id="qnext">${qpos === total - 1 ? "عرض النتيجة" : "التالي ←"}</button></div>
    </div>`;

  const opts = [...box.querySelectorAll(".opt")];
  const correctBtn = opts.find(o => +o.dataset.i === it.a);
  const correctLetter = "ABCD"[quizOptOrder.indexOf(it.a)];
  opts.forEach(op => op.addEventListener("click", () => {
    const i = +op.dataset.i;
    opts.forEach(o => { o.disabled = true; o.classList.add("dim"); });
    op.classList.remove("dim");
    if (i === it.a){ op.classList.add("correct"); qscore++; }
    else { op.classList.add("wrong"); if (correctBtn){ correctBtn.classList.remove("dim"); correctBtn.classList.add("correct"); } quizFailed.push(it); }
    const fb = document.getElementById("fb");
    fb.innerHTML = "<b>" + (i === it.a ? QUIZ_TXT.correcto + " " : QUIZ_TXT.correctaEs + " " + correctLetter + ". ") + "</b>" + it.fb;
    fb.classList.add("show");
    document.getElementById("qnext").classList.remove("hide");
  }));

  document.getElementById("qnext").addEventListener("click", () => {
    if (qpos === quizPool.length - 1){ qdone = true; } else { qpos++; }
    drawQuiz();
  });
}

renderQuizFilter();
loadQuiz(quizKey);
/* los tests de léxico, cuando ya está el glosario (antes del enrutado de app.js, que también espera a DOMContentLoaded) */
document.addEventListener("DOMContentLoaded", () => { lexMontar(); renderQuizFilter(); renderQuizChips(); });
