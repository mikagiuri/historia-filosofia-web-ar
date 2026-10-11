"use strict";
/* ===== Mapa de la web (11-10-2026) =====
   Petición del profesor: un mapa de la web dentro de la propia web. Se abre desde el pie («Mapa de la web», #mapa).
   Se construye al cargar a partir del menú (#tabs) tal como lo deja cada build, así que cada web publicada
   (Filosofía 1.º, HF, ESO, y sus traducciones) muestra solo sus secciones, en el orden del menú, con una línea
   de qué hay en cada una y, cuando se puede contar, cuántos elementos tiene. Debajo, los temas de cada materia
   con sus exploraciones (de Itinerario.temasDe) y, dentro de Ilustres, las fichas de época.
   Los textos van en MAPA_TXT y MAPA_DESC (se traducen con el diccionario de interfaz ui/<lang>.json). */
const MAPA_TXT = {
  secciones: "الأقسام", temas: "مواضيع كل مادة", tema: "الموضوع {n}", exploraciones: "استكشافات",
  epocas: "بطاقات الحقب", otras: "أقسام أخرى", elementos: "عناصر"
};
const MAPA_SUBJ = { fil: "الفلسفة، السنة الأولى باكالوريا", hf: "تاريخ الفلسفة، السنة الثانية باكالوريا", ipc: "التفكير النقدي، السنة الثانية إعدادي (2.º ESO)" };
const MAPA_DESC = {
  inicio: "الصفحة الرئيسية للورشة، مع المواد الثلاث واستعمال الزمن.",
  fil: "بطاقة المادة: المواضيع والموارد وطريقة الدراسة.",
  hf: "بطاقة المادة: المواضيع والموارد وطريقة الدراسة.",
  ipc: "بطاقة المادة: الوحدات والموارد وطريقة الدراسة.",
  sesiones: "ما نقوم به في كل حصة.",
  calendario: "تواريخ السنة الدراسية والتقويمات والامتحانات.",
  tiempo: "توزيع الوقت على كل موضوع.",
  teoria: "دروس كل موضوع، مع استكشافاتها للتعمّق أكثر.",
  clases: "دروس التفكير النقدي، حصة بعد حصة.",
  materiales: "أوراق عمل وأنشطة ووثائق للتحميل.",
  cuentos: "قصص للتفكير، مع أسئلتها.",
  tarjetas: "بطاقات للمراجعة: السؤال في الوجه، والجواب في الظهر.",
  reto: "أسئلة ضد الساعة للمراجعة باللعب.",
  parejas: "لعبة ذاكرة: صِلوا كل مفهوم بزوجه.",
  glosario: "مفاهيم كل موضوع، مع تعريفها وأصلها.",
  ilustres: "سِيَر المفكرين وبطاقات كل حقبة.",
  citas: "أقوال مشهورة للفلاسفة، مع شرحها.",
  adagios: "مأثورات كلاسيكية باللاتينية واليونانية، مع قصتها.",
  mundo: "لو كان القسم هو العالم: معطيات الكوكب في قسمكم.",
  camino: "قصص تختارون فيها ما تفعلون وترون النتائج.",
  eudaimonia: "لعبة عن السعادة عند أرسطو.",
  republica: "لعبة لتنظيم المدينة المثالية عند أفلاطون.",
  rayuela: "اكتشفوا التناقض في نصوص الفلاسفة.",
  nudos: "مسائل تبدو سهلة وليست كذلك.",
  dilemas: "حالات صعبة لمناقشة ما هو صواب.",
  logica: "جداول الصدق والقياسات ومربع التقابل والمخططات.",
  leibniz: "لايبنتز واختراعاته: الآلة الحاسبة والنظام الثنائي وحساب التفاضل والتكامل.",
  infografias: "كل موضوع ملخَّص في صورة واحدة.",
  galeria: "أعمال فنية ورسوم توضيحية للمواضيع.",
  mapas: "خرائط المفاهيم للمواضيع.",
  cronogramas: "خطوط زمنية للمؤلفين والعصور.",
  genealogias: "من أثّر في من: أساتذة وتلاميذ وخصوم.",
  esquemas: "خطاطات للأفكار الرئيسية في كل موضوع.",
  esqautor: "ملخص لكل مؤلف، استعدادًا لـ PAU.",
  diapositivas: "عروض تقديمية للمواضيع.",
  rescritura: "تعلّموا إعادة كتابة نص بكلماتكم.",
  pistas: "مسائل مع تلميحات تظهر شيئًا فشيئًا.",
  cuestionarios: "أسئلة اختيار من متعدد لكل موضوع، مع التصحيح.",
  juegosucio: "فخاخ النقاش، لتتعرّفوا عليها.",
  unidad: "كل أسئلة الوحدة، مجتمعة.",
  rubricas: "كيف تُصحَّح الأعمال والامتحانات.",
  evidencias: "شواهد على التعلّم من السنة الماضية.",
  recursos: "روابط وأدوات خارجية.",
  pau: "كيف يجري امتحان الولوج إلى الجامعة.",
  comentario: "كيف يُنجَز تحليل النص، مع أمثلة محلولة.",
  disertaciones: "كيف يُكتب الإنشاء الفلسفي، مع نماذج.",
  lecturas: "نصوص المؤلفين للقراءة والتحليل.",
  tutoria: "موارد الإرشاد التربوي.",
  signos: "دورة في لغة الإشارة."
};
/* cuántos elementos tiene cada sección (si su colección está cargada en esta web) */
const MAPA_CUENTA = { tarjetas: "DECKS", cuestionarios: "QUIZZES", glosario: "GLOSARIO", ilustres: "ILUSTRES", citas: "CITAS", adagios: "ADAGIOS",
  infografias: "INFOGRAFIAS", mapas: "MAPS", esquemas: "ESQUEMAS", cronogramas: "CRONOGRAMAS", genealogias: "GENEALOGIAS", lecturas: "LECTURAS",
  galeria: "GALERIA", dilemas: "DILEMAS", disertaciones: "DISERTACIONES", nudos: "NUDOS", pistas: "PISTAS", materiales: "MATERIALS" };
function mapaG(name){ try { return (0, eval)("typeof " + name + " !== 'undefined' ? " + name + " : undefined"); } catch (e){ return undefined; } }
function mapaEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function mapaStrip(s){ return String(s == null ? "" : s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
function mapaCuenta(v){
  if (v === "teoria"){ const It = window.Itinerario; return It && It.temasDe ? ["fil", "hf", "ipc"].reduce((n, s) => n + It.temasDe(s, true).length, 0) : 0; }
  const c = MAPA_CUENTA[v] && mapaG(MAPA_CUENTA[v]);
  return c ? (Array.isArray(c) ? c.length : Object.keys(c).length) : 0;
}
function mapaItem(el){
  if (el.tagName === "A") return '<li><a class="mapa-a" href="' + mapaEsc(el.getAttribute("href")) + '" target="_blank" rel="noopener">' + mapaEsc(mapaStrip(el.innerHTML)) + '</a></li>';
  const v = el.dataset.view; if (!v || v === "mapa" || !document.getElementById(v)) return "";
  const n = mapaCuenta(v), extra = v === "ilustres" ? mapaEpocas() : "";
  return '<li><button type="button" class="mapa-a" data-igo="' + mapaEsc(v) + '" data-iarg="">' + mapaEsc(mapaStrip(el.textContent)) + '</button>' +
    (n ? ' <span class="mapa-n" title="' + n + " " + MAPA_TXT.elementos + '">' + n + '</span>' : '') +
    (MAPA_DESC[v] ? '<span class="mapa-d">' + mapaEsc(MAPA_DESC[v]) + '</span>' : '') + extra + '</li>';
}
function mapaEpocas(){
  const EF = mapaG("EPOCAS_FICHAS"); if (!EF || typeof iluNombreFicha !== "function") return "";
  return '<span class="mapa-sub"><b>' + MAPA_TXT.epocas + ':</b> ' + Object.keys(EF).map(k =>
    '<button type="button" class="mapa-a" data-igo="ilustres" data-iarg="epoca-' + k + '">' + mapaEsc(iluNombreFicha(k)) + '</button>').join(" · ") + '</span>';
}
function mapaTemas(){
  const It = window.Itinerario, T = mapaG("THEORY"); if (!It || !It.temasDe || !T) return "";
  const lab = k => { const o = T[k], n = It.temaOf("teoria", k, o); return (o.sigla ? o.sigla + " · " : typeof n === "number" ? MAPA_TXT.tema.replace("{n}", n) + " · " : "") + mapaStrip(o.title); };
  const lnk = k => '<button type="button" class="mapa-a" data-igo="teoria" data-iarg="' + mapaEsc(k) + '">' + mapaEsc(lab(k)) + '</button>';
  const exp = k => mapaStrip(T[k].title).replace(/^(Exploración|Esplorazioa|Exploration|Anexo|Eranskina|Annexe|Annex|Appendix|استكشاف)\s*[-–:]\s*/, "");
  return ["fil", "hf", "ipc"].map(s => {
    const ks = It.temasDe(s); if (!ks.length) return "";
    const todos = It.temasDe(s, true), anexos = todos.filter(k => It.esAnexo && It.esAnexo(T[k]));
    return '<div class="mapa-grupo"><h3>' + mapaEsc(MAPA_SUBJ[s]) + '</h3><ol class="mapa-temas">' + ks.map(k => {
      const n = It.temaOf("teoria", k, T[k]), ex = T[k].sigla ? [] : anexos.filter(a => T[a].temaN === n);
      return '<li>' + lnk(k) + (ex.length ? '<details class="mapa-exp"><summary>' + MAPA_TXT.exploraciones + ' (' + ex.length + ')</summary><ul>' +
        ex.map(a => '<li><button type="button" class="mapa-a" data-igo="teoria" data-iarg="' + mapaEsc(a) + '">' + mapaEsc(exp(a)) + '</button></li>').join("") + '</ul></details>' : '') + '</li>';
    }).join("") + '</ol></div>';
  }).join("");
}
function renderMapa(){
  const box = document.getElementById("mapabox"), tabs = document.getElementById("tabs"); if (!box || !tabs) return;
  const grupos = [], sueltos = [];
  [...tabs.children].forEach(el => {
    if (el.classList.contains("navsec")){
      const g = el.querySelector(".navgroup"), items = [...el.querySelectorAll(".navmenu > button, .navmenu > a")].map(mapaItem).join("");
      if (items) grupos.push('<div class="mapa-grupo"><h3>' + mapaEsc(mapaStrip(g ? g.textContent : "")) + '</h3><ul class="mapa-lista">' + items + '</ul></div>');
    } else if (el.matches("button[data-view], a")) sueltos.push(mapaItem(el));
  });
  const s = sueltos.join("");
  box.innerHTML = '<h2 class="sec">' + MAPA_TXT.secciones + '</h2><div class="mapa-cols">' +
    (s ? '<div class="mapa-grupo"><h3>' + MAPA_TXT.otras + '</h3><ul class="mapa-lista">' + s + '</ul></div>' : '') + grupos.join("") + '</div>' +
    (function(){ const t = mapaTemas(); return t ? '<h2 class="sec">' + MAPA_TXT.temas + '</h2><div class="mapa-cols">' + t + '</div>' : ""; })();
}
document.addEventListener("DOMContentLoaded", () => { try { renderMapa(); } catch (e){} });
