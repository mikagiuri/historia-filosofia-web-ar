"use strict";
/* ===== «Los lugares de…»: el itinerario vital de un pensador, dentro de su ficha de Biografías =====
   depende de: lugares.js (LUGARES: textos y paradas) y lugares_svg.js (LUGARES_SVG: el mapa, de tools/build_mapa.js).
   La usa biografiasview.js: lugaresDe(p) da el bloque de la ficha (o "" si ese pensador no tiene mapa) y
   lugaresActivar(caja) lo pone en marcha.
   En el mapa hay números y, para orientarse, los nombres de los estados de la época (L.fronteras es el año de las
   fronteras; cada estado lleva además su tono y su frontera trazada). Los nombres de las paradas, las fechas y lo que hizo en cada sitio van en la lista, en HTML, y se
   traducen como el resto. Tocar un número resalta su parada en la lista, la enseña bajo el mapa y marca el tramo por el que llegó a ella; tocar una parada
   resalta su número. Con el teclado: tabulador hasta el número o la parada, Intro o espacio.
   «Modo repaso»: esconde nombres y explicaciones; cada parada se descubre al tocarla.
   Un año de fronteras negativo es antes de Cristo: el mapa dice «Hacia 387 a. C.», no «Fronteras de -387».
   Si el mapa trae «leyenda» (qué poder es cada color, qué son los puntos), va en HTML dentro del marco del mapa,
   debajo del dibujo, con muestras que usan las mismas clases que el mapa (mismo color de día y de noche). Una entrada
   con «trama» lleva además las rayas del mapa: usa su mismo <pattern> (lg-<id>-t<tono>), que está en el SVG de arriba.
   (15-11) Un mapa de varios pensadores (los presocráticos) dice en cada parada «biografia» (las claves de BIOGRAFIAS: el nombre del campo no se traduce): en la
   ficha de cada uno sale ese mismo mapa, con su ciudad ya elegida. Y lugaresEn(caja) pinta un mapa dentro de la
   teoría, donde el tema lleva <div class="lg-teoria" data-lug="clave"></div>.
   Con «grupos» (las escuelas presocráticas), encima del mapa va una fila de botones: «Todas» y uno por grupo. Al pulsar
   uno quedan a la vista solo sus ciudades (las demás se atenúan en el mapa y se ocultan en la lista), sale su frase y
   aparecen sus flechas de viaje (.lg-viaje del SVG). Cada escuela tiene su color (clases lg-s0…lg-s5): lo llevan los
   números del mapa, de la lista y de la línea del tiempo, y la muestra de su botón. Una ciudad de dos escuelas (Samos)
   lleva el de la primera, salvo con la otra pulsada. Si las paradas traen «anio», bajo el mapa va una línea del tiempo.
   En la teoría, los id del SVG llevan «-x» (lugaresDe con p.b): así no chocan con los del mismo mapa en la ficha. */
const LUG_T = { toca: "المس رقمًا على الخريطة أو محطة في القائمة.", repaso: "وضع المراجعة: إخفاء الأسماء",
  repasoToca: "وضع المراجعة: أيّ مكان يمثّله كل رقم؟ المسه للتحقق.", parada: "المحطة {n}", km: "{n} كم",
  mapa: "خريطة بالمحطات المرقّمة", credito: "السواحل والأنهار والحدود الحالية: Natural Earth.",
  fronteras: "حدود عام {n}",
  creditoEpoca: "السواحل والأنهار: Natural Earth (ملك عام). حدود عام {n} تقريبية: رُكّبت من المقاطعات الحالية في Natural Earth.",
  haciaAC: "نحو سنة {n} ق.م", leyenda: "مفتاح الخريطة", grupos: "المدارس", todas: "الكل", ac: "{n} ق.م", linea: "الخط الزمني",
  creditoSin: "السواحل والأنهار: Natural Earth (ملك عام).",
  creditoAC: "السواحل والأنهار: Natural Earth (ملك عام). حدود نحو سنة {n} ق.م تقريبية: رُكّبت من المقاطعات الحالية في Natural Earth ومن خطوط مرسومة باليد." };

function lugEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function lugDatos(id){
  const L = typeof LUGARES !== "undefined" && LUGARES && LUGARES[id], svg = typeof LUGARES_SVG !== "undefined" && LUGARES_SVG && LUGARES_SVG[id];
  return L && svg && (L.paradas || []).length ? { L, svg } : null;
}
/* lo que se lee de una parada: cabecera (lugar y fechas) y texto; «t» puede llevar <em> */
function lugCab(s){ return '<span class="lg-cab"><b class="lg-lugar">' + lugEsc(s.lugar) + '</b> <span class="lg-fechas">' + lugEsc(s.fechas) + '</span></span>'; }

/* la leyenda: una muestra por entrada, con las clases del mapa (lg-e4…) para que el color sea el mismo */
function lugLeyenda(L, id){
  if (!(L.leyenda || []).length) return "";
  return '<figcaption class="lg-leyenda"><ul aria-label="' + LUG_T.leyenda + '">' + L.leyenda.map(x =>
    '<li><svg class="lg-k" viewBox="0 0 14 14" aria-hidden="true" focusable="false">' +
      (x.ciudad ? '<circle class="lg-ciudad" cx="7" cy="7" r="3.6"/>' : '<rect class="lg-tierra' + (x.tono ? " lg-e" + (+x.tono) : "") + ' lg-k-m" x="1" y="1" width="12" height="12" rx="2.5"/>' +
        (x.trama ? '<rect class="lg-trama lg-k-m" fill="url(#lg-' + lugEsc(id) + '-t' + (+x.trama) + ')" x="1" y="1" width="12" height="12" rx="2.5"/>' : '')) +
    '</svg><span>' + lugEsc(x.t) + '</span></li>').join("") + '</ul></figcaption>';
}
/* el año de las fronteras, como se lee: «1880» o, antes de Cristo, «387» con su fórmula */
function lugAnio(anio, conAC, sinAC){ const n = +anio; return n < 0 ? conAC.replace("{n}", lugEsc(-n)) : sinAC.replace("{n}", lugEsc(anio)); }

/* (15-11) el mapa de varios pensadores en el que sale este (por «biografia» en sus paradas): su clave y las paradas que son suyas */
function lugGrupoDe(id){
  if (!id || typeof LUGARES === "undefined" || !LUGARES) return null;
  for (const k of Object.keys(LUGARES)){
    const ns = (LUGARES[k].paradas || []).map((s, i) => (s.biografia || []).includes(id) ? i + 1 : 0).filter(Boolean);
    if (ns.length) return { k, ns };
  }
  return null;
}

/* p: la ficha (p.id); o, desde la teoría, { id: clave del mapa, b: época (el color) } */
/* (15-11) los botones por escuela, si el mapa trae «grupos» («d» puede llevar <em>) */
function lugGrupos(L){
  if (!(L.grupos || []).length) return "";
  return '<div class="lg-grupos" role="group" aria-label="' + LUG_T.grupos + '">' +
    '<button type="button" class="fbtn lg-g" data-g="-1" aria-pressed="true">' + LUG_T.todas + '</button>' +
    L.grupos.map((g, i) => '<button type="button" class="fbtn lg-g lg-s' + i + '" data-g="' + i + '" aria-pressed="false"><i class="lg-sw" aria-hidden="true"></i>' + lugEsc(g.t) + '</button>').join("") +
    '</div><p class="lg-gdesc" aria-live="polite" hidden></p>';
}

/* la escuela de una parada: la primera que la lleva (-1: ninguna) */
function lugEscuela(L, n){ return (L.grupos || []).findIndex(g => (g.paradas || []).includes(n)); }

/* (15-11) la línea del tiempo (si las paradas traen «anio»): un número por parada, del color de su escuela, sobre un eje de
   siglos antes de Cristo; los que caen cerca se apilan. Es un dibujo de apoyo: la lista ya dice lo mismo (aria-hidden) */
function lugLinea(L){
  const ps = L.paradas.map((s, i) => ({ n: i + 1, a: s.anio })).filter(x => typeof x.a === "number");
  // (15-11) una parada que con cierto grupo cuenta otro año (Samos: Meliso, hacia el 440) lleva otra marca, solo para ese grupo
  L.paradas.forEach((s, i) => Object.entries(s.anioGrupo || {}).forEach(([g, a]) => ps.push({ n: i + 1, a: a, g: +g })));
  if (!(L.grupos || []).length || ps.length < 2) return "";
  const a0 = Math.floor(Math.min(...ps.map(x => x.a)) / 50) * 50, a1 = Math.ceil(Math.max(...ps.map(x => x.a)) / 50) * 50;
  const W = 400, x = a => 32 + (a - a0) / (a1 - a0 || 1) * (W - 64), filas = [];
  for (const q of ps.slice().sort((u, v) => u.a - v.a)){
    let f = filas.findIndex(ult => x(q.a) - ult >= 19); if (f < 0){ f = filas.length; filas.push(-1e9); }
    filas[f] = x(q.a); q.f = f;
  }
  const H = 16 + filas.length * 19 + 20, eje = H - 20;
  let sv = '<svg class="lg-linea" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false"><path class="lg-eje" d="M16 ' + eje + 'H' + (W - 16) + '"/>';
  for (let a = a0; a <= a1; a += 50) sv += '<path class="lg-eje" d="M' + x(a).toFixed(1) + ' ' + (eje - 3) + 'v6"/><text class="lg-tl-a" x="' + x(a).toFixed(1) + '" y="' + (eje + 16) + '" text-anchor="middle">' + LUG_T.ac.replace("{n}", -a) + '</text>';
  for (const q of ps){
    const cy = eje - 12 - q.f * 19, k = lugEscuela(L, q.n);
    sv += '<g class="lg-tl-p' + (k >= 0 ? " lg-con-s lg-s" + k : "") + '" data-n="' + q.n + '"' + (q.g != null ? ' data-g="' + q.g + '" visibility="hidden"' : '') + ' transform="translate(' + x(q.a).toFixed(1) + ' ' + cy + ')"><path class="lg-tl-v" d="M0 8V' + (eje - cy) + '"/><circle class="lg-c" r="8.5"/><text class="lg-num" y="3.4" text-anchor="middle">' + q.n + '</text></g>';
  }
  return '<figure class="lg-tl" role="group" aria-label="' + LUG_T.linea + '">' + sv + '</svg></figure>';
}

function lugaresDe(p){
  let id = p && p.id, sel = 0;
  if (id && !lugDatos(id)){ const g = lugGrupoDe(id); if (g){ id = g.k; sel = g.ns[0]; } }   // su ciudad, ya elegida
  const D = lugDatos(id);
  if (!D) return "";
  const L = D.L, idv = p.b ? id + "-x" : id;   // en la teoría, otros id: el mismo mapa puede estar también en una ficha
  const svg = p.b ? D.svg.replace(new RegExp('(id="|url\\(#|href="#)lg-' + id + '-', "g"), "$1lg-" + idv + "-") : D.svg;
  return '<div class="bio-sec bio-lug" data-lug="' + lugEsc(id) + '"' + (sel ? ' data-sel="' + sel + '"' : '') + (p.b ? ' data-b="' + lugEsc(p.b) + '"' : '') + '>' +
    '<h3>' + lugEsc(L.titulo) + '</h3>' +
    (L.intro ? '<p class="lg-intro">' + lugEsc(L.intro) + '</p>' : '') +
    '<div class="lg-cuerpo">' +
      '<div class="lg-col">' +
        lugGrupos(L) +
        '<figure class="lg-mapa" role="group" aria-label="' + LUG_T.mapa + '">' + svg + lugLeyenda(L, idv) + '</figure>' +
        lugLinea(L) +
        (L.notaFronteras ? '<p class="lg-nota lg-nota-fr">' + lugEsc(L.notaFronteras) + '</p>' : '') +
        '<div class="lg-ficha" aria-live="polite"></div>' +
      '</div>' +
      '<div class="lg-col">' +
        '<p class="lg-barra"><button type="button" class="fbtn lg-repaso" aria-pressed="false">' + LUG_T.repaso + '</button></p>' +
        '<ol class="lg-lista">' + L.paradas.map((s, i) =>
          '<li><button type="button" class="lg-p" data-n="' + (i + 1) + '" aria-pressed="false"><span class="lg-n' + (lugEscuela(L, i + 1) >= 0 ? " lg-con-s lg-s" + lugEscuela(L, i + 1) : "") + '" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span class="lg-txt">' + lugCab(s) + '<span class="lg-t">' + s.t + '</span></span></button></li>').join("") + '</ol>' +
      '</div>' +
    '</div>' +
    '<p class="lg-nota">' + (L.nota ? lugEsc(L.nota) + ' ' : '') + (L.fronteras ? lugAnio(L.fronteras, LUG_T.creditoAC, LUG_T.creditoEpoca) : L.sinFronteras ? LUG_T.creditoSin : LUG_T.credito) + '</p>' +
  '</div>';
}

function lugaresActivar(caja){
  if (!caja) return;
  caja.querySelectorAll(".bio-lug[data-lug]").forEach(sec => {
    const D = lugDatos(sec.dataset.lug); if (!D) return;
    const L = D.L, ficha = sec.querySelector(".lg-ficha"), btnRepaso = sec.querySelector(".lg-repaso");
    const tramos = [...sec.querySelectorAll(".lg-tramo[data-a]")], svg = sec.querySelector(".lg-svg");
    const marcas = [...sec.querySelectorAll(".lg-m[data-n]")], filas = [...sec.querySelectorAll(".lg-p[data-n]")];
    let sel = +sec.dataset.sel || 0, repaso = false, grp = -1;   // sel: en la ficha de un pensador de un mapa de varios, su ciudad; grp: la escuela pulsada (-1: todas)
    const botonesG = [...sec.querySelectorAll(".lg-g[data-g]")], gdesc = sec.querySelector(".lg-gdesc");
    const puntosTL = [...sec.querySelectorAll(".lg-tl-p[data-n]")], viajesG = [...sec.querySelectorAll(".lg-viaje[data-g]")];
    const enGrupo = n => grp < 0 || ((L.grupos || [])[grp] || { paradas: [] }).paradas.includes(n);   // ¿la parada n es de la escuela pulsada? (sin escuela pulsada, todas)
    // los rótulos del mapa (países, mar) y las barras de escala: el texto viene de los datos, ya traducido
    sec.querySelectorAll("[data-rot]").forEach(t => {
      const r = (L.rotulos || [])[+t.dataset.rot]; if (!r) return;
      const txt = String(r.t), cortes = [];   // dónde puede partirse: en un espacio (que se quita) o tras un guion (que se queda)
      for (let i = 1; i < txt.length - 1; i++){ if (txt[i] === " ") cortes.push([i, i + 1]); else if (txt[i] === "-") cortes.push([i + 1, i + 1]); }
      if (!r.partir || !cortes.length){ t.textContent = txt; return; }
      // un nombre largo, en dos líneas: se parte por donde quedan más iguales
      let c = cortes[0];
      for (const x of cortes) if (Math.abs(x[0] - (txt.length - x[1])) < Math.abs(c[0] - (txt.length - c[1]))) c = x;
      t.textContent = "";
      [txt.slice(0, c[0]), txt.slice(c[1])].forEach((txt, i) => {
        const ts = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        ts.setAttribute("x", t.getAttribute("x")); if (i) ts.setAttribute("dy", "1.15em"); ts.textContent = txt; t.appendChild(ts);
      });
    });
    sec.querySelectorAll("[data-anio]").forEach(t => { t.textContent = +t.dataset.anio < 0 ? LUG_T.haciaAC.replace("{n}", -t.dataset.anio) : LUG_T.fronteras.replace("{n}", t.dataset.anio); });
    sec.querySelectorAll("[data-km]").forEach(t => { t.textContent = LUG_T.km.replace("{n}", t.dataset.km); });
    function pintar(){
      sec.classList.toggle("lg-repaso-on", repaso);
      btnRepaso.setAttribute("aria-pressed", repaso);
      // (15-11) el tramo por el que llegó a la parada elegida se resalta y los demás se atenúan: así se sigue el orden del viaje
      const hayTramo = tramos.some(t => +t.dataset.a === sel);
      if (svg) svg.classList.toggle("lg-con-tramo", hayTramo);
      tramos.forEach(t => t.classList.toggle("on", +t.dataset.a === sel));
      // (15-11) la escuela elegida: sus ciudades a la vista; las demás, atenuadas en el mapa y fuera de la lista
      botonesG.forEach(b => b.setAttribute("aria-pressed", +b.dataset.g === grp));
      if (gdesc){ const g = (L.grupos || [])[grp]; gdesc.hidden = !g; gdesc.innerHTML = g ? '<b>' + lugEsc(g.t) + '.</b> ' + g.d : ""; }
      marcas.forEach(m => m.classList.toggle("lg-otra", !enGrupo(+m.dataset.n)));
      // el color de cada número: el de su escuela o, si está en la pulsada, el de esta (Samos: pitagóricos o eléatas)
      if ((L.grupos || []).length){
        const color = (el, n) => { const k = grp >= 0 && enGrupo(n) ? grp : lugEscuela(L, n);
          el.classList.remove("lg-s0", "lg-s1", "lg-s2", "lg-s3", "lg-s4", "lg-s5", "lg-s6", "lg-s7"); el.classList.toggle("lg-con-s", k >= 0); if (k >= 0) el.classList.add("lg-s" + k); };
        marcas.forEach(m => color(m, +m.dataset.n));
        filas.forEach(f => { const n = f.querySelector(".lg-n"); if (n) color(n, +f.dataset.n); });
        puntosTL.forEach(t => {
          color(t, +t.dataset.n); t.classList.toggle("lg-otra", !enGrupo(+t.dataset.n)); t.classList.toggle("on", +t.dataset.n === sel);
          // la marca de otro año (anioGrupo) sale solo con su grupo, y entonces la de siempre se esconde
          const otro = ((L.paradas[+t.dataset.n - 1] || {}).anioGrupo || {})[grp] != null;
          t.setAttribute("visibility", t.dataset.g != null ? (+t.dataset.g === grp ? "visible" : "hidden") : (otro ? "hidden" : "visible"));
        });
        viajesG.forEach(v => v.classList.toggle("on", +v.dataset.g === grp));
      }
      filas.forEach(f => { f.parentNode.hidden = !enGrupo(+f.dataset.n); });
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
      const ks = s ? (grp >= 0 && enGrupo(sel) ? grp : lugEscuela(L, sel)) : -1;
      ficha.innerHTML = s ? '<span class="lg-n' + (ks >= 0 && (L.grupos || []).length ? " lg-con-s lg-s" + ks : "") + '" aria-hidden="true">' + sel + '</span><span class="lg-txt">' + lugCab(s) + '<span class="lg-t">' + s.t + '</span></span>'
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
    puntosTL.forEach(t => t.addEventListener("click", () => elegir(+t.dataset.n, false)));   // la línea del tiempo, también
    btnRepaso.addEventListener("click", () => { repaso = !repaso; sel = 0; pintar(); });
    botonesG.forEach(b => b.addEventListener("click", () => { grp = +b.dataset.g; if (sel && !enGrupo(sel)) sel = 0; pintar(); }));
    pintar();
  });
}

/* (15-11) un mapa dentro de la teoría: el tema lleva <div class="lg-teoria" data-lug="clave"></div> donde va. Se pinta
   igual que en la ficha (lugaresDe) y con el color de la época del mapa (data-b del hueco; si no, la Antigüedad) */
function lugaresEn(caja){
  if (!caja) return;
  caja.querySelectorAll(".lg-teoria[data-lug]").forEach(h => {
    const html = lugaresDe({ id: h.dataset.lug, b: h.dataset.b || "ant" });
    if (!html){ h.remove(); return; }
    h.classList.add("lg-fuera");
    h.innerHTML = html;
  });
  lugaresActivar(caja);
}
