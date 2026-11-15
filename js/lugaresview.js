"use strict";
/* ===== «Los lugares de…»: el itinerario vital de un pensador, dentro de su ficha de Biografías =====
   depende de: lugares.js (LUGARES: textos y paradas) y lugares_svg.js (LUGARES_SVG: el mapa, de tools/build_mapa.js).
   La usa biografiasview.js: lugaresDe(p) da el bloque de la ficha (o "" si ese pensador no tiene mapa) y
   lugaresActivar(caja) lo pone en marcha.
   En el mapa hay números y, para orientarse, los nombres de los estados de la época (L.fronteras es el año de las
   fronteras; cada estado lleva además su tono y su frontera trazada). Los nombres de las paradas, las fechas y lo que hizo en cada sitio van en la lista, en HTML, y se
   traducen como el resto. Tocar un número resalta su parada en la lista, la enseña bajo el mapa y marca el tramo por el que llegó a ella; tocar una parada
   resalta su número. Con el teclado: tabulador hasta el número o la parada, Intro o espacio.
   «Modo repaso»: esconde nombres y explicaciones; cada parada se descubre al tocarla. */
const LUG_T = { toca: "المس رقمًا على الخريطة أو محطة في القائمة.", repaso: "وضع المراجعة: إخفاء الأسماء",
  repasoToca: "وضع المراجعة: أيّ مكان يمثّله كل رقم؟ المسه للتحقق.", parada: "المحطة {n}", km: "{n} كم",
  mapa: "خريطة بالمحطات المرقّمة", credito: "السواحل والأنهار والحدود الحالية: Natural Earth.",
  fronteras: "حدود عام {n}",
  creditoEpoca: "السواحل والأنهار: Natural Earth (ملك عام). حدود عام {n} تقريبية: رُكّبت من المقاطعات الحالية في Natural Earth." };

function lugEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function lugDatos(id){
  const L = typeof LUGARES !== "undefined" && LUGARES && LUGARES[id], svg = typeof LUGARES_SVG !== "undefined" && LUGARES_SVG && LUGARES_SVG[id];
  return L && svg && (L.paradas || []).length ? { L, svg } : null;
}
/* lo que se lee de una parada: cabecera (lugar y fechas) y texto; «t» puede llevar <em> */
function lugCab(s){ return '<span class="lg-cab"><b class="lg-lugar">' + lugEsc(s.lugar) + '</b> <span class="lg-fechas">' + lugEsc(s.fechas) + '</span></span>'; }

function lugaresDe(p){
  const D = p && lugDatos(p.id);
  if (!D) return "";
  const L = D.L;
  return '<div class="bio-sec bio-lug" data-lug="' + lugEsc(p.id) + '">' +
    '<h3>' + lugEsc(L.titulo) + '</h3>' +
    (L.intro ? '<p class="lg-intro">' + lugEsc(L.intro) + '</p>' : '') +
    '<div class="lg-cuerpo">' +
      '<div class="lg-col">' +
        '<figure class="lg-mapa" role="group" aria-label="' + LUG_T.mapa + '">' + D.svg + '</figure>' +
        (L.notaFronteras ? '<p class="lg-nota lg-nota-fr">' + lugEsc(L.notaFronteras) + '</p>' : '') +
        '<div class="lg-ficha" aria-live="polite"></div>' +
      '</div>' +
      '<div class="lg-col">' +
        '<p class="lg-barra"><button type="button" class="fbtn lg-repaso" aria-pressed="false">' + LUG_T.repaso + '</button></p>' +
        '<ol class="lg-lista">' + L.paradas.map((s, i) =>
          '<li><button type="button" class="lg-p" data-n="' + (i + 1) + '" aria-pressed="false"><span class="lg-n" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="lg-txt">' + lugCab(s) + '<span class="lg-t">' + s.t + '</span></span></button></li>').join("") + '</ol>' +
      '</div>' +
    '</div>' +
    '<p class="lg-nota">' + (L.nota ? lugEsc(L.nota) + ' ' : '') + (L.fronteras ? LUG_T.creditoEpoca.replace("{n}", lugEsc(L.fronteras)) : LUG_T.credito) + '</p>' +
  '</div>';
}

function lugaresActivar(caja){
  if (!caja) return;
  caja.querySelectorAll(".bio-lug[data-lug]").forEach(sec => {
    const D = lugDatos(sec.dataset.lug); if (!D) return;
    const L = D.L, ficha = sec.querySelector(".lg-ficha"), btnRepaso = sec.querySelector(".lg-repaso");
    const tramos = [...sec.querySelectorAll(".lg-tramo[data-a]")], svg = sec.querySelector(".lg-svg");
    const marcas = [...sec.querySelectorAll(".lg-m[data-n]")], filas = [...sec.querySelectorAll(".lg-p[data-n]")];
    let sel = 0, repaso = false;
    // los rótulos del mapa (países, mar) y las barras de escala: el texto viene de los datos, ya traducido
    sec.querySelectorAll("[data-rot]").forEach(t => { const r = (L.rotulos || [])[+t.dataset.rot]; if (r) t.textContent = r.t; });
    sec.querySelectorAll("[data-anio]").forEach(t => { t.textContent = LUG_T.fronteras.replace("{n}", t.dataset.anio); });
    sec.querySelectorAll("[data-km]").forEach(t => { t.textContent = LUG_T.km.replace("{n}", t.dataset.km); });
    function pintar(){
      sec.classList.toggle("lg-repaso-on", repaso);
      btnRepaso.setAttribute("aria-pressed", repaso);
      // (15-11) el tramo por el que llegó a la parada elegida se resalta y los demás se atenúan: así se sigue el orden del viaje
      const hayTramo = tramos.some(t => +t.dataset.a === sel);
      if (svg) svg.classList.toggle("lg-con-tramo", hayTramo);
      tramos.forEach(t => t.classList.toggle("on", +t.dataset.a === sel));
      marcas.forEach(m => {
        const n = +m.dataset.n, on = n === sel, s = L.paradas[n - 1];
        m.classList.toggle("on", on); m.setAttribute("aria-pressed", on);
        m.setAttribute("aria-label", LUG_T.parada.replace("{n}", n) + (s && (!repaso || on) ? ": " + s.lugar : ""));
      });
      filas.forEach(f => {
        const on = +f.dataset.n === sel;
        f.setAttribute("aria-pressed", on); f.parentNode.classList.toggle("on", on);
        // en modo repaso, lo que no se ha tocado no se enseña ni se lee
        f.querySelectorAll(".lg-lugar, .lg-t").forEach(x => { if (repaso && !on) x.setAttribute("aria-hidden", "true"); else x.removeAttribute("aria-hidden"); });
        if (repaso && !on) f.setAttribute("aria-label", LUG_T.parada.replace("{n}", f.dataset.n)); else f.removeAttribute("aria-label");
      });
      const s = L.paradas[sel - 1];
      ficha.classList.toggle("vacia", !s);
      ficha.innerHTML = s ? '<span class="lg-n" aria-hidden="true">' + sel + '</span><span class="lg-txt">' + lugCab(s) + '<span class="lg-t">' + s.t + '</span></span>'
                          : '<span class="lg-pista">' + (repaso ? LUG_T.repasoToca : LUG_T.toca) + '</span>';
    }
    function elegir(n, desdeMapa){
      sel = n === sel ? 0 : n;
      pintar();
      // desde el mapa, en pantalla ancha (la lista al lado), se acerca la parada si no se ve; en el móvil basta la ficha de debajo
      if (sel && desdeMapa && window.matchMedia && window.matchMedia("(min-width: 760px)").matches){
        const f = filas[sel - 1]; if (f && f.scrollIntoView) f.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
    marcas.forEach(m => {
      m.setAttribute("tabindex", "0"); m.setAttribute("role", "button");
      m.addEventListener("click", () => elegir(+m.dataset.n, true));
      m.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); elegir(+m.dataset.n, true); } });
    });
    filas.forEach(f => f.addEventListener("click", () => elegir(+f.dataset.n, false)));
    btnRepaso.addEventListener("click", () => { repaso = !repaso; sel = 0; pintar(); });
    pintar();
  });
}
