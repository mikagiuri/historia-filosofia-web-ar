"use strict";
/* ===== Móvil compacto (29-09-2026) =====
   En pantalla estrecha, antes de leer un tema se pasaba por cinco pantallas de controles: entradilla, filtro de
   bloque, la lista de temas (27 chips en HF), el índice completo y la tira de enlaces. Criterio del profesor:
   cabecera → título del tema → texto, en una pantalla. Este módulo, solo con CSS de mobile.css (≤760 px):
   · pliega los filtros y la lista de temas de cada vista en UNA línea con lo elegido («Platón: la teoría… ▾»),
     que se despliega al tocar y se vuelve a plegar al elegir;
   · pliega el índice («En este tema ▾»), cerrado por defecto;
   · mobile.css oculta además la entradilla de las vistas que tienen ese plegado.
   No toca las vistas: inserta un botón antes de los controles y otro antes del índice, y los mantiene al día con
   un MutationObserver (las vistas repintan sus chips e índices con innerHTML). Sin textos nuevos: la etiqueta es
   la del chip/filtro activo o el título del propio índice. En escritorio los botones no se muestran. */
(function(){
  function strip(s){ return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var CTL = ":scope > .filterbar, :scope > .chips, :scope > .crono-filter, :scope > .crono-chips";

  function label(sec){
    var chip = sec.querySelector(":scope > .chips [aria-pressed='true'], :scope > .crono-chips [aria-pressed='true']");
    if (chip) return strip(chip.textContent);
    return [].map.call(sec.querySelectorAll(":scope > .filterbar [aria-pressed='true'], :scope > .crono-filter [aria-pressed='true']"), function(b){
      /* los filtros de materia van ocultos en las webs de una materia: no se nombran */
      return b.closest(".fgroup") && b.closest(".fgroup").querySelector("[data-subj],[data-sa]") ? "" : strip(b.textContent);
    }).filter(Boolean).join(" · ");
  }
  function ensureCtl(sec){
    var ctl = sec.querySelector(CTL); if (!ctl) return;
    var btn = sec.querySelector(":scope > .ctl-toggle");
    if (!btn){
      btn = document.createElement("button"); btn.type = "button"; btn.className = "ctl-toggle"; btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function(){ var on = sec.classList.toggle("ctl-open"); btn.setAttribute("aria-expanded", String(on)); });
      sec.insertBefore(btn, ctl);
    }
    var l = label(sec);
    /* (08-10) sin nada elegido (p. ej. Esquemas de Filosofía 1.º al entrar) el botón no puede desaparecer: si no, la
       lista queda plegada y sin forma de abrirla. Se rotula con el nombre del grupo («Elegir esquema») y el total. */
    var g = !l && sec.querySelector(":scope > .chips, :scope > .crono-chips"), n = g ? g.querySelectorAll("button").length : 0;
    if (n) l = g.getAttribute("aria-label") || "";
    btn.innerHTML = '<span class="ctl-l">' + esc(l) + (n ? ' <i>' + n + '</i>' : '') + '</span><span class="ctl-caret" aria-hidden="true">▾</span>';
    btn.hidden = !l;
  }
  function ensureToc(toc){
    var lay = toc.parentNode; if (!lay || !lay.classList.contains("theory-layout")) return;
    var btn = lay.querySelector(":scope > .toc-toggle");
    if (!btn){
      btn = document.createElement("button"); btn.type = "button"; btn.className = "toc-toggle"; btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function(){ var on = lay.classList.toggle("toc-open"); btn.setAttribute("aria-expanded", String(on)); });
      lay.insertBefore(btn, toc);
    }
    var t = toc.querySelector(".toc-title"), n = toc.querySelectorAll("a").length;
    btn.innerHTML = '<span class="ctl-l">' + esc(t ? strip(t.textContent) : "") + (n ? ' <i>' + n + '</i>' : '') + '</span><span class="ctl-caret" aria-hidden="true">▾</span>';
    btn.hidden = !n;
  }
  /* (05-10) Escritorio: la lista de temas/materiales también se pliega cuando es larga. Con 11-27 chips en varias
     filas, el profesor lo considera ruido que empuja el contenido (lo pidió varias veces). Regla: más de MANY
     opciones → una sola línea con la elegida y el número total («El surgimiento… 11 ▾»); con pocas, siguen a la vista.
     Los filtros (Materia, Bloque) no se pliegan en escritorio: son una fila corta. Solo CSS ≥880 px lo muestra. */
  var MANY = 6;
  function ensureDesk(sec){
    var chips = sec.querySelector(":scope > .chips, :scope > .crono-chips");
    var btn = sec.querySelector(":scope > .chips-toggle");
    var n = chips ? chips.querySelectorAll("button").length : 0;
    sec.classList.toggle("ctl-many", n > MANY);
    if (!chips) return;
    if (!btn){
      btn = document.createElement("button"); btn.type = "button"; btn.className = "chips-toggle"; btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function(){ var on = sec.classList.toggle("chips-open"); btn.setAttribute("aria-expanded", String(on)); });
    }
    if (btn.nextElementSibling !== chips) sec.insertBefore(btn, chips);
    var act = chips.querySelector("[aria-pressed='true']");
    var l = act ? strip(act.textContent) : strip(chips.getAttribute("aria-label"));
    btn.innerHTML = '<span class="ctl-l">' + esc(l) + ' <i>' + n + '</i></span><span class="ctl-caret" aria-hidden="true">▾</span>';
    btn.hidden = n <= MANY;
  }
  function closeDesk(){
    document.querySelectorAll(".view.chips-open").forEach(function(v){
      v.classList.remove("chips-open"); var t = v.querySelector(":scope > .chips-toggle"); if (t) t.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeDesk(); });
  document.addEventListener("click", function(e){
    var t = e.target; if (!t.closest) return;
    var b = t.closest(".chip, .chips button, .crono-chips button");
    if (b && b.closest(".view > .chips, .view > .crono-chips")) {
      /* elegir un tema pliega la lista; un botón de grupo (p. ej. «Tema N» de los cuestionarios) que no sea .chip, no */
      if (b.classList.contains("chip") || b.hasAttribute("aria-pressed")) closeDesk();
      return;
    }
    if (!t.closest(".chips-toggle")) closeDesk();   // clic fuera
  }, true);

  var pending = false;
  function refresh(){
    pending = false;
    document.querySelectorAll(".view").forEach(ensureCtl);
    document.querySelectorAll(".view").forEach(ensureDesk);
    document.querySelectorAll(".view .theory-layout > .toc").forEach(ensureToc);
  }
  function schedule(){ if (pending) return; pending = true; setTimeout(refresh, 0); }

  /* al elegir un chip o filtro dentro del panel desplegado, se vuelve a plegar */
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest(".chip, .fbtn"); if (!b) return;
    var sec = b.closest(".view"); if (!sec || !sec.classList.contains("ctl-open")) return;
    if (!b.closest(CTL.split(", ").map(function(s){ return s.replace(":scope > ", ".view > "); }).join(", "))) return;
    if (b.classList.contains("chip")) { sec.classList.remove("ctl-open"); var t = sec.querySelector(":scope > .ctl-toggle"); if (t) t.setAttribute("aria-expanded", "false"); }
  }, true);   // en captura: la vista repinta los chips (innerHTML) en su propio listener y el botón ya no estaría en el DOM
  /* al cambiar de vista, todo plegado */
  if (typeof window.show === "function"){
    var orig = window.show;
    window.show = function(id){ orig.apply(this, arguments); document.querySelectorAll(".view.ctl-open").forEach(function(v){ v.classList.remove("ctl-open"); }); document.querySelectorAll(".toc-open").forEach(function(v){ v.classList.remove("toc-open"); }); closeDesk(); schedule(); };
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
  refresh();
})();
