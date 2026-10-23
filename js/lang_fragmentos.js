/* lang_fragmentos.js — DUA, Ola 0 (ficha D0.6): marca el griego con lang="grc".
 *
 * Para qué. El lector de pantalla y, más adelante, «Escuchar» (Ola 1) necesitan
 * saber que un tramo está en griego: sin lang lo deletrean como si fuera la lengua
 * de la página. Esta función recorre los nodos de texto ya pintados y envuelve
 * cada tramo en alfabeto griego en <span lang="grc">.
 *
 * Qué NO hace. No toca los datos (theory.js, glosario.js, adagios.js): trabaja
 * sobre el DOM ya pintado, en tiempo de carga. No cambia el aspecto ni el texto;
 * el atributo lang no pinta nada. El griego es LTR por el algoritmo bidi de
 * Unicode, así que dentro del árabe (dir="rtl") sigue saliendo de izquierda a
 * derecha sin necesidad de dir="ltr" (que, al aislar el tramo, sí podría mover
 * la puntuación de alrededor). La transliteración en cursiva que va al lado
 * (regla 5.24) es alfabeto latino, así que queda intacta, en la lengua de la página.
 *
 * El latín no se autodetecta (se confunde con la lengua de la página): se marca a
 * mano donde lo pida el profesor; Adagios ya lo hace (adagiosview.js, lang="la").
 */
(function () {
  "use strict";

  /* Un carácter griego "de letra": griego y copto (0370–03FF) y griego extendido
     (1F00–1FFF, el politónico). Basta uno para que valga la pena recorrer el nodo. */
  var CORE = /[Ͱ-Ͽἀ-῿]/;

  /* Un tramo que se envuelve. Empieza SIEMPRE por un carácter griego de letra,
     al que pueden seguir más letras griegas y marcas diacríticas combinantes
     (0300–036F) —nunca sueltas, siempre tras una letra griega, para no separar
     un acento de su vocal—. Varias palabras griegas se unen en un solo tramo solo
     cuando entre ellas va un separador (espacio, guion, apóstrofo, punto alto
     griego) seguido de más griego: así nunca queda un separador al final del tramo. */
  var G = "[\\u0370-\\u03FF\\u1F00-\\u1FFF]";
  var GX = "[\\u0370-\\u03FF\\u1F00-\\u1FFF\\u0300-\\u036F]";
  var SEP = "[ \\u00A0'’ʼ\\-\\u00B7\\u0387]";
  var TRAMO = new RegExp(G + GX + "*(?:" + SEP + "+" + G + GX + "*)*", "g");

  /* No se entra en estos subárboles: código, campos de formulario y las fórmulas
     de lógica (que usan φ, ψ… como variables, no como griego que leer), y nada que
     ya lleve lang="grc"/"la" (Adagios, o una pasada anterior). */
  function saltar(nodo) {
    var p = nodo.parentElement;
    return !p || p.closest('script,style,textarea,.formula,[lang="grc"],[lang="la"]');
  }

  function marcarNodo(nodo) {
    var texto = nodo.nodeValue;
    if (!CORE.test(texto)) return;
    var frag = document.createDocumentFragment();
    var ultimo = 0, m;
    TRAMO.lastIndex = 0;
    while ((m = TRAMO.exec(texto))) {
      if (!m[0]) { TRAMO.lastIndex++; continue; }
      if (m.index > ultimo) frag.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      var span = document.createElement("span");
      span.lang = "grc";
      span.textContent = m[0];
      frag.appendChild(span);
      ultimo = m.index + m[0].length;
    }
    if (!frag.childNodes.length) return;            /* por si solo había diacríticos sueltos */
    if (ultimo < texto.length) frag.appendChild(document.createTextNode(texto.slice(ultimo)));
    nodo.parentNode.replaceChild(frag, nodo);
  }

  /* Marca el griego dentro de un elemento (la vista recién pintada). Recoge primero
     todos los nodos de texto y luego los procesa, para no recorrer lo que vamos
     insertando. Tolera la ausencia de raíz: así los enganches son una línea segura. */
  function marcarGriego(raiz) {
    if (!raiz || !raiz.nodeType) return;
    var tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!CORE.test(n.nodeValue) || saltar(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodos = [], n;
    while ((n = tw.nextNode())) nodos.push(n);
    nodos.forEach(marcarNodo);
  }

  window.langFragGrc = marcarGriego;
})();
