"use strict";
/* ===== Registro de uso por grupo (P-062, Lote R del plan del agente 47; decisiones del 18-10 en docs/36) =====
   Solo en las webs publicadas de Bachillerato (fil, hf): build_subject.js inyecta window.USO_CONFIG
   ({ url, grupos, version }) desde tools/uso_config.json. Sin USO_CONFIG o con url vacía, este módulo no hace
   NADA: ni muestra la línea de la ficha ni envía datos (así quedan la web maestra, la ESO y las webs mientras el
   profesor no lo active).
   Opt-out (docs/36, cambio del 22-10): registra por defecto de forma anónima, con el botón «Dejar de compartir»
   y el enlace «Qué registra esta web» siempre a la vista; el alumno que guarde «off» no se registra en ese
   navegador. Antes (18-10) era opt-in. En todo lo demás sigue igual de restrictivo: sin identificador de visita
   ni de persona, sin aparato, sin cookies, sin IP (Apps
   Script no la ve), sin texto escrito por el alumno; día y franja (mañana, tarde, noche) en vez de hora; grupo
   opcional. Cada lote lleva los campos comunes una vez y una lista de eventos con claves de la web y números.
   Eventos: vista (sección y pieza, del hash), caja_tema (bloque y destino del enlace pulsado), ampliar,
   pestana (del menú), conmutador, cuestionario (aciertos, total, números de las preguntas falladas), tarjetas
   (marcadas como sabidas en la baraja) y reto (puntos). Lo llaman quiz.js, flashcards.js y retosview.js con
   window.Uso && Uso.ev(...); lo demás se escucha aquí. */
(function(){
  var CFG = window.USO_CONFIG;
  var ACTIVO = !!(CFG && typeof CFG.url === "string" && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CFG.url));
  var TXT = {
    datos: "بيانات الاستخدام:", compartir: "مشاركة بيانات الاستخدام", dejar: "إيقاف المشاركة",
    compartes: "تشاركون بيانات الاستخدام دون الكشف عن هويتكم.", grupo: "مجموعتكم:", noDecir: "أفضّل عدم الإفصاح",
    queRegistra: "ما الذي يسجّله هذا الموقع"
  };
  var KEY = "aula-uso", COLA = "aula-uso-cola", TEST = "aula-uso-test", MAX_COLA = 200, MAX_LOTE = 50;
  /* modo prueba (nuestro trasteo): ?usotest=1 lo activa en este navegador, ?usotest=0 lo quita. En ese modo el
     lote lleva sim:1 → el servidor pone simulado=«sí» y la fila NO cuenta en el análisis (resumirSemanas la ignora). */
  try { var _ut = /[?&]usotest=([01])/.exec(location.search); if (_ut){ if (_ut[1] === "1") localStorage.setItem(TEST, "1"); else localStorage.removeItem(TEST); } } catch (e){}
  function esPrueba(){ try { return localStorage.getItem(TEST) === "1"; } catch (e){ return false; } }
  function leer(k, def){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e){ return def; } }
  function guardar(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
  /* opt-out (22-10): por defecto encendido; solo queda apagado si el alumno guardó «off» en este navegador */
  function estado(){ var s = leer(KEY, null); return s && typeof s === "object" ? s : { on: true, grupo: "" }; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* solo claves de la web: letras, números, guiones, barras y puntos (nunca texto libre) */
  function clave(s){ s = String(s == null ? "" : s); try { s = decodeURIComponent(s); } catch (e){} return /^[\w.\/-]{1,80}$/.test(s) ? s : ""; }
  function web(){ var S = typeof SUBJECTS !== "undefined" ? Object.keys(SUBJECTS) : []; return S.length === 1 ? S[0] : ""; }
  function franja(){ var h = new Date().getHours(); return h >= 6 && h < 14 ? "m" : h >= 14 && h < 21 ? "t" : "n"; }
  function hoy(){ var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  var cola = [];
  function ev(tipo, datos){
    if (!ACTIVO || !estado().on) return;
    var e = { t: tipo };
    Object.keys(datos || {}).forEach(function(k){ var v = datos[k]; if (typeof v === "number" || Array.isArray(v)) e[k] = v; else { var c = clave(v); if (c) e[k] = c; } });
    cola.push(e);
    if (cola.length >= MAX_LOTE) enviar();
  }
  function enviar(){
    if (!ACTIVO || !estado().on) { cola = []; return; }
    var pend = leer(COLA, []).concat(cola); cola = [];
    if (!pend.length) return;
    var s = estado(), lote = pend.slice(0, MAX_LOTE), resto = pend.slice(MAX_LOTE);
    var cuerpo = JSON.stringify({ v: 1, web: web(), lengua: (document.documentElement.lang || "es").slice(0, 2), grupo: s.grupo || "",
      fecha: hoy(), franja: franja(), version: clave(CFG.version), sim: esPrueba() ? 1 : undefined, ev: lote });
    var ok = false;
    try { ok = navigator.sendBeacon && navigator.sendBeacon(CFG.url, new Blob([cuerpo], { type: "text/plain;charset=utf-8" })); } catch (e){ ok = false; }
    guardar(COLA, (ok ? resto : pend).slice(-MAX_COLA));
  }

  /* ---------- lo que se escucha aquí ---------- */
  function hashPartes(){ var h = (location.hash || "").replace(/^#/, "").split("/"); return { s: clave(h[0]), p: clave(h.slice(1).join("/")) }; }
  function temaActual(){ var h = hashPartes(); return h.s === "teoria" ? h.p : ""; }
  function vista(){ var h = hashPartes(); if (h.s) ev("vista", { s: h.s, p: h.p }); }
  function escuchar(){
    window.addEventListener("hashchange", vista);
    document.addEventListener("click", function(e){
      var a = e.target.closest && e.target.closest(".fin-bloque [data-igo]");
      if (a){ var bloques = [].slice.call(document.querySelectorAll(".fin-bloque")), b = a.closest(".fin-bloque");
        ev("caja_tema", { tema: temaActual(), bloque: bloques.indexOf(b), destino: a.dataset.igo }); return; }
      var c = e.target.closest && e.target.closest(".comm .comm-btn");
      if (c){ ev("conmutador", { a: c.dataset.comm }); return; }
      var g = e.target.closest && e.target.closest("#tabs .navgroup");
      if (g){ var secs = [].slice.call(document.querySelectorAll("#tabs .navsec")); ev("pestana", { n: secs.indexOf(g.closest(".navsec")) }); }
    }, true);   /* en captura: antes de que el enlace navegue y cambie el hash (si no, se pierde el tema) */
    document.addEventListener("toggle", function(e){ var d = e.target; if (d && d.matches && d.matches("details.fin-amp") && d.open) ev("ampliar", { tema: temaActual() }); }, true);
    setInterval(enviar, 30000);
    document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") enviar(); });
    window.addEventListener("pagehide", enviar);
  }

  /* ---------- la línea de la ficha de la materia (al final: no desplaza nada) ---------- */
  function linea(){
    var w = web(), sec = w && document.getElementById(w); if (!sec) return;
    var p = sec.querySelector(":scope > .uso-linea");
    if (!p){ p = document.createElement("p"); p.className = "uso-linea"; sec.appendChild(p); }
    var s = estado(), grupos = (CFG.grupos && CFG.grupos[w]) || [];
    var aviso = ' · <a href="#fuentes" class="uso-aviso-a">' + esc(TXT.queRegistra) + '</a>';
    if (!s.on){ p.innerHTML = '<span class="uso-l">' + esc(TXT.datos) + '</span> <button type="button" class="fbtn" data-uso="on">' + esc(TXT.compartir) + '</button>' + aviso; return; }
    p.innerHTML = esc(TXT.compartes) + ' <span class="uso-l">' + esc(TXT.grupo) + '</span> ' +
      grupos.concat([""]).map(function(g){ return '<button type="button" class="fbtn" data-uso-grupo="' + esc(g) + '" aria-pressed="' + (s.grupo === g) + '">' + esc(g || TXT.noDecir) + '</button>'; }).join(" ") +
      ' <button type="button" class="fbtn" data-uso="off">' + esc(TXT.dejar) + '</button>' + aviso;
  }
  document.addEventListener("click", function(e){
    if (!ACTIVO) return;
    var b = e.target.closest && e.target.closest("[data-uso], [data-uso-grupo]"); if (!b) return;
    var s = estado(), w = web(), grupos = (CFG.grupos && CFG.grupos[w]) || [];
    if (b.dataset.uso === "on") s = { on: true, grupo: "" };
    else if (b.dataset.uso === "off"){ s = { on: false, grupo: "" }; cola = []; guardar(COLA, []); }
    else if (b.hasAttribute("data-uso-grupo")){ var g = b.getAttribute("data-uso-grupo"); s.grupo = grupos.indexOf(g) >= 0 ? g : ""; }
    guardar(KEY, s); linea();
  });

  window.Uso = { ev: ev, activo: function(){ return ACTIVO && estado().on; } };
  if (!ACTIVO) return;
  /* el aviso de Fuentes solo se ve cuando el registro existe */
  function mostrarAviso(){ document.querySelectorAll(".uso-aviso").forEach(function(x){ x.hidden = false; }); }
  function arrancar(){ mostrarAviso(); linea(); escuchar(); vista(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})();
