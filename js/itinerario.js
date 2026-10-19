"use strict";
/* ===== Viaje del alumno (29-09-2026): ficha de la materia, enlaces de cada tema, itinerario PAU y migas =====
   Nace del estudio del viaje del usuario (docs/estudio_viaje_usuario_web.md y cuaderno: viaje_del_alumno.html) y de
   las decisiones del profesor del 29-09: nada que desplace ni duplique el contenido; en las webs del alumnado no hay
   Inicio, se entra en la ficha de la materia; y esa ficha se ordena: lista limpia de temas → la web en números →
   itinerario PAU (HF). Este módulo añade, SIN tocar la navegación ni los datos:
   1. En la ficha de la materia: la lista de temas con sus títulos (en 2.º ESO castellano, las unidades de «Clases»),
      y en HF el itinerario PAU completo, tras «Explora la materia». Retira la fila de botones curados (tools) en las
      webs de una materia.
   2. Al final de cada tema de Teoría, «Para seguir con este tema»: TODAS las tarjetas, cuestionarios, infografías,
      mapas, esquemas, lecturas, comentarios y dilemas del tema, los conceptos del glosario, y el paso al tema
      anterior/siguiente. En Tarjetas, Cuestionarios y Clases, la tira de una línea «De este tema».
   3. En cada sección de PAU, una línea con los pasos de la prueba y «estás aquí».
   4. Migas de contexto: «Inicio › Grupo › Sección» (Inicio = la ficha de la materia cuando no hay portada).
   Los temas se deducen de las claves y de mapas curados (como QUIZ_TEMA en quiz.js). Envuelve loaders globales igual
   que resume.js (window.loadX). Las colecciones son const/let de otros <script> (no cuelgan de window): se leen con
   G() (eval indirecto en el ámbito global) y guardas por si un build no trae alguna. Textos en cadenas enteras para que
   web_i18n/ui/<lang>.json los traduzca. Estilos: styles.css («Viaje del alumno»). */
(function(){
  var TXT = {
    ariaItin: "مسار الموضوع", ariaPau: "مسار PAU", ariaCrumbs: "أين أنتم", deEsteTema: "من هذا الموضوع:",
    p1: "اقرؤوا الدرس", p1clases: "تابعوا الحصص", p2: "راجعوا بالبطاقات", p3: "اختبروا أنفسكم", p4: "مراجعة بصرية",
    aqui: "أنتم هنا", siguiente: "الخطوة التالية",
    temas: "المواضيع", exploraciones: "استكشافات", unidades: "الوحدات", tema: "الموضوع {n}", unidad: "الوحدة {n}",
    seguir: "لمواصلة هذا الموضوع", tarjetas: "بطاقات", cuestionarios: "اختبارات", infografias: "إنفوغرافيك", mapas: "خرائط المفاهيم",
    esquemas: "خطاطات", lecturas: "قراءات", comentarios: "شروح النصوص", dilemas: "معضلات أخلاقية", pistas: "تلميحات متدرجة", conceptos: "المفاهيم",
    nTarjetas: "{n} بطاقات", nPreguntas: "{n} أسئلة", anterior: "الموضوع السابق", siguienteTema: "الموضوع التالي", anexos: "استكشافات", epoca: "الحقبة", epocaDe: "الحقبة: {e}", volverTema: "العودة إلى الموضوع",
    blEstudiar: "للمراجعة", blPau: "استعدّ للـ PAU", blPensar: "فكّر واكتب", blAmpliar: "تعمّق", pauBadge: "قراءة PAU",
    cronogramas: "الجداول الزمنية", disertaciones: "الإنشاء الفلسفي", comparativas: "مقارنات", polemicas: "سجالات", comunidades: "الجماعات",
    perseguidos: "المضطهَدون", duelo: "مبارزة الحجج", juegos: "ألعاب", logica: "ركن المنطق",
    videosEu: "فيديوهات بالباسكية (Ikusgela)", videoEu: "فيديو بالباسكية من Ikusgela", transcripcion: "النص المكتوب", transcripcionT: "نص الفيديو: الترجمة المكتوبة من Ikusgela", infografia: "إنفوغرافيك", mapa: "خريطة", esquema: "خطاطة", lectura: "قراءة", dilema: "معضلة", comentario: "شرح",
    pau: "مسار PAU", pauLead: "استعدوا لـ PAU بالترتيب: أولًا كيف هو الامتحان، ثم كل تمرين، وفي النهاية التدرب حسب المواضيع.",
    pau1: "كيف هو الامتحان", pau2: "التمرين 1 · شرح النص", pau3: "التمرين 2 · المقالة الفلسفية",
    pau4: "التمرين 3 · العرض", pau5: "كيف يُصحَّح", pau6: "تدرّبوا حسب المواضيع", inicio: "الرئيسية",
    s1: "الدروس", s1clases: "Clases", s2: "بطاقات", s3: "اختبار", s4: "مراجعة",
    spau1: "الامتحان", spau2: "تمرين 1 · شرح", spau3: "تمرين 2 · مقالة", spau4: "تمرين 3 · عرض", spau5: "التصحيح", spau6: "حسب المواضيع"
  };
  function t(key, vars){ return String(TXT[key] || "").replace(/\{(\w+)\}/g, function(m, k){ return vars && k in vars ? String(vars[k]) : m; }); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function strip(s){ return String(s == null ? "" : s).replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
  /* lectura de globales léxicos (const/let de otros scripts) por su nombre */
  function G(name){ try { return (0, eval)("typeof " + name + " !== 'undefined' ? " + name + " : undefined"); } catch (e){ return undefined; } }
  function coll(name){ var v = G(name); return v && typeof v === "object" ? v : null; }
  function fn(name){ var f = window[name]; return typeof f === "function" ? f : null; }
  function view(id){ return !!document.getElementById(id); }
  var SUBJ_COLOR = { fil: "var(--fil)", hf: "var(--hf)", ipc: "var(--ipc)" };
  function singleSubject(){ var S = coll("SUBJECTS"), ks = S ? Object.keys(S) : []; return ks.length === 1 ? ks[0] : null; }

  /* ---------- tema de cada recurso ----------
     Filosofía y HF: número de tema. Pensamiento crítico: clave de tema (las de QUIZ_TEMAS.ipc). */
  function temaNum(o){
    if (!o) return null;
    if (typeof o.tema === "number") return o.tema;
    var m = String(o.tema || "").match(/(?:Tema|Thème|Topic|الموضوع)\s+(\d+)|(\d+)\.\s*gaia/); return m ? +(m[1] || m[2]) : null;
  }
  var IPC_KEY = /^(?:map-)?ipc-([a-z]+)/;
  var IPC_ALIAS = { conceptos: "pensar", publicidad: "medios", prejuicios: "sesgos", moda: "huella", consumo: "huella", fastfashion: "huella", critico: "pensar", bulos: "falacias", hecho: "pensar", tecnologia: "medios", genero: "grupo", emociones: "pensar" };
  var IPC_TEMAS = ["pensar", "argumentar", "falacias", "sesgos", "dialogo", "medios", "grupo", "huella"];
  function ipcTema(key){
    var m = IPC_KEY.exec(key), k = m ? (IPC_ALIAS[m[1]] || m[1]) : null;
    if (!k){ var Q = coll("QUIZ_TEMA"); k = Q && Q[key]; }
    return IPC_TEMAS.indexOf(k) >= 0 ? k : null;
  }
  var DECK_TEMA = {
    aporias: 4, mito: 3, presocraticos: 4, sofistas: 5, kant: 19, kantPreguntas: 19, racionalismoEmpirismo: 14, historicidad: 1, metodos: 2,
    platon: 6, antropologia: 7, aristoteles: 7, etica: 8, politica: 9, helenismo: 10, medieval: 11, feRazon: 12, modernidad: 13, metafisica: 15, contrato: 16,
    utilitarismo: 17, ilustracion: 18, eticaDeber: 20, sospecha: 21, capitalismo: 22, posmodernidad: 23, analitica: 24, existencialismo: 25, beauvoir: 26, siglo21: 27,
    "fil-que-es": 1, "fil-ramas": 1, "fil-caracteristicas": 1, "fil-metodo": 1, "fil-saberes": 1, "fil-presocraticos": 1,
    "fil-ser-humano": 2, "fil-mente": 2, "fil-concepciones": 2, "fil-identidad": 2, "fil-conocer": 3, "fil-verdad": 3, "fil-metafisica": 3.5, "fil-ciencia": 3, "fil-posverdad": 3,
    "fil-logica": 4, "fil-etica": 5, "fil-helenismo": 5, "fil-politica": 6, "fil-arte": 7
  };
  var MAP_TEMA = {
    "map-descartes": 14, "map-kant": 19, "map-critica-razon-pura": 19, "map-ilustracion-modernidad": 18, "map-san-agustin": 12, "map-platon": 6,
    "map-aristoteles": 7, "map-helenismo": 10, "map-nietzsche": 23, "map-hegel": 21, "map-ideologia": 22, "map-presocraticos": 4, "map-sofistas-socrates": 5,
    "map-medieval": 11, "map-etica-clasica": 8, "map-politica-clasica": 9, "map-renacimiento": 13, "map-sustancias-modernas": 15, "map-contrato-social": 16,
    "map-utilitarismo-liberalismo": 17, "map-maestros-sospecha": 21, "map-critica-capitalismo": 22, "map-postmodernidad": 23, "map-filosofia-lenguaje": 24,
    "map-existencialismo": 25, "map-feminismo-beauvoir": 26,
    "map-filosofia-ciencia": 3, "map-ser-humano": 2, "map-conocimiento": 3, "map-racionalismo-empirismo": 3, "map-fil-que-es": 1, "map-fil-mito-logos": 1, "map-fil-cuerpo-mente": 2,
    "map-fil-logica": 4, "map-fil-etica": 5, "map-fil-politica": 6, "map-fil-estetica": 7, "map-fil-metafisica": 3.5
  };
  var IG_TEMA = { "hf-platon": 6, "hf-kant": 19, "hf-helenismo": 10, "hf-beauvoir": 26, "hf-posmodernidad": 23,
    "fil-t1": 1, "fil-ramas": 1, "fil-mito-logos": 1, "fil-t2": 2, "fil-natur-cultura": 2, "fil-cuerpo-mente": 2, "fil-t3": 3, "fil-conocer": 3, "fil-posverdad": 3,
    "fil-t4": 4, "fil-t5": 5, "fil-t6": 6, "fil-t7": 7, "fil-metafisica": 3.5 };
  var ESQ_REL = { AP: 6, AA: 7, B1: 12, BH: 14, CK: 19, CC: 21, CM: 21, CF: 21, C5A: 22, C5B: 27, CdB: 26, C8: 25, C8K: 25, C6: 23, C7: 24, C9: 26 };
  /* (07-10) temas sin número del bloque A (AP: Platón entero, AA: Aristóteles entero): van entre los temas 5 y 6
     y comparten los recursos de los temas 6 y 7. */
  var SIGLA_TEMA = { AP: 6, AA: 7, M: 3.5 }, SIGLA_ORDEN = { AP: 5.1, AA: 5.2, M: 3.5 };  /* M: metafísica de Filosofía 1.º, entre T3 y T4 */
  function esAnexo(o){ return !!o && typeof o.temaN === "number"; }
  var THEORY_EXTRA = { "fil-presocraticos": 1, "fil-comunidades-perseguidos": 1, "hf-comunidades-perseguidos": 1, "fil-helenismo": 5, "hf-descartes-makro": 14, "hf-platon-superficie": 6, "hf-descartes-simulacion": 14, "hf-platon-agustin": 11, "hf-platon-prejuicio": 6, "hf-montaigne-ensayos": 13, "hf-renacimiento-magia": 13, "fil-spinoza-sistema": 1, "fil-grandes-preguntas": 1, "fil-marxismos": 6, "hf-marxismos": 21, "hf-spinoza-sistema": 15, "hf-kant-juicios": 19, "hf-kant-poetas": 19, "hf-marx-biblioteca": 21, "hf-spinoza-universal": 15, "hf-corazon-piedra": 21, "hf-aristoteles-arabe": 12, "hf-verdad-no-contradice": 12, "hf-islam-ideas": 12, "hf-toledo-traductores": 12, "hf-judios-andalus": 12, "hf-beefs": 2, "hf-euskal-herria": 1, "fil-montaigne-ensayos": 1 };
  /* (18-10) un anexo que no está en la lista va a su tema por su temaN (antes salía suelto al principio de la ficha) */
  function extraDe(key, o){ return THEORY_EXTRA[key] || (esAnexo(o) ? o.temaN : 0); }
  /* unidades del curso de 2.º ESO («Clases») → tema */
  var CLASES_TEMA = { 1: "pensar", 2: "falacias", 3: "argumentar", 4: "falacias", 5: "falacias", 6: "medios", 7: "dialogo", 8: "sesgos", 9: "medios", 10: "pensar",
    11: "dialogo", 12: "grupo", 13: "huella", 14: "argumentar", 19: "huella", 20: "medios" };
  /* glosario de HF: la unidad del libro (código) → tema, vía QUIZ_TEMA («ltfh-<código>»); los que no tienen test en el libro, a mano */
  var GLO_UNIDAD = { A5: 5, A4: 4, "A1-A2": 1, A3: 3, DM: 14 };
  var GLO_IPC = [["pensar", "pensar"], ["argument", "argumentar"], ["falacia", "falacias"], ["sesgo", "sesgos"], ["diálogo", "dialogo"], ["dialogo", "dialogo"], ["medio", "medios"], ["publicidad", "medios"], ["grupo", "grupo"], ["huella", "huella"]];
  function gloTema(g){
    if (g.subject === "ipc"){ var tt = String(g.tema || "").toLowerCase(); for (var i = 0; i < GLO_IPC.length; i++) if (tt.indexOf(GLO_IPC[i][0]) >= 0) return GLO_IPC[i][1]; return null; }
    if (g.subject === "hf"){ var Q = coll("QUIZ_TEMA"), c = Q && Q["ltfh-" + g.unidad], m = c && String(c).match(/^T(\d+)$/); return m ? +m[1] : (GLO_UNIDAD[g.unidad] || null); }
    return temaNum(g);
  }

  function temaOf(go_, key, o){
    if (o && o.subject === "ipc") return ipcTema(key);
    switch (go_){
      case "teoria": return extraDe(key, o) || (o && o.sigla ? SIGLA_TEMA[o.sigla] || null : temaNum(o));
      case "tarjetas": return DECK_TEMA[key] || null;
      case "cuestionarios": { var Q = coll("QUIZ_TEMA"), m = Q && Q[key] && String(Q[key]).match(/^T(\d+)$/); return m ? +m[1] : (Q && Q[key] === "M" ? 3.5 : null); }
      case "mapas": return MAP_TEMA[key] || null;
      case "infografias": { var A = coll("TEMA_ALIAS"); return IG_TEMA[key] || (A && A[key]) || null; }
      case "esquemas": {
        var m1 = /^ds-([ABC])(\d+)$/.exec(key); if (m1) return m1[1] === "A" ? +m1[2] : m1[1] === "B" ? 10 + +m1[2] : 17 + +m1[2];
        if (/^FIL-M-/.test(key)) return 3.5;   /* (08-10) tema M de 1.º */
        var m2 = /^FIL-(T(\d)|PRE|HEL|TA)-/.exec(key); if (m2) return m2[2] ? +m2[2] : m2[1] === "PRE" ? 1 : m2[1] === "HEL" ? 5 : 4;
        var m3 = /^([A-Za-z0-9]+)-REL-/.exec(key); return (m3 && ESQ_REL[m3[1]]) || null;
      }
      case "lecturas": case "comentario": return temaNum(o);
    }
    return null;
  }
  var COLL = { teoria: "THEORY", tarjetas: "DECKS", cuestionarios: "QUIZZES", mapas: "MAPS", infografias: "INFOGRAFIAS", esquemas: "ESQUEMAS", lecturas: "LECTURAS", comentario: "COMENTARIO" };
  /* claves de una colección de esa materia y tema, en el orden de definición */
  function keysOf(go_, subject, tema){
    var c = coll(COLL[go_]); if (!c || !view(go_)) return [];
    var out = Object.keys(c).filter(function(k){ var o = c[k]; return o && o.subject === subject && temaOf(go_, k, o) === tema; });
    if (go_ === "cuestionarios" && fn("quizTipo")) out.sort(function(a, b){ return quizTipo(a) - quizTipo(b); });   // banco, breve, libro
    if (go_ === "tarjetas") out = out.filter(function(k){ return c[k].tipo !== "frases"; });
    return out;
  }
  function labelOf(go_, key){
    var c = coll(COLL[go_]), o = c && c[key]; if (!o) return key;
    var s = strip(o.name || o.label || o.title || key);
    /* nombres de baraja/cuestionario con prefijo de materia: «Filosofía 1.º · X» → «X» (el tema ya lo dice el bloque) */
    return s.replace(/^(Filosofía 1\.º|Filosofia 1\.º?|Pensamiento crítico|Pentsamendu kritikoa)\s*·\s*/, "").replace(/\((Filosofía 1\.º|Filosofia 1\.º?)\s*·\s*/, "(");
  }
  /* tamaño del recurso (tarjetas o preguntas) para el bloque del final del tema */
  function sizeOf(go_, key){
    var c = coll(COLL[go_]), o = c && c[key]; if (!o) return "";
    if (go_ === "tarjetas" && o.cards) return t("nTarjetas", { n: o.cards.length });
    if (go_ === "cuestionarios" && o.items) return t("nPreguntas", { n: o.items.length });
    return "";
  }

  /* ---------- itinerario de un tema ---------- */
  function sid(n){ return "S" + String(n).padStart(2, "0"); }
  function unidadesDe(tema){
    var C = G("CURSO"); if (!coll("CLASES_IDX") || !Array.isArray(C) || !view("clases")) return [];
    return C.filter(function(u){ return CLASES_TEMA[u.unidad] === tema && u.sesiones && u.sesiones.length; })
      .map(function(u){ return { go: "clases", arg: sid(u.sesiones[0].n), label: t("unidad", { n: u.unidad }) + " · " + strip(String(u.titulo).replace(/\*\*/g, "")) }; });
  }
  function items(go_, subject, tema){ return keysOf(go_, subject, tema).map(function(k){ return { go: go_, arg: k, label: labelOf(go_, k), size: sizeOf(go_, k) }; }); }
  function dilemasDe(teoriaKeys){
    var D = G("DILEMAS"), out = []; if (!Array.isArray(D) || !view("dilemas") || !teoriaKeys.length) return out;
    D.forEach(function(d){ if (d && d.debate && teoriaKeys.indexOf(d.debate.unidad) >= 0) out.push({ go: "dilemas", arg: d.id, label: strip(d.titulo) }); });
    return out;
  }
  /* (01-10) itinerarios de «Pistas» (pistas_uhs.js): cada uno declara su unidad de teoría (unidad) */
  function pistasDe(teoriaKeys){
    var P = G("PISTAS"), out = []; if (!Array.isArray(P) || !view("pistas") || !teoriaKeys.length) return out;
    P.forEach(function(p){ if (p && teoriaKeys.indexOf(p.unidad) >= 0) out.push({ go: "pistas", arg: p.id, label: strip(p.titulo) }); });
    return out;
  }
  function conceptosDe(subject, tema){
    var Gl = G("GLOSARIO"); if (!Array.isArray(Gl) || !view("glosario")) return [];
    return Gl.filter(function(g){ return g && g.subject === subject && g.t && gloTema(g) === tema; }).map(function(g){ return { t: strip(g.t), def: strip(g.def) }; });
  }
  /* (11-10) fichas de época (epocas_fichas.js, vista Ilustres): la de un tema de HF (con / con2 por temasHF) y, en
     Filosofía 1.º, las de las teorías con contenido histórico (EPOCA_FIL). Se enlazan al pie de la teoría, en la tira
     «De este tema» de Tarjetas, Cuestionarios, Lecturas e Infografías, en el Glosario y en Cronogramas. */
  var EPOCA_FIL = { "fil-presocraticos": ["ant"], "fil-spinoza-sistema": ["mod"], "fil-montaigne-ensayos": ["ren"], "fil-marxismos": ["con", "con2"], "fil-t6": ["con", "con2"], "fil-grandes-preguntas": "*" };
  function epocaFicha(subject, tema){
    var EF = G("EPOCAS_FICHAS"); if (!EF || subject !== "hf" || typeof tema !== "number") return null;
    var porTema = Object.keys(EF).filter(function(k){ return (EF[k].temasHF || []).indexOf(tema) >= 0; })[0];
    var epo = porTema || (window.Epocas && window.Epocas.epocaDeTema ? window.Epocas.epocaDeTema(tema) : null);
    return epo && EF[epo] ? epo : null;
  }
  function epocasDeTeoria(key, subject, tema){
    var EF = G("EPOCAS_FICHAS"); if (!EF || !view("ilustres")) return [];
    var m = EPOCA_FIL[key]; if (m) return (m === "*" ? Object.keys(EF) : m).filter(function(k){ return EF[k]; });
    var e = epocaFicha(subject, tema); return e ? [e] : [];
  }
  function nombreEpoca(k){ return typeof iluNombreFicha === "function" ? iluNombreFicha(k) : k; }
  function epocaItem(k){ return { go: "ilustres", arg: "epoca-" + k, label: t("epocaDe", { e: nombreEpoca(k) }) }; }
  /* pasos (para la tira de una línea de Tarjetas, Cuestionarios y Clases) */
  function itinerario(subject, tema){
    var pre = function(arr, key){ return arr.map(function(r){ r.label = t(key) + " · " + r.label; return r; }); };
    var teoria = items("teoria", subject, tema), clases = subject === "ipc" ? unidadesDe(tema) : [];
    var repaso = [].concat(pre(items("infografias", subject, tema), "infografia"), pre(items("mapas", subject, tema), "mapa"), pre(items("esquemas", subject, tema), "esquema"),
      pre(items("lecturas", subject, tema), "lectura"), pre(items("comentario", subject, tema), "comentario"), pre(dilemasDe(teoria.map(function(x){ return x.arg; })), "dilema"));
    var pasos = [];
    if (teoria.length) pasos.push({ id: "teoria", label: t("p1"), short: t("s1"), items: teoria.concat(clases) });
    else if (clases.length) pasos.push({ id: "clases", label: t("p1clases"), short: t("s1clases"), items: clases });
    var tarj = items("tarjetas", subject, tema), cues = items("cuestionarios", subject, tema);
    if (tarj.length) pasos.push({ id: "tarjetas", label: t("p2"), short: t("s2"), items: tarj });
    if (cues.length) pasos.push({ id: "cuestionarios", label: t("p3"), short: t("s3"), items: cues });
    if (repaso.length) pasos.push({ id: "repaso", label: t("p4"), short: t("s4"), items: repaso });
    return pasos;
  }
  function hereIndex(pasos, here){
    var hereIdx = -1;
    pasos.forEach(function(p, i){ if (hereIdx < 0 && p.items.some(function(x){ return x.go === here.go && (here.arg == null || String(x.arg) === String(here.arg)); })) hereIdx = i; });
    if (hereIdx < 0 && here.go) pasos.forEach(function(p, i){ if (hereIdx < 0 && p.id === here.go) hereIdx = i; });
    return hereIdx;
  }
  function btn(x, cls){ return '<button class="' + (cls || "itin-lnk") + '" type="button" data-igo="' + esc(x.go) + '" data-iarg="' + esc(x.arg) + '">' + esc(x.label) + (x.size ? ' <i>' + esc(x.size) + '</i>' : '') + '</button>'; }
  /* Tira de UNA línea «De este tema» (Tarjetas, Cuestionarios, Clases): un enlace por paso o por tipo de repaso. */
  function stripHtml(pasos, here, extra){
    var hereIdx = hereIndex(pasos, here), out = [];
    pasos.forEach(function(p, i){
      if (i === hereIdx) return;
      if (p.id === "repaso"){
        var seen = {};
        p.items.forEach(function(x){ var tipo = x.label.split(" · ")[0]; if (seen[tipo]) return; seen[tipo] = 1; out.push({ go: x.go, arg: x.arg, label: tipo }); });
      } else out.push({ go: p.items[0].go, arg: p.items[0].arg, label: (p.short || p.label) + (p.items.length > 1 ? " (" + p.items.length + ")" : "") });
    });
    if (extra) out = out.concat(extra);
    if (!out.length) return "";
    return '<div class="toolrow related-row itin-strip"><span class="flabel" style="align-self:center">' + esc(t("deEsteTema")) + '</span>' +
      out.map(function(x){ return '<button class="btn" type="button" data-igo="' + esc(x.go) + '" data-iarg="' + esc(x.arg) + '">' + esc(x.label) + '</button>'; }).join(" ") + '</div>';
  }
  /* Barra de una línea con los pasos (vistas de PAU). */
  function barHtml(pasos, here, kick, aria, color){
    var hereIdx = hereIndex(pasos, here);
    return '<nav class="itin itin-bar" style="--c:' + color + '" aria-label="' + esc(aria) + '"><span class="itin-kick">' + esc(kick) + '</span><ol class="itin-pills">' +
      pasos.map(function(p, i){
        var f = p.items[0], isHere = i === hereIdx;
        return '<li><button class="itin-pill' + (isHere ? ' here' : '') + '" type="button" data-igo="' + esc(f.go) + '" data-iarg="' + esc(f.arg) + '"' + (isHere ? ' aria-current="step"' : '') +
          ' title="' + esc(p.label) + '"><span class="itin-n" aria-hidden="true">' + (i + 1) + '</span>' + esc(p.short || p.label) + (p.items.length > 1 ? ' <i>' + p.items.length + '</i>' : '') + '</button></li>';
      }).join("") + '</ol></nav>';
  }
  /* Bloque completo de pasos (itinerario PAU en la ficha de la materia). Sin botón de arranque: el profesor no lo quiere. */
  function stepsHtml(pasos, here){
    var hereIdx = hereIndex(pasos, here);
    return '<ol class="itin-steps">' + pasos.map(function(p, i){
      var isHere = i === hereIdx;
      return '<li class="itin-step' + (isHere ? ' here' : '') + '"><span class="itin-n" aria-hidden="true">' + (i + 1) + '</span><div class="itin-body">' +
        '<span class="itin-l">' + esc(p.label) + (isHere ? ' <i class="itin-here">' + esc(t("aqui")) + '</i>' : '') + '</span>' +
        '<div class="itin-links">' + p.items.map(function(x){ return btn(x); }).join("") + '</div></div></li>';
    }).join("") + '</ol>';
  }

  /* ---------- temas de la materia, en orden ---------- */
  function temasDe(subject, conAnexos){
    var T = coll("THEORY"); if (!T || !view("teoria")) return [];
    /* (07-10) los anexos no forman parte de la secuencia «Tema anterior / siguiente»: se abren desde su tema
       y desde la lista de temas de la ficha (conAnexos) */
    var ks = Object.keys(T).filter(function(k){ return T[k].subject === subject && (conAnexos || !esAnexo(T[k])); });
    var orden = function(k){ return T[k].sigla ? SIGLA_ORDEN[T[k].sigla] || 0 : temaOf("teoria", k, T[k]) || 0; };
    if (subject !== "ipc") ks.sort(function(a, b){ return (orden(a) - orden(b)) || ((extraDe(a, T[a]) ? 1 : 0) - (extraDe(b, T[b]) ? 1 : 0)); });
    return ks;
  }

  /* ---------- navegación ---------- */
  var LOADERS = Object.assign({ disertaciones: "loadDisert", comentario: "loadComentario" }, window.VIEW_LOADERS || {});
  function go(view_, arg){
    if (!view(view_)) return;
    if (view_ === "dilemas" && fn("goRelated")) return goRelated("dilemas", arg);
    if (fn("show")) show(view_);
    if (view_ === "glosario"){   // concepto del final del tema → Glosario con el término buscado
      var inp = document.querySelector("#glosario .glosearch, #glosario input[type=search], #glosario input[type=text]");
      if (inp && arg){ inp.value = arg; try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e){} }
      return;
    }
    var f = LOADERS[view_];
    if (arg != null && arg !== "" && f && fn(f)) window[f](arg);
  }
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-igo]"); if (!b) return;
    e.preventDefault(); go(b.dataset.igo, b.dataset.iarg);
  });

  /* ---------- final de cada tema de Teoría ---------- */
  /* (12-10, rediseño Lote 3 · H0) temas de HF con lectura PAU: T6 (República VII), T14 (Discurso II-IV),
     T18 (¿Qué es la Ilustración?), T23 (Ecce Homo) y T26 (El segundo sexo). Saca la insignia «Lectura PAU». */
  var PAU_TEMAS = { 6: 1, 14: 1, 18: 1, 23: 1, 26: 1 };
  /* (18-10, P-025 · plan del agente 47, Lote A) piezas que ya existían y faltaban en la caja: cronograma (HF), modelo de
     disertación, comparativas (temas con lectura PAU), Rincón de lógica (1.º T4) y, en «Ampliar», polémicas, comunidades,
     perseguidos, debates del Duelo y juegos. Decisiones del profesor del 18-10 (docs/36): el modelo «máquina» va en el T2
     de 1.º y Rayuela en todos los temas de 1.º. Los rótulos son los del menú y los de los datos: no hay texto nuevo que traducir. */
  /* cronogramas sin unidad del libro en el código: a mano; los demás (A9, B2, B7, C5…) por su unidad, como cronoFichasHtml */
  var CRONO_TEMA = { "A1-OS": [1], "A2-OS": [2], "A-GRECIA-KRO-01": [4], "A-GRECIA-KRO-02": [5, 6], "A-GRECIA-KRO-03": [10],
    "B-MED": [11, 12], "B-REN": [13], "B-MOD": [14, 15], "B-ILU": [18], "C-XIX": [21], "B2": [12], "C5": [22] };
  function cronosDe(subject, tema){
    var C = G("CRONOGRAMAS"); if (subject !== "hf" || !Array.isArray(C) || !view("cronogramas")) return [];
    return C.filter(function(c){
      var code = String(c.code || c.id || ""), pref = Object.keys(CRONO_TEMA).filter(function(p){ return code === p || code.indexOf(p + "-") === 0; })
        .sort(function(a, b){ return b.length - a.length; })[0], ts;
      if (pref) ts = CRONO_TEMA[pref];
      else { var n = gloTema({ subject: subject, unidad: code.split("-")[0] }); ts = typeof n === "number" ? [n] : []; }   /* aquí subject es siempre "hf" (sin literal: check_builds lo tomaría por un dato de otra materia) */
      return ts.indexOf(tema) >= 0;
    }).map(function(c){ return { go: "cronogramas", arg: c.id, label: strip(c.title) }; });
  }
  var DISERT_TEMA = { "modelo-platon": [6, 9], "modelo-kant": [20], "modelo-nietzsche": [23], "modelo-medieval": [12], "modelo-descartes": [14], "modelo-beauvoir": [26],
    "fil-modelo-filosofia": [1], "fil-modelo-naturaleza": [2], "fil-modelo-maquina": [2], "fil-modelo-vidabuena": [5], "fil-modelo-justicia": [6] };
  function disertDe(subject, tema){
    var D = coll("DISERTACIONES"); if (!D || !view("disertaciones")) return [];
    return Object.keys(DISERT_TEMA).filter(function(k){ return D[k] && D[k].subject === subject && DISERT_TEMA[k].indexOf(tema) >= 0; })
      .map(function(k){ return { go: "disertaciones", arg: k, label: strip(D[k].title) }; });
  }
  function comparativasDe(subject, tema){
    var Pa = coll("PAU"); if (subject !== "hf" || !PAU_TEMAS[tema] || !Pa || !Pa["comparativas-temas"] || !view("pau")) return [];
    return [{ go: "pau", arg: "comparativas-temas", label: strip(Pa["comparativas-temas"].title) }];
  }
  /* rótulo de una sección tal como lo pone el menú (ya traducido); si no está en el menú, el de TXT */
  function navLabel(v, k){ var b = document.querySelector('#tabs [data-view="' + v + '"]'); return b ? strip(b.textContent) : t(k || v); }
  function logicaDe(subject, tema){ return subject === "fil" && tema === 4 && view("logica") ? [{ go: "logica", arg: "", label: navLabel("logica", "logica") }] : []; }
  /* polémicas, comunidades y perseguidos declaran sus temas (claves de THEORY) en «temas» */
  function porTemas(name, go_, teoriaKeys, label){
    var A = G(name); if (!Array.isArray(A) || !view(go_) || !teoriaKeys.length) return [];
    return A.filter(function(x){ return x && (x.temas || []).some(function(k){ return teoriaKeys.indexOf(k) >= 0; }); })
      .map(function(x){ return { go: go_, arg: x.id, label: label(x) }; });
  }
  /* debates del Duelo: los «pol-<id>» heredan los temas de su polémica; solo los del nivel de esta web */
  function dueloDe(subject, polIds){
    var D = G("DUELO_TEMAS"); if (!Array.isArray(D) || !view("duelo") || !polIds.length) return [];
    return D.filter(function(d){ return d && /^pol-/.test(d.id) && polIds.indexOf(d.id.slice(4)) >= 0 && (d.nivel || []).indexOf(subject) >= 0; })
      .map(function(d){ return { go: "duelo", arg: subject + "/" + d.id, label: strip(d.claim) }; });
  }
  var JUEGOS_TEMA = { hf: { 4: ["universo"], 6: ["republica", "universo"], 7: ["universo"], 8: ["eudaimonia"], 9: ["republica"], 10: ["universo"], 13: ["universo"], 15: ["leibniz"] }, fil: { 2: ["universo"], 3: ["universo"], 3.5: ["universo"], 4: ["leibniz"] } };   // (19-10) + universo
  function juegosDe(subject, tema){
    var js = ((JUEGOS_TEMA[subject] || {})[tema] || []).slice();
    if (subject === "fil") js.push("rayuela");   /* decisión del profesor (18-10): Rayuela en todos los temas de 1.º */
    return js.filter(function(v){ return view(v); }).map(function(v){ return { go: v, arg: "", label: navLabel(v, "juegos") }; });
  }
  function finHtml(subject, tema, key){
    var T = coll("THEORY"), teoria = items("teoria", subject, tema);
    var row = function(label, arr){ return arr.length ? '<div class="fin-row"><span class="fin-l">' + esc(label) + '</span><div class="fin-links">' + arr.map(function(x){ return btn(x); }).join("") + '</div></div>' : ""; };
    var cs = conceptosDe(subject, tema);
    var conceptosHtml = cs.length ? '<div class="fin-row"><span class="fin-l">' + esc(t("conceptos")) + '</span><div class="fin-links">' +
      cs.map(function(c){ return '<button class="itin-term" type="button" data-igo="glosario" data-iarg="' + esc(c.t) + '" title="' + esc(c.def) + '">' + esc(c.t) + '</button>'; }).join("") + '</div></div>' : "";
    /* (07-10) anexos de este tema: fuera de la secuencia, aquí y en el índice de temas */
    var anexosArr = !esAnexo(T[key]) ? Object.keys(T).filter(function(k){ return T[k].subject === subject && esAnexo(T[k]) && T[k].temaN === tema; })
      .map(function(k){ return { go: "teoria", arg: k, label: strip(T[k].title).replace(/^(Exploración|Esplorazioa|Exploration|Anexo|Eranskina|Annexe|Annex|Appendix)\s*-\s*/, "") }; }) : [];
    var epocaArr = epocasDeTeoria(key, subject, tema).map(function(k){ return { go: "ilustres", arg: "epoca-" + k, label: nombreEpoca(k) }; });   // (11-10) con / con2 y Filosofía 1.º
    /* (18-10) vídeos en euskera de Ikusgela del tema (videos_eu.js): enlaces externos; en euskera, con su título original */
    var V = G("VIDEOS_EU"), euWeb = (document.documentElement.lang || "").slice(0, 2) === "eu";
    var videosArr = Array.isArray(V) ? V.filter(function(v){ return (v.temas || []).indexOf(key) >= 0; }) : [];
    var videosHtml = videosArr.length ? '<div class="fin-row"><span class="fin-l">' + esc(t("videosEu")) + '</span><div class="fin-links">' +
      videosArr.map(function(v){ return '<a class="itin-lnk" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" hreflang="eu" title="' + esc(t("videoEu") + " · «" + v.eu_titulo + "»") + '">' +
        esc(euWeb ? v.eu_titulo : v.es) + ' <i>' + esc(v.dur) + '</i></a>' +
        /* (19-10) su transcripción (media/ikusgela/<id>.html, subtítulos de Ikusgela) */
        '<a class="itin-lnk" href="media/ikusgela/' + esc(v.id) + '.html" target="_blank" rel="noopener" hreflang="eu" title="' + esc(t("transcripcionT")) + '">' + esc(t("transcripcion")) + '</a>'; }).join("") + '</div></div>' : "";
    var P = { tarjetas: row(t("tarjetas"), items("tarjetas", subject, tema)), cuestionarios: row(t("cuestionarios"), items("cuestionarios", subject, tema)),
      infografias: row(t("infografias"), items("infografias", subject, tema)), mapas: row(t("mapas"), items("mapas", subject, tema)),
      esquemas: row(t("esquemas"), items("esquemas", subject, tema)), lecturas: row(t("lecturas"), items("lecturas", subject, tema)),
      comentario: row(t("comentarios"), items("comentario", subject, tema)), dilemas: row(t("dilemas"), dilemasDe(teoria.map(function(x){ return x.arg; }))),
      pistas: row(t("pistas"), pistasDe(teoria.map(function(x){ return x.arg; }))), conceptos: conceptosHtml, anexos: row(t("anexos"), anexosArr), epoca: row(t("epoca"), epocaArr), videos: videosHtml };
    /* (18-10, P-025) lo que faltaba. En «Ampliar», una fila de más de seis enlaces se pliega con su total (regla 4.7 de docs/35). */
    var rowFold = function(label, arr){ return arr.length > 6 ? '<details class="fin-row fin-fold"><summary class="fin-l">' + esc(label) + ' (' + arr.length + ')</summary><div class="fin-links">' +
      arr.map(function(x){ return btn(x); }).join("") + '</div></details>' : row(label, arr); };
    var tk = teoria.map(function(x){ return x.arg; });
    var pols = porTemas("POLEMICAS", "polemicas", tk, function(p){ return strip(p.a) + " / " + strip(p.b); });
    P.cronogramas = row(t("cronogramas"), cronosDe(subject, tema));
    P.disertaciones = row(t("disertaciones"), disertDe(subject, tema));
    P.comparativas = row(t("comparativas"), comparativasDe(subject, tema));
    P.logica = row(t("logica"), logicaDe(subject, tema));
    P.polemicas = rowFold(t("polemicas"), pols);
    P.comunidades = rowFold(t("comunidades"), porTemas("COMUNIDADES", "comunidades", tk, function(c){ return strip(c.nombre); }));
    P.perseguidos = rowFold(t("perseguidos"), porTemas("PERSEGUIDOS", "perseguidos", tk, function(c){ return strip(c.nombre); }));
    P.duelo = rowFold(t("duelo"), dueloDe(subject, pols.map(function(x){ return x.arg; })));
    P.juegos = row(t("juegos"), juegosDe(subject, tema));
    /* (12-10, rediseño Lote 3) la caja del final del tema se ordena en TRES bloques en TODOS los temas */
    var blk = function(titulo, arr){ var inner = arr.filter(Boolean).join(""); return inner ? '<div class="fin-bloque"><h3>' + esc(titulo) + '</h3>' + inner + '</div>' : ""; };
    var amp = function(titulo, arr){ var inner = arr.filter(Boolean).join(""); return inner ? '<details class="fin-bloque fin-amp"><summary>' + esc(titulo) + '</summary>' + inner + '</details>' : ""; };
    var ampComun = [P.anexos].concat(subject === "hf" ? [P.dilemas, P.pistas] : []).concat([P.polemicas, P.comunidades, P.perseguidos, P.duelo, P.juegos, P.videos]);
    var rowsHtml = blk(t("blEstudiar"), [P.tarjetas, P.cuestionarios, P.infografias, P.mapas, P.esquemas, P.conceptos, P.epoca, P.cronogramas]) +
      (subject === "hf" ? blk(t("blPau"), [P.lecturas, P.comentario, P.disertaciones, P.comparativas]) : blk(t("blPensar"), [P.lecturas, P.disertaciones, P.dilemas, P.pistas, P.logica])) +
      amp(t("blAmpliar"), ampComun);
    /* tema anterior / siguiente, en el orden de la materia; desde un anexo, solo «Volver al tema» */
    var ks = temasDe(subject), i = ks.indexOf(key), prev = i > 0 ? ks[i - 1] : null, next = i >= 0 && i < ks.length - 1 ? ks[i + 1] : null;
    if (i < 0 && esAnexo(T[key])) prev = ks.filter(function(k){ return !T[k].sigla && temaOf("teoria", k, T[k]) === tema; })[0] || null;
    var card = function(k, kick, cls){
      if (!k) return '<span class="fin-pn-empty"></span>';
      var tn = temaOf("teoria", k, T[k]), lab = (T[k].sigla ? T[k].sigla + " · " : typeof tn === "number" ? t("tema", { n: tn }) + " · " : "") + strip(T[k].title);
      return '<button class="fin-pn-card' + cls + '" type="button" data-igo="teoria" data-iarg="' + esc(k) + '"><span class="kick">' + esc(kick) + '</span><b>' + esc(lab) + '</b></button>';
    };
    if (!rowsHtml && !prev && !next) return "";
    return '<section class="itin-fin" style="--c:' + (SUBJ_COLOR[subject] || "var(--accent)") + '" aria-label="' + esc(t("seguir")) + '">' +
      (rowsHtml ? '<h2>' + esc(t("seguir")) + '</h2>' + rowsHtml : '') +
      '<div class="fin-pager">' + card(prev, "‹ " + t(i < 0 && esAnexo(T[key]) ? "volverTema" : "anterior"), "") + card(next, t("siguienteTema") + " ›", " fin-next") + '</div></section>';
  }
  function itemTema(go_, key){ var c = coll(COLL[go_]), o = c && c[key]; return o ? { subject: o.subject, tema: temaOf(go_, key, o) } : null; }
  function renderTeoria(k){
    k = String(k || "").replace(/(?:\/|§)\d+$/, "");   /* (07-10) «clave/n»: enlace a un apartado */
    var body = document.getElementById("theorybody"), tm = itemTema("teoria", k); if (!body || !tm) return;
    var rel = body.querySelector(".related-row"); if (rel) rel.remove();   // la tira antigua de la cabecera: todo va al final
    body.querySelectorAll(":scope > .itin-fin").forEach(function(o){ o.remove(); });
    if (tm.tema == null) return;
    var tmp = document.createElement("div"); tmp.innerHTML = finHtml(tm.subject, tm.tema, k);
    if (tmp.firstElementChild) body.appendChild(tmp.firstElementChild);
  }
  function renderDeck(k){
    var host = document.getElementById("itin-tarjetas"), tm = itemTema("tarjetas", k); if (!host) return;
    var pasos = tm && tm.tema != null ? itinerario(tm.subject, tm.tema) : [], ep = tm && view("ilustres") ? epocaFicha(tm.subject, tm.tema) : null;
    host.innerHTML = pasos.length > 1 || ep ? stripHtml(pasos, { go: "tarjetas", arg: k }, ep ? [epocaItem(ep)] : null) : "";
  }
  function renderQuiz(k){
    var host = document.getElementById("itin-quiz"), tm = itemTema("cuestionarios", k); if (!host) return;
    var pasos = tm && tm.tema != null ? itinerario(tm.subject, tm.tema) : [], ep = tm && view("ilustres") ? epocaFicha(tm.subject, tm.tema) : null;
    host.innerHTML = pasos.length > 1 || ep ? stripHtml(pasos, { go: "cuestionarios", arg: k }, ep ? [epocaItem(ep)] : null) : "";
  }
  function renderClase(k){
    var root = document.getElementById("clases-root"), idx = coll("CLASES_IDX"); if (!root || !idx) return;
    var key = fn("clNorm") ? clNorm(k) : k, it = key && idx[key]; if (!it) return;
    var tema = CLASES_TEMA[it.unidad]; if (!tema) return;
    var pasos = itinerario("ipc", tema); if (pasos.length < 2) return;
    root.querySelectorAll(":scope > .itin-strip").forEach(function(o){ o.remove(); });
    var tmp = document.createElement("div"); tmp.innerHTML = stripHtml(pasos, { go: "clases", arg: sid(it.u.sesiones[0].n) });
    if (tmp.firstElementChild) root.insertBefore(tmp.firstElementChild, root.querySelector(".cl-pager") || null);
  }
  function wrap(name, after){
    var orig = window[name]; if (typeof orig !== "function") return;
    window[name] = function(k){ var out = orig.apply(this, arguments); try { after(k); } catch (e){} return out; };
  }
  wrap("loadTheory", renderTeoria); wrap("loadDeck", renderDeck); wrap("loadQuiz", renderQuiz); wrap("loadClase", renderClase);

  /* ---------- itinerario PAU (Historia de la Filosofía) ---------- */
  function pauPasos(){
    /* (19-10) sin entrada en el menú (p. ej. «esqautor», Resúmenes), el título de la sección: nunca la clave cruda */
    var navLabel = function(id){ var b = document.querySelector('#tabs button[data-view="' + id + '"]'), h = document.querySelector("#" + id + " h1"); return b ? strip(b.textContent) : h ? strip(h.textContent) : ""; };
    var item = function(go_, name, key){ var c = coll(name); if (!view(go_) || !c || !c[key]) return null; return { go: go_, arg: key, label: strip(c[key].title || c[key].name || key) }; };
    var sec = function(id){ return view(id) ? { go: id, arg: "", label: navLabel(id) || id } : null; };
    var steps = [
      { id: "pau", label: t("pau1"), short: t("spau1"), items: [item("pau", "PAU", "estructura"), item("pau", "PAU", "modelos")] },
      { id: "comentario", label: t("pau2"), short: t("spau2"), items: [item("comentario", "COMENTARIO", "metodo"), item("comentario", "COMENTARIO", "consejos"), item("pau", "PAU", "ejercicio1"), sec("lecturas")] },
      { id: "disertaciones", label: t("pau3"), short: t("spau3"), items: [item("disertaciones", "DISERTACIONES", "metodologia"), item("disertaciones", "DISERTACIONES", "temas"), item("disertaciones", "DISERTACIONES", "comparativas")] },
      { id: "pau-ej3", label: t("pau4"), short: t("spau4"), items: [item("pau", "PAU", "ejercicio3"), item("pau", "PAU", "comparativas-temas")] },
      { id: "rubricas", label: t("pau5"), short: t("spau5"), items: [sec("rubricas")] },
      { id: "unidad", label: t("pau6"), short: t("spau6"), items: [sec("cuestionarios"), sec("unidad"), sec("esqautor"), sec("cronogramas")] }
    ];
    return steps.map(function(s){ s.items = s.items.filter(Boolean); return s; }).filter(function(s){ return s.items.length; });
  }
  function pauHere(id){
    var key = { pau: G("pauKey"), comentario: G("comentarioKey"), disertaciones: G("disertKey") }[id];
    return id ? { go: id, arg: key == null ? null : key } : { go: null };
  }
  function pauBar(id){ var pasos = pauPasos(); return pasos.length < 3 ? "" : barHtml(pasos, pauHere(id), t("pau"), t("ariaPau"), "var(--hf)"); }
  function pauHtml(){
    var pasos = pauPasos(); if (pasos.length < 3) return "";
    return '<nav class="itin itin-pau" style="--c:var(--hf)" aria-label="' + esc(t("ariaPau")) + '">' +
      '<div class="itin-top"><span class="itin-kick">' + esc(t("pau")) + '</span><b>' + esc(t("pauLead")) + '</b></div>' + stepsHtml(pasos, { go: null }) + '</nav>';
  }
  var PAU_VIEWS = { pau: 1, disertaciones: 1, comentario: 1, rubricas: 1, unidad: 1 };
  function mount(host, html, where){
    if (!host) return;
    host.querySelectorAll(":scope > .itin").forEach(function(o){ o.remove(); });
    if (!html) return;
    var tmp = document.createElement("div"); tmp.innerHTML = html; var el = tmp.firstElementChild;
    if (where === "start") host.insertBefore(el, host.firstChild); else if (where && where.nodeType) host.insertBefore(el, where); else host.appendChild(el);
  }
  function renderPau(id){
    var sec = document.getElementById(id); if (!sec || !PAU_VIEWS[id]) return;
    var lead = sec.querySelector(":scope > .lead");
    mount(sec, pauBar(id), lead ? lead.nextSibling : "start");
  }
  wrap("loadPau", function(){ renderPau("pau"); }); wrap("loadDisert", function(){ renderPau("disertaciones"); }); wrap("loadComentario", function(){ renderPau("comentario"); });

  /* ---------- ficha de la materia: temas → la web en números → itinerario PAU ---------- */
  function temasHtml(subject){
    var T = coll("THEORY"), ks = temasDe(subject, true), C = G("CURSO");
    if (!ks.length && subject === "ipc" && Array.isArray(C) && view("clases")){   // 2.º ESO en castellano: las unidades de «Clases»
      return '<div class="sec-head"><h2 class="sec">' + esc(t("unidades")) + '</h2></div><ol class="itin-temas" style="--c:var(--ipc)">' + C.filter(function(u){ return u.sesiones && u.sesiones.length; }).map(function(u){
        return '<li><button type="button" data-igo="clases" data-iarg="' + esc(sid(u.sesiones[0].n)) + '"><span class="temas-n">' + esc(t("unidad", { n: u.unidad })) + '</span><span class="temas-t">' + esc(strip(String(u.titulo).replace(/\*\*/g, ""))) + '</span></button></li>';
      }).join("") + '</ol>';
    }
    if (!ks.length) return "";
    /* HF: agrupada por época, con el color de Ilustres; Filosofía 1.º: por rama (js/epocas.js). Las demás, seguidas. */
    var EP = { int: "مدخل", ant: "القديمة", med: "الوسيطة", ren: "عصر النهضة", mod: "الحديثة", ilu: "الأنوار", con: "المعاصرة" };
    var RM = { ant: "الأنثروبولوجيا", con: "المعرفة", log: "المنطق", eti: "الأخلاق", pol: "السياسة", est: "علم الجمال" };
    var grpNames = null, grpAttr = "", grpOf = null;
    if (subject === "hf"){ grpNames = EP; grpAttr = "ep"; grpOf = window.Epocas ? function(n){ return window.Epocas.epocaDeTema(n); } : function(n){ return n <= 2 ? "int" : n <= 10 ? "ant" : n <= 12 ? "med" : n === 13 ? "ren" : n <= 17 ? "mod" : n <= 20 ? "ilu" : "con"; }; }
    else if (subject === "fil"){ grpNames = RM; grpAttr = "rama"; grpOf = window.Ramas ? function(n){ return window.Ramas.ramaDeTema(n); } : function(n){ return ({ 2: "ant", 3: "con", 4: "log", 5: "eti", 6: "pol", 7: "est" })[n] || null; }; }
    var groups = [], last = null;
    ks.forEach(function(k){
      var n = temaOf("teoria", k, T[k]), g = grpOf && typeof n === "number" ? grpOf(n) : "";
      if (!groups.length || last !== g){ groups.push({ g: g, ks: [] }); last = g; }
      groups[groups.length - 1].ks.push(k);
    });
    /* (18-10, orden del profesor) HF empieza por el Tema 3: la Introducción (temas 1-2) y lo que no tenga época, al final */
    if (subject === "hf") groups = groups.filter(function(gr){ return gr.g && gr.g !== "int"; }).concat(groups.filter(function(gr){ return gr.g === "int"; }), groups.filter(function(gr){ return !gr.g; }));
    return '<div class="sec-head"><h2 class="sec">' + esc(t("temas")) + '</h2></div>' + groups.map(function(gr){
      return (gr.g ? '<h3 class="temas-b" data-' + grpAttr + '="' + esc(gr.g) + '">' + esc((grpNames && grpNames[gr.g]) || gr.g) + '</h3>' : '') + '<ol class="itin-temas" style="--c:' + (SUBJ_COLOR[subject] || "var(--accent)") + '">' + (function(){
        /* (11-10) las exploraciones de cada tema van plegadas en «Exploraciones (n)», al final de lo de ese tema */
        var out = "", exp = [], ga = gr.g ? ' data-' + grpAttr + '="' + esc(gr.g) + '"' : '';
        function flush(){
          if (!exp.length) return;
          out += '<li class="temas-exp"' + ga + '><details><summary>' + esc(t("exploraciones")) + ' (' + exp.length + ')</summary><ol class="itin-temas">' + exp.join("") + '</ol></details></li>';
          exp = [];
        }
        gr.ks.forEach(function(k){
          var n = temaOf("teoria", k, T[k]), extra = !!extraDe(k, T[k]), anexo = extra && typeof T[k].temaN === "number";   /* anexos: «Exploración - …», sin «Tema N» */
          /* (12-10, rediseño Lote 1 · F4) el ampliado que ya declara su tema en el rótulo («Filosofía · Tema 1»,
             presocráticos; «Filosofía · Tema 5», helenismo) va sangrado bajo su tema y NO repite la ficha «Tema N» */
          var declaraN = extra && !anexo && temaNum(T[k]) != null;
          var li = '<li' + (extra ? ' class="temas-extra"' : '') + ga + '><button type="button" data-igo="teoria" data-iarg="' + esc(k) + '">' +
            (T[k].sigla ? '<span class="temas-n">' + esc(T[k].sigla) + '</span>' : typeof n === "number" && !anexo && !declaraN ? '<span class="temas-n">' + esc(t("tema", { n: n })) + '</span>' : '') + '<span class="temas-t">' + esc(anexo ? strip(T[k].title).replace(/^[^\s-]+ - /, "") : strip(T[k].title)) + '</span>' + (subject === "hf" && PAU_TEMAS[n] ? '<span class="temas-pau">' + esc(t("pauBadge")) + '</span>' : '') + (anexo && T[k].clase ? '<span class="temas-anexo">في القسم</span>' : '') + '</button></li>';
          if (anexo) exp.push(li);
          else { if (!extra) flush(); out += li; }
        });
        flush();
        return out;
      })() + '</ol>';
    }).join("");
  }
  ["fil", "hf", "ipc"].forEach(function(s){
    var el = document.getElementById(s); if (!el) return;
    if (singleSubject() === s) el.querySelectorAll(":scope > .toolrow").forEach(function(o){ o.remove(); });   // sin la fila de botones curados: la lista de temas la sustituye
    var tmp = document.createElement("div");
    tmp.innerHTML = temasHtml(s);
    var first = el.querySelector(":scope > .sec-head");   // «Explora la materia» (la web en números)
    [].slice.call(tmp.children).forEach(function(n){ if (first) el.insertBefore(n, first); else el.appendChild(n); });
    if (s === "hf" && view("pau")){
      tmp.innerHTML = '<div class="itin-hub">' + pauHtml() + '</div>';
      var hub = el.querySelector(".hubmap");
      if (tmp.firstElementChild){ if (hub && hub.parentNode === el) el.insertBefore(tmp.firstElementChild, hub.nextSibling); else el.appendChild(tmp.firstElementChild); }
    }
  });

  /* ---------- migas de contexto ---------- */
  var LANDING = { inicio: 1, fil: 1, hf: 1, ipc: 1 };
  function homeId(){ return view("inicio") ? "inicio" : singleSubject(); }
  function crumbs(id){
    var v = document.getElementById(id); if (!v || !v.classList.contains("view")) return;
    var old = v.querySelector(":scope > .crumbs"); if (old) old.remove();
    if (LANDING[id]) return;
    // (13-10) conmutadores: si la vista es un modo de un grupo, la miga usa la ENTRADA del grupo
    // como sección y añade el modo (p. ej. «Practicar › Cuestionarios › Contrarreloj»).
    var entry = (typeof commuteEntry === "function") ? commuteEntry(id) : id;
    var mode = (typeof commuteLabel === "function" && entry !== id) ? commuteLabel(id) : "";
    var tabId = entry;   /* la vista «teoria» se abre desde el botón «Teoría» de su materia (#hf o #fil) */
    if (entry === "teoria"){ var TT = G("THEORY"), kk = G("theoryKey"), ss = TT && kk != null && TT[kk] && TT[kk].subject;
      tabId = (ss && document.querySelector('#tabs button[data-view="' + ss + '"]')) ? ss : (["hf", "fil"].filter(function(x){ return document.querySelector('#tabs button[data-view="' + x + '"]'); })[0] || entry); }
    var btn_ = document.querySelector('#tabs button[data-view="' + tabId + '"]'), h1 = v.querySelector("h1.title, h1");
    var secLabel = btn_ ? strip(btn_.textContent) : h1 ? strip(h1.textContent) : entry;
    var grp = btn_ && btn_.closest(".navsec"), gl = grp && grp.querySelector(".navgroup") ? strip(grp.querySelector(".navgroup").textContent) : "";
    var item = mode ? "" : crumbItem(id);
    /* (12-10) sin «Inicio» (ya no existe): «Grupo › Sección › [modo o elemento abierto]» */
    var parts = [];
    if (gl) parts.push(esc(gl));
    parts.push(esc(secLabel));
    if (mode) parts.push(esc(mode));
    else if (item) parts.push(esc(item));
    var html = parts.map(function(p, i){ return '<span' + (i === parts.length - 1 ? ' aria-current="page"' : '') + '>' + p + '</span>'; }).join('<span class="crumb-sep" aria-hidden="true">›</span>');
    var nav = document.createElement("nav"); nav.className = "crumbs"; nav.setAttribute("aria-label", t("ariaCrumbs")); nav.innerHTML = html;
    v.insertBefore(nav, v.firstChild);
  }
  /* (12-10) título del elemento abierto: el tema actual en Teoría; el resto de vistas no añaden crumb */
  function crumbItem(id){
    if (id === "teoria"){
      var m = /^#teoria\/([\w-]+)/.exec(location.hash || "");   /* enlace profundo: el tema exacto, no el primero */
      var k = m ? m[1] : G("theoryKey");
      var T = G("THEORY");
      if (k != null && T && T[k]) return T[k].title;
    }
    return null;
  }
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("[data-crumb]"); if (!a) return;
    e.preventDefault(); if (fn("show")) show(a.dataset.crumb);
  });
  if (fn("show")){
    var origShow = window.show;
    window.show = function(id){ origShow.apply(this, arguments); try { crumbs(id); renderPau(id); } catch (e){}; if (id === "teoria") setTimeout(function(){ try { crumbs("teoria"); } catch (e){} }, 0); };
  }
  var active = document.querySelector(".view.active"); if (active) crumbs(active.id);

  /* arranque: las vistas ya cargaron su primer elemento antes de este envoltorio */
  try {
    if (view("teoria") && G("theoryKey") != null) renderTeoria(G("theoryKey"));
    if (G("deckKey") != null) renderDeck(G("deckKey"));
    if (G("quizKey") != null) renderQuiz(G("quizKey"));
  } catch (e){}

  window.Itinerario = { itinerario: itinerario, temaOf: temaOf, go: go, epocaFicha: epocaFicha, gloTema: gloTema, temasDe: temasDe, esAnexo: esAnexo };
})();
