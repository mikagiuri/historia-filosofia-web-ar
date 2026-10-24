/* diccionario_enlinea.js — DUA, Ola 1 (ficha D1.3): el Diccionario dentro del texto.
 *
 * Decisión del profesor del 24-10 (docs/36, P3): activado de serie. Los términos del
 * Diccionario de ESE tema llevan un subrayado punteado discreto en su primera aparición
 * por apartado, solo en párrafos y listas (no en títulos, citas, tablas, figuras ni
 * Pilares). Al tocarlos, con el teclado o al pasar el ratón sale la definición, la raíz
 * plegada y «Ver ficha» (#diccionario/<id>). El panel «Aa» lo apaga (clave «dicc»).
 *
 * WCAG 1.4.13: la ventanita se puede cerrar sin mover el puntero (Esc), se puede pasar el
 * ratón por encima sin que desaparezca y no se va sola mientras el puntero o el foco
 * siguen en ella o en su término.
 *
 * Qué NO hace. No toca los datos (theory.js, diccionario.js): trabaja sobre el DOM ya
 * pintado. Sin el interruptor, la teoría queda como antes, letra a letra.
 *
 * Búsqueda. es, fr y en: la palabra entera, con plural en -s/-es. eu: por raíz (el
 * euskera declina: «kausa», «kausaren», «kausak»), con la -a final fuera y hasta 6 letras
 * de sufijo. ar: con el artículo ال y las partículas و ف ب ل ك delante. Los falsos
 * positivos de un tema se quitan con EXCLUIR («<materia>-<tema>»: [ids]).
 */
(function () {
  "use strict";

  var EXCLUIR = {};
  var FUERA = "h1, h2, h3, h4, h5, h6, blockquote, table, figure, figcaption, summary, a, button, code, pre, " +
    ".theory-head, .related-row, .th-partnav, .pilares, .itin, .itin-fin, .no-dicc, .cl-quote, .cl-cita, .cl-def, .cl-reveal, .cl-repaso, .cl-hoja, [lang='grc']";
  var html = document.documentElement;
  var lengua = (html.lang || "es").slice(0, 2);
  var L = "\\p{L}\\p{M}";

  function activo() { return !html.hasAttribute("data-a11y-sindicc"); }
  function listo() { return typeof DICCIONARIO !== "undefined" && window.Itinerario && window.Itinerario.gloTema; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function it(s) { return s.replace(/\*([^*]+)\*/g, "<i>$1</i>"); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* Formas que se buscan de un término: «Idea / Forma (Platón)» → «Idea», «Forma». */
  function variantes(t) {
    return String(t).replace(/<[^>]+>/g, "").replace(/\s*\([^)]*\)/g, "").split(/\s+\/\s+|\s*;\s*/)
      .map(function (v) { return v.replace(/[«»"“”.:]/g, "").trim(); })
      .filter(function (v) { return v.length >= 3; });
  }
  function patron(v) {
    var p = reEsc(v).replace(/\s+/g, "\\s+");
    if (lengua === "eu") {
      var base = v.length > 4 && /a$/i.test(v) ? p.slice(0, -1) : p;
      return base + "[" + L + "]{0,6}";
    }
    if (lengua === "ar") {
      var sin = p.replace(/^ال/, "");
      return "(?:[وفبلك]?ال|[وفبلك])?" + sin + "(?:[ةاتهي]{0,2})";
    }
    return p + "(?:e?s)?";
  }

  function terminos(subject, tema) {
    var fuera = EXCLUIR[subject + "-" + tema] || [];
    return DICCIONARIO.filter(function (g) {
      return g && g.id && g.subject === subject && g.t && g.def && fuera.indexOf(g.id) < 0 && Itinerario.gloTema(g) === tema;
    }).map(function (g) {
      var pats = variantes(g.t).map(patron);
      return pats.length ? { g: g, src: pats.join("|"), re: new RegExp("^(?:" + pats.join("|") + ")$", "iu") } : null;
    }).filter(Boolean).sort(function (a, b) { return b.src.length - a.src.length; });
  }

  function combinado(lista) {
    if (!lista.length) return null;
    return new RegExp("(^|[^" + L + "])(" + lista.map(function (x) { return x.src; }).join("|") + ")(?![" + L + "])", "giu");
  }

  /* Recorre los <p> و <li> del tema en orden; cada <h2> abre un apartado nuevo. El tema puede
     llegar como función: se resuelve cuando ya han cargado diccionario.js e itinerario.js. */
  var gen = 0;
  function marcar(body, subject, tema) {
    if (!body) return;
    var yo = body.dataset.diccGen = String(++gen);
    if (!listo()) {
      document.addEventListener("DOMContentLoaded", function () { if (body.dataset.diccGen === yo) marcar(body, subject, tema); }, { once: true });
      return;
    }
    if (typeof tema === "function") tema = tema();
    body.dataset.diccSub = subject || ""; body.dataset.diccTema = tema == null ? "" : String(tema);
    if (!activo() || !subject || tema == null) return;
    var todos = terminos(subject, tema);
    if (!todos.length) return;
    var vistos = {}, re = combinado(todos);
    var els = body.querySelectorAll("h2, .th-part, p, li");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === "H2" || el.classList.contains("th-part")) { vistos = {}; re = combinado(todos); continue; }
      if (!re || el.closest(FUERA) || (el.tagName === "LI" && el.querySelector("p"))) continue;
      re = marcarEn(el, todos, vistos, re);
    }
  }

  function marcarEn(el, todos, vistos, re) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement.closest(FUERA) || n.parentElement.closest("p, li") !== el ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var nodos = []; for (var n = w.nextNode(); n; n = w.nextNode()) nodos.push(n);
    for (var k = 0; k < nodos.length && re; k++) {
      var nodo = nodos[k];
      for (;;) {
        re.lastIndex = 0;
        var m = re.exec(nodo.nodeValue);
        if (!m) break;
        var palabra = m[2], x = null;
        for (var j = 0; j < todos.length; j++) if (!vistos[todos[j].g.id] && todos[j].re.test(palabra)) { x = todos[j]; break; }
        if (!x) break;
        /* En cursiva solo cuenta si el término es toda la cursiva: «arché» sí, «Crítica de la razón pura» (un título) no. */
        var cur = nodo.parentElement.closest("em, i, cite");
        if (cur && el.contains(cur) && cur.textContent.trim().toLowerCase() !== palabra.toLowerCase()) {
          nodo = nodo.splitText(m.index + m[0].length);
          continue;
        }
        vistos[x.g.id] = true;
        var ini = m.index + m[1].length, resto = nodo.splitText(ini);
        nodo = resto.splitText(palabra.length);
        var b = document.createElement("button");
        b.type = "button"; b.className = "dicc-term"; b.textContent = palabra;
        b.dataset.g = x.g.id; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-haspopup", "dialog");
        resto.parentNode.replaceChild(b, resto);
        re = combinado(todos.filter(function (y) { return !vistos[y.g.id]; }));
        if (!re) break;
      }
    }
    return re;
  }

  function quitar(body) {
    cerrar(false);
    (body || document).querySelectorAll("button.dicc-term").forEach(function (b) {
      var p = b.parentNode; p.replaceChild(document.createTextNode(b.textContent), b); p.normalize();
    });
  }

  /* ---- la ventanita: una sola, colgada de <body>, fija junto al término ---- */
  var pop = null, actual = null, fijo = false, tCerrar = 0, tAbrir = 0;
  function crearPop() {
    pop = document.createElement("div");
    pop.className = "dicc-pop"; pop.id = "diccpop"; pop.setAttribute("role", "dialog"); pop.hidden = true;
    document.body.appendChild(pop);
    pop.addEventListener("mouseenter", function () { clearTimeout(tCerrar); });
    pop.addEventListener("mouseleave", function () { if (!fijo) tCerrar = setTimeout(function () { cerrar(false); }, 350); });
    pop.addEventListener("click", function (e) {
      if (e.target.closest(".dicc-x")) { cerrar(true); return; }
      var r = e.target.closest(".dicc-raiz");
      if (r) { var d = pop.querySelector(".dicc-et"); d.hidden = !d.hidden; r.setAttribute("aria-expanded", String(!d.hidden)); return; }
      if (e.target.closest(".dicc-ver")) cerrar(false);
    });
  }
  function porId(id) { for (var i = 0; i < DICCIONARIO.length; i++) if (DICCIONARIO[i].id === id) return DICCIONARIO[i]; return null; }
  function abrir(b, conFoco) {
    var g = porId(b.dataset.g); if (!g) return;
    if (!pop) crearPop();
    if (actual && actual !== b) actual.setAttribute("aria-expanded", "false");
    actual = b;
    pop.setAttribute("aria-label", g.t);
    pop.innerHTML = '<button type="button" class="dicc-x" aria-label="إغلاق" title="إغلاق">×</button>' +
      '<p class="dicc-t">' + esc(g.t) + '</p><p class="dicc-def">' + it(esc(g.def)) + '</p>' +
      (g.et ? '<button type="button" class="dicc-raiz" aria-expanded="false">λ ' + "اعرفوا من أين جاءت الكلمة" + '</button>' +
        '<p class="dicc-et" hidden><b>' + "الجذر:" + '</b> ' + it(esc(g.et)) + '</p>' : "") +
      '<a class="dicc-ver" href="#diccionario/' + esc(g.id) + '">' + "عرض البطاقة" + ' ›</a>';
    pop.hidden = false;
    b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-controls", "diccpop");
    colocar();
    if (conFoco) pop.querySelector(".dicc-x").focus();
  }
  function colocar() {
    if (!pop || pop.hidden || !actual) return;
    var r = actual.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
    pop.style.width = w + "px";
    var rtl = getComputedStyle(actual).direction === "rtl";   // en árabe, alineada por la derecha del término
    var x = Math.max(12, Math.min(rtl ? r.right - w : r.left, window.innerWidth - w - 12));
    var abajo = r.bottom + 8, alto = pop.offsetHeight;
    var y = abajo + alto > window.innerHeight - 8 && r.top - alto - 8 > 8 ? r.top - alto - 8 : abajo;
    y = Math.max(8, Math.min(y, window.innerHeight - alto - 8));   // siempre dentro de la pantalla
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  function cerrar(devolverFoco) {
    clearTimeout(tCerrar); clearTimeout(tAbrir);
    if (!pop || pop.hidden) return;
    pop.hidden = true; fijo = false;
    if (actual) { actual.setAttribute("aria-expanded", "false"); if (devolverFoco) actual.focus(); }
    actual = null;
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button.dicc-term");
    if (b) {
      if (actual === b && fijo) { cerrar(false); return; }
      fijo = true; abrir(b, e.detail === 0);   // detail 0 = teclado (Intro o espacio): el foco pasa a la ventanita
      return;
    }
    if (pop && !pop.hidden && !pop.contains(e.target)) cerrar(false);
  });
  document.addEventListener("mouseover", function (e) {
    var b = e.target.closest && e.target.closest("button.dicc-term");
    if (!b || fijo) return;
    clearTimeout(tCerrar); clearTimeout(tAbrir);
    if (actual !== b) tAbrir = setTimeout(function () { abrir(b, false); }, 250);
  });
  document.addEventListener("mouseout", function (e) {
    var b = e.target.closest && e.target.closest("button.dicc-term");
    if (!b) return;
    clearTimeout(tAbrir);
    if (!fijo && actual === b) tCerrar = setTimeout(function () { cerrar(false); }, 350);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pop && !pop.hidden) { e.stopPropagation(); cerrar(true); }
  }, true);
  document.addEventListener("focusin", function (e) {
    if (pop && !pop.hidden && fijo && !pop.contains(e.target) && e.target !== actual) cerrar(false);
  });
  window.addEventListener("resize", colocar);
  window.addEventListener("scroll", colocar, { passive: true });
  window.addEventListener("hashchange", function () { cerrar(false); });

  /* El interruptor del panel «Aa»: quita o vuelve a poner las marcas del tema abierto. */
  document.addEventListener("a11y:cambio", function () {
    var bodies = document.querySelectorAll("[data-dicc-sub]");
    bodies.forEach(function (body) {
      quitar(body);
      if (activo()) marcar(body, body.dataset.diccSub, isNaN(+body.dataset.diccTema) || body.dataset.diccTema === "" ? body.dataset.diccTema || null : +body.dataset.diccTema);
    });
  });

  window.DiccEnLinea = { marcar: marcar, quitar: quitar, EXCLUIR: EXCLUIR };
})();
