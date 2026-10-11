"use strict";
/* ===== Rincón de lógica · «Lógica moderna»: Formalizar y Reglas de inferencia (12-10-2026) =====
   Petición del profesor: el Rincón tenía lógica proposicional (tablas de verdad, puertas) pero sin pestaña de lógica
   moderna. Las pestañas de arriba pasan a ser «Lógica clásica» (silogismos, cuadrado, conjuntos) y «Lógica moderna»
   (tablas de verdad, formalizar, reglas de inferencia, cuantificadores, puertas lógicas); ver logRender en logicaview.js.
   · Cuantificadores: A, E, I, O en lógica de predicados, un «mundo pequeño» para evaluarlas (sujeto vacío incluido) y
     un ejercicio de elegir la fórmula de cada frase.
   · Formalizar: frases en castellano que el alumno pasa a fórmula con el teclado de conectivas; se corrige por
     EQUIVALENCIA (misma tabla de verdad), así que vale cualquier forma correcta, y si no lo es se enseña la fila en
     que difieren. Cada frase trae su pista y su caso trampa («solo si», «a menos que», «o… o…», «ni… ni…»).
   · Reglas de inferencia: las reglas válidas y las falacias formales que se les parecen, con su forma, un ejemplo y
     un botón para comprobarlas en la tabla de verdad; y un ejercicio «¿regla o trampa?» con argumentos en castellano.
   Usa las funciones de logicaview.js (logParse, logVars, logFilas, logEval, logStr, logEsc, logTeclado, LOG).
   Textos en LOGM_TXT y en los datos de abajo: cadenas enteras, que traduce el diccionario de interfaz (ui/<lang>.json). */
const LOGM_TXT = {
  tabClasica: "المنطق الكلاسيكي", tabModerna: "المنطق الحديث", tabFormalizar: "الصورنة", tabInferencia: "قواعد الاستدلال",
  introFormalizar: "الصورنة هي ترجمة جملة إلى رموز: كل جملة بسيطة حرف (p, q, r…)، والكلمات التي تربط بينها («لا»، «و»، «أو»، «إذا… فـ…») روابط منطقية. اكتبوا الصيغة بلوحة المفاتيح وانقروا على «تحقّقوا»: تُقبل أي صيغة مكافئة، لأن البرنامج يقارن جدول صدقها بجدول صدق الحل.",
  introInferencia: "قاعدة الاستدلال طريقة في الاستدلال لا تخطئ أبدًا: إذا كانت المقدمات صادقة، فالنتيجة صادقة أيضًا. بعض الصور تشبهها كثيرًا، لكنها ليست صحيحة: إنها المغالطات الصورية. تجدون هنا الاثنين، مع مثال لكل واحدة، وتمرينًا للتمييز بينهما.",
  guiaTitF: "كيف تُترجم كل كلمة",
  guiaF: "<ul><li><b>¬</b> (النفي): «لا»، «ليس صحيحًا أنّ»، «من الخطأ أنّ».</li><li><b>∧</b> (الوصل): «و»، «لكنّ»، «مع أنّ»، «ومع ذلك»، «فضلًا عن ذلك». كلها تقول الشيء نفسه في المنطق: أن الأمرين صادقان.</li><li><b>∨</b> (الفصل): «أو». في المنطق هو فصل شامل (هذا، أو ذاك، أو الاثنان معًا)؛ وإذا كانت الجملة تستبعد الاثنين معًا («إمّا… وإمّا…، لكن ليس الاثنين»)، يجب إضافة ذلك.</li><li><b>→</b> (إذا… فـ…): «إذا p فـ q»، «q إذا p»، «عندما p، q»، «كلما p، q»، «يكفي p لكي q» (p شرط <i>كافٍ</i>).</li><li><b>حالة فخّ</b>: «p فقط إذا q» و«لكي p يلزم q» تُكتبان <b>p → q</b>: q شرط <i>لازم</i>، لا شرط كافٍ.</li><li><b>↔</b> (إذا وفقط إذا): «p إذا وفقط إذا q»، «p عندما وفقط عندما q».</li><li><b>فخاخ أخرى</b>: «لا p ولا q» هي ¬p ∧ ¬q؛ «p ما لم q» هي ¬q → p (أو، وهو الشيء نفسه، p ∨ q).</li><li><b>«إذن» ليست رابطًا</b>: «أنا أفكر، إذن أنا موجود» لا تقول «إذا كنت أفكر فأنا موجود»، بل <i>تستخلص</i> نتيجة من مقدمة. هذه حجة، وتُدرس في «قواعد الاستدلال».</li></ul>",
  diccionario: "القاموس:", tuFormula: "صيغتكم", comprobar: "تحقّقوا", solucion: "عرض الحل", pista: "تلميح",
  bien: "صحيح! صيغتكم مكافئة للحل: {s}", mal: "ليست مكافئة. مثلًا، عندما {fila}، تعطي صيغتكم {a} وتقول الجملة {b}.",
  verdadero: "صادق", falso: "كاذب", vacia: "اكتبوا صيغة.", sol: "الحل: {s}", ejercicio: "الجملة {n} من {m}",
  validas: "القواعد الصحيحة", falacias: "المغالطات الصورية (ليست صحيحة)", forma: "الصورة", ejemplo: "مثال", porQue: "لماذا تفشل",
  verTabla: "تحقّقوا منها في جدول الصدق", ejTit: "قاعدة أم فخّ؟", ejAyuda: "اقرؤوا كل حجة واختاروا صورتها. لا توجد علامة: المهم هو أن تفهموا السبب.",
  acierto: "أحسنتم! إنها {r}.", fallo: "No: es {r}.", formaArg: "صورتها: {f}"
};
const logmT = (k, v) => String(LOGM_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));

/* ---------- Formalizar ---------- */
const LOGM_FZ = [
  { f: "إذا أمطرت، تبتلّ الأرض.", d: [["p", "تمطر"], ["q", "تبتلّ الأرض"]], s: "p → q", pista: "«إذا p فـ q»: ما يأتي بعد «إذا» هو المقدَّم." },
  { f: "إنها تمطر ولا أحمل مظلة.", d: [["p", "تمطر"], ["q", "أحمل مظلة"]], s: "p ∧ ¬q", pista: "الحرف يمثّل الجملة المثبتة؛ و«لا» تُكتب بالرمز ¬." },
  { f: "إذا أمطرت ولم أحمل مظلة، أبتلّ.", d: [["p", "تمطر"], ["q", "أحمل مظلة"], ["r", "أبتلّ"]], s: "(p ∧ ¬q) → r", pista: "أولًا المقدَّم كاملًا بين قوسين؛ ثم السهم." },
  { f: "لا أدرس ولا أعمل.", d: [["p", "أدرس"], ["q", "أعمل"]], s: "¬p ∧ ¬q", pista: "«لا… ولا…» تنفي الأمرين معًا." },
  { f: "سأذهب في الرحلة فقط إذا لم تمطر.", d: [["p", "أذهب في الرحلة"], ["q", "تمطر"]], s: "p → ¬q", pista: "حالة فخّ: «فقط إذا» تُدخل الشرط اللازم، وهو يأتي بعد السهم." },
  { f: "لكي تصوّت، يلزم أن تكون بالغًا سنّ الرشد.", d: [["p", "تصوّت"], ["q", "أنت بالغ سنّ الرشد"]], s: "p → q", pista: "إذا كنت تصوّت، فأنت بالغ سنّ الرشد؛ لكن بلوغ سنّ الرشد لا يكفي للتصويت." },
  { f: "يكفي أن تضغط على الزر لكي يضيء المصباح.", d: [["p", "تضغط على الزر"], ["q", "يضيء المصباح"]], s: "p → q", pista: "«يكفي p» تعني أن p شرط كافٍ: يأتي قبل السهم." },
  { f: "سنخرج ما لم تمطر.", d: [["p", "نخرج"], ["q", "تمطر"]], s: "¬q → p", pista: "حالة فخّ: «p ما لم q» تعني «إذا لم q، فـ p»." },
  { f: "سأتصل بك إذا وفقط إذا تأخرت.", d: [["p", "أتصل بك"], ["q", "تتأخر"]], s: "p ↔ q", pista: "«إذا وفقط إذا» تجمع شرطيتين: p → q وq → p." },
  { f: "إمّا أن تدرس وإمّا أن تعمل، لكن ليس الأمرين معًا.", d: [["p", "تدرس"], ["q", "تعمل"]], s: "(p ∨ q) ∧ ¬(p ∧ q)", pista: "حالة فخّ: «أو» المنطقية فصل شامل؛ وهنا يجب أن نضيف أن الأمرين لا يقعان معًا." },
  { f: "ليس صحيحًا أنه إذا أمطرت، تُلغى المباراة.", d: [["p", "تمطر"], ["q", "تُلغى المباراة"]], s: "¬(p → q)", pista: "«ليس صحيحًا أنّ» تنفي الشرطية كلها: تأتي قبل القوس." },
  { f: "أبيقور: «حين نكون موجودين، لا يكون الموت موجودًا؛ وحين يكون الموت موجودًا، لا نكون نحن موجودين».", d: [["p", "نحن موجودون"], ["q", "الموت موجود"]], s: "(p → ¬q) ∧ (q → ¬p)", pista: "هما شرطيتان تجمع بينهما «و». (رسالة إلى مينيكيوس، 125.)" }
];
function logmEquiv(a, b){
  const vars = logVars([a, b]);
  return logFilas(vars).find(v => logEval(a, v) !== logEval(b, v)) || null;
}
function logmFzRes(i){
  const z = LOGM_FZ[i], st = LOG.fz[i] || {};
  if (st.sol) return '<p class="lg-nota">' + logmT("sol", { s: logEsc(z.s) }) + "</p>";
  if (!st.hecho) return "";
  if (!String(st.f || "").trim()) return '<p class="lg-error">' + logmT("vacia") + "</p>";
  try {
    const a = logParse(st.f), b = logParse(z.s), dif = logmEquiv(a, b);
    if (!dif) return '<p class="lg-veredicto lg-tautologia">' + logmT("bien", { s: logEsc(z.s) }) + "</p>";
    const fila = Object.keys(dif).map(x => x + " = " + (dif[x] ? "V" : "F")).join(", ");
    return '<p class="lg-veredicto lg-contradiccion">' + logmT("mal", { fila, a: logmT(logEval(a, dif) ? "صادق" : "كاذب"), b: logmT(logEval(b, dif) ? "صادق" : "كاذب") }) +
      '</p><p class="lg-nota"><b>' + logmT("pista") + ":</b> " + logEsc(z.pista) + "</p>";
  } catch (err){ return '<p class="lg-error">' + logEsc(err.message) + "</p>"; }
}
function logRenderFormalizar(){
  const N = LOGM_FZ.length;
  return '<details class="lg-guia"><summary>' + logmT("guiaTitF") + "</summary>" + logmT("guiaF") + "</details>" +
    LOGM_FZ.map((z, i) => {
      const st = LOG.fz[i] || {};
      return '<div class="lg-panel lg-fz" id="lg-fz-' + i + '"><p class="lg-nota">' + logmT("ejercicio", { n: i + 1, m: N }) + '</p><p class="lg-fz-frase">' + logEsc(z.f) + "</p>" +
        '<p class="lg-nota">' + logmT("diccionario") + " " + z.d.map(([l, t]) => "<b>" + l + "</b> = " + logEsc(t)).join(" · ") + "</p>" +
        '<label class="lg-label" for="lg-fzi-' + i + '">' + logmT("tuFormula") + '</label><div class="lg-fila"><input id="lg-fzi-' + i + '" class="lg-input" data-fz="' + i + '" value="' + logEsc(st.f || "") + '" autocomplete="off" spellcheck="false">' +
        '<button type="button" class="btn" data-fzok="' + i + '">' + logmT("comprobar") + '</button></div>' + logTeclado("lg-fzi-" + i) +
        '<p><button type="button" class="btn ghost" data-fzsol="' + i + '">' + logmT("solucion") + '</button></p><div id="lg-fzr-' + i + '">' + logmFzRes(i) + "</div></div>";
    }).join("");
}

/* ---------- Reglas de inferencia ---------- */
const LOGM_REGLAS = [
  { k: "mp", n: "Modus ponens (إثبات المقدَّم)", p: "p → q; p", c: "q", ej: "إذا أمطرت، تبتلّ الأرض. إنها تمطر. إذن تبتلّ الأرض." },
  { k: "mt", n: "Modus tollens (نفي التالي)", p: "p → q; ¬q", c: "¬p", ej: "إذا أمطرت، تبتلّ الأرض. الأرض ليست مبتلّة. إذن لا تمطر." },
  { k: "sh", n: "القياس الشرطي", p: "p → q; q → r", c: "p → r", ej: "إذا درست، أنجح؛ وإذا نجحت، أسافر. إذن، إذا درست، أسافر." },
  { k: "sd", n: "القياس الفصلي", p: "p ∨ q; ¬p", c: "q", ej: "إمّا أنه في البيت وإمّا أنه في القسم. ليس في البيت. إذن هو في القسم." },
  { k: "dc", n: "المعضلة البنّاءة", p: "p → r; q → r; p ∨ q", c: "r", ej: "إذا ذهبت بالقطار، تصل متأخرًا؛ وإذا ذهبت بالحافلة، تصل متأخرًا أيضًا. ستذهب بالقطار أو بالحافلة. إذن ستصل متأخرًا." }
];
const LOGM_FALACIAS = [
  { k: "ac", n: "إثبات التالي", p: "p → q; q", c: "p", ej: "إذا أمطرت، تبتلّ الأرض. الأرض مبتلّة. إذن أمطرت.", por: "قد تكون الأرض مبتلّة لسبب آخر: سقاها أحدهم. الشرط الكافي ليس الشرط الوحيد الممكن." },
  { k: "na", n: "نفي المقدَّم", p: "p → q; ¬p", c: "¬q", ej: "إذا درستَ، تنجح. لم تدرس. إذن لن تنجح.", por: "القاعدة لا تقول ماذا يحدث إذا لم تدرس: ربما تنجح لسبب آخر." },
  { k: "ad", n: "إثبات أحد طرفي الفصل", p: "p ∨ q; p", c: "¬q", ej: "إمّا أن نذهب إلى السينما أو نذهب للعشاء. نذهب إلى السينما. إذن لن نذهب للعشاء.", por: "«أو» المنطقية فصل شامل: يمكن فعل الأمرين معًا. لا تكون الحجة صحيحة إلا إذا كانت الجملة تستبعد الأمرين معًا." },
  { k: "nc", n: "نفي أحد طرفي الوصل", p: "¬(p ∧ q)", c: "¬p", ej: "ليس صحيحًا أنه في البيت وفي القسم في الوقت نفسه. إذن ليس في البيت.", por: "يكفي ألّا يتحقق أحد الطرفين: قد يكون في البيت وليس في القسم. من ¬(p ∧ q) يلزم فقط ¬p ∨ ¬q (دي مورغان)." },
  { k: "cc", n: "عكس الشرطية", p: "p → q", c: "q → p", ej: "إذا كان كلبًا، فهو من الثدييات. إذن، إذا كان من الثدييات، فهو كلب.", por: "كون p كافيًا لـq لا يعني أن q كافٍ لـp: القطّ أيضًا من الثدييات. إنه الخطأ نفسه الذي يخلط بين «إذا» و«فقط إذا»." }
];
const LOGM_EJ = [
  { t: "إذا كان سقراط إنسانًا، فهو فانٍ. سقراط إنسان. إذن سقراط فانٍ.", r: "mp" },
  { t: "إذا وُجدت نار، وُجد الأكسجين. لا يوجد أكسجين على القمر. إذن لا توجد نار على القمر.", r: "mt" },
  { t: "إذا انتهكت حكومةٌ حقوقَ المواطنين، فللشعب الحق في المقاومة. الشعب يقاوم. إذن انتهكت الحكومة حقوقه.", r: "ac" },
  { t: "المذنب إمّا رئيس الخدم وإمّا الطبّاخة. رئيس الخدم لديه حجة غياب وليس المذنب. إذن المذنبة هي الطبّاخة.", r: "sd" },
  { t: "إذا اجتهدت، تتحسّن؛ وإذا تحسّنت، تنجح. إذن، إذا اجتهدت، تنجح.", r: "sh" },
  { t: "إذا أمطرت، تُلغى المباراة. لا تمطر. إذن لا تُلغى المباراة.", r: "na" },
  { t: "إذا شككت، فأنا أفكر. أنا أشك. إذن أنا أفكر.", r: "mp" },
  { t: "تدرس آنا الفلسفة أو التاريخ. تدرس الفلسفة. إذن لا تدرس التاريخ.", r: "ad" },
  { t: "لو كانت النفس مادية، لتحلّلت مثل الجسد. النفس لا تتحلّل. إذن النفس ليست مادية.", r: "mt" },
  { t: "إذا كانت النظرية جيدة، تتحقق تنبؤاتها. تنبؤاتها تتحقق. إذن النظرية جيدة.", r: "ac" },
  { t: "إذا أمطرت، فهناك غيوم. إذن، إذا كانت هناك غيوم، فإنها تمطر.", r: "cc" },
  { t: "ليس صحيحًا أن المتهم مذنب وأنه تصرّف وحده. إذن المتهم ليس مذنبًا.", r: "nc" }
];
function logmTodas(){ return LOGM_REGLAS.concat(LOGM_FALACIAS); }
function logmForma(x){ return x.p.split(";").map(s => s.trim()).join(" · ") + " ⊢ " + x.c; }
function logmCarta(x, fal){
  return '<div class="lg-regla' + (fal ? " lg-falaz" : "") + '"><h3>' + logEsc(x.n) + '</h3><p class="lg-forma"><b>' + logmT("forma") + ":</b> " + logEsc(logmForma(x)) + "</p>" +
    '<p><b>' + logmT("ejemplo") + ":</b> " + logEsc(x.ej) + "</p>" + (fal ? '<p><b>' + logmT("porQue") + ":</b> " + logEsc(x.por) + "</p>" : "") +
    '<p><button type="button" class="btn ghost" data-infp="' + logEsc(x.p) + '" data-infc="' + logEsc(x.c) + '">' + logmT("verTabla") + " →</button></p></div>";
}
function logRenderInferencia(){
  const T = logmTodas();
  return '<div class="lg-panel"><h2>' + logmT("validas") + '</h2><div class="lg-reglas">' + LOGM_REGLAS.map(x => logmCarta(x, false)).join("") + "</div></div>" +
    '<div class="lg-panel"><h2>' + logmT("falacias") + '</h2><div class="lg-reglas">' + LOGM_FALACIAS.map(x => logmCarta(x, true)).join("") + "</div></div>" +
    '<p><button type="button" class="btn ghost" data-lgtab="falacias">' + logmT("falVer") + "</button></p>" +
    '<div class="lg-panel"><h2>' + logmT("ejTit") + '</h2><p class="lg-nota">' + logmT("ejAyuda") + "</p>" +
    LOGM_EJ.map((e, i) => {
      const r = LOG.inf[i], bien = T.find(x => x.k === e.r);
      return '<div class="lg-infej"><p>' + (i + 1) + ". " + logEsc(e.t) + '</p><div class="lg-teclas">' + T.map(x => '<button type="button" class="chip' + (r === x.k ? (x.k === e.r ? " lg-chip-ok" : " lg-chip-no") : "") + '" data-infej="' + i + '" data-infr="' + x.k + '"' + (r ? " disabled" : "") + ">" + logEsc(x.n) + "</button>").join("") + "</div>" +
        (r ? '<p class="lg-veredicto ' + (r === e.r ? "lg-tautologia" : "lg-contradiccion") + '">' + logmT(r === e.r ? "acierto" : "fallo", { r: logEsc(bien.n) }) + " " + logmT("formaArg", { f: logEsc(logmForma(bien)) }) + "</p>" : "") + "</div>";
    }).join("") + "</div>";
}

/* ---------- Cuantificadores (lógica de predicados) ---------- */
/* Las cuatro proposiciones de Aristóteles en lógica de predicados, un «mundo pequeño» donde se evalúan (con el caso
   del sujeto vacío: el compromiso existencial del tema 4) y un ejercicio de elegir la fórmula de cada frase. */
const LOGM_CQ_TXT = {
  tabCuantificadores: "المكمِّمات",
  introCuantificadores: "منطق جداول الصدق لا يستطيع تحليل «كل البشر فانون؛ سقراط إنسان؛ إذن سقراط فانٍ»، لأنه لا يرى ما بداخل كل جملة. أضاف فريجه (1879) المحمولات (Hx = «x إنسان») والمكمِّمات: ∀x، «لكل x» (المكمِّم الكلي)، و∃x، «يوجد x واحد على الأقل» (المكمِّم الوجودي). بها تُكتب قضايا أرسطو الأربع وأشياء أخرى كثيرة.",
  cqCuatro: "قضايا أرسطو الأربع", cqProp: "القضية", cqFormula: "الصيغة", cqLee: "تُقرأ",
  cqTrampa: "حالة فخّ: «كل S هو P» ليست ∀x (Sx ∧ Px)، لأن هذه تعني أن كل شيء هو S وP معًا؛ و«بعض S هو P» ليست ∃x (Sx → Px)، لأن هذه تكون صادقة بمجرد وجود شيء ليس S.",
  cqNeg: "نفي المكمِّم: ¬∀x Px تكافئ ∃x ¬Px («ليس الكل» = «بعضها ليس»)، و¬∃x Px تكافئ ∀x ¬Px («لا شيء» = «كلها ليست»). لهذا تكون A وO متناقضتين، وكذلك E وI.",
  cqMundo: "عالم صغير", cqMundoAyuda: "خمسة أفراد (a, b, c, d, e). حدّدوا أيّها S وأيّها P، وانظروا أيّ القضايا تصبح صادقة.",
  cqInd: "الفرد", cqVacio: "جرّبوا أن تتركوا S فارغة: عندئذ تكون «كل S هو P» و«لا شيء من S هو P» صادقتين معًا، وتكون «بعض S هو P» كاذبة. في المنطق الحديث، لا تفترض القضية الكلية أن S موجودة: هذا هو الالتزام الوجودي في الموضوع 4.",
  cqOrdenTit: "مغالطة في المكمِّمات: تغيير الترتيب",
  cqOrden: "«لكل شخص أمّ» تُكتب ∀x ∃y Myx: لكل شخص x يوجد شخص y هو أمّه. «توجد أمّ للجميع» تُكتب ∃y ∀x Myx: يوجد y واحد هو أمّ لكل x. تغيير ترتيب ∀ و∃ يغيّر المعنى: الجملة الثانية لا تلزم عن الأولى.",
  cqOrdenMadre: "أمّه", cqOrdenContra: "المثال المضاد: في هذا العالم لكل واحد أمّه، إذن ∀x ∃y Myx صادقة؛ لكن لا توجد أمّ للثلاثة معًا، إذن ∃y ∀x Myx كاذبة. مقدمة صادقة ونتيجة كاذبة: الاستدلال غير صحيح. (أما العكس فصحيح: إذا وُجدت أمّ للجميع، فلكل واحد أمّ).",
  cqOrdenFilo: "في الفلسفة: يُناقَش هل يقوم أرسطو بهذه القفزة في بداية «الأخلاق إلى نيقوماخوس» (I 2)، لأنه إذا كان كل فعل يطلب غاية ما، فلا يلزم عن ذلك أن توجد غاية واحدة تطلبها كل الأفعال. ويرى بعض نقّاد البراهين الكوسمولوجية هذه المغالطة في الانتقال من «لكل شيء سبب» إلى «يوجد سبب لكل شيء».",
  cqTesti: "يُظهر ذلك: {x}", cqContra: "تفشل عند: {x}", cqNadie: "لا يوجد أيّ واحد", cqSinS: "صادقة لأنه لا يوجد أيّ S",
  cqPresets: "عوالم نموذجية:", cqP1: "كل S هو P", cqP2: "لا شيء من S هو P", cqP3: "بعضها نعم وبعضها لا", cqP4: "لا يوجد أيّ S",
  cqEjTit: "ما الصيغة؟", cqEjAyuda: "اختاروا الصيغة التي تقول ما تقوله الجملة. الحرف الكبير هو المحمول، والحرف الصغير فرد معيّن.",
  cqBien: "صحيح!", cqMal: "No.", cqEjemplo: "مثال محلول: قياس سقراط",
  cqEjemploTxt: "كل البشر فانون: ∀x (Hx → Mx). سقراط إنسان: Hs. إذن سقراط فانٍ: Ms. من المقدمة الأولى يلزم Hs → Ms (ما يصدق على كل x يصدق على سقراط: «التخصيص الكلي»)، ومن Hs → Ms وHs يلزم Ms بقاعدة modus ponens."
};
const LOGM_CQ4 = [
  ["A", "كل S هو P", "∀x (Sx → Px)", "لكل x، إذا كان x هو S، فإن x هو P"],
  ["E", "لا شيء من S هو P", "∀x (Sx → ¬Px)", "لكل x، إذا كان x هو S، فإن x ليس P (أو: ¬∃x (Sx ∧ Px))"],
  ["I", "بعض S هو P", "∃x (Sx ∧ Px)", "يوجد x واحد على الأقل هو S وهو P"],
  ["O", "بعض S ليس P", "∃x (Sx ∧ ¬Px)", "يوجد x واحد على الأقل هو S وليس P"]
];
const LOGM_CQ_IND = ["a", "b", "c", "d", "e"];
const LOGM_CQ_PRE = {
  p1: [[1, 1], [1, 1], [0, 1], [0, 0], [1, 1]], p2: [[1, 0], [1, 0], [0, 1], [0, 1], [0, 0]],
  p3: [[1, 1], [1, 0], [0, 1], [1, 1], [0, 0]], p4: [[0, 1], [0, 0], [0, 1], [0, 0], [0, 1]]
};
const LOGM_CQ_EJ = [
  { f: "كل الفلاسفة فضوليون.", d: "F = فيلسوف، C = فضولي", o: ["∀x (Fx → Cx)", "∀x (Fx ∧ Cx)", "∃x (Fx ∧ Cx)", "∀x (Cx → Fx)"], r: 0, por: "كلية موجبة (A). بالرمز ∧ ستعني أن كل شيء فيلسوف وفضولي؛ وبالسهم المعكوس، أن كل فضولي فيلسوف." },
  { f: "كان بعض السفسطائيين يتقاضى أجرًا على التعليم.", d: "S = سفسطائي، C = يتقاضى أجرًا على التعليم", o: ["∃x (Sx → Cx)", "∃x (Sx ∧ Cx)", "∀x (Sx → Cx)"], r: 1, por: "جزئية موجبة (I): يوجد شخص هو سفسطائي وكان يتقاضى أجرًا. بالسهم، يكفي أن يوجد شيء ليس سفسطائيًا." },
  { f: "لا أحد من الآلهة فانٍ.", d: "D = إله، M = فانٍ", o: ["¬∀x (Dx → Mx)", "∀x (¬Dx → Mx)", "∀x (Dx → ¬Mx)"], r: 2, por: "كلية سالبة (E). وتصلح أيضًا ¬∃x (Dx ∧ Mx): «لا يوجد شيء هو إله وفانٍ»." },
  { f: "لم يكن كل الإغريق فلاسفة.", d: "G = إغريقي، F = فيلسوف", o: ["∀x (Gx → ¬Fx)", "¬∀x (Gx → Fx)", "¬∃x (Gx ∧ Fx)"], r: 1, por: "حالة فخّ: «ليس الكل» لا تعني «لا أحد». إنها تكافئ ∃x (Gx ∧ ¬Fx): بعض الإغريق لم يكن فيلسوفًا (O)." },
  { f: "لم يكن يصوّت في الجمعية إلا المواطنون.", d: "V = كان يصوّت في الجمعية، C = مواطن", o: ["∀x (Cx → Vx)", "∀x (Vx → Cx)", "∃x (Vx ∧ Cx)"], r: 1, por: "حالة فخّ: «إلا الـ C» (أي «فقط الـ C») تضع الشرط اللازم بعد السهم: كل من كان يصوّت كان مواطنًا (وليس كل مواطن كان يصوّت)." },
  { f: "يوجد شيء لم يتسبّب فيه شيء آخر.", d: "C = له سبب هو شيء آخر", o: ["¬∃x Cx", "∀x ¬Cx", "∃x ¬Cx"], r: 2, por: "يوجد x واحد على الأقل ليس له سبب: هذه فكرة المحرّك الأول عند أرسطو أو السبب الأول عند توما الأكويني." },
  { f: "سقراط فانٍ.", d: "M = فانٍ، s = سقراط", o: ["∃x Mx", "Ms", "∀x Mx"], r: 1, por: "الفرد المعيّن يُكتب بحرف صغير (ثابت): لا حاجة إلى مكمِّم." },
  { f: "كل من يفكر موجود.", d: "P = يفكر، E = موجود", o: ["∀x (Px → Ex)", "∀x (Ex → Px)", "∃x (Px ∧ Ex)"], r: 0, por: "كلية موجبة (A). لاستخلاص «أنا موجود» نحتاج أيضًا إلى المقدمة «أنا أفكر» (Pi) وإلى التخصيص الكلي، كما في مثال سقراط." },
  { f: "لكل شخص أمّ.", d: "M = «y أمّ x»", o: ["∃y ∀x Myx", "∀x ∃y Myx", "∀x ∀y Myx"], r: 1, por: "لكل شخص أمّ ما (قد تختلف من حالة إلى أخرى). أما ∃y ∀x Myx فتعني أنه توجد أمّ واحدة للجميع: وهذا هو تغيير ترتيب المكمِّمات." },
  { f: "يوجد شخص يُعجب به الجميع.", d: "A = «x يُعجب بـy»", o: ["∀x ∃y Axy", "∃y ∀x Axy", "∃x ∃y Axy"], r: 1, por: "يوجد y بحيث يُعجب به الجميع. أما ∀x ∃y Axy فتعني فقط أن كل واحد يُعجب بشخص ما، وربما بأشخاص مختلفين." }
];
function logmCqEval(m){
  const ix = i => LOGM_CQ_IND[i], S = m.map(r => !!r[0]), P = m.map(r => !!r[1]), all = [0, 1, 2, 3, 4];
  const res = {
    A: { v: all.every(i => !S[i] || P[i]), malos: all.filter(i => S[i] && !P[i]) },
    E: { v: all.every(i => !S[i] || !P[i]), malos: all.filter(i => S[i] && P[i]) },
    I: { v: all.some(i => S[i] && P[i]), buenos: all.filter(i => S[i] && P[i]) },
    O: { v: all.some(i => S[i] && !P[i]), buenos: all.filter(i => S[i] && !P[i]) }
  };
  Object.values(res).forEach(r => { r.txt = r.malos ? (r.malos.length ? logmT("cqContra", { x: r.malos.map(ix).join(", ") }) : (S.some(Boolean) ? "" : logmT("cqSinS"))) : (r.buenos.length ? logmT("cqTesti", { x: r.buenos.map(ix).join(", ") }) : logmT("cqNadie")); });
  return res;
}
function logmCqMundo(){
  const m = LOG.cq.m, res = logmCqEval(m);
  return '<div class="tablewrap"><table class="lg-tabla lg-cq-mundo"><thead><tr><th>' + logmT("cqInd") + "</th>" + LOGM_CQ_IND.map(x => "<th>" + x + "</th>").join("") + "</tr></thead><tbody>" +
    ["S", "P"].map((k, j) => "<tr><th>" + k + "</th>" + m.map((r, i) => '<td><button type="button" class="chip lg-cq-cel' + (r[j] ? " on" : "") + '" data-cqi="' + i + '" data-cqj="' + j + '" aria-pressed="' + !!r[j] + '">' + (r[j] ? "✓" : "·") + "</button></td>").join("") + "</tr>").join("") +
    '</tbody></table></div><div class="tablewrap"><table class="lg-tabla"><tbody>' +
    LOGM_CQ4.map(([t, , f]) => '<tr><th>' + t + "</th><td>" + logEsc(f) + "</td>" + logVF(res[t].v) + '<td class="lg-cq-x">' + logEsc(res[t].txt) + "</td></tr>").join("") + "</tbody></table></div>";
}
function logRenderCuantificadores(){
  const ej = LOG.cq.ej;
  return '<div class="lg-panel"><h2>' + logmT("cqCuatro") + '</h2><div class="tablewrap"><table class="lg-tabla"><thead><tr><th></th><th>' + logmT("cqProp") + "</th><th>" + logmT("cqFormula") + "</th><th>" + logmT("cqLee") + "</th></tr></thead><tbody>" +
    LOGM_CQ4.map(([t, p, f, l]) => "<tr><th>" + t + "</th><td>" + logEsc(p) + '</td><td class="lg-forma">' + logEsc(f) + "</td><td>" + logEsc(l) + "</td></tr>").join("") + "</tbody></table></div>" +
    '<p class="lg-nota">' + logmT("cqTrampa") + '</p><p class="lg-nota">' + logmT("cqNeg") + "</p></div>" +
    '<div class="lg-panel"><h2>' + logmT("cqMundo") + '</h2><p class="lg-nota">' + logmT("cqMundoAyuda") + '</p><p class="lg-nota">' + logmT("cqPresets") + " " +
    [["p1", "cqP1"], ["p2", "cqP2"], ["p3", "cqP3"], ["p4", "cqP4"]].map(([k, l]) => '<button type="button" class="chip" data-cqpre="' + k + '">' + logmT(l) + "</button>").join(" ") + "</p>" +
    '<div id="lg-cq">' + logmCqMundo() + '</div><p class="lg-nota">' + logmT("cqVacio") + "</p></div>" +
    logmGeneralizacion() +
    /* (12-10) la falacia del cambio de orden de los cuantificadores, con su contraejemplo */
    logmCqOrden() +
    '<div class="lg-panel"><h2>' + logmT("cqEjTit") + '</h2><p class="lg-nota">' + logmT("cqEjAyuda") + "</p>" +
    LOGM_CQ_EJ.map((e, i) => {
      const r = ej[i];
      return '<div class="lg-infej"><p>' + (i + 1) + ". " + logEsc(e.f) + ' <span class="lg-nota">(' + logEsc(e.d) + ')</span></p><div class="lg-teclas">' +
        e.o.map((o, k) => '<button type="button" class="chip lg-forma' + (r != null && r === k ? (k === e.r ? " lg-chip-ok" : " lg-chip-no") : "") + (r != null && k === e.r && r !== k ? " lg-chip-ok" : "") + '" data-cqej="' + i + '" data-cqo="' + k + '"' + (r != null ? " disabled" : "") + ">" + logEsc(o) + "</button>").join("") + "</div>" +
        (r != null ? '<p class="lg-veredicto ' + (r === e.r ? "lg-tautologia" : "lg-contradiccion") + '">' + logmT(r === e.r ? "cqBien" : "cqMal") + " " + logEsc(e.por) + "</p>" : "") + "</div>";
    }).join("") + '<details class="lg-guia"><summary>' + logmT("cqEjemplo") + "</summary><p>" + logmT("cqEjemploTxt") + "</p></details></div>";
}

Object.assign(LOGM_TXT, LOGM_CQ_TXT);

/* ---------- (12-10) lo que faltaba: conversión ilícita, generalización apresurada y «lo que la lógica puede y no puede refutar» ---------- */
const LOGM_EXTRA_TXT = {
  convTit: "العكس: هل يمكن قلب القضية؟",
  convIntro: "العكس هو تبادل الموضوع والمحمول. أحيانًا يحافظ على الصدق وأحيانًا لا. وقلب القضية حين لا يجوز ذلك هو مغالطة العكس غير المشروع.",
  convProp: "القضية", convConv: "المعكوسة", convVale: "هل يصحّ؟", convEj: "مثال",
  convSi: "Sí", convNo: "لا: عكس غير مشروع", convAcc: "فقط «بعض P هو S» (إذا كان S موجودًا)",
  genTit: "من «بعض» إلى «كل»: التعميم المتسرع",
  gen: "من ∃x (Sx ∧ Px)، أي «بعض S هو P»، لا يلزم ∀x (Sx → Px)، أي «كل S هو P». يبيّن المنطق ذلك بمثال مضاد: في عالم «بعضها نعم وبعضها لا» تكون القضية I صادقة والقضية A كاذبة. أمّا عدد الحالات اللازمة للتعميم بحذر فلم يعد مسألة من مسائل المنطق الاستنباطي، بل مسألة استقراء: لا يضمنه أيّ عدد من الحالات.",
  genVer: "شاهدوه في العالم الصغير",
  lpTit: "ما يستطيع المنطق تفنيده وما لا يستطيع",
  lpIntro: "المغالطات الصورية السابقة تُفنَّد بالصورة: يكفي مثال مضاد واحد. ومغالطات أخرى ليس فيها خلل في الصورة، لكنّ صياغتها صوريًا تساعد على رؤيتها. وأخرى لا يمكن تفنيدها بالمنطق، لأنّ المشكلة في المضمون.",
  lpAyuda: "المنطق يساعد، لكنه لا يكفي", lpNo: "المنطق لا يفنّدها", lpQueVe: "ما يبيّنه المنطق",
  lpNoIntro: "قد تكون صورتها صحيحة، وقد لا تكون حجة أصلًا: الخلل في كون المقدمات صادقة أو في صلتها بالموضوع. ولكشفها يجب السؤال عن المضمون.",
  lpDuelo: "تدرّبوا عليها في «مبارزة الحجج» →"
};
const LOGM_CONV = [
  ["A", "كل S هو P", "كل P هو S", "no", "كل كلب ثديي؛ لكن ليس كل ثديي كلبًا."],
  ["E", "لا شيء من S هو P", "لا شيء من P هو S", "si", "لا شيء من الأسماك ثديي؛ إذن لا شيء من الثدييات سمكة."],
  ["I", "بعض S هو P", "بعض P هو S", "si", "بعض الفلاسفة يونانيون؛ إذن بعض اليونانيين فلاسفة."],
  ["O", "بعض S ليس P", "بعض P ليس S", "no", "بعض الحيوانات ليست كلابًا؛ لكن لا يلزم من ذلك أنّ بعض الكلاب ليست حيوانات."]
];
const LOGM_AYUDA = [
  { n: "الاشتراك اللفظي", ej: "«غاية» الشيء هي كماله. والموت «نهاية» الحياة. إذن الموت هو كمال الحياة. (في الإسبانية كلمة واحدة «fin» تعني «الغاية» و«النهاية» معًا.)", ve: "عند الصياغة الصورية، تأخذ «fin» بمعنى «الغاية» و«fin» بمعنى «النهاية» حرفين مختلفين: يظهر حدّ رابع، فلا يبقى القياس صحيحًا." },
  { n: "المصادرة على المطلوب", ej: "هذا الكتاب يقول الحقيقة، لأنّ الكتاب نفسه يقول ذلك.", ve: "الحجة صحيحة (p ⊢ p)، لكنّ النتيجة كانت موجودة أصلًا في المقدمة: فهي لا تثبت شيئًا لم يكن مُسلَّمًا به من قبل." },
  { n: "الثنائية الزائفة", ej: "إمّا أن تكون معي وإمّا أن تكون ضدي. أنت لست معي. إذن أنت ضدي.", ve: "الصورة قياس فصلي، وهو صحيح. ما يختلّ هو المقدمة p ∨ q: هناك خيارات أخرى." },
  { n: "المنحدر الزلق", ej: "إذا سمحنا باستعمال الهاتف في الاستراحة، فسيستعملونه في القسم؛ وإذا استعملوه في القسم، فلن ينتبه أحد؛ وإذا لم ينتبه أحد، فسيرسب الجميع.", ve: "السلسلة p → q، q → r، r → s صحيحة (قياس شرطي)، لكنّ كل قضية شرطية فيها محتملة في أحسن الأحوال: والاحتمال يضعف في كل خطوة." },
  { n: "القياس المضمر", ej: "إنه غالٍ، إذن لا بدّ أنه جيد.", ve: "لكي يكون صحيحًا تنقصه مقدمة: «كل ما هو غالٍ جيد». الصياغة الصورية تُظهرها، وعندئذ نرى أنها كاذبة." }
];
const LOGM_NOFORMAL = [
  ["الهجوم على الشخص (الشخصنة، ad hominem)", "تهاجم المتكلّم، لا ما يقوله."],
  ["السلطة الزائفة", "تُسند النتيجة إلى شخص ليس خبيرًا في ذلك المجال."],
  ["الاحتكام إلى الأغلبية (ad populum)", "اعتقاد كثير من الناس بشيء لا يجعله صحيحًا."],
  ["الاحتكام إلى الشفقة أو إلى الخوف", "تبحث عن إثارة عاطفة بدل تقديم سبب."],
  ["رجل القشّ", "تفنّد صيغة مشوَّهة لما قاله الآخر."],
  ["السبب الزائف", "حدوث شيء بعد شيء آخر لا يثبت أنه سببه."]
];
function logmConversion(){
  return '<div class="lg-panel"><h2>' + logmT("convTit") + '</h2><p class="lg-nota">' + logmT("convIntro") + '</p><div class="tablewrap"><table class="lg-tabla"><thead><tr><th></th><th>' + logmT("convProp") + "</th><th>" + logmT("convConv") + "</th><th>" + logmT("convVale") + "</th><th>" + logmT("convEj") + "</th></tr></thead><tbody>" +
    LOGM_CONV.map(([t, p, c, v, e]) => "<tr><th>" + t + "</th><td>" + logEsc(p) + "</td><td>" + logEsc(c) + '</td><td class="lg-' + (v === "si" ? "v" : "f") + '">' + logmT(v === "si" ? "convSi" : "convNo") + (t === "A" ? "<br><small>" + logmT("convAcc") + "</small>" : "") + "</td><td>" + logEsc(e) + "</td></tr>").join("") + "</tbody></table></div></div>";
}
function logmGeneralizacion(){
  return '<div class="lg-panel"><h2>' + logmT("genTit") + "</h2><p>" + logmT("gen") + '</p><p><button type="button" class="btn ghost" data-cqpre="p3">' + logmT("genVer") + "</button></p></div>";
}
function logmPuedeNoPuede(){
  const duelo = document.getElementById("duelo") ? '<p><button type="button" class="btn ghost" data-igo="duelo" data-iarg="">' + logmT("lpDuelo") + "</button></p>" : "";
  return '<div class="lg-panel"><h2>' + logmT("lpTit") + '</h2><p class="lg-nota">' + logmT("lpIntro") + "</p><h3>" + logmT("lpAyuda") + '</h3><div class="lg-reglas">' +
    LOGM_AYUDA.map(x => '<div class="lg-regla lg-medio"><h3>' + logEsc(x.n) + '</h3><p><b>' + logmT("ejemplo") + ":</b> " + logEsc(x.ej) + "</p><p><b>" + logmT("lpQueVe") + ":</b> " + logEsc(x.ve) + "</p></div>").join("") + "</div>" +
    "<h3>" + logmT("lpNo") + '</h3><p class="lg-nota">' + logmT("lpNoIntro") + '</p><ul class="lg-nof">' + LOGM_NOFORMAL.map(([n, d]) => "<li><b>" + logEsc(n) + ":</b> " + logEsc(d) + "</li>").join("") + "</ul>" + duelo + "</div>";
}
Object.assign(LOGM_TXT, LOGM_EXTRA_TXT);

/* ---------- (12-10) pestaña «Falacias»: todas las falacias del Rincón, reunidas (estaban repartidas por Cuadrado, Reglas de inferencia y Cuantificadores) ---------- */
Object.assign(LOGM_TXT, {
  tabFalacias: "المغالطات",
  introFalacias: "المغالطة استدلال يبدو صحيحًا لكنه ليس كذلك. هنا جُمعت كل مغالطات «ركن المنطق»: أولًا المغالطات الصورية التي تُفنَّد بمثال مضاد، ثم تلك التي يساعد المنطق على رؤيتها، وأخيرًا تلك التي لا تُكتشف إلا بالنظر في المضمون.",
  falSilTit: "مغالطات القياس",
  falSilIntro: "القياس الذي يخالف إحدى قواعد أرسطو ليس صحيحًا. لكل مغالطة من هذه المغالطات مثال يمكنكم فتحه في تبويب «القياسات» لرؤية مخطط فن الخاص به.",
  falR1: "الحد الأوسط غير المستغرق", falR2P: "استغراق كبير غير مشروع", falR2S: "استغراق صغير غير مشروع", falR3: "مقدمتان سالبتان", falR4a: "مقدمة سالبة ونتيجة موجبة", falR5: "مقدمتان جزئيتان",
  falProbar: "رؤيته في «القياسات» →",
  falVer: "كل المغالطات مجموعة في تبويب «المغالطات» →"
});
const LOGM_FAL_SIL = [["r1", "AAA-2"], ["r2P", "AEE-1"], ["r2S", "AAA-3"], ["r3", "EEE-1"], ["r4a", "AEA-1"], ["r5", "III-1"]];
function logmCqOrden(){
  return '<div class="lg-panel"><h2>' + logmT("cqOrdenTit") + "</h2><p>" + logmT("cqOrden") + '</p><div class="tablewrap"><table class="lg-tabla"><thead><tr><th>x</th><th>' + logmT("cqOrdenMadre") + "</th></tr></thead><tbody>" +
    [["a", "m1"], ["b", "m2"], ["c", "m3"]].map(([x, y]) => "<tr><td>" + x + "</td><td>" + y + "</td></tr>").join("") + '</tbody></table></div><p class="lg-nota">' + logmT("cqOrdenContra") + '</p><p class="lg-nota">' + logmT("cqOrdenFilo") + "</p></div>";
}
function logRenderFalacias(){
  return '<div class="lg-panel"><h2>' + logmT("falacias") + '</h2><div class="lg-reglas">' + LOGM_FALACIAS.map(x => logmCarta(x, true)).join("") + "</div></div>" +
    '<div class="lg-panel"><h2>' + logmT("falSilTit") + '</h2><p class="lg-nota">' + logmT("falSilIntro") + '</p><div class="lg-reglas">' +
    LOGM_FAL_SIL.map(([r, m]) => '<div class="lg-regla lg-falaz"><h3>' + logmT("falR" + r.slice(1)) + "</h3><p>" + logT(r) + '</p><p class="lg-forma">' + m + '</p><p><button type="button" class="btn ghost" data-falsil="' + m + '">' + logmT("falProbar") + "</button></p></div>").join("") + "</div></div>" +
    logmConversion() + logmGeneralizacion() + logmCqOrden() + logmPuedeNoPuede();
}


/* ---------- eventos (delegados en la caja del Rincón; logicaview.js maneja los demás) ---------- */
(function(){
  const box = document.getElementById("logicabox"); if (!box) return;
  LOG.fz = LOG.fz || {}; LOG.inf = LOG.inf || {}; LOG.cq = LOG.cq || { m: LOGM_CQ_PRE.p3.map(r => r.slice()), ej: {} };
  Object.assign(LOG_TXT, LOGM_TXT);   // las pestañas nuevas usan logT() de logicaview.js
  logRender();
  box.addEventListener("click", ev => {
    const b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.fzok != null){ const i = +b.dataset.fzok; LOG.fz[i] = Object.assign(LOG.fz[i] || {}, { hecho: true, sol: false }); const r = document.getElementById("lg-fzr-" + i); if (r) r.innerHTML = logmFzRes(i); }
    else if (b.dataset.fzsol != null){ const i = +b.dataset.fzsol; LOG.fz[i] = Object.assign(LOG.fz[i] || {}, { sol: true }); const r = document.getElementById("lg-fzr-" + i); if (r) r.innerHTML = logmFzRes(i); }
    else if (b.dataset.infp != null){ LOG.prem = b.dataset.infp; LOG.concl = b.dataset.infc; LOG.tab = "tablas"; logRender(); const a = document.getElementById("lg-arg"); if (a) a.scrollIntoView({ block: "center" }); }
    else if (b.dataset.cqi != null){ const r = LOG.cq.m[+b.dataset.cqi]; r[+b.dataset.cqj] = r[+b.dataset.cqj] ? 0 : 1; const c = document.getElementById("lg-cq"); if (c) c.innerHTML = logmCqMundo(); }
    else if (b.dataset.falsil){ const [m, f] = b.dataset.falsil.split("-"); Object.assign(LOG.sil, { may: m[0], men: m[1], con: m[2], fig: +f }); LOG.tab = "silogismos"; logRender(); const c = document.getElementById("lg-sil"); if (c) c.scrollIntoView({ block: "start" }); }
    else if (b.dataset.cqpre){ if (!document.getElementById("lg-cq")){ LOG.tab = "cuantificadores"; logRender(); } LOG.cq.m = LOGM_CQ_PRE[b.dataset.cqpre].map(r => r.slice()); const c = document.getElementById("lg-cq"); if (c){ c.innerHTML = logmCqMundo(); if (b.closest(".lg-panel") !== c.closest(".lg-panel")) c.scrollIntoView({ block: "center" }); } }
    else if (b.dataset.cqej != null){ LOG.cq.ej[+b.dataset.cqej] = +b.dataset.cqo; const y = window.scrollY; logRender(); window.scrollTo(0, y); }
    else if (b.dataset.infej != null){ LOG.inf[+b.dataset.infej] = b.dataset.infr; const y = window.scrollY; logRender(); window.scrollTo(0, y); }
  });
  box.addEventListener("input", ev => { const t = ev.target; if (t.dataset && t.dataset.fz != null){ const i = +t.dataset.fz; LOG.fz[i] = Object.assign(LOG.fz[i] || {}, { f: t.value, hecho: false, sol: false }); const r = document.getElementById("lg-fzr-" + i); if (r) r.innerHTML = ""; } });
  box.addEventListener("keydown", ev => { const t = ev.target; if (ev.key === "Enter" && t.dataset && t.dataset.fz != null){ ev.preventDefault(); const ok = box.querySelector('[data-fzok="' + t.dataset.fz + '"]'); if (ok) ok.click(); } });
})();
