"use strict";
/* ===== Conocimientos previos (01-11, sesión 110; MUESTRA, solo web local) ===== depende de: previos.js (PREVIOS), theory.js
   Un cuestionario corto por puente sobre lo que el alumnado debería traer del curso anterior. Se abre en una ventana
   superpuesta (<dialog>), así que no desplaza el contenido del tema (regla 4.1 de docs/35). Dos puertas:
   la caja del puente («Lo volverás a ver en 2.º» / «Ya lo viste en 1.º», itinerario.js) y el índice del tema de destino
   (theoryview.js). Dos modos: «En clase» (sin pistas, letra grande para proyectar) y «Por mi cuenta» (con pistas
   graduadas y remisión al apartado del curso anterior). El resultado se guarda en este navegador (aula-previos-<clave>). */
(function(){
  const P = window.PREVIOS || {};
  /* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
  const TX = {
    titulo: "المعارف السابقة", boton: "ماذا تتذكر؟ استبيان قبلي",
    toc1: "قبل البدء: ماذا تتذكرون من السنة الأولى؟", toc4: "قبل البدء: ماذا تتذكر من السنة الرابعة ESO؟",
    elige: "يوجد استبيان لكل موضوع من مواضيع السنة السابقة يرتبط بهذا الموضوع. اختاروا واحدًا أو أنجزوها كلها معًا.",
    todos: "كلها معًا", modo: "كيف ستنجزونه؟",
    grupo: "في القسم، ضمن مجموعة", grupoD: "بدون تلميحات وبخط كبير، للعرض على الشاشة. تجيبون جميعًا وتصححون فورًا.",
    solo: "بمفردي، مع تلميحات", soloD: "كل سؤال له تلميحات تظهر واحدة تلو الأخرى ويخبرك أين رأيته. اطلبوا فقط ما تحتاجونه.",
    preg: "السؤال {n} من {t}", pista: "أحتاج إلى تلميح", otra: "تلميح آخر", pistaN: "تلميح {n}",
    donde: "أين رأيته؟", lovi: "رأيتموه في", noEs: "ليست هذه. اطلبوا تلميحًا أو أعيدوا المحاولة.",
    mostrar: "إظهار الإجابة", sig: "التالي", fin: "عرض النتيجة", cerrar: "إغلاق",
    repetir: "البدء من جديد", otroModo: "تغيير الوضع",
    resSolo: "{p} من {m} نقطة", resGrupo: "{p} من {t} صحيحة من أول محاولة",
    puntos: "نقطتان إذا أصبت بدون تلميحات من أول محاولة؛ نقطة واحدة إذا احتجت تلميحات أو محاولة ثانية.",
    repasa: "قبل بدء الموضوع، راجعوا:", todoBien: "معك كل شيء: يمكنك البدء في الموضوع.",
    mejor: "أفضل نتيجة لك في هذا المتصفح: {p} من {m}.",
    c1: "السنة الأولى", c2: "السنة الثانية", c4: "الصف الرابع ESO"
  };
  const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const T = () => (typeof THEORY !== "undefined" ? THEORY : {});
  const CURSO = k => /^fil4-/.test(k) ? TX.c4 : /^fil-/.test(k) ? TX.c1 : TX.c2;
  const WEB_REPO = { fil: "aula-de-filosofia-web", hf: "historia-filosofia-web" };

  /* enlace al apartado del curso anterior: dentro de esta web si el tema está; si no, a la web publicada del otro curso */
  function apHref(k, ap){
    if (T()[k]) return "#teoria/" + k + "/" + ap;
    const lang = (document.documentElement.lang || "es").slice(0, 2), subj = /^hf-/.test(k) ? "hf" : "fil";
    return "https://mikagiuri.github.io/" + WEB_REPO[subj] + (lang === "es" ? "" : "-" + lang) + "/#teoria/" + k + "/" + ap;
  }
  /* (01-11) si el tema de origen no está en esta web (la de 2.º no lleva la teoría de 1.º), títulos de previos_puentes*.js */
  function titulos(k){ const L = (document.documentElement.lang || "es").slice(0, 2), tr = ((window.PREVIOS_TR || {})[L] || {})["@temas"] || {}, es = (window.PREVIOS_TEMAS || {})[k] || {};
    const t = tr[k] || {}; return { lab: t.lab || es.lab, aps: Object.assign({}, es.aps, t.aps) }; }
  function apTitulo(k, ap, defecto){
    const o = T()[k]; if (!o || !o.html) return titulos(k).aps[ap] || defecto || "";
    const hs = (o.html.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || []).map(h => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(t => t && !/^diccionario/i.test(t));
    return (hs[ap - 1] || defecto || "").replace(/^\d+\.\s*/, "");
  }
  /* «1.º: Filosofía · Tema 1 · …»; sin repetir el curso si el título del tema ya lo dice («Filosofía 4.º ESO · Tema 1.1 · …») */
  function donde(k){ const t = temaLab(k); return t.indexOf(CURSO(k)) >= 0 ? t : CURSO(k) + ": " + t; }
  function temaLab(k){ const o = T()[k]; return o ? (o.tema ? String(o.tema).replace(/<[^>]+>/g, "") + " · " : "") + String(o.title).replace(/<[^>]+>/g, "") : (titulos(k).lab || k); }
  function apLink(q, it){
    const href = apHref(q.origen, it.ap), ext = /^https?:/.test(href);
    return '<a class="prev-ap" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '>' + esc(TX.lovi + " " + donde(q.origen) + " · §" + it.ap + " " + apTitulo(q.origen, it.ap, it.ap === q.ap ? q.apTit : "")) + (ext ? " ↗" : "") + '</a>';
  }
  /* (01-11) en la web en euskera, los textos de q.eu.items (misma posición; a, ap y de salen del castellano) */
  function itemsDe(k){
    const q = P[k], L = (document.documentElement.lang || "es").slice(0, 2);
    /* (01-11) puentes 1.º → 2.º generados por tools/build_previos.js: «usa» = ids del banco del apartado (PREVIOS_BANCO) y
       «propias» = las del puente; traducciones por id en PREVIOS_TR[<lengua>] (previos_puentes_<lengua>.js) */
    if (q.usa){
      const B = window.PREVIOS_BANCO || {}, TRL = ((window.PREVIOS_TR || {})[L]) || {};
      return q.usa.map(id => B[id]).filter(Boolean).concat(q.propias || []).map(it => { const t = TRL[it.id]; return t ? Object.assign({}, it, { q: t.q, o: t.o, fb: t.fb, pistas: t.pistas }) : it; });
    }
    const tr = q[L] && q[L].items;
    return tr && tr.length === q.items.length ? q.items.map((it, i) => Object.assign({}, it, { q: tr[i].q, o: tr[i].o, fb: tr[i].fb, pistas: tr[i].pistas })) : q.items;
  }
  const lsGet = k => { try { return JSON.parse(localStorage.getItem("aula-previos-" + k) || "null"); } catch (e){ return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem("aula-previos-" + k, JSON.stringify(v)); } catch (e){} };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---- ventana ---- */
  let dlg = null, st = null;
  function ventana(){
    if (dlg) return dlg;
    dlg = document.createElement("dialog"); dlg.className = "prev-dlg"; dlg.setAttribute("aria-labelledby", "prev-h");
    document.body.appendChild(dlg);
    dlg.addEventListener("click", ev => {
      if (ev.target === dlg){ dlg.close(); return; }   // clic fuera de la caja
      const b = ev.target.closest("[data-pv]"); if (!b) return;
      const act = b.dataset.pv, arg = b.dataset.pvarg;
      if (act === "cerrar") dlg.close();
      else if (act === "elige") modo(arg.split(","));
      else if (act === "modo") empezar(arg);
      else if (act === "opt") responder(+arg);
      else if (act === "pista") pista();
      else if (act === "mostrar") revelar(false);
      else if (act === "sig") { st.i++; st.i < st.items.length ? pregunta() : final(); }
      else if (act === "repetir") empezar(st.modo);
      else if (act === "otromodo") modo(st.ids);
    });
    return dlg;
  }
  function pinta(html, grande){
    const d = ventana(); d.classList.toggle("prev-grupo", !!grande);
    d.innerHTML = '<div class="prev-box"><div class="prev-top"><span class="kick">' + esc(TX.titulo) + '</span><button class="prev-x" type="button" data-pv="cerrar" aria-label="' + esc(TX.cerrar) + '">✕</button></div>' + html + '</div>';
    if (!d.open) d.showModal();
    const f = d.querySelector(".prev-box [data-pv]:not(.prev-x)"); if (f) f.focus();
  }
  /* 1) elegir cuestionario (si la puerta lleva más de uno) */
  /* (01-11) las traducciones (previos_puentes_<lengua>.js) se cargan al abrir la primera vez, solo en la lengua de la web:
     así no pesan en las demás webs ni hace falta tocar el pipeline de traducción */
  const cargadas = {};
  function conLengua(cb){
    const L = (document.documentElement.lang || "es").slice(0, 2);
    if (L === "es" || ((window.PREVIOS_TR || {})[L]) || cargadas[L] === "falla") return cb();
    const s = document.createElement("script"); s.src = "js/previos_puentes_" + L + ".js";
    s.onload = () => cb(); s.onerror = () => { cargadas[L] = "falla"; cb(); };   // sin traducción, en castellano
    document.head.appendChild(s);
  }
  function abrir(ids){ conLengua(() => abrir_(ids)); }
  function abrir_(ids){
    ids = ids.filter(k => P[k]); if (!ids.length) return;
    if (ids.length === 1) return modo(ids);
    pinta('<h2 id="prev-h">' + esc(temaLab(P[ids[0]].destino)) + '</h2><p class="prev-lede">' + esc(TX.elige) + '</p><div class="prev-lista">' +
      ids.map(k => { const q = P[k]; return '<button class="opt" type="button" data-pv="elige" data-pvarg="' + esc(k) + '"><span class="k">' + itemsDe(k).length + '</span><span>' + esc(donde(q.origen) + " · §" + q.ap + " " + apTitulo(q.origen, q.ap, q.apTit)) + '</span></button>'; }).join("") +
      '<button class="opt" type="button" data-pv="elige" data-pvarg="' + esc(ids.join(",")) + '"><span class="k">∑</span><span><b>' + esc(TX.todos) + '</b></span></button></div>');
  }
  /* 2) elegir modo */
  function modo(ids){
    st = { ids: ids };
    const q = P[ids[0]], tit = ids.length > 1 ? TX.todos + " · " + temaLab(q.destino) : CURSO(q.origen) + " → " + CURSO(q.destino) + " · " + apTitulo(q.origen, q.ap, q.apTit);
    pinta('<h2 id="prev-h">' + esc(tit) + '</h2><p class="prev-lede">' + esc(TX.modo) + '</p><div class="prev-modos">' +
      '<button class="prev-modo" type="button" data-pv="modo" data-pvarg="grupo"><b>👥 ' + esc(TX.grupo) + '</b><span>' + esc(TX.grupoD) + '</span></button>' +
      '<button class="prev-modo" type="button" data-pv="modo" data-pvarg="solo"><b>💡 ' + esc(TX.solo) + '</b><span>' + esc(TX.soloD) + '</span></button></div>');
  }
  /* 3) jugar: con varios cuestionarios, hasta 8 preguntas repartidas entre ellos */
  function empezar(m){
    let items = [];
    if (st.ids.length === 1) items = itemsDe(st.ids[0]).map(it => ({ it: it, q: P[st.ids[0]] }));
    else { const per = Math.max(1, Math.floor(8 / st.ids.length)); st.ids.forEach(k => shuffle(itemsDe(k)).slice(0, per).forEach(it => items.push({ it: it, q: P[k] }))); items = items.slice(0, 8); }
    st = { ids: st.ids, modo: m, items: items, i: 0, pts: 0, prim: 0, mal: [] };
    pregunta();
  }
  function pregunta(){
    const x = st.items[st.i], it = x.it;
    st.ord = shuffle(it.o.map((_, j) => j)); st.np = 0; st.int = 0; st.hecho = false;
    pinta('<div class="q-top"><span>' + esc(fmt(TX.preg, { n: st.i + 1, t: st.items.length })) + '</span><span class="score">' + esc(CURSO(x.q.origen)) + ' · §' + it.ap + '</span></div>' +
      '<div class="q-text" id="prev-h">' + esc(it.q) + '</div><div class="opts">' +
      st.ord.map((j, n) => '<button class="opt" type="button" data-pv="opt" data-pvarg="' + j + '"><span class="k">' + "ABCDEF"[n] + '</span><span>' + esc(it.o[j]) + '</span></button>').join("") + '</div>' +
      '<div class="prev-pistas" aria-live="polite"></div><div class="prev-msg" aria-live="polite"></div>' +
      '<div class="prev-acc">' + (st.modo === "solo" ? '<button class="btn ghost" type="button" data-pv="pista">' + esc(TX.pista) + '</button>' : '<button class="btn ghost" type="button" data-pv="mostrar">' + esc(TX.mostrar) + '</button>') + '</div>',
      st.modo === "grupo");
  }
  function pista(){
    const x = st.items[st.i], it = x.it, box = dlg.querySelector(".prev-pistas"), b = dlg.querySelector('[data-pv="pista"]');
    if (st.np < it.pistas.length){ box.insertAdjacentHTML("beforeend", '<p class="prev-pista"><b>' + esc(fmt(TX.pistaN, { n: st.np + 1 })) + '.</b> ' + esc(it.pistas[st.np]) + '</p>'); st.np++; }
    else if (st.np === it.pistas.length){ box.insertAdjacentHTML("beforeend", '<p class="prev-pista prev-donde">' + apLink(x.q, it) + '</p>'); st.np++; }
    if (b){ if (st.np >= it.pistas.length + 1) b.remove(); else b.textContent = st.np === it.pistas.length ? TX.donde : TX.otra; }
  }
  function responder(j){
    if (st.hecho) return;
    const it = st.items[st.i].it, b = dlg.querySelector('[data-pv="opt"][data-pvarg="' + j + '"]');
    if (j === it.a) return revelar(true);
    st.int++;
    if (st.modo === "solo" && st.int < 2){ b.classList.add("wrong"); b.disabled = true; dlg.querySelector(".prev-msg").textContent = TX.noEs; return; }
    b.classList.add("wrong"); revelar(false);
  }
  function revelar(ok){
    st.hecho = true;
    const x = st.items[st.i], it = x.it, primera = ok && st.int === 0;
    if (ok){ st.pts += primera && st.np === 0 ? 2 : 1; if (primera) st.prim++; }
    if (!(primera && st.np === 0)) st.mal.push(x);
    dlg.querySelectorAll('[data-pv="opt"]').forEach(b => { b.disabled = true; const j = +b.dataset.pvarg; if (j === it.a) b.classList.add("correct"); else if (!b.classList.contains("wrong")) b.classList.add("dim"); });
    dlg.querySelector(".prev-msg").textContent = "";
    const ult = st.i === st.items.length - 1;
    dlg.querySelector(".prev-acc").innerHTML = '<div class="fb show">' + esc(it.fb) + '<br>' + apLink(x.q, it) + '</div>' +
      '<button class="btn" type="button" data-pv="sig">' + esc(ult ? TX.fin : TX.sig) + '</button>';
    dlg.querySelector('[data-pv="sig"]').focus();
  }
  function final(){
    const n = st.items.length, m = n * 2;
    let res;
    if (st.modo === "solo"){
      res = fmt(TX.resSolo, { p: st.pts, m: m });
      if (st.ids.length === 1){ const k = st.ids[0], prev = lsGet(k); if (!prev || st.pts > prev.p) lsSet(k, { p: st.pts, m: m, f: new Date().toISOString().slice(0, 10) }); }
    } else res = fmt(TX.resGrupo, { p: st.prim, t: n });
    const vistos = {}, rep = st.mal.filter(x => { const k = x.q.origen + "/" + x.it.ap; if (vistos[k]) return false; vistos[k] = 1; return true; });
    const mejor = st.modo === "solo" && st.ids.length === 1 && lsGet(st.ids[0]);
    pinta('<h2 id="prev-h">' + esc(res) + '</h2>' + (st.modo === "solo" ? '<p class="prev-lede">' + esc(TX.puntos) + '</p>' : "") +
      (rep.length ? '<p>' + esc(TX.repasa) + '</p><ul class="prev-rep">' + rep.map(x => '<li>' + apLink(x.q, x.it) + '</li>').join("") + '</ul>' : '<p>' + esc(TX.todoBien) + '</p>') +
      (mejor ? '<p class="prev-lede">' + esc(fmt(TX.mejor, { p: mejor.p, m: mejor.m })) + '</p>' : "") +
      '<div class="prev-acc"><button class="btn" type="button" data-pv="repetir">' + esc(TX.repetir) + '</button> <button class="btn ghost" type="button" data-pv="otromodo">' + esc(TX.otroModo) + '</button> <button class="btn ghost" type="button" data-pv="cerrar">' + esc(TX.cerrar) + '</button></div>',
      st.modo === "grupo");
  }
  /* los enlaces al apartado cierran la ventana (si son de esta web) para que se vea el tema */
  document.addEventListener("click", ev => {
    const a = ev.target.closest(".prev-dlg a.prev-ap"); if (a && !a.target && dlg) dlg.close();
    const b = ev.target.closest("[data-previo]"); if (b){ ev.preventDefault(); abrir(b.dataset.previo.split(",")); }
  });

  /* ---- puertas ---- */
  /* en la caja del puente (itinerario.js, puentesHtml): clave «origen|destino» */
  function botonPuente(k){ return P[k] ? '<button class="prev-lnk" type="button" data-previo="' + esc(k) + '">' + esc(TX.boton) + ' · ' + itemsDe(k).length + '</button>' : ""; }
  /* al principio del índice del tema de destino (theoryview.js): una línea, sin bloque nuevo sobre el texto */
  function enToc(toc, k){
    if (!toc) return;
    const ids = Object.keys(P).filter(x => P[x].destino === k); if (!ids.length) return;
    const lab = ids.some(x => !P[x].eso) ? TX.toc1 : TX.toc4;
    toc.insertAdjacentHTML("afterbegin", '<button class="prev-toc" type="button" data-previo="' + esc(ids.join(",")) + '">💡 ' + esc(lab) + '</button>');
  }

  document.head.insertAdjacentHTML("beforeend", '<style>' +
    '.prev-lnk{display:inline-block;margin:.35rem 0 0;background:none;border:1px dashed var(--line);border-radius:999px;padding:3px 11px;font-size:.84rem;color:var(--accent);cursor:pointer}.prev-lnk:hover{border-color:var(--accent);border-style:solid}' +
    '.prev-toc{display:block;width:100%;text-align:start;background:var(--surface-2);border:1px solid var(--line-soft);border-radius:9px;padding:6px 10px;margin:0 0 8px;font-size:.85rem;color:var(--accent);cursor:pointer}.prev-toc:hover{border-color:var(--accent)}' +
    '.prev-dlg{border:0;padding:0;background:transparent;max-width:min(720px,100vw - 24px);width:100%;max-height:calc(100vh - 24px)}.prev-dlg::backdrop{background:rgba(20,21,25,.6)}' +
    '.prev-box{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px 22px 22px;max-height:calc(100vh - 28px);overflow:auto}' +
    '.prev-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.prev-x{background:none;border:0;font-size:1.1rem;color:var(--muted);cursor:pointer;padding:4px 8px}' +
    '.prev-box h2{font-family:var(--serif);font-weight:500;font-size:1.3rem;margin:4px 0 8px}.prev-lede{color:var(--muted);font-size:.92rem;margin:0 0 14px}' +
    '.prev-lista{display:flex;flex-direction:column;gap:8px}.prev-modos{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:10px}' +
    '.prev-modo{display:flex;flex-direction:column;gap:6px;text-align:start;background:var(--surface-2);border:1px solid var(--line);border-radius:11px;padding:14px 16px;color:var(--ink);cursor:pointer}.prev-modo:hover{border-color:var(--accent)}.prev-modo span{color:var(--muted);font-size:.9rem;line-height:1.4}' +
    '.prev-pistas{margin-top:12px}.prev-pista{margin:8px 0 0;padding:9px 13px;border-left:3px solid var(--accent);background:var(--surface-2);border-radius:0 9px 9px 0;font-size:.93rem;line-height:1.45}' +
    '.prev-msg{min-height:1.2em;margin-top:8px;color:var(--bad);font-size:.9rem}.prev-acc{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}.prev-acc .fb{flex:1 1 100%;margin-top:0}' +
    '.prev-ap{display:inline-block;margin-top:6px;font-size:.88rem;color:var(--accent)}.prev-rep{margin:6px 0 10px;padding-inline-start:1.2rem}' +
    /* modo «En clase»: letra grande para proyectar */
    '.prev-grupo{max-width:min(1100px,100vw - 24px)}.prev-grupo .q-text{font-size:2rem}.prev-grupo .opt{font-size:1.35rem;padding:16px 18px}.prev-grupo .fb{font-size:1.15rem}.prev-grupo .prev-box h2{font-size:1.8rem}' +
    '@media (max-width:600px){.prev-box{padding:14px 14px 18px}.prev-grupo .q-text{font-size:1.4rem}.prev-grupo .opt{font-size:1.05rem}}' +
    '</style>');

  window.Previos = { abrir: abrir, botonPuente: botonPuente, enToc: enToc, TX: TX };
})();
