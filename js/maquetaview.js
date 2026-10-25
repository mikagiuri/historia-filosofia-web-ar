"use strict";
/* ===== Maquetación de la teoría (25-10, piloto) =====
   Intercala en el texto el material de cada párrafo marcado en MAQUETA (js/maqueta.js): una figura a todo el ancho de la
   columna, entre ese párrafo y el siguiente, con su pie corto debajo. Igual en escritorio y en el móvil, siempre abierta
   (el profesor, 25-10: «intercalar el texto con imágenes, esquemas, etc. NO dividir espacios»). theoryview.js llama a
   Maqueta.aplicar(body) tras pintar el tema.
   Los párrafos se buscan por su marca data-bloque. Los builds solo conservan las marcas de los párrafos que están en MAQUETA
   (tools/build_subject.js, web_i18n/bloques_lib.js): así la maqueta llega a las webs del alumnado, también traducidas. */
(function (){
  const ROTULO = { img: "صورة", esquema: "خطاطة", mapa: "خريطة", crono: "جدول زمني" };
  const ABRIR = { esquema: "افتح الخطاطة", mapa: "افتح الخريطة", crono: "افتح الجدول الزمني" };
  const VISTA = { esquema: "esquemas", mapa: "mapas", crono: "cronogramas" };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function titulo(m){
    if (m.tipo === "esquema") { const e = (typeof ESQUEMAS !== "undefined" && ESQUEMAS[m.id]) || (typeof ESQUEMAS_FIL !== "undefined" && ESQUEMAS_FIL[m.id]); return e ? e.title : null; }
    if (m.tipo === "mapa") { const e = typeof MAPS !== "undefined" && MAPS[m.id]; return e ? e.title : null; }
    if (m.tipo === "crono") { const e = typeof CRONOGRAMAS !== "undefined" && CRONOGRAMAS.find(c => c.id === m.id); return e ? e.title : null; }
    return null;
  }
  // html de la figura; null si el material no está en esta web (no se pinta)
  function figura(m){
    if (m.tipo === "img") return '<img class="figimg mq-img" src="' + esc(m.src) + '" alt="' + esc(m.alt) + '" loading="lazy"><figcaption class="mq-pie">' + esc(m.pie) + "</figcaption>";
    const t = titulo(m); if (!t) return null;
    return '<a class="mq-puerta" href="#' + VISTA[m.tipo] + "/" + encodeURIComponent(m.id) + '"><span class="mq-tipo">' + ROTULO[m.tipo] + '</span><span class="mq-tit">' + esc(t) + '</span><span class="mq-ir">' + ABRIR[m.tipo] + ' →</span></a><figcaption class="mq-pie">' + esc(m.pie) + "</figcaption>";
  }
  function aplicar(body){
    if (typeof MAQUETA === "undefined" || !body) return;
    body.querySelectorAll("figure.mq").forEach(f => f.remove());   // se puede volver a aplicar sin duplicar
    let pendiente = false;
    body.querySelectorAll("[data-bloque]").forEach(p => {
      const m = MAQUETA[p.dataset.bloque]; if (!m || !ROTULO[m.tipo]) return;
      const html = figura(m);
      if (!html) { if (document.readyState !== "complete") pendiente = true; return; }
      const f = document.createElement("figure");
      f.className = "mq mq-" + m.tipo;
      f.innerHTML = html;
      p.parentNode.insertBefore(f, p.nextSibling);   // entre este párrafo y el siguiente
      const img = f.querySelector(".mq-img");
      if (img && typeof openLightbox === "function") img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });
    // el primer tema se pinta antes de que carguen esquemas.js, maps.js y cronogramas.js: sus puertas, al terminar la carga
    if (pendiente) window.addEventListener("load", () => aplicar(body), { once: true });
  }
  window.Maqueta = { aplicar };
})();
