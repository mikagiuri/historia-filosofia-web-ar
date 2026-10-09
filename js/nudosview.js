"use strict";
/* ===== «Nudos: ¿encajan tus razones?» (09-10, Bachillerato) — vista sobre nudos.js (NUDOS) =====
   El alumno contesta afirmaciones (de acuerdo / en desacuerdo / depende, diciendo de qué). Cuando dos respuestas
   chocan aparece un nudo, y se deshace ESCRIBIENDO: cambiar una respuesta (y decir qué te hizo cambiar),
   distinguir (nombrar la diferencia relevante) o morder la bala (aceptar la consecuencia). Hay nudos aparentes,
   que parecen contradicción y no lo son. Sin nota, sin perfil, sin comparar con nadie y sin guardar nada:
   al final, un «cuaderno de razones» para imprimir o copiar. Enlace profundo: #nudos/<módulo>. */

/* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
const NUD_TXT = {
  intro: "ستقرؤون بعض العبارات وتقولون هل أنتم موافقون أم غير موافقين أم أن ذلك يتوقف على شيء، وعلى ماذا. وحين يتعارض جوابان من أجوبتكم ستظهر عقدة. ولكي تحلّوها عليكم أن تكتبوا سببًا.",
  intro2: "لا توجد أجوبة صحيحة، ولا توجد نقطة، ولا يقارن أحد أجوبتكم بأجوبة غيركم. لا يُحفظ شيء ولا يخرج شيء من هذا المتصفح. وفي النهاية سيكون لديكم دفتر أسبابكم لتطبعوه أو تنسخوه.",
  nAfs: "{n} عبارة · {m} عقدة ممكنة", empezar: "ابدؤوا",
  afirmacion: "العبارة {i} من {n}", piensas: "ما رأيكم؟",
  vA: "موافق", vD: "غير موافق", vP: "يتوقف على",
  deQue: "على ماذا يتوقف؟ اذكروا حالة واحدة على الأقل يصح فيها ذلك وأخرى لا يصح فيها.",
  nPal: "{n} كلمة (الحد الأدنى {m})", siguiente: "التالي", volver: "رجوع", salir: "خروج",
  tuResp: "جوابكم: {v}",
  nudo: "عقدة", nudoAp: "عقدة ظاهرية",
  nudoTit: "هذان الجوابان يسيران في اتجاهين متعاكسين", nudoApTit: "يبدو هذا تناقضًا…",
  apExplica: "اشرحوه بكلماتكم: لماذا لا يكون تناقضًا؟", seguir: "متابعة",
  elige: "اختاروا كيف تحلّونها. لا يوجد خيار صحيح: المهم هو السبب الذي تقدمونه.",
  oCa: "✏️ أغيّر جوابي عن العبارة الأولى", oCb: "✏️ أغيّر جوابي عن العبارة الثانية",
  oDi: "🔍 أُبقي على الاثنين: هناك فرق مهم يفسّر ذلك",
  oBa: "🦷 أُبقي على الاثنين وأقبل النتيجة («أعضّ على الرصاصة»)",
  pCambio: "ما الذي جعلكم تغيّرون رأيكم؟",
  pDist: "ما الفرق المهم بين الحالتين؟ سمّوه واشرحوا لماذا هو مهم.",
  pBala: "ما النتيجة التي تقبلونها بالضبط، ولماذا ترونها مقبولة؟",
  reContestar: "الإجابة من جديد عن تلك العبارة", guardar: "حفظ سببي",
  saberMas: "لمعرفة المزيد:",
  cuaderno: "دفتر أسبابكم", cuadSub: "بلا نقطة وبلا ملف تعريفي: المهم هو ما كتبتموه.",
  misResp: "أجوبتي", dependeDe: "يتوقف على: {t}",
  misNudos: "عُقدي وكيف حللتها",
  lCambio: "غيّرتُ رأيي بشأن «{a}»: من «{de}» إلى «{x}».", porQue: "السبب: {t}",
  lDist: "ميّزتُ بين «{a}» و«{b}».", lBala: "عضضتُ على الرصاصة بين «{a}» و«{b}».", lAp: "عقدة ظاهرية بين «{a}» و«{b}».",
  miRazon: "سببي: {t}",
  sinNudos: "لم تظهر أي عقدة مع أجوبتكم. هل لأنكم متسقون أم لأنكم أجبتم كثيرًا بـ«يتوقف على»؟ قد يكون الأمران صحيحين.",
  sinNudosPocoP: "لم تظهر أي من عقدنا، لكن هذا لا يثبت أنه لا توجد عقد: ابحثوا أنتم عن واحدة بين أجوبتكم واكتبوها في التحدي الأخير.",
  reto: "التحدي الأخير", retoTxt: "اختاروا الجواب الذي أنتم أكثر ثقة منه، واكتبوا أفضل اعتراض يمكن توجيهه إليه. ثم أجيبوا عنه.",
  imprimir: "طباعة أو حفظ بصيغة PDF", copiar: "نسخ كنص", inicio: "العودة إلى البداية",
  copiado: "تم النسخ.", noCopia: "تعذّر النسخ؛ استعملوا «طباعة».",
  guiaTit: "دليل: كيف يُستعمل ولماذا",
  guia: "<h3>لماذا نستعملها؟</h3><p>التفكير الجيد ليس امتلاك آراء كثيرة، بل أن تنسجم فيما بينها وأن نعرف كيف نقدم أسبابها. تكتشفون هنا أين تتعارض أجوبتكم أنتم، وتتمرنون على الطرق الشريفة الثلاث لحل التعارض: تغيير الرأي، أو الإشارة إلى فرق مهم بين الحالتين، أو قبول نتيجة محرجة. وفي الحالات الثلاث عليكم أن تكتبوا السبب.</p><h3>كيف نستعملها</h3><ol><li>اختاروا وحدة وأجيبوا عن العبارات واحدةً واحدة. إذا اخترتم «يتوقف على»، فاشرحوا على ماذا.</li><li>حين تظهر عقدة، اقرؤوا لماذا تتعارض أجوبتكم واختاروا كيف تحلّونها. إذا غيّرتم جوابًا، فستعودون إلى تلك العبارة ثم تتابعون من حيث كنتم.</li><li>بعض العقد ظاهرية: تبدو تناقضًا وهي ليست كذلك. اشرحوا بكلماتكم لماذا.</li><li>في النهاية، راجعوا دفتر أسبابكم، وأجيبوا عن التحدي الأخير، واطبعوه إذا طُلب منكم ذلك.</li></ol><h3>انتبهوا</h3><ul><li>لا توجد أجوبة صحيحة ولا نقاط: العقدة ليست خطأً، بل هي دعوة إلى التفكير.</li><li>ليس كل تعارض تناقضًا. التمييز الجيد بين حالتين له قيمة مثل قيمة تغيير الرأي.</li><li>أجوبتكم لا تُرسل إلى أي مكان ولا تُقارن بأجوبة أحد.</li></ul>"
};
const nudT = (k, v) => String(NUD_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const nudEsc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nudPal = s => (String(s).trim().match(/\S+/g) || []).length;
const nudBox = () => document.getElementById("nudosbox");
let NUD = null;   // estado del recorrido: { m, orden, pos, resp, hechos, log, volverA }

function nudVal(v){ return nudT({ A: "vA", D: "vD", P: "vP" }[v]); }
function nudPar(n){ const [a, b] = n.k.split("|").map(x => x.split("=")); return { a: a[0], av: a[1], b: b[0], bv: b[1] }; }

function nudInicio(){
  NUD = null;
  const box = nudBox(); if (!box) return;
  box.innerHTML = '<details class="nud-guia"><summary>' + nudT("guiaTit") + "</summary>" + nudT("guia") + "</details>" +
    '<div class="nud-card"><p>' + nudT("intro") + '</p><p class="nud-muted">' + nudT("intro2") + "</p></div>" +
    '<div class="nud-mods">' + NUDOS.map(m => '<button type="button" class="nud-mod" data-nudmod="' + m.id + '"><strong>' + m.titulo + '</strong><span class="nud-muted">' + m.sub + '</span><span class="nud-small">' +
      nudT("nAfs", { n: Object.keys(m.afs).length, m: m.nudos.length }) + "</span></button>").join("") + "</div>";
  box.querySelectorAll("[data-nudmod]").forEach(b => b.onclick = () => nudEmpezar(b.dataset.nudmod));
}

function nudEmpezar(id){
  const m = NUDOS.find(x => x.id === id) || NUDOS[0];
  NUD = { m, orden: Object.keys(m.afs), pos: 0, resp: {}, hechos: new Set(), log: [], volverA: null };
  nudPregunta();
}

function nudPregunta(motivo){
  const box = nudBox(), id = NUD.orden[NUD.pos], r = motivo != null ? {} : (NUD.resp[id] || {});
  box.innerHTML = '<div class="nud-card"><p class="nud-small nud-muted">' + NUD.m.titulo + " · " + nudT("afirmacion", { i: NUD.pos + 1, n: NUD.orden.length }) + "</p>" +
    '<p class="nud-stmt" id="nud-enun">' + NUD.m.afs[id] + "</p>" +
    '<fieldset class="nud-fs" aria-labelledby="nud-enun"><legend class="nud-small nud-muted">' + nudT("piensas") + '</legend><div class="nud-opts">' +
    ["A", "D", "P"].map(v => '<label class="nud-opt"><input type="radio" name="nud-v" value="' + v + '"' + (r.v === v ? " checked" : "") + "><span>" + nudVal(v) + "</span></label>").join("") +
    '</div></fieldset><div id="nud-dep"' + (r.v === "P" ? "" : " hidden") + '><label class="nud-lab" for="nud-deptx">' + nudT("deQue") + '</label><textarea id="nud-deptx">' + nudEsc(r.dep || "") + '</textarea><div class="nud-count" id="nud-depc"></div></div>' +
    '<p class="nud-row"><button type="button" class="btn" id="nud-sig" disabled>' + nudT("siguiente") + "</button>" +
    (NUD.pos > 0 && motivo == null ? ' <button type="button" class="btn ghost" id="nud-atr">' + nudT("volver") + "</button>" : "") +
    ' <button type="button" class="btn ghost" id="nud-sal">' + nudT("salir") + "</button></p></div>";
  const val = () => (box.querySelector("input[name=nud-v]:checked") || {}).value;
  const ok = () => {
    const v = val(), n = nudPal(document.getElementById("nud-deptx").value);
    document.getElementById("nud-dep").hidden = v !== "P";
    document.getElementById("nud-depc").textContent = v === "P" ? nudT("nPal", { n, m: 8 }) : "";
    document.getElementById("nud-sig").disabled = !v || (v === "P" && n < 8);
  };
  box.querySelectorAll("input[name=nud-v]").forEach(x => x.onchange = ok);
  document.getElementById("nud-deptx").oninput = ok; ok();
  document.getElementById("nud-sal").onclick = nudInicio;
  const atr = document.getElementById("nud-atr"); if (atr) atr.onclick = () => { NUD.pos--; nudPregunta(); };
  document.getElementById("nud-sig").onclick = () => {
    const v = val(), antes = NUD.resp[id];
    NUD.resp[id] = { v, dep: v === "P" ? document.getElementById("nud-deptx").value.trim() : "" };
    if (antes && antes.v !== v){
      NUD.log.push({ tipo: "cambio", id, de: antes.v, a: v, razon: motivo || "" });
      for (const k of [...NUD.hechos]) if (k.split("|").some(x => x.split("=")[0] === id)) NUD.hechos.delete(k);   // sus nudos se vuelven a evaluar
    }
    nudSiguiente();
  };
  window.scrollTo({ top: box.offsetTop - 80 });
}

function nudPendiente(){
  return NUD.m.nudos.find(n => {
    if (NUD.hechos.has(n.k)) return false;
    const p = nudPar(n), ra = NUD.resp[p.a], rb = NUD.resp[p.b];
    return ra && rb && ra.v === p.av && rb.v === p.bv;
  });
}

function nudSiguiente(){
  const n = nudPendiente();
  if (n) return nudNudo(n);
  if (NUD.volverA != null){ NUD.pos = NUD.volverA; NUD.volverA = null; }
  if (NUD.pos < NUD.orden.length - 1){ NUD.pos++; return nudPregunta(); }
  nudCuaderno();
}

function nudNudo(n){
  const box = nudBox(), p = nudPar(n), ap = n.tipo === "aparente";
  const fila = id => "<div><strong>" + NUD.m.afs[id] + '</strong><br><span class="nud-small nud-muted">' + nudT("tuResp", { v: nudVal(NUD.resp[id].v) }) + "</span></div>";
  box.innerHTML = '<div class="nud-card nud-knot' + (ap ? " nud-ap" : "") + '" role="region" aria-live="polite"><span class="nud-tag">' + nudT(ap ? "nudoAp" : "nudo") + "</span>" +
    "<h3>" + nudT(ap ? "nudoApTit" : "nudoTit") + '</h3><div class="nud-pair">' + fila(p.a) + fila(p.b) + "</div><p>" + n.por + "</p>" +
    (ap ? '<label class="nud-lab" for="nud-tx">' + nudT("apExplica") + '</label><textarea id="nud-tx"></textarea><div class="nud-count" id="nud-cnt"></div><p class="nud-row"><button type="button" class="btn" id="nud-ok" disabled>' + nudT("seguir") + "</button></p>"
      : '<p class="nud-small nud-muted">' + nudT("elige") + '</p><div class="nud-choices">' +
        [["ca", "oCa"], ["cb", "oCb"], ["di", "oDi"], ["ba", "oBa"]].map(([c, l]) => '<button type="button" class="nud-choice" data-nudc="' + c + '" aria-pressed="false">' + nudT(l) + "</button>").join("") +
        '</div><div id="nud-extra"></div>') +
    '<p class="nud-src">' + nudT("saberMas") + " " + n.fuente + "</p></div>";
  if (ap){
    nudTexto(10, () => { NUD.hechos.add(n.k); NUD.log.push({ tipo: "aparente", n, razon: document.getElementById("nud-tx").value.trim() }); nudSiguiente(); });
    return;
  }
  box.querySelectorAll("[data-nudc]").forEach(b => b.onclick = () => {
    box.querySelectorAll("[data-nudc]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    nudOpcion(n, b.dataset.nudc);
  });
}

function nudTexto(min, alPulsar){
  const tx = document.getElementById("nud-tx"), b = document.getElementById("nud-ok");
  tx.oninput = () => { const w = nudPal(tx.value); document.getElementById("nud-cnt").textContent = nudT("nPal", { n: w, m: min }); b.disabled = w < min; };
  tx.oninput(); b.onclick = alPulsar;
}

function nudOpcion(n, c){
  const p = nudPar(n), cambio = c === "ca" || c === "cb", min = cambio ? 8 : 15;
  document.getElementById("nud-extra").innerHTML = (c === "di" && n.distinguir ? '<p class="nud-hint">' + n.distinguir + "</p>" : "") +
    '<label class="nud-lab" for="nud-tx">' + nudT(cambio ? "pCambio" : (c === "di" ? "pDist" : "pBala")) + '</label><textarea id="nud-tx"></textarea><div class="nud-count" id="nud-cnt"></div>' +
    '<p class="nud-row"><button type="button" class="btn" id="nud-ok" disabled>' + nudT(cambio ? "reContestar" : "guardar") + "</button></p>";
  document.getElementById("nud-tx").focus();
  nudTexto(min, () => {
    const razon = document.getElementById("nud-tx").value.trim();
    if (cambio){
      if (NUD.volverA == null) NUD.volverA = NUD.pos;
      NUD.pos = NUD.orden.indexOf(c === "ca" ? p.a : p.b);
      nudPregunta(razon);   // si la respuesta no cambia, el nudo vuelve a aparecer
      return;
    }
    NUD.hechos.add(n.k); NUD.log.push({ tipo: c === "di" ? "distingo" : "bala", n, razon }); nudSiguiente();
  });
}

function nudCuaderno(){
  const box = nudBox(), af = id => NUD.m.afs[id];
  const lineas = NUD.log.map(e => {
    if (e.tipo === "cambio") return "<li>" + nudT("lCambio", { a: af(e.id), de: nudVal(e.de), x: nudVal(e.a) }) + (e.razon ? "<br>" + nudT("porQue", { t: nudEsc(e.razon) }) : "") + "</li>";
    const p = nudPar(e.n), k = { distingo: "lDist", bala: "lBala", aparente: "lAp" }[e.tipo];
    return "<li>" + nudT(k, { a: af(p.a), b: af(p.b) }) + "<br>" + nudT("miRazon", { t: nudEsc(e.razon) }) + "</li>";
  }).join("") || '<li class="nud-muted">' + nudT(NUD.orden.filter(id => NUD.resp[id].v === "P").length >= 3 ? "sinNudos" : "sinNudosPocoP") + "</li>";   // (09-10) el mensaje de «mucho Depende» solo si de verdad lo hay
  box.innerHTML = '<div class="nud-card nud-cuaderno"><h3>' + nudT("cuaderno") + '</h3><p class="nud-small nud-muted">' + NUD.m.titulo + " · " + new Date().toLocaleDateString(document.documentElement.lang || "es") + ". " + nudT("cuadSub") + "</p>" +
    "<h4>" + nudT("misResp") + "</h4><ul>" + NUD.orden.map(id => "<li>" + af(id) + " — <strong>" + nudVal(NUD.resp[id].v) + "</strong>" + (NUD.resp[id].dep ? '<br><span class="nud-small">' + nudT("dependeDe", { t: nudEsc(NUD.resp[id].dep) }) + "</span>" : "") + "</li>").join("") + "</ul>" +
    "<h4>" + nudT("misNudos") + '</h4><ul class="nud-log">' + lineas + "</ul>" +
    "<h4>" + nudT("reto") + '</h4><label class="nud-lab" for="nud-reto">' + nudT("retoTxt") + '</label><textarea id="nud-reto" class="nud-reto"></textarea>' +
    '<p class="nud-row nud-noprint"><button type="button" class="btn" id="nud-imp">' + nudT("imprimir") + '</button> <button type="button" class="btn ghost" id="nud-cop">' + nudT("copiar") +
    '</button> <button type="button" class="btn ghost" id="nud-ini">' + nudT("inicio") + '</button> <span class="nud-small nud-muted" id="nud-msg" aria-live="polite"></span></p></div>';
  document.getElementById("nud-imp").onclick = () => void 0 /* sin imprimir en la web de alumnado */;
  document.getElementById("nud-ini").onclick = nudInicio;
  document.getElementById("nud-cop").onclick = async () => {
    const t = box.querySelector(".nud-cuaderno").innerText.replace(/\n{3,}/g, "\n\n") + "\n\n" + nudT("reto") + ": " + document.getElementById("nud-reto").value;
    try { await navigator.clipboard.writeText(t); document.getElementById("nud-msg").textContent = nudT("copiado"); }
    catch (e){ document.getElementById("nud-msg").textContent = nudT("noCopia"); }
  };
  window.scrollTo({ top: box.offsetTop - 80 });
}

function loadNudos(arg){
  const id = String(arg || "").split("/")[0];
  if (id && NUDOS.some(m => m.id === id)) nudEmpezar(id); else nudInicio();
}
if (nudBox() && typeof NUDOS !== "undefined") nudInicio();
