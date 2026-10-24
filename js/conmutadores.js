"use strict";
/* ===== Conmutadores (13-10-2026, F1) =====
   Filas de botones que reúnen VARIAS vistas del mismo tipo en UNA entrada del menú.
   El menú (tools/build_subject.js) deja una sola entrada por grupo (la vista «entrada»);
   aquí se inyecta, en cada vista del grupo, una fila de botones (.fgroup .comm) que
   cambia de vista con show() y marca el modo activo (aria-pressed), sin fusionar las
   secciones: cada una conserva su <section>, su cargador y su hash (#retos, #cronogramas…).

   Grupos F1:
     cuestionarios  →  Cuestionarios ⇄ Retos   (cuestionarios / retos)
     debatir        →  Dilemas · Polémicas · Duelo · Nudos   (dilemas / polemicas / duelo / nudos)
     epocas         →  Fichas · Cronogramas · Genealogías   (epocas / cronogramas / genealogias)
     biografias     →  Todos · Perseguidos · Comunidades   (biografias / perseguidos / comunidades)
     talleres       →  Taller de Leibniz · El universo aristotélico · El arte de la palabra · Los afectos de Spinoza   (leibniz / universo / palabra / afectos; 19-10, 20-10)
     mapas          →  Mapas conceptuales ⇄ Infografías ⇄ Mi mapa   (mapas / infografias / mimapa; 23-10: el botón «Mapas e infografías» ya no abre solo Mapas; 24-10: «Mi mapa», DUA D3.2, solo FIL y HF)

   Integración con el resto (sin tocar esos ficheros más que lo justo):
   - app.js (show) usa commuteEntry(id) para marcar en el menú la ENTRADA del grupo
     cuando se está en cualquiera de sus vistas (p. ej. #retos marca «Cuestionarios»).
   - itinerario.js (crumbs) usa commuteLabel(id) para añadir el modo a la miga de pan.
   - §0.6: si en este build solo queda UNA vista del grupo (p. ej. «Épocas» en 1.º, sin
     cronogramas ni genealogías), el conmutador NO se inyecta.
   Los rótulos van en castellano y se traducen con el diccionario web_i18n/ui/<lang>.json. */

/* tabla de grupos: { entry: vista que abre el menú, modos: [[vista, rótulo], …] } */
const CONMUTADORES = [
  { entry: "cuestionarios", modos: [["cuestionarios", "اختبارات"], ["retos", "تحديات"]] },
  { entry: "dilemas",      modos: [["dilemas", "معضلات"], ["polemicas", "سجالات"], ["duelo", "مبارزة"], ["nudos", "عُقَد"]] },
  { entry: "epocas",       modos: [["epocas", "بطاقات"], ["cronogramas", "الجداول الزمنية"], ["genealogias", "الأنساب الفكرية"]] },
  { entry: "biografias",     modos: [["biografias", "الكل"], ["perseguidos", "المضطهَدون"], ["comunidades", "الجماعات"]] },
  { entry: "leibniz",      modos: [["leibniz", "ورشة لايبنتز"], ["universo", "الكون الأرسطي"], ["palabra", "فنّ الكلام"], ["afectos", "الانفعالات عند اسبينوزا"], ["hegel", "ورشة هيغل"]] },   // (22-10) + hegel (solo HF); (20-10) + afectos; (19-10) «Talleres»: unidades transversales
  { entry: "mapas",        modos: [["mapas", "خرائط المفاهيم"], ["infografias", "إنفوغرافيك"], ["mimapa", "خريطتي"]] }   // (23-10) el botón «Mapas e infografías» cumple su rótulo: Infografías no tenía puerta de menú; el conmutador la saca (ambas secciones ya están en el build de fil y hf)
];

/* índices vista → { entrada, rótulo, grupo } */
const COMM_ENTRY = {}, COMM_LABEL = {}, COMM_GROUP = {};
CONMUTADORES.forEach(function (g){
  g.modos.forEach(function (m){
    COMM_ENTRY[m[0]] = g.entry;
    COMM_LABEL[m[0]] = m[1];
    COMM_GROUP[m[0]] = g;
  });
});

/* vista → vista de entrada de su grupo (para marcar el menú); si no es de un conmutador, se devuelve igual */
/* (18-10) si la vista tiene su propia entrada en el menú (Cronogramas, en «Historia» desde el 18-10), se marca esa */
function commuteEntry(id){
  var tabs = document.getElementById("tabs");
  if (tabs && id && tabs.querySelector('button[data-view="' + id + '"]')) return id;
  return COMM_ENTRY[id] || id;
}
/* vista → rótulo del modo (para la miga de pan); "" si no es modo de un conmutador */
function commuteLabel(id){ return COMM_LABEL[id] || ""; }

function commEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* inyecta el conmutador en cada vista presente de cada grupo */
function commInject(){
  CONMUTADORES.forEach(function (g){
    const vivos = g.modos.filter(function (m){ return document.getElementById(m[0]); });
    if (vivos.length < 2) return;   // §0.6: una sola vista del grupo en este build → sin conmutador
    vivos.forEach(function (m){
      const sec = document.getElementById(m[0]);
      if (!sec || sec.querySelector(":scope > .comm")) return;
      const comm = document.createElement("div");
      comm.className = "fgroup comm";
      comm.setAttribute("role", "group");
      comm.setAttribute("aria-label", commEsc(COMM_LABEL[g.entry] || g.entry));
      comm.innerHTML = vivos.map(function (mm){
        return '<button type="button" class="fbtn comm-btn" data-comm="' + mm[0] + '" aria-pressed="false">' + commEsc(mm[1]) + '</button>';
      }).join("");
      /* primer grupo de la zona de filtros (antes del filtro), o tras la entradilla si la vista no tiene filtro */
      const fb = sec.querySelector(":scope > .filterbar, :scope > .crono-filter");
      if (fb){ fb.insertAdjacentElement("beforebegin", comm); return; }
      const anchor = sec.querySelector(":scope > .lead") || sec.querySelector(":scope > .title");
      if (anchor) anchor.insertAdjacentElement("afterend", comm);
      else sec.insertBefore(comm, sec.firstChild);
    });
  });
}

/* marca el modo activo en todos los conmutadores (al navegar a una de sus vistas) */
function commSync(id){
  document.querySelectorAll(".comm .comm-btn").forEach(function (b){
    b.setAttribute("aria-pressed", b.dataset.comm === id ? "true" : "false");
  });
}

/* clic en un botón del conmutador → show(vista) (delegado, los botones persisten) */
document.addEventListener("click", function (e){
  const b = e.target && e.target.closest ? e.target.closest(".comm-btn") : null;
  if (!b) return;
  const v = b.dataset.comm;
  if (v && typeof window.show === "function") window.show(v);
});

/* al navegar (menú, enlace profundo, «Explora la materia»…), el conmutador refleja la vista activa */
if (typeof window.show === "function"){
  const orig = window.show;
  window.show = function (id){ orig.apply(this, arguments); commSync(id); };
}

commInject();
