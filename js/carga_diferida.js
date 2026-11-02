"use strict";
/* ===== (02-11, P-040, sesión 117) Textos largos bajo demanda =====
   En las webs del alumnado, tools/rendimiento_build.js parte los ficheros grandes en dos:
   un índice que se carga al arrancar (js/theory_indice.js: claves, títulos, materia, los <h2>…) y los
   textos largos, que llegan solo cuando hacen falta:
     · la teoría, un fichero por tema (js/theory_textos/<clave>.js): al abrir un tema baja solo el suyo;
     · las biografías, un fichero para todas (js/biografias_textos.js).
   El build deja la lista en window.DIFERIDOS = { theory: { dir: "js/theory_textos/" }, biografias: "js/biografias_textos.js" }.
   Se cargan insertando un <script> (nunca fetch: la web maestra se abre por file://).
   En la web maestra no hay DIFERIDOS: todo viene entero y cargarTextos() responde al momento.
   Uso: if (!textosListos("theory", k)) { cargarTextos("theory", k).then(() => loadTheory(k)); return; } */
(function(){
  var dif = function(){ return window.DIFERIDOS || {}; };
  var porClave = function(n){ return typeof dif()[n] === "object"; };
  var listos = {};     // "theory" o "theory|clave" -> true
  var pend = {};       // id -> Promise
  var llegados = [];   // [nombre, mapa] que llegaron antes que su índice (se aplican en DOMContentLoaded)
  var idDe = function(n, k){ return porClave(n) ? n + "|" + k : n; };
  var fichero = function(k){ return String(k).replace(/[^A-Za-z0-9_-]/g, "_"); };   // igual que tools/rendimiento_build.js
  var global = function(n){
    return { theory: typeof THEORY !== "undefined" ? THEORY : null,
             biografias: typeof BIOGRAFIAS !== "undefined" ? BIOGRAFIAS : null }[n];
  };
  function aplicar(n, mapa){
    var destino = global(n);
    if (!destino){ llegados.push([n, mapa]); return false; }
    Object.keys(mapa).forEach(function(k){
      if (destino[k]) Object.assign(destino[k], mapa[k]);
      listos[idDe(n, k)] = true;
    });
    if (!porClave(n)) listos[n] = true;
    try { document.dispatchEvent(new CustomEvent("textos-llegan", { detail: n })); } catch (e){}
    return true;
  }
  /* el fichero de textos llama a textosLlegan("theory", { clave: { html: "…" } }) */
  window.textosLlegan = function(n, mapa){ aplicar(n, mapa); };
  /* sin clave, en la teoría: todos los temas (lo usa el buscador) */
  window.textosListos = function(n, k){
    if (!dif()[n]) return true;
    if (!porClave(n)) return !!listos[n];
    if (k == null) { var T = global(n); return !!T && Object.keys(T).every(function(x){ return listos[idDe(n, x)]; }); }
    return !!listos[idDe(n, k)];
  };
  function pedir(id, src){
    if (pend[id]) return pend[id];
    pend[id] = new Promise(function(ok){
      var s = document.createElement("script");
      s.src = src;
      /* si llegó antes que su índice (petición al arrancar), se espera a que estén todos los scripts */
      s.onload = function(){ if (listos[id]) ok(); else document.addEventListener("DOMContentLoaded", function(){ ok(); }); };
      s.onerror = function(){ delete pend[id]; ok(); };   // sin red: la vista se pinta con lo que haya
      document.head.appendChild(s);
    });
    return pend[id];
  }
  window.cargarTextos = function(n, k){
    var d = dif()[n];
    if (!d || window.textosListos(n, k)) return Promise.resolve();
    if (!porClave(n)) return pedir(n, d);
    if (k == null){ var T = global(n); return Promise.all(Object.keys(T || {}).map(function(x){ return window.cargarTextos(n, x); })); }
    return pedir(idDe(n, k), d.dir + fichero(k) + ".js");
  };
  document.addEventListener("DOMContentLoaded", function(){
    var l = llegados; llegados = [];
    l.forEach(function(x){ aplicar(x[0], x[1]); });
  });

  /* Sección → textos que necesita (con el argumento de la dirección: «#teoria/hf-canon/2» → el tema hf-canon).
     Es la única tabla que hay que tocar si se difiere otro fichero; la usa también el enrutado (prepararSeccion al
     arrancar y al abrir cada sección). Las vistas, además, esperan a sus textos antes de pintar (loadTheory,
     loadBiografia), así que se llegue por donde se llegue no falla nada. */
  window.SECCION_TEXTOS = {
    teoria: function(arg){ return arg ? [["theory", String(arg).split(/[\/§]/)[0]]] : []; },
    biografias: function(){ return [["biografias"]]; }
  };
  window.prepararSeccion = function(id, arg){
    var f = window.SECCION_TEXTOS[id];
    return Promise.all((f ? f(arg) : []).map(function(p){ return window.cargarTextos(p[0], p[1]); }));
  };
  /* al arrancar: si la dirección ya lleva a una sección con textos, se piden ya, a la vez que el resto de scripts */
  (function(){
    var raw = (location.hash || "").replace(/^#/, ""), i = raw.indexOf("/");
    var id = i < 0 ? raw : raw.slice(0, i), arg = i < 0 ? null : raw.slice(i + 1);
    try { arg = arg && decodeURIComponent(arg); } catch (e){}
    if (id && Object.keys(dif()).length) window.prepararSeccion(id, arg);
  })();
  /* Vistas que se pintan al abrirlas por primera vez, no al cargar la página (Adagios, Diccionario, Galería, Leibniz):
     cada una pintaba al arrancar su lista entera aunque no se abriera, y el primer pintado del móvil esperaba a todas.
     La vista registra su primer pintado con pintarAlAbrir("adagios", f); f se ejecuta antes de mostrarla (show) o antes
     de su cargador (loadAdagios…, también si se llama sin show), así que se ve igual que antes, también por su dirección. */
  var alAbrir = {};
  window.pintarAlAbrir = function(id, f){ (alAbrir[id] = alAbrir[id] || []).push(f); };
  function pintarPendientes(id){
    var l = alAbrir[id]; if (!l) return;
    delete alAbrir[id];
    l.forEach(function(f){ try { f(); } catch (e){ console.error(e); } });
  }
  window.pintarVista = pintarPendientes;
  document.addEventListener("DOMContentLoaded", function(){
    var prev = window.show;
    if (typeof prev !== "function") return;
    window.show = function(id){ pintarPendientes(id); window.prepararSeccion(id); return prev.apply(this, arguments); };
    var L = window.VIEW_LOADERS || {};
    Object.keys(L).forEach(function(id){
      var name = L[id], orig = window[name];
      if (typeof orig !== "function") return;
      window[name] = function(){ pintarPendientes(id); return orig.apply(this, arguments); };
    });
  });

  /* Las letras del texto (--serif y --sans: Spectral e IBM Plex; en árabe, las Noto) se piden ya, al arrancar. Antes las
     pedía el navegador al pintar el primer texto con ellas; como el contenido llega después, la letra llegaba tarde y el
     texto se recolocaba al cambiar de la letra de reserva a la buena. Sin URL fijas: se piden por su nombre. */
  try {
    if (document.fonts && document.fonts.load){
      var cs = getComputedStyle(document.documentElement);
      ["--serif", "--sans"].forEach(function(v){
        var fam = (cs.getPropertyValue(v) || "").split(",")[0].trim();
        if (fam) ["400", "600", "700"].forEach(function(w){ document.fonts.load(w + " 1em " + fam, "Aaا").catch(function(){}); });
      });
    }
  } catch (e){}
  /* cuando la página ya está cargada, las biografías (un solo fichero) se descargan con prioridad baja (prefetch) sin
     ejecutarlas: al abrir la sección salen de la caché. La teoría no: es un fichero por tema y baja el que se abre. */
  window.addEventListener("load", function(){
    Object.keys(dif()).forEach(function(n){
      if (porClave(n) || window.textosListos(n)) return;
      var l = document.createElement("link"); l.rel = "prefetch"; l.as = "script"; l.href = dif()[n];
      document.head.appendChild(l);
    });
  });
})();
