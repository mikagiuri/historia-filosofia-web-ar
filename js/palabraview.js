"use strict";
/* ===== El arte de la palabra (19-10, Bachillerato) =====
   Vista #palabra. Textos en palabra.js (PALABRA). Patrón del Universo aristotélico (universoview.js).
   Piezas: cinco de clasificar (éthos/páthos/lógos, géneros, metáfora o comparación, lugares, ¿lo dijo Aristóteles?;
   en los casos trampa valen dos respuestas), «Ordena el discurso» y «Arma una tragedia» (Poética 13).
   Respuestas con códigos numéricos: ningún literal que el diccionario de interfaz pueda traducir.
   Enlace profundo: #palabra/tekhne|retorica|discurso|poetica|topicos|tradicion|preguntas. */

const PA_TXT = {   /* textos de interfaz: cadenas enteras (ui/<lang>.json) */
  indiceTit: "الفقرات", comprobar: "تحقّقوا", otraVez: "ابدؤوا من جديد",
  aciertos: "الإجابات الصحيحة: {n} من {t}.", faltan: "صنّفوا كل الجمل قبل التحقّق.",
  todas: "كلها صحيحة!", porQue: "لماذا", fichaImg: "البطاقة",
  subir: "إلى الأعلى", bajar: "إلى الأسفل", ordenOk: "الترتيب صحيح!", ordenMal: "ليس بعد: راجعوا الترتيب.",
  efecto: "الأثر في الجمهور", otrasTit: "في مواد أخرى"
};
const paT = (k, v) => String(PA_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const paBox = () => document.getElementById("palabrabox");
const paPs = a => (Array.isArray(a) ? a : [a]).map(p => "<p>" + p + "</p>").join("");
const paCita = (c, pie) => '<blockquote class="pa-cita"><p>' + c + "</p><footer>" + pie + "</footer></blockquote>";
const paFig = k => { const I = PALABRA.img[k]; if (!I) return "";
  return '<figure class="pa-fig-img"><a href="' + I.f + '" target="_blank" rel="noopener"><img src="' + I.f + '" alt="" loading="lazy" decoding="async"></a>' +
    "<figcaption>" + I.pie + ' <span class="pa-cred">' + I.cred + ' · <a href="' + I.url + '" target="_blank" rel="noopener">' + paT("fichaImg") + "</a></span></figcaption></figure>"; };
const paFigs = ks => '<div class="pa-figs">' + ks.map(paFig).join("") + "</div>";
const paSec = (id, S, cuerpo) => '<section class="pa-sec" id="pa-' + id + '"><p class="pa-eyebrow">' + S.materia + "</p><h2>" + S.titulo + "</h2>" + cuerpo + "</section>";
const paCuidado = x => '<p class="pa-cuidado">' + x + "</p>";
const paLista = (tit, xs) => '<div class="pa-otras"><h3>' + tit + "</h3><ul>" + xs.map(x => "<li>" + x + "</li>").join("") + "</ul></div>";

/* ---------- pieza común: clasificar (items {id, t, r:[códigos], e}; nombres = rótulos de los códigos 1..n) ---------- */
function paClasif(items, nombres){
  return '<ul class="pa-items">' + items.map(it => '<li data-it="' + it.id + '"><p class="pa-frase">' + it.t + '</p><span class="pa-opc" role="group">' +
    nombres.map((n, i) => '<button type="button" class="pa-chip" data-v="' + (i + 1) + '" aria-pressed="false">' + n + "</button>").join("") +
    '</span><p class="pa-exp" hidden></p></li>').join("") + '</ul><div class="pa-botones"><button type="button" data-pa="comprobar">' + paT("comprobar") +
    '</button><button type="button" data-pa="reiniciar" class="pa-sec-btn">' + paT("otraVez") + '</button></div><p class="pa-res" aria-live="polite"></p>';
}
function paClasifEventos(box, items){
  if (!box) return;
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const li = b.closest("li[data-it]");
    if (li && b.dataset.v){ li.querySelectorAll(".pa-chip").forEach(x => x.setAttribute("aria-pressed", String(x === b))); return; }
    if (b.dataset.pa === "reiniciar"){
      box.querySelectorAll(".pa-chip").forEach(x => x.setAttribute("aria-pressed", "false"));
      box.querySelectorAll("li[data-it]").forEach(x => { x.classList.remove("pa-bien", "pa-malo"); x.querySelector(".pa-exp").hidden = true; });
      box.querySelector(".pa-res").textContent = ""; return;
    }
    if (b.dataset.pa === "comprobar"){
      const elegidas = items.map(it => { const s = box.querySelector('li[data-it="' + it.id + '"] .pa-chip[aria-pressed="true"]'); return s ? +s.dataset.v : 0; });
      if (elegidas.some(v => !v)){ box.querySelector(".pa-res").textContent = paT("faltan"); return; }
      let n = 0;
      items.forEach((it, i) => { const l = box.querySelector('li[data-it="' + it.id + '"]'), ok = it.r.includes(elegidas[i]); n += ok;
        l.classList.toggle("pa-bien", ok); l.classList.toggle("pa-malo", !ok);
        const ex = l.querySelector(".pa-exp"); ex.innerHTML = "<strong>" + paT("porQue") + ":</strong> " + it.e; ex.hidden = false; });
      box.querySelector(".pa-res").innerHTML = n === items.length ? '<span class="pa-ok">' + paT("todas") + "</span>" : paT("aciertos", { n, t: items.length });
    }
  });
}

/* ---------- pieza: ordenar el discurso ---------- */
const PA_ORD = { orden: [] };
function paOrdenRender(){
  const D = PALABRA.discurso, box = document.getElementById("pa-orden"); if (!box) return;
  box.querySelector(".pa-ord").innerHTML = PA_ORD.orden.map((id, i) => { const p = D.partes.find(x => x.id === id);
    return '<li data-p="' + id + '"><span class="pa-ord-n">' + (i + 1) + '</span><p class="pa-frase">' + p.t + '</p><span class="pa-ord-b">' +
      '<button type="button" data-mv="-1" aria-label="' + paT("subir") + '"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
      '<button type="button" data-mv="1" aria-label="' + paT("bajar") + '"' + (i === PA_ORD.orden.length - 1 ? " disabled" : "") + ">↓</button></span></li>"; }).join("");
}
function paOrdenReset(){
  const D = PALABRA.discurso; PA_ORD.orden = [D.partes[2].id, D.partes[0].id, D.partes[3].id, D.partes[1].id];   // desorden fijo, siempre el mismo
  paOrdenRender(); const r = document.querySelector("#pa-orden .pa-res"); if (r) r.textContent = "";
}

/* ---------- pieza: arma una tragedia (Poética 13) ---------- */
function paTragedia(){
  const P = PALABRA.poetica, box = document.getElementById("pa-tragedia"); if (!box) return;
  const v = n => +((box.querySelector('[name="' + n + '"]:checked') || {}).value || 0);
  const h = v("pa-h"), c = v("pa-c"), k = v("pa-k"), R = P.res;
  let txt;
  if (c === 1) txt = h === 2 ? R.maloSube : R.subir;
  else if (h === 1) txt = R.buenoCae;
  else if (h === 2) txt = R.maloCae;
  else txt = k === 1 ? R.maldad : k === 3 ? R.azar : R.tragedia;
  const ok = c === 2 && h === 3 && k === 2;
  box.querySelector(".pa-res").innerHTML = "<strong>" + paT("efecto") + ":</strong> " + (ok ? '<span class="pa-ok">' + txt + "</span>" : txt);
}
const paRadios = (name, tit, ops, def) => '<fieldset class="pa-grupo"><legend>' + tit + "</legend>" +
  ops.map((o, i) => '<label><input type="radio" name="' + name + '" value="' + (i + 1) + '"' + (i + 1 === def ? " checked" : "") + "> " + o + "</label>").join("") + "</fieldset>";

function paRender(){
  const box = paBox(); if (!box || typeof PALABRA === "undefined" || box.dataset.paHecho) return;
  box.dataset.paHecho = "1";
  const P = PALABRA, ID = Object.fromEntries(P.indice.map(x => [x.id, x.id]));
  const K = P.tekhne, R = P.retorica, D = P.discurso, O = P.poetica, T = P.topicos, TR = P.tradicion, Q = P.preguntas;
  const crono = xs => '<ol class="pa-crono">' + xs.map(x => '<li><span class="pa-y">' + x.y + "</span><span><strong>" + x.t + "</strong><br>" + x.d + "</span></li>").join("") + "</ol>";
  box.innerHTML =
    '<div class="pa-cabecera"><figure class="pa-retrato"><img src="media/retratos/ilustres/ciceron.jpg" alt="" decoding="async"><figcaption>' + P.retrato + "</figcaption></figure>" +
    '<div><p class="pa-intro">' + P.intro + '</p><p class="pa-pista">' + P.pista + "</p></div></div>" +
    '<nav class="pa-indice" aria-label="' + paT("indiceTit") + '"><ol>' +
    P.indice.map(x => '<li><a href="#palabra/' + x.id + '"><span class="pa-mat">' + x.m + "</span>" + x.t + "</a></li>").join("") + "</ol></nav>" +

    /* 1 · tékhne */
    paSec(ID.tekhne, K, paPs(K.texto) + paCuidado(K.cuidado) + "<h3>" + K.lineaTit + "</h3>" + crono(K.linea) + paFigs(["catilina"])) +

    /* 2 · retórica */
    paSec(ID.retorica, R, paPs(R.texto) + paCita(R.cita, R.citaPie) +
      "<h3>" + R.pruebasTit + "</h3>" + paPs(R.pruebas) + paCita(R.cita2, R.cita2Pie) +
      '<div class="pa-pieza" id="pa-pruebas"><h3>' + R.pieza1Tit + "</h3><p>" + R.pieza1Txt + "</p>" + paClasif(R.frases, R.pruebasNom) + "</div>" +
      "<h3>" + R.generosTit + "</h3>" + paPs(R.generos) + paCita(R.cita3, R.cita3Pie) +
      '<div class="pa-pieza" id="pa-generos"><h3>' + R.pieza2Tit + "</h3><p>" + R.pieza2Txt + "</p>" + paClasif(R.situaciones, R.generosNom) + "</div>" +
      paCuidado(R.cuidado) +
      "<h3>" + R.tradicionTit + '</h3><div class="pa-con-fig"><figure class="pa-fig"><img src="media/retratos/ilustres/quintiliano.jpg" alt="" loading="lazy" decoding="async"><figcaption>' + R.quintiliano + "</figcaption></figure>" +
      paPs(R.tradicion) + "</div>" + paCita(R.cita4, R.cita4Pie) + paLista(R.otrasTit, R.otras) + '<p class="pa-enlaces">' + R.enlaces + "</p>") +

    /* 3 · discurso */
    paSec(ID.discurso, D, paPs(D.texto) + paCita(D.cita, D.citaPie) +
      '<div class="pa-pieza" id="pa-orden"><h3>' + D.pieza1Tit + "</h3><p>" + D.pieza1Txt + '</p><ol class="pa-ord"></ol>' +
      '<div class="pa-botones"><button type="button" data-pa="ordcomp">' + paT("comprobar") + '</button><button type="button" data-pa="ordre" class="pa-sec-btn">' + paT("otraVez") +
      '</button></div><p class="pa-res" aria-live="polite"></p></div>' +
      "<h3>" + D.estiloTit + "</h3>" + paPs(D.estilo) + paCita(D.cita2, D.cita2Pie) +
      '<div class="pa-pieza" id="pa-metafora"><h3>' + D.pieza2Tit + "</h3><p>" + D.pieza2Txt + "</p>" + paClasif(D.frases, D.figurasNom) + "</div>" + paCuidado(D.cuidado) +
      "<h3>" + D.metanoiaTit + "</h3>" + paPs(D.metanoia) + paCita(D.cita3, D.cita3Pie)) +

    /* 4 · poética */
    paSec(ID.poetica, O, paPs(O.texto) + paFigs(["mascara", "pronomo"]) + paCita(O.cita, O.citaPie) +
      "<h3>" + O.tragediaTit + "</h3>" + paPs(O.tragedia) + paCita(O.cita2, O.cita2Pie) + "<p>" + O.catarsis + "</p>" + paFigs(["sofocles", "epidauro"]) +
      '<div class="pa-pieza" id="pa-tragedia"><h3>' + O.piezaTit + "</h3><p>" + O.piezaTxt + '</p><div class="pa-grupos">' +
      paRadios("pa-h", O.heroeTxt, O.heroes, 3) + paRadios("pa-c", O.cambioTxt, O.cambios, 2) + paRadios("pa-k", O.causaTxt, O.causas, 2) +
      '</div><p class="pa-res" aria-live="polite"></p></div>' + paCita(O.cita3, O.cita3Pie) +
      "<h3>" + O.verosimilTit + "</h3>" + paPs(O.verosimil) + paCita(O.cita4, O.cita4Pie) + paCuidado(O.cuidado)) +

    /* 5 · tópicos */
    paSec(ID.topicos, T, paPs(T.texto) + paCita(T.cita, T.citaPie) +
      '<div class="pa-pieza" id="pa-lugares"><h3>' + T.piezaTit + "</h3><p>" + T.piezaTxt + "</p>" + paClasif(T.argumentos, T.lugaresNom) + "</div>" +
      "<h3>" + T.falaciasTit + "</h3><p>" + T.falacias + "</p>" +
      "<h3>" + T.lugarComunTit + "</h3>" + paPs(T.lugarComun) + paFigs(["adagia"]) + paCuidado(T.cuidado)) +

    /* 6 · tradición */
    paSec(ID.tradicion, TR, paPs(TR.texto) + paCita(TR.cita2, TR.cita2Pie) + paCita(TR.cita, TR.citaPie) + paFigs(["horacio"]) +
      "<h3>" + TR.renacTit + "</h3>" + paPs(TR.renac) + paCita(TR.cita3, TR.cita3Pie) + paFigs(["pinciano", "lope", "boileau"]) +
      '<div class="pa-pieza" id="pa-reglas"><h3>' + TR.piezaTit + "</h3><p>" + TR.piezaTxt + "</p>" + paClasif(TR.reglas, TR.siNo) + "</div>" +
      "<h3>" + TR.hoyTit + "</h3><p>" + TR.hoy + "</p>" + paCuidado(TR.cuidado)) +

    /* 7 · preguntas */
    '<section class="pa-sec" id="pa-' + ID.preguntas + '"><div class="pa-preguntas"><h2>' + Q.titulo + "</h2><ul>" + Q.lista.map(q => "<li>" + q + "</li>").join("") + "</ul>" +
    paLista(paT("otrasTit"), Q.otras) + '<p class="pa-enlaces">' + Q.enlaces + "</p></div></section>";

  paClasifEventos(document.getElementById("pa-pruebas"), R.frases);
  paClasifEventos(document.getElementById("pa-generos"), R.situaciones);
  paClasifEventos(document.getElementById("pa-metafora"), D.frases);
  paClasifEventos(document.getElementById("pa-lugares"), T.argumentos);
  paClasifEventos(document.getElementById("pa-reglas"), TR.reglas);

  const ord = document.getElementById("pa-orden");
  ord.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mv){ const id = b.closest("li").dataset.p, i = PA_ORD.orden.indexOf(id), j = i + +b.dataset.mv;
      [PA_ORD.orden[i], PA_ORD.orden[j]] = [PA_ORD.orden[j], PA_ORD.orden[i]]; paOrdenRender();
      const nb = ord.querySelector('li[data-p="' + id + '"] button[data-mv="' + b.dataset.mv + '"]'); if (nb && !nb.disabled) nb.focus(); return; }
    if (b.dataset.pa === "ordre") return paOrdenReset();
    if (b.dataset.pa === "ordcomp"){
      const ok = PA_ORD.orden.every((id, i) => D.partes.find(x => x.id === id).o === i + 1);
      ord.querySelector(".pa-res").innerHTML = ok ? '<span class="pa-ok">' + paT("ordenOk") + "</span> " + D.partes.map(p => "<strong>" + p.n + "</strong>").join(" → ") : paT("ordenMal");
    }
  });
  paOrdenReset();

  document.getElementById("pa-tragedia").addEventListener("change", paTragedia); paTragedia();
}
function loadPalabra(arg){
  paRender();
  if (arg){ const el = document.getElementById("pa-" + arg);
    if (el){ const ir = () => el.scrollIntoView({ block: "start" }), t0 = Date.now(); setTimeout(ir, 60);
      // (19-10) las imágenes diferidas que cargan después del salto lo desplazan: se vuelve a saltar durante 3 s
      document.querySelectorAll("#palabra img").forEach(i => { if (!i.complete) i.addEventListener("load", () => { if (Date.now() - t0 < 3000) ir(); }, { once: true }); }); } }
}
if (paBox()) paRender();
