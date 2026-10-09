"use strict";
/* ===== Filosofía y cine/arte en la teoría ===== depende de: cine_arte.js (CINE), theoryview.js
   Envuelve loadTheory() y, tras renderizar un tema, añade debajo una tira de películas y
   obras de arte relacionadas con ese tema, con la pregunta filosófica que plantean. */
(function(){
  if (typeof CINE === "undefined") return;

  const CSS = ''
    + '.cine-strip{ margin:2.2rem 0 .5rem; padding-top:1.2rem; border-top:1px solid var(--line); }'
    + '.cine-strip h3{ font-family:var(--serif,Georgia,serif); font-size:1.05rem; margin:0 0 .2rem; }'
    + '.cine-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr)); gap:.8rem; margin:.9rem 0 .6rem; }'
    + '.cine-card{ background:var(--surface); border:1px solid var(--line); border-left:4px solid var(--accent); '
    + '  border-radius:12px; padding:.7rem .8rem .75rem; display:flex; flex-direction:column; gap:.35rem; }'
    + '.cine-h{ display:flex; align-items:baseline; gap:.4rem; flex-wrap:wrap; }'
    + '.cine-ico{ font-size:1.05rem; }'
    + '.cine-t{ font-weight:600; color:var(--ink); }'
    + '.cine-meta{ font-size:.78rem; color:var(--muted); }'
    + '.cine-q{ font-size:.86rem; color:var(--ink); line-height:1.4; }'
    + '.cine-note{ font-size:.76rem; color:var(--muted); line-height:1.5; margin:.4rem 0 0; }'
    + '.cine-mas{ margin-top:.25rem; font-size:.84rem; }'
    + '.cine-mas summary{ cursor:pointer; color:var(--accent); font-weight:600; font-size:.82rem; }'
    + '.cine-mas p{ margin:.45rem 0 0; line-height:1.45; }'
    + '.cine-mas ol{ margin:.35rem 0 0; padding-left:1.2rem; line-height:1.45; }'
    + '.cine-mas li{ margin:.25rem 0; }'
    + '.cine-lab{ font-size:.72rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); display:block; margin-top:.55rem; }'
    + '.cine-trampa{ background:var(--surface-2); border-radius:8px; padding:.4rem .55rem; }'
    + '.cine-aviso{ color:var(--bad,#a53b34); }';
  let cssDone = false;
  function injectCss(){ if (cssDone) return; const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); cssDone = true; }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function cardHTML(x){
    const ico = x.kind === "arte" ? "🖼️" : "🎬";
    const meta = [x.autor, x.year].filter(Boolean).join(", ");
    return '<div class="cine-card"><div class="cine-h"><span class="cine-ico">' + ico + '</span>'
      + '<span class="cine-t">' + esc(x.t) + '</span>'
      + (meta ? '<span class="cine-meta">' + esc(meta) + '</span>' : '') + '</div>'
      + '<div class="cine-q">' + esc(x.q) + '</div>' + fichaHTML(x) + '</div>';
  }

  /* (09-10) cine para discutir, no para ilustrar: escena clave, tres preguntas que piden razones y la lectura trampa */
  function fichaHTML(x){
    if (!x.pregs) return '';
    return '<details class="cine-mas"><summary>' + 'للعمل بها في القسم' + '</summary>'
      + '<span class="cine-lab">' + 'المشهد الأساسي' + '</span><p>' + esc(x.esc) + '</p>'
      + '<span class="cine-lab">' + 'أسئلة: أجيبوا مع ذكر الأسباب' + '</span><ol>' + x.pregs.map(q => '<li>' + esc(q) + '</li>').join('') + '</ol>'
      + '<span class="cine-lab">' + 'القراءة الفخ' + '</span><p class="cine-trampa">' + esc(x.trampa) + '</p>'
      + (x.aviso ? '<span class="cine-lab cine-aviso">' + 'تنبيه بشأن المحتوى' + '</span><p>' + esc(x.aviso) + '</p>' : '')
      + '</details>';
  }

  function injectCine(){
    const body = document.getElementById("theorybody");
    if (!body) return;
    const old = body.querySelector(".cine-strip"); if (old) old.remove();
    const k = (typeof theoryKey !== "undefined") ? theoryKey : null;
    const list = CINE.filter(x => x.tema === k);
    if (!list.length) return;
    injectCss();
    const strip = document.createElement("aside");
    strip.className = "cine-strip";
    strip.innerHTML = '<h3>الفلسفة والسينما/الفن · لهذا الموضوع</h3>'
      + '<div class="cine-grid">' + list.map(cardHTML).join("") + '</div>'
      + '<p class="cine-note">أفلام وأعمال فنية تطرح أسئلة هذا الموضوع. طريقة لتأمل الفلسفة من خلال السينما والفن.</p>';
    body.appendChild(strip);
  }

  if (typeof loadTheory === "function"){
    const orig = loadTheory;
    loadTheory = function(k){ orig(k); try { injectCine(); } catch(e){} };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectCine);
  else injectCine();
})();
