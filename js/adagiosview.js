"use strict";
/* ===== «Adagios» (09-10, Bachillerato) — vista sobre adagios.js (ADAGIOS) =====
   Repertorio de lemas clásicos al modo de los cuadernos de lugares comunes del Renacimiento. Cada ficha: la versión
   española y, solo al pulsar el botón λ de su línea (como en el glosario), el lema latino y, si lo hay, el original
   griego con su transliteración; luego qué quiere decir, cuándo usarlo, el caso trampa si lo hay, de dónde viene y los temas.
   Los nombres de pensadores con ficha en Ilustres (en esta web) abren su biografía: el primero de cada ficha.
   Filtro por ámbito y modo «Ponte a prueba» (solo el lema en español; el resto se descubre al pulsar). Arriba solo las fichas:
   la historia (Erasmo, florilegios, Montaigne) y el cuaderno de lugares comunes van al final, plegados.
   Enlace profundo: #adagios/<id>. Los temas se enlazan solo si existen en la web (THEORY filtrado). */

/* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
const ADG_TXT = {
  ambito: "المجال", todos: "الكل",
  saber: "المعرفة", realidad: "الواقع", etica: "الأخلاق والحياة", politica: "السياسة", humano: "الإنسان",
  modo: "الطريقة", leer: "قراءة", prueba: "اختبروا أنفسكم",
  pruebaAyuda: "حاولوا أن تشرحوا ما معناها، ومن أين تأتي، ومتى تستعملونها؛ ثم انقروا على «اكشف».",
  descubrir: "اكشف", ocultar: "إخفاء",
  originalBtn: "عرض الأصل اللاتيني", originalBtnGr: "عرض الأصل اللاتيني واليوناني، وطريقة قراءة اليونانية",
  latin: "باللاتينية:", griego: "باليونانية:",
  origen: "من أين تأتي:", erasmo: "إيراسموس، المأثورات (Adagia) {n}",
  sentido: "ما معناها:", uso: "استعملوها:", trampa: "فخّ", temas: "في المواضيع:",
  verBio: "عرض سيرة {n}",
  cuenta: "عدد المأثورات: {n}", cuenta1: "مأثورة واحدة",
  hTit: "من أين يأتي هذا: اللغة المشتركة في عصر النهضة",
  h1: "في عصر النهضة، كان كل من درس يحفظ عن ظهر قلب مئات الشعارات والمأثورات والحِكَم من الكتّاب القدامى. لم تكن زينة: كانت تعمل كلغة مشتركة. كان يكفي أن يقول المرء «Festina lente» أو «Nosce te ipsum» ليستحضر فكرة كاملة بتاريخها ودقائقها، فيعرفها القارئ المثقف في الحال.",
  h2t: "«المأثورات» لإيراسموس",
  h2: "أكثر المجموعات تأثيرًا كانت مجموعة إيراسموس الروتردامي. بدأ سنة 1500 بمختارات من 818 مثلًا يونانيًا ولاتينيًا، وظل يوسّعها طوال حياته: في طبعة 1536 بلغت 4151 مأثورة. ومع كل مأثورة تعليق على أصلها ومعناها واستعمالها، وبعض التعليقات مقالات حقيقية، مثل تعليقه على «Dulce bellum inexpertis» ضد الحرب، أو على «Sileni Alcibiadis» عن المظاهر.",
  h3t: "المختارات والمواضع المشتركة",
  h3: "إلى جانب إيراسموس كانت تنتشر «الفلوريليجيا» («باقات الزهور»)، وهي مختارات من نصوص منتقاة، مثل «بوليانثيا» لدومينيكو ناني ميرابيلي (1503) أو «أزهار الشعراء المشهورين» لأوكتافيانوس ميراندولا. وفي المدرسة كان لكل تلميذ دفتره الخاص بالمواضع المشتركة (loci communes): ينقل فيه الجمل التي يصادفها في قراءاته ويرتبها حسب المواضيع (الصداقة، الحظ، الموت، العدالة…) لتكون الحجج في متناوله عند الكتابة أو الكلام. وقد شرح إيراسموس في كتاب «الوفرة» (De copia)، وخوان لويس فيفيس، كيف يُصنع هذا الدفتر.",
  h3b: "انتبهوا إلى خلط شائع: كتاب «المواضع المشتركة» (Loci communes) لميلانشتون (1521) يحمل الاسم نفسه، لكنه كتاب في اللاهوت البروتستانتي مرتّب حسب المواضيع، وليس مجموعة اقتباسات.",
  h4t: "عوارض مكتبة مونتين",
  h4: "أمر مونتين بأن تُرسم على عوارض سقف مكتبته أكثر من خمسين حكمة باليونانية واللاتينية، كثير منها من الكتاب المقدس ومن سكستوس أمبيريكوس ومن مختارات ستوبايوس، لتكون أمام عينيه وهو يكتب «المقالات». وما زالت محفوظة في برجه في منطقة البيريغور، جنوب غرب فرنسا.",
  h4b: "واتخذ لنفسه شعارًا خاصًا. في سنة 1576 أمر بسكّ ميدالية عليها ميزان متوازن وكلمة يونانية من كلمات الشكّاك: ἐπέχω (epékho، «أمتنع»، أي أعلّق الحكم). وفي «المقالات» (2، 12) يترجمها في صيغة سؤال: «Que sçay-je?»، أي «ماذا أعرف؟».",
  pieDivisa: "شعار مونتين: «Que sçay-je?» («ماذا أعرف؟») فوق ميزان متوازن",
  pieMedalla: "ميدالية لمونتين من صنع عائلة غاتو (القرن 19؛ المكتبة الوطنية الفرنسية)",
  cTit: "اصنعوا دفتر المواضع المشتركة الخاص بكم",
  c0: "دفتر المواضع المشتركة ملف لجمل مرتبة حسب المواضيع، لتكون في متناولكم عند الكتابة. هكذا يُصنع:",
  c1t: "حضّروه.",
  c1: "دفتر أو وثيقة فيها خمسة أقسام، قسم لكل مجال: المعرفة، الواقع، الأخلاق والحياة، السياسة، الإنسان. اتركوا صفحتين على الأقل لكل قسم.",
  c2t: "انسخوا كل مأثورة دائمًا في الأسطر الخمسة نفسها:",
  c2a: "الشعار باللاتينية أو باليونانية؛", c2b: "الترجمة؛", c2c: "من أين تأتي: المؤلف والكتاب؛",
  c2d: "ما معناها، في جملة من صياغتكم (لا تنسخوا جملة الموقع)؛",
  c2e: "جملة من صياغتكم تستعملونها فيها في موضوع من مواضيع المقرر.",
  cEjT: "مثال:",
  cEj: "Homo homini lupus · «الإنسان ذئب لأخيه الإنسان» · بلوتوس، «أسيناريا»؛ ويستعيدها هوبز في «في المواطن» · من دون قوانين تحمينا يكون الآخرون خطرًا · «عند هوبز، في حالة الطبيعة homo homini lupus؛ لذلك يقبل الأفراد بحاكم يضمن السلام».",
  c3t: "حافظوا عليه محدّثًا.",
  c3: "مأثورتان في الأسبوع: التي ظهرت في القسم، وأخرى تختارونها من هذا القسم أو من قراءاتكم. في نهاية الفصل ستكون لديكم نحو خمس وعشرين.",
  c4t: "راجعوه.",
  c4: "مرة في الأسبوع، بطريقة «اختبروا أنفسكم» أو بتغطية الترجمة في دفتركم: قولوا بصوت عالٍ ما معناها وفي أي موضوع تستعملونها. ضعوا نقطة أمام التي تخطئون فيها، وعودوا إليها في الأسبوع التالي.",
  c5t: "استعملوه عند الكتابة.",
  c5: "في شرح نص أو في إنشاء فلسفي، تنفع المأثورة في البداية لتقديم المشكلة، أو في النهاية لختم الأطروحة. لا تضعوا أكثر من واحدة أو اثنتين في النص، واشرحوها دائمًا: «كما كتب بلوتوس، وكما سيكرر هوبز، homo homini lupus: …». وإذا لم تعرفوا أن تشرحوا لماذا تناسب الموضوع، فلا تضعوها."
};
const adgT = (k, v) => String(ADG_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));

const ADG_AMB = ["saber", "realidad", "etica", "politica", "إنسان"];
/* pensadores con ficha en Ilustres: nombre tal como aparece en los textos → id (solo se enlaza si la ficha existe en esta web) */
const ADG_ILU = [
  ["أوغسطين", "agustin"], ["أنسلم الكانتربري", "anselmo"], ["توما الأكويني", "tomas"], ["فرنسيس بيكون", "francis_bacon"],
  ["إيراسموس الروتردامي", "erasmo"], ["إيراسموس", "erasmo"], ["سقراط", "socrates"], ["أفلاطون", "platon"], ["أرسطو", "aristoteles"],
  ["هيراقليطس", "heraclito"], ["بارمنيدس", "parmenides"], ["بروتاغوراس", "protagoras"], ["أبيقور", "epicuro"], ["سينيكا", "seneca"],
  ["ترتليان", "tertuliano"], ["أوكام", "ockham"], ["ماكيافيلي", "maquiavelo"], ["هوبز", "hobbes"], ["اسبينوزا", "spinoza"],
  ["جون لوك", "locke"], ["لايبنتز", "leibniz"], ["كانط", "kant"], ["هايدغر", "heidegger"],
  ["ابن رشد", "averroes"], ["هيغل", "hegel"], ["ماركس", "marx"], ["داروين", "darwin"]
];
let adgAmb = "all", adgPrueba = false;

function adgEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function adgBox(){ return document.getElementById("adagiosbox"); }
function adgHayIlu(id){ return typeof ILUSTRES !== "undefined" && ILUSTRES[id] && typeof loadIlustre === "function"; }

/* texto escapado con el primer nombre de cada pensador convertido en botón (hechos = los ya enlazados en la ficha) */
function adgNombres(txt, hechos){
  let s = adgEsc(txt);
  ADG_ILU.forEach(([n, id]) => {
    if (hechos.has(id) || !adgHayIlu(id)) return;
    /* seguido de un número de pasaje es el título de una obra (Platón, «Protágoras 343b»), no la persona */
    const rx = new RegExp("(^|[^\\p{L}>])(" + n + ")(?![\\p{L}<])(?!\\s*\\d)", "u");
    if (!rx.test(s)) return;
    s = s.replace(rx, (m, a, b) => a + '<button class="adg-ilu" data-ilu="' + id + '" title="' + adgEsc(adgT("verBio", { n: ILUSTRES[id].name })) + '">' + b + '</button>');
    hechos.add(id);
  });
  return s;
}

function adgFiltro(){
  const f = document.getElementById("adagiosfilter");
  if (!f) return;
  f.innerHTML = '<div class="fgroup"><span class="flabel">' + adgT("ambito") + '</span>' +
    ["all"].concat(ADG_AMB).map(a => '<button class="fbtn" data-adg-a="' + a + '" aria-pressed="' + (a === adgAmb) + '">' +
      adgT(a === "all" ? "todos" : a) + '</button>').join("") + '</div>' +
    '<div class="fgroup"><span class="flabel">' + adgT("modo") + '</span>' +
    [["leer", false], ["prueba", true]].map(m => '<button class="fbtn" data-adg-m="' + m[0] + '" aria-pressed="' + (adgPrueba === m[1]) + '">' + adgT(m[0]) + '</button>').join("") + '</div>';
  f.querySelectorAll("[data-adg-a]").forEach(b => b.addEventListener("click", () => { adgAmb = b.dataset.adgA; adgFiltro(); adgRender(); }));
  f.querySelectorAll("[data-adg-m]").forEach(b => b.addEventListener("click", () => { adgPrueba = b.dataset.adgM === "prueba"; adgFiltro(); adgRender(); }));
}

function adgTemas(a){
  if (typeof THEORY === "undefined") return "";
  const ts = (a.t || []).filter(k => THEORY[k]);
  if (!ts.length) return "";
  return '<p class="adg-temas"><span class="adg-k">' + adgT("temas") + '</span> ' +
    ts.map(k => '<button class="adg-tema" data-th="' + adgEsc(k) + '" title="' + adgEsc(THEORY[k].title) + '">' + adgEsc(THEORY[k].title) + '</button>').join("") + '</p>';
}

function adgFicha(a){
  const h = new Set(), N = t => adgNombres(t, h);
  /* (09-10) el original (latín y, si lo hay, griego transliterado) solo se ve al pulsar λ, en la línea del español */
  const lb = adgT(a.gr ? "originalBtnGr" : "originalBtn");
  return '<article class="adg-card' + (adgPrueba ? ' adg-oculta' : '') + '" id="adg-' + adgEsc(a.id) + '" data-ep="' + adgEsc(a.e) + '">' +
    (a.img ? '<figure class="adg-fig' + (a.fit === "contain" ? ' adg-fig-c' : '') + '"><img src="' + adgEsc(a.img) + '" alt="' + adgEsc(a.pie) + '" loading="lazy" decoding="async"><figcaption>' + N(a.pie) + '</figcaption></figure>' : '') +
    '<h2 class="adg-es">' + adgEsc(a.es) + '<button type="button" class="adg-lam" aria-expanded="false" aria-label="' + lb + '" title="' + lb + '">λ</button></h2>' +
    '<div class="adg-orig" hidden><p class="adg-la"><span class="adg-k">' + adgT("latin") + '</span> <i lang="la">' + adgEsc(a.la) + '</i></p>' +
    (a.gr ? '<p class="adg-gr"><span class="adg-k">' + adgT("griego") + '</span> <span lang="grc">' + adgEsc(a.gr) + '</span> (<i>' + adgEsc(a.tr) + '</i>)</p>' : '') + '</div>' +
    (adgPrueba ? '<p class="adg-ayuda">' + adgT("pruebaAyuda") + '</p><button class="adg-desc" aria-expanded="false">' + adgT("descubrir") + '</button>' : '') +
    '<div class="adg-cuerpo">' +
      '<p class="adg-sen"><span class="adg-k">' + adgT("sentido") + '</span> ' + N(a.sen) + '</p>' +
      (a.uso ? '<p class="adg-uso"><span class="adg-k">' + adgT("uso") + '</span> ' + N(a.uso) + '</p>' : '') +
      (a.trampa ? '<p class="adg-trampa"><strong>' + adgT("trampa") + '.</strong> ' + N(a.trampa) + '</p>' : '') +
      '<p class="adg-o"><span class="adg-k">' + adgT("origen") + '</span> ' + N(a.o) + (a.er ? '. ' + N(adgT("erasmo", { n: a.er })) : '') + '.</p>' +
      adgTemas(a) +
    '</div></article>';
}

function adgHistoria(){
  const h = new Set(), p = k => '<p>' + adgNombres(adgT(k), h) + '</p>';
  return '<details class="adg-guia"><summary>' + adgT("hTit") + '</summary>' + p("h1") +
    '<h3>' + adgT("h2t") + '</h3>' + p("h2") + '<h3>' + adgT("h3t") + '</h3>' + p("h3") + p("h3b") +
    '<h3>' + adgT("h4t") + '</h3>' + p("h4") + p("h4b") +
    '<div class="adg-mont">' + [["montaigne_divisa", "pieDivisa"], ["montaigne_medalla", "pieMedalla"]].map(([f, k]) =>
      '<figure><img src="media/galeria_museo/adagios/' + f + '.jpg" alt="' + adgEsc(adgT(k)) + '" loading="lazy"><figcaption>' + adgT(k) + '</figcaption></figure>').join("") + '</div></details>' +
    '<details class="adg-guia"><summary>' + adgT("cTit") + '</summary><p>' + adgT("c0") + '</p><ol>' +
    '<li><strong>' + adgT("c1t") + '</strong> ' + adgT("c1") + '</li>' +
    '<li><strong>' + adgT("c2t") + '</strong><ol type="a">' + ["c2a", "c2b", "c2c", "c2d", "c2e"].map(k => '<li>' + adgT(k) + '</li>').join("") + '</ol>' +
      '<p class="adg-ej"><strong>' + adgT("cEjT") + '</strong> ' + adgNombres(adgT("cEj"), new Set()) + '</p></li>' +
    ["c3", "c4", "c5"].map(k => '<li><strong>' + adgT(k + "t") + '</strong> ' + adgT(k) + '</li>').join("") + '</ol></details>';
}

function adgRender(){
  const box = adgBox();
  if (!box) return;
  const l = ADAGIOS.filter(a => adgAmb === "all" || a.amb === adgAmb);
  box.innerHTML = '<div class="adg-grid">' + l.map(adgFicha).join("") + '</div>' +
    '<p class="adg-cuenta">' + (l.length === 1 ? adgT("cuenta1") : adgT("cuenta", { n: l.length })) + '</p>' + adgHistoria();
}

/* clics delegados (la caja se repinta con cada filtro) */
(() => {
  const box = adgBox();
  if (!box) return;
  box.addEventListener("click", e => {
    const d = e.target.closest(".adg-desc");
    if (d){ const c = d.closest(".adg-card"), oc = c.classList.toggle("adg-oculta");
      d.textContent = adgT(oc ? "descubrir" : "ocultar"); d.setAttribute("aria-expanded", String(!oc)); return; }
    const l = e.target.closest(".adg-lam");
    if (l){ const g = l.closest(".adg-card").querySelector(".adg-orig"); g.hidden = !g.hidden; l.setAttribute("aria-expanded", String(!g.hidden)); return; }
    const i = e.target.closest("[data-ilu]");
    if (i){ (window.show || show)("ilustres"); loadIlustre(i.dataset.ilu); return; }
    const t = e.target.closest("[data-th]");
    if (t){ (window.show || show)("teoria"); if (typeof window.loadTheory === "function") window.loadTheory(t.dataset.th); }
  });
})();

function loadAdagios(arg){
  const id = String(arg || "").split("/")[0];
  const a = ADAGIOS.find(x => x.id === id);
  if (a && adgAmb !== "all" && a.amb !== adgAmb){ adgAmb = "all"; adgFiltro(); }
  adgRender();
  const el = a && document.getElementById("adg-" + a.id);
  /* tras pintar: show() sube al principio de la vista y el enrutado inicial llega después */
  if (el){ el.classList.add("adg-marca"); setTimeout(() => el.scrollIntoView({ block: "center" }), 80); setTimeout(() => el.classList.remove("adg-marca"), 2600); }
}
window.loadAdagios = loadAdagios;
if (adgBox() && typeof ADAGIOS !== "undefined"){ adgFiltro(); adgRender(); }
