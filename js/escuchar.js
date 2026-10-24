/* escuchar.js — DUA, Ola 1 (ficha D1.1): «Escuchar esta página», dentro del panel «Aa».
 *
 * Lee en voz alta, párrafo a párrafo, lo que se ve de la vista activa (el apartado del
 * tema, la ficha, la lectura) con speechSynthesis, y resalta el párrafo que suena.
 * Mientras suena aparece abajo una barrita fija (pausa, siguiente, velocidad, parar)
 * que no empuja nada; al parar desaparece.
 *
 * Reglas del plan (plan_mejoras_dua_2026-10-23.md, §3.0):
 *  - la voz se elige por la lengua de la página; si no hay voz para esa lengua, se dice
 *    y en euskera se enlaza a AhoTTS. NUNCA se lee el euskera con una voz castellana;
 *  - se normaliza eu_ES / eu-ES (Android usa guion bajo) y se espera a «voiceschanged»;
 *  - se lee por párrafos (las voces en línea cortan los enunciados largos);
 *  - se salta el griego (lang="grc", D0.6), las fórmulas de lógica y los botones.
 * Las voces «en línea» de Chrome y Edge mandan el texto de la web (nunca datos del
 * alumnado) al servicio del navegador; lo explica la guía.
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
  var PREF = { es: "es-es", eu: "eu-es", fr: "fr-fr", en: "en-gb", ar: "ar-sa" };
  var AHOTTS = "https://aholab.ehu.eus/aholab/eu/ahosapi/";   /* página oficial de descarga para Windows (comprobada el 24-10-2026) */

  var cola = [], i = 0, turno = 0, pausado = false, vozActual = null, latido = null;

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
  function elegirVoz() {
    var l = lengua(), voces = synth.getVoices() || [];
    var buenas = voces.filter(function (v) { var x = norm(v.lang); return x === l || x.indexOf(l + "-") === 0; });
    if (!buenas.length) return null;
    var exacta = buenas.filter(function (v) { return norm(v.lang) === PREF[l]; });
    var lista = exacta.length ? exacta : buenas;
    return lista.filter(function (v) { return v.localService; })[0] || lista[0];
  }
  /* Chrome carga las voces tarde: se espera a «voiceschanged», como mucho 1,5 s. */
  function conVoces(fn) {
    if ((synth.getVoices() || []).length) return fn();
    var hecho = false;
    function listo() { if (hecho) return; hecho = true; synth.removeEventListener("voiceschanged", listo); fn(); }
    synth.addEventListener("voiceschanged", listo);
    setTimeout(listo, 1500);
  }

  /* Los bloques que se leen: los visibles de la vista activa, sin repetir los anidados. */
  var SEL = "h1,h2,h3,h4,p,li,blockquote,dt,dd,figcaption";
  var FUERA = "nav,button,select,textarea,script,style,.formula,.a11y-panel,.a11y-bar,[aria-hidden='true'],[hidden]";
  function textoDe(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll("[lang='grc'],.formula,button,script,style,sup").forEach(function (n) { n.remove(); });
    return c.textContent.replace(/\s+/g, " ").replace(/\s*§\s*\d*\s*$/, "").trim();   /* sin el ancla «§1» de los títulos */
  }
  function bloques() {
    var vista = document.querySelector("main section.view.active") || document.querySelector("main");
    if (!vista) return [];
    var els = Array.prototype.slice.call(vista.querySelectorAll(SEL)).filter(function (el) {
      return el.getClientRects().length && !el.closest(FUERA);
    });
    var hojas = els.filter(function (el) { return !els.some(function (o) { return o !== el && el.contains(o); }); });
    return hojas.map(function (el) { return { el: el, t: textoDe(el) }; })
      .filter(function (b) { return /[A-Za-zÀ-ÿ؀-ۿ]/.test(b.t); });
  }

  function marcar(el) {
    document.querySelectorAll(".a11y-leyendo").forEach(function (n) { n.classList.remove("a11y-leyendo"); });
    if (!el) return;
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

  function empezar() {
    if (aviso) aviso.hidden = true;
    conVoces(function () {
      vozActual = elegirVoz();
      if (!vozActual) {
        if (lengua() === "eu") decir("لا يوجد على هذا الجهاز صوت للغة الباسكية. يمكنك تثبيت صوت باسكي مجاني:", { href: AHOTTS, texto: "AhoTTS (Aholab, UPV/EHU)" });
        else decir("لا يوجد على هذا الجهاز صوت لهذه اللغة.");
        return;
      }
      cola = bloques();
      if (!cola.length) { decir("لا يوجد نص للقراءة في هذه الصفحة."); return; }
      if (window.A11y && A11y.cerrarPanel) A11y.cerrarPanel(false);
      bar.hidden = false;
      latir(true);
      hablar(0);
    });
  }

  function parar() {
    turno++;
    synth.cancel();
    latir(false);
    marcar(null);
    bar.hidden = true;
    cola = []; pausado = false;
  }

  btn.addEventListener("click", empezar);
  bPausa.addEventListener("click", function () {
    if (!pausado) { synth.pause(); pausado = true; bPausa.textContent = "▶"; bPausa.setAttribute("aria-label", "متابعة"); }
    else { synth.resume(); pausado = false; bPausa.textContent = "⏸"; bPausa.setAttribute("aria-label", "إيقاف مؤقت"); }
  });
  bSig.addEventListener("click", function () { hablar(i + 1); });
  bParar.addEventListener("click", parar);
  selVel.addEventListener("change", function () { if (!bar.hidden) hablar(i); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !bar.hidden) parar(); });
  window.addEventListener("hashchange", function () { if (!bar.hidden) parar(); });
  window.addEventListener("pagehide", function () { synth.cancel(); });
})();
