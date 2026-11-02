"use strict";
/* ===== Guía «Cómo usar la web» (13-10-2026) =====
   Pinta la sección #guia con el contenido de guia.js (bloques comunes + los de esta materia) y sus capturas
   (media/guia/<materia>/). Se llega a ella desde el botón «?» de la cabecera (#helpbtn) y desde un enlace al pie
   de la ficha de la materia (nada encima de la lista de temas). Solo Bachillerato: si en este build no hay
   ficha de Historia de la Filosofía ni de Filosofía 1.º (p. ej. la web de ESO), retira el botón y la sección.
   En la web del profesor, con las dos materias, un selector cambia de una guía a otra. */
(function(){
  if (typeof GUIA === "undefined") return;
  var sec = document.getElementById("guia"), btn = document.getElementById("helpbtn");
  var SUBJ = ["hf", "fil"].filter(function(s){ return document.getElementById(s) && typeof SUBJECTS !== "undefined" && SUBJECTS[s]; });
  if (!sec || !SUBJ.length){ if (btn) btn.remove(); if (sec) sec.remove(); return; }
  var U = GUIA.ui, cur = SUBJ[0];
  var FL = document.documentElement.dir === "rtl" ? "←" : "→";   // en árabe (rtl) la flecha apunta al otro lado
  /* (02-11, la 116) ancho y alto de las capturas (iguales en castellano y en euskera): el navegador reserva su hueco
     antes de cargarlas y la página no salta. Si falta una, se pinta sin tamaño, como antes. */
  var TAM = { "01_ficha.webp": [1400, 1094], "05_tema.webp": [1400, 875], "06_para_seguir.webp": [1400, 875], "07_tarjetas.webp": [1400, 875],
    "08_cuestionarios.webp": [1400, 875], "09_buscador.webp": [1400, 875], "10_movil_menu.webp": [750, 1624], "11_imprescindibles.webp": [1400, 875],
    "fil/02_menu_estudiar.webp": [536, 566], "fil/03_menu_practicar.webp": [536, 488], "fil/04_menu_tercera.webp": [536, 332],
    "hf/02_menu_estudiar.webp": [536, 590], "hf/03_menu_practicar.webp": [536, 512], "hf/04_menu_tercera.webp": [536, 512] };
  function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function vale(b){ return !b.solo || b.solo === cur; }
  function vista(v){ return v === "MATERIA" ? cur : v; }
  function abre(v){ return v && document.getElementById(vista(v)) ? vista(v) : null; }   // solo si la vista existe en este build
  function bloque(b, i){
    var h = "";
    switch (b.type){
      case "h": return '<h2 class="guia-h" id="guia-' + i + '">' + b.x + '</h2>';
      case "p": return '<p>' + b.x + '</p>';
      case "tip": return '<div class="guia-tip">' + b.x + '</div>';
      case "warn": return '<div class="guia-warn">' + b.x + '</div>';
      case "img":
        /* (19-10) la web en euskera lleva sus propias capturas (media/guia/<materia>/eu/); las demás lenguas, las de castellano */
        var src = "media/guia/" + cur + "/" + ((document.documentElement.lang || "").slice(0, 2) === "eu" ? "eu/" : "") + b.src;
        return '<figure class="guia-fig' + (b.w ? " guia-" + b.w : "") + '"><a href="' + src + '" target="_blank" rel="noopener">' +
          '<img src="' + src + '"' + (function(t){ return t ? ' width="' + t[0] + '" height="' + t[1] + '"' : ""; })(TAM[cur + "/" + b.src] || TAM[b.src]) + ' alt="' + esc(b.cap) + '" loading="lazy"></a><figcaption>' + esc(b.cap) + '</figcaption></figure>';
      case "list":
        h = b.rows.filter(vale).map(function(r){
          var v = abre(r.view);
          return '<div class="guia-row"><div class="guia-n">' + (v ? '<button type="button" class="guia-go" data-gv="' + v + '">' + r.nombre + '</button>' : '<strong>' + r.nombre + '</strong>') +
            '</div><div class="guia-d">' + r.texto + '</div></div>';
        }).join("");
        return '<div class="guia-list">' + h + '</div>';
      case "steps":
        h = b.rows.filter(vale).map(function(r, i){
          var v = abre(r.view);
          // (02-11, la 116) el número del paso, en un elemento propio y no en li::before: con el ::before, axe no podía medir el contraste de «Abrir →»
          return '<li><b class="guia-pnum" aria-hidden="true">' + (i + 1) + '</b><strong>' + r.titulo + '</strong><span>' + r.texto + '</span>' +
            (v ? '<button type="button" class="guia-abrir" data-gv="' + v + '">' + U.abrir + ' ' + FL + '</button>' : '') + '</li>';
        }).join("");
        return '<ol class="guia-steps">' + h + '</ol>';
    }
    return "";
  }
  function render(){
    var bl = GUIA.bloques.map(function(b, i){ return vale(b) ? [b, i] : null; }).filter(Boolean);
    var idx = bl.filter(function(x){ return x[0].type === "h"; })
      .map(function(x){ return '<a href="#guia" data-gi="guia-' + x[1] + '">' + x[0].x + '</a>'; }).join("");
    var sel = SUBJ.length > 1 ? '<div class="fgroup guia-sel">' + SUBJ.map(function(s){
      return '<button type="button" class="fbtn" data-gs="' + s + '" aria-pressed="' + (s === cur) + '">' + U["materia_" + s] + '</button>'; }).join("") + '</div>' : "";
    var pdf = GUIA.pdf && GUIA.pdf[cur] ? '<p class="guia-pdf"><a class="btn" href="' + GUIA.pdf[cur] + '" download>' + U.pdf + ' ↓</a></p>' : "";
    sec.innerHTML = '<p class="eyebrow">' + U.eyebrow + '</p><h1 class="title">' + U.titulo + '</h1><p class="lead">' + U.lead + '</p>' + sel +
      '<nav class="guia-idx" aria-label="' + esc(U.indice) + '"><span class="flabel">' + U.indice + '</span>' + idx + '</nav>' + pdf +
      '<div class="guia-body">' + bl.map(function(x){ return bloque(x[0], x[1]); }).join("") + '</div>';
  }
  sec.addEventListener("click", function(e){
    var g = e.target.closest("[data-gv]");
    if (g){ (window.show || show)(g.getAttribute("data-gv")); return; }
    var s = e.target.closest("[data-gs]");
    if (s){ cur = s.getAttribute("data-gs"); render(); return; }
    var a = e.target.closest("[data-gi]");
    if (a){ e.preventDefault(); var t = document.getElementById(a.getAttribute("data-gi")); if (t) t.scrollIntoView({ behavior: A11y.motion(), block: "start" }); }
  });
  render();
  if (btn) btn.addEventListener("click", function(){ (window.show || show)("guia"); });
  /* enlace al pie de la ficha de cada materia (tras la lista de temas, «Explora la materia» y el itinerario PAU) */
  function pie(){
    SUBJ.forEach(function(s){
      var f = document.getElementById(s); if (!f || f.querySelector(".guia-pie")) return;
      var p = document.createElement("p"); p.className = "guia-pie";
      p.innerHTML = '<a href="#guia">' + U.pie + ' ' + FL + '</a>';
      p.firstChild.addEventListener("click", function(e){ e.preventDefault(); cur = s; render(); (window.show || show)("guia"); });
      f.appendChild(p);
    });
  }
  if (document.readyState === "complete") setTimeout(pie, 0); else window.addEventListener("load", function(){ setTimeout(pie, 0); });
})();
