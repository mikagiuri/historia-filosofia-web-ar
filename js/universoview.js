"use strict";
/* ===== El universo aristotélico (19-10, Bachillerato) =====
   Vista #universo. Textos en universo.js (UNIVERSO). Patrón del Taller de Leibniz (leibnizview.js).
   Piezas: las cuatro causas, el cuadrado de las cualidades, la caída en un medio, las capacidades del viviente,
   con sangre o sin sangre, y las grietas (desplegables). Cada imagen lleva su crédito y enlace a su ficha.
   Enlace profundo: #universo/cambio|elementos|lugares|alma|naturalista|grietas|puente|preguntas. */

const UA_TXT = {   /* textos de interfaz: cadenas enteras (así las traduce web_i18n/ui/<lang>.json) */
  fuego: "النار", aire: "الهواء", agua: "الماء", tierra: "التراب",
  qC: "حارّ", qF: "بارد", qS: "يابس", qH: "رطب",
  eligeEl: "عنصر الانطلاق", cambiaT: "غيّروا حارّ ⇄ بارد", cambiaS: "غيّروا يابس ⇄ رطب",
  estado: "{e}: {a} و{b}.", paso: "{de} → {a}: تغيّرت كيفية «{q}».",
  rapido: "يشتركان في كيفية: إنه تغيّر سريع.",
  pasos: "التغييرات المنجزة: {n}", reiniciar: "ابدؤوا من جديد",
  retoOk: "الماء من النار في {n} تغييرات! هذا هو الحدّ الأدنى: على المتقابلين أن يغيّرا كيفيتيهما معًا.",
  retoMas: "وصلتم إلى الماء في {n} تغييرات؛ ويمكن فعل ذلك في 2.",
  cuadroAria: "مربّع العناصر الأربعة وكيفياتها",
  acerto: "ما قاله", queda: "ما حدث بعد ذلك",
  indiceTit: "الفقرات", ficha: "البطاقة",
  objeto: "الشيء", eligeOpc: "اختاروا…", comprobar: "تحقّقوا",
  causasOk: "الأربعة كلها صحيحة!", causasMal: "الإجابات الصحيحة: {n} من 4. راجعوا ما هو باللون الأحمر.",
  cuerpoA: "الجسم الأول", cuerpoB: "الجسم الثاني", medio: "الوسط",
  mismo: "اختاروا جسمين مختلفين.",
  si: "نعم", no: "لا", dudoso: "ملتبس",
  almaOk: "الإجابات الصحيحة: {n} من {t}.", almaMarca: "ضعوا العلامات واضغطوا على «تحقّقوا».",
  sangreOk: "الإجابات الصحيحة: {n} من {t}.", sangreFalta: "صنّفوا كل الحيوانات.",
  abrir: "اعرضوا الشرخ"
};
const uaT = (k, v) => String(UA_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const uaBox = () => document.getElementById("universobox");
const uaPs = a => (Array.isArray(a) ? a : [a]).map(p => "<p>" + p + "</p>").join("");
const uaCita = (c, pie) => '<blockquote class="ua-cita"><p>' + c + "</p><footer>" + pie + "</footer></blockquote>";
const uaFig = (k, cls) => { const I = UNIVERSO.img[k]; if (!I) return "";
  return '<figure class="ua-fig-img' + (cls ? " " + cls : "") + '"><a href="' + I.f + '" target="_blank" rel="noopener"><img src="' + I.f + '" alt="" loading="lazy" decoding="async"></a>' +
    "<figcaption>" + I.pie + ' <span class="ua-cred">' + I.cred + ' · <a href="' + I.url + '" target="_blank" rel="noopener">' + uaT("البطاقة") + "</a></span></figcaption></figure>"; };
const uaFigs = ks => '<div class="ua-figs">' + ks.map(k => uaFig(k)).join("") + "</div>";
const uaSec = (id, S, cuerpo) => '<section class="ua-sec" id="ua-' + id + '"><p class="ua-eyebrow">' + S.materia + "</p><h2>" + S.titulo + "</h2>" + cuerpo + "</section>";
const uaBaraja = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- pieza 1: las cuatro causas ---------- */
function uaCausasRender(i){
  const C = UNIVERSO.cambio, o = C.objetos[i], box = document.getElementById("ua-causas");
  const opts = uaBaraja(C.objetos.flatMap(x => x.r));
  box.querySelector(".ua-causas-filas").innerHTML = C.causas.map((c, k) =>
    '<label class="ua-fila"><span>' + c + '</span><select data-k="' + k + '"><option value="">' + uaT("eligeOpc") + "</option>" +
    opts.map(x => '<option value="' + x.replace(/"/g, "&quot;") + '">' + x + "</option>").join("") + "</select></label>").join("");
  box.querySelector(".ua-res").textContent = "";
  box.querySelectorAll(".ua-elige button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
  box.dataset.obj = i;
}
function uaCausasComprobar(){
  const C = UNIVERSO.cambio, box = document.getElementById("ua-causas"), o = C.objetos[+box.dataset.obj];
  let n = 0;
  box.querySelectorAll("select").forEach(s => { const ok = s.value === o.r[+s.dataset.k]; n += ok; s.classList.toggle("ua-bien", ok); s.classList.toggle("ua-malo", !ok); });
  box.querySelector(".ua-res").innerHTML = (n === 4 ? '<span class="ua-ok">' + uaT("causasOk") + "</span>" : uaT("causasMal", { n })) + (o.id === "roble" && n === 4 ? " " + C.roble : "");
}

/* ---------- pieza 2: el cuadrado de las cualidades ---------- */
/* cualidades con códigos internos (qC caliente, qF frío, qS seco, qH húmedo): ningún literal que el diccionario de interfaz pueda traducir */
const UA_EL = { fuego: ["qC", "qS"], aire: ["qC", "qH"], agua: ["qF", "qH"], tierra: ["qF", "qS"] };
const UA_POS = { fuego: [100, 50], aire: [320, 50], agua: [320, 230], tierra: [100, 230] };   // esquinas del cuadrado
const uaDe = (t, s) => Object.keys(UA_EL).find(k => UA_EL[k][0] === t && UA_EL[k][1] === s);
const UA_S = { el: "fuego", n: 0, desde: "fuego", hist: [] };

function uaCuadroSvg(){
  const W = 420, H = 280, P = UA_POS, act = UA_S.el;
  /* lado con su cualidad común: arriba y abajo, encima o debajo; a izquierda y derecha, fuera del cuadrado */
  const lado = (a, b, q) => { const [x1, y1] = P[a], [x2, y2] = P[b];
    const tx = x1 === x2 ? (x1 < 200 ? 36 : 384) : (x1 + x2) / 2, ty = y1 === y2 ? (y1 < 100 ? y1 - 12 : y1 + 26) : (y1 + y2) / 2 + 5;
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="ua-lado"/>' +
      '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" class="ua-q">' + uaT(q) + "</text>"; };
  let s = '<svg viewBox="0 0 ' + W + " " + H + '" class="ua-svg" role="img" aria-label="' + uaT("cuadroAria") + '">' +
    '<line x1="' + P.fuego[0] + '" y1="' + P.fuego[1] + '" x2="' + P.agua[0] + '" y2="' + P.agua[1] + '" class="ua-diag"/>' +
    '<line x1="' + P.aire[0] + '" y1="' + P.aire[1] + '" x2="' + P.tierra[0] + '" y2="' + P.tierra[1] + '" class="ua-diag"/>' +
    lado("fuego", "aire", "qC") + lado("tierra", "agua", "qF") + lado("fuego", "tierra", "qS") + lado("aire", "agua", "qH");
  Object.keys(P).forEach(k => { const [x, y] = P[k];
    s += '<g class="ua-nodo ua-' + k + (k === act ? " ua-on" : "") + '"><circle cx="' + x + '" cy="' + y + '" r="34"/>' +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + uaT(k) + "</text></g>"; });
  return s + "</svg>";
}
function uaCuadroRender(msg){
  const box = document.getElementById("ua-cuadro"); if (!box) return;
  const e = UA_S.el, [t, h] = UA_EL[e];
  box.querySelector(".ua-fig").innerHTML = uaCuadroSvg();
  box.querySelector(".ua-estado").innerHTML = "<strong>" + uaT("estado", { e: uaT(e), a: uaT(t), b: uaT(h) }) + "</strong>" + (msg ? " " + msg : "");
  box.querySelector(".ua-pasos").textContent = uaT("pasos", { n: UA_S.n });
  box.querySelector(".ua-hist").innerHTML = UA_S.hist.map(x => "<li>" + x + "</li>").join("");
  box.querySelectorAll(".ua-elige button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.el === UA_S.desde)));
}
function uaCambia(eje){
  const de = UA_S.el, [t, h] = UA_EL[de];
  const nt = eje === "t" ? (t === "qC" ? "qF" : "qC") : t, nh = eje === "s" ? (h === "qS" ? "qH" : "qS") : h;
  const a = uaDe(nt, nh), q = eje === "t" ? uaT(t) + " → " + uaT(nt) : uaT(h) + " → " + uaT(nh);
  UA_S.el = a; UA_S.n++;
  UA_S.hist.push(uaT("paso", { de: uaT(de), a: uaT(a), q }));
  let msg = uaT("rapido");
  if (UA_S.desde === "fuego" && a === "agua") msg = '<span class="ua-ok">' + (UA_S.n === 2 ? uaT("retoOk", { n: 2 }) : uaT("retoMas", { n: UA_S.n })) + "</span>";
  uaCuadroRender(msg);
}
function uaReset(el){ UA_S.el = UA_S.desde = el || UA_S.desde; UA_S.n = 0; UA_S.hist = []; uaCuadroRender(""); }

/* ---------- pieza 3: la caída ---------- */
function uaCaidaRender(){
  const L = UNIVERSO.lugares, box = document.getElementById("ua-caida");
  const g = n => box.querySelector('[name="' + n + '"]').value;
  const A = L.cuerpos.find(c => c.id === g("ua-ca")), B = L.cuerpos.find(c => c.id === g("ua-cb")), m = g("ua-cm");
  const out = box.querySelector(".ua-res");
  if (A.id === B.id) { out.innerHTML = uaT("mismo"); return; }
  const [P, Q] = A.p >= B.p ? [A, B] : [B, A];
  const x = Math.round(P.p / Q.p * 10) / 10, xs = x >= 10 ? Math.round(x) : x.toLocaleString(document.documentElement.lang || "es");
  let ari, obs;
  if (m === "vacio") { ari = L.predAriVacio; obs = L.obsVacio; }
  else {
    ari = P.p === Q.p ? L.predIgual : L.predAri.replace("{a}", P.t.toLowerCase()).replace("{x}", xs);
    obs = (Q.id === "pluma" || m === "agua") ? L.obsMedio : L.obsCasi.replace("{x}", xs);
  }
  out.innerHTML = '<p class="ua-ari">' + ari + '</p><p class="ua-obs">' + obs + "</p>";
}

/* ---------- pieza 4: capacidades del viviente ---------- */
function uaAlmaComprobar(){
  const A = UNIVERSO.alma, box = document.getElementById("ua-almapieza");
  let n = 0, t = 0, esponja = false;
  A.seres.forEach(s => s.r.forEach((r, k) => {
    const c = box.querySelector('input[data-s="' + s.id + '"][data-k="' + k + '"]'), td = c.closest("td");
    td.classList.remove("ua-bien", "ua-malo", "ua-duda");
    if (r === 2) { td.classList.add("ua-duda"); esponja = true; return; }
    t++; const ok = c.checked === (r === 1); n += ok; td.classList.add(ok ? "ua-bien" : "ua-malo");
  }));
  box.querySelector(".ua-res").innerHTML = uaT("almaOk", { n, t }) + (esponja ? "<p>" + A.esponja + "</p>" : "");
}

/* ---------- pieza 5: con sangre o sin sangre ---------- */
function uaSangreComprobar(){
  const N = UNIVERSO.naturalista, box = document.getElementById("ua-sangre");
  let n = 0, hechas = 0;
  N.animales.forEach(a => { const v = box.querySelector('[data-a="' + a.id + '"][aria-pressed="true"]'), li = box.querySelector('li[data-li="' + a.id + '"]');
    li.classList.remove("ua-bien", "ua-malo"); if (!v) return; hechas++;
    const ok = +v.dataset.v === a.r; n += ok; li.classList.add(ok ? "ua-bien" : "ua-malo"); });
  box.querySelector(".ua-res").innerHTML = hechas < N.animales.length ? uaT("sangreFalta") : uaT("sangreOk", { n, t: N.animales.length }) + "<p>" + N.trampa + "</p>";
}

function uaRender(){
  const box = uaBox(); if (!box || typeof UNIVERSO === "undefined" || box.dataset.uaHecho) return;
  box.dataset.uaHecho = "1";
  const U = UNIVERSO, ID = Object.fromEntries(U.indice.map(x => [x.id, x.id])), C = U.cambio, E = U.elementos, L = U.lugares, A = U.alma, N = U.naturalista, G = U.grietas, P = U.puente, Q = U.preguntas;
  const tabla = (filas) => '<div class="ua-tabla-wrap"><table class="ua-tabla"><thead><tr><th>' + uaT("acerto") + "</th><th>" + uaT("queda") + "</th></tr></thead><tbody>" +
    filas.map(r => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>").join("") + "</tbody></table></div>";
  const sel = (name, arr, v) => '<select name="' + name + '">' + arr.map(x => '<option value="' + x.id + '"' + (x.id === v ? " selected" : "") + ">" + x.t + "</option>").join("") + "</select>";

  box.innerHTML =
    '<div class="ua-cabecera"><figure class="ua-retrato"><img src="media/galeria_museo/universo/aristoteles_speculum.jpg" alt="" decoding="async"><figcaption>' + U.retrato + "</figcaption></figure>" +
    '<div><p class="ua-intro">' + U.intro + '</p><p class="ua-pista">' + U.pista + "</p></div></div>" +

    '<nav class="ua-indice" aria-label="' + uaT("indiceTit") + '"><ol>' +
    U.indice.map(x => '<li><a href="#universo/' + x.id + '"><span class="ua-mat">' + x.m + "</span>" + x.t + "</a></li>").join("") + "</ol></nav>" +

    /* 1 · cambio */
    uaSec(ID.cambio, C, uaPs(C.texto) + uaCita(C.cita, C.citaPie) + "<h3>" + C.causasTit + "</h3>" + uaPs(C.causasTxt) +
      '<div class="ua-pieza" id="ua-causas"><h3>' + C.piezaTit + "</h3><p>" + C.piezaTxt + "</p>" +
      '<div class="ua-elige" role="group" aria-label="' + uaT("objeto") + '">' + C.objetos.map((o, i) => '<button type="button" class="ua-chip" data-i="' + i + '" aria-pressed="false">' + o.t + "</button>").join("") + "</div>" +
      '<div class="ua-causas-filas"></div><div class="ua-botones"><button type="button" data-ua="causas">' + uaT("comprobar") + '</button></div><p class="ua-res" aria-live="polite"></p></div>' +
      '<p class="ua-cuidado">' + C.cuidado + "</p><p>" + C.puente + "</p>" + uaFigs(["alejandro"])) +

    /* 2 · elementos */
    uaSec(ID.elementos, E, uaPs(E.texto) + uaFigs(["fuego", "agua"]) + uaCita(E.cita, E.citaPie) +
      "<h3>" + E.transTit + "</h3>" + uaPs(E.transTxt) +
      '<div class="ua-pieza" id="ua-cuadro"><h3>' + E.piezaTit + "</h3><p>" + E.piezaTxt + "</p>" +
      '<div class="ua-elige" role="group" aria-label="' + uaT("eligeEl") + '">' + Object.keys(UA_EL).map(k => '<button type="button" class="ua-chip" data-el="' + k + '" aria-pressed="false">' + uaT(k) + "</button>").join("") + "</div>" +
      '<div class="ua-fig"></div><p class="ua-estado" aria-live="polite"></p>' +
      '<div class="ua-botones"><button type="button" data-ua="t">' + uaT("cambiaT") + '</button><button type="button" data-ua="s">' + uaT("cambiaS") + "</button>" +
      '<button type="button" data-ua="reiniciar" class="ua-sec-btn">' + uaT("reiniciar") + "</button></div>" +
      '<p class="ua-pasos"></p><ol class="ua-hist"></ol>' +
      '<div class="ua-reto"><h4>' + E.retoTit + "</h4><p>" + E.retoTxt + "</p></div></div>" +
      uaFigs(["diagrama", "transmutaciones"]) +
      "<h3>" + E.mixtosTit + "</h3><p>" + E.mixtos + "</p>" + uaFigs(["humores"]) + '<p class="ua-cuidado">' + E.cuidado + "</p>" +
      "<h3>" + E.puenteTit + "</h3>" + uaPs(E.puente) + uaFigs(["lavoisier", "traite"]) +
      "<h3>" + E.acertoTit + "</h3>" + tabla(E.acerto)) +

    /* 3 · lugares */
    uaSec(ID.lugares, L, uaPs(L.texto) + uaFigs(["cellarius", "apian"]) + uaCita(L.cita, L.citaPie) +
      "<h3>" + L.motorTit + "</h3><p>" + L.motor + "</p>" +
      '<div class="ua-pieza" id="ua-caida"><h3>' + L.piezaTit + "</h3><p>" + L.piezaTxt + "</p>" +
      '<div class="ua-campos"><label>' + uaT("cuerpoA") + " " + sel("ua-ca", L.cuerpos, "piedra2") + "</label><label>" + uaT("cuerpoB") + " " + sel("ua-cb", L.cuerpos, "piedra") + "</label>" +
      "<label>" + uaT("medio") + " " + sel("ua-cm", L.medios, "aire") + '</label></div><div class="ua-res" aria-live="polite"></div></div>' +
      '<p class="ua-cuidado">' + L.cuidado + "</p><h3>" + L.puenteTit + "</h3>" + uaPs(L.puente) + uaFigs(["galileo", "fludd"])) +

    /* 4 · alma */
    uaSec(ID.alma, A, uaPs(A.texto) + uaCita(A.cita, A.citaPie) + "<h3>" + A.sensTit + "</h3>" + uaPs(A.sens) +
      '<div class="ua-pieza" id="ua-almapieza"><h3>' + A.piezaTit + "</h3><p>" + A.piezaTxt + "</p>" +
      '<div class="ua-tabla-wrap"><table class="ua-tabla ua-marcar"><thead><tr><th></th>' + A.funciones.map(f => "<th>" + f + "</th>").join("") + "</tr></thead><tbody>" +
      A.seres.map(s => "<tr><th>" + s.t + "</th>" + A.funciones.map((f, k) => '<td><input type="checkbox" data-s="' + s.id + '" data-k="' + k + '" aria-label="' + s.t + ": " + f + '"></td>').join("") + "</tr>").join("") +
      '</tbody></table></div><div class="ua-botones"><button type="button" data-ua="alma">' + uaT("comprobar") + '</button></div><div class="ua-res" aria-live="polite">' + uaT("almaMarca") + "</div></div>" +
      "<h3>" + A.escalaTit + "</h3><p>" + A.escala + "</p>" + uaFigs(["llull", "valades"]) +
      '<p class="ua-cuidado">' + A.cuidado + "</p><p>" + A.puente + "</p>") +

    /* 5 · naturalista */
    uaSec(ID.naturalista, N, uaPs(N.texto) + "<h3>" + N.aciertosTit + "</h3><ul>" + N.aciertos.map(x => "<li>" + x + "</li>").join("") + "</ul>" +
      "<h3>" + N.falloTit + "</h3><ul>" + N.fallos.map(x => "<li>" + x + "</li>").join("") + "</ul>" +
      '<div class="ua-pieza" id="ua-sangre"><h3>' + N.piezaTit + "</h3><p>" + N.piezaTxt + '</p><ul class="ua-animales">' +
      N.animales.map(a => '<li data-li="' + a.id + '"><span>' + a.t + '</span><span class="ua-dos"><button type="button" class="ua-chip" data-a="' + a.id + '" data-v="1" aria-pressed="false">' + N.conSangre +
        '</button><button type="button" class="ua-chip" data-a="' + a.id + '" data-v="0" aria-pressed="false">' + N.sinSangre + "</button></span></li>").join("") +
      '</ul><div class="ua-botones"><button type="button" data-ua="sangre">' + uaT("comprobar") + '</button></div><div class="ua-res" aria-live="polite"></div></div>' +
      uaFigs(["gesner"]) +
      "<h3>" + N.arbolTit + "</h3>" + uaPs(N.arbol) + uaFigs(["porfirio", "porfirio2", "linneo"]) + uaFigs(["darwin", "haeckel"]) +
      uaCita(N.darwinCita, N.darwinPie) + '<p class="ua-cuidado">' + N.cuidado + "</p>") +

    /* 6 · grietas */
    uaSec(ID.grietas, G, "<p>" + G.intro + '</p><div class="ua-grietas">' +
      G.lista.map(g => '<details class="ua-grieta" id="ua-g-' + g.id + '"><summary>' + g.t + "</summary>" +
        '<dl><dt>' + G.dijoTxt + "</dt><dd>" + g.dijo + "</dd><dt>" + G.pasoTxt + "</dt><dd>" + g.paso + "</dd><dt>" + G.quienTxt + "</dt><dd>" + g.quien + "</dd></dl>" +
        (g.cita ? uaCita(g.cita, g.citaPie) : "") + (g.img ? uaFigs(g.img) : "") + "</details>").join("") + "</div>" +
      "<h3>" + G.mapasTit + "</h3><p>" + G.mapas + '</p><p class="ua-cuidado">' + G.cuidado + "</p>") +

    /* 7 · puente */
    uaSec(ID.puente, P, "<p>" + P.intro + '</p><ol class="ua-crono">' +
      P.linea.map(x => '<li><span class="ua-y">' + x.y + "</span><span><strong>" + x.t + "</strong><br>" + x.d + "</span></li>").join("") + "</ol>" +
      "<h3>" + P.tablaTit + "</h3>" + tabla(P.tabla)) +

    /* 8 · preguntas */
    '<section class="ua-sec" id="ua-' + ID.preguntas + '"><div class="ua-preguntas"><h2>' + Q.titulo + "</h2><ul>" + Q.lista.map(q => "<li>" + q + "</li>").join("") + "</ul>" +
    '<p class="ua-enlaces">' + Q.enlaces + "</p></div></section>";

  /* eventos */
  const causas = document.getElementById("ua-causas");
  causas.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.i != null) uaCausasRender(+b.dataset.i); else if (b.dataset.ua === "causas") uaCausasComprobar(); });
  uaCausasRender(0);

  const cuadro = document.getElementById("ua-cuadro");
  cuadro.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.el) uaReset(b.dataset.el);
    else if (b.dataset.ua === "reiniciar") uaReset();
    else if (b.dataset.ua) uaCambia(b.dataset.ua);
  });
  uaReset("fuego");

  const caida = document.getElementById("ua-caida");
  caida.addEventListener("change", uaCaidaRender); uaCaidaRender();

  document.getElementById("ua-almapieza").addEventListener("click", e => { if (e.target.closest('[data-ua="alma"]')) uaAlmaComprobar(); });

  const sangre = document.getElementById("ua-sangre");
  sangre.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a) sangre.querySelectorAll('[data-a="' + b.dataset.a + '"]').forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    else if (b.dataset.ua === "sangre") uaSangreComprobar(); });
}
function loadUniverso(arg){
  uaRender();
  if (arg){ const el = document.getElementById("ua-" + arg);
    if (el){ const ir = () => el.scrollIntoView({ block: "start" }), t0 = Date.now(); setTimeout(ir, 60);
      // (19-10) las imágenes diferidas que cargan después del salto lo desplazan: se vuelve a saltar durante 3 s
      document.querySelectorAll("#universo img").forEach(i => { if (!i.complete) i.addEventListener("load", () => { if (Date.now() - t0 < 3000) ir(); }, { once: true }); }); } }
}
if (uaBox()) uaRender();
