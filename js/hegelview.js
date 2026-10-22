"use strict";
/* ===== Talleres · «Taller de Hegel» (22-10-2026, solo HF) =====
   Tres mesas en pestañas: «Del cogito al espíritu» (círculos que se amplían), «El camino de la conciencia» (mapa de
   las 13 figuras de la Fenomenología, con pregunta de tres opciones; las erróneas explican su error; columna de lo
   conservado, la Aufhebung visible) y «La historia de la libertad» (línea con tres bandas, uno, algunos, todos,
   y dos lecturas de cada momento: «Como Hegel» y «A contrapelo»).
   Textos en hegel.js (HEG). Sección #hegel; enlaces #hegel/sujeto|camino|historia.
   La figura 1 tiene un experimento real: escribir «ahora es…» con la hora del dispositivo; se guarda en
   localStorage (clave taller-hegel-ahora), siempre dentro de try/catch. */

const hgT = (k, v) => String((HEG.t && HEG.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
const hgBox = () => document.getElementById("hegelbox");
function hgH(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || (v === false && !k.startsWith("aria-"))) continue;
    if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v === true && !k.startsWith("aria-") ? "" : String(v));
  }
  kids.flat().forEach((c) => c != null && c !== false && e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
}
function hgS(tag, attrs = {}) { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; }
function hgTxt(x, y, t, a = {}) { const e = hgS("text", Object.assign({ x, y, class: "hg-svgtxt" }, a)); e.textContent = t; return e; }
const hgBarajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hgCita = (c) => hgH("blockquote", { class: "hg-cita" }, c.t, hgH("cite", {}, c.ref));
const hgLS = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const hgLang = () => document.documentElement.lang || "es";
const hgCol = (p) => "var(--hg-" + p + ")";
function hgFecha(d) {   // el navegador pone los separadores de cada lengua; si no conoce la de la página (p. ej. eu en algunos), castellano
  const o = { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" };
  try { const loc = Intl.DateTimeFormat.supportedLocalesOf([hgLang()]).length ? hgLang() : "es"; return d.toLocaleString(loc, o); }
  catch (e) { return d.toString(); }
}
const hgAnio = (f) => (f < 0 ? hgT("aC", { n: Math.abs(f) }) : String(f));

const HG = {
  mesa: "sujeto",
  m1: 0,
  m2: { i: 0, hechos: 0, desc: {}, fallos: 0, orden: null, ahora: null },
  m3: { sel: "atenas", lect: "ambas" }
};
const HG_MESAS = [["sujeto", "m1", "m1sub"], ["camino", "m2", "m2sub"], ["historia", "m3", "m3sub"]];
(function () {
  HG.m2.orden = HEG.camino.map((e) => hgBarajar(e.o.map((_, k) => k)));
  try { const g = JSON.parse(hgLS.get("taller-hegel-ahora") || "null"); if (g && g.t) HG.m2.ahora = g; } catch (e) {}
})();

/* ---------- mesa 1: del cogito al espíritu ---------- */
function hgCirculos(i) {
  const sv = hgS("svg", { viewBox: "0 0 260 260", class: "hg-circulos", role: "img", "aria-label": hgT("circAria", { l: HEG.sujeto.slice(0, i + 1).map((x) => x.nom).join(", ") }) });
  const R = [26, 58, 92, 124], et = ["circ1", "circ2", "circ3", "circ4"].map((k) => hgT(k));
  for (let k = 3; k >= 0; k--) {
    const act = k <= i;
    sv.append(hgS("circle", { cx: 130, cy: 130, r: R[k], fill: act ? (k === i ? "var(--hg-suave)" : "var(--surface-2)") : "none", stroke: act ? "var(--hg-acc)" : "var(--line)", "stroke-width": k === i ? 2.5 : 1.2, "stroke-dasharray": act ? "none" : "4 4" }));
  }
  if (i === 3) for (let k = 0; k < HEG.camino.length; k++) { const a = -Math.PI / 2 + (k / HEG.camino.length) * 2 * Math.PI; sv.append(hgS("circle", { cx: 130 + 124 * Math.cos(a), cy: 130 + 124 * Math.sin(a), r: 4, fill: "var(--hg-acc)" })); }
  sv.append(hgS("circle", { cx: 130, cy: 130, r: 5, fill: "var(--ink)" }));
  for (let k = 0; k <= i; k++) sv.append(hgTxt(130, k === 0 ? 150 : 130 - (R[k] + R[k - 1]) / 2 + 4, et[k], { "text-anchor": "middle", "font-size": 10.5, fill: k === i ? "var(--ink)" : "var(--muted)", "font-weight": k === i ? 600 : 400 }));
  return sv;
}
function hgMesa1() {
  const i = HG.m1, x = HEG.sujeto[i], ir = (k) => { HG.m1 = k; hgRender(); };
  return [
    hgH("p", { class: "hg-lede" }, hgT("m1lede")),
    hgH("div", { class: "hg-mesa" },
      hgH("div", { class: "hg-stepper", role: "group", "aria-label": hgT("figuras") }, ...HEG.sujeto.map((y, k) => hgH("button", { type: "button", "aria-pressed": String(k === i), onclick: () => ir(k) }, y.nom))),
      hgH("div", { class: "hg-m1" }, hgCirculos(i),
        hgH("div", { class: "hg-paso1", "aria-live": "polite" },
          hgH("div", { class: "hg-fila hg-entre" }, hgH("span", { class: "hg-nm" }, x.nom), hgH("span", { class: "hg-d" }, x.fechas + " · " + hgT("tema", { n: x.tema }))),
          hgH("dl", {}, hgH("dt", {}, hgT("es")), hgH("dd", {}, x.es), hgH("dt", {}, hgT("descubre")), hgH("dd", {}, x.descubre), hgH("dt", {}, hgT(i < 3 ? "falta" : "comoCamino")), hgH("dd", {}, x.falta)),
          hgCita(x.cita),
          i === 3 ? hgH("div", { class: "hg-fila" }, hgH("button", { type: "button", class: "btn", onclick: () => hgAbrir("camino") }, hgT("recorrer"))) : null)),
      hgH("div", { class: "hg-fila" },
        hgH("button", { type: "button", class: "btn ghost", disabled: i === 0, onclick: () => ir(i - 1) }, hgT("anterior")),
        hgH("button", { type: "button", class: "btn", disabled: i === 3, onclick: () => ir(i + 1) }, hgT("siguiente"))),
      hgH("details", { class: "hg-saber" }, hgH("summary", {}, hgT("spinozaTit")), hgH("p", { html: hgT("spinoza") })))
  ];
}

/* ---------- mesa 2: el camino de la conciencia ---------- */
function hgMapa() {
  const C = HEG.camino, N = C.length, W = 820, H = 170, m = 34, M = HG.m2;
  const X = (k) => m + (k * (W - 2 * m)) / (N - 1), Y = (k) => 98 + 30 * Math.sin(k * 0.95);
  const sv = hgS("svg", { viewBox: `0 0 ${W} ${H}`, class: "hg-camino-svg", role: "img", "aria-label": hgT("mapaAria", { h: M.hechos, n: N }) });
  let d = "M" + X(0) + "," + Y(0);
  for (let k = 1; k < N; k++) { const mx = (X(k - 1) + X(k)) / 2; d += ` C${mx},${Y(k - 1)} ${mx},${Y(k)} ${X(k)},${Y(k)}`; }
  sv.append(hgS("path", { d, fill: "none", stroke: "var(--line)", "stroke-width": 3, "stroke-linecap": "round" }));
  const partes = [];
  C.forEach((e, k) => { const u = partes[partes.length - 1]; if (!u || u.p !== e.k) partes.push({ p: e.k, k0: k, k1: k }); else u.k1 = k; });
  partes.forEach((pt) => {
    const x0 = X(pt.k0) - 12, x1 = X(pt.k1) + 12, ult = pt.k1 === N - 1;
    sv.append(hgS("line", { x1: x0, x2: x1, y1: 30, y2: 30, stroke: hgCol(pt.p), "stroke-width": 2 }));
    sv.append(hgTxt(ult ? x1 : (x0 + x1) / 2, 20, HEG.partes[pt.p], { "text-anchor": ult ? "end" : "middle", "font-size": 11.5, "font-weight": 600, fill: hgCol(pt.p) }));
  });
  C.forEach((e, k) => {
    const hecho = k < M.hechos, act = k === M.i;
    const g = hgS("g", { class: "hg-ev", tabindex: k <= M.hechos ? 0 : -1, role: "button", "aria-label": e.nom + ", " + hgT(hecho ? "superada" : act ? "actual" : "todavia") });
    g.append(hgS("rect", { x: X(k) - 22, y: Y(k) - 22, width: 44, height: 58, fill: "transparent" }));   // zona de toque: círculo y número
    g.append(hgS("circle", { cx: X(k), cy: Y(k), r: act ? 11 : 8, fill: hecho || act ? hgCol(e.k) : "var(--surface)", stroke: hgCol(e.k), "stroke-width": act ? 3 : 2, "fill-opacity": act && !hecho ? 0.35 : 1 }));
    if (act) g.append(hgS("circle", { cx: X(k), cy: Y(k), r: 16, fill: "none", stroke: hgCol(e.k), "stroke-width": 1.5, "stroke-dasharray": "3 3" }));
    g.append(hgTxt(X(k), Y(k) + 30, String(k + 1), { "text-anchor": "middle", "font-size": 10.5, class: "hg-svgtxt hg-mono", fill: "var(--muted)" }));
    const ir = () => { if (k <= M.hechos) { M.i = k; hgRender(); } };
    g.addEventListener("click", ir);
    g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
    sv.append(g);
  });
  return hgH("div", { class: "hg-scroll" }, hgH("div", { class: "hg-ancho" }, sv));
}
function hgExperimento() {
  const M = HG.m2, caja = hgH("div", { class: "hg-exp" }), ahora = new Date();
  const reloj = (t) => hgH("span", { class: "hg-reloj" }, t);
  const conReloj = (clave, f, extra) => { const [a, b] = hgT(clave, Object.assign({ f: "\u0000" }, extra)).split("\u0000"); return hgH("p", {}, a, reloj(f), b); };
  if (!M.ahora) {
    caja.append(conReloj("expAhora", hgFecha(ahora)),
      hgH("div", { class: "hg-fila" }, hgH("button", { type: "button", class: "btn", onclick: () => { M.ahora = { t: Date.now() }; hgLS.set("taller-hegel-ahora", JSON.stringify(M.ahora)); hgRender(); } }, hgT("expEscribir"))));
  } else {
    const d = new Date(M.ahora.t), min = Math.round((ahora - d) / 60000);
    caja.append(conReloj("expEscribiste", hgFecha(d)),
      conReloj(min < 1 ? "expIgual" : min === 1 ? "expUno" : "expVarios", hgFecha(ahora), { m: min }),
      hgH("div", { class: "hg-fila" },
        hgH("button", { type: "button", class: "btn ghost", onclick: () => hgRender() }, hgT("expMirar")),
        hgH("button", { type: "button", class: "btn ghost", onclick: () => { M.ahora = null; hgLS.set("taller-hegel-ahora", "null"); hgRender(); } }, hgT("expBorrar"))));
  }
  return caja;
}
function hgEstacion() {
  const M = HG.m2, C = HEG.camino, e = C[M.i], hecha = M.i < M.hechos;
  const nodos = [
    hgH("span", { class: "hg-tag", style: "color:" + hgCol(e.k) }, hgH("i", { style: "background:" + hgCol(e.k) }), hgT("etiqueta", { p: HEG.partes[e.k], c: e.cap, i: M.i + 1, n: C.length })),
    hgH("span", { class: "hg-nm" }, e.nom),
    hgH("p", { class: "hg-cree" }, hgH("b", {}, hgT("cree")), e.cree),
    hgH("p", {}, e.escena)];
  if (e.experimento) nodos.push(hgExperimento());
  if (hecha) {
    const ok = e.o.find((o) => o[1]);
    nodos.push(hgH("div", { class: "hg-aviso hg-ok" }, hgH("b", {}, hgT("loDescubre") + " "), ok[0] + ". " + ok[2]), hgCita(e.cita),
      hgH("p", {}, hgH("b", {}, hgT("conserva") + " "), e.guarda),
      hgH("div", { class: "hg-fila" },
        M.i > 0 ? hgH("button", { type: "button", class: "btn ghost", onclick: () => { M.i--; hgRender(); } }, hgT("figAnt")) : null,
        M.i < C.length - 1 ? hgH("button", { type: "button", class: "btn", onclick: () => { M.i++; hgRender(); } }, hgT(M.i + 1 === M.hechos ? "figSig" : "avanzar")) : null));
    if (M.hechos === C.length && M.i === C.length - 1) {
      const tro = M.fallos === 0 ? hgT("sinTropiezo") : M.fallos === 1 ? hgT("conTropiezo") : hgT("conTropiezos", { n: M.fallos });
      nodos.push(hgH("div", { class: "hg-aviso hg-neutro" }, hgH("b", {}, hgT("finCamino") + " (" + tro + "). "), hgT("finTexto"),
        hgH("div", { class: "hg-fila hg-arriba" },
          hgH("button", { type: "button", class: "btn", onclick: () => hgAbrir("historia") }, hgT("m3")),
          hgH("button", { type: "button", class: "btn ghost", onclick: () => { Object.assign(M, { i: 0, hechos: 0, desc: {}, fallos: 0, orden: C.map((x) => hgBarajar(x.o.map((_, k) => k))) }); hgRender(); } }, hgT("deNuevo")))));
    }
  } else {
    const desc = M.desc[M.i] || [];
    nodos.push(hgH("p", { class: "hg-q" }, e.q),
      hgH("div", { class: "hg-ops" }, ...M.orden[M.i].map((k) => {
        const fuera = desc.includes(k);
        return hgH("button", { type: "button", class: fuera ? "hg-descartada" : null, "aria-disabled": String(fuera), onclick: () => {
          if (fuera) return;
          if (e.o[k][1]) M.hechos = M.i + 1; else { M.fallos++; M.desc[M.i] = desc.concat([k]); }
          hgRender();
        } }, e.o[k][0]);
      })));
    if (desc.length) nodos.push(hgH("p", { class: "hg-fallo", "aria-live": "polite" }, e.o[desc[desc.length - 1]][2]));
  }
  return nodos;
}
function hgMesa2() {
  const mo = HEG.camino.slice(0, HG.m2.hechos);
  return [
    hgH("p", { class: "hg-lede" }, hgT("m2lede")),
    hgH("div", { class: "hg-mesa" }, hgMapa(),
      hgH("div", { class: "hg-cam" },
        hgH("div", { class: "hg-est", "aria-live": "polite" }, ...hgEstacion()),
        hgH("aside", { class: "hg-mochila", "aria-label": hgT("mochila") },
          hgH("h3", {}, hgT("mochila")),
          mo.length ? hgH("ol", {}, ...mo.map((x) => hgH("li", {}, hgH("i", { style: "background:" + hgCol(x.k) }), hgH("span", {}, x.guarda))))
            : hgH("p", { class: "hg-d" }, hgT("mochilaVacia"))))),
    hgH("div", { class: "hg-mesa" },
      hgH("h3", { html: hgT("aufTit") }),
      hgH("p", { html: hgT("aufTexto") }),
      hgH("div", { class: "hg-aufheben" }, ...[["negar", "negarTxt"], ["conservar", "conservarTxt"], ["elevar", "elevarTxt"]].map(([a, b]) => hgH("div", {}, hgH("b", {}, hgT(a)), hgT(b)))),
      hgCita({ t: hgT("capullo"), ref: hgT("capulloRef") }),
      hgH("details", { class: "hg-saber" }, hgH("summary", {}, hgT("trampaTit")), hgH("p", { html: hgT("trampa") })),
      hgH("details", { class: "hg-saber" }, hgH("summary", {}, hgT("certezaTit")), hgH("p", { html: hgT("certeza") })))
  ];
}

/* ---------- mesa 3: la historia de la libertad ---------- */
function hgLinea() {
  const Hs = HEG.historia, N = Hs.length, W = 860, H = 230, ml = 140, mr = 30, top = 30, bh = 56, M = HG.m3;
  const X = (k) => ml + (k * (W - ml - mr)) / (N - 1), Y = (b) => top + bh * b + bh / 2;
  const sv = hgS("svg", { viewBox: `0 0 ${W} ${H}`, class: "hg-linea-svg", role: "img", "aria-label": hgT("lineaAria") });
  HEG.bandas.forEach((b, i) => {
    sv.append(hgS("rect", { x: ml - 16, y: top + bh * i + 4, width: W - ml - mr + 32, height: bh - 8, rx: 8, fill: i % 2 ? "var(--surface-2)" : "var(--surface)", stroke: "var(--line-soft)", "pointer-events": "none" }));
    sv.append(hgTxt(ml - 24, Y(i) + 4, b, { "text-anchor": "end", "font-size": 12, "font-weight": 600, fill: "var(--muted)" }));
  });
  for (let k = 1; k < N; k++) {
    const a = Hs[k - 1], b = Hs[k];
    if (a.tipo === "contra" || b.tipo === "contra") continue;
    sv.append(hgS("line", { x1: X(k - 1), y1: Y(a.banda), x2: X(k), y2: Y(b.banda), stroke: M.lect === "contra" ? "var(--line)" : "var(--hg-acc)", "stroke-width": 2, "stroke-dasharray": M.lect === "contra" ? "4 4" : "none", "pointer-events": "none" }));
  }
  Hs.forEach((e, k) => {
    const contra = e.tipo === "contra", fuera = contra && M.lect === "hegel", sel = e.id === M.sel;
    const g = hgS("g", { class: "hg-ev", tabindex: 0, role: "button", "aria-pressed": String(sel), "aria-label": e.nom + ", " + hgAnio(e.fecha) + (contra ? ", " + hgT("fueraEsquema") : "") });
    g.append(hgS("rect", { x: X(k) - 36, y: Y(e.banda) - 20, width: 72, height: H - Y(e.banda) + 20, fill: "transparent" }));   // zona de toque: punto, fecha y nombre
    g.append(hgS("circle", { cx: X(k), cy: Y(e.banda), r: sel ? 11 : 8, fill: contra ? "var(--hg-warn)" : "var(--hg-acc)", stroke: "var(--surface)", "stroke-width": 2, opacity: fuera ? 0.25 : 1 }));
    if (sel) g.append(hgS("circle", { cx: X(k), cy: Y(e.banda), r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 1.5 }));
    g.append(hgTxt(X(k), H - 26, hgAnio(e.fecha), { "text-anchor": "middle", "font-size": 10.5, class: "hg-svgtxt hg-mono", fill: "var(--muted)" }));
    g.append(hgTxt(X(k), H - 10, e.corto, { "text-anchor": "middle", "font-size": 10, fill: sel ? "var(--ink)" : "var(--muted)", "font-weight": sel ? 600 : 400 }));
    const ir = () => { M.sel = e.id; hgRender(); };
    g.addEventListener("click", ir);
    g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
    sv.append(g);
  });
  return sv;
}
function hgMesa3() {
  const M = HG.m3, e = HEG.historia.find((x) => x.id === M.sel) || HEG.historia[0];
  const verH = M.lect !== "contra", verC = M.lect !== "hegel";
  return [
    hgH("p", { class: "hg-lede", html: hgT("m3lede") }),
    hgH("div", { class: "hg-mesa" },
      hgH("div", { class: "fgroup", role: "group", "aria-label": hgT("lectura") },
        ...[["ambas", "ambas"], ["hegel", "comoHegel"], ["contra", "aContrapelo"]].map(([v, l]) => hgH("button", { type: "button", class: "fbtn", "aria-pressed": String(M.lect === v), onclick: () => { M.lect = v; hgRender(); } }, hgT(l)))),
      hgH("div", { class: "hg-scroll" }, hgLinea()),
      hgH("p", { class: "hg-d" }, hgT("escala")),
      hgH("div", { class: "hg-ficha", "aria-live": "polite" },
        hgH("div", { class: "hg-fila hg-entre" }, hgH("span", { class: "hg-nm" }, e.nom), hgH("span", { class: "hg-fecha" }, hgAnio(e.fecha) + " · " + HEG.bandas[e.banda])),
        hgH("div", { class: "hg-dos" },
          hgH("div", { class: "hg-lect hg-heg" + (verH ? "" : " hg-apagada") }, hgH("h3", {}, hgT("loLee")), hgH("p", {}, e.hegel)),
          hgH("div", { class: "hg-lect hg-con" + (verC ? "" : " hg-apagada") }, hgH("h3", {}, hgT("aContrapelo")), hgH("p", {}, e.contra))),
        e.tipo === "contra" && M.lect === "hegel" ? hgH("p", { class: "hg-d" }, hgT("desaparece")) : null)),
    hgH("div", { class: "hg-mesa" },
      hgH("h3", {}, hgT("ideasTit")),
      hgH("ul", { class: "hg-lista" }, ...[1, 2, 3].map((n) => hgH("li", {}, hgH("b", {}, hgT("idea" + n + "Tit")), " ", hgH("span", { html: hgT("idea" + n) })))),
      hgH("details", { class: "hg-saber" }, hgH("summary", {}, hgT("pensarTit")),
        hgH("ol", { class: "hg-lista" }, ...(HEG.t.pensar || []).map((p) => hgH("li", {}, p)))))
  ];
}

/* ---------- sección #hegel ---------- */
function hgAbrir(m) { HG.mesa = m; hgRender(); const b = hgBox(); if (b && b.scrollIntoView) b.scrollIntoView({ block: "start" }); }
function hgRender() {
  const box = hgBox(); if (!box) return;
  const cuerpo = HG.mesa === "camino" ? hgMesa2() : HG.mesa === "historia" ? hgMesa3() : hgMesa1();
  const tabs = hgH("div", { class: "hg-pestanas", role: "tablist", "aria-label": hgT("mesas") },
    ...HG_MESAS.map(([id, t, sub]) => hgH("button", { type: "button", role: "tab", id: "hg-tab-" + id, "aria-selected": String(HG.mesa === id), "aria-controls": "hg-panel", tabindex: HG.mesa === id ? 0 : -1,
      onclick: () => { HG.mesa = id; hgRender(); },
      onkeydown: (ev) => {
        if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
        const ids = HG_MESAS.map((x) => x[0]), rtl = getComputedStyle(box).direction === "rtl";
        const paso = (ev.key === "ArrowRight") !== rtl ? 1 : ids.length - 1;
        HG.mesa = ids[(ids.indexOf(HG.mesa) + paso) % ids.length]; hgRender();
        const n = document.getElementById("hg-tab-" + HG.mesa); if (n) n.focus();
      } }, hgT(t), hgH("small", {}, hgT(sub)))));
  box.replaceChildren(
    hgH("p", { class: "hg-intro", html: hgT("intro") }),
    tabs,
    hgH("div", { class: "hg-panel", id: "hg-panel", role: "tabpanel", "aria-labelledby": "hg-tab-" + HG.mesa }, ...cuerpo.filter(Boolean)));
}
function loadHegel(arg) {
  if (HG_MESAS.some((m) => m[0] === arg)) HG.mesa = arg;
  hgRender();
}
if (hgBox()) hgRender();
