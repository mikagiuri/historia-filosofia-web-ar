"use strict";
/* ===== Cronogramas ===== depende de: data cronogramas.js (CRONOGRAMAS) =====
   Renderiza cada cronograma del libro (LTFH, euskera) como línea de tiempo SVG:
   carriles con rango de años (vidas/periodos) sobre un eje temporal, o secuencia de épocas. */

let cronoBlock = null;      // A / B / C / "otros"
let cronoId = null;
/* Título descriptivo: usa el override de cronogramas_titulos.js si existe, si no el del dato. */
function cronoTitle(c){ return (typeof CRONO_TITULOS !== "undefined" && CRONO_TITULOS[c.id]) || c.title; }

function cronoOf(code){ const ch = (code || "").trim().charAt(0).toUpperCase(); return "ABC".includes(ch) ? ch : "·"; }
/* (24-09) el eje cronológico del curso (eje_cronologico.js, solo HF) va primero y es la portada de la sección */
const EJE_ID = "eje";
function hasEje(){ return typeof EJE_CRONOLOGICO !== "undefined"; }
function cronoBlocksPresent(){ return (hasEje() ? [EJE_ID] : []).concat([...new Set(CRONOGRAMAS.map(c => cronoOf(c.code)))]); }
function cronoList(block){ return CRONOGRAMAS.filter(c => cronoOf(c.code) === block); }

const CRONO_BLOCK_NAME = { A: "المحور A · القديمة والوسيطة", B: "المحور B · الحديثة", C: "المحور C · المعاصرة", "·": "أخرى" };
function cronoBlockName(b){ return b === EJE_ID ? EJE_CRONOLOGICO.txt.filtro : CRONO_BLOCK_NAME[b]; }

/* ---------- año → texto (a.C. = antes de Cristo) ----------
   (24-09) el formato va en una plantilla para que el diccionario de interfaz pueda
   reordenarlo en euskera («{n} a.C.» → «K.a. {n}»). */
const CRONO_AC = "{n} ق.م";
/* (29-09) cronogramas con «groups» (escuelas): color por escuela y botones para mostrar u ocultar
   cada una; con «periods», otra fila de botones por periodo (cronoHidden guarda «g:n» y «p:n»; se reinicia
   al cambiar de cronograma). Se ve un pensador si su escuela y su periodo están activos. «fl.» = floruit */
const CRONO_GRP_COLORS = ["#2e9e6b", "#7fb069", "#e0a526", "#b44fc4", "#3fa7c9", "#a8b82e", "#9a7b5f", "#2f6fd6", "#7b61d9", "#e377c2", "#d95f02", "#54a24b", "#c0392b"];
/* (30-09) un grupo puede traer su «color» (p. ej. var(--e-ant): épocas con los colores de Ilustres) */
function cronoGrpColor(k, g){ return (g && g.color) || CRONO_GRP_COLORS[k % CRONO_GRP_COLORS.length]; }
let cronoHidden = new Set(), cronoHiddenFor = null;
const CRONO_FL = "fl. ";
const CRONO_FL_NOTE = "fl. = فترة النشاط (لا تُعرف تواريخ حياته)";
function cronoBC(n){ return CRONO_AC.replace("{n}", n); }
function cronoYear(y){ if (y == null) return ""; return y < 0 ? cronoBC(-y) : "" + y; }
function cronoRange(s, e){ if (s == null || e == null) return "";
  if (s < 0 && e < 0) return cronoBC((-s) + "–" + (-e));
  if (s < 0 && e >= 0) return cronoBC(-s) + "–" + e;
  return s + "–" + e; }
function niceStep(span){ const steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000];
  for (const s of steps) if (span / s <= 9) return s; return 1000; }

/* ---------- filtros ---------- */
function renderCronoFilter(){
  const box = document.getElementById("cronofilter"); if (!box) return;
  const present = cronoBlocksPresent();
  if (!present.includes(cronoBlock)) cronoBlock = present[0];
  box.innerHTML = '<span class="flabel">المحور</span>' + present.map(b =>
    '<button class="cbtn' + (b === EJE_ID ? ' cbtn-eje' : '') + '" data-cblock="' + b + '" aria-pressed="' + (b === cronoBlock) + '">' +
    (b === EJE_ID ? '<span aria-hidden="true">★ </span>' : '') + escapeCrono(cronoBlockName(b)) + '</button>').join("");
  // los clics pasan por loadCrono para que el enlace #cronogramas/<clave> siga a la selección
  box.querySelectorAll("[data-cblock]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.cblock;
    if (k === EJE_ID) loadCrono(EJE_ID);
    else { const l = cronoList(k); if (l.length) loadCrono(l[0].id); }
  }));
}

function renderCronoChips(){
  const box = document.getElementById("cronochips"); if (!box) return;
  if (cronoBlock === EJE_ID){ box.innerHTML = ""; box.hidden = true; return; }
  box.hidden = false;
  const list = cronoList(cronoBlock);
  if (!list.some(c => c.id === cronoId)) cronoId = list.length ? list[0].id : null;
  box.innerHTML = list.map(c =>
    '<button class="chip" data-crono="' + c.id + '" aria-pressed="' + (c.id === cronoId) + '">' + cronoTitle(c) + '</button>').join("");
  box.querySelectorAll("[data-crono]").forEach(b => b.addEventListener("click", () => loadCrono(b.dataset.crono)));
}

/* ---------- dibujo ---------- */
function drawCrono(){
  const box = document.getElementById("cronobox"); if (!box) return;
  if (cronoBlock === EJE_ID){ box.innerHTML = ejeCard(EJE_CRONOLOGICO); return; }
  const c = CRONOGRAMAS.find(x => x.id === cronoId);
  if (!c){ box.innerHTML = '<p class="lead">اختاروا جدولًا زمنيًا.</p>'; return; }
  const span = (c.type === "timeline" && c.start != null && c.end != null) ? (cronoYear(c.start) + " – " + cronoYear(c.end)) : "";
  box.innerHTML = '<div class="crono-card"><div class="crono-h"><h2 class="crono-title">' + cronoTitle(c) + '</h2>' +
    (span ? '<span class="crono-span">' + span + '</span>' : '') + '</div>' +
    (c.type === "timeline" ? cronoSvg(c) : cronoEpochs(c)) + '</div>';
}

function cronoSvg(c){
  let axes = (c.axes || []).filter(a => a.name);
  let start = c.start, end = c.end;
  // encuadrar por si la escala no cubre todos los carriles
  axes.forEach(a => { if (a.start != null) start = Math.min(start, a.start); if (a.end != null) end = Math.max(end, a.end); });
  if (start == null || end == null || end <= start){ return '<p class="lead">—</p>'; }
  // orden cronológico (por año de inicio, luego de fin): la línea se lee de arriba a abajo en el tiempo
  const key = v => (v == null ? 1e9 : v);
  axes = axes.slice().sort((a, b) => (c.porGrupo ? key(a.grp) - key(b.grp) : 0) || key(a.start) - key(b.start) || key(a.end) - key(b.end));   // (01-10) «porGrupo»: filas juntas por grupo (p. ej. por países)
  // (29-09) con escuelas (c.groups) y periodos (c.periods): solo lo activo
  const grps = c.groups || null, pers = c.periods || null;
  if (cronoHiddenFor !== c.id){ cronoHidden = new Set(); cronoHiddenFor = c.id; }
  const hasFl = axes.some(a => a.fl);
  const total = axes.length;
  axes = axes.filter(a => !(grps && cronoHidden.has("g:" + a.grp)) && !(pers && cronoHidden.has("p:" + a.per)));
  // (07-10) con algo oculto, la escala se ajusta a lo visible (redondeada al paso del eje); con todo visible, la de siempre
  if (axes.length && axes.length < total){
    let vs = Infinity, ve = -Infinity;
    axes.forEach(a => { if (a.start != null){ vs = Math.min(vs, a.start); ve = Math.max(ve, a.end != null ? a.end : a.start); } });
    if (isFinite(vs)){
      const st = niceStep(Math.max(ve - vs, 10));
      // redondeado al paso, pero sin salirse del intervalo completo (p. ej. no pasar de hoy)
      const s0 = start, e0 = end;
      start = Math.max(s0, Math.floor(vs / st) * st); end = Math.min(e0, Math.ceil(ve / st) * st);
      if (end <= start){ start = s0; end = e0; }
    }
  }
  const legend = (pers ? cronoLegend("p", CRONO_PERIODOS, pers, CRONO_TODOS, CRONO_NINGUNO) : "") +
    (grps ? cronoLegend("g", c.groupsLabel || (grps.some(g => g.color) ? CRONO_EPOCAS : CRONO_ESCUELAS), grps, CRONO_TODAS, CRONO_NINGUNA) : "");   // (01-10) «groupsLabel»: rótulo propio de la leyenda
  if (!axes.length) return legend + '<p class="lead crono-none">' + CRONO_NONE + '</p>';

  const W = 960, gutter = 186, padR = 26, padTop = 40, rowH = 30, barH = 18;
  const H = padTop + axes.length * rowH + 16;
  const x0 = gutter, x1 = W - padR;
  const xOf = y => x0 + (y - start) / (end - start) * (x1 - x0);

  let svg = '<svg class="crono-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + cronoTitle(c).replace(/"/g, "") + '">';
  // bandas alternas por periodo + rejilla + años (orientación temporal)
  const step = niceStep(end - start);
  const first = Math.ceil(start / step) * step;
  let band = 0;
  for (let y = first; y <= end; y += step){
    const x = xOf(y), xPrev = Math.max(x0, xOf(y - step));
    if (band % 2 === 0 && x - xPrev > 0)
      svg += '<rect class="band" x="' + xPrev.toFixed(1) + '" y="' + (padTop - 8) + '" width="' + (x - xPrev).toFixed(1) + '" height="' + (H - padTop) + '"/>';
    band++;
    svg += '<line class="grid" x1="' + x.toFixed(1) + '" y1="' + (padTop - 8) + '" x2="' + x.toFixed(1) + '" y2="' + (H - 8) + '"/>';
    svg += '<text class="tick-lbl" x="' + x.toFixed(1) + '" y="' + (padTop - 12) + '" text-anchor="middle">' + cronoYear(y) + '</text>';
  }
  // línea del año 0 si el rango la cruza
  if (start < 0 && end > 0){ const xz = xOf(0); svg += '<line class="zero" x1="' + xz.toFixed(1) + '" y1="' + (padTop - 8) + '" x2="' + xz.toFixed(1) + '" y2="' + (H - 8) + '"/>'; }

  const colors = ["var(--accent)", "var(--accent-2)", "var(--fil)", "var(--hf)", "var(--ipc)"];
  // (07-10) «colors» en una fila: un color propio o, con varios, un degradado (influencias: del maestro al discípulo)
  let defs = "";
  const colOf = (a, i) => {
    if (a.colors && a.colors.length > 1){
      const gid = "cg-" + String(c.id).replace(/\W/g, "") + "-" + i, n = a.colors.length - 1;
      defs += '<linearGradient id="' + gid + '">' + a.colors.map((k, j) => '<stop offset="' + (j / n * 100).toFixed(0) + '%" stop-color="' + k + '"/>').join("") + '</linearGradient>';
      return "url(#" + gid + ")";
    }
    if (a.colors && a.colors.length) return a.colors[0];
    return grps && a.grp != null ? cronoGrpColor(a.grp, grps[a.grp]) : colors[i % colors.length];
  };
  axes.forEach((a, i) => {
    const y = padTop + i * rowH;
    svg += '<rect class="lane-bg" x="0" y="' + (y + (rowH - barH) / 2 - 2) + '" width="' + W + '" height="' + (barH + 4) + '" rx="4" opacity="' + (i % 2 ? ".5" : ".22") + '"/>';
    const nm = a.name.length > 26 ? a.name.slice(0, 25) + "…" : a.name;
    svg += '<text class="lane-lbl" x="8" y="' + (y + rowH / 2 + 4) + '">' + escapeCrono(nm) + '</text>';
    if (a.start != null && a.end != null && a.end >= a.start){
      const bx = xOf(a.start), bw = Math.max(4, xOf(a.end) - xOf(a.start));
      // (07-10) barra con blanco (o casi): borde fino para que se vea sobre el fondo claro
      const claro = (a.colors || []).some(k => /^#f[0-9a-f]f[0-9a-f]f[0-9a-f]$|^#fff$/i.test(k));
      svg += '<rect class="cbar' + (claro ? ' cbar-claro' : '') + '" x="' + bx.toFixed(1) + '" y="' + (y + (rowH - barH) / 2) + '" width="' + bw.toFixed(1) + '" height="' + barH + '" rx="6" fill="' + colOf(a, i) + '">' +
        (a.note ? '<title>' + escapeCrono(a.note) + '</title>' : '') + '</rect>';
      // años SIEMPRE visibles: a la derecha de la barra, o a la izquierda si no cabe (nunca recortados)
      const lbl = cronoYear(a.start) + '–' + (a.vive ? '' : cronoYear(a.end)), lblW = lbl.length * 6;   // (01-10) «vive»: rótulo abierto
      const yr = y + rowH / 2 + 4, rx = xOf(a.end) + 6;
      if (rx + lblW <= W - 2)
        svg += '<text class="bar-yr" x="' + rx.toFixed(1) + '" y="' + yr + '" text-anchor="start">' + lbl + '</text>';
      else
        svg += '<text class="bar-yr" x="' + (bx - 6).toFixed(1) + '" y="' + yr + '" text-anchor="end">' + lbl + '</text>';
    } else if (a.start != null){
      svg += '<circle cx="' + xOf(a.start).toFixed(1) + '" cy="' + (y + rowH / 2) + '" r="5" fill="' + colOf(a, i) + '">' +
        (a.note ? '<title>' + escapeCrono(a.note) + '</title>' : '') + '</circle>';
      svg += '<text class="bar-yr" x="' + (xOf(a.start) + 9).toFixed(1) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="start">' + (a.fl ? CRONO_FL : "") + cronoYear(a.start) + '</text>';
    }
  });
  if (defs) svg = svg.replace(/^(<svg[^>]*>)/, "$1<defs>" + defs + "</defs>");
  svg += '</svg>';
  if (hasFl && axes.some(a => a.fl)) svg += '<p class="crono-leg-note">' + CRONO_FL_NOTE + '</p>';
  if (c.nota) svg += '<p class="crono-leg-note">' + escapeCrono(c.nota) + '</p>';   // (07-10) nota propia del cronograma (p. ej. qué significan los colores)
  return legend + svg;
}
/* botones de escuela (color + nombre) y de periodo: pulsado = visible; «Todas/Todos» y «Ninguna/Ninguno» para empezar de cero */
const CRONO_ESCUELAS = "المدارس", CRONO_EPOCAS = "العصور", CRONO_TODAS = "الكل", CRONO_NINGUNA = "لا شيء",
  CRONO_PERIODOS = "العصور", CRONO_TODOS = "الكل", CRONO_NINGUNO = "لا شيء",
  CRONO_NONE = "لا شيء للعرض: فعّلوا مدرسة أو عصرًا.";
function cronoLegend(t, label, items, todas, ninguna){
  return '<div class="crono-legend" role="group" aria-label="' + label + '"><span class="flabel">' + label + '</span>' +
    items.map((g, k) => '<button type="button" class="crono-leg" data-cfil="' + t + ':' + k + '" aria-pressed="' + !cronoHidden.has(t + ":" + k) + '">' +
      (t === "g" ? '<i style="background:' + cronoGrpColor(k, g) + '"></i>' : '') + '<span>' + escapeCrono(g.name) + '</span></button>').join("") +
    '<button type="button" class="crono-leg crono-leg-all" data-cfil="' + t + ':all">' + todas + '</button>' +
    '<button type="button" class="crono-leg crono-leg-all" data-cfil="' + t + ':none">' + ninguna + '</button></div>';
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("#cronobox [data-cfil]"); if (!b) return;
  const k = b.dataset.cfil, [t, v] = k.split(":"), c = CRONOGRAMAS.find(x => x.id === cronoId);
  const items = (c && (t === "g" ? c.groups : c.periods)) || [];
  if (v === "all") items.forEach((g, i) => cronoHidden.delete(t + ":" + i));
  else if (v === "none") items.forEach((g, i) => cronoHidden.add(t + ":" + i));
  else cronoHidden.has(k) ? cronoHidden.delete(k) : cronoHidden.add(k);
  drawCrono();
  const again = document.querySelector('#cronobox [data-cfil="' + k + '"]'); if (again) again.focus();
});

function cronoEpochs(c){
  return '<div class="crono-epochs">' + (c.stages || []).map(s =>
    '<div class="epoch"><div class="ep-label">' + escapeCrono(s.label) + '</div><div class="ep-text">' + escapeCrono(s.text) + '</div></div>').join("") + '</div>';
}

/* ---------- Eje cronológico del curso (24-09) ----------
   Datos: eje_cronologico.js (generado por tools/build_eje_cronologico.py, el mismo de la lámina
   en Word). Periodos como barras en flecha sobre un eje lineal de años, acontecimientos en
   etiquetas verdes bajo el eje y, debajo, una ficha por periodo (siglos, acontecimiento y
   representantes). El ancho de las etiquetas se mide con la fuente de la página, así que
   vale también para la versión en euskera. */
const EJE = { W: 1100, AX0: -700, AX1: 2100, X0: 40, X1: 1060, LBL: 14, LEAD: 16, BAR_Y: 46, BAR_H: 20, TIP: 10, GAP: 3,
  AXIS_Y: 92, YEAR_Y: 115, PILL_Y0: 128, PILL_H: 34, PILL_DY: 40, PN: 13, PD: 12 };
EJE.H = EJE.PILL_Y0 + EJE.PILL_DY + EJE.PILL_H + 6;
function ejeX(y){ return EJE.X0 + (y - EJE.AX0) * (EJE.X1 - EJE.X0) / (EJE.AX1 - EJE.AX0); }
/* colores del periodo: barra, texto en claro (ink) y texto en oscuro (dk, o la barra) */
function ejeVars(p){ return "--pbar:" + p.bar + ";--pl:" + p.ink + ";--pd:" + (p.dk || p.bar); }

let ejeCtx = null;
function ejeTextW(s, px, bold){
  if (ejeCtx === null){ try { ejeCtx = document.createElement("canvas").getContext("2d") || false; } catch (e){ ejeCtx = false; } }
  if (!ejeCtx) return String(s).length * px * (bold ? .62 : .56);
  ejeCtx.font = (bold ? "700 " : "400 ") + px + "px " + (getComputedStyle(document.body).fontFamily || "sans-serif");
  return ejeCtx.measureText(String(s)).width * 1.04;
}
/* Rótulo de periodo en dos líneas: corta por el último espacio («Filosofía del / Renacimiento»). */
function ejeLines(name){ const i = name.lastIndexOf(" "); return i > 0 ? [name.slice(0, i), name.slice(i + 1)] : [name]; }

function ejeBar(i, p, n){
  const first = i === 0, last = i === n - 1, t = EJE.TIP, top = EJE.BAR_Y, bot = top + EJE.BAR_H, mid = top + EJE.BAR_H / 2;
  const xa = first ? ejeX(p.start) : ejeX(p.start) - t / 2 + EJE.GAP;
  const xb = last ? ejeX(p.end) : ejeX(p.end) - t / 2;
  const pts = [[xa, top], [xb, top], [xb + (last ? t + 6 : t), mid], [xb, bot], [xa, bot]];
  if (!first) pts.push([xa + t, mid]);
  return pts.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ");
}
/* Centra cada rótulo sobre su barra y separa los que se pisan (los tres últimos periodos son cortos). */
function ejeLabelX(periods){
  const boxes = periods.map(p => {
    const w = Math.max.apply(null, ejeLines(p.name).map(l => ejeTextW(l, EJE.LBL, true)));
    const c = (ejeX(p.start) + ejeX(p.end)) / 2; return [c - w / 2, c + w / 2];
  });
  for (let k = 0; k < 200; k++){
    let moved = false;
    for (let i = 0; i < boxes.length - 1; i++){
      const a = boxes[i], b = boxes[i + 1], o = a[1] + 10 - b[0];
      if (o > .5){ a[0] -= o / 2; a[1] -= o / 2; b[0] += o / 2; b[1] += o / 2; moved = true; }
    }
    const last = boxes[boxes.length - 1], r = last[1] - (EJE.W - 6);
    if (r > 0){ last[0] -= r; last[1] -= r; moved = true; }
    if (boxes[0][0] < 6){ const d = 6 - boxes[0][0]; boxes[0][0] += d; boxes[0][1] += d; moved = true; }
    if (!moved) break;
  }
  return boxes.map(b => (b[0] + b[1]) / 2);
}
function ejePill(e){
  const x = ejeX(e.year), w = Math.max(ejeTextW(e.name, EJE.PN, true), ejeTextW(e.date, EJE.PD, false)) + 22;
  let left = e.lado > 0 ? x - 12 : e.lado < 0 ? x + 12 - w : x - w / 2;
  left = Math.max(6, Math.min(left, EJE.W - 6 - w));
  return { x: x, left: left, w: w, top: EJE.PILL_Y0 + (e.fila || 0) * EJE.PILL_DY };
}

function ejeSvg(E){
  const P = E.periods, esc = escapeCrono, f = v => v.toFixed(1);
  const label = escapeCrono(E.title + ": " + P.map(p => p.name).join(", ")).replace(/"/g, "");
  let s = '<svg class="eje-svg" viewBox="0 0 ' + EJE.W + ' ' + EJE.H + '" role="img" aria-label="' + label + '">';
  const lx = ejeLabelX(P);
  P.forEach((p, i) => {
    const ls = ejeLines(p.name);
    s += '<g class="eje-c" style="' + ejeVars(p) + '"><polygon points="' + ejeBar(i, p, P.length) + '" fill="' + p.bar + '"/>' +
      '<text class="lbl" x="' + f(lx[i]) + '" y="' + (EJE.BAR_Y - 10 - (ls.length - 1) * EJE.LEAD) + '" text-anchor="middle">' +
      ls.map((l, k) => '<tspan x="' + f(lx[i]) + '"' + (k ? ' dy="' + EJE.LEAD + '"' : '') + '>' + esc(l) + '</tspan>').join("") + '</text></g>';
  });
  const pills = E.events.map(ejePill);
  // líneas de los acontecimientos: de la barra al eje y de debajo de los años a la etiqueta
  pills.forEach(q => {
    s += '<line class="lead" x1="' + f(q.x) + '" y1="' + (EJE.BAR_Y + EJE.BAR_H + 2) + '" x2="' + f(q.x) + '" y2="' + EJE.AXIS_Y + '"/>' +
      '<line class="lead" x1="' + f(q.x) + '" y1="' + (EJE.YEAR_Y + 6) + '" x2="' + f(q.x) + '" y2="' + q.top + '"/>';
  });
  // eje con flechas y marcas cada 100 años (sin las que caen pegadas a un rombo)
  const ay = EJE.AXIS_Y;
  s += '<line class="axis" x1="14" y1="' + ay + '" x2="' + (EJE.W - 14) + '" y2="' + ay + '"/>' +
    '<polyline class="axis" points="26,' + (ay - 7) + ' 14,' + ay + ' 26,' + (ay + 7) + '"/>' +
    '<polyline class="axis" points="' + (EJE.W - 26) + ',' + (ay - 7) + ' ' + (EJE.W - 14) + ',' + ay + ' ' + (EJE.W - 26) + ',' + (ay + 7) + '"/>';
  for (let y = EJE.AX0 + 100; y < EJE.AX1; y += 100){
    const x = ejeX(y);
    if (pills.some(q => Math.abs(q.x - x) < 10)) continue;
    const big = y % 500 === 0, d = big ? 7 : 4;
    s += '<line class="tick' + (big ? ' big' : '') + '" x1="' + f(x) + '" y1="' + (ay - d) + '" x2="' + f(x) + '" y2="' + (ay + d) + '"/>';
  }
  pills.forEach(q => { s += '<rect class="dia" x="' + f(q.x - 5) + '" y="' + (ay - 5) + '" width="10" height="10" transform="rotate(45 ' + f(q.x) + ' ' + ay + ')"/>'; });
  (E.ticks || []).forEach(t => { s += '<text class="yr" x="' + f(ejeX(t.year)) + '" y="' + EJE.YEAR_Y + '" text-anchor="middle">' + esc(t.label) + '</text>'; });
  // etiquetas de los acontecimientos
  E.events.forEach((e, i) => {
    const q = pills[i];
    s += '<rect class="pill" x="' + f(q.left) + '" y="' + q.top + '" width="' + f(q.w) + '" height="' + EJE.PILL_H + '" rx="5"/>' +
      '<text class="pill-n" x="' + f(q.left + 11) + '" y="' + (q.top + 15) + '">' + esc(e.name) + '</text>' +
      '<text class="pill-d" x="' + f(q.left + 11) + '" y="' + (q.top + 29) + '">' + esc(e.date) + '</text>';
  });
  // leyenda en la segunda fila, a la izquierda
  const ly = EJE.PILL_Y0 + EJE.PILL_DY + 10;
  s += '<rect class="pill" x="' + EJE.X0 + '" y="' + ly + '" width="18" height="12" rx="3"/>' +
    '<text class="leg" x="' + (EJE.X0 + 26) + '" y="' + (ly + 11) + '">' + esc(E.txt.leyenda) + '</text>';
  return s + '</svg>';
}

function ejeAutor(a){
  return '<span class="eje-nom">' + escapeCrono(a.nombre) + '</span>' +
    (a.fechas ? ' <span class="eje-dt">(' + escapeCrono(a.fechas.replace(/ – /g, "–")) + ')</span>' : '') +
    (a.nota ? '<span class="eje-nt">: ' + escapeCrono(a.nota) + '</span>' : '');
}
/* Representantes con los mismos niveles que la lámina: epígrafe y viñetas; las entradas sueltas
   de una columna con epígrafes van al nivel de los epígrafes (Arendt, Rawls…). */
function ejeReps(p){
  const grouped = p.reps.some(r => r.epigrafe);
  return p.reps.map(r => {
    const head = r.epigrafe ? '<p class="eje-grp">' + escapeCrono(r.epigrafe) + '</p>' : '';
    if (!r.epigrafe && grouped) return r.autores.map(a => '<p class="eje-grp eje-top">' + ejeAutor(a) + '</p>').join("");
    return head + '<ul class="eje-list">' + r.autores.map(a => '<li>' + ejeAutor(a) + '</li>').join("") + '</ul>';
  }).join("");
}
function ejeGrid(E){
  const T = E.txt;
  return '<div class="eje-grid">' + E.periods.map((p, i) => {
    const ev = E.events[i] || {};
    return '<div class="eje-col eje-c" style="' + ejeVars(p) + '">' +
      '<h3 class="eje-per">' + escapeCrono(p.name) + '</h3>' +
      '<p class="eje-k">' + escapeCrono(T.siglos) + '</p><p class="eje-siglos">' + escapeCrono(p.siglos) + '</p>' +
      '<p class="eje-k">' + escapeCrono(T.evento) + '</p><p class="eje-evt"><span class="eje-pill">' + escapeCrono(ev.name) +
      '</span> <span class="eje-dt">' + escapeCrono(ev.date) + '</span></p>' +
      '<p class="eje-k">' + escapeCrono(T.reps) + '</p>' + ejeReps(p) + '</div>';
  }).join("") + '</div>';
}
function ejeCard(E){
  return '<div class="crono-card eje-card"><div class="crono-h"><h2 class="crono-title">' + escapeCrono(E.title) + '</h2>' +
    '<span class="crono-span eje-sub">' + escapeCrono(E.sub) + '</span></div>' +
    '<div class="eje-scroll">' + ejeSvg(E) + '</div>' +
    (E.txt.desliza ? '<p class="eje-hint" aria-hidden="true">' + escapeCrono(E.txt.desliza) + '</p>' : '') + ejeGrid(E) + '</div>';
}

/* Enlace profundo: #cronogramas/eje o #cronogramas/<id de cronograma> (Classroom, QR). */
function loadCrono(k){
  if (typeof CRONOGRAMAS === "undefined") return;
  if (k === EJE_ID && hasEje()) cronoBlock = EJE_ID;
  else { const c = CRONOGRAMAS.find(x => x.id === k); if (!c) return; cronoBlock = cronoOf(c.code); cronoId = k; }
  renderCronoFilter(); renderCronoChips(); drawCrono();
}

function escapeCrono(s){ return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* ---------- init ---------- */
/* ===== Nombres de pensadores → su ficha en «Ilustres» (25-09) =====
   Tras dibujar un cronograma (líneas de tiempo SVG, fichas por épocas o eje del curso) se buscan en su
   texto los nombres de los pensadores con ficha y se convierten en enlaces (#ilustres/<id>).
   Alias: los de tools/ilustres_autores.txt (CRONO_ILU_ALIAS, generado; regenerar si cambia esa lista)
   + el nombre de la ficha tal como está en esta web (en euskera, «Platon», «Tomas Akinokoa»…) y su forma
   corta. Un alias que valga para dos pensadores se descarta (mejor sin enlace que con uno equivocado). */
const CRONO_ILU_ALIAS = {"homero":["Homero"],"hesiodo":["Hesíodo"],"tales":["Tales de Mileto","Tales"],"anaximandro":["Anaximandro"],"anaximenes":["Anaxímenes"],"pitagoras":["Pitágoras de Samos","Pitágoras"],"jenofanes":["Jenófanes de Colofón","Jenófanes"],"heraclito":["Heráclito de Éfeso","هيراقليطس"],"parmenides":["Parménides de Elea","بارمنيدس"],"anaxagoras":["Anaxágoras de Clazómenas","Anaxágoras"],"empedocles":["Empédocles de Agrigento","Empédocles"],"solon":["Solón"],"protagoras":["Protágoras de Abdera","بروتاغوراس"],"gorgias":["Gorgias de Leontinos","Gorgias"],"policleto":["Policleto"],"socrates":["سقراط"],"aspasia":["Aspasia de Mileto","Aspasia"],"democrito":["Demócrito de Abdera","Demócrito"],"hipias":["Hipias de Élide","Hipias"],"antistenes":["Antístenes"],"aristipo":["Aristipo de Cirene","Aristipo"],"platon":["أفلاطون"],"diogenes":["Diógenes de Sinope","Diógenes"],"aristoteles":["أرسطو"],"pirron":["Pirrón de Elis","Pirrón"],"epicuro":["أبيقور"],"zenon":["Zenón de Citio"],"filolao":["Filolao de Crotona","Filolao"],"arquitas":["Arquitas de Tarento","Arquitas"],"zenon_elea":["Zenón de Elea"],"meliso":["Meliso de Samos","Meliso"],"leucipo":["Leucipo"],"trasimaco":["Trasímaco de Calcedonia","Trasímaco"],"espeusipo":["Espeusipo"],"arcesilao":["Arcesilao de Pitane","Arcesilao"],"carneades":["Carnéades de Cirene","Carnéades"],"teofrasto":["Teofrasto de Ereso","Teofrasto"],"straton":["Estratón de Lámpsaco","Estratón"],"crates":["Crates de Tebas","Crates"],"timon":["Timón de Fliunte"],"cleantes":["Cleantes de Aso","Cleantes"],"crisipo":["Crisipo de Solos","Crisipo"],"seneca":["سينيكا"],"tertuliano":["ترتليان"],"plotino":["Plotino"],"hipatia":["Hipatia de Alejandría","Hipatia"],"agustin":["أوغسطين","San Agustín","S. Agustín","Agustín"],"anselmo":["أنسلم الكانتربري","Anselmo"],"abelardo":["Pedro Abelardo","Abelardo"],"hildegarda":["Hildegarda de Bingen","Hildegarda"],"averroes":["Averroes"],"tomas":["توما الأكويني","Santo Tomás","S. Tomás"],"ockham":["Guillermo de Ockham","أوكام"],"maquiavelo":["Nicolás Maquiavelo","ماكيافيلي"],"copernico":["Nicolás Copérnico","Copérnico"],"lutero":["Martín Lutero","Lutero"],"calvino":["Juan Calvino","Calvino"],"galileo":["Galileo Galilei","Galileo"],"kepler":["Johannes Kepler","Kepler"],"harvey":["William Harvey","Harvey"],"hobbes":["Thomas Hobbes","هوبز"],"descartes":["René Descartes","ديكارت"],"isabel":["Isabel de Bohemia"],"spinoza":["Baruch Spinoza","اسبينوزا"],"locke":["John Locke","جون لوك"],"malebranche":["Nicolas Malebranche","Malebranche"],"newton":["Isaac Newton","Newton"],"leibniz":["Gottfried Wilhelm Leibniz","لايبنتز"],"berkeley":["George Berkeley","Berkeley"],"montesquieu":["Montesquieu"],"voltaire":["Voltaire"],"hume":["David Hume","هيوم"],"lamettrie":["Julien Offray de La Mettrie","La Mettrie"],"rousseau":["Jean-Jacques Rousseau","Rousseau"],"diderot":["Denis Diderot","Diderot"],"dalembert":["Jean le Rond d'Alembert","D'Alembert","d'Alembert"],"baumgarten":["Alexander Baumgarten","Baumgarten"],"smith":["Adam Smith"],"kant":["Immanuel Kant","كانط"],"lamarck":["Jean-Baptiste Lamarck","Lamarck"],"bentham":["Jeremy Bentham","Bentham"],"gouges":["Olympe de Gouges","De Gouges"],"wollstonecraft":["Mary Wollstonecraft","Wollstonecraft"],"hegel":["Georg Wilhelm Friedrich Hegel","Hegel"],"comte":["Auguste Comte","Comte"],"feuerbach":["Ludwig Feuerbach","Feuerbach"],"mill":["John Stuart Mill","Stuart Mill"],"darwin":["Charles Darwin","Darwin"],"boole":["George Boole","Boole"],"marx":["Karl Marx","Marx"],"mendel":["Gregor Mendel","Mendel"],"wallace":["Alfred Russel Wallace","Wallace"],"kropotkin":["Piotr Kropotkin","Kropotkin"],"tylor":["Edward B. Tylor","Tylor"],"nietzsche":["Friedrich Nietzsche","Nietzsche"],"james":["William James"],"freud":["Sigmund Freud","Freud"],"frege":["Gottlob Frege","Frege"],"unamuno":["Miguel de Unamuno","Unamuno"],"whitehead":["Alfred North Whitehead","Whitehead"],"weber":["Max Weber","Weber"],"curie":["Marie Curie","Curie"],"russell":["Bertrand Russell","Russell"],"moore":["George Edward Moore","Moore"],"scheler":["Max Scheler","Scheler"],"schlick":["Moritz Schlick","Schlick"],"einstein":["Albert Einstein","Einstein"],"ortega":["José Ortega y Gasset","Ortega"],"sapir":["Edward Sapir","Sapir"],"duchamp":["Marcel Duchamp","Duchamp"],"wittgenstein":["Ludwig Wittgenstein","Wittgenstein"],"heidegger":["Martin Heidegger","هايدغر"],"carnap":["Rudolf Carnap","Carnap"],"horkheimer":["Max Horkheimer","Horkheimer"],"benjamin":["Walter Benjamin"],"whorf":["Benjamin Lee Whorf","Whorf"],"gadamer":["Hans-Georg Gadamer","Gadamer"],"ryle":["Gilbert Ryle","Ryle"],"popper":["Karl Popper","Popper"],"adorno":["Theodor W. Adorno","Adorno"],"zambrano":["María Zambrano","Zambrano"],"sartre":["Jean-Paul Sartre","Sartre"],"arendt":["حنا أرندت","Arendt"],"beauvoir":["Simone de Beauvoir","Beauvoir"],"turing":["Alan Turing","Turing"],"camus":["Albert Camus","Camus"],"shannon":["Claude Shannon","Shannon"],"franklin":["Rosalind Franklin"],"ricoeur":["Paul Ricoeur","Ricoeur"],"rawls":["John Rawls","Rawls"],"kuhn":["Thomas Kuhn","Kuhn"],"lyotard":["Jean-François Lyotard","Lyotard"],"bauman":["Zygmunt Bauman","Bauman"],"danto":["Arthur Danto","Danto"],"foucault":["Michel Foucault","Foucault"],"dickie":["George Dickie","Dickie"],"habermas":["Jürgen Habermas","Habermas"],"wilson":["Edward O. Wilson"],"txillardegi":["Txillardegi"],"baudrillard":["Jean Baudrillard","Baudrillard"],"debord":["Guy Debord","Debord"],"derrida":["Jacques Derrida","Derrida"],"vattimo":["Gianni Vattimo","Vattimo"],"azurmendi":["Joxe Azurmendi","Azurmendi"],"ingham":["Geoffrey Ingham","Ingham"],"nussbaum":["Martha Nussbaum","Nussbaum"],"butler":["Judith Butler","Butler"],"han":["Byung-Chul Han"],"herrero":["Yayo Herrero"],"chalmers":["David Chalmers","Chalmers"],"klein":["Naomi Klein"],"preciado":["Paul B. Preciado","Preciado"],"bostrom":["Nick Bostrom","Bostrom"]};
let _cronoIluRe = null, _cronoIluMap = null;
function cronoIluIndex(){
  if (_cronoIluMap || typeof ILUSTRES === "undefined") return _cronoIluMap;
  const cand = {};                                   /* alias → conjunto de ids */
  const add = (a, id) => { a = (a || "").trim(); if (a.length < 4) return; (cand[a] = cand[a] || new Set()).add(id); };
  Object.keys(ILUSTRES).forEach(id => {
    (CRONO_ILU_ALIAS[id] || []).forEach(a => add(a, id));
    const n = ILUSTRES[id].name || ""; add(n, id);
    const w = n.split(/\s+/);
    if (w.length > 1){
      if (/\s(de|del|d'|von|van)\s/i.test(n) || /[kg]oa$/i.test(n)) add(w[0], id);   /* «Tales de Mileto», «Tales Miletokoa», «Xenofanes Kolofongoa» → Tales, Xenofanes */
      else add(w[w.length - 1], id);                                                 /* «Immanuel Kant» → Kant */
    }
  });
  _cronoIluMap = new Map();
  Object.keys(cand).forEach(a => { if (cand[a].size === 1) _cronoIluMap.set(a, [...cand[a]][0]); });
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keys = [..._cronoIluMap.keys()].sort((a, b) => b.length - a.length);   /* el más largo primero */
  /* (29-09) un nombre seguido de «de» + mayúscula que no es su alias completo es otro pensador
     («Zenón de Elea» no es Zenón de Citio): sin enlace */
  _cronoIluRe = keys.length ? new RegExp("(?<![\\p{L}\\p{N}])(" + keys.map(esc).join("|") + ")(?![\\p{L}\\p{N}])(?! de \\p{Lu})", "gu") : null;
  return _cronoIluMap;
}
function cronoIlu(root){   /* root: otra caja que enlazar (29-09: «Esquemas de autor») */
  const box = root || document.getElementById("cronobox") || document.querySelector("#cronogramas .crono-card, #cronogramas");
  if (!box || !cronoIluIndex() || !_cronoIluRe) return;
  const SVGNS = "http://www.w3.org/2000/svg";
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: t =>
    t.nodeValue.trim() && !(t.parentNode && t.parentNode.closest && t.parentNode.closest("a, button, h1, h2, h3, .crono-ilu, style, script")) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(t => {
    const txt = t.nodeValue; _cronoIluRe.lastIndex = 0;
    if (!_cronoIluRe.test(txt)) return;
    _cronoIluRe.lastIndex = 0;
    const inSvg = t.parentNode.namespaceURI === SVGNS;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = _cronoIluRe.exec(txt))){
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const id = _cronoIluMap.get(m[1]);
      const el = inSvg ? document.createElementNS(SVGNS, "tspan") : document.createElement("a");
      el.setAttribute("class", "crono-ilu"); el.setAttribute("data-ilu", id);
      if (!inSvg){ el.setAttribute("href", "#ilustres/" + id); }
      el.setAttribute("role", "link"); el.setAttribute("tabindex", "0");
      el.textContent = m[1]; frag.appendChild(el); last = m.index + m[1].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
  box.querySelectorAll(".crono-ilu:not([data-wired])").forEach(el => {
    el.setAttribute("data-wired", "1");
    const go = e => { e.preventDefault(); if (typeof show === "function") show("ilustres"); if (typeof loadIlustre === "function") loadIlustre(el.getAttribute("data-ilu")); };
    el.addEventListener("click", go);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") go(e); });
  });
}
(function(){
  const css = document.createElement("style");
  css.textContent = "#esqautor a.crono-ilu{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px;color:inherit}#esqautor a.crono-ilu:hover{text-decoration-style:solid}" +
    "#cronogramas .crono-ilu{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px;color:inherit}" +
    "#cronogramas a.crono-ilu:hover,#cronogramas tspan.crono-ilu:hover{text-decoration-style:solid}" +
    "#cronogramas tspan.crono-ilu{text-decoration:underline;fill:currentColor}";
  document.head.appendChild(css);
  /* se engancha a drawCrono, que es quien pinta cada cronograma */
  if (typeof drawCrono === "function"){ const _d = drawCrono; drawCrono = function(){ const r = _d.apply(this, arguments); try { cronoIlu(); } catch (e) {} return r; }; }
})();

function initCrono(){ if (typeof CRONOGRAMAS === "undefined") return; renderCronoFilter(); renderCronoChips(); drawCrono(); }
document.addEventListener("DOMContentLoaded", initCrono);
/* el eje mide sus etiquetas con la fuente de la página: se vuelve a dibujar cuando esta termina de cargar */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
  if (cronoBlock === EJE_ID && document.querySelector("#cronogramas .eje-card")) drawCrono();
});
(function(){ const nav = document.getElementById("tabs"); if (nav) nav.addEventListener("click", e => {
  const b = e.target.closest("button"); if (b && b.dataset.view === "cronogramas") initCrono();
}); })();
