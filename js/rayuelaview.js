"use strict";
/* ===== «Rayuela filosófica» (HF 2.º) ===== depende de: rayuela_hf.js (RAYUELA_HF), store.js;
   usa ILUSTRES y THEORY si existen (enlaces de los finales).
   Un viaje por una red de metro de ideas: cada estación plantea una pregunta con tres respuestas
   y cada respuesta lleva a otra estación. Hay estaciones-vida (episodios de los filósofos) y de
   contradicción (en rojo: te enseñan las respuestas tuyas que chocan). Al final llegas a una terminal
   (la corriente con la que coinciden tus intuiciones). Además (25-09), las «tensiones» de RAYUELA_HF comparan
   cada respuesta con todas las anteriores del viaje: si chocan, sale una alerta de coherencia (repensar, rectificar
   la respuesta anterior o mantener las dos y anotarlo) y el final las recoge para la reflexión. El jugador NO ve la red completa (decisión del
   profesor, 25-09): el plano solo dibuja el recorrido de cada viaje, estación a estación; la portada
   enseña el último viaje y «Mi plano» deja elegir cuál ver. El plano completo está solo en las tarjetas del profesor.
   Todo se guarda en este navegador (clave aula-rayuela-hf). Diseño: docs/13_diseno_narrativa_marco_HF.md */

/* (08-10) el mismo motor sirve a 1.º (RAYUELA_FIL, rayuela_fil.js) y a 2.º (RAYUELA_HF): cada web publica solo sus datos;
   en la web maestra, que carga los dos, juega la de 2.º. Clave de guardado y textos propios («txt») salen de los datos. */
const RAY_R = typeof RAYUELA_HF !== "undefined" ? RAYUELA_HF : (typeof RAYUELA_FIL !== "undefined" ? RAYUELA_FIL : null);
const RAY_KEY = (RAY_R && RAY_R.clave) || "aula-rayuela-hf";
/* textos de interfaz: cadenas enteras (así los traduce web_i18n/ui/<lang>.json) */
const RAY_TXT = {
  intro: "تطرح عليكم كل محطة سؤالًا بثلاث إجابات، وكل إجابة تقودكم إلى محطة أخرى. وفي الطريق ستصادفون وقائع من حياة الفلاسفة وتناقضات بين إجاباتكم أنتم. وفي النهاية تصلون إلى محطة أخيرة: التيار الذي تتفق معه أفكاركم. كل رحلة تنطلق من محطة مختلفة تُختار عشوائيًا: يمكنكم السفر كلما أردتم.",
  salida: "قطاركم اليوم ينطلق من هنا. محطة الانطلاق تتغير في كل رحلة.",
  todas: "كل محطاتي", todasTit: "كل محطاتكم", todasPlano: "كل محطاتكم على الخريطة",
  todasAyuda: "تجمع الخريطة كل المحطات التي مررتم بها في جميع رحلاتكم. كلما كان المقطع أسمك، كان عدد مرات قطعه أكبر. أما بقية الشبكة فما زالت تنتظر الاكتشاف.",
  veces: "مرات", terminales: "المحطات الأخيرة",
  iniciar: "ابدؤوا الرحلة", otroViaje: "رحلة جديدة", miPlano: "خريطتي", abandonar: "→ تركُ الرحلة", volver: "→ رجوع",
  viajes: "الرحلات المنجزة:", finales: "النهايات المكتشفة:", estaciones: "المحطات المزارة:",
  pregunta: "محطة", vida: "حياة فيلسوف", contradiccion: "تناقض", final: "المحطة الأخيرة",
  chocan: "إجاباتكم المتعارضة:",
  coinciden: "فلاسفة مرتبطون", estudia: "ادرسوه في الدرس", abierto: "ما زال مفتوحًا أمامكم",
  paraPau: "من أجل PAU (التمرين 2: التأمل الفلسفي)", tuTexto: "اكتبوا هنا تأملكم (200-300 كلمة). يُحفظ في هذا المتصفح فقط.",
  guardado: "تم الحفظ في هذا المتصفح.", palabras: "كلمات",
  recorrido: "مساركم", nuevo: "نهاية جديدة!", todos: "لقد اكتشفتم جميع نهايات الشبكة!", transbordo: "تغيير الخط",
  plano: "مساركم على الخريطة", leyenda: "مفتاح الخريطة", sinViajes: "هنا سيُرسم مساركم محطة بعد محطة. أما بقية الشبكة فما زالت تنتظر الاكتشاف.", verViaje: "عرض على الخريطة",
  ultimos: "رحلاتكم الأخيرة", ninguno: "لم تقوموا بأي رحلة بعد.", caidas: "التناقضات التي وقعتم فيها",
  borrar: "مسح تقدّمي في الحجلة الفلسفية", seguro: "هل أنتم متأكدون؟ ستُمسح رحلاتكم وتأملاتكم في هذه اللعبة.",
  mapaAria: "خريطة مساركم في الحجلة الفلسفية", sinDescubrir: "لم يُكتشف بعد",
  aviso: "تنبيه إلى الاتساق", tension: "توتر", antes: "ما قلتموه من قبل:", ahora: "ما اخترتموه الآن:",
  queHaces: "ماذا تفعلون؟", repensar: "أعيد التفكير: أختار من جديد في هذه المحطة.", rectificar: "أصحح إجابتي السابقة:",
  mantener: "أُبقي على الاثنتين وأتابع (سيُسجَّل ذلك).", ademas: "كما أنه يتعارض مع شيء قلتموه من قبل",
  tensViaje: "تناقضات وتوترات هذه الرحلة", tensPau: "اختاروا واحدًا واشرحوا بالحجج أي الموقفين تتبنون ولماذا."
};
const ray = { ruta: [], elec: [], tens: [], fin: null, modo: "portada" };

function rayBox(){ return document.getElementById("rayuelabox"); }
function rayEsc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function rayData(){ const d = store.get(RAY_KEY, {}); return d && typeof d === "object" ? d : {}; }
function raySave(d){ store.set(RAY_KEY, d); }
function rayLinea(id){ return (RAY_R.lineas.find(l => l.id === id) || { color: "#888" }).color; }
const RAY_HOY = new Date().toISOString().slice(0, 10);
function rayRedAbierta(n){ const r = (RAY_R.redes || []).find(x => x.n === (n || 1)); return !r || !r.abre || r.abre <= RAY_HOY; }
function rayOpciones(s){ return s.opciones.filter(o => !o.red || rayRedAbierta(o.red)); }
function rayEstaciones(){ return Object.entries(RAY_R.estaciones).filter(([, s]) => rayRedAbierta(s.red)); }
function rayTerminales(){ const dest = new Set(); rayEstaciones().forEach(([, s]) => rayOpciones(s).forEach(o => dest.add(o.to))); return Object.entries(RAY_R.terminales).filter(([k]) => dest.has("F" + k)); }
function rayVisitadas(){ const s = new Set(); (rayData().viajes || []).forEach(v => (v.ruta || []).forEach(n => s.add(n))); ray.ruta.forEach(n => s.add(n)); return s; }
function rayFinales(){ const s = new Set(); (rayData().viajes || []).forEach(v => { if (v.t) s.add(v.t); }); return s; }
/* tensiones: la marca m (recién elegida) choca con alguna respuesta anterior (prev = ray.elec)? → [{t, js:[índices en prev]}] */
function rayTensHits(m, prev){
  if (!m) return [];
  return (RAY_R.tensiones || []).map(t => {
    const otro = t.a.includes(m) ? t.b : t.b.includes(m) ? t.a : null;
    const js = otro ? prev.map((e, j) => otro.includes(e.marca) ? j : -1).filter(j => j >= 0) : [];
    return js.length ? { t, js } : null;
  }).filter(Boolean);
}
function rayTension(id){ return (RAY_R.tensiones || []).find(t => t.id === id); }
function rayGrado(t){ return t.grado === "contradiccion" ? RAY_TXT.contradiccion : RAY_TXT.tension; }
function rayResp(e){ return '<li><span class="ray-badge sm">' + rayEsc(e.n) + '</span> «' + rayEsc(e.t) + '»</li>'; }
/* bloque de una tensión: grado, título, respuestas anteriores → respuesta nueva, explicación */
function rayTensBloque(t, js, nueva, elec){
  return '<div class="ray-tens ' + t.grado + '"><span class="ray-grado">' + rayGrado(t) + '</span><h3>' + rayEsc(t.titulo) + '</h3>' +
    '<p class="ray-tl">' + RAY_TXT.antes + '</p><ul>' + js.map(j => rayResp(elec[j])).join("") + '</ul>' +
    (nueva ? '<p class="ray-tl">' + RAY_TXT.ahora + '</p><ul>' + rayResp(nueva) + '</ul>' : "") +
    '<p>' + rayEsc(t.texto) + '</p></div>';
}

/* ---------- plano del recorrido ---------- */
/* Esquema del recorrido (no de la red): las estaciones del viaje se dibujan de arriba abajo, en orden,
   como una línea de metro; cada línea de color tiene su carril, así que al cambiar de línea el trazado
   se desvía en diagonal. No usa las coordenadas de la red: el jugador no puede deducir el plano completo. */
function rayMapa(via){
  const R = RAY_R, DY = 62, DX = 58, X0 = 34, Y0 = 34;
  const ruta = (via && via.ruta) || [], fin = via && via.fin, nodos = ruta.concat(fin ? ["F" + fin] : []);
  if (!nodos.length) return '<p class="ray-empty">' + RAY_TXT.sinViajes + '</p>';
  const carril = {}; let nC = 0;
  const pos = nodos.map((n, i) => {
    const s = R.estaciones[n], lin = s ? (s.tipo === "contradiccion" ? "l-contradiccion" : s.linea) : "fin";
    if (!(lin in carril)) carril[lin] = (nC++) % 4;
    return [X0 + carril[lin] * DX, Y0 + i * DY];
  });
  const actual = nodos.length - 1, maxX = Math.max(...pos.map(p => p[0]));
  const seg = (a, b) => { const [x1, y1] = a, [x2, y2] = b, d = Math.abs(x2 - x1), ym = y2 - Math.min(d, y2 - y1);
    return "M" + x1 + " " + y1 + " L" + x1 + " " + ym + " L" + x2 + " " + y2; };
  let edges = "", nodes = "";
  for (let i = 1; i < nodos.length; i++){
    const s = R.estaciones[nodos[i - 1]], o = (s.opciones || []).find(x => x.to === nodos[i]) || {};
    edges += '<path class="ray-e now' + (o.red ? " tr" : "") + '" d="' + seg(pos[i - 1], pos[i]) + '" stroke="' + (s.tipo === "contradiccion" ? "#d23a2b" : rayLinea(s.linea)) + '"/>';
  }
  nodos.forEach((n, i) => {
    const [x, y] = pos[i], lx = maxX + 30;
    if (/^F/.test(n)){
      const k = n.slice(1), t = R.terminales[k];
      nodes += '<g class="ray-term vis cur"><rect x="' + (x - 17) + '" y="' + (y - 17) + '" width="34" height="34" rx="8"/>' +
        '<text class="ray-num" x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + k + '</text>' +
        '<text class="ray-lbl fin" x="' + lx + '" y="' + (y + 5) + '">' + rayEsc(t.titulo) + '</text></g>';
      return;
    }
    const s = R.estaciones[n], c = s.tipo === "contradiccion" ? "#d23a2b" : rayLinea(s.linea);
    nodes += '<g class="ray-st vis' + (i === actual ? " cur" : "") + '">' + (i === actual ? '<circle class="ray-halo" cx="' + x + '" cy="' + y + '" r="24" stroke="' + c + '"/>' : "") +
      '<circle cx="' + x + '" cy="' + y + '" r="16" stroke="' + c + '" fill="' + c + '"/>' +
      '<text class="ray-num" x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle">' + rayEsc(n) + '</text>' +
      '<text class="ray-lbl" x="' + lx + '" y="' + (y + 5) + '">' + rayEsc(s.titulo.replace(/^[^:]*:\s*/, "")) + '</text></g>';
  });
  const W = maxX + 30 + 300, H = Y0 + (nodos.length - 1) * DY + 34;
  return '<svg class="ray-map ruta" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + W + 'px" role="img" aria-label="' + rayEsc(RAY_TXT.mapaAria) + '">' + edges + nodes + '</svg>';
}
/* Todas las paradas (25-09): une los recorridos de todos los viajes guardados. Solo aparecen las estaciones
   visitadas y los tramos recorridos (grosor = veces). Como la red no tiene bucles, cada estación va en la fila
   de su camino más largo dentro de lo visitado; cada línea tiene su carril (si dos coinciden, la siguiente libre). */
function rayTodas(){
  const R = RAY_R, cnt = {}, ed = {};
  (rayData().viajes || []).forEach(v => {
    const ns = (v.ruta || []).filter(n => R.estaciones[n]).concat(v.t && R.terminales[v.t] ? ["F" + v.t] : []);
    ns.forEach((n, i) => { cnt[n] = (cnt[n] || 0) + 1; if (i){ const k = ns[i - 1] + ">" + n; ed[k] = (ed[k] || 0) + 1; } });
  });
  return { cnt, ed };
}
function rayMapaTodas(){
  const R = RAY_R, { cnt, ed } = rayTodas(), nodos = Object.keys(cnt);
  if (!nodos.length) return '<p class="ray-empty">' + RAY_TXT.sinViajes + '</p>';
  const DY = 52, DX = 46, X0 = 30, Y0 = 30, pred = {};
  Object.keys(ed).forEach(k => { const [a, b] = k.split(">"); (pred[b] = pred[b] || []).push(a); });
  const prof = {}, dep = n => prof[n] != null ? prof[n] : (prof[n] = Math.max(0, ...(pred[n] || []).map(p => dep(p) + 1)));
  const carril = n => { const s = R.estaciones[n]; return s ? (s.tipo === "contradiccion" ? "l-contradiccion" : s.linea) : "fin"; };
  const orden = R.lineas.map(l => l.id).concat(["fin"]), usados = orden.filter(l => nodos.some(n => carril(n) === l));
  const pos = {}, ocup = {};
  nodos.sort((a, b) => dep(a) - dep(b) || usados.indexOf(carril(a)) - usados.indexOf(carril(b))).forEach(n => {
    const d = dep(n); let c = usados.indexOf(carril(n));
    while ((ocup[d] = ocup[d] || new Set()).has(c)) c++;
    ocup[d].add(c); pos[n] = [X0 + c * DX, Y0 + d * DY];
  });
  let edges = "", nodes = "";
  Object.entries(ed).forEach(([k, c]) => {
    const [a, b] = k.split(">"), [x1, y1] = pos[a], [x2, y2] = pos[b], s = R.estaciones[a], o = (s.opciones || []).find(x => x.to === b) || {};
    const h = (y2 - y1) * 0.55;
    edges += '<path class="ray-e now' + (o.red ? " tr" : "") + '" style="stroke-width:' + Math.min(4 + 2 * c, 14) + 'px" d="M' + x1 + " " + y1 + " C" + x1 + " " + (y1 + h) + " " + x2 + " " + (y2 - h) + " " + x2 + " " + y2 +
      '" stroke="' + (s.tipo === "contradiccion" ? "#d23a2b" : rayLinea(s.linea)) + '"/>';
  });
  nodos.forEach(n => {
    const [x, y] = pos[n];
    if (/^F/.test(n)){
      const k = n.slice(1);
      nodes += '<g class="ray-term vis"><title>' + rayEsc(R.terminales[k].titulo) + ' (' + cnt[n] + ')</title><rect x="' + (x - 17) + '" y="' + (y - 17) + '" width="34" height="34" rx="8"/>' +
        '<text class="ray-num" x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + k + '</text></g>';
      return;
    }
    const s = R.estaciones[n], c = s.tipo === "contradiccion" ? "#d23a2b" : rayLinea(s.linea);
    nodes += '<g class="ray-st vis"><title>' + rayEsc(n + " · " + s.titulo) + ' (' + cnt[n] + ')</title><circle cx="' + x + '" cy="' + y + '" r="16" stroke="' + c + '" fill="' + c + '"/>' +
      '<text class="ray-num" x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle">' + rayEsc(n) + '</text></g>';
  });
  const W = Math.max(...Object.values(pos).map(p => p[0])) + 30, H = Math.max(...Object.values(pos).map(p => p[1])) + 30;
  return '<svg class="ray-map ruta todas" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + W + 'px" role="img" aria-label="' + rayEsc(RAY_TXT.todasPlano) + '">' + edges + nodes + '</svg>';
}
/* lista de todas las paradas, agrupadas por línea (y las terminales aparte) */
function rayListaTodas(){
  const R = RAY_R, { cnt } = rayTodas(), ns = Object.keys(cnt).filter(n => R.estaciones[n]);
  const grupos = R.lineas.map(l => [l, ns.filter(n => (R.estaciones[n].tipo === "contradiccion" ? "l-contradiccion" : R.estaciones[n].linea) === l.id)]).filter(([, g]) => g.length);
  const li = (badge, txt, c) => '<li>' + badge + ' ' + rayEsc(txt) + (c > 1 ? ' <small>× ' + c + ' ' + RAY_TXT.veces + '</small>' : '') + '</li>';
  const fins = Object.keys(cnt).filter(n => /^F/.test(n));
  return '<div class="ray-box"><b>' + RAY_TXT.todasTit + '</b><p>' + RAY_TXT.todasAyuda + '</p>' +
    grupos.map(([l, g]) => '<p class="ray-tl"><i class="ray-lin" style="background:' + l.color + '"></i>' + rayEsc(l.nombre) + '</p><ul class="ray-todas">' +
      g.sort((a, b) => +a - +b).map(n => li('<span class="ray-badge sm" style="background:' + l.color + '">' + rayEsc(n) + '</span>', R.estaciones[n].titulo.replace(/^[^:]*:\s*/, ""), cnt[n])).join("") + '</ul>').join("") +
    (fins.length ? '<p class="ray-tl">' + RAY_TXT.terminales + '</p><ul class="ray-todas">' + fins.sort((a, b) => a.length - b.length || a.localeCompare(b)).map(n => li('<span class="ray-badge sm term">' + n.slice(1) + '</span>', R.terminales[n.slice(1)].titulo, cnt[n])).join("") + '</ul>' : '') + '</div>';
}
function rayLeyenda(via){
  const usadas = new Set((via && via.todas ? Object.keys(rayTodas().cnt) : (via && via.ruta) || []).map(n => RAY_R.estaciones[n] && RAY_R.estaciones[n].linea));
  const ls = RAY_R.lineas.filter(l => usadas.has(l.id));
  return ls.length ? '<div class="ray-legend"><b>' + RAY_TXT.leyenda + '</b>' + ls.map(l => '<span><i style="background:' + l.color + '"></i>' + rayEsc(l.nombre) + '</span>').join("") + '</div>' : "";
}

/* ---------- pantallas ---------- */
function rayLayout(main, via){
  const box = rayBox(); if (!box) return;
  const v = via || { ruta: ray.ruta, fin: ray.fin };
  const tit = v.todas ? RAY_TXT.todasPlano : RAY_TXT.plano;
  box.innerHTML = '<div class="ray-wrap"><div class="ray-main">' + main + '</div><aside class="ray-side" aria-label="' + rayEsc(tit) + '"><p class="ray-side-t">' + tit + '</p>' + (v.todas ? rayMapaTodas() : rayMapa(v)) + rayLeyenda(v) + '</aside></div>';
}
function rayStats(){
  const d = rayData();
  return '<p class="ray-stats">' + RAY_TXT.viajes + ' <b>' + (d.viajes || []).length + '</b> · ' + RAY_TXT.finales + ' <b>' + rayFinales().size + ' / ' + rayTerminales().length + '</b> · ' +
    RAY_TXT.estaciones + ' <b>' + [...rayVisitadas()].filter(n => RAY_R.estaciones[n]).length + ' / ' + rayEstaciones().length + '</b></p>';
}
function renderRayPortada(){
  ray.modo = "portada"; ray.ruta = []; ray.elec = []; ray.tens = []; ray.fin = null;
  rayLayout('<p class="ray-intro">' + RAY_TXT.intro + '</p>' + rayStats() +
    '<div class="ray-actions"><button class="ray-btn" id="raygo">' + RAY_TXT.iniciar + '</button><button class="pbtn" id="rayplano">' + RAY_TXT.miPlano + '</button></div>', (() => { const vs = rayData().viajes || []; const u = vs[vs.length - 1]; return u ? { ruta: u.ruta, fin: u.t } : null; })());
  rayBox().querySelector("#raygo").addEventListener("click", rayIniciar);
  rayBox().querySelector("#rayplano").addEventListener("click", renderRayPlano);
}
/* estación de salida al azar (25-09): entre las «inicios» de redes abiertas, sin repetir la del último viaje */
function raySalida(){
  const R = RAY_R, vs = rayData().viajes || [], ult = vs.length ? (vs[vs.length - 1].ruta || [])[0] : null;
  let ps = (R.inicios || [R.inicio]).filter(n => R.estaciones[n] && rayRedAbierta(R.estaciones[n].red));
  if (ps.length > 1) ps = ps.filter(n => n !== ult);
  return ps.length ? ps[Math.floor(Math.random() * ps.length)] : R.inicio;
}
function rayIniciar(){ ray.modo = "viaje"; ray.ruta = [raySalida()]; ray.elec = []; ray.tens = []; ray.fin = null; renderRayEstacion(); }
/* registra la elección (y las tensiones que asume) y avanza a la siguiente estación o a la terminal */
function rayAvanzar(nueva, o, hits){
  ray.elec.push(nueva);
  const i = ray.elec.length - 1;
  hits.forEach(h => ray.tens.push({ id: h.t.id, i: i, js: h.js }));
  if (/^F[A-Z]{1,2}$/.test(o.to)){ ray.fin = o.to.slice(1); rayTerminar(); }
  else { ray.ruta.push(o.to); renderRayEstacion(); }
  const v = document.getElementById("rayuela"); if (v && v.getBoundingClientRect().top < 0) v.scrollIntoView({ block: "start" });
}
/* alerta de coherencia: la respuesta recién elegida choca con otra anterior del mismo viaje */
function renderRayAviso(nueva, o, hits){
  const previas = [...new Set(hits.flatMap(h => h.js))].sort((x, y) => x - y);
  rayLayout('<button class="linkbtn ray-back" id="rayquit">' + RAY_TXT.abandonar + '</button>' +
    '<article class="ray-card aviso" style="--lc:#d23a2b">' +
      '<div class="ray-kick"><span class="ray-badge">⚡</span>' + RAY_TXT.aviso + '</div>' +
      hits.map(h => rayTensBloque(h.t, h.js, nueva, ray.elec)).join("") +
      '<p class="ray-q">' + RAY_TXT.queHaces + '</p><div class="ray-opts">' +
        '<button class="ray-opt" data-a="repensar"><span class="ray-n">↺</span><span>' + RAY_TXT.repensar + '</span></button>' +
        previas.map(j => '<button class="ray-opt" data-a="rect" data-j="' + j + '"><span class="ray-n">↩</span><span>' + RAY_TXT.rectificar +
          ' <span class="ray-badge sm">' + rayEsc(ray.elec[j].n) + '</span> «' + rayEsc(ray.elec[j].t) + '»</span></button>').join("") +
        '<button class="ray-opt" data-a="mantener"><span class="ray-n">→</span><span>' + RAY_TXT.mantener + '</span></button>' +
      '</div></article>');
  const box = rayBox();
  box.querySelector("#rayquit").addEventListener("click", renderRayPortada);
  box.querySelector('[data-a="repensar"]').addEventListener("click", renderRayEstacion);
  box.querySelector('[data-a="mantener"]').addEventListener("click", () => rayAvanzar(nueva, o, hits));
  box.querySelectorAll('[data-a="rect"]').forEach(b => b.addEventListener("click", () => {
    const j = +b.dataset.j;   // vuelve a la estación de aquella respuesta y la deshace (no es un bucle de la red: es deshacer)
    ray.elec = ray.elec.slice(0, j); ray.ruta = ray.ruta.slice(0, j + 1); ray.tens = ray.tens.filter(x => x.i < j);
    renderRayEstacion();
  }));
}

function renderRayEstacion(){
  const n = ray.ruta[ray.ruta.length - 1], s = RAY_R.estaciones[n];
  const ops = rayOpciones(s);
  const kick = s.tipo === "vida" ? RAY_TXT.vida : s.tipo === "contradiccion" ? RAY_TXT.contradiccion : RAY_TXT.pregunta;
  let choque = "";
  if (s.tipo === "contradiccion"){
    // respuestas que chocan: las de la lista «choque» de la estación y, si la última respuesta abrió además
    // alguna tensión con otra anterior, también esa otra (antes solo se veía la última frase, sin su contraria)
    const ult = ray.elec.length - 1, tens = ray.tens.filter(x => x.i === ult);
    const idx = new Set(ray.elec.map((e, j) => e.marca && (s.choque || []).includes(e.marca) ? j : -1).filter(j => j >= 0).slice(-3));
    tens.forEach(x => x.js.forEach(j => idx.add(j)));
    if (ult >= 0) idx.add(ult);
    const lst = [...idx].sort((x, y) => x - y).map(j => ray.elec[j]);
    if (lst.length > 1 || (s.choque || []).includes(lst[0] && lst[0].marca)) choque = '<div class="ray-choque"><b>' + RAY_TXT.chocan + '</b><ul>' + lst.map(rayResp).join("") + '</ul></div>';
    choque += tens.map(x => { const t = rayTension(x.id); return t ? '<p class="ray-tl ray-ademas">' + RAY_TXT.ademas + '</p>' + rayTensBloque(t, x.js, null, ray.elec) : ""; }).join("");
  }
  rayLayout('<button class="linkbtn ray-back" id="rayquit">' + RAY_TXT.abandonar + '</button>' +
    '<article class="ray-card ' + s.tipo + '" style="--lc:' + rayLinea(s.linea) + '">' +
      '<div class="ray-kick"><span class="ray-badge">' + rayEsc(n) + '</span>' + kick + '</div>' +
      (ray.ruta.length === 1 && n !== RAY_R.inicio ? '<p class="ray-salida">' + RAY_TXT.salida + '</p>' : '') +
      '<h2>' + rayEsc(s.titulo) + '</h2><p class="ray-text">' + rayEsc(s.texto) + '</p>' + choque +
      '<p class="ray-q">' + rayEsc(s.pregunta) + '</p>' +
      '<div class="ray-opts">' + ops.map((o, i) => '<button class="ray-opt' + (o.red ? ' tr' : '') + '" data-i="' + i + '"><span class="ray-n">' + (o.red ? '⇄' : (i + 1)) + '</span><span>' + (o.red ? '<small class="ray-tr">' + RAY_TXT.transbordo + ' · ' + rayEsc(((RAY_R.redes || []).find(r => r.n === o.red) || {}).nombre || '') + '</small>' : '') + rayEsc(o.t) + '</span></button>').join("") + '</div>' +
    '</article>');
  rayBox().querySelector("#rayquit").addEventListener("click", renderRayPortada);
  rayBox().querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => {
    const o = ops[+b.dataset.i], nueva = { n: n, t: o.t, marca: o.marca || null };
    const hits = rayTensHits(nueva.marca, ray.elec).filter(h => !ray.tens.some(x => x.id === h.t.id));   // cada tensión, una vez por viaje
    const dest = RAY_R.estaciones[o.to];
    // si la opción ya lleva a una estación de contradicción, la tensión se enseña allí (sin alerta intermedia)
    if (hits.length && !(dest && dest.tipo === "contradiccion")){
      renderRayAviso(nueva, o, hits);
      const v = document.getElementById("rayuela"); if (v && v.getBoundingClientRect().top < 0) v.scrollIntoView({ block: "start" });
    } else rayAvanzar(nueva, o, hits);
  }));
}

function rayTerminar(){
  const d = rayData(), antes = rayFinales();
  d.viajes = (d.viajes || []).concat([{ f: new Date().toISOString().slice(0, 10), ruta: ray.ruta.slice(), t: ray.fin, tens: ray.tens.map(x => x.id) }]).slice(-60);
  raySave(d);
  renderRayFinal(!antes.has(ray.fin));
}
function rayLinks(autores, temas){
  const I = typeof ILUSTRES !== "undefined" ? ILUSTRES : {}, TH = typeof THEORY !== "undefined" ? THEORY : {};
  const a = (autores || []).filter(x => I[x.id]).map(x => '<a href="#ilustres/' + x.id + '">' + rayEsc(I[x.id].name) + '</a>');
  const t = (temas || []).filter(k => TH[k]).map(k => '<a href="#teoria/' + k + '">' + rayEsc(TH[k].title) + '</a>');
  return (a.length ? '<p class="ray-links"><b>' + RAY_TXT.coinciden + ':</b> ' + a.join(" · ") + '</p>' : "") +
         (t.length ? '<p class="ray-links"><b>' + RAY_TXT.estudia + ':</b> ' + t.join(" · ") + '</p>' : "");
}
function renderRayFinal(esNuevo){
  const k = ray.fin, t = RAY_R.terminales[k], d = rayData(), refl = (d.refl || {})[k] || "";
  const total = Object.keys(RAY_R.terminales).length, got = rayFinales().size;
  rayLayout('<article class="ray-card final">' +
      '<div class="ray-kick"><span class="ray-badge term">' + k + '</span>' + RAY_TXT.final + (esNuevo ? ' <span class="ray-new">' + RAY_TXT.nuevo + '</span>' : "") + '</div>' +
      '<h2>' + rayEsc(t.titulo) + '</h2><p class="ray-text">' + rayEsc(t.texto) + '</p>' + rayLinks(t.autores, t.temas) +
      '<div class="ray-box"><b>' + RAY_TXT.abierto + '</b><p>' + rayEsc(t.abierto) + '</p></div>' +
      '<div class="ray-box pau"><b>' + RAY_TXT.paraPau + '</b><p>' + rayEsc(t.reflexion) + '</p>' +
        '<textarea id="rayrefl" rows="6" placeholder="' + rayEsc(RAY_TXT.tuTexto) + '">' + rayEsc(refl) + '</textarea><small id="raywc"></small></div>' +
      (ray.tens.length ? '<div class="ray-box tens"><b>' + RAY_TXT.tensViaje + '</b><p>' + RAY_TXT.tensPau + '</p>' +
        ray.tens.map(x => { const t = rayTension(x.id); return t ? rayTensBloque(t, x.js, ray.elec[x.i], ray.elec) : ""; }).join("") + '</div>' : "") +
      '<div class="ray-box"><b>' + RAY_TXT.recorrido + '</b><ol class="ray-ruta">' + ray.elec.map(e => '<li><span class="ray-badge sm">' + rayEsc(e.n) + '</span> ' + rayEsc(RAY_R.estaciones[e.n].titulo) + ' — «' + rayEsc(e.t) + '»</li>').join("") + '</ol></div>' +
      '<p class="ray-stats">' + (got === total ? RAY_TXT.todos : RAY_TXT.finales + ' <b>' + got + ' / ' + total + '</b>') + '</p>' +
      '<div class="ray-actions"><button class="ray-btn" id="raygo">' + RAY_TXT.otroViaje + '</button><button class="pbtn" id="rayplano">' + RAY_TXT.miPlano + '</button></div>' +
    '</article>');
  const ta = rayBox().querySelector("#rayrefl"), wc = rayBox().querySelector("#raywc");
  const count = () => { const w = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; wc.textContent = w + " " + RAY_TXT.palabras; };
  count();
  ta.addEventListener("input", () => { const d2 = rayData(); d2.refl = d2.refl || {}; d2.refl[k] = ta.value; raySave(d2); count(); });
  rayBox().querySelector("#raygo").addEventListener("click", rayIniciar);
  rayBox().querySelector("#rayplano").addEventListener("click", renderRayPlano);
}

function renderRayPlano(sel){
  ray.modo = "plano"; ray.ruta = []; ray.elec = []; ray.tens = []; ray.fin = null;
  const d = rayData(), fins = rayFinales(), viajes = (d.viajes || []).slice().reverse();
  const todas = sel === "todas" && viajes.length > 0;
  sel = todas ? -1 : Math.max(0, Math.min(+sel || 0, viajes.length - 1));
  const via = todas ? { todas: true } : viajes.length ? { ruta: viajes[sel].ruta, fin: viajes[sel].t } : null;
  const caidas = {}; (d.viajes || []).forEach(v => (v.ruta || []).forEach(n => { const s = RAY_R.estaciones[n]; if (s && s.tipo === "contradiccion") caidas[n] = (caidas[n] || 0) + 1; }));
  const tcaidas = {}; (d.viajes || []).forEach(v => (v.tens || []).forEach(id => { if (rayTension(id)) tcaidas[id] = (tcaidas[id] || 0) + 1; }));
  const term = rayTerminales().map(([k, t]) => '<div class="ray-tcard' + (fins.has(k) ? " got" : "") + '"><span class="ray-badge term">' + k + '</span>' +
    (fins.has(k) ? rayEsc(t.titulo) : '<i>' + RAY_TXT.sinDescubrir + '</i>') + '</div>').join("");
  rayLayout('<button class="linkbtn ray-back" id="rayback">' + RAY_TXT.volver + '</button><h2 class="ray-h">' + RAY_TXT.miPlano + '</h2>' + rayStats() +
    '<div class="ray-tgrid">' + term + '</div>' +
    (Object.keys(caidas).length + Object.keys(tcaidas).length ? '<div class="ray-box"><b>' + RAY_TXT.caidas + '</b><ul>' + Object.entries(caidas).map(([n, c]) => '<li><span class="ray-badge sm contra">' + n + '</span> ' + rayEsc(RAY_R.estaciones[n].titulo.replace(/^[^:]*:\s*/, "")) + ' × ' + c + '</li>').join("") +
      Object.entries(tcaidas).map(([id, c]) => '<li><span class="ray-badge sm contra">⚡</span> ' + rayEsc(rayTension(id).titulo) + ' × ' + c + '</li>').join("") + '</ul></div>' : "") +
    (viajes.length ? '<p class="ray-actions"><button class="ray-vbtn todas' + (todas ? ' sel' : '') + '" data-v="todas">' + RAY_TXT.todas + '</button></p>' : '') +
    (todas ? rayListaTodas() : '') +
    '<div class="ray-box"><b>' + RAY_TXT.ultimos + '</b>' + (viajes.length ? '<ol class="ray-viajes">' + viajes.slice(0, 12).map((v, i) => '<li><button class="ray-vbtn' + (i === sel ? ' sel' : '') + '" data-v="' + i + '" title="' + RAY_TXT.verViaje + '"><span class="ray-date">' + rayEsc(v.f) + '</span> ' + (v.ruta || []).map(n => '<span class="ray-badge sm">' + rayEsc(n) + '</span>').join("") + ' → <span class="ray-badge sm term">' + rayEsc(v.t) + '</span> ' + rayEsc((RAY_R.terminales[v.t] || {}).titulo || "") + '</button></li>').join("") + '</ol>' : '<p>' + RAY_TXT.ninguno + '</p>') + '</div>' +
    '<div class="ray-actions"><button class="ray-btn" id="raygo">' + RAY_TXT.iniciar + '</button><button class="linkbtn" id="rayreset">' + RAY_TXT.borrar + '</button></div>', via);
  rayBox().querySelector("#rayback").addEventListener("click", renderRayPortada);
  rayBox().querySelector("#raygo").addEventListener("click", rayIniciar);
  rayBox().querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => renderRayPlano(b.dataset.v === "todas" ? "todas" : +b.dataset.v)));
  rayBox().querySelector("#rayreset").addEventListener("click", () => { if (confirm(RAY_TXT.seguro)){ raySave({}); renderRayPlano(); } });
}

if (RAY_R && RAY_R.txt) Object.assign(RAY_TXT, RAY_R.txt);
if (rayBox() && RAY_R) renderRayPortada();
