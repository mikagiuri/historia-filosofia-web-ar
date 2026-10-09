"use strict";
/* ===== «Rescritura» (09-10, Bachillerato) =====
   Dos pestañas sobre los datos de rescritura.js:
   · «Distinguir»: un fragmento clásico y sus cuatro versiones barajadas; el alumno etiqueta cada una (rescritura,
     copia, sinonimia, malinterpretación) y, al comprobar, ve por qué lo es.
   · «Escribe la tuya»: el alumno rescribe el fragmento y un análisis mecánico le marca los trozos copiados (cuatro
     palabras seguidas iguales) y el esqueleto calcado (las mismas palabras gramaticales en el mismo orden, señal de
     sinonimia). El sentido no lo puede juzgar la máquina: para eso, una lista de preguntas y una rescritura modelo.
   Enlace profundo: #rescritura/distinguir|escribir[/texto]. */

/* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
const RES_TXT = {
  tabDist: "التمييز", tabEscr: "اكتبوا صيغتكم", texto: "النص:", original: "الأصل",
  version: "الصيغة {l}", comprobar: "تحقّقوا", otraVez: "إعادة الخلط", siguiente: "النص التالي ←",
  faltan: "صنّفوا الصيغ الأربع قبل التحقق.", acierto: "صحيح", fallo: "لا: النوع هو {t}",
  puntos: "أصبتم في {n} من 4.", todo: "الأربع كلها! أصبحتم تميزون الفخاخ جيدًا.",
  terminos: "مصطلحات تقنية يمكنكم الاحتفاظ بها:", tusPalabras: "إعادة صياغتكم",
  ayudaEscr: "اقرؤوا الأصل ما شئتم من المرات، ثم غطّوه واكتبوا بكلماتكم ما يقوله. بعد ذلك انقروا على «تحليل».",
  analizar: "تحليل", corta: "اكتبوا أكثر قليلًا حتى يمكن تحليله: {n} كلمة على الأقل.", nPal: "{n} كلمة",
  copiado: "مقاطع منقولة من الأصل", sinCopia: "لا توجد مقاطع منقولة: لا يتطابق مع الأصل أي تسلسل من أربع كلمات.",
  pctCopia: "{p} % من نصكم يطابق الأصل حرفيًا.",
  esqueleto: "البنية", esqAlto: "يتبع نصكم هيكل الأصل: الكلمات النحوية نفسها بالترتيب نفسه ({p} % من التطابق). وهذه علامة الترادف: تتغير الكلمات فقط، لا بناء الجمل.",
  esqBajo: "بنية جملكم من صنعكم ({p} % من التطابق مع هيكل الأصل).",
  vCopia: "التشخيص: <strong>نسخ</strong>. نص حرفي أكثر من اللازم. إذا أردتم استعمال جملة للمؤلف، فضعوها بين علامتي اقتباس؛ وإلا فعبّروا عنها بطريقة أخرى.",
  vSinon: "التشخيص: <strong>ترادف محتمل</strong>. غيّرتم الكلمات، لكن لم تغيّروا طريقة القول.",
  vMezcla: "التشخيص: <strong>تقريبًا</strong>. نصكم من صنعكم في مجمله، لكن فيه مقطع منقول: أعيدوا كتابته أو ضعوه بين علامتي اقتباس.",
  vBien: "التشخيص: <strong>الصياغة من صنعكم</strong>. لا نسخ ولا محاكاة للبنية. وبقي الأهم، وهو ما لا تستطيع الآلة التحقق منه: أن تقولوا ما قاله المؤلف نفسه.",
  sentido: "تحققوا أنتم من المعنى",
  p1: "هل الفكرة الرئيسية للمؤلف موجودة، وليست فكرة أخرى تشبهها؟", p2: "هل حافظتم على الشروط والفروق الدقيقة («فقط» و«لا… بل» و«تقريبًا» و«يشترط»)؟",
  p3: "هل تجنبتم إضافة أفكار غير موجودة في النص (نتائج وآراء وأمثلة تغيّر المعنى)؟",
  p4: "هل حافظتم على مصطلحات المؤلف التقنية بدل استبدالها بمرادفات؟", p5: "هل سيفهم النصَّ شخصٌ لم يقرأ الأصل؟",
  verModelo: "عرض صياغة ممكنة", modelo: "صياغة ممكنة (وليست الوحيدة)",
  guiaTit: "دليل: كيف يُستعمل ولماذا", guia: "<h3>لماذا نستعملها؟</h3><p>في تحليل نص أو في امتحان، عليكم أن تشرحوا بكلماتكم ما يقوله مؤلف. وهناك ثلاث طرق للإخفاق في ذلك دون أن تنتبهوا: النسخ، واستبدال الكلمات بمرادفاتها، وفهم شيء آخر. تتعلمون هنا كيف تتعرفون عليها في نصوص الآخرين وكيف تتجنبونها في نصوصكم.</p><h3>كيف نستعملها</h3><ol><li>اقرؤوا التعريفات الأربعة في الأعلى.</li><li>في «التمييز»، اختاروا نصًا، واقرؤوا الأصل، وصنّفوا كل صيغة من الصيغ الأربع بالأزرار. انقروا على «تحقّق» واقرؤوا سبب تصنيف كل صيغة. بـ«إعادة الخلط» يتغير ترتيبها؛ وبـ«النص التالي» تنتقلون إلى مؤلف آخر.</li><li>في «اكتبوا صيغتكم»، أعيدوا أنتم صياغة المقطع نفسه وانقروا على «تحليل». سترون المقاطع المنقولة مظللةً، وهل حاكيتم البنية. بعد ذلك راجعوا قائمة «تحققوا أنتم من المعنى» وقارنوا مع الصياغة النموذجية.</li></ol><h3>حيل لإعادة صياغة جيدة</h3><ul><li>اقرؤوا النص حتى تفهموه، ثم غطّوه واكتبوه من الذاكرة، كما لو كنتم تشرحونه لشخص ما.</li><li>ابدؤوا بطريقة أخرى: «بالنسبة إلى كانط…» و«حسب المؤلف…» و«يرى النص أن…».</li><li>غيّروا البناء: صلوا الجمل أو افصلوها، وغيّروا ترتيب الأفكار، وحوّلوا مثالًا إلى فكرة عامة أو العكس.</li><li>احتفظوا بالمصطلحات التقنية («القصور» و«الفضيلة» و«نمط الإنتاج»): فهي ليست نسخًا، بل هي مفردات المؤلف. وإذا لزم الأمر فاشرحوها.</li><li>إذا كانت جملة جيدة إلى حد أنكم تريدون استعمالها كما هي، فضعوها بين علامتي اقتباس.</li></ul>",
  aviso: "التحليل آلي: يعدّ الكلمات ولا يفهم ما تقولونه. قد يخرج نص «بلا نسخ» وهو سوء تأويل."
};
const resT = (k, v) => String(RES_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const resEsc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const RES = { tab: "distinguir", id: "", orden: [], resp: {}, hecho: false, escrito: {} };
const resBox = () => document.getElementById("rescriturabox");
/* (09-10) de la frase más corta al texto más largo (hasta la longitud de la PAU); se cuenta en el idioma de la web */
const resLargo = t => String(t.original).replace(/<[^>]+>/g, " ").split(/\s+/).filter(w => /[\wÀ-ÿ]/.test(w)).length;
let RES_ORD = null;
const resTextos = () => RES_ORD || (RES_ORD = (typeof RESCRITURA_TEXTOS !== "undefined" ? RESCRITURA_TEXTOS : []).slice().sort((a, b) => resLargo(a) - resLargo(b)));
const resTipos = () => (typeof RESCRITURA_TIPOS !== "undefined" ? RESCRITURA_TIPOS : {});
const RES_ORDEN_TIPOS = ["rescritura", "copia", "sinonimia", "malinterpretacion"];
const resActual = () => resTextos().find(t => t.id === RES.id) || resTextos()[0];
function resBarajar(){
  const a = [0, 1, 2, 3];
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  RES.orden = a; RES.resp = {}; RES.hecho = false;
}

/* ---------- análisis mecánico ---------- */
/* palabras gramaticales (castellano y euskera): forman el «esqueleto» de una frase y no cuentan como contenido */
const RES_GRAM = new Set(("el la los las lo un una unos unas de del al a ante en y e o u ni que no se su sus le les me te nos mi tu con por para sin sobre entre hasta desde como pero sino si es son ha han hay ser era fue está están este esta esto estos estas ese esa eso esos esas cada todo toda todos todas otro otra otros otras mismo misma él ella ellos ellas uno quien cual cuando donde más menos muy ya también solo porque pues así tan tanto ese cuyo cuya mientras entonces aunque hacia tras " +
  "eta da dira ez bat ere du dute dio zen ziren baina edo hau hori hura honek horrek hark beste bere gure zer nola bezala baino oso baita izan dago daude ditu dituzte gabe arte guztiak guztia ezin dela duela zuen dituen den diren beraz orduan baldin bada badira").split(" "));
function resPalabras(s){
  return String(s).replace(/<[^>]+>/g, " ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-zñ0-9]+/g) || [];
}
function resLCS(a, b){
  const m = a.length, n = b.length, d = Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++){ let prev = 0; for (let j = 1; j <= n; j++){ const t = d[j]; d[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(d[j], d[j - 1]); prev = t; } }
  return d[n];
}
/* devuelve: palabras del alumno, marcas de copia (índices), % copiado y % de esqueleto común */
function resAnalizar(original, escrito, terminos){
  const o = resPalabras(original), w = resPalabras(escrito), N = 4;
  const grams = new Set(); for (let i = 0; i + N <= o.length; i++) grams.add(o.slice(i, i + N).join(" "));
  const marca = new Array(w.length).fill(false);
  for (let i = 0; i + N <= w.length; i++) if (grams.has(w.slice(i, i + N).join(" "))) for (let k = i; k < i + N; k++) marca[k] = true;
  /* un trozo coincidente hecho solo de palabras gramaticales y términos técnicos («hacia lo que es») no es copia */
  const tec = new Set(resPalabras((terminos || []).join(" ")));
  for (let i = 0; i < w.length;){
    if (!marca[i]){ i++; continue; }
    let j = i; while (j < w.length && marca[j]) j++;
    if (w.slice(i, j).every(x => RES_GRAM.has(x) || tec.has(x))) for (let k = i; k < j; k++) marca[k] = false;
    i = j;
  }
  const copia = w.length ? Math.round(100 * marca.filter(Boolean).length / w.length) : 0;
  const go = o.filter(x => RES_GRAM.has(x)), gw = w.filter(x => RES_GRAM.has(x));
  const esq = go.length && gw.length ? Math.round(100 * resLCS(go, gw) / Math.max(go.length, gw.length)) : 0;
  const ratio = o.length ? w.length / o.length : 0;
  return { n: w.length, marca, copia, esq, ratio };
}
function resVeredicto(a){
  if (a.copia >= 40) return "vCopia";
  if (a.esq >= 60 && a.ratio > 0.75 && a.ratio < 1.35) return "vSinon";
  if (a.copia > 0) return "vMezcla";
  return "vBien";
}
/* el texto del alumno con los trozos copiados resaltados (se recorre el texto original para conservar mayúsculas y signos) */
function resResaltar(escrito, marca){
  let i = 0, out = "", last = 0;
  String(escrito).replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/g, (m, pos) => { out += resEsc(escrito.slice(last, pos)) + (marca[i++] ? "<mark>" + m + "</mark>" : m); last = pos + m.length; return m; });
  return (out + resEsc(escrito.slice(last))).replace(/<\/mark>(\s+)<mark>/g, "$1");
}

/* ---------- pintado ---------- */
function resSelector(){
  return '<label class="res-sel">' + resT("texto") + ' <select id="res-texto" class="lg-sel">' +
    resTextos().map(t => '<option value="' + t.id + '"' + (t.id === resActual().id ? " selected" : "") + ">" + t.autor + " · " + resT("nPal", { n: resLargo(t) }) + "</option>").join("") + "</select></label>";
}
function resOriginal(t){
  return '<div class="res-original"><p class="res-eti">' + resT("original") + '</p><blockquote>' + t.original + '</blockquote><p class="res-ref">' + t.autor + ", " + t.obra + "</p></div>";
}
function resDistinguir(){
  const t = resActual(), tipos = resTipos(); if (!RES.orden.length) resBarajar();
  const ok = RES.hecho ? RES.orden.filter((v, i) => RES.resp[i] === t.versiones[v].tipo).length : 0;
  return resOriginal(t) + RES.orden.map((v, i) => {
    const ver = t.versiones[v], r = RES.resp[i], bien = r === ver.tipo;
    return '<article class="res-version' + (RES.hecho ? (bien ? " res-ok" : " res-mal") : "") + '"><p class="res-eti">' + resT("version", { l: "ABCD"[i] }) + "</p><p>" + ver.texto + '</p><div class="fgroup res-opc">' +
      RES_ORDEN_TIPOS.map(k => '<button type="button" class="fbtn" data-resv="' + i + '" data-rest="' + k + '" aria-pressed="' + (r === k) + '"' + (RES.hecho ? " disabled" : "") + ">" + tipos[k].nombre + "</button>").join("") + "</div>" +
      (RES.hecho ? '<p class="res-fb"><strong>' + (bien ? resT("acierto") : resT("fallo", { t: tipos[ver.tipo].nombre.toLowerCase() })) + ".</strong> " + ver.porque + "</p>" : "") + "</article>";
  }).join("") +
    '<p class="res-acciones">' + (RES.hecho ? '<strong class="res-punt">' + (ok === 4 ? resT("todo") : resT("puntos", { n: ok })) + "</strong> " +
      '<button type="button" class="btn ghost" data-res="barajar">' + resT("otraVez") + '</button> <button type="button" class="btn" data-res="sig">' + resT("siguiente") + "</button>"
      : '<button type="button" class="btn" data-res="comprobar">' + resT("comprobar") + '</button> <span id="res-aviso" class="res-aviso"></span>') + "</p>";
}
function resEscribir(){
  const t = resActual(), val = RES.escrito[t.id] || "";
  return resOriginal(t) + '<p class="res-terminos">' + resT("terminos") + " " + t.terminos.map(x => "<em>" + x + "</em>").join(", ") + "</p>" +
    '<label class="res-eti" for="res-area">' + resT("tusPalabras") + '</label><p class="res-ayuda">' + resT("ayudaEscr") + "</p>" +
    '<textarea id="res-area" class="res-area" rows="6">' + resEsc(val) + '</textarea><p><button type="button" class="btn" data-res="analizar">' + resT("analizar") + '</button></p><div id="res-resultado"></div>';
}
function resResultado(){
  const t = resActual(), escrito = (document.getElementById("res-area") || {}).value || "", out = document.getElementById("res-resultado");
  if (!out) return; RES.escrito[t.id] = escrito;
  const a = resAnalizar(t.original, escrito, t.terminos);
  const minimo = Math.min(12, Math.ceil(0.6 * resLargo(t)));   // un original de una frase corta admite una rescritura corta
  if (a.n < minimo){ out.innerHTML = '<p class="res-aviso">' + resT("corta", { n: minimo }) + "</p>"; return; }
  const modelo = t.versiones.find(v => v.tipo === "rescritura");
  out.innerHTML = '<div class="res-diag res-' + resVeredicto(a) + '"><p>' + resT(resVeredicto(a)) + "</p></div>" +
    "<h3>" + resT("copiado") + "</h3>" + (a.copia ? "<p>" + resT("pctCopia", { p: a.copia }) + '</p><p class="res-tuyo">' + resResaltar(escrito, a.marca) + "</p>" : "<p>" + resT("sinCopia") + "</p>") +
    "<h3>" + resT("esqueleto") + "</h3><p>" + resT(a.esq >= 60 && a.ratio > 0.75 && a.ratio < 1.35 ? "esqAlto" : "esqBajo", { p: a.esq }) + "</p>" +
    "<h3>" + resT("sentido") + '</h3><ul class="res-lista">' + ["p1", "p2", "p3", "p4", "p5"].map(k => '<li><label><input type="checkbox"> ' + resT(k) + "</label></li>").join("") + "</ul>" +
    '<details class="res-modelo"><summary>' + resT("verModelo") + "</summary><p>" + modelo.texto + '</p><p class="res-ayuda">' + modelo.porque + "</p></details>" +
    '<p class="res-ayuda">' + resT("aviso") + "</p>";
}
function resRender(){
  const box = resBox(); if (!box || !resTextos().length) return;
  if (!RES.id) RES.id = resTextos()[0].id;
  const tipos = resTipos();
  box.innerHTML = '<details class="res-guia"><summary>' + resT("guiaTit") + "</summary>" + resT("guia") + "</details>" + '<div class="res-tipos">' + RES_ORDEN_TIPOS.map(k => '<div class="res-tipo res-t-' + k + '"><strong>' + tipos[k].nombre + "</strong><span>" + tipos[k].def + "</span></div>").join("") + "</div>" +
    '<div class="fgroup res-tabs" role="tablist">' + [["distinguir", "tabDist"], ["escribir", "tabEscr"]].map(([k, l]) => '<button type="button" class="fbtn" data-restab="' + k + '" aria-pressed="' + (RES.tab === k) + '">' + resT(l) + "</button>").join("") + "</div>" +
    '<div class="res-panel">' + resSelector() + (RES.tab === "escribir" ? resEscribir() : resDistinguir()) + "</div>";
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const box = resBox(); if (!box || !box.contains(e.target)) return;
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.restab){ RES.tab = b.dataset.restab; resRender(); return; }
  if (b.dataset.resv != null){ RES.resp[b.dataset.resv] = b.dataset.rest; resRender(); return; }
  const a = b.dataset.res;
  if (a === "comprobar"){
    if (Object.keys(RES.resp).length < 4){ const av = document.getElementById("res-aviso"); if (av) av.textContent = resT("faltan"); return; }
    RES.hecho = true; resRender();
  } else if (a === "barajar"){ resBarajar(); resRender(); }
  else if (a === "sig"){ const ts = resTextos(), i = ts.findIndex(t => t.id === resActual().id); RES.id = ts[(i + 1) % ts.length].id; resBarajar(); resRender(); window.scrollTo({ top: box.offsetTop - 80 }); }
  else if (a === "analizar") resResultado();
});
document.addEventListener("change", e => {
  if (e.target.id !== "res-texto") return;
  RES.id = e.target.value; resBarajar(); resRender();
});
document.addEventListener("input", e => { if (e.target.id === "res-area") RES.escrito[resActual().id] = e.target.value; });

function loadRescritura(arg){
  const [modo, id] = String(arg || "").split("/");
  if (modo === "distinguir" || modo === "escribir") RES.tab = modo;
  if (id && resTextos().some(t => t.id === id)){ RES.id = id; resBarajar(); }
  resRender();
}
if (resBox()) resRender();
