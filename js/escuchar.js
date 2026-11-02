/* escuchar.js — DUA, Ola 1 (ficha D1.1): «Escuchar esta página», dentro del panel «Aa».
 *
 * Lee en voz alta, párrafo a párrafo, lo que se ve de la vista activa (el apartado del
 * tema, la ficha, la lectura) con speechSynthesis, y resalta el párrafo que suena.
 * Mientras suena aparece abajo una barrita fija (pausa, siguiente, velocidad, parar)
 * que no empuja nada; al parar desaparece.
 *
 * Reglas del plan (plan_mejoras_dua_2026-10-23.md, §3.0):
 *  - la voz se elige por la lengua de la página; si no hay voz para esa lengua, se dice
 *    y en euskera se enlaza a AhoTTS. NUNCA se lee el euskera con una voz castellana SIN AVISAR
 *    (02-11, P-123: sin voz vasca lee una castellana adaptada y lo dice el aviso del panel);
 *  - se normaliza eu_ES / eu-ES (Android usa guion bajo) y se espera a «voiceschanged»;
 *  - se lee por párrafos (las voces en línea cortan los enunciados largos);
 *  - se salta el griego (lang="grc", D0.6), las fórmulas de lógica y los botones.
 * Las voces «en línea» de Chrome y Edge mandan el texto de la web (nunca datos del
 * alumnado) al servicio del navegador; lo explica la guía.
 *
 * Mejoras del 02-11 (la 120, P-123; solo voz del navegador, decisión del profesor):
 *  - la voz se elige por puntos: «Natural/Neural/Online» (Edge), Premium/Enhanced (Apple),
 *    «Google» (Chrome) y, por último, las locales; con la variante de la web delante (nl añadido);
 *  - euskera sin voz vasca: voz castellana con la grafía adaptada (respaldo_es del diccionario),
 *    solo en lo que se manda a la voz; árabe sin voz árabe: aviso con dónde instalarla;
 *  - diccionario de pronunciación (js/pronunciacion.js, generado desde web_i18n/pronunciacion/),
 *    que se pide solo al pulsar: transliteración del griego, nombres propios, abreviaturas y siglos;
 *  - no se leen tablas, figuras ni notas; los párrafos largos se parten en frases (pausas y sin
 *    cortes en Android) y el resaltado sigue siendo por párrafo.
 */
(function () {
  "use strict";

  var html = document.documentElement;
  var btn = document.getElementById("a11yescuchar");
  var aviso = document.getElementById("a11yaviso");
  var bar = document.getElementById("a11ybar");
  if (!btn || !bar) return;
  var bPausa = document.getElementById("a11ypausa");
  var bSig = document.getElementById("a11ysig");
  var bParar = document.getElementById("a11yparar");
  var selVel = document.getElementById("a11yvel");

  var synth = window.speechSynthesis;
  var PREF = { es: "es-es", eu: "eu-es", fr: "fr-fr", en: "en-gb", ar: "ar-sa", nl: "nl-nl" };
  var AHOTTS = "https://aholab.ehu.eus/aholab/eu/ahosapi/";   /* página oficial de descarga para Windows (comprobada el 24-10-2026) */
  /* Carpeta de este script, para pedir pronunciacion.js a su lado (con defer, currentScript sigue valiendo aquí). */
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^\/]*$/, "") : "js/";
  })();

  var cola = [], i = 0, turno = 0, pausado = false, vozActual = null, latido = null, respaldo = false;

  function decir(msg, enlace) {
    if (!aviso) return;
    aviso.textContent = msg;
    if (enlace) {
      aviso.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = enlace.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = enlace.texto;
      aviso.appendChild(a);
    }
    aviso.hidden = false;
  }

  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    btn.disabled = true;
    decir("لا يستطيع هذا المتصفح القراءة بصوت عالٍ.");
    return;
  }

  function lengua() { return (html.lang || "es").toLowerCase().slice(0, 2); }
  function norm(l) { return String(l || "").replace(/_/g, "-").toLowerCase(); }

  /* Puntos de una voz para la lengua l: primero que sea de la lengua; luego la calidad que delata
     el nombre (las neuronales de Edge se llaman «… Online (Natural)», las de Apple «… (Premium)» o
     «(Enhanced)», las de Chrome «Google …»); luego la variante de la web; las locales, al final. */
  function puntos(v, l) {
    var x = norm(v.lang), n = String(v.name || "");
    if (x !== l && x.indexOf(l + "-") !== 0) return -1;
    var p = 100;
    if (/natural|neural/i.test(n)) p += 50;
    else if (/online/i.test(n)) p += 40;
    if (/premium|enhanced|mejorada|optimizada/i.test(n)) p += 35;
    if (/google/i.test(n)) p += 25;
    if (x === PREF[l]) p += 20;
    if (v.localService) p += 1;
    return p;
  }
  function mejorVoz(l) {
    var mejor = null, pm = -1;
    (synth.getVoices() || []).forEach(function (v) { var p = puntos(v, l); if (p > pm) { pm = p; mejor = v; } });
    return mejor;
  }
  /* Chrome carga las voces tarde: se espera a «voiceschanged», como mucho 1,5 s. */
  function conVoces(fn) {
    if ((synth.getVoices() || []).length) return fn();
    var hecho = false;
    function listo() { if (hecho) return; hecho = true; synth.removeEventListener("voiceschanged", listo); fn(); }
    synth.addEventListener("voiceschanged", listo);
    setTimeout(listo, 1500);
  }

  /* Diccionario de pronunciación: se pide la primera vez que se pulsa; si falla, se lee sin él. */
  function conDiccionario(fn) {
    if (window.PRONUNCIACION) return fn();
    var s = document.createElement("script"), hecho = false;
    function listo() { if (hecho) return; hecho = true; fn(); }
    s.src = BASE + "pronunciacion.js";
    s.onload = listo; s.onerror = listo;
    setTimeout(listo, 3000);
    document.head.appendChild(s);
  }
  function dicc() { return (window.PRONUNCIACION || {})[lengua()] || {}; }

  function romano(r) {
    var V = { I: 1, V: 5, X: 10, L: 50 }, t = 0;
    for (var k = 0; k < r.length; k++) { var a = V[r[k]], b = V[r[k + 1]] || 0; t += a < b ? -a : a; }
    return t;
  }
  function trocar(t, pares) {
    (pares || []).forEach(function (p) { t = t.split(p[0]).join(p[1]); });
    return t;
  }
  /* Lo que se manda a la voz (nunca a la pantalla): abreviaturas, siglos y palabras del diccionario y,
     con voz castellana para el euskera, la grafía adaptada. */
  function pronunciar(t) {
    var d = dicc();
    t = trocar(t, d.abreviaturas);
    (d.siglos || []).forEach(function (s) {
      t = t.replace(new RegExp(s.re, "g"), function () {
        var g = arguments;
        return s.plantilla.replace(/\{(\d)\}/g, function (_, k) { return (d.n || [])[romano(g[k])] || g[k]; })
          .replace(/\$(\d)/g, function (_, k) { return g[k] || ""; });
      });
    });
    var pal = d.palabras || {};
    var claves = Object.keys(pal);
    if (claves.length) {
      var re = new RegExp("(^|[^A-Za-zÀ-ÿ])(" + claves.map(function (c) { return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?=$|[^A-Za-zÀ-ÿ])", "g");
      t = t.replace(re, function (_, a, w) { return a + pal[w]; });
    }
    if (respaldo) t = trocar(t, d.respaldo_es);
    return t;
  }

  /* Los bloques que se leen: los visibles de la vista activa, sin repetir los anidados.
     Fuera las tablas, las figuras y las notas, que en voz alta no se entienden. */
  var SEL = "h1,h2,h3,h4,p,li,blockquote,dt,dd";
  var FUERA = "nav,button,select,textarea,script,style,table,figure,.formula,.nota,.notas,.footnotes,.a11y-panel,.a11y-bar,[aria-hidden='true'],[hidden]";
  var GRIEGO = /[\u0370-\u03FF\u1F00-\u1FFF]\s*\(\s*$/;
  function textoDe(el) {
    var c = el.cloneNode(true), d = dicc();
    /* La transliteración en cursiva que va tras el griego (regla 5.24) se lee con las reglas «griego». */
    c.querySelectorAll("em,i").forEach(function (e) {
      var a = e.previousSibling, b = a && a.previousSibling;
      if (a && a.nodeType === 3 && /\(\s*$/.test(a.nodeValue) &&
          ((b && b.nodeType === 1 && b.getAttribute("lang") === "grc") || GRIEGO.test(a.nodeValue))) {
        e.textContent = trocar(e.textContent.normalize("NFD").replace(/[\u0302\u0304\u0306\u0313\u0314\u0342]/g, "").normalize("NFC"), d.griego);
      }
    });
    /* Los términos del Diccionario en línea son botones (button.dicc-term) con la palabra del texto: se leen. */
    c.querySelectorAll("[lang='grc'],.formula,button:not(.dicc-term),script,style,sup,table,figure").forEach(function (n) { n.remove(); });
    return c.textContent.replace(/[\u0370-\u03FF\u1F00-\u1FFF][\u0370-\u03FF\u1F00-\u1FFF\u0300-\u036F]*/g, " ")   /* el griego que quedara sin marcar */
      .replace(/\(\s*\)/g, " ").replace(/\s+/g, " ").replace(/\s*§\s*\d*\s*$/, "").trim();   /* sin el ancla «§1» de los títulos */
  }
  /* Los párrafos largos, en frases de ~250 caracteres como mucho: pausas naturales y sin cortes. */
  function trozos(t) {
    if (t.length <= 250) return [t];
    var fr = t.replace(/([.!?;:»”])\s+/g, "$1\u0001").split("\u0001"), out = [], cur = "";
    fr.forEach(function (f) {
      if (cur && (cur + " " + f).length > 250) { out.push(cur); cur = f; }
      else cur = cur ? cur + " " + f : f;
    });
    if (cur) out.push(cur);
    return out;
  }
  function bloques() {
    var vista = document.querySelector("main section.view.active") || document.querySelector("main");
    if (!vista) return [];
    var els = Array.prototype.slice.call(vista.querySelectorAll(SEL)).filter(function (el) {
      return el.getClientRects().length && !el.closest(FUERA);
    });
    var hojas = els.filter(function (el) { return !els.some(function (o) { return o !== el && el.contains(o); }); });
    var out = [];
    hojas.forEach(function (el) {
      var t = textoDe(el);
      if (!/[A-Za-zÀ-ÿ؀-ۿ]/.test(t)) return;
      trozos(pronunciar(t)).forEach(function (x) { out.push({ el: el, t: x }); });
    });
    return out;
  }

  function marcar(el) {
    document.querySelectorAll(".a11y-leyendo").forEach(function (n) { if (n !== el) n.classList.remove("a11y-leyendo"); });
    if (!el || el.classList.contains("a11y-leyendo")) return;
    el.classList.add("a11y-leyendo");
    var r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 70) {
      el.scrollIntoView({ block: "center", behavior: (window.A11y && A11y.motion) ? A11y.motion() : "auto" });
    }
  }

  /* Chrome deja de hablar a los ~15 s con las voces en línea: pausa y reanuda cada 10 s. */
  function latir(on) {
    clearInterval(latido); latido = null;
    if (on && vozActual && !vozActual.localService) {
      latido = setInterval(function () { if (synth.speaking && !pausado) { synth.pause(); synth.resume(); } }, 10000);
    }
  }

  function hablar(n) {
    var t = ++turno;
    synth.cancel();
    if (n >= cola.length) { parar(); return; }
    i = n; pausado = false; bPausa.textContent = "⏸"; bPausa.setAttribute("aria-label", "إيقاف مؤقت");
    marcar(cola[i].el);
    var u = new SpeechSynthesisUtterance(cola[i].t);
    u.voice = vozActual; u.lang = vozActual.lang; u.rate = parseFloat(selVel.value) || 1;
    u.onend = function () { if (t === turno) hablar(i + 1); };
    u.onerror = function (e) { if (t === turno && e.error !== "interrupted" && e.error !== "canceled") hablar(i + 1); };
    synth.speak(u);
  }
  /* «Siguiente» salta al párrafo siguiente, no a la frase siguiente del mismo párrafo. */
  function siguiente() {
    var n = i + 1;
    while (n < cola.length && cola[n].el === cola[i].el) n++;
    hablar(n);
  }

  function empezar() {
    if (aviso) aviso.hidden = true;
    conVoces(function () {
      var l = lengua();
      respaldo = false;
      vozActual = mejorVoz(l);
      if (!vozActual && l === "eu") {
        vozActual = mejorVoz("es");
        if (!vozActual) { decir("لا يوجد على هذا الجهاز صوت للغة الباسكية. يمكنك تثبيت صوت باسكي مجاني:", { href: AHOTTS, texto: "AhoTTS (Aholab, UPV/EHU)" }); return; }
        respaldo = true;
      }
      if (!vozActual) {
        if (l === "ar") decir("لا يوجد على هذا الجهاز صوت عربي. يمكنك إضافته من إعدادات الكلام في النظام (في ويندوز: «الوقت واللغة › الكلام»؛ في أندرويد: «تحويل النص إلى كلام»).");
        else decir("لا يوجد على هذا الجهاز صوت لهذه اللغة.");
        return;
      }
      conDiccionario(function () {
        cola = bloques();
        if (!cola.length) { decir("لا يوجد نص للقراءة في هذه الصفحة."); return; }
        if (respaldo) {
          /* Aviso discreto: queda en el panel (que no se cierra) y como título de la barra. */
          var msg = "لا يوجد على هذا الجهاز صوت باسكي: يقرأ النصَّ صوتٌ إسباني مُكيَّف. لسماعه بالباسكية، ثبّت صوتًا باسكيًا مجانيًا:";
          decir(msg, { href: AHOTTS, texto: "AhoTTS (Aholab, UPV/EHU)" });
          bar.title = msg;
        } else if (window.A11y && A11y.cerrarPanel) A11y.cerrarPanel(false);
        bar.hidden = false;
        latir(true);
        hablar(0);
      });
    });
  }

  function parar() {
    turno++;
    synth.cancel();
    latir(false);
    marcar(null);
    bar.hidden = true;
    bar.removeAttribute("title");
    cola = []; pausado = false;
  }

  btn.addEventListener("click", empezar);
  bPausa.addEventListener("click", function () {
    if (!pausado) { synth.pause(); pausado = true; bPausa.textContent = "▶"; bPausa.setAttribute("aria-label", "متابعة"); }
    else { synth.resume(); pausado = false; bPausa.textContent = "⏸"; bPausa.setAttribute("aria-label", "إيقاف مؤقت"); }
  });
  bSig.addEventListener("click", siguiente);
  bParar.addEventListener("click", parar);
  selVel.addEventListener("change", function () { if (!bar.hidden) hablar(i); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !bar.hidden) parar(); });
  window.addEventListener("hashchange", function () { if (!bar.hidden) parar(); });
  window.addEventListener("pagehide", function () { synth.cancel(); });

  /* Para las comprobaciones (tools/escuchar_probar.js): qué voz se elige y qué texto se mandaría. */
  window.Escuchar = {
    voz: function () { var v = mejorVoz(lengua()); return v ? { name: v.name, lang: v.lang, local: v.localService } : null; },
    preparar: function (fn) {
      conVoces(function () {
        respaldo = !mejorVoz(lengua()) && lengua() === "eu" && !!mejorVoz("es");
        conDiccionario(function () { fn(bloques().map(function (b) { return b.t; }), respaldo); });
      });
    }
  };
})();
