"use strict";
/* ===== Taller de Leibniz (08-10, Bachillerato) =====
   Vista #leibniz. Textos en leibniz.js (LEIBNIZ). Tres piezas interactivas: la rueda escalonada (SVG),
   la multiplicación con manivela y carro, el hexagrama como número binario y los números característicos
   (divisibilidad). Enlace profundo: #leibniz/maquina|binario|alfabeto|tratados|diagramas|calculemos|reverso|newton|voltaire. */

const LZ_TXT = {   /* textos de interfaz: cadenas enteras (así las traduce web_i18n/ui/<lang>.json) */
  cifra: "الأسنان المتعشقة: {n}", ruedaAria: "موضع العجلة الصغيرة", circulos: "مخطط الدوائر", lineas: "مخطط الخطوط",
  numA: "العدد الأول", numB: "العدد الثاني", girar: "إدارة المقبض", reves: "الإدارة في الاتجاه المعاكس",
  carro: "تحريك العربة", reiniciar: "ابدؤوا من جديد", registro: "النتيجة في الآلة",
  pos: "العربة عند {p}: رقم العدد الثاني هنا هو {d}. عدد الدورات: {t}.",
  posNombres: "الآحاد|العشرات|المئات",
  pasado: "تجاوزتم عدد الدورات في هذا الموضع: أديروا في الاتجاه المعاكس للطرح.",
  faltan: "ما زالت تنقص دورات في هذا الموضع.",
  numero: "العدد", sujeto: "الموضوع", predicado: "المحمول", frase: "«كل {s} هو {p}»",
  verdad: "صحيح: {s} ÷ {p} = {c}، بلا باقٍ.", falso: "خطأ: القسمة {s} ÷ {p} غير تامة (الباقي {r}).",
  vale: "{t} = {n}"
};
const lzT = (k, v) => String(LZ_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const lzBox = () => document.getElementById("leibnizbox");
const lzCita = (c, pie) => '<blockquote class="lz-cita"><p>' + c + "</p><footer>" + pie + "</footer></blockquote>";
const lzPs = a => (Array.isArray(a) ? a : [a]).map(p => "<p>" + p + "</p>").join("");

/* --- la rueda escalonada: nueve dientes de longitud 1…9; la rueda pequeña en la posición k engancha k --- */
function lzRuedaSvg(k){
  const x0 = 24, u = 36, y0 = 30, h = 13;
  let s = '<svg viewBox="0 0 380 180" class="lz-svg" role="img" aria-label="' + lzT("cifra", { n: k }) + '">' +
    '<rect x="' + (x0 - 6) + '" y="' + (y0 - 10) + '" width="' + (9 * u + 12) + '" height="' + (9 * h + 20) + '" rx="8" class="lz-tambor"/>';
  for (let i = 1; i <= 9; i++){
    const on = i >= 10 - k;
    s += '<rect x="' + x0 + '" y="' + (y0 + (i - 1) * h) + '" width="' + (i * u) + '" height="' + (h - 4) + '" rx="2" class="' + (on ? "lz-diente lz-on" : "lz-diente") + '"/>';
  }
  const px = x0 + (9.5 - k) * u;
  s += '<rect x="' + (px - 5) + '" y="' + (y0 - 18) + '" width="10" height="' + (9 * h + 36) + '" rx="4" class="lz-pinon"/>' +
    '<text x="' + px + '" y="' + (y0 + 9 * h + 30) + '" text-anchor="middle" class="lz-num">' + k + "</text></svg>";
  return s;
}

/* --- multiplicar con manivela y carro --- */
const LZ_M = { a: 347, b: 26, pos: 0, reg: 0, v: 0, t: [0, 0, 0] };
function lzDig(b, p){ return Math.floor(b / Math.pow(10, p)) % 10; }
function lzNPos(b){ return String(b).length; }
function lzMultRender(){
  const el = document.getElementById("lz-mult"); if (!el) return;
  const M = LZ_M, d = lzDig(M.b, M.pos), t = M.t[M.pos], nombres = lzT("posNombres").split("|");
  const regTxt = String(M.reg).padStart(Math.max(String(M.a * M.b).length, 1), "0");
  let aviso = "";
  if (t > d) aviso = '<p class="lz-aviso">' + lzT("pasado") + "</p>";
  const hecho = M.reg === M.a * M.b && M.t.every((x, i) => i >= lzNPos(M.b) || x === lzDig(M.b, i));
  el.querySelector(".lz-reg").innerHTML = regTxt.split("").map(c => '<span class="lz-dial">' + c + "</span>").join("");
  el.querySelector(".lz-carro").style.setProperty("--pos", M.pos);
  el.querySelector(".lz-estado").innerHTML = hecho
    ? '<p class="lz-ok">' + LEIBNIZ.maquina.multFin.replace(/\{(\w+)\}/g, (_, x) => ({ a: M.a, b: M.b, r: M.a * M.b, v: M.v })[x]) + "</p>"
    : "<p>" + lzT("pos", { p: nombres[M.pos] || "", d: d, t: t }) + "</p>" + aviso;
  el.querySelector('[data-lz="carro"]').disabled = M.pos >= lzNPos(M.b) - 1;
}
function lzMultReset(){
  const el = document.getElementById("lz-mult"); if (!el) return;
  const a = Math.max(1, Math.min(9999, parseInt(el.querySelector('[name="lz-a"]').value, 10) || 1));
  const b = Math.max(1, Math.min(999, parseInt(el.querySelector('[name="lz-b"]').value, 10) || 1));
  Object.assign(LZ_M, { a: a, b: b, pos: 0, reg: 0, v: 0, t: [0, 0, 0] });
  lzMultRender();
}

/* --- hexagrama de seis líneas = número de 0 a 63 (arriba, la cifra que más vale) --- */
function lzHexRender(n){
  const el = document.getElementById("lz-hex"); if (!el) return;
  const bits = n.toString(2).padStart(6, "0").split("");
  el.querySelector(".lz-lineas").innerHTML = bits.map((b, i) =>
    '<button type="button" class="lz-linea ' + (b === "1" ? "lz-yang" : "lz-yin") + '" data-i="' + i + '" aria-pressed="' + (b === "1") + '" aria-label="' + (32 >> i) + '"><span></span><span></span></button>').join("");
  const sum = bits.map((b, i) => b === "1" ? (32 >> i) : 0).filter(x => x);
  el.querySelector(".lz-bin").innerHTML = "<code>" + bits.join("") + "</code> = " + (sum.length ? sum.join(" + ") : "0") + " = <strong>" + n + "</strong>";
  const inp = el.querySelector('[name="lz-n"]'); if (document.activeElement !== inp) inp.value = n;
}

/* --- números característicos --- */
function lzAlfaRender(){
  const el = document.getElementById("lz-alfa"); if (!el) return;
  const C = LEIBNIZ.alfabeto.conceptos, s = C[+el.querySelector('[name="lz-s"]').value], p = C[+el.querySelector('[name="lz-p"]').value];
  const r = s.n % p.n, ok = r === 0;
  const vale = c => lzT("vale", { t: c.t, n: c.n }) + (c.de ? " <span class=\"lz-de\">(" + c.de + ")</span>" : "");
  el.querySelector(".lz-veredicto").innerHTML = '<p class="lz-frase">' + lzT("frase", { s: s.t, p: p.t }) + "</p>" +
    '<p class="lz-valores">' + vale(s) + " · " + vale(p) + "</p>" +
    '<p class="' + (ok ? "lz-ok" : "lz-no") + '">' + (ok ? lzT("verdad", { s: s.n, p: p.n, c: s.n / p.n }) : lzT("falso", { s: s.n, p: p.n, r: r })) + "</p>";
}

/* --- diagramas de Leibniz: círculos (los «de Euler») y líneas --- */
const LZ_DG = {   /* círculos: [etiqueta, cx, cy, r]; líneas: [etiqueta, desde, hasta, tramos de puntos [[a,b]…]] */
  A: { c: [["P", 175, 95, 78], ["S", 160, 105, 36]], l: [["S", 120, 230, []], ["P", 50, 330, []]] },
  E: { c: [["S", 105, 95, 55], ["P", 265, 95, 55]], l: [["S", 50, 160, []], ["P", 220, 330, []]] },
  I: { c: [["S", 140, 95, 62], ["P", 225, 95, 62]], l: [["S", 50, 230, [[50, 160]]], ["P", 160, 330, [[230, 330]]]], hi: "I" },
  O: { c: [["S", 140, 95, 62], ["P", 225, 95, 62]], l: [["S", 50, 230, [[160, 230]]], ["P", 160, 330, []]], hi: "O" },
  barbara: { c: [["P", 175, 95, 82], ["M", 168, 102, 56], ["S", 160, 110, 26]], l: [["S", 140, 220, []], ["M", 100, 270, []], ["P", 50, 330, []]] },
  celarent: { c: [["M", 105, 95, 62], ["S", 95, 105, 26], ["P", 270, 95, 52]], l: [["S", 70, 140, []], ["M", 40, 175, []], ["P", 230, 330, []]] }
};
function lzCirc(id){
  const D = LZ_DG[id], C = D.c, u = "lzc" + id;
  let defs = "", hi = "";
  if (D.hi){
    const S = C[0], P = C[1];
    defs = '<defs><clipPath id="' + u + 's"><circle cx="' + S[1] + '" cy="' + S[2] + '" r="' + S[3] + '"/></clipPath>' +
      '<mask id="' + u + 'm"><rect width="380" height="190" fill="#fff"/><circle cx="' + P[1] + '" cy="' + P[2] + '" r="' + P[3] + '" fill="#000"/></mask></defs>';
    hi = D.hi === "I"
      ? '<circle cx="' + P[1] + '" cy="' + P[2] + '" r="' + P[3] + '" clip-path="url(#' + u + 's)" class="lz-zona"/>'
      : '<circle cx="' + S[1] + '" cy="' + S[2] + '" r="' + S[3] + '" mask="url(#' + u + 'm)" class="lz-zona"/>';
  }
  const circ = C.map(c => '<circle cx="' + c[1] + '" cy="' + c[2] + '" r="' + c[3] + '" class="lz-circ"/>').join("");
  const lab = C.map(c => '<text x="' + c[1] + '" y="' + (c[2] - c[3] + 17) + '" text-anchor="middle" class="lz-lab">' + c[0] + "</text>").join("");
  return '<svg viewBox="0 0 380 190" class="lz-svg" role="img" aria-label="' + lzT("circulos") + '">' + defs + hi + circ + lab + "</svg>";
}
function lzLin(id){
  const L = LZ_DG[id].l, h = 34;
  let s = '<svg viewBox="0 0 380 ' + (L.length * h + 20) + '" class="lz-svg" role="img" aria-label="' + lzT("lineas") + '">';
  L.forEach((r, i) => {
    const y = 22 + i * h, pts = r[3];
    s += '<text x="18" y="' + (y + 5) + '" class="lz-lab">' + r[0] + "</text>";
    /* tramo continuo menos los tramos de puntos */
    const cortes = [r[1]]; pts.forEach(p => cortes.push(p[0], p[1])); cortes.push(r[2]);
    for (let k = 0; k < cortes.length; k += 2) if (cortes[k + 1] > cortes[k])
      s += '<line x1="' + cortes[k] + '" y1="' + y + '" x2="' + cortes[k + 1] + '" y2="' + y + '" class="lz-seg"/>';
    pts.forEach(p => { s += '<line x1="' + p[0] + '" y1="' + y + '" x2="' + p[1] + '" y2="' + y + '" class="lz-seg lz-puntos"/>'; });
    s += '<line x1="' + r[1] + '" y1="' + (y - 7) + '" x2="' + r[1] + '" y2="' + (y + 7) + '" class="lz-tope"/><line x1="' + r[2] + '" y1="' + (y - 7) + '" x2="' + r[2] + '" y2="' + (y + 7) + '" class="lz-tope"/>';
  });
  return s + "</svg>";
}
function lzDiagRender(id){
  const el = document.getElementById("lz-diag"); if (!el) return;
  const c = LEIBNIZ.diagramas.casos.find(x => x.id === id) || LEIBNIZ.diagramas.casos[0];
  el.querySelectorAll(".lz-chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === c.id)));
  el.querySelector(".lz-dgfrase").innerHTML = "<strong>" + c.t + "</strong>. " + c.d;
  el.querySelector(".lz-dgc").innerHTML = lzCirc(c.id);
  el.querySelector(".lz-dgl").innerHTML = lzLin(c.id);
}

function lzRender(){
  const box = lzBox(); if (!box || typeof LEIBNIZ === "undefined" || box.dataset.lzHecho) return;
  box.dataset.lzHecho = "1";
  const L = LEIBNIZ, Mq = L.maquina, B = L.binario, A = L.alfabeto, K = L.calculemos, T = L.tratados, G = L.diagramas, N = L.newton, V = L.voltaire;
  const opts = A.conceptos.map((c, i) => '<option value="' + i + '">' + c.t + "</option>").join("");
  box.innerHTML =
    '<div class="lz-cabecera"><figure class="lz-retrato"><img src="media/retratos/museo2/leibniz.jpg" alt="" decoding="async"><figcaption>' + L.retrato + "</figcaption></figure>" +
    '<div><p class="lz-intro">' + L.intro + '</p><p class="lz-pista">' + L.pista + "</p></div></div>" +

    '<section class="lz-sec" id="lz-maquina"><h2>' + Mq.titulo + "</h2>" + lzPs(Mq.texto) + lzCita(Mq.cita, Mq.citaPie) +
    '<div class="lz-pieza"><h3>' + Mq.ruedaTit + "</h3><p>" + Mq.ruedaTxt + '</p><div id="lz-rueda">' + lzRuedaSvg(3) + "</div>" +
    '<input type="range" min="0" max="9" value="3" name="lz-k" aria-label="' + lzT("ruedaAria") + '"><p class="lz-cifra">' + lzT("cifra", { n: 3 }) + "</p></div>" +
    '<div class="lz-pieza" id="lz-mult"><h3>' + Mq.multTit + "</h3><p>" + Mq.multTxt + "</p>" +
    '<div class="lz-campos"><label>' + lzT("numA") + ' <input type="number" name="lz-a" min="1" max="9999" value="347"></label><span aria-hidden="true">×</span>' +
    "<label>" + lzT("numB") + ' <input type="number" name="lz-b" min="1" max="999" value="26"></label></div>' +
    '<div class="lz-maquina"><p class="lz-etq">' + lzT("registro") + '</p><div class="lz-reg"></div><div class="lz-carril"><span class="lz-carro"></span></div></div>' +
    '<div class="lz-estado" aria-live="polite"></div>' +
    '<div class="lz-botones"><button type="button" data-lz="girar">' + lzT("girar") + '</button><button type="button" data-lz="reves">' + lzT("reves") + "</button>" +
    '<button type="button" data-lz="carro">' + lzT("carro") + '</button><button type="button" data-lz="reiniciar" class="lz-sec-btn">' + lzT("reiniciar") + "</button></div></div></section>" +

    '<section class="lz-sec" id="lz-binario"><h2>' + B.titulo + "</h2>" + lzPs(B.texto) + '<p class="lz-cuidado">' + B.cuidado + "</p>" +
    '<div class="lz-pieza" id="lz-hex"><h3>' + B.hexTit + "</h3><p>" + B.hexTxt + '</p><div class="lz-hexwrap"><div class="lz-lineas"></div>' +
    '<div><label>' + lzT("numero") + ' <input type="number" name="lz-n" min="0" max="63" value="45"></label><p class="lz-bin"></p></div></div></div>' +
    "<p>" + B.puente + "</p></section>" +

    '<section class="lz-sec" id="lz-alfabeto"><h2>' + A.titulo + "</h2>" + lzPs(A.texto) +
    '<div class="lz-pieza" id="lz-alfa"><h3>' + A.probTit + "</h3><p>" + A.probTxt + "</p>" +
    '<div class="lz-campos"><label>' + lzT("sujeto") + ' <select name="lz-s">' + opts + "</select></label><label>" + lzT("predicado") + ' <select name="lz-p">' + opts + "</select></label></div>" +
    '<div class="lz-veredicto" aria-live="polite"></div></div><p class="lz-cuidado">' + A.problema + "</p></section>" +

    '<section class="lz-sec" id="lz-tratados"><h2>' + T.titulo + "</h2><p>" + T.texto + '</p><ol class="lz-crono">' +
    T.lista.map(x => '<li><span class="lz-y">' + x.y + "</span><span>" + x.t + "<br>" + x.d + "</span></li>").join("") + "</ol></section>" +

    '<section class="lz-sec" id="lz-diagramas"><h2>' + G.titulo + "</h2>" + lzPs(G.texto) +
    '<div class="lz-pieza" id="lz-diag"><h3>' + G.probTit + "</h3><p>" + G.probTxt + '</p><div class="lz-chips">' +
    G.casos.map(c => '<button type="button" class="lz-chip" data-id="' + c.id + '" aria-pressed="false">' + c.t + "</button>").join("") + "</div>" +
    '<p class="lz-dgfrase" aria-live="polite"></p><div class="lz-dgpar"><figure><figcaption>' + G.circulos + '</figcaption><div class="lz-dgc"></div></figure>' +
    "<figure><figcaption>" + G.lineas + '</figcaption><div class="lz-dgl"></div></figure></div></div><p>' + G.puente + "</p></section>" +

    '<section class="lz-sec" id="lz-calculemos"><h2>' + K.titulo + "</h2>" + lzCita(K.cita, K.citaPie) + "<p>" + K.texto + "</p>" +
    "<h3>" + K.lineaTit + '</h3><ol class="lz-crono">' + L.linea.map(x => '<li><span class="lz-y">' + x.y + "</span><span>" + x.t + "</span></li>").join("") + "</ol>" +
    "<h3>" + L.molino.titulo + "</h3><p>" + L.molino.texto + "</p>" + lzCita(L.molino.cita, L.molino.citaPie) + "</section>" +

    '<section class="lz-sec lz-reverso" id="lz-reverso"><h2>' + L.reverso.titulo + '</h2><p class="lz-intro">' + L.reverso.intro + "</p>" +
    '<div id="lz-newton" class="lz-sub"><h3>' + N.titulo + '</h3><figure class="lz-retrato lz-retrato-p"><img src="media/retratos/museo/newton.jpg" alt="" loading="lazy" decoding="async"><figcaption>' + N.pie + "</figcaption></figure>" +
    lzPs(N.texto) + '<p class="lz-cuidado">' + N.cuidado + "</p><p>" + N.final + "</p></div>" +
    '<div id="lz-voltaire" class="lz-sub"><h3>' + V.titulo + '</h3><figure class="lz-retrato lz-retrato-p"><img src="media/retratos/museo2/voltaire.jpg" alt="" loading="lazy" decoding="async"><figcaption>' + V.pie + "</figcaption></figure>" +
    lzPs(V.texto) + lzCita(V.cita, V.citaPie) + "<p>" + V.nombre + '</p><p class="lz-cuidado">' + V.matiz + "</p><p>" + V.pangloss + "</p><p>" + V.final + "</p></div>" +
    '<div class="lz-preguntas"><h3>' + L.preguntas.titulo + "</h3><ul>" + L.preguntas.lista.map(q => "<li>" + q + "</li>").join("") + "</ul></div></section>";

  /* valores de partida del ejemplo: «Todo ser humano es animal» */
  box.querySelector('[name="lz-s"]').value = String(A.conceptos.findIndex(c => c.n === 6));
  box.querySelector('[name="lz-p"]').value = String(A.conceptos.findIndex(c => c.n === 2));

  box.querySelector('[name="lz-k"]').addEventListener("input", e => {
    const k = +e.target.value;
    document.getElementById("lz-rueda").innerHTML = lzRuedaSvg(k);
    box.querySelector(".lz-cifra").textContent = lzT("cifra", { n: k });
  });
  const mult = document.getElementById("lz-mult");
  mult.addEventListener("click", e => {
    const b = e.target.closest("button[data-lz]"); if (!b) return;
    const M = LZ_M, paso = M.a * Math.pow(10, M.pos);
    if (b.dataset.lz === "girar"){ M.reg += paso; M.t[M.pos]++; M.v++; }
    else if (b.dataset.lz === "reves"){ if (M.t[M.pos] > 0){ M.reg -= paso; M.t[M.pos]--; M.v++; } }
    else if (b.dataset.lz === "carro"){ if (M.pos < lzNPos(M.b) - 1) M.pos++; }
    else if (b.dataset.lz === "reiniciar") return lzMultReset();
    lzMultRender();
  });
  mult.querySelectorAll("input").forEach(i => i.addEventListener("change", lzMultReset));
  lzMultReset();

  const hex = document.getElementById("lz-hex");
  hex.addEventListener("click", e => {
    const b = e.target.closest(".lz-linea"); if (!b) return;
    const n = parseInt(hex.querySelector('[name="lz-n"]').value, 10) || 0;
    lzHexRender(n ^ (32 >> +b.dataset.i));
    const nb = hex.querySelector('.lz-linea[data-i="' + b.dataset.i + '"]'); if (nb) nb.focus();
  });
  hex.querySelector('[name="lz-n"]').addEventListener("input", e => {
    const n = parseInt(e.target.value, 10); if (n >= 0 && n <= 63) lzHexRender(n);
  });
  lzHexRender(45);

  document.getElementById("lz-diag").addEventListener("click", e => { const b = e.target.closest(".lz-chip"); if (b) lzDiagRender(b.dataset.id); });
  lzDiagRender("A");

  document.getElementById("lz-alfa").addEventListener("change", lzAlfaRender);
  lzAlfaRender();
}
function loadLeibniz(arg){
  lzRender();
  if (arg){ const el = document.getElementById("lz-" + arg); if (el) el.scrollIntoView({ block: "start" }); }
}
if (lzBox()) lzRender();
