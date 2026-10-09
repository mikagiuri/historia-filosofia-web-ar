"use strict";
/* ===== Vista Citas ===== depende de: citas.js (ILUSTRES y show/loadIlustre, opcionales) =====
   Frases célebres de la filosofía, con filtro por época. Estilos propios con tokens de tema.
   Cada frase lleva el retrato de su autor (campo «img», lo añade tools/build_ilustres.js) y, si
   el autor tiene ficha en Ilustres en esta web (campo «id»), el retrato y el nombre la abren. */
(function(){
  if (typeof CITAS === "undefined") return;

  const EPOCAS = { antigua: "القديمة", medieval: "الوسيطة", moderna: "الحديثة", contemporanea: "المعاصرة" };
  const CIT_EP = { antigua: "ant", medieval: "med", moderna: "mod", contemporanea: "con" };   // (30-09) color de época (styles.css, js/epocas.js)
  const CSS = ''
    + '#citas .citgrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr)); gap:14px; margin-top:14px; }'
    + '#citas .citcard{ background:var(--surface); border:1px solid var(--line); border-left:4px solid var(--accent); '
    + '  border-radius:12px; padding:18px 18px 15px; display:flex; flex-direction:column; gap:10px; box-shadow:var(--shadow); }'
    + '#citas .cit-q{ font-family:var(--serif,Georgia,serif); font-style:italic; font-size:1.08rem; line-height:1.45; color:var(--ink); margin:0; }'
    + '#citas .cit-q::before{ content:"\\201C"; color:var(--accent); font-size:1.3em; line-height:0; vertical-align:-0.25em; margin-right:.05em; }'
    + '#citas .cit-src{ margin-top:auto; font-size:.9rem; display:flex; align-items:center; gap:10px; }'
    + '#citas .cit-av{ flex:none; width:46px; height:46px; border-radius:50%; overflow:hidden; border:1px solid var(--line); background:var(--surface-2); padding:0; }'
    + '#citas .cit-av img{ width:100%; height:100%; object-fit:cover; object-position:50% 20%; display:block; }'
    + '#citas button.cit-av{ cursor:pointer; } #citas button.cit-av:hover{ border-color:var(--accent); }'
    + '#citas .cit-who{ min-width:0; }'
    + '#citas button.cit-a{ background:none; border:0; padding:0; font:inherit; cursor:pointer; text-align:left; }'
    + '#citas button.cit-a:hover{ color:var(--accent); text-decoration:underline; }'
    + '#citas .cit-a{ font-weight:600; color:var(--ink); }'
    + '#citas .cit-o{ color:var(--muted); font-style:italic; }'
    + '#citas .citcount{ color:var(--muted); font-size:13px; margin:10px 0 0; }'
    + '#citas .citcard.cit-dest{ grid-column:span 2; border-left-width:6px; background:linear-gradient(0deg,var(--surface),var(--surface-2)); }'
    + '#citas .cit-dest .cit-q{ font-size:1.35rem; font-style:normal; font-weight:500; }'
    + '#citas .cit-badge{ align-self:flex-start; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; '
    + '  color:var(--on-accent,#fff); background:var(--accent); border-radius:999px; padding:3px 10px; }'
    + '@media (max-width:620px){ #citas .citgrid{ grid-template-columns:1fr; } #citas .citcard.cit-dest{ grid-column:auto; } }';
  let cssDone = false;
  function injectCss(){ if (cssDone) return; const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); cssDone = true; }

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  let citEpoca = "all";

  /* (29-09) las frases que se citan en clase («dest») van primero y destacadas */
  const CIT_CLASE = "في القسم";
  function citFiltered(){
    const l = CITAS.filter(function (c){ return citEpoca === "all" || c.e === citEpoca; });
    return l.filter(function (c){ return c.dest; }).concat(l.filter(function (c){ return !c.dest; }));
  }

  function renderCitFilter(){
    const box = document.getElementById("citasfilter");
    if (!box) return;
    injectCss();
    box.innerHTML = '<div class="fgroup"><span class="flabel">العصر</span>' +
      ["all", "antigua", "medieval", "moderna", "contemporanea"].map(function (e){
        return '<button class="fbtn" data-ce="' + e + '" aria-pressed="' + (e === citEpoca) + '">' +
          (e === "all" ? "الكل" : EPOCAS[e]) + '</button>'; }).join("") + '</div>';
    box.querySelectorAll("[data-ce]").forEach(function (b){ b.addEventListener("click", function (){
      citEpoca = b.dataset.ce; renderCitFilter(); renderCitBody(); }); });
  }

  function renderCitBody(){
    const body = document.getElementById("citasbody");
    if (!body) return;
    const list = citFiltered();
    const ficha = function (c){ return c.id && typeof ILUSTRES !== "undefined" && ILUSTRES[c.id] && typeof loadIlustre === "function"; };
    body.innerHTML = '<div class="citgrid">' + list.map(function (c){
      const link = ficha(c), dt = link ? ' data-ilu="' + esc(c.id) + '"' : '';
      const av = c.img ? (link ? '<button class="cit-av"' + dt + ' aria-hidden="true" tabindex="-1">' : '<span class="cit-av" aria-hidden="true">') +
        '<img loading="lazy" src="' + esc(c.img) + '" alt="">' + (link ? '</button>' : '</span>') : '';
      const who = link ? '<button class="cit-a"' + dt + '>' + esc(c.a) + '</button>' : '<span class="cit-a">' + esc(c.a) + '</span>';
      return '<figure class="citcard' + (c.dest ? ' cit-dest' : '') + '"' + (CIT_EP[c.e] ? ' data-ep="' + CIT_EP[c.e] + '"' : '') + '>' + (c.dest ? '<span class="cit-badge">' + CIT_CLASE + '</span>' : '') +
        '<blockquote class="cit-q">' + esc(c.c) + '</blockquote>' +
        '<figcaption class="cit-src">' + av + '<span class="cit-who">' + who +
        (c.o ? ', <span class="cit-o">' + esc(c.o) + '</span>' : '') + '</span></figcaption></figure>';
    }).join("") + '</div>' +
    '<p class="citcount">' + list.length + (list.length === 1 ? " قول" : " أقوال") + '.</p>';
    body.querySelectorAll("[data-ilu]").forEach(function (b){ b.addEventListener("click", function (){
      (window.show || show)("ilustres"); loadIlustre(b.dataset.ilu); }); });
  }

  function initCitas(){ if (!document.getElementById("citasbody")) return; renderCitFilter(); renderCitBody(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCitas);
  else initCitas();
})();
