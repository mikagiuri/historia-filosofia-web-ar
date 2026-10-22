"use strict";
/* ===== Rincón de lógica · Laboratorio · mesa «Deducción natural» (22-10-2026, nube, rama claude/logica-huecos-itinerario) =====
   Nivel 4 del itinerario (docs/39): demostrar línea a línea aplicando reglas, sin hacer la tabla de verdad.
   · Reglas: MP, MT, SH, SD, introducción y eliminación de ∧, adición, dilema constructivo, doble negación, De Morgan,
     contraposición, eliminación e introducción de ↔, repetición, y las dos que cierran un supuesto provisional: prueba
     condicional y reducción al absurdo. Cada regla, con la tautología (o las dos) que la justifica (el puente con el nivel 3).
     Con ¬, ∧, ∨, → y ↔ (todas las conectivas del analizador) el sistema es correcto y completo.
   · 27 ejercicios en cinco escalones, cada uno con su derivación completa; dos son «trampa» (no se pueden derivar)
     y se resuelven con el contraejemplo de la tabla.
   · El alumno elige las líneas (el orden da igual: se prueban todos) y una regla; la mesa comprueba que la regla se aplica
     y añade la línea. (22-10, revisión) Avisos en una región aria-live estable, foco conservado al repintar y la profundidad
     del supuesto dicha también para lectores de pantalla.
   Motor sin DOM (LB_DN), que comprueban las pruebas de tools/test_lab_deduccion.js con todas las soluciones.
   Fórmulas aquí (como en laboratorioview.js); los textos, en laboratorio_deduccion.js (DED, memoria de traducción).
   Usa LB_PL (analizador de laboratorioview.js) y los ayudantes lbH, lbChip, lbAviso, lbSaber. */

/* ---------- ejercicios: premisas, conclusión y derivación modelo ----------
   sol: pasos [fórmula, regla, líneas que usa, fórmula extra (adición o supuesto)]; las líneas se numeran desde 1,
   contando las premisas. trampa: no se deriva; la mesa enseña el contraejemplo. */
const LB_DN_EJ = [
  /* escalón 1: una regla */
  { id: "d01", esc: 1, prem: ["p → q", "p"], concl: "q", sol: [["q", "mp", [1, 2]]] },
  { id: "d02", esc: 1, prem: ["p → q", "¬q"], concl: "¬p", sol: [["¬p", "mt", [1, 2]]] },
  { id: "d03", esc: 1, prem: ["p ∧ q"], concl: "q ∧ p", sol: [["p", "ce", [1]], ["q", "ce", [1]], ["q ∧ p", "ci", [3, 2]]] },
  { id: "d04", esc: 1, prem: ["p ∨ q", "¬p"], concl: "q", sol: [["q", "sd", [1, 2]]] },
  { id: "d05", esc: 1, prem: ["p → q", "q → r"], concl: "p → r", sol: [["p → r", "sh", [1, 2]]] },
  /* escalón 2: dos o tres pasos */
  { id: "d06", esc: 2, prem: ["p → q", "q → r", "p"], concl: "r", sol: [["q", "mp", [1, 3]], ["r", "mp", [2, 4]]] },
  { id: "d07", esc: 2, prem: ["p ∧ q", "p → r"], concl: "r", sol: [["p", "ce", [1]], ["r", "mp", [2, 3]]] },
  { id: "d08", esc: 2, prem: ["¬¬p", "p → q"], concl: "q", sol: [["p", "dn", [1]], ["q", "mp", [2, 3]]] },
  { id: "d09", esc: 2, prem: ["¬(p ∨ q)"], concl: "¬p", sol: [["¬p ∧ ¬q", "dm", [1]], ["¬p", "ce", [2]]] },
  { id: "d10", esc: 2, prem: ["¬(p ∧ q)", "p"], concl: "¬q", sol: [["¬p ∨ ¬q", "dm", [1]], ["¬¬p", "dn", [2]], ["¬q", "sd", [3, 4]]] },
  /* escalón 3: más largos */
  { id: "d11", esc: 3, prem: ["p → (q → r)", "p", "q"], concl: "r", sol: [["q → r", "mp", [1, 2]], ["r", "mp", [4, 3]]] },
  { id: "d12", esc: 3, prem: ["(p ∨ q) → r", "p"], concl: "r", sol: [["p ∨ q", "ad", [2], "q"], ["r", "mp", [1, 3]]] },
  { id: "d13", esc: 3, prem: ["p → r", "q → r", "p ∨ q", "r → s"], concl: "s", sol: [["r", "dc", [1, 2, 3]], ["s", "mp", [4, 5]]] },
  { id: "d14", esc: 3, prem: ["¬(p ∨ q)", "r → p"], concl: "¬r", sol: [["¬p ∧ ¬q", "dm", [1]], ["¬p", "ce", [3]], ["¬r", "mt", [2, 4]]] },
  { id: "d15", esc: 3, prem: ["p ∧ (q ∨ r)", "¬q"], concl: "p ∧ r", sol: [["p", "ce", [1]], ["q ∨ r", "ce", [1]], ["r", "sd", [4, 2]], ["p ∧ r", "ci", [3, 5]]] },
  /* escalón 4: supuestos provisionales (prueba condicional y reducción al absurdo) */
  { id: "d16", esc: 4, prem: ["p → q"], concl: "(p ∧ r) → q", sol: [["p ∧ r", "sup", [], "p ∧ r"], ["p", "ce", [2]], ["q", "mp", [1, 3]], ["(p ∧ r) → q", "pc", [4]]] },
  { id: "d17", esc: 4, prem: ["q"], concl: "p → q", sol: [["p", "sup", [], "p"], ["q", "rep", [1]], ["p → q", "pc", [3]]] },
  { id: "d18", esc: 4, prem: ["p → q", "q → r"], concl: "p → r", sol: [["p", "sup", [], "p"], ["q", "mp", [1, 3]], ["r", "mp", [2, 4]], ["p → r", "pc", [5]]] },
  { id: "d19", esc: 4, prem: ["p → q", "p → ¬q"], concl: "¬p", sol: [["p", "sup", [], "p"], ["q", "mp", [1, 3]], ["¬q", "mp", [2, 3]], ["¬p", "ra", [4, 5]]] },
  { id: "d20", esc: 4, prem: ["¬p → q", "¬q"], concl: "p", sol: [["¬p", "sup", [], "¬p"], ["q", "mp", [1, 3]], ["¬¬p", "ra", [4, 2]], ["p", "dn", [5]]] },
  /* escalón 5: combinar, sin premisas y trampas */
  { id: "d21", esc: 5, prem: ["p → (q ∧ r)"], concl: "p → r", sol: [["p", "sup", [], "p"], ["q ∧ r", "mp", [1, 2]], ["r", "ce", [3]], ["p → r", "pc", [4]]] },
  { id: "d22", esc: 5, prem: ["(p → q) ∧ (p → r)"], concl: "p → (q ∧ r)", sol: [["p → q", "ce", [1]], ["p → r", "ce", [1]], ["p", "sup", [], "p"], ["q", "mp", [2, 4]], ["r", "mp", [3, 4]], ["q ∧ r", "ci", [5, 6]], ["p → (q ∧ r)", "pc", [7]]] },
  { id: "d23", esc: 5, prem: [], concl: "¬(p ∧ ¬p)", sol: [["p ∧ ¬p", "sup", [], "p ∧ ¬p"], ["p", "ce", [1]], ["¬p", "ce", [1]], ["¬(p ∧ ¬p)", "ra", [2, 3]]] },
  { id: "d24", esc: 5, prem: ["p → q", "q"], concl: "p", trampa: true },
  { id: "d25", esc: 5, prem: ["p ∨ q", "p"], concl: "¬q", trampa: true },
  /* (22-10, revisión) el bicondicional; al final para no cambiar el número de los anteriores (paradojas.js cita el 10) */
  { id: "d26", esc: 5, prem: ["p ↔ q", "q"], concl: "p", sol: [["q → p", "bie", [1]], ["p", "mp", [3, 2]]] },
  { id: "d27", esc: 5, prem: [], concl: "(p ∧ q) ↔ (q ∧ p)", sol: [["p ∧ q", "sup", [], "p ∧ q"], ["p", "ce", [1]], ["q", "ce", [1]], ["q ∧ p", "ci", [3, 2]], ["(p ∧ q) → (q ∧ p)", "pc", [4]],
    ["q ∧ p", "sup", [], "q ∧ p"], ["q", "ce", [6]], ["p", "ce", [6]], ["p ∧ q", "ci", [8, 7]], ["(q ∧ p) → (p ∧ q)", "pc", [9]], ["(p ∧ q) ↔ (q ∧ p)", "bii", [5, 10]]] }
];

/* ---------- reglas: forma (para la tabla de reglas) y tautología que las justifica (una cadena o una lista) ---------- */
const LB_DN_REGLAS = [
  { id: "mp", sig: "MP", forma: "A → B, A ⊢ B", taut: "((p → q) ∧ p) → q", n: 2 },
  { id: "mt", sig: "MT", forma: "A → B, ¬B ⊢ ¬A", taut: "((p → q) ∧ ¬q) → ¬p", n: 2 },
  { id: "sh", sig: "SH", forma: "A → B, B → C ⊢ A → C", taut: "((p → q) ∧ (q → r)) → (p → r)", n: 2 },
  { id: "sd", sig: "SD", forma: "A ∨ B, ¬A ⊢ B", taut: "((p ∨ q) ∧ ¬p) → q", n: 2 },
  { id: "ci", sig: "I∧", forma: "A, B ⊢ A ∧ B", taut: "p → (q → (p ∧ q))", n: 2 },
  { id: "ce", sig: "E∧", forma: "A ∧ B ⊢ A  (o B)", taut: "(p ∧ q) → p", n: 1 },
  { id: "ad", sig: "Ad", forma: "A ⊢ A ∨ B", taut: "p → (p ∨ q)", n: 1, extra: true },
  { id: "dc", sig: "DC", forma: "A → C, B → C, A ∨ B ⊢ C", taut: "((p → r) ∧ (q → r) ∧ (p ∨ q)) → r", n: 3 },
  { id: "dn", sig: "DN", forma: "¬¬A ⊣⊢ A", taut: "¬¬p ↔ p", n: 1 },
  { id: "dm", sig: "DM", forma: "¬(A ∧ B) ⊣⊢ ¬A ∨ ¬B · ¬(A ∨ B) ⊣⊢ ¬A ∧ ¬B", taut: ["¬(p ∧ q) ↔ (¬p ∨ ¬q)", "¬(p ∨ q) ↔ (¬p ∧ ¬q)"], n: 1 },
  { id: "cp", sig: "CP", forma: "A → B ⊣⊢ ¬B → ¬A", taut: "(p → q) ↔ (¬q → ¬p)", n: 1 },
  { id: "bie", sig: "E↔", forma: "A ↔ B ⊢ A → B  (o B → A)", taut: ["(p ↔ q) → (p → q)", "(p ↔ q) → (q → p)"], n: 1 },
  { id: "bii", sig: "I↔", forma: "A → B, B → A ⊢ A ↔ B", taut: "((p → q) ∧ (q → p)) → (p ↔ q)", n: 2 },
  { id: "rep", sig: "R", forma: "A ⊢ A", taut: "p → p", n: 1 },
  { id: "sup", sig: "Sup", forma: "[A …", taut: "", n: 0, extra: true },
  { id: "pc", sig: "PC", forma: "[A … B] ⊢ A → B", taut: "", n: 1 },
  { id: "ra", sig: "RA", forma: "[A … B … ¬B] ⊢ ¬A", taut: "((p → q) ∧ (p → ¬q)) → ¬p", n: 2 }
];

/* ---------- motor (sin DOM) ---------- */
const LB_DN = (() => {
  const P = (s) => LB_PL.parse(s), K = (f) => LB_PL.key(f), neg = (f) => ({ t: "not", a: f });
  const igual = (a, b) => K(a) === K(b);
  const bin = (t, a, b) => ({ t, a, b });
  /* una derivación: líneas { f, r, refs, nivel, abiertos } donde abiertos = lista de ids de supuestos abiertos */
  function nueva(premisas) {
    return { lineas: premisas.map((s) => ({ f: P(s), r: "pre", refs: [], abiertos: [] })), pila: [] };
  }
  const accesible = (d, i) => { const l = d.lineas[i]; return !!l && l.abiertos.every((x, k) => d.pila[k] === x) && l.abiertos.length <= d.pila.length; };
  const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map((r) => [x].concat(r))));
  /* resultados posibles de aplicar la regla a las fórmulas fs (en el orden elegido; se prueban todos los órdenes) */
  function resultados(id, fs, extra) {
    const out = [], add = (f) => { if (f && !out.some((g) => igual(f, g))) out.push(f); };
    const una = (f) => {
      if (id === "ce" && f.t === "and") { add(f.a); add(f.b); }
      if (id === "ad" && extra) { add(bin("or", f, extra)); add(bin("or", extra, f)); }
      if (id === "dn") { if (f.t === "not" && f.a.t === "not") add(f.a.a); add(neg(neg(f))); }
      if (id === "dm") {
        if (f.t === "not" && f.a.t === "and") add(bin("or", neg(f.a.a), neg(f.a.b)));
        if (f.t === "not" && f.a.t === "or") add(bin("and", neg(f.a.a), neg(f.a.b)));
        if (f.t === "or" && f.a.t === "not" && f.b.t === "not") add(neg(bin("and", f.a.a, f.b.a)));
        if (f.t === "and" && f.a.t === "not" && f.b.t === "not") add(neg(bin("or", f.a.a, f.b.a)));
      }
      if (id === "cp" && f.t === "imp") { add(bin("imp", neg(f.b), neg(f.a))); if (f.a.t === "not" && f.b.t === "not") add(bin("imp", f.b.a, f.a.a)); }
      if (id === "bie" && f.t === "iff") { add(bin("imp", f.a, f.b)); add(bin("imp", f.b, f.a)); }
      if (id === "rep") add(f);
    };
    if (fs.length === 1) una(fs[0]);
    if (fs.length === 2) perms(fs).forEach(([x, y]) => {
      if (id === "mp" && x.t === "imp" && igual(x.a, y)) add(x.b);
      if (id === "mt" && x.t === "imp" && y.t === "not" && igual(x.b, y.a)) add(neg(x.a));
      if (id === "sh" && x.t === "imp" && y.t === "imp" && igual(x.b, y.a)) add(bin("imp", x.a, y.b));
      if (id === "sd" && x.t === "or" && y.t === "not") { if (igual(x.a, y.a)) add(x.b); if (igual(x.b, y.a)) add(x.a); }
      if (id === "bii" && x.t === "imp" && y.t === "imp" && igual(x.a, y.b) && igual(x.b, y.a)) add(bin("iff", x.a, x.b));
    });
    if (id === "ci" && fs.length === 2) { add(bin("and", fs[0], fs[1])); add(bin("and", fs[1], fs[0])); }
    if (id === "dc" && fs.length === 3) perms(fs).forEach(([x, y, z]) => {
      if (x.t === "imp" && y.t === "imp" && z.t === "or" && igual(x.b, y.b) && igual(z.a, x.a) && igual(z.b, y.a)) add(x.b);
    });
    return out;
  }
  /* aplica una regla: refs = índices de línea (desde 0). Devuelve { ok, opciones } o { err: clave de texto } */
  function aplicar(d, id, refs, extraTxt) {
    const R = LB_DN_REGLAS.find((x) => x.id === id); if (!R) return { err: "dnErrRegla" };
    let extra = null;
    if (R.extra) { if (!String(extraTxt || "").trim()) return { err: "dnErrExtra" }; try { extra = P(extraTxt); } catch (e) { return { err: "dnErrFormula", msg: e.message }; } }
    if (id === "sup") return { opciones: [extra], sup: true };
    if (refs.some((i) => !accesible(d, i))) return { err: "dnErrAcceso" };
    if (id === "pc" || id === "ra") {
      if (!d.pila.length) return { err: "dnErrSinSup" };
      const s = d.pila[d.pila.length - 1], A = d.lineas[s].f;
      if (id === "pc") { if (refs.length !== 1) return { err: "dnErrNum", n: 1 }; return { opciones: [bin("imp", A, d.lineas[refs[0]].f)], cierra: true }; }
      if (refs.length !== 2) return { err: "dnErrNum", n: 2 };
      const [x, y] = refs.map((i) => d.lineas[i].f);
      if (!((y.t === "not" && igual(y.a, x)) || (x.t === "not" && igual(x.a, y)))) return { err: "dnErrContra" };
      return { opciones: [neg(A)], cierra: true };
    }
    if (refs.length !== R.n) return { err: "dnErrNum", n: R.n };
    const op = resultados(id, refs.map((i) => d.lineas[i].f), extra);
    return op.length ? { opciones: op } : { err: "dnErrNoAplica" };
  }
  /* añade la línea elegida (después de aplicar) */
  function anadir(d, f, id, refs) {
    if (id === "sup") { d.lineas.push({ f, r: "sup", refs: [], abiertos: d.pila.slice() }); d.pila.push(d.lineas.length - 1); d.lineas[d.lineas.length - 1].abiertos = d.pila.slice(); return; }
    if (id === "pc" || id === "ra") { d.pila.pop(); d.lineas.push({ f, r: id, refs, abiertos: d.pila.slice() }); return; }
    d.lineas.push({ f, r: id, refs, abiertos: d.pila.slice() });
  }
  /* quita la última línea; si era un PC o un RA, reabre el supuesto que cerró. Devuelve false si solo quedan premisas */
  function deshacer(d, nPrem) {
    if (d.lineas.length <= nPrem) return false;
    const l = d.lineas.pop();
    if (l.r === "sup") d.pila.pop();
    else if (l.r === "pc" || l.r === "ra") {
      const s = [...d.lineas.keys()].reverse().find((i) => d.lineas[i].r === "sup" && d.lineas[i].abiertos.length === l.abiertos.length + 1 && l.abiertos.every((x, k) => d.lineas[i].abiertos[k] === x));
      if (s != null) d.pila = d.lineas[s].abiertos.slice();
    }
    return true;
  }
  const terminado = (d, concl) => !d.pila.length && d.lineas.some((l) => !l.abiertos.length && igual(l.f, P(concl)));
  /* ¿se sigue por la tabla? Devuelve null si es válido, o la fila del contraejemplo */
  function contraejemplo(prem, concl) {
    const fs = prem.map(P), c = P(concl), vars = [...new Set((prem.join(" ") + " " + concl).match(/[p-u]/g) || [])].sort();
    for (let m = 0; m < 1 << vars.length; m++) {
      const v = {}; vars.forEach((x, k) => (v[x] = !!(m & (1 << (vars.length - 1 - k)))));
      if (fs.every((f) => LB_PL.evalv(f, v)) && !LB_PL.evalv(c, v)) return v;
    }
    return null;
  }
  /* reproduce una solución modelo; devuelve la derivación o lanza un error (para las pruebas) */
  function reproducir(ej) {
    const d = nueva(ej.prem);
    (ej.sol || []).forEach(([f, id, refs, extra], k) => {
      const r = aplicar(d, id, refs.map((n) => n - 1), extra);
      if (r.err) throw new Error(ej.id + " paso " + (k + 1) + ": " + r.err);
      const g = r.opciones.find((x) => igual(x, P(f)));
      if (!g) throw new Error(ej.id + " paso " + (k + 1) + ": no sale " + f);
      anadir(d, g, id, refs.map((n) => n - 1));
    });
    return d;
  }
  const tautologia1 = (s) => { const f = P(s), vars = [...new Set(s.match(/[p-u]/g) || [])]; for (let m = 0; m < 1 << vars.length; m++) { const v = {}; vars.forEach((x, k) => (v[x] = !!(m & (1 << k)))); if (!LB_PL.evalv(f, v)) return false; } return true; };
  const tautologia = (s) => [].concat(s).every(tautologia1);
  return { nueva, aplicar, anadir, deshacer, terminado, contraejemplo, reproducir, accesible, tautologia, str: (f) => LB_PL.str(f) };
})();

/* ---------- vista ---------- */
const LB_DNU = (() => {
  const dT = (k, v) => String((DED.t && DED.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
  const st = { ej: 0, d: null, sel: [], regla: null, extra: "", msg: null, opciones: null, pistas: 0, hecho: {}, verSol: false, trampaDicha: false };
  /* box: la caja de la mesa; cuerpo: lo que se repinta; vivo: región aria-live estable (no se recrea al repintar) */
  let box = null, cuerpo = null, vivo = null, msgDicho = null;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const SOLO_LECTOR = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";
  const tautTxt = (t) => [].concat(t).join("  ·  ");
  const E = () => LB_DN_EJ[st.ej], txtEj = (id) => (DED.ej && DED.ej[id]) || {};
  const nomRegla = (id) => (DED.reglas[id] || {}).nom || id;
  function cargar(i) { Object.assign(st, { ej: i, d: LB_DN.nueva(LB_DN_EJ[i].prem), sel: [], regla: null, extra: "", msg: null, opciones: null, pistas: 0, verSol: false, trampaDicha: false }); pintar(); }
  function elegirLinea(i) { const k = st.sel.indexOf(i); if (k >= 0) st.sel.splice(k, 1); else st.sel.push(i); st.msg = null; st.opciones = null; pintar(); }
  function aplicar() {
    if (!st.regla) { st.msg = ["warn", dT("dnElige")]; pintar(); return; }
    const r = LB_DN.aplicar(st.d, st.regla, st.sel, st.extra);
    if (r.err) { st.msg = ["mal", dT(r.err, { n: r.n, m: esc(r.msg || "") })]; st.opciones = null; pintar(); return; }
    if (r.opciones.length === 1) return poner(r.opciones[0]);
    st.opciones = r.opciones; st.msg = ["neutro", dT("dnVarias")]; pintar();
  }
  function poner(f) {
    LB_DN.anadir(st.d, f, st.regla, st.sel.slice());
    Object.assign(st, { sel: [], opciones: null, extra: "", msg: null });
    if (LB_DN.terminado(st.d, E().concl)) { st.hecho[E().id] = true; st.msg = ["ok", dT("dnHecho")]; }
    pintar();
  }
  function deshacer() {
    if (!LB_DN.deshacer(st.d, E().prem.length)) return;
    Object.assign(st, { sel: [], opciones: null, msg: null }); pintar();
  }
  function noSeDeriva() {
    const c = LB_DN.contraejemplo(E().prem, E().concl);
    st.trampaDicha = true;
    if (c) { st.hecho[E().id] = true; st.msg = ["ok", dT("dnTrampaBien", { fila: Object.entries(c).map(([x, v]) => x + " = " + (v ? "V" : "F")).join(", ") })]; }
    else st.msg = ["mal", dT("dnTrampaMal")];
    pintar();
  }
  function lineaHtml(l, i) {
    const nivel = l.abiertos.length, cerrada = !LB_DN.accesible(st.d, i), sel = st.sel.indexOf(i);
    const just = l.r === "pre" ? dT("dnPremisa") : l.r === "sup" ? dT("dnSupuesto") : (LB_DN_REGLAS.find((x) => x.id === l.r) || {}).sig + (l.refs.length ? " " + l.refs.map((x) => x + 1).join(", ") : "");
    const sr = [nivel ? dT("dnNivel", { n: nivel }) : "", cerrada ? dT("dnCerrada") : ""].filter(Boolean).join(" ");
    return lbH("li", { class: "lb-dn-l" + (cerrada ? " lb-dn-cerrada" : "") + (l.r === "sup" ? " lb-dn-sup" : ""), style: "--dn:" + nivel },
      lbH("button", { type: "button", class: "chip lb-dn-num", "aria-pressed": String(sel >= 0), disabled: cerrada, title: dT("dnUsar"), "data-k": "l" + i, onclick: () => elegirLinea(i) }, String(i + 1) + (sel >= 0 ? " · " + (sel + 1) : "")),
      lbH("span", { class: "lb-mono lb-dn-f", dir: "ltr" }, LB_DN.str(l.f), sr ? lbH("span", { style: SOLO_LECTOR }, " (" + sr + ")") : null),
      lbH("span", { class: "lb-nota lb-dn-j", dir: "ltr" }, just));
  }
  function pintar() {
    if (!box || !box.isConnected || !cuerpo) return;
    if (!st.d) st.d = LB_DN.nueva(E().prem);
    /* foco: se recuerda el control enfocado (por su data-k) para devolvérselo tras repintar */
    const act = document.activeElement, foco = act && act.getAttribute && cuerpo.contains(act) ? act.getAttribute("data-k") : null;
    const e = E(), t = txtEj(e.id), regla = LB_DN_REGLAS.find((x) => x.id === st.regla);
    const escalones = [1, 2, 3, 4, 5].map((n) => lbH("div", { class: "lb-fila" }, lbH("span", { class: "lb-et lb-ancho" }, dT("dnEsc", { n })),
      ...LB_DN_EJ.map((x, i) => (x.esc === n ? lbChip((st.hecho[x.id] ? "✓ " : "") + (i + 1), i === st.ej, () => cargar(i), { title: DED.esc[n - 1], "data-k": "e" + i }) : null)).filter(Boolean)));
    const enunciado = lbH("p", { class: "lb-dn-enun", tabindex: "-1", "data-k": "enun" }, lbH("b", {}, dT("dnEj", { n: st.ej + 1 }) + " "), lbH("span", { class: "lb-mono", dir: "ltr" }, (e.prem.length ? e.prem.join(", ") + " " : "") + "⊢ " + e.concl));
    const reglas = lbH("div", { class: "lb-fila", role: "group", "aria-label": dT("dnReglas") }, ...LB_DN_REGLAS.map((r) => lbChip(r.sig, st.regla === r.id, () => { st.regla = r.id; st.msg = null; st.opciones = null; pintar(); }, { title: nomRegla(r.id), "data-k": "r" + r.id })));
    const extra = regla && regla.extra ? lbH("label", { class: "lb-et-campo" }, dT(regla.id === "sup" ? "dnExtraSup" : "dnExtraAd"),
      lbH("input", { class: "lg-input", dir: "ltr", value: st.extra, "data-k": "extra", autocomplete: "off", spellcheck: "false", oninput: (ev) => { st.extra = ev.target.value; } })) : null;
    const msg = st.msg ? lbAviso(st.msg[0], st.msg[1]) : null;
    const opciones = st.opciones ? lbH("div", { class: "lb-fila" }, ...st.opciones.map((f, k) => lbChip(LB_DN.str(f), false, () => poner(f), { dir: "ltr", "data-k": "o" + k }))) : null;
    const hecho = LB_DN.terminado(st.d, e.concl);
    /* resuelto: demostrado, o trampa reconocida («No se puede derivar» con contraejemplo) */
    const resuelto = hecho || (!!e.trampa && st.trampaDicha && !!st.hecho[e.id]);
    const pistas = (t.pistas || []).slice(0, st.pistas).map((p, k) => lbH("p", { class: "lb-nota" }, lbH("b", {}, dT("dnPistaN", { n: k + 1 }) + " "), p));
    const sol = st.verSol && e.sol ? lbH("ol", { class: "lb-dn-sol lb-mono", dir: "ltr" }, ...e.prem.map((p) => lbH("li", {}, p + "   " + dT("dnPremisa"))),
      ...e.sol.map(([f, id, refs]) => lbH("li", {}, f + "   " + (id === "sup" ? dT("dnSupuesto") : LB_DN_REGLAS.find((x) => x.id === id).sig + " " + refs.join(", "))))) : null;
    cuerpo.replaceChildren(
      lbH("p", { class: "lg-intro" }, dT("dnLede")),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, dT("dnEjercicios")), ...escalones, lbH("p", { class: "lb-nota" }, DED.esc[e.esc - 1])),
      lbH("div", { class: "lb-mesa" }, enunciado,
        lbH("ol", { class: "lb-dn-lineas" }, ...st.d.lineas.map(lineaHtml)),
        st.d.pila.length ? lbH("p", { class: "lb-nota" }, dT("dnAbiertos", { n: st.d.pila.length })) : null,
        lbH("p", { class: "lb-nota" }, dT("dnComo")),
        reglas, regla ? lbH("p", { class: "lb-nota" }, lbH("b", {}, nomRegla(regla.id) + ": "), lbH("span", { class: "lb-mono", dir: "ltr" }, regla.forma), " · ", DED.reglas[regla.id].dice) : null,
        extra,
        lbH("div", { class: "lb-fila" },
          lbH("button", { type: "button", class: "btn", disabled: hecho, "data-k": "aplicar", onclick: aplicar }, dT("dnAplicar")),
          lbH("button", { type: "button", class: "btn ghost", "data-k": "deshacer", onclick: deshacer }, dT("dnDeshacer")),
          lbH("button", { type: "button", class: "btn ghost", "data-k": "reiniciar", onclick: () => cargar(st.ej) }, dT("dnReiniciar")),
          lbH("button", { type: "button", class: "btn ghost", "data-k": "nose", onclick: noSeDeriva }, dT("dnNoSe"))),
        opciones, msg,
        resuelto && st.ej < LB_DN_EJ.length - 1 ? lbH("p", {}, lbH("button", { type: "button", class: "btn", "data-k": "siguiente", onclick: () => cargar(st.ej + 1) }, dT("dnSiguiente"))) : null,
        lbH("div", { class: "lb-sep" },
          lbH("div", { class: "lb-fila" },
            t.pistas && st.pistas < t.pistas.length ? lbH("button", { type: "button", class: "btn ghost", "data-k": "pista", onclick: () => { st.pistas++; pintar(); } }, dT("dnPista")) : null,
            e.sol ? lbH("button", { type: "button", class: "btn ghost", "data-k": "sol", onclick: () => { st.verSol = !st.verSol; pintar(); } }, dT(st.verSol ? "dnOcultar" : "dnSol")) : null),
          ...pistas, sol, e.trampa && st.trampaDicha && t.contra ? lbH("p", { class: "lb-nota" }, t.contra) : null)),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, dT("dnReglasTit")), lbH("p", { class: "lb-nota" }, dT("dnReglasIntro")),
        lbH("div", { class: "tablewrap" }, lbH("table", { class: "lg-tabla lb-dn-tabla" },
          lbH("thead", {}, lbH("tr", {}, lbH("th", {}, dT("dnColRegla")), lbH("th", {}, dT("dnColForma")), lbH("th", {}, dT("dnColTaut")))),
          lbH("tbody", {}, ...LB_DN_REGLAS.map((r) => lbH("tr", {}, lbH("td", {}, lbH("b", {}, r.sig), " · ", nomRegla(r.id), lbH("div", { class: "lb-nota" }, DED.reglas[r.id].dice)),
            lbH("td", { class: "lb-mono", dir: "ltr" }, r.forma), lbH("td", { class: "lb-mono", dir: "ltr" }, r.taut ? tautTxt(r.taut) : dT("dnSinTaut"))))))),
        lbSaber(dT("dnLimiteTit"), dT("dnLimite"))));
    /* el aviso nuevo se dice en la región estable (texto plano); el visible queda donde estaba */
    if (st.msg !== msgDicho) { msgDicho = st.msg; vivo.textContent = st.msg && msg ? msg.textContent : ""; }
    /* devolver el foco al mismo control; si ya no está o está desactivado, al enunciado */
    if (foco) { const n = cuerpo.querySelector('[data-k="' + foco + '"]'), dest = n && !n.disabled ? n : cuerpo.querySelector('[data-k="enun"]'); if (dest && dest.focus) dest.focus(); }
  }
  return { montar(b) {
    box = b; cuerpo = lbH("div", {}); vivo = lbH("div", { role: "status", "aria-live": "polite", "aria-atomic": "true", style: SOLO_LECTOR }); msgDicho = null;
    box.replaceChildren(cuerpo, vivo); pintar();
  } };
})();
if (typeof module !== "undefined") module.exports = { LB_DN, LB_DN_EJ, LB_DN_REGLAS };
