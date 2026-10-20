"use strict";
/* ===== Talleres · «Los afectos de Spinoza» (20-10-2026) =====
   Dos modos: «Retos» (el dominó de los afectos: cada suceso es una ficha y hay que elegir la puerta, es decir, la
   definición de la Ética que le corresponde) y «Caja de arena» (un circuito de piezas que se simula tic a tic).
   Origen: mesa «Afectos» del artefacto «Laboratorio de lógica» del profesor; motores sin cambios de fondo, salvo:
   el desgaste ya no se anuncia como «4 %» (el valor de partida era 3 %: ahora el texto lee el parámetro), y todos
   los textos y referencias están en afectos.js (AFE), revisados. Sección #afectos (enlace #afectos/retos|caja). */

const afT = (k, v) => String((AFE.t && AFE.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const afBox = () => document.getElementById("afectosbox");
const afH = (...a) => lbHx(...a);
/* helpers propios (no depende del Laboratorio, que solo está en el Rincón de lógica) */
function lbHx(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || (v === false && !k.startsWith("aria-"))) continue;
    if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v === true ? "" : String(v));
  }
  kids.flat().forEach((c) => c != null && c !== false && e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
}
function afS(tag, attrs = {}) { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; }
const afBarajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const afChip = (txt, pressed, onclick, extra = {}) => afH("button", Object.assign({ type: "button", class: "chip", "aria-pressed": String(!!pressed), onclick }, extra), txt);
const afAviso = (cls, html) => afH("div", { class: "lb-aviso lb-" + cls, html });
const afFmt = (x) => { const r = Math.round(x * 10) / 10; try { return r.toLocaleString(document.documentElement.lang || "es"); } catch (e) { return String(r); } };

/* ================= el dominó (retos) ================= */
const AF = (() => {
  /* signo + idea → afecto (Ética III, definiciones de los afectos) */
  const TABLA = { "+causa": "amor", "-causa": "odio", "+futuro_dudoso": "esperanza", "-futuro_dudoso": "miedo", "+futuro_seguro": "seguridad", "-futuro_seguro": "desesperacion",
    "-mal_semejante": "conmiseracion", "-bien_otro": "envidia", "-hizo_mal": "indignacion", "+hizo_bien": "favor", "+potencia": "contento", "-debilidad": "humildad", "-hecho_libre": "arrepentimiento" };
  /* afecto que nace según el estado afectivo hacia la persona: { afecto, signo, mag, nota } */
  function resolver(c, estado) {
    const ant = c.quien ? estado[c.quien] : null;
    if (c.quien && c.tipo === "causa" && ((ant === "amor" && c.sg === "-") || (ant === "odio" && c.sg === "+")))
      return { afecto: "fluctuacion", signo: "-", mag: Math.round(c.m * 0.8), nota: afT("notaFluct", { ant: afT(ant === "amor" ? "estAmor" : "estOdio"), p: c.quien, s: afT(c.sg === "+" ? "alegria" : "tristeza") }) };
    if (c.quien && c.tipo === "mal_semejante" && ant === "odio") return { afecto: "envidia", signo: "+", mag: 3, nota: afT("notaOdioAlegra", { p: c.quien }) };
    if (c.quien && c.tipo === "causa" && c.sg === "-" && ant === "odio") return { afecto: "odio", signo: "-", mag: Math.round(c.m * 1.6), nota: afT("notaOdioCrece", { p: c.quien }) };
    return { afecto: TABLA[c.sg + c.tipo], signo: c.sg, mag: c.m, nota: c.nota || "" };
  }
  return { TABLA, resolver };
})();

const AFU = (() => {
  const st = {};
  let cont = null;
  function empezar(i) {
    const R = AFE.retos[i] || null;
    Object.assign(st, { reto: i, mazo: R ? R.mazo.slice() : afBarajar(AFE.pool).slice(0, 10), pos: 0, pot: 50, estado: {}, cadena: [], aciertos: 0, entender: 3, amor: 1, resp: null, opciones: null });
    preparar();
  }
  const ok = (i) => [(s) => s.aciertos >= 6, (s) => !Object.values(s.estado).includes("fluct"), (s) => s.pot >= 55][i] || (() => true);
  const actual = () => st.mazo[st.pos];
  function preparar() {
    const c = actual(); if (!c) { st.opciones = null; return; }
    const r = AF.resolver(c, st.estado), todos = Object.keys(AFE.afectos);
    const mismos = todos.filter((k) => k !== r.afecto && k !== "fluctuacion" && Object.entries(AF.TABLA).some(([key, v]) => v === k && key[0] === c.sg));
    const otros = todos.filter((k) => k !== r.afecto && !mismos.includes(k) && k !== "fluctuacion");
    let distr = afBarajar(mismos).slice(0, 2);
    if (c.quien && r.afecto !== "fluctuacion" && Math.random() < 0.5) distr[1] = "fluctuacion";
    if (distr.length < 2) distr = distr.concat(afBarajar(otros).slice(0, 2 - distr.length));
    distr.push(afBarajar(otros.filter((k) => !distr.includes(k)))[0]);
    st.opciones = afBarajar([r.afecto, ...distr.slice(0, 3)]); st.res = r;
  }
  const cambiar = (d) => { st.pot = Math.max(5, Math.min(100, st.pot + d)); };
  function responder(k) {
    const c = actual(), r = st.res, bien = k === r.afecto;
    if (bien) st.aciertos++;
    let delta = (r.signo === "+" ? 1 : -1) * r.mag;
    if (bien && delta < 0) delta = Math.round(delta * 0.75);
    cambiar(delta);
    if (c.quien) {
      if (r.afecto === "fluctuacion") st.estado[c.quien] = "fluct";
      else if (r.afecto === "amor" || r.afecto === "favor") st.estado[c.quien] = "amor";
      else if (["odio", "indignacion", "envidia"].includes(r.afecto) && st.estado[c.quien] !== "amor") st.estado[c.quien] = "odio";
    }
    st.cadena.push({ c, r, delta, ok: bien, entendida: false });
    st.resp = { ok: bien, elegido: k, r, delta };
    st.pos++; preparar(); pintar();
  }
  function entender() {
    const t = [...st.cadena].reverse().find((x) => x.delta < 0 && !x.entendida && !x.especial);
    if (!t || st.entender <= 0) return;
    st.entender--; t.entendida = true;
    const rec = Math.round(-t.delta * 0.6); cambiar(rec);
    if (t.c.quien && st.estado[t.c.quien] === "fluct") st.estado[t.c.quien] = null;
    st.resp = { especial: afT("entendido", { n: rec, a: AFE.afectos[t.r.afecto].nom.toLowerCase() }) };
    preparar(); pintar();
  }
  function amar() {
    const p = Object.keys(st.estado).find((k) => st.estado[k] === "odio");
    if (!p || st.amor <= 0) return;
    st.amor--; st.estado[p] = "amor"; cambiar(15);
    st.cadena.push({ c: { txt: afT("respondes", { p }), quien: p, sg: "+", tipo: "causa" }, r: { afecto: "amor", signo: "+" }, delta: 15, ok: true, especial: true, entendida: true });
    st.resp = { especial: afT("amado") };
    preparar(); pintar();
  }
  function balanza() {
    const ang = -(st.pot - 50) * 0.36, rad = ang * Math.PI / 180, L = 110, fl = Object.values(st.estado).includes("fluct");
    const sv = afS("svg", { viewBox: "0 0 300 190", class: "af-balanza", role: "img", "aria-label": afT("balanzaAria", { p: st.pot }) + (fl ? afT("oscilando") : "") });
    sv.append(afS("rect", { x: 144, y: 50, width: 12, height: 120, rx: 3, class: "af-pie" }), afS("rect", { x: 110, y: 168, width: 80, height: 10, rx: 4, class: "af-pie" }));
    const g = afS("g", { class: fl ? "af-fluct" : "" });
    const ext = (sig) => [150 + sig * L * Math.cos(rad), 50 + sig * L * Math.sin(rad)];
    g.append(afS("line", { x1: ext(-1)[0], y1: ext(-1)[1], x2: ext(1)[0], y2: ext(1)[1], class: "af-brazo" }));
    [[-1, "alegria", "af-plato-ok"], [1, "tristeza", "af-plato-mal"]].forEach(([sig, et, cls]) => {
      const [x, y] = ext(sig);
      g.append(afS("line", { x1: x, y1: y, x2: x - 26, y2: y + 46, class: "af-cuerda" }), afS("line", { x1: x, y1: y, x2: x + 26, y2: y + 46, class: "af-cuerda" }));
      g.append(afS("path", { d: `M${x - 34},${y + 46} Q${x},${y + 70} ${x + 34},${y + 46} Z`, class: cls }));
      const t = afS("text", { x, y: y + 88, "text-anchor": "middle", class: "af-t" }); t.textContent = afT(et); g.append(t);
    });
    g.append(afS("circle", { cx: 150, cy: 50, r: 7, class: "af-eje" }));
    sv.append(g);
    return sv;
  }
  function ficha(x) {
    const A = AFE.afectos[x.r.afecto];
    return afH("div", { class: "af-ficha " + (x.especial ? "af-razon" : x.r.signo === "+" ? "af-mas" : "af-menos") + (x.entendida && !x.especial ? " af-entendida" : ""), title: x.c.txt },
      afH("div", { class: "af-mitad" }, afH("span", { class: "af-sg" }, afT(x.r.signo === "+" ? "alegria" : "tristeza")), afH("span", { class: "af-id" }, "+ " + (x.r.afecto === "fluctuacion" ? afT("contrarios") : AFE.ideas[x.c.tipo]))),
      afH("div", { class: "af-mitad af-der" }, afH("b", {}, A.nom), afH("span", { class: "af-dl" }, (x.delta > 0 ? "+" : "") + x.delta + (x.entendida && !x.especial ? afT("fichaEntendida") : x.especial ? afT("fichaRazon") : ""))));
  }
  function pintar() {
    if (!cont || !cont.isConnected) return;
    if (!st.mazo) empezar(0);
    const R = AFE.retos[st.reto], c = actual();
    const EST = { amor: "estAmor", odio: "estOdio", fluct: "estFluct" }, LE = { amor: "leAmas", odio: "leOdias", fluct: "fluctua" };
    const vivos = Object.entries(st.estado).filter(([, v]) => v);
    const hayTriste = st.cadena.some((x) => x.delta < 0 && !x.entendida && !x.especial);
    let suceso;
    if (c) suceso = afH("div", { class: "lb-aviso lb-neutro af-suceso" },
      afH("div", { class: "lb-fila lb-entre" }, afH("span", { class: "eyebrow" }, afT("suceso", { n: st.pos + 1, m: st.mazo.length })),
        c.quien ? afH("span", { class: "af-est " + (st.estado[c.quien] ? "af-" + st.estado[c.quien] : "") }, c.quien + (st.estado[c.quien] ? ": " + afT(LE[st.estado[c.quien]]) : "")) : null),
      afH("p", { class: "af-suceso-txt" }, c.txt), afH("p", { class: "lb-nota" }, afT("elige")),
      afH("div", { class: "lb-opciones af-op" }, ...st.opciones.map((k) => afH("button", { type: "button", onclick: () => responder(k) }, afH("b", {}, AFE.afectos[k].nom), afH("span", {}, AFE.afectos[k].def)))));
    else {
      const bien = R ? ok(st.reto)(st) : true;
      suceso = afH("div", {}, afAviso(bien ? "ok" : "warn", afT("final", { r: afT(R ? (bien ? "conseguido" : "noConseguido") : "terminada"), p: st.pot, a: st.aciertos, m: st.mazo.length, e: st.cadena.filter((x) => x.entendida && !x.especial).length })),
        afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn", onclick: () => { empezar(st.reto); pintar(); } }, afT("otraVez"))));
    }
    let fb = null;
    if (st.resp && st.resp.especial) fb = afAviso("neutro", st.resp.especial);
    else if (st.resp) {
      const r = st.resp.r, A = AFE.afectos[r.afecto];
      fb = afAviso(st.resp.ok ? "ok" : "mal", (st.resp.ok ? afT("puertaOk", { a: A.nom }) + (st.resp.delta < 0 ? afT("puertaOkTriste") : ".") : afT("puertaMal", { a: A.nom, b: AFE.afectos[st.resp.elegido].nom })) +
        " <em>" + A.def + "</em> <span class=\"lb-suave\">(" + A.ref + ")</span>" + (r.nota ? "<br>" + r.nota : ""));
    }
    cont.replaceChildren(
      afH("div", { class: "lb-mesa" },
        afH("div", { class: "lb-fila" }, ...AFE.retos.map((r, i) => afChip(r.nom, st.reto === i, () => { empezar(i); pintar(); })), afChip(afT("libre"), st.reto === AFE.retos.length, () => { empezar(AFE.retos.length); pintar(); })),
        afH("p", {}, R ? afT("objetivo", { m: R.meta }) : afT("libreMeta")),
        afH("div", { class: "lb-dos" },
          afH("div", { class: "lb-col" }, afH("h3", {}, afT("potencia")), balanza(),
            afH("div", { class: "af-pot" }, afH("div", { class: "af-pot-barra" }, afH("div", { style: "width:" + st.pot + "%" })), afH("b", {}, String(st.pot))),
            afH("h3", {}, afT("memoria")), afH("p", { class: "lb-nota" }, afT("memoriaAyuda")),
            afH("div", { class: "lb-fila" }, ...(vivos.length ? vivos.map(([p, v]) => afH("span", { class: "af-est af-" + v }, p + ": " + afT(EST[v]))) : [afH("span", { class: "lb-nota" }, afT("nadie"))])),
            afH("h3", {}, afT("remedios")),
            afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn ghost", disabled: !(hayTriste && st.entender > 0), onclick: entender }, afT("entender", { n: st.entender })),
              afH("button", { type: "button", class: "btn ghost", disabled: !(st.amor > 0 && Object.values(st.estado).includes("odio")), onclick: amar }, afT("amar", { n: st.amor })))),
          afH("div", { class: "lb-col" }, suceso, afH("div", { "aria-live": "polite" }, fb)))),
      afH("div", { class: "lb-mesa" }, afH("h3", {}, afT("cadena")),
        afH("div", { class: "af-cadena" }, ...(st.cadena.length ? st.cadena.map(ficha) : [afH("p", { class: "lb-nota" }, afT("cadenaVacia"))])),
        afH("details", { class: "lb-saber" }, afH("summary", {}, afT("pensarTit")), afH("p", { html: afT("pensar1") }), afH("p", { html: afT("pensar2") }))));
  }
  return { montar(c) { cont = c; pintar(); } };
})();

/* ================= caja de arena · motor =================
   Simulación síncrona: en cada tic, cada pieza calcula su salida con las salidas de sus entradas en el tic anterior,
   así que los bucles funcionan solos. Señal: { v (+ alegría, − tristeza), c: "imagen"|"idea", f: orígenes, a: activa, o: fuente oculta }.
   Escala del MODELO: potencia 0-1000; sucesos de −50 a +50 por tic. */
const CJ = (() => {
  const S = (v = 0, c = "imagen", f = [], a = false, o = false) => ({ v, c, f, a, o });
  const CERO = S(), MAXPOT = 1000;
  /* parámetros: id → [mín, máx, paso, valor de partida]; grupos en orden */
  const PAR_NUM = { comp: [0.02, 0.5, 0.01, 0.1], umbralActivo: [0.1, 1, 0.05, 0.5], alivio: [0, 1, 0.05, 0.7], entenderResto: [0, 1, 0.05, 0.4],
    razBase: [0, 60, 1, 5], razNocion: [0, 30, 1, 5], razMax: [10, 300, 10, 60],
    umbralBiestable: [5, 100, 5, 20], amorSale: [0, 100, 5, 30], odioCrece: [0, 30, 1, 6], fluct: [0, 100, 5, 50],
    imitacion: [0, 1.5, 0.05, 0.8], amorFactor: [0, 3, 0.1, 1.2],
    desgaste: [0, 0.1, 0.005, 0.03], retardo: [0, 10, 1, 2], urgencia: [0, 1, 0.05, 0.25] };
  const PAR_GRUPOS = [["comprender", ["comp", "umbralActivo", "alivio", "entenderResto"]], ["razon", ["razBase", "razNocion", "razMax"]],
    ["memoria", ["umbralBiestable", "amorSale", "odioCrece", "fluct"]], ["personas", ["imitacion", "amorFactor"]], ["tiempo", ["desgaste", "retardo", "urgencia"]]];
  const PAR_DEF = Object.fromEntries(Object.entries(PAR_NUM).map(([k, v]) => [k, v[3]]));
  function combinar(sens) {
    if (!sens.length) return { ...CERO, vacio: true, A: 0, P: 0, pos: 0, neg: 0 };
    const conDatos = sens.filter((x) => x.v !== 0 || x.c === "idea");
    const A = sens.filter((x) => x.a && !x.o).reduce((s, x) => s + Math.abs(x.v), 0), P = sens.filter((x) => !(x.a && !x.o)).reduce((s, x) => s + Math.abs(x.v), 0);
    return { v: sens.reduce((s, x) => s + x.v, 0), c: conDatos.length && conDatos.every((x) => x.c === "idea") ? "idea" : "imagen", f: [...new Set(sens.flatMap((x) => x.f))],
      a: A > 0 && P === 0, o: sens.some((x) => x.o), pos: sens.filter((x) => x.v > 0).reduce((s, x) => s + x.v, 0), neg: sens.filter((x) => x.v < 0).reduce((s, x) => s + x.v, 0), A, P };
  }
  const r1 = (x) => Math.round(x * 10) / 10;
  /* azar reproducible: el mismo tic y la misma pieza dan siempre lo mismo */
  function azar(id, t) { let h = 2166136261; for (const ch of id + ":" + t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
  function patron(n, t) {
    const p = n.p, v = p.v || 0, k = Math.max(1, p.k || 1);
    if (!p.on) return 0;
    if (p.tics) return p.tics.includes(t) ? v : 0;
    switch (p.pat || "siempre") {
      case "una": return t === k ? v : 0;
      case "cada": return t % k === 0 ? v : 0;
      case "desde": return t >= k ? v : 0;
      case "inconstante": return azar(n.id, t) < 0.5 ? v : 0;
      case "creciente": return r1(v * Math.min(3, 1 + (t - 1) / Math.max(4, k * 2)));
      default: return v;
    }
  }
  function comprendido(M, id, v) { const c = M.comp[id] || 0, K = M.K || PAR_DEF; return { v: v < 0 ? r1(v * (1 - K.alivio * c)) : v, a: c >= K.umbralActivo }; }
  function tic(M) {
    M.t++; M.comp = M.comp || {}; M.nociones = M.nociones || [];
    const K = M.K = Object.assign({}, PAR_DEF, M.par || {});
    const prev = Object.fromEntries(M.nodos.map((n) => [n.id, n.out || CERO])), byId = Object.fromEntries(M.nodos.map((n) => [n.id, n]));
    const urg = M.cuenta ? 1 + K.urgencia * Math.max(0, M.t - 1) : 1, nuevos = {};
    for (const n of M.nodos) {
      const ins = n.ins.filter((id) => prev[id]).map((id) => prev[id]);
      if (n.p.extra && n.p.extra.t === M.t) ins.push(S(n.p.extra.v));
      const x = combinar(ins);
      let out = CERO;
      switch (n.tipo) {
        case "suceso": { const cc = comprendido(M, n.id, patron(n, M.t)); out = S(cc.v, n.p.datos ? "idea" : "imagen", [n.id], cc.a && cc.v !== 0); break; }
        case "oculto": { const rev = M.revelados.has(n.id), cc = comprendido(M, n.id, n.p.v * (n.p.crece === false ? 1 : urg) * (rev ? 0.4 : 1)); out = S(r1(cc.v), "imagen", [n.id], cc.a, !rev); break; }
        case "balanza": {
          const antes = n.e.pot, desgaste = n.p.desgaste ? -n.e.pot * K.desgaste : 0;
          n.e.pot = Math.max(0, Math.min(MAXPOT, r1(n.e.pot + x.v + desgaste)));
          if (x.A + x.P > 0) { n.e.lib = Math.round(100 * x.A / (x.A + x.P)); n.e.sA = (n.e.sA || 0) + x.A; n.e.sP = (n.e.sP || 0) + x.P; }
          n.e.libAc = (n.e.sA || 0) + (n.e.sP || 0) > 0 ? r1(100 * n.e.sA / (n.e.sA + n.e.sP)) : 0;
          (n.e.hist = n.e.hist || []).push({ t: M.t, pot: n.e.pot, lib: n.e.libAc });
          if (n.e.hist.length > 600) n.e.hist.shift();
          out = S(r1(n.e.pot - antes), x.c, x.f, x.a, x.o); break;
        }
        case "biestable": {
          const Sx = x.pos >= K.umbralBiestable, Rx = x.neg <= -K.umbralBiestable, ant = n.e.q || "nada";
          let q = ant;
          if (Sx && Rx) q = "fluct"; else if (Sx) q = ant === "odio" ? "fluct" : "amor"; else if (Rx) q = ant === "amor" ? "fluct" : "odio";
          if (q !== ant) { M.log.push({ t: M.t, txt: afT("logEstado", { n: n.nombre, q: afT({ amor: "estAmor", odio: "estOdio", fluct: "fluctua", nada: "sinAfecto" }[q]) }) }); n.e.k = 0; }
          n.e.q = q; n.e.k = (n.e.k || 0) + 1;
          out = S(q === "amor" ? K.amorSale : q === "odio" ? -Math.min(100, 30 + K.odioCrece * n.e.k) : q === "fluct" ? (M.t % 2 ? K.fluct : -K.fluct) : 0, "imagen", x.f, false, x.o); break;
        }
        case "imitacion": { const odiado = n.p.hacia && byId[n.p.hacia] && byId[n.p.hacia].e.q === "odio"; out = S(r1((odiado ? -1 : 1) * K.imitacion * x.v), x.c, x.f, false, x.o); break; }
        case "amor": out = S(r1(x.v < 0 ? -x.v * K.amorFactor + 10 : x.v), x.c, x.f, true, x.o); break;
        case "entender": {
          x.f.forEach((id) => {
            const src = byId[id]; if (!src || !["suceso", "oculto"].includes(src.tipo)) return;
            const antes = M.comp[id] || 0, ahora = Math.min(1, antes + K.comp * (0.4 + 0.6 * (1 - antes)));
            M.comp[id] = Math.round(ahora * 100) / 100;
            if (antes < K.umbralActivo && ahora >= K.umbralActivo) M.log.push({ t: M.t, txt: afT("logComprendes", { n: src.nombre }) });
            if (src.tipo === "oculto" && !M.revelados.has(id)) { M.revelados.add(id); M.log.push({ t: M.t, txt: afT("logDestapada", { r: src.p.real }) }); }
          });
          out = S(r1(x.v < 0 ? x.v * K.entenderResto : x.v), "idea", x.f, true, false); break;
        }
        case "deliberar": {
          n.e.cola = n.e.cola || []; n.e.cola.push(ins.length >= 2 ? { ...x, c: "idea" } : x);
          const sale = n.e.cola.length > K.retardo ? n.e.cola.shift() : null;
          out = sale ? S(r1(sale.v * 0.5), sale.c, sale.f, sale.a, sale.o) : S(0, "imagen", [], false, false);
          n.e.esperando = !sale; break;
        }
        case "razon": {
          const bien = !x.vacio && x.c === "idea" && !x.o;
          n.e.motivo = x.vacio ? afT("razNada") : x.o ? afT("razOculta") : x.c !== "idea" ? afT("razImagenes") : "";
          if (bien) {
            const fuentes = x.f.filter((id) => byId[id] && ["suceso", "oculto"].includes(byId[id].tipo)).sort();
            for (let i = 0; i < fuentes.length; i++) for (let j = i + 1; j < fuentes.length; j++) {
              const k = fuentes[i] + "|" + fuentes[j];
              if (!M.nociones.includes(k)) { M.nociones.push(k); M.log.push({ t: M.t, txt: afT("logNocion", { a: byId[fuentes[i]].nombre, b: byId[fuentes[j]].nombre }) }); }
            }
          }
          n.e.fuerza = Math.min(K.razMax, K.razBase + K.razNocion * M.nociones.length);
          out = bien ? S(n.e.fuerza, "idea", x.f, true, false) : CERO; n.e.activa = bien; break;
        }
        case "rumiar": out = S(r1(Math.max(-120, x.v)), "imagen", x.f, false, x.o); break;
        case "accion": out = S(x.v, x.c, x.f, x.a, x.o); n.e.A = x.A; n.e.P = x.P; n.e.o = x.o; n.e.c = x.c; break;
      }
      nuevos[n.id] = out;
    }
    M.nodos.forEach((n) => (n.out = nuevos[n.id]));
    if (M.log.length > 60) M.log.splice(0, M.log.length - 60);
    return M;
  }
  /* actuar: la acción la decide el afecto más fuerte (IV, 7); la libertad es la parte activa */
  function actuar(M, id) {
    const n = M.nodos.find((x) => x.id === id), A = n.e.A || 0, P = n.e.P || 0, lib = A + P > 0 ? Math.round(100 * A / (A + P)) : 0, motivos = [];
    if (n.e.o) motivos.push(afT("motOculta"));
    if (A + P === 0) motivos.push(afT("motNada"));
    else if (P > A) motivos.push(afT("motPasiones", { p: Math.round(P), a: Math.round(A) }));
    else if (P > 0) motivos.push(afT("motAlguna"));
    M.hecho = { id, nombre: n.nombre, t: M.t, lib, motivos };
    const rum = M.nodos.find((x) => x.tipo === "rumiar"); if (rum) rum.p.extra = { t: M.t + 1, v: -60 };
    M.log.push({ t: M.t, txt: afT("logActuado", { n: n.nombre, l: lib }) });
    return M.hecho;
  }
  /* catálogo: [valor, patrón, k, con datos] en el orden de AFE.catalogo */
  const CATALOGO = [
    [[30, "siempre"], [25, "una", 3, true], [25, "cada", 5], [15, "cada", 3], [30, "una", 2], [10, "cada", 4], [30, "inconstante"], [35, "una", 6, true], [15, "una", 4, true], [15, "cada", 3, true]],
    [[-30, "una", 2], [-30, "inconstante"], [-45, "una", 3], [-15, "siempre"], [-20, "cada", 2], [-20, "desde", 4], [-10, "creciente"], [-35, "una", 5], [-25, "cada", 4]],
    [[20, "una", 3, true], [10, "una", 4, true], [15, "cada", 5, true], [10, "desde", 3, true]]
  ];
  return { S, tic, actuar, patron, CATALOGO, MAXPOT, PAR_NUM, PAR_GRUPOS, PAR_DEF };
})();

/* ================= caja de arena · interfaz ================= */
const CJU = (() => {
  const N = (id, tipo, ins = [], p = {}, e = {}) => ({ id, tipo, ins, p, e, out: null, base: true });
  const nom = (esc, n) => Object.assign(n, { nombre: AFE.esc[esc].nodos[n.id] });
  const ESC = {
    bucle: { fin: 12, crear: () => [
      N("ev", "suceso", [], { on: true, v: -50, tics: [1] }), N("lt", "biestable", ["ev", "li"]), N("li", "biestable", ["lt"]),
      N("tu", "balanza", ["ev", "li"], {}, { pot: 600 }), N("ik", "balanza", ["lt"], {}, { pot: 600 })].map((n) => nom("bucle", n)),
      objetivos: [(M, g) => M.t >= 12 && !["lt", "li"].some((id) => g(id).e.q === "odio"), (M, g) => M.t >= 12 && g("tu").e.pot > 500 && g("ik").e.pot > 500] },
    tranvia: { fin: null, cuenta: 10, crear: () => [
      N("t1", "suceso", [], { on: true, v: -20 }), N("t2", "suceso", [], { on: true, v: -10 }), N("oc", "oculto", [], { v: -15, real: AFE.esc.tranvia.ocReal }),
      N("rum", "rumiar", ["rum"]), N("tu", "balanza", ["t1", "t2", "oc", "rum"], {}, { pot: 600 }), N("tes", "suceso", [], { on: true, v: 10, datos: true }),
      N("del", "deliberar", []), N("raz", "razon", ["t1", "t2"]), N("ent", "entender", []), N("pal", "accion", ["tu"]), N("noi", "accion", ["tu"])].map((n) => nom("tranvia", n)),
      objetivos: [(M) => M.revelados.has("oc"), (M) => !!M.razonAntes, (M) => M.hecho && M.hecho.lib >= 60, (M, g) => M.hecho && M.t > M.hecho.t + 1 && Math.abs(g("rum").out ? g("rum").out.v : 0) < 10] },
    libre: { fin: null, crear: () => [
      N("tu", "balanza", ["base", "s1", "s2"], { desgaste: true }, { pot: 600 }),
      { id: "base", tipo: "suceso", ins: [], p: { on: true, v: 18, pat: "siempre" }, e: {}, out: null },
      { id: "s1", tipo: "suceso", ins: [], p: { on: true, v: 30, pat: "cada", k: 4 }, e: {}, out: null },
      { id: "s2", tipo: "suceso", ins: [], p: { on: true, v: -30, pat: "inconstante" }, e: {}, out: null }].map((n) => nom("libre", n)),
      objetivos: [(M, g) => (g("tu").e.libAc || 0) > 50, (M) => (M.nociones || []).length >= 3, (M, g) => g("tu").e.pot > 700] }
  };
  const VEL = [1600, 900, 350, 120], PATRONES = ["siempre", "una", "cada", "desde", "inconstante", "creciente"];
  const st = { esc: "bucle", M: null, reloj: null, vel: 1, sel: "tipo:entender", par: {}, comps: [] };
  const K = () => Object.assign({}, CJ.PAR_DEF, st.par);
  let uid = 0, cont = null;
  const g = (id) => st.M.nodos.find((n) => n.id === id);
  const visible = (n) => n.tipo !== "oculto" || st.M.revelados.has(n.id) || !n.base;
  const nombreDe = (n) => (n.tipo === "oculto" && st.M.revelados.has(n.id) ? afT("ocultaNom", { n: n.nombre.toLowerCase() }) : n.nombre);
  const corto = (s) => (s.length > 18 ? s.slice(0, 17) + "…" : s);
  const clon = (o) => JSON.parse(JSON.stringify(o));
  const $ = (sel) => cont && cont.querySelector(sel);
  function cargar(k) {
    parar(); st.esc = k; const E = ESC[k];
    st.M = { t: 0, cuenta: E.cuenta || null, revelados: new Set(), log: [], comp: {}, nociones: [], nodos: E.crear(), hecho: null, razonAntes: false, par: st.par };
    st.M.nodos.forEach((n) => (n.e0 = clon(n.e))); st.ej = null;
    pintar(true);
  }
  function repetir() {
    parar(); const M = st.M;
    Object.assign(M, { t: 0, revelados: new Set(), log: [], comp: {}, nociones: [], hecho: null, razonAntes: false, par: st.par });
    M.nodos.forEach((n) => { n.out = null; n.e = clon(n.e0 || {}); delete n.p.extra; });
    M.log.push({ t: 0, txt: afT("volvemos") });
    pintar(true);
  }
  function terminado() {
    const E = ESC[st.esc], M = st.M;
    return !!((E.fin && M.t >= E.fin) || (st.esc === "tranvia" && M.hecho && M.t >= M.hecho.t + 8));
  }
  function paso() {
    const M = st.M;
    if (!cont || !cont.isConnected) { parar(); return; }
    if (terminado()) { parar(); pintar(false); return; }
    CJ.tic(M);
    const raz = M.nodos.find((n) => n.tipo === "razon");
    if (!M.hecho && raz && raz.e.activa) M.razonAntes = true;
    if (M.cuenta && !M.hecho && M.t >= M.cuenta) {
      const noi = M.nodos.find((n) => n.id === "noi");
      if (noi) { CJ.actuar(M, noi.id); M.hecho.lib = 0; M.hecho.tarde = true; M.log.push({ t: M.t, txt: afT("logTarde") }); }
    }
    if (terminado()) parar();
    pintar(false);
  }
  function parar() { if (st.reloj) { clearInterval(st.reloj); st.reloj = null; } }
  function marcha() { if (st.reloj) { parar(); pintar(false); return; } if (terminado()) return; st.reloj = setInterval(paso, VEL[st.vel]); pintar(false); }
  /* ---------- mapa ---------- */
  function mapa() {
    const M = st.M, vis = M.nodos.filter(visible), W = 360, H = 300, cx = 180, cy = 150, R = vis.length > 1 ? 112 : 0, pos = {}, r = 17;
    vis.forEach((n, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / vis.length; pos[n.id] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    const sv = afS("svg", { viewBox: `0 0 ${W} ${H}`, class: "af-mapa", role: "group", "aria-label": afT("mapaAria"), dir: "ltr" });
    const defs = afS("defs"), mk = afS("marker", { id: "af-punta", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" });
    mk.append(afS("path", { d: "M0,0 L10,5 L0,10 z", class: "af-punta" })); defs.append(mk); sv.append(defs);
    vis.forEach((n) => n.ins.forEach((iid) => {
      const src = g(iid); if (!src || !visible(src) || !pos[iid]) return;
      const [x1, y1] = pos[iid], [x2, y2] = pos[n.id], vv = src.out ? src.out.v : 0, cls = "af-cable" + (vv > 0 ? " af-pos" : vv < 0 ? " af-neg" : "");
      if (iid === n.id) { sv.append(afS("path", { d: `M${x1 - 8},${y1 - r + 2} C${x1 - 30},${y1 - 50} ${x1 + 30},${y1 - 50} ${x1 + 8},${y1 - r + 2}`, class: cls, "marker-end": "url(#af-punta)" })); return; }
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, mx = (x1 + x2) / 2 - uy * 10, my = (y1 + y2) / 2 + ux * 10;
      sv.append(afS("path", { d: `M${x1 + ux * r},${y1 + uy * r} Q${mx},${my} ${x2 - ux * (r + 4)},${y2 - uy * (r + 4)}`, class: cls, "stroke-width": Math.min(4, 1.2 + Math.abs(vv) / 30), "marker-end": "url(#af-punta)" }));
    }));
    vis.forEach((n) => {
      const [x, y] = pos[n.id], v = n.out ? n.out.v : 0;
      const gg = afS("g", { class: "af-nodo" + (n.tipo === "biestable" && n.e.q === "fluct" ? " af-vibra" : ""), tabindex: 0, role: "button", "aria-label": nombreDe(n) + ": " + Math.round(v) });
      gg.style.transformOrigin = `${x}px ${y}px`;
      const cls = "af-circ" + (n.tipo === "razon" && !n.e.activa ? " af-gris" : v > 0 ? " af-pos" : v < 0 ? " af-neg" : "") + (n.tipo === "oculto" ? " af-oculta" : "") + (n.tipo === "balanza" || (n.out && n.out.a) ? " af-activa" : "");
      gg.append(afS("circle", { cx: x, cy: y, r: n.tipo === "balanza" ? r + 4 : r, class: cls }));
      const t = afS("text", { x, y: y + 4, "text-anchor": "middle", class: "af-mapa-v" }); t.textContent = n.tipo === "balanza" ? Math.round(n.e.pot) : (v > 0 ? "+" : "") + Math.round(v);
      const lab = afS("text", { x, y: y + (y > cy ? 34 : -24), "text-anchor": "middle", class: "af-mapa-n" }); lab.textContent = corto(nombreDe(n));
      gg.append(t, lab);
      const ir = () => { const c = document.getElementById("af-card-" + n.id); if (c) { c.scrollIntoView({ block: "nearest" }); c.classList.add("af-destello"); setTimeout(() => c.classList.remove("af-destello"), 900); } };
      gg.addEventListener("click", ir); gg.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
      sv.append(gg);
    });
    return sv;
  }
  /* ---------- gráficas (una medida por gráfica) ---------- */
  const DASH = ["7 4", "2 3", "12 4 2 4"];
  function grafica(titulo, hist, campo, max, unidad, cls, fantasmas = []) {
    const W = 340, H = 120, ml = 34, mr = 46, mt = 10, mb = 20, iw = W - ml - mr, ih = H - mt - mb;
    const caja = afH("div", { class: "af-graf" }, afH("div", { class: "af-et" }, titulo));
    const sv = afS("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", dir: "ltr", "aria-label": titulo + ": " + (hist.length ? afFmt(hist[hist.length - 1][campo]) + unidad : afT("sinDatos")) });
    const todos = [hist, ...fantasmas.map((f) => f.hist)].filter((x) => x.length);
    const t0 = todos.length ? Math.min(...todos.map((x) => x[0].t)) : 0, t1 = todos.length ? Math.max(t0 + 1, ...todos.map((x) => x[x.length - 1].t)) : 1;
    const X = (t) => ml + ((t - t0) / (t1 - t0)) * iw, Y = (v) => mt + ih - (v / max) * ih;
    [0, max / 2, max].forEach((v) => {
      sv.append(afS("line", { x1: ml, x2: ml + iw, y1: Y(v), y2: Y(v), class: "af-rej" }));
      const tx = afS("text", { x: ml - 6, y: Y(v) + 3.5, "text-anchor": "end", class: "af-eje-t" }); tx.textContent = afFmt(v) + unidad; sv.append(tx);
    });
    [t0, t1].forEach((t, i) => { const tx = afS("text", { x: X(t), y: H - 5, "text-anchor": i ? "end" : "start", class: "af-eje-t" }); tx.textContent = afT("ticN", { t }); sv.append(tx); });
    fantasmas.forEach((f, i) => {
      if (f.hist.length < 2) return;
      sv.append(afS("polyline", { points: f.hist.map((p) => X(p.t) + "," + Y(p[campo])).join(" "), class: "af-fantasma", "stroke-dasharray": DASH[i % 3] }));
      const u = f.hist[f.hist.length - 1], tx = afS("text", { x: X(u.t) + 5, y: Y(u[campo]) - 4, class: "af-fant-t" }); tx.textContent = f.et; sv.append(tx);
    });
    if (hist.length >= 2) {
      sv.append(afS("polyline", { points: hist.map((p) => X(p.t) + "," + Y(p[campo])).join(" "), class: "af-linea " + cls }));
      const ult = hist[hist.length - 1];
      sv.append(afS("circle", { cx: X(ult.t), cy: Y(ult[campo]), r: 4, class: "af-punto " + cls }));
      const tx = afS("text", { x: X(ult.t) + 7, y: Y(ult[campo]) + 4, class: "af-ult-t" }); tx.textContent = afFmt(ult[campo]) + unidad; sv.append(tx);
      const guia = afS("line", { y1: mt, y2: mt + ih, class: "af-guia", visibility: "hidden" }), punto = afS("circle", { r: 4, class: "af-punto " + cls, visibility: "hidden" });
      const eti = afS("text", { class: "af-ult-t", visibility: "hidden" }), zona = afS("rect", { x: ml, y: mt, width: iw, height: ih, fill: "transparent" });
      const mover = (ev) => {
        const b = sv.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - b.left) * (W / b.width), t = t0 + ((px - ml) / iw) * (t1 - t0);
        const p = hist.reduce((a, c) => (Math.abs(c.t - t) < Math.abs(a.t - t) ? c : a));
        guia.setAttribute("x1", X(p.t)); guia.setAttribute("x2", X(p.t)); punto.setAttribute("cx", X(p.t)); punto.setAttribute("cy", Y(p[campo]));
        eti.textContent = afT("ticN", { t: p.t }) + ": " + afFmt(p[campo]) + unidad; eti.setAttribute("x", Math.min(X(p.t) + 6, ml + iw - 80)); eti.setAttribute("\x79", mt + 11);   /* "\x79" es «y»: escrito así para que no lo traduzca el diccionario de interfaz al construir (ui/<lang>.json tiene la clave «y») */
        [guia, punto, eti].forEach((e) => e.setAttribute("visibility", "visible"));
      };
      zona.addEventListener("pointermove", mover); zona.addEventListener("pointerleave", () => [guia, punto, eti].forEach((e) => e.setAttribute("visibility", "hidden"))); zona.addEventListener("touchmove", mover, { passive: true });
      sv.append(guia, punto, eti, zona);
    }
    caja.append(sv);
    return caja;
  }
  /* ---------- tarjetas ---------- */
  const barra = (val, max, cls = "") => afH("div", { class: "af-pot " + cls }, afH("div", { class: "af-pot-barra" }, afH("div", { style: "width:" + Math.max(0, Math.min(100, (100 * val) / max)) + "%" })), afH("b", {}, afFmt(val)));
  function dinamica(n) {
    const M = st.M, o = n.out || CJ.S(), v = (o.v > 0 ? "+" : "") + afFmt(o.v), linea = (txt) => afH("div", { class: "af-estado" }, txt);
    switch (n.tipo) {
      case "balanza": return [barra(n.e.pot, CJ.MAXPOT), linea(afT("libAhora", { a: n.e.lib || 0, b: afFmt(n.e.libAc || 0) })), ...(n.p.desgaste ? [afH("span", { class: "lb-nota" }, afT("desgasteNota", { d: afFmt(K().desgaste * 100) }))] : [])];
      case "biestable": return [linea(afT({ amor: "estAmor", odio: "estOdio", fluct: "estFluct", nada: "sinAfecto" }[n.e.q || "nada"]) + " · " + afT("sale", { v }))];
      case "deliberar": return [linea(n.e.esperando ? afT("deliberando") : afT(o.c === "idea" ? "saleIdeas" : "sale", { v }))];
      case "entender": {
        const pasan = new Set((n.out && n.out.f) || []), filas = Object.entries(M.comp).filter(([id]) => pasan.has(id) && g(id) && visible(g(id))).sort((a, b) => b[1] - a[1]);
        return [linea(afT("entSale", { v })), afH("div", { class: "af-sub" }, afH("span", { class: "af-et" }, afT("comprension", { u: Math.round(K().umbralActivo * 100) })),
          ...(filas.length ? filas.map(([id, c]) => afH("div", { class: "af-fila" }, afH("span", {}, corto(nombreDe(g(id)))), barra(Math.round(c * 100), 100, c >= K().umbralActivo ? "af-ok" : ""))) : [afH("span", { class: "lb-nota" }, afT("nadaAqui"))]))];
      }
      case "razon": {
        const k = K(), f = Math.min(k.razMax, k.razBase + k.razNocion * (M.nociones || []).length);
        return [linea(n.e.activa ? afT("razActiva", { f }) : (n.e.motivo || afT("enEspera"))),
          afH("div", { class: "af-sub" }, afH("span", { class: "af-et" }, afT("nociones", { n: (M.nociones || []).length, f, m: k.razMax })), barra(f, k.razMax, "af-ok"),
            ...(M.nociones || []).slice(-3).map((kk) => afH("span", { class: "lb-nota" }, "· " + kk.split("|").map((id) => (g(id) ? corto(g(id).nombre) : id)).join(" + "))))];
      }
      case "accion": {
        const A = n.e.A || 0, P = n.e.P || 0;
        return [linea(A + P ? afT(P > A ? "arrastran" : "mueveActivo") : afT("noLlega")),
          afH("div", { class: "af-sub" }, afH("span", { class: "af-et" }, afT("queMueve")),
            afH("div", { class: "af-fila" }, afH("span", {}, afT("activo")), barra(A, Math.max(A, P, 1), "af-ok")), afH("div", { class: "af-fila" }, afH("span", {}, afT("pasivo")), barra(P, Math.max(A, P, 1), "af-mal")))];
      }
      default: return [linea(afT("sale", { v }) + " · " + afT(o.c === "idea" ? "idea" : "imagen") + (o.a ? " · " + afT("activa") : "") + (["suceso", "oculto"].includes(n.tipo) && M.comp[n.id] ? " · " + afT("comprendido", { c: Math.round(M.comp[n.id] * 100) }) : ""))];
    }
  }
  function editorSuceso(n) {
    const p = n.p;
    const nombre = afH("input", { class: "lg-input", value: n.nombre, "aria-label": afT("nomSuceso"), oninput: (ev) => { n.nombre = ev.target.value || afT("algoPasa"); } });
    nombre.addEventListener("change", () => pintar(true));
    const num = afH("b", { class: "lb-mono" }, (p.v > 0 ? "+" : "") + p.v);
    const rango = afH("input", { type: "range", min: -50, max: 50, step: 5, value: p.v, class: "lb-rango", "aria-label": afT("valor"), oninput: (ev) => { p.v = +ev.target.value; num.textContent = (p.v > 0 ? "+" : "") + p.v; } });
    const pat = afH("select", { class: "af-sel", "aria-label": afT("ritmo"), onchange: (ev) => { p.pat = ev.target.value; pintar(true); } }, ...PATRONES.map((k) => afH("option", { value: k, selected: (p.pat || "siempre") === k }, AFE.patrones[k])));
    const k = afH("input", { class: "lg-input af-num", type: "number", min: 1, max: 999, value: p.k || 1, "aria-label": afT("ticCampo"), oninput: (ev) => { p.k = Math.max(1, +ev.target.value || 1); } });
    return afH("div", { class: "af-sub" }, nombre,
      afH("div", { class: "lb-fila" }, afH("span", { class: "af-et" }, afT("tristeza")), rango, afH("span", { class: "af-et" }, afT("alegria")), num),
      afH("div", { class: "lb-fila" }, pat, ["una", "cada", "desde", "creciente"].includes(p.pat) ? k : null),
      afH("div", { class: "lb-fila" }, afChip(afT(p.on ? "activoSi" : "apagado"), !!p.on, () => { p.on = !p.on; pintar(true); }), afChip(afT(p.datos ? "conDatos" : "sinDatosIdeas"), !!p.datos, () => { p.datos = !p.datos; pintar(true); })));
  }
  function tarjeta(n) {
    const T = AFE.piezas[n.tipo], M = st.M, editable = n.tipo === "suceso" && (!n.base || st.esc === "libre") && !n.p.tics;
    const opciones = M.nodos.filter((x) => visible(x) && !n.ins.includes(x.id));
    const sel = afH("select", { class: "af-sel", "aria-label": afT("conectarA", { n: n.nombre }), onchange: (ev) => { if (ev.target.value) { n.ins.push(ev.target.value); pintar(true); } } },
      afH("option", { value: "" }, afT("conectar")), ...opciones.map((x) => afH("option", { value: x.id }, x.id === n.id ? afT("siMismaBucle") : nombreDe(x))));
    const ins = n.ins.filter((i) => g(i) && visible(g(i)));
    return afH("div", { class: "af-card", id: "af-card-" + n.id },
      afH("div", { class: "lb-fila lb-entre af-nowrap" }, afH("div", { class: "af-min0" }, afH("span", { class: "af-tipo" }, T.nom), afH("b", { class: "af-nom" }, nombreDe(n))),
        n.id !== "tu" ? afH("button", { type: "button", class: "chip", "aria-label": afT("quitar", { n: n.nombre }), onclick: () => { M.nodos = M.nodos.filter((x) => x !== n); M.nodos.forEach((x) => (x.ins = x.ins.filter((i) => i !== n.id))); pintar(true); } }, "×") : null),
      afH("div", { class: "af-din" }, ...dinamica(n)),
      editable ? editorSuceso(n) : null,
      afH("details", { class: "af-ayuda" }, afH("summary", {}, afT("queHace")), afH("p", { class: "lb-nota" }, T.def, " ", afH("em", {}, "(" + T.ref + ")"))),
      ["suceso", "oculto"].includes(n.tipo) ? null : afH("div", { class: "af-ins" }, afH("span", { class: "af-et" }, afT("entradas")),
        ...ins.map((i) => afH("span", { class: "af-est" }, i === n.id ? afT("siMisma") : corto(nombreDe(g(i))), " ", afH("button", { type: "button", class: "af-x", "aria-label": afT("desconectar"), onclick: () => { n.ins = n.ins.filter((x) => x !== i); pintar(true); } }, "×"))),
        ins.length ? null : afH("span", { class: "lb-nota" }, afT("ninguna")), sel),
      n.tipo === "suceso" && n.base && st.esc !== "libre" && !n.p.tics ? afH("div", { class: "lb-fila" }, afChip(afT(n.p.on ? "estaPasando" : "apagado"), !!n.p.on, () => { n.p.on = !n.p.on; pintar(true); }), n.p.datos ? afH("span", { class: "af-est" }, afT("llevaDatos")) : null) : null,
      n.tipo === "imitacion" ? afH("label", { class: "lb-et-campo" }, afT("aQuien"), afH("select", { class: "af-sel", onchange: (ev) => { n.p.hacia = ev.target.value || null; pintar(true); } },
        afH("option", { value: "" }, afT("semejante")), ...M.nodos.filter((x) => x.tipo === "biestable").map((x) => afH("option", { value: x.id, selected: n.p.hacia === x.id }, afT("segun", { n: x.nombre }))))) : null,
      n.tipo === "accion" ? afH("button", { type: "button", class: "btn af-actuar", "data-id": n.id, disabled: !!M.hecho, onclick: () => { CJ.actuar(M, n.id); pintar(true); } }, afT(M.hecho && M.hecho.id === n.id ? "hecho" : "actuar")) : null);
  }
  function resumenPar() {
    const cambios = Object.keys(CJ.PAR_NUM).filter((id) => st.par[id] !== undefined && st.par[id] !== CJ.PAR_DEF[id]).map((id) => AFE.par[id].nom.toLowerCase() + " " + afFmt(st.par[id]));
    return cambios.length ? afT("parCambiados", { l: cambios.join(", ") }) : afT("parPartida");
  }
  function guardarTray() {
    const tu = g("tu"); if (!tu || !(tu.e.hist || []).length) return;
    const usadas = st.comps.map((c) => c.et), et = ["A", "B", "C"].find((x) => !usadas.includes(x)) || "A";
    if (st.comps.length >= 3) st.comps.shift();
    const u = tu.e.hist[tu.e.hist.length - 1];
    st.comps.push({ et, hist: clon(tu.e.hist), resumen: afT("resumen", { esc: AFE.esc[st.esc].nom.replace(/^\d · /, ""), n: st.M.nodos.length, t: u.t, p: afFmt(u.pot), l: afFmt(u.lib), par: resumenPar() }) });
    pintar(false);
  }
  function parametros() {
    const k = K();
    return afH("details", { class: "lb-saber" }, afH("summary", {}, afT("parTit")),
      afH("div", { class: "af-pars" }, afH("p", { class: "lb-nota" }, afT("parAyuda")),
        ...CJ.PAR_GRUPOS.map(([gid, ids]) => afH("div", { class: "af-pgrupo" }, afH("h3", {}, AFE.parGrupos[gid]), ...ids.map((id) => {
          const [mn, mx, stp, def] = CJ.PAR_NUM[id], T = AFE.par[id];
          const val = afH("b", { class: "lb-mono" + (k[id] !== def ? " af-cambiado" : "") }, afFmt(k[id]));
          const rg = afH("input", { type: "range", id: "af-par-" + id, min: mn, max: mx, step: stp, value: k[id], class: "lb-rango" });
          rg.addEventListener("input", () => { st.par[id] = +rg.value; val.textContent = afFmt(+rg.value); val.classList.toggle("af-cambiado", +rg.value !== def); st.M.par = st.par; pintar(false); });
          return afH("div", { class: "af-par" }, afH("label", { for: "af-par-" + id }, T.nom), val, rg, afH("span", { class: "lb-nota" }, T.def + " (" + T.ref + ")"));
        }))),
        afH("button", { type: "button", class: "btn ghost", onclick: () => { st.par = {}; if (st.M) st.M.par = st.par; pintar(true); } }, afT("parRestaurar"))));
  }
  function anadir() {
    const val = $("#af-tipo").value; st.sel = val;
    let nodo;
    if (val.startsWith("cat:")) {
      const [, gi, i] = val.split(":").map(Number), x = CJ.CATALOGO[gi][i];
      nodo = { id: "u" + ++uid, tipo: "suceso", nombre: AFE.catalogo[gi][i], ins: [], p: { on: true, v: x[0], pat: x[1], k: x[2] || 1, datos: !!x[3] }, e: {}, out: null };
      const tu = g("tu"); if (tu) tu.ins.push(nodo.id);
    } else {
      const tipo = val.split(":")[1], n = st.M.nodos.filter((x) => x.tipo === tipo).length;
      nodo = { id: "u" + ++uid, tipo, nombre: AFE.piezas[tipo].nom + (n ? " " + (n + 1) : ""), ins: [], p: {}, e: tipo === "balanza" ? { pot: 600 } : {}, out: null };
      if (tipo === "suceso") { nodo.nombre = afT("algoPasa") + (n ? " " + (n + 1) : ""); nodo.p = { on: true, v: 20, pat: "siempre", k: 1 }; }
      if (tipo === "oculto") { nodo.nombre = afT("propagandaNom"); nodo.p = { v: -20, real: afT("propagandaReal"), crece: false }; }
    }
    nodo.e0 = clon(nodo.e); st.M.nodos.push(nodo); pintar(true);
    const c = document.getElementById("af-card-" + nodo.id); if (c) { c.scrollIntoView({ block: "nearest" }); c.classList.add("af-destello"); setTimeout(() => c.classList.remove("af-destello"), 900); }
  }
  /* ---------- ejemplos al azar ---------- */
  const MEC = {
    comprender: (mk, tu, T) => { const a = mk.suceso(1), b = mk.suceso(1); tu.ins.push(a.id, b.id); mk.nodo("entender", T.n1, [a.id, b.id]); },
    razon: (mk, tu, T) => { const a = mk.suceso(2), b = mk.suceso(2), c = mk.suceso(0); tu.ins.push(c.id); const en = mk.nodo("entender", T.n1, [a.id, b.id, c.id]); const rz = mk.nodo("razon", T.n2, [en.id]); tu.ins.push(rz.id); },
    imitacion: (mk, tu, T) => { const ane = mk.nodo("balanza", T.n1, [], {}, { pot: 600 }); const ev = mk.suceso(1, T.n2); ane.ins.push(ev.id); const i1 = mk.nodo("imitacion", T.n3, [ane.id]); const i2 = mk.nodo("imitacion", T.n4, [tu.id]); tu.ins.push(i1.id); ane.ins.push(i2.id); },
    odio: (mk, tu, T) => { const ev = mk.nodo("suceso", T.n1, [], { on: true, v: -40, pat: "una", k: 2 }); const lt = mk.nodo("biestable", T.n2, [ev.id]); const li = mk.nodo("biestable", T.n3, [lt.id]); lt.ins.push(li.id); tu.ins.push(li.id); },
    propaganda: (mk, tu, T) => { const oc = mk.nodo("oculto", T.n1, [], { v: -12, real: afT("propagandaReal"), crece: false }); tu.ins.push(oc.id); mk.nodo("entender", T.n2, []); },
    rumiar: (mk, tu, T) => { const ev = mk.nodo("suceso", T.n1, [], { on: true, v: -15, pat: "una", k: 3 }); const ru = mk.nodo("rumiar", T.n2, [ev.id]); ru.ins.push(ru.id); tu.ins.push(ru.id); },
    esperanza: (mk, tu, T) => { const a = mk.nodo("suceso", T.n1, [], { on: true, v: 30, pat: "inconstante" }); const b = mk.nodo("suceso", T.n2, [], { on: true, v: -30, pat: "inconstante" }); tu.ins.push(a.id, b.id); },
    deliberar: (mk, tu, T) => { const a = mk.suceso(1), b = mk.suceso(0); tu.ins.push(a.id); const de = mk.nodo("deliberar", T.n1, [a.id, b.id]); const rz = mk.nodo("razon", T.n2, [de.id]); tu.ins.push(rz.id); }
  };
  function ejemplo() {
    parar(); st.esc = "libre";
    const M = st.M = { t: 0, cuenta: null, revelados: new Set(), log: [], comp: {}, nociones: [], nodos: [], hecho: null, razonAntes: false, par: st.par };
    const tu = { id: "tu", tipo: "balanza", nombre: AFE.esc.libre.nodos.tu, ins: ["base"], p: { desgaste: true }, e: { pot: 600 }, out: null, base: true };
    M.nodos.push(tu, { id: "base", tipo: "suceso", nombre: AFE.sostiene, ins: [], p: { on: true, v: 18, pat: "siempre" }, e: {}, out: null });
    const usados = new Set();
    const mk = {
      nodo(tipo, nombre, ins = [], p = {}, e = {}) { const n = { id: "u" + ++uid, tipo, nombre, ins: ins.slice(), p, e, out: null }; M.nodos.push(n); return n; },
      suceso(gi, nombre) {
        const idx = CJ.CATALOGO[gi].map((_, i) => i).filter((i) => !usados.has(gi + ":" + i)), i = (idx.length ? idx : CJ.CATALOGO[gi].map((_, j) => j))[Math.floor(Math.random() * (idx.length || CJ.CATALOGO[gi].length))];
        usados.add(gi + ":" + i); const x = CJ.CATALOGO[gi][i];
        const v = Math.max(-50, Math.min(50, x[0] + (Math.round(Math.random() * 4) - 2) * 5)) || x[0];
        return mk.nodo("suceso", nombre || AFE.catalogo[gi][i], [], { on: true, v: nombre ? -35 : v, pat: nombre ? "una" : x[1], k: nombre ? 3 : x[2] || 1 + Math.floor(Math.random() * 4), datos: !!x[3] });
      }
    };
    const elegidos = afBarajar(Object.keys(MEC)).slice(0, 2 + Math.floor(Math.random() * 2));
    elegidos.forEach((m) => MEC[m](mk, tu, AFE.mec[m]));
    M.nodos.forEach((n) => (n.e0 = clon(n.e)));
    M.log.push({ t: 0, txt: afT("ejGenerado", { l: elegidos.map((m) => AFE.mec[m].nom.toLowerCase()).join(", ") }) });
    st.ej = elegidos;
    pintar(true);
  }
  /* ---------- pintar ---------- */
  function pintar(estructura) {
    if (!cont || !cont.isConnected) { parar(); return; }
    if (!st.M) { cargar(st.esc); return; }
    const M = st.M, E = ESC[st.esc], T = AFE.esc[st.esc], k = K(), tu = g("tu");
    if (estructura || !$("#af-cards")) {
      const opts = [afH("optgroup", { label: afT("piezasGrupo") }, ...Object.keys(AFE.piezas).filter((t) => t !== "suceso" && (t !== "oculto" || st.esc === "libre")).map((t) => afH("option", { value: "tipo:" + t }, t === "oculto" ? afT("propaganda") : AFE.piezas[t].nom))),
        afH("optgroup", { label: afT("sucesoBlanco") }, afH("option", { value: "tipo:suceso" }, afT("sucesoTuyo"))),
        ...AFE.catalogo.map((lista, gi) => afH("optgroup", { label: afT("sucesosGrupo", { g: AFE.catGrupos[gi] }) }, ...lista.map((x, i) => afH("option", { value: "cat:" + gi + ":" + i }, x + " (" + (CJ.CATALOGO[gi][i][0] > 0 ? "+" : "") + CJ.CATALOGO[gi][i][0] + ")"))))];
      const tipoSel = afH("select", { id: "af-tipo", class: "af-sel af-crece" }, ...opts); tipoSel.value = st.sel;
      const vel = afH("select", { class: "af-sel af-auto", "aria-label": afT("velocidad"), onchange: (ev) => { st.vel = +ev.target.value; if (st.reloj) { parar(); marcha(); } } }, ...AFE.velocidades.map((t, i) => afH("option", { value: String(i), selected: i === st.vel }, t)));
      cont.replaceChildren(
        afH("div", { class: "lb-mesa" },
          afH("div", { class: "lb-fila", role: "group", "aria-label": afT("escenarios") }, ...Object.keys(ESC).map((kk) => afChip(AFE.esc[kk].nom, kk === st.esc, () => cargar(kk)))),
          afH("p", {}, T.intro),
          st.esc === "libre" ? afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn", onclick: ejemplo }, afT("generar")), afH("span", { class: "lb-nota" }, afT("generarAyuda"))) : null,
          st.ej ? afH("div", { class: "lb-aviso lb-neutro" }, afH("strong", {}, afT("queTiene")), afT("queTieneAyuda"), afH("ul", {}, ...st.ej.map((m) => afH("li", {}, afH("b", {}, AFE.mec[m].nom + ": "), AFE.mec[m].mirar)))) : null,
          afH("details", { class: "lb-saber" }, afH("summary", {}, afT("pistas")), afH("ul", {}, ...T.pistas.map((p) => afH("li", {}, p)))),
          afH("details", { class: "lb-saber" }, afH("summary", {}, afT("crecenTit")), afH("ul", {},
            ...["crece1", "crece2", "crece3", "crece4", "crece5", "crece6", "crece7"].map((c) => afH("li", { html: afT(c, { alivio: Math.round(k.alivio * 100), umbral: Math.round(k.umbralActivo * 100), retardo: k.retardo, base: k.razBase, nocion: k.razNocion, max: k.razMax, desgaste: afFmt(k.desgaste * 100) }) })))),
          parametros(),
          afH("div", { class: "lb-dos" },
            afH("div", { class: "lb-col" },
              afH("div", { class: "lb-fila lb-entre" }, afH("b", { id: "af-tic", class: "lb-mono", "aria-live": "polite" }),
                afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn", id: "af-play", onclick: marcha }), afH("button", { type: "button", class: "btn ghost", id: "af-paso", onclick: () => { parar(); paso(); } }, afT("unTic")),
                  afH("button", { type: "button", class: "btn ghost", id: "af-diez", onclick: () => { parar(); for (let i = 0; i < 10 && !terminado(); i++) paso(); } }, afT("diezTics")), vel)),
              afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn ghost", title: afT("repetirAyuda"), onclick: repetir }, afT("repetir")), afH("button", { type: "button", class: "btn ghost", title: afT("ceroAyuda"), onclick: () => cargar(st.esc) }, afT("cero"))),
              afH("div", { id: "af-mapa" }), afH("p", { class: "lb-nota lb-centro" }, afT("leyendaMapa"))),
            afH("div", { class: "lb-col" }, afH("div", { id: "af-medidores" }), afH("ul", { class: "lb-retos", id: "af-obj" }), afH("div", { id: "af-fin", "aria-live": "polite" }), afH("div", { id: "af-graf" }),
              afH("h3", {}, afT("loQuePasa")), afH("ul", { id: "af-log", class: "af-log" })))),
        afH("div", { class: "lb-mesa" },
          afH("div", { class: "lb-fila lb-entre" }, afH("h3", {}, afT("piezas")),
            afH("div", { class: "lb-fila af-crece" }, afH("label", { for: "af-tipo", class: "lb-et" }, afT("anadir")), tipoSel, afH("button", { type: "button", class: "btn ghost", onclick: anadir }, afT("anadirPieza")))),
          afH("div", { class: "af-cards", id: "af-cards" }, ...M.nodos.filter(visible).map(tarjeta))));
    } else {
      M.nodos.filter(visible).forEach((n) => { const c = document.getElementById("af-card-" + n.id); if (c) c.querySelector(".af-din").replaceChildren(...dinamica(n)); });
      if (M.nodos.some((n) => visible(n) && !document.getElementById("af-card-" + n.id))) $("#af-cards").replaceChildren(...M.nodos.filter(visible).map(tarjeta));
    }
    M.nodos.filter(visible).forEach((n) => { const c = document.getElementById("af-card-" + n.id); if (c) { const v = n.out ? n.out.v : 0; c.classList.toggle("af-pos", v > 0); c.classList.toggle("af-neg", v < 0); } });
    cont.querySelectorAll(".af-actuar").forEach((b) => { b.disabled = !!M.hecho; b.textContent = afT(M.hecho && M.hecho.id === b.dataset.id ? "hecho" : "actuar"); });
    $("#af-tic").textContent = M.cuenta ? afT(M.hecho ? "ticHecho" : "ticCuenta", { t: M.t, q: Math.max(0, M.cuenta - M.t) }) : E.fin ? afT("ticDe", { t: M.t, f: E.fin }) : afT("tic", { t: M.t });
    $("#af-play").textContent = afT(st.reloj ? "parar" : "marcha");
    ["#af-play", "#af-paso", "#af-diez"].forEach((s) => ($(s).disabled = terminado()));
    $("#af-mapa").replaceChildren(mapa());
    $("#af-graf").replaceChildren(grafica(afT("grafPot"), tu ? tu.e.hist || [] : [], "pot", CJ.MAXPOT, "", "af-c-pot", st.comps), grafica(afT("grafLib"), tu ? tu.e.hist || [] : [], "lib", 100, " %", "af-c-lib", st.comps),
      afH("div", { class: "lb-fila" }, afH("button", { type: "button", class: "btn ghost", onclick: guardarTray, disabled: !(tu && (tu.e.hist || []).length > 1) }, afT("guardar")),
        st.comps.length ? afH("button", { type: "button", class: "btn ghost", onclick: () => { st.comps = []; pintar(false); } }, afT("borrarComp")) : null),
      ...(st.comps.length ? [afH("ul", { class: "af-leyenda" }, afH("li", {}, afH("span", { class: "af-ley-linea" }), afT("ahora")),
        ...st.comps.map((c, i) => { const sv = afS("svg", { class: "af-ley-svg", viewBox: "0 0 28 8", "aria-hidden": "true" }); sv.append(afS("line", { x1: 0, y1: 4, x2: 28, y2: 4, class: "af-fantasma", "stroke-dasharray": DASH[i % 3] })); return afH("li", {}, sv, afH("b", {}, c.et + ": "), c.resumen); }))] : []));
    $("#af-medidores").replaceChildren(afH("div", {}, afH("span", { class: "af-et" }, afT("tuPotencia")), barra(tu ? tu.e.pot : 0, CJ.MAXPOT)),
      afH("div", {}, afH("span", { class: "af-et" }, afT(M.hecho ? "libertadAccion" : "tuLibertad")), barra(M.hecho ? M.hecho.lib : tu ? tu.e.libAc || 0 : 0, 100, "af-lib")));
    const objs = E.objetivos.map((f, i) => [T.objetivos[i], !!f(M, g)]);
    $("#af-obj").replaceChildren(...objs.map(([t, okk]) => afH("li", {}, afH("span", { class: "lb-badge lb-" + (okk ? "v" : "q") }, okk ? "✓" : "·"), afH("span", {}, t))), ...(T.nota ? [afH("li", { class: "lb-nota" }, T.nota)] : []));
    let fin = null;
    if (M.hecho && st.esc === "tranvia") fin = afAviso(M.hecho.lib >= 60 ? "ok" : "warn", (M.hecho.tarde ? afT("finTarde") : afT("finActuado", { n: M.hecho.nombre.toLowerCase(), l: M.hecho.lib }) + (M.hecho.motivos.length ? afT("finNoLibre", { m: M.hecho.motivos.join("; ") }) : afT("finLibre"))) + afT("finNoPuntua"));
    else if (terminado()) fin = afAviso(objs.every((o) => o[1]) ? "ok" : "warn", afT(objs.every((o) => o[1]) ? "finBucleOk" : "finBucleNo"));
    else if (st.esc === "libre" && objs.length && objs.every((o) => o[1])) fin = afAviso("ok", afT("finLibreOk"));
    $("#af-fin").replaceChildren(...(fin ? [fin] : []));
    $("#af-log").replaceChildren(...M.log.slice(-6).reverse().map((l) => afH("li", {}, afH("span", { class: "lb-mono lb-suave" }, afT("ticN", { t: l.t })), " ", l.txt)));
  }
  return { montar(c) { cont = c; if (!st.M) cargar(st.esc); else pintar(true); }, parar };
})();

/* ---------- sección #afectos ---------- */
const AF_ST = { modo: "retos" };
function afRender() {
  const box = afBox(); if (!box) return;
  const cuerpo = afH("div", { class: "af-cuerpo" });
  box.replaceChildren(
    afH("p", { class: "lg-intro" }, afT("intro")),
    afH("details", { class: "lb-aviso lb-warn af-modelo" }, afH("summary", {}, afH("strong", {}, afT("modeloTit"))), afH("p", { html: afT("modelo") })),
    afH("div", { class: "fgroup", role: "group", "aria-label": afT("modo") },
      ...[["retos", "modoRetos"], ["caja", "modoCaja"]].map(([m, l]) => afH("button", { type: "button", class: "fbtn", "aria-pressed": String(AF_ST.modo === m), onclick: () => { AF_ST.modo = m; afRender(); } }, afT(l)))),
    cuerpo);
  if (AF_ST.modo === "caja") CJU.montar(cuerpo); else { CJU.parar(); AFU.montar(cuerpo); }
}
function loadAfectos(arg) {
  if (arg === "retos" || arg === "caja") AF_ST.modo = arg;
  afRender();
}
if (afBox()) afRender();
