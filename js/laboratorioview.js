"use strict";
/* ===== Rincón de lógica · «Laboratorio» (20-10-2026) =====
   Pestaña de arriba del Rincón con cinco mesas: Hablamos, Árbol de verdad, Mundo de figuras, Relaciones y
   Demostraciones guiadas. Origen: artefacto «Laboratorio de lógica» del profesor (20-10-2026), revisado:
   · analizador proposicional (LB_PL): letras p-u; «v» es siempre «o» (no hay ninguna variable v, así que nunca
     choca: «pvq», «p v q» y «(p)v(q)» valen igual); acepta ∨ v | + · ∧ & ^ * · → -> => > ⊃ ⇒ · ↔ <-> <=> <> ≡ ⇔ ·
     ¬ ~ ∼ ! − y paréntesis [ ] { }. El original rompía con «pvq», «=>» y «⊃». Pruebas: tools/test_lab_parser.js.
   · Mundo de figuras: los predicados se escriben en la lengua de la web (LAB.pred) o en castellano.
   Textos en laboratorio.js (LAB, memoria de traducción); aquí solo motores, fórmulas y dibujo.
   Se monta desde logicaview.js (logRender → labMontar) en #logicabox; enlace profundo #logica/<mesa>. */

const LB_MESAS = ["hablamos", "arbol", "deduccion", "induccion", "mundo", "relaciones", "demos", "kant", "mundos"];   /* (22-10, nube) + «Deducción natural» (laboratorio_deduccionview.js) */   /* (21-10) + «Juicios de Kant»; + «Spinoza» (en desarrollo, laboratorio_mundosview.js) */
const lbT = (k, v) => String((LAB.t && LAB.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));

/* ---------- PL: lógica proposicional ---------- */
const LB_PL = (() => {
  /* símbolos de varios caracteres primero (el orden importa: «<->» antes que «->» y «>») */
  const MULTI = [["<->", "iff"], ["<=>", "iff"], ["<>", "iff"], ["->", "imp"], ["=>", "imp"], ["&&", "and"], ["||", "or"]];
  const UNO = { "¬": "not", "~": "not", "∼": "not", "!": "not", "−": "not", "-": "not",
    "∧": "and", "&": "and", "^": "and", "·": "and", "*": "and",
    "∨": "or", "|": "or", "+": "or", "v": "or",
    "→": "imp", ">": "imp", "⊃": "imp", "⇒": "imp",
    "↔": "iff", "≡": "iff", "⇔": "iff" };
  const ABRE = "([{", CIERRA = ")]}";
  function tokens(s) {
    const out = [];
    s = String(s);
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const m = MULTI.find(([x]) => s.startsWith(x, i));
      if (m) { out.push({ k: "op", v: m[1] }); i += m[0].length; continue; }
      if (ABRE.includes(c)) { out.push({ k: "(" }); i++; continue; }
      if (CIERRA.includes(c)) { out.push({ k: ")" }); i++; continue; }
      if (/[p-u]/.test(c)) { out.push({ k: "var", v: c }); i++; continue; }
      if (UNO[c]) { out.push({ k: "op", v: UNO[c] }); i++; continue; }
      if (/[P-U]/.test(c)) throw new Error(lbT("errMayus"));
      throw new Error(lbT("errCar", { c }));
    }
    return out;
  }
  function parse(s) {
    const t = tokens(s);
    if (!t.length) throw new Error(lbT("errVacia"));
    let i = 0;
    const peek = () => t[i];
    const isOp = (v) => peek() && peek().k === "op" && peek().v === v;
    function iff() { let a = imp(); while (isOp("iff")) { i++; a = { t: "iff", a, b: imp() }; } return a; }
    function imp() { const a = or(); if (isOp("imp")) { i++; return { t: "imp", a, b: imp() }; } return a; }
    function or() { let a = and(); while (isOp("or")) { i++; a = { t: "or", a, b: and() }; } return a; }
    function and() { let a = un(); while (isOp("and")) { i++; a = { t: "and", a, b: un() }; } return a; }
    function un() {
      const k = peek();
      if (!k) throw new Error(lbT("errFalta"));
      if (k.k === "op" && k.v === "not") { i++; return { t: "not", a: un() }; }
      if (k.k === "var") { i++; return { t: "var", n: k.v }; }
      if (k.k === "(") {
        i++; const a = iff();
        if (!peek() || peek().k !== ")") throw new Error(lbT("errParen"));
        i++; return a;
      }
      if (k.k === ")") throw new Error(lbT("errFalta"));
      throw new Error(lbT("errConectiva"));
    }
    const r = iff();
    if (i < t.length) throw new Error(lbT("errSobra"));
    return r;
  }
  const SYM = { and: "∧", or: "∨", imp: "→", iff: "↔" };
  function str(f, parent) {
    if (f.t === "var") return f.n;
    if (f.t === "not") return "¬" + str(f.a, "not");
    const s = str(f.a, f.t) + " " + SYM[f.t] + " " + str(f.b, f.t);
    return parent ? "(" + s + ")" : s;
  }
  const key = (f) => str(f);
  const neg = (f) => ({ t: "not", a: f });
  /* regla del árbol: { tipo: "alfa"|"beta", nombre, ramas } o null si es un literal */
  function regla(f) {
    if (f.t === "var") return null;
    if (f.t === "and") return { tipo: "alfa", nombre: "∧", ramas: [[f.a, f.b]] };
    if (f.t === "or") return { tipo: "beta", nombre: "∨", ramas: [[f.a], [f.b]] };
    if (f.t === "imp") return { tipo: "beta", nombre: "→", ramas: [[neg(f.a)], [f.b]] };
    if (f.t === "iff") return { tipo: "beta", nombre: "↔", ramas: [[f.a, f.b], [neg(f.a), neg(f.b)]] };
    const g = f.a;
    if (g.t === "var") return null;
    if (g.t === "not") return { tipo: "alfa", nombre: "¬¬", ramas: [[g.a]] };
    if (g.t === "and") return { tipo: "beta", nombre: "¬∧", ramas: [[neg(g.a)], [neg(g.b)]] };
    if (g.t === "or") return { tipo: "alfa", nombre: "¬∨", ramas: [[neg(g.a), neg(g.b)]] };
    if (g.t === "imp") return { tipo: "alfa", nombre: "¬→", ramas: [[g.a, neg(g.b)]] };
    if (g.t === "iff") return { tipo: "beta", nombre: "¬↔", ramas: [[g.a, neg(g.b)], [neg(g.a), g.b]] };
    return null;
  }
  function evalv(f, v) {
    switch (f.t) {
      case "var": return !!v[f.n];
      case "not": return !evalv(f.a, v);
      case "and": return evalv(f.a, v) && evalv(f.b, v);
      case "or": return evalv(f.a, v) || evalv(f.b, v);
      case "imp": return !evalv(f.a, v) || evalv(f.b, v);
      case "iff": return evalv(f.a, v) === evalv(f.b, v);
    }
    return false;
  }
  return { tokens, parse, str, key, neg, regla, evalv };
})();

/* ---------- árbol de verdad ----------
   Nodo: { lines:[{id,f,de,regla,usada}], kids:[], cerrada:null|[id,id] }. Una línea se desarrolla una sola vez y su
   resultado se cuelga de todas las ramas abiertas que pasan por ella. */
const LB_TREE = (() => {
  function crear(formulas, etiquetas) {
    let n = 0;
    const raiz = { lines: formulas.map((f, i) => ({ id: ++n, f, de: null, regla: etiquetas[i], usada: false })), kids: [], cerrada: null };
    const t = { raiz, n, pasos: 0 };
    cierres(t);
    return t;
  }
  function hojas(nodo, camino = [], out = []) {
    const c = camino.concat([nodo]);
    if (!nodo.kids.length) out.push({ hoja: nodo, camino: c });
    else nodo.kids.forEach((k) => hojas(k, c, out));
    return out;
  }
  const lineasDe = (camino) => camino.flatMap((n) => n.lines);
  function cierres(t) {
    hojas(t.raiz).forEach(({ hoja, camino }) => {
      if (hoja.cerrada) return;
      const ls = lineasDe(camino), vistos = new Map();
      for (const l of ls) vistos.set(LB_PL.key(l.f), l.id);
      for (const l of ls) {
        const contra = l.f.t === "not" ? LB_PL.key(l.f.a) : LB_PL.key(LB_PL.neg(l.f));
        if (vistos.has(contra)) { hoja.cerrada = [vistos.get(contra), l.id].sort((a, b) => a - b); return; }
      }
    });
  }
  function buscar(t, id) {
    let res = null;
    (function rec(n) {
      const l = n.lines.find((x) => x.id === id);
      if (l) { res = { nodo: n, linea: l }; return; }
      n.kids.forEach((k) => !res && rec(k));
    })(t.raiz);
    return res;
  }
  const abiertaBajo = (nodo) => hojas(nodo).some((h) => !h.hoja.cerrada);
  function desarrollable(t, id) {
    const b = buscar(t, id);
    return !!(b && !b.linea.usada && LB_PL.regla(b.linea.f) && abiertaBajo(b.nodo));
  }
  function desarrollar(t, id) {
    const b = buscar(t, id);
    if (!b) return false;
    const r = LB_PL.regla(b.linea.f);
    if (!r || b.linea.usada) return false;
    b.linea.usada = true; t.pasos++;
    hojas(b.nodo).forEach(({ hoja }) => {
      if (hoja.cerrada) return;
      const nueva = (fs) => fs.map((f) => ({ id: ++t.n, f, de: id, regla: r.nombre, usada: false }));
      if (r.tipo === "alfa") hoja.lines.push(...nueva(r.ramas[0]));
      else hoja.kids = r.ramas.map((fs) => ({ lines: nueva(fs), kids: [], cerrada: null }));
    });
    cierres(t);
    return true;
  }
  function pendientes(t) {
    const ids = [];
    (function rec(n) { n.lines.forEach((l) => { if (desarrollable(t, l.id)) ids.push(l.id); }); n.kids.forEach(rec); })(t.raiz);
    return ids;
  }
  /* estrategia: primero las alfa (no abren ramas) */
  function siguiente(t) {
    const ids = pendientes(t);
    if (!ids.length) return null;
    return ids.find((id) => LB_PL.regla(buscar(t, id).linea.f).tipo === "alfa") || ids[0];
  }
  function valoracion(camino) {
    const v = {};
    lineasDe(camino).forEach((l) => {
      if (l.f.t === "var") v[l.f.n] = true;
      else if (l.f.t === "not" && l.f.a.t === "var") v[l.f.a.n] = false;
    });
    return v;
  }
  function estado(t) {
    const hs = hojas(t.raiz), abiertas = hs.filter((h) => !h.hoja.cerrada), terminado = !pendientes(t).length;
    return { total: hs.length, cerradas: hs.length - abiertas.length, abiertas: abiertas.length, terminado, todasCerradas: !abiertas.length,
      modelos: terminado ? abiertas.map((h) => valoracion(h.camino)) : [] };
  }
  const clonar = (t) => JSON.parse(JSON.stringify(t));
  /* para las pruebas: ¿es válido? (desarrolla el árbol entero) */
  function valido(premisas, conclusion) {
    const fs = premisas.map(LB_PL.parse).concat(conclusion ? [LB_PL.neg(LB_PL.parse(conclusion))] : []);
    const t = crear(fs, fs.map(() => "")); let id, n = 0;
    while ((id = siguiente(t)) && n++ < 500) desarrollar(t, id);
    return estado(t).todasCerradas;
  }
  return { crear, desarrollar, desarrollable, siguiente, estado, clonar, valido };
})();

/* ---------- FO: predicados en un mundo de figuras ---------- */
const LB_FO = (() => {
  /* clave canónica → [aridad, prueba]; el nombre visible sale de LAB.pred (y se acepta también el castellano) */
  const PRED = {
    Cuadrado: [1, (o) => o.forma === "cuadrado"], Circulo: [1, (o) => o.forma === "circulo"], Triangulo: [1, (o) => o.forma === "triangulo"],
    Rojo: [1, (o) => o.color === "rj"], Azul: [1, (o) => o.color === "az"], Verde: [1, (o) => o.color === "vd"],
    Grande: [1, (o) => o.tam === "grande"], Pequeno: [1, (o) => o.tam === "pequeno"],
    Izquierda: [2, (o, p) => o.pos < p.pos], MayorQue: [2, (o, p) => o.tam === "grande" && p.tam === "pequeno"],
    MismoColor: [2, (o, p) => o.color === p.color], MismaForma: [2, (o, p) => o.forma === p.forma]
  };
  const ES = { Cuadrado: "Cuadrado", Circulo: "Círculo", Triangulo: "Triángulo", Rojo: "Rojo", Azul: "Azul", Verde: "Verde", Grande: "Grande", Pequeno: "Pequeño",
    Izquierda: "Izquierda", MayorQue: "MayorQue", MismoColor: "MismoColor", MismaForma: "MismaForma" };
  const nombre = (k) => (LAB.pred && LAB.pred[k]) || ES[k] || k;
  const sinTilde = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  function clave(palabra) {
    const p = sinTilde(palabra);
    return Object.keys(PRED).find((k) => sinTilde(nombre(k)) === p || sinTilde(ES[k]) === p || sinTilde(k) === p) || null;
  }
  const VARS = "xyzw", CONST = "abcdef";
  function tokens(s) {
    s = String(s);
    const out = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const m2 = ["<->", "<=>", "->", "=>", "!="].find((x) => s.startsWith(x, i));
      if (m2) { out.push(m2 === "!=" ? { k: "≠" } : { k: "op", v: m2.includes("<") ? "iff" : "imp" }); i += m2.length; continue; }
      if ("([{".includes(c)) { out.push({ k: "(" }); i++; continue; }
      if (")]}".includes(c)) { out.push({ k: ")" }); i++; continue; }
      if (c === "," || c === "=") { out.push({ k: c }); i++; continue; }
      if (c === "∀") { out.push({ k: "q", v: "all" }); i++; continue; }
      if (c === "∃") { out.push({ k: "q", v: "ex" }); i++; continue; }
      if ("¬~∼!".includes(c)) { out.push({ k: "op", v: "not" }); i++; continue; }
      if ("∧&".includes(c)) { out.push({ k: "op", v: "and" }); i++; continue; }
      if ("∨|".includes(c)) { out.push({ k: "op", v: "or" }); i++; continue; }
      if ("→⊃".includes(c)) { out.push({ k: "op", v: "imp" }); i++; continue; }
      if ("↔≡".includes(c)) { out.push({ k: "op", v: "iff" }); i++; continue; }
      if (c === "≠") { out.push({ k: "≠" }); i++; continue; }
      /* una palabra de dos letras o más es un predicado (en cualquier alfabeto); una sola letra, variable o nombre */
      const m = /^[\p{L}\p{M}_]+/u.exec(s.slice(i));
      if (m && m[0].length > 1) {
        const k = clave(m[0]);
        if (!k) throw new Error(lbT("foPredDesc", { p: m[0] }));
        out.push({ k: "pred", v: k }); i += m[0].length; continue;
      }
      if (VARS.includes(c)) { out.push({ k: "var", v: c }); i++; continue; }
      if (CONST.includes(c)) { out.push({ k: "const", v: c }); i++; continue; }
      throw new Error(lbT("errCar", { c }));
    }
    return out;
  }
  function parse(s) {
    const t = tokens(s);
    if (!t.length) throw new Error(lbT("foEscribe"));
    let i = 0;
    const peek = () => t[i];
    const isOp = (v) => peek() && peek().k === "op" && peek().v === v;
    const expect = (k, msg) => { if (!peek() || peek().k !== k) throw new Error(msg); i++; };
    function iff() { let a = imp(); while (isOp("iff")) { i++; a = { t: "iff", a, b: imp() }; } return a; }
    function imp() { const a = or(); if (isOp("imp")) { i++; return { t: "imp", a, b: imp() }; } return a; }
    function or() { let a = and(); while (isOp("or")) { i++; a = { t: "or", a, b: and() }; } return a; }
    function and() { let a = un(); while (isOp("and")) { i++; a = { t: "and", a, b: un() }; } return a; }
    function term() {
      const k = peek();
      if (k && (k.k === "var" || k.k === "const")) { i++; return { k: k.k, v: k.v }; }
      throw new Error(lbT("foTermino"));
    }
    function un() {
      const k = peek();
      if (!k) throw new Error(lbT("foFalta"));
      if (k.k === "op" && k.v === "not") { i++; return { t: "not", a: un() }; }
      if (k.k === "q") {
        i++; const v = peek();
        if (!v || v.k !== "var") throw new Error(lbT("foCuant"));
        i++; return { t: k.v, v: v.v, a: un() };
      }
      if (k.k === "pred") {
        i++; const ar = PRED[k.v][0], nom = nombre(k.v);
        expect("(", lbT("foParen", { p: nom, e: nom + (ar === 1 ? "(x)" : "(x, y)") }));
        const args = [term()];
        while (peek() && peek().k === ",") { i++; args.push(term()); }
        expect(")", lbT("foCierra", { p: nom }));
        if (args.length !== ar) throw new Error(lbT(ar === 1 ? "foArgs1" : "foArgs2", { p: nom }));
        return { t: "pred", p: k.v, args };
      }
      if (k.k === "var" || k.k === "const") {
        const a = term();
        if (peek() && peek().k === "=") { i++; return { t: "eq", args: [a, term()] }; }
        if (peek() && peek().k === "≠") { i++; return { t: "not", a: { t: "eq", args: [a, term()] } }; }
        throw new Error(lbT("foSolo"));
      }
      if (k.k === "(") { i++; const a = iff(); expect(")", lbT("foCierraP")); return a; }
      throw new Error(lbT("foMal"));
    }
    const r = iff();
    if (i < t.length) throw new Error(lbT("foSobra"));
    return r;
  }
  const SYM = { and: "∧", or: "∨", imp: "→", iff: "↔" };
  function str(f, par) {
    switch (f.t) {
      case "pred": return nombre(f.p) + "(" + f.args.map((a) => a.v).join(", ") + ")";
      case "eq": return f.args[0].v + " = " + f.args[1].v;
      case "not": return f.a.t === "eq" ? f.a.args[0].v + " ≠ " + f.a.args[1].v : "¬" + str(f.a, true);
      case "all": return "∀" + f.v + " " + str(f.a, true);
      case "ex": return "∃" + f.v + " " + str(f.a, true);
      default: { const s = str(f.a, true) + " " + SYM[f.t] + " " + str(f.b, true); return par ? "(" + s + ")" : s; }
    }
  }
  function ref(term, mundo, env) {
    if (term.k === "var") {
      if (!(term.v in env)) throw new Error(lbT("foSuelta", { v: term.v }));
      return env[term.v];
    }
    const o = mundo.find((x) => x.nombre === term.v);
    if (!o) throw new Error(lbT("foNoNombra", { v: term.v }));
    return o;
  }
  function ev(f, mundo, env = {}) {
    switch (f.t) {
      case "pred": return PRED[f.p][1](...f.args.map((a) => ref(a, mundo, env)));
      case "eq": return ref(f.args[0], mundo, env) === ref(f.args[1], mundo, env);
      case "not": return !ev(f.a, mundo, env);
      case "and": return ev(f.a, mundo, env) && ev(f.b, mundo, env);
      case "or": return ev(f.a, mundo, env) || ev(f.b, mundo, env);
      case "imp": return !ev(f.a, mundo, env) || ev(f.b, mundo, env);
      case "iff": return ev(f.a, mundo, env) === ev(f.b, mundo, env);
      case "all": return mundo.every((o) => ev(f.a, mundo, { ...env, [f.v]: o }));
      case "ex": return mundo.some((o) => ev(f.a, mundo, { ...env, [f.v]: o }));
    }
    return false;
  }
  /* explica el valor: ∀ falso → contraejemplos; ∃ verdadero → testigos; ∀ con antecedente vacío → verdad vacua */
  function explicar(f, mundo) {
    const valor = ev(f, mundo), res = { valor, marcados: [], nota: "" };
    if (f.t === "all") {
      const malos = mundo.filter((o) => !ev(f.a, mundo, { [f.v]: o }));
      if (!valor) { res.marcados = malos; res.nota = "contraejemplo"; }
      else if (f.a.t === "imp" && mundo.length && mundo.every((o) => !ev(f.a.a, mundo, { [f.v]: o }))) res.nota = "vacua";
    } else if (f.t === "ex") {
      if (valor) { res.marcados = mundo.filter((o) => ev(f.a, mundo, { [f.v]: o })); res.nota = "testigo"; }
    }
    return res;
  }
  return { parse, str, ev, explicar, nombre, PRED };
})();

/* ---------- Hablamos: una conectiva binaria = 4 salidas para (V,V), (V,F), (F,V), (F,F) ---------- */
const LB_HB = (() => {
  const SIM = { "1000": "∧", "1110": "∨", "1011": "→", "1001": "↔", "0110": "⊕", "0111": "↑", "0001": "↓", "1101": "←",
    "1111": "⊤", "0000": "⊥", "1100": "π₁", "1010": "π₂", "0011": "¬π₁", "0101": "¬π₂", "0100": "↛", "0010": "↚" };
  const HABITUALES = ["1000", "1110", "1011", "1001", "0110", "0111", "0001", "1101"];
  const NIVELES = { 1: HABITUALES.slice(0, 4), 2: HABITUALES, 3: Object.keys(SIM) };
  const celda = (x, y) => (x ? 0 : 2) + (y ? 0 : 1);
  const aplicar = (tabla, x, y) => tabla[celda(x, y)] === "1";
  function valor(o, tabla, at) { return typeof o === "string" ? at[o] : aplicar(tabla, valor(o.a, tabla, at), valor(o.b, tabla, at)); }
  function str(o, simbolo, top = true) {
    if (typeof o === "string") return o;
    const s = str(o.a, simbolo, false) + " " + simbolo + " " + str(o.b, simbolo, false);
    return top ? s : "(" + s + ")";
  }
  const candidatas = (nivel, datos, at) => NIVELES[nivel].filter((tb) => datos.every((d) => valor(d.o, tb, at) === d.v));
  const posibles = (nivel, datos, at, o) => [...new Set(candidatas(nivel, datos, at).map((tb) => valor(o, tb, at)))];
  const refutacion = (hip, datos, at) => datos.find((d) => valor(d.o, hip, at) !== d.v) || null;
  return { SIM, HABITUALES, NIVELES, valor, str, candidatas, posibles, refutacion };
})();

/* ---------- relaciones binarias ---------- */
const LB_RL = (() => {
  const FORM = { refl: "∀x Rxx", irrefl: "∀x ¬Rxx", sim: "∀x∀y (Rxy → Ryx)", asim: "∀x∀y (Rxy → ¬Ryx)", antisim: "∀x∀y (Rxy ∧ Ryx → x = y)",
    trans: "∀x∀y∀z (Rxy ∧ Ryz → Rxz)", conexa: "∀x∀y (x ≠ y → Rxy ∨ Ryx)" };
  /* R: Set de "ab" (de a hacia b). Devuelve { ok, contra } */
  function comprobar(id, R, dom, N = (x) => x) {
    const r = (x, y) => R.has(x + y);
    for (const x of dom) {
      if (id === "refl" && !r(x, x)) return { ok: false, contra: lbT("reCSinRefl", { x: N(x) }) };
      if (id === "irrefl" && r(x, x)) return { ok: false, contra: lbT("reCRefl", { x: N(x) }) };
      for (const y of dom) {
        if (id === "sim" && r(x, y) && !r(y, x)) return { ok: false, contra: lbT("reCSim", { x: N(x), y: N(y) }) };
        if (id === "asim" && r(x, y) && r(y, x)) return { ok: false, contra: x === y ? lbT("reCRefl", { x: N(x) }) : lbT("reCVaVuelve", { x: N(x), y: N(y) }) };
        if (id === "antisim" && x !== y && r(x, y) && r(y, x)) return { ok: false, contra: lbT("reCVaVuelve", { x: N(x), y: N(y) }) };
        if (id === "conexa" && x !== y && !r(x, y) && !r(y, x)) return { ok: false, contra: lbT("reCConexa", { x: N(x), y: N(y) }) };
        if (id === "trans") for (const z of dom) if (r(x, y) && r(y, z) && !r(x, z)) return { ok: false, contra: lbT("reCTrans", { x: N(x), y: N(y), z: N(z) }) };
      }
    }
    return { ok: true, contra: "" };
  }
  return { FORM, comprobar };
})();

if (typeof module !== "undefined") module.exports = { LB_PL, LB_TREE, LB_FO, LB_HB, LB_RL };

/* ================= interfaz (solo en el navegador) ================= */
const LB_SVGNS = "http://www.w3.org/2000/svg";
function lbH(tag, attrs = {}, ...kids) {
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
function lbS(tag, attrs = {}) { const e = document.createElementNS(LB_SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; }
const lbAzar = (a) => a[Math.floor(Math.random() * a.length)];
const lbBarajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const lbFmtN = (x, o) => { try { return x.toLocaleString(document.documentElement.lang || "es", o); } catch (e) { return String(x); } };
const lbMono = (txt) => lbH("span", { class: "lb-mono", dir: "ltr" }, txt);
function lbInsertar(inp, txt) {
  const a = inp.selectionStart != null ? inp.selectionStart : inp.value.length, b = inp.selectionEnd != null ? inp.selectionEnd : a;
  inp.value = inp.value.slice(0, a) + txt + inp.value.slice(b);
  inp.focus(); inp.setSelectionRange(a + txt.length, a + txt.length);
}
function lbAviso(cls, html) { return lbH("div", { class: "lb-aviso lb-" + cls, html }); }
function lbSaber(tit, ...ps) { return lbH("details", { class: "lb-saber" }, lbH("summary", {}, tit), ...ps.map((p) => lbH("p", { html: p }))); }
function lbChip(txt, pressed, onclick, extra = {}) { return lbH("button", Object.assign({ type: "button", class: "chip", "aria-pressed": String(!!pressed), onclick }, extra), txt); }
/* figura en un <svg> 0 0 100 100; colores de la web (styles.css) */
function lbFigura(forma, color, tam, cx = 50, cy = 50) {
  const r = tam === "grande" ? 38 : 22;
  const a = { class: "lb-fig lb-fig-" + color };
  if (forma === "circulo") return lbS("circle", { cx, cy, r, ...a });
  if (forma === "cuadrado") return lbS("rect", { x: cx - r * 0.88, y: cy - r * 0.88, width: r * 1.76, height: r * 1.76, rx: 3, ...a });
  return lbS("polygon", { points: `${cx},${cy - r} ${cx + r},${cy + r * 0.8} ${cx - r},${cy + r * 0.8}`, ...a });
}
const lbDescFig = (o) => lbT("muFigura", { forma: LAB.forma[o.forma], color: LAB.color[o.color], tam: LAB.tam[o.tam] });

/* ================= HABLAMOS ================= */
const LB_HBU = (() => {
  const SIMBOLOS = ["⊛", "◇", "⋈", "♁", "⧖", "※"];
  const PROPS = [["color", "rj"], ["color", "az"], ["tam", "grande"], ["tam", "pequeno"]];
  const st = { nivel: 1, puntos: 0, rondas: 0, ronda: null, fb: null, ver: null };
  function nuevaRonda() {
    const figs = ["circulo", "cuadrado", "triangulo"].map((f) => ({ forma: f, color: lbAzar(["rj", "az"]), tam: lbAzar(["grande", "pequeno"]) }));
    let dicc, at;
    do {
      const orden = lbBarajar(figs);
      dicc = ["p", "q", "r"].map((l, i) => { const f = orden[i], pr = lbAzar(PROPS); return { l, txt: LAB.frase[f.forma + "_" + pr[1]], v: f[pr[0]] === pr[1] }; });
      at = Object.fromEntries(dicc.map((d) => [d.l, d.v]));
    } while (dicc.every((d) => d.v) || dicc.every((d) => !d.v));
    const pool = [];
    for (const a of "pqr") for (const b of "pqr") pool.push({ a, b });
    const R = { figs, dicc, at, secreto: lbAzar(LB_HB.NIVELES[st.nivel]), sim: lbAzar(SIMBOLOS), datos: [], cola: lbBarajar(pool), hip: ["?", "?", "?", "?"], resuelta: false, ayuda: false, pregunta: null };
    if (st.nivel === 3) for (let i = 0; i < 6; i++) R.cola.push({ a: { a: lbAzar("pqr"), b: lbAzar("pqr") }, b: lbAzar("pqr") });
    for (let i = 0; i < 2; i++) { const o = R.cola.shift(); R.datos.push({ o, v: LB_HB.valor(o, R.secreto, at) }); }
    st.ronda = R; siguiente(); st.fb = null; st.ver = null;
  }
  function siguiente() {
    const R = st.ronda;
    if (!R.cola.length) R.cola.push({ a: { a: lbAzar("pqr"), b: lbAzar("pqr") }, b: lbAzar("pqr") });
    R.pregunta = R.cola.shift();
  }
  const vf = (b) => lbT(b ? "verdadera" : "falsa");
  function responder(v) {
    const R = st.ronda;
    if (R.resuelta || !R.pregunta) return;
    const o = R.pregunta, real = LB_HB.valor(o, R.secreto, R.at), pos = LB_HB.posibles(st.nivel, R.datos, R.at, o), frase = LB_HB.str(o, R.sim);
    let cls, txt, d;
    if (pos.length === 1) {
      if (v === real) { d = 10; cls = "ok"; txt = lbT("hbOk10", { o: frase, v: vf(real) }); }
      else { d = -15; cls = "mal"; txt = lbT("hbMal15", { o: frase, v: vf(real) }); }
    } else if (v === real) { d = 5; cls = "ok"; txt = lbT("hbOk5"); }
    else { d = -3; cls = "warn"; txt = lbT("hbMal3"); }
    st.puntos += d;
    R.datos.push({ o, v: real, nuevo: true });
    st.fb = [cls, txt];
    siguiente(); pintar();
  }
  function proponer() {
    const R = st.ronda;
    if (R.resuelta) return;
    if (R.hip.includes("?")) { st.ver = ["warn", lbT("hbRellena")]; pintar(); return; }
    const hip = R.hip.map((c) => (c === "V" ? "1" : "0")).join("");
    if (hip === R.secreto) {
      st.puntos += 20; st.rondas++; R.resuelta = true;
      st.ver = ["ok", lbT("hbCorrecta", { s: R.sim, nom: LAB.conectiva["c" + R.secreto], sim: LB_HB.SIM[R.secreto] }) + (LB_HB.HABITUALES.includes(R.secreto) ? "" : lbT("hbRara")), true];
    } else {
      const ref = LB_HB.refutacion(hip, R.datos, R.at);
      st.puntos -= ref ? 5 : 2;
      st.ver = ref ? ["mal", lbT("hbNoEncaja", { o: LB_HB.str(ref.o, R.sim), tuyo: vf(!ref.v), suyo: vf(ref.v) })]
        : ["warn", lbT("hbCabe", { n: LB_HB.candidatas(st.nivel, R.datos, R.at).length })];
    }
    pintar();
  }
  let box = null;
  function pintar() {
    if (!box || !box.isConnected) return;
    if (!st.ronda) nuevaRonda();
    const R = st.ronda, sim = R.sim;
    const escena = lbS("svg", { class: "lb-escena", viewBox: "0 0 360 140", role: "img", "aria-label": lbT("hbEscenaAria", { d: R.figs.map(lbDescFig).join("; ") }) });
    R.figs.forEach((f, i) => { const sub = lbS("svg", { x: 20 + i * 115, y: 20, width: 100, height: 100, viewBox: "0 0 100 100" }); sub.append(lbFigura(f.forma, f.color, f.tam)); escena.append(sub); });
    const filas = [["V", "V"], ["V", "F"], ["F", "V"], ["F", "F"]];
    const tabla = lbH("table", { class: "lb-tv", dir: "ltr" },
      lbH("thead", {}, lbH("tr", {}, lbH("th", {}, "A"), lbH("th", {}, "B"), lbH("th", {}, "A " + sim + " B"))),
      lbH("tbody", {}, ...filas.map((f, i) => lbH("tr", {}, lbH("td", {}, lbT(f[0])), lbH("td", {}, lbT(f[1])), lbH("td", {},
        lbH("button", { type: "button", class: "lb-celda lb-" + (R.hip[i] === "?" ? "q" : R.hip[i] === "V" ? "v" : "f"), disabled: R.resuelta,
          "aria-label": lbT("hbFila", { f: lbT(f[0]) + " " + lbT(f[1]), v: R.hip[i] === "?" ? "?" : lbT(R.hip[i]) }),
          onclick: () => { R.hip[i] = { "?": "V", V: "F", F: "?" }[R.hip[i]]; pintar(); } }, R.hip[i] === "?" ? "?" : lbT(R.hip[i])))))));
    box.replaceChildren(
      lbH("p", { class: "lg-intro", html: lbT("hbLede", { s: '<span class="lb-sim">' + sim + "</span>" }) }),
      lbH("div", { class: "lb-mesa" },
        lbH("div", { class: "lb-fila lb-entre" },
          lbH("div", { class: "lb-fila", role: "group", "aria-label": lbT("hbNivel") }, lbH("span", { class: "lb-et" }, lbT("hbNivel")),
            ...[1, 2, 3].map((n) => lbChip(lbT("hbN" + n), st.nivel === n, () => { st.nivel = n; nuevaRonda(); pintar(); }))),
          lbH("div", { class: "lb-marcador", "aria-live": "polite" }, lbH("span", {}, lbT("hbPuntos") + " ", lbH("b", {}, String(st.puntos))), lbH("span", {}, lbT("hbRondas") + " ", lbH("b", {}, String(st.rondas))))),
        lbH("div", { class: "lb-dos" },
          lbH("div", { class: "lb-col" }, lbH("h3", {}, lbT("hbEscena")), escena, lbH("h3", {}, lbT("hbEntiendes")),
            lbH("div", { class: "lb-dicc" }, ...R.dicc.map((d) => lbH("div", {}, lbH("span", { class: "lb-mono lb-letra" }, d.l), lbH("span", {}, d.txt), R.ayuda ? lbH("span", { class: "lb-badge lb-" + (d.v ? "v" : "f") }, lbT(d.v ? "V" : "F")) : null))),
            lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "chip", disabled: R.ayuda, onclick: () => { if (!R.ayuda) { R.ayuda = true; st.puntos -= 3; pintar(); } } }, lbT("hbAyuda")))),
          lbH("div", { class: "lb-col" }, lbH("h3", {}, lbT("hbDicho")),
            lbH("div", { class: "lb-datos" }, ...R.datos.map((d) => { const e = lbH("div", { class: "lb-dato" + (d.nuevo ? " lb-nuevo" : "") }, lbMono(LB_HB.str(d.o, sim)), lbH("span", { class: "lb-badge lb-" + (d.v ? "v" : "f") }, lbT(d.v ? "V" : "F"))); d.nuevo = false; return e; })),
            lbH("div", { class: "lb-aviso lb-neutro" },
              lbH("div", { class: "lb-pregunta", html: R.resuelta ? lbT("hbResuelta") : lbT("hbPregunta", { o: '<span class="lb-mono" dir="ltr">' + LB_HB.str(R.pregunta, sim) + "</span>" }) }),
              lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn ghost", disabled: R.resuelta, onclick: () => responder(true) }, lbT("hbVerdadera")),
                lbH("button", { type: "button", class: "btn ghost", disabled: R.resuelta, onclick: () => responder(false) }, lbT("hbFalsa")))),
            lbH("div", { "aria-live": "polite" }, st.fb ? lbAviso(st.fb[0], st.fb[1]) : null))),
        lbH("div", { class: "lb-sep" },
          lbH("h3", {}, lbT("hbTraduccion", { s: sim })),
          lbH("p", { class: "lb-nota" }, lbT("hbTablaAyuda", { s: sim })),
          lbH("div", { class: "lb-fila lb-arriba" }, tabla,
            lbH("div", { class: "lb-col lb-crece" }, lbH("button", { type: "button", class: "btn", disabled: R.resuelta, onclick: proponer }, lbT("hbProponer")),
              lbH("div", { "aria-live": "polite" }, st.ver ? lbAviso(st.ver[0], st.ver[1]) : null,
                st.ver && st.ver[2] ? lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn", onclick: () => { nuevaRonda(); pintar(); } }, lbT("hbNueva"))) : null)))),
        lbSaber(lbT("hbSaberTit"), lbT("hbSaber1"), lbT("hbSaber2"), lbT("hbSaber3"))));
  }
  return { montar(b) { box = b; pintar(); } };
})();

/* ================= ÁRBOL DE VERDAD ================= */
const LB_ARU = (() => {
  const EJ = [["mp", ["p → q", "p"], "q"], ["mt", ["p → q", "¬q"], "¬p"], ["ac", ["p → q", "q"], "p"], ["na", ["p → q", "¬p"], "¬q"], ["cogito", ["p → q", "p"], "q"],
    ["mal", ["(p ∧ q) → ¬r", "r"], "¬(p ∧ q)"], ["dilema", ["p ∨ q", "p → r", "q → r"], "r"], ["morgan", [], "¬(p ∧ q) ↔ (¬p ∨ ¬q)"], ["sh", ["p → q", "q → r"], "p → r"],
    ["reciproca", [], "(p → q) → (q → p)"]];
  const REGLAS = [["¬¬X", "X", 1], ["X ∧ Y", "X / Y", 1], ["¬(X ∨ Y)", "¬X / ¬Y", 1], ["¬(X → Y)", "X / ¬Y", 1],
    ["X ∨ Y", "X | Y", 0], ["X → Y", "¬X | Y", 0], ["¬(X ∧ Y)", "¬X | ¬Y", 0], ["X ↔ Y", "X, Y | ¬X, ¬Y", 0], ["¬(X ↔ Y)", "X, ¬Y | ¬X, Y", 0]];
  const st = { modo: "validez", prem: "p → q\np", concl: "q", ej: "mp", arbol: null, historia: [], pred: null, choca: [], err: "", ultimo: "lb-ar-p" };
  let box = null;
  function cargar(e) { st.prem = e[1].join("\n"); st.concl = e[2]; st.modo = e[1].length ? "validez" : "validez"; st.ej = e[0]; st.err = ""; st.pred = null; st.arbol = null; pintar(); }
  function plantar() {
    st.err = "";
    try {
      const prem = st.prem.split("\n").map((x) => x.trim()).filter(Boolean).map(LB_PL.parse);
      const fs = prem.slice(), et = prem.map(() => lbT("arPremisa"));
      if (st.modo === "validez") {
        if (!st.concl.trim()) throw new Error(lbT("arEscribeConcl"));
        fs.push(LB_PL.neg(LB_PL.parse(st.concl))); et.push(lbT("arNegConcl"));
      }
      if (!fs.length) throw new Error(lbT("arAlMenosUna"));
      st.arbol = LB_TREE.crear(fs, et); st.historia = []; st.choca = [];
    } catch (e) { st.err = e.message; st.arbol = null; }
    pintar();
    const tr = document.getElementById("lb-ar-trabajo");
    if (tr) tr.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function paso(id) {
    if (!LB_TREE.desarrollable(st.arbol, id)) return;
    st.historia.push(LB_TREE.clonar(st.arbol)); LB_TREE.desarrollar(st.arbol, id); pintarTrabajo();
  }
  function pintarNodo(n, terminado) {
    const ls = lbH("div", { class: "lb-lineas" }, ...n.lines.map((l) => {
      const clic = LB_TREE.desarrollable(st.arbol, l.id);
      const e = lbH("div", { class: "lb-linea" + (clic ? " lb-clic" : "") + (l.usada ? " lb-usada" : "") + (st.choca.includes(l.id) ? " lb-choca" : ""),
        tabindex: clic ? 0 : null, role: clic ? "button" : null, "aria-label": clic ? lbT("arDesarrollar", { l: l.id }) : null },
        lbH("span", { class: "lb-n" }, l.id + "."), lbH("span", { class: "lb-f", dir: "ltr" }, LB_PL.str(l.f)), lbH("span", { class: "lb-j" }, l.de ? lbT("arDe", { r: l.regla, l: l.de }) : l.regla));
      if (clic) { e.addEventListener("click", () => paso(l.id)); e.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); paso(l.id); } }); }
      return e;
    }));
    const nodo = lbH("div", { class: "lb-nodo" }, ls);
    if (n.kids.length) nodo.append(lbH("div", { class: "lb-ramas" }, ...n.kids.map((k) => lbH("div", { class: "lb-rama" }, pintarNodo(k, terminado)))));
    else if (n.cerrada) {
      const ver = () => { st.choca = st.choca.join() === n.cerrada.join() ? [] : n.cerrada; pintarTrabajo(); };
      nodo.append(lbH("button", { type: "button", class: "lb-fin lb-cerrada", "aria-label": lbT("arVerChoque", { a: n.cerrada[0], b: n.cerrada[1] }), onclick: ver }, "✕ " + n.cerrada.join(", ")));
    } else nodo.append(lbH("span", { class: "lb-fin " + (terminado ? "lb-abierta" : "lb-pend") }, terminado ? lbT("arAbierta") : "…"));
    return nodo;
  }
  const valTxt = (m) => { const ks = Object.keys(m).sort(); return ks.length ? ks.map((k) => k + " = " + lbT(m[k] ? "V" : "F")).join(", ") : lbT("arCualquiera"); };
  function pintarTrabajo() {
    const tr = document.getElementById("lb-ar-trabajo"); if (!tr) return;
    if (!st.arbol) { tr.hidden = true; return; }
    tr.hidden = false;
    const t = st.arbol, e = LB_TREE.estado(t);
    let ver = null;
    if (e.terminado) {
      const valido = e.todasCerradas, mods = [...new Set(e.modelos.map(valTxt))].map((x) => '<span class="lb-mono" dir="ltr">' + x + "</span>").join(lbT("arOBien"));
      let html = st.modo === "validez" ? (valido ? lbT("arValido") : lbT("arNoValido", { m: mods })) : (valido ? lbT("arIncompat") : lbT("arCompat", { m: mods }));
      if (st.pred) html += (st.pred === "pSi") === valido ? lbT("arPredOk") : lbT("arPredMal");
      ver = lbAviso(valido === (st.modo === "validez") ? "ok" : "neutro", html);
    }
    tr.replaceChildren(
      lbH("div", { class: "lb-fila lb-entre" },
        lbH("p", { class: "lb-nota", "aria-live": "polite" }, e.terminado ? lbT("arTerminado", { c: e.cerradas, t: e.total }) : e.todasCerradas ? "" : lbT("arAbiertas", { a: e.abiertas })),
        lbH("div", { class: "lb-fila" },
          lbH("button", { type: "button", class: "btn ghost", disabled: e.terminado, onclick: () => { const id = LB_TREE.siguiente(st.arbol); if (id) paso(id); } }, lbT("arPaso")),
          lbH("button", { type: "button", class: "btn ghost", disabled: e.terminado, onclick: () => { let id, n = 0; st.historia.push(LB_TREE.clonar(st.arbol)); while ((id = LB_TREE.siguiente(st.arbol)) && n++ < 300) LB_TREE.desarrollar(st.arbol, id); pintarTrabajo(); } }, lbT("arTodo")),
          lbH("button", { type: "button", class: "btn ghost", disabled: !st.historia.length, onclick: () => { if (st.historia.length) { st.arbol = st.historia.pop(); pintarTrabajo(); } } }, lbT("arDeshacer")))),
      lbH("div", { class: "lb-arbol-marco" }, lbH("div", { class: "lb-arbol" }, pintarNodo(t.raiz, e.terminado))),
      lbH("div", { "aria-live": "polite" }, ver),
      lbH("details", { class: "lb-saber" }, lbH("summary", {}, lbT("arReglasTit")), lbH("p", { html: lbT("arReglasTxt") }),
        lbH("div", { class: "lb-reglas" }, ...REGLAS.map(([a, b, al]) => lbH("div", { class: "lb-regla" }, lbH("span", { dir: "ltr" }, a), lbH("span", { dir: "ltr" }, "⟶ " + b), lbH("small", {}, lbT(al ? "arAlarga" : "arAbre")))))));
  }
  function pintar() {
    if (!box || !box.isConnected) return;
    const val = st.modo === "validez", glosa = st.ej && LAB.arEj[st.ej] ? LAB.arEj[st.ej].glosa : "";
    const teclado = lbH("div", { class: "lg-teclas" }, ...["¬", "∧", "∨", "→", "↔", "(", ")", "p", "q", "r", "s"].map((c) =>
      lbH("button", { type: "button", class: "chip", onmousedown: (ev) => ev.preventDefault(), onclick: () => { const inp = document.getElementById(st.ultimo) || document.getElementById("lb-ar-p"); if (inp) { lbInsertar(inp, c); inp.dispatchEvent(new Event("input", { bubbles: true })); } } }, c)));
    const ta = lbH("textarea", { id: "lb-ar-p", class: "lg-input lb-ta", spellcheck: "false", dir: "ltr", oninput: (ev) => { st.prem = ev.target.value; st.ej = null; }, onfocus: () => (st.ultimo = "lb-ar-p") });
    ta.value = st.prem;
    const ic = lbH("input", { id: "lb-ar-c", class: "lg-input", spellcheck: "false", autocomplete: "off", dir: "ltr", oninput: (ev) => { st.concl = ev.target.value; st.ej = null; }, onfocus: () => (st.ultimo = "lb-ar-c"), onkeydown: (ev) => { if (ev.key === "Enter") plantar(); } });
    ic.value = st.concl;
    box.replaceChildren(
      lbH("p", { class: "lg-intro" }, lbT("arLede")),
      lbH("div", { class: "lb-mesa" },
        lbH("div", { class: "lb-fila" }, ...EJ.map((e) => lbChip(LAB.arEj[e[0]].nom, st.ej === e[0], () => cargar(e)))),
        lbH("div", { class: "lb-fila", role: "group" }, lbChip(lbT("arModoVal"), val, () => { st.modo = "validez"; st.arbol = null; pintar(); }), lbChip(lbT("arModoCon"), !val, () => { st.modo = "consist"; st.arbol = null; pintar(); })),
        lbH("div", { class: "lb-dos" },
          lbH("label", { class: "lb-et-campo" }, lbT(val ? "arPremisas" : "arFormulas"), ta),
          val ? lbH("label", { class: "lb-et-campo" }, lbT("arConclusion"), ic) : lbH("span")),
        teclado, lbH("p", { class: "lb-nota" }, lbT("arAyuda")),
        lbH("div", { class: "lb-fila" }, lbH("span", { class: "lb-et" }, lbT("arQueCrees")),
          lbChip(lbT(val ? "arPredSi" : "arPredSiC"), st.pred === "pSi", () => { st.pred = st.pred === "pSi" ? null : "pSi"; pintar(); }),
          lbChip(lbT(val ? "arPredNo" : "arPredNoC"), st.pred === "pNo", () => { st.pred = st.pred === "pNo" ? null : "pNo"; pintar(); })),
        lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn", onclick: plantar }, lbT("arPlantar")),
          lbH("span", { class: st.err ? "lb-err" : "lb-nota", "aria-live": "polite" }, st.err || glosa))),
      lbH("div", { class: "lb-mesa", id: "lb-ar-trabajo", hidden: true }));
    pintarTrabajo();
  }
  /* desde la demostración del barbero */
  function plantarBarbero() { st.modo = "consist"; st.prem = "p ↔ ¬p"; st.concl = ""; st.ej = null; st.pred = null; plantar(); let id, n = 0; while (st.arbol && (id = LB_TREE.siguiente(st.arbol)) && n++ < 50) LB_TREE.desarrollar(st.arbol, id); pintar(); }
  return { montar(b) { box = b; pintar(); }, plantarBarbero };
})();

/* ================= MUNDO DE FIGURAS ================= */
const LB_MUU = (() => {
  let uid = 0;
  const ob = (pos, forma, color, tam, nombre = null) => ({ id: ++uid, pos, forma, color, tam, nombre });
  const st = { mundo: [ob(0, "cuadrado", "rj", "grande", "a"), ob(1, "circulo", "az", "pequeno", "b"), ob(3, "triangulo", "vd", "grande", "c"), ob(4, "cuadrado", "az", "pequeno")], sel: null, reto: 0, activa: null, mias: [], err: "" };
  /* oraciones de los retos con las claves canónicas de los predicados (se muestran en la lengua de la web) */
  const RETOS = [
    ["Cuadrado(a)", "Rojo(b)", "Izquierda(b, a)", "MayorQue(a, b)"],
    ["∀x (Cuadrado(x) → Rojo(x))", "∃x (Circulo(x) ∧ Grande(x))", "¬∃x Verde(x)", "∃x ∃y (x ≠ y ∧ MismaForma(x, y))"],
    ["∀x (Triangulo(x) → Grande(x))", "∀x (Triangulo(x) → Pequeno(x))", "∃x Cuadrado(x)"],
    ["∀x (Circulo(x) → ∃y (Cuadrado(y) ∧ Izquierda(x, y)))", "∀x ∀y (MismaForma(x, y) → MismoColor(x, y))", "∃x ∀y (x ≠ y → MayorQue(x, y))", "∃x Circulo(x)"],
    ["∀x (Cuadrado(x) → Azul(x))", "∃x (Cuadrado(x) ∧ ¬Azul(x))"]
  ];
  let RF = null;
  const retosF = () => RF || (RF = RETOS.map((l) => l.map((x) => LB_FO.parse(x))));
  const IMPOSIBLE = 4, VACIO = 2;
  let box = null;
  function evaluar(f) { try { return LB_FO.explicar(f, st.mundo); } catch (e) { return { error: e.message }; } }
  const casillas = (os) => os.map((o) => lbT("muLaCasilla", { n: o.pos + 1 })).join(", ");
  function filaOracion(f, glosa, quitar) {
    const r = evaluar(f);
    let x = null;
    if (r.error) x = lbH("span", { class: "lb-x lb-mal" }, r.error);
    else if (r.nota === "contraejemplo") x = lbH("span", { class: "lb-x lb-mal" }, lbT("muFalla", { c: casillas(r.marcados) }));
    else if (r.nota === "testigo") x = lbH("span", { class: "lb-x lb-okt" }, lbT("muGracias", { c: casillas(r.marcados) }));
    else if (r.nota === "vacua") x = lbH("span", { class: "lb-x lb-warn" }, lbT("muVacua"));
    const activa = st.activa && st.activa.f === f;
    const e = lbH("div", { class: "lb-oracion" + (activa ? " lb-activa" : ""), tabindex: 0, role: "button", "aria-pressed": String(!!activa),
      "aria-label": LB_FO.str(f) + ": " + (r.error ? lbT("muError") : lbT(r.valor ? "verdadera" : "falsa")) },
      r.error ? lbH("span", { class: "lb-badge lb-q" }, "?") : lbH("span", { class: "lb-badge lb-" + (r.valor ? "v" : "f") }, lbT(r.valor ? "V" : "F")),
      lbH("span", { class: "lb-f", dir: "ltr" }, LB_FO.str(f)), glosa ? lbH("span", { class: "lb-g" }, glosa) : null, x,
      quitar ? lbH("span", { class: "lb-g" }, lbH("button", { type: "button", class: "chip", onclick: (ev) => { ev.stopPropagation(); quitar(); } }, lbT("muQuitarOr"))) : null);
    const act = () => { st.activa = activa ? null : { f }; pintar(); };
    e.addEventListener("click", act); e.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); act(); } });
    return { e, r };
  }
  function editor() {
    const o = st.mundo.find((x) => x.id === st.sel);
    if (!o) return lbH("p", { class: "lb-nota" }, lbT("muEditorAyuda"));
    const opc = (lab, campo, vals) => lbH("div", { class: "lb-fila" }, lbH("span", { class: "lb-et lb-ancho" }, lab), ...vals.map(([v, t]) => lbChip(t, o[campo] === v, () => {
      if (campo === "nombre" && v) st.mundo.forEach((x) => { if (x.nombre === v) x.nombre = null; });
      o[campo] = v; pintar(); })));
    return lbH("div", { class: "lb-editor" },
      opc(lbT("muForma"), "forma", ["cuadrado", "circulo", "triangulo"].map((k) => [k, LAB.forma[k]])),
      opc(lbT("muColor"), "color", ["rj", "az", "vd"].map((k) => [k, LAB.color[k]])),
      opc(lbT("muTam"), "tam", ["grande", "pequeno"].map((k) => [k, LAB.tam[k]])),
      opc(lbT("muNombre"), "nombre", [[null, lbT("muSinNombre")], ..."abcdef".split("").map((c) => [c, c])]),
      lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn ghost", onclick: () => { st.mundo = st.mundo.filter((x) => x !== o); st.sel = null; pintar(); } }, lbT("muQuitar"))));
  }
  function pintar() {
    if (!box || !box.isConnected) return;
    const marc = st.activa ? (evaluar(st.activa.f).marcados || []) : [];
    const mundo = lbH("div", { class: "lb-mundo", role: "group", "aria-label": lbT("muMundoAria") }, ...Array.from({ length: 6 }, (_, pos) => {
      const o = st.mundo.find((x) => x.pos === pos);
      const b = lbH("button", { type: "button", class: "lb-casilla" + (o ? " lb-ocupada" : "") + (o && st.sel === o.id ? " lb-sel" : "") + (o && marc.includes(o) ? " lb-marca" : ""),
        "aria-label": o ? lbT("muCasilla", { n: pos + 1, d: lbDescFig(o) + (o.nombre ? lbT("muSeLlama", { x: o.nombre }) : "") }) : lbT("muCasillaVacia", { n: pos + 1 }),
        onclick: () => { if (!o) { const n = ob(pos, "circulo", "az", "pequeno"); st.mundo.push(n); st.sel = n.id; } else st.sel = st.sel === o.id ? null : o.id; pintar(); } });
      if (o) { const sv = lbS("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" }); sv.append(lbFigura(o.forma, o.color, o.tam)); b.append(sv); if (o.nombre) b.append(lbH("span", { class: "lb-nom" }, o.nombre)); }
      else b.append(lbH("span", { class: "lb-mas", "aria-hidden": "true" }, "+"));
      b.append(lbH("span", { class: "lb-pos", "aria-hidden": "true" }, String(pos + 1)));
      return b;
    }));
    const R = LAB.muRetos[st.reto], fs = retosF()[st.reto];
    const filas = fs.map((f, i) => filaOracion(f, R.glosas[i]));
    const todas = filas.every((x) => x.r.valor === true);
    const inp = lbH("input", { id: "lb-mu-in", class: "lg-input", spellcheck: "false", autocomplete: "off", dir: "ltr", placeholder: "∀x (" + LB_FO.nombre("Circulo") + "(x) → " + LB_FO.nombre("Azul") + "(x))" });
    const anadir = () => { st.err = ""; try { st.mias.unshift(LB_FO.parse(inp.value.trim())); } catch (e) { st.err = e.message; pintar(); const i2 = document.getElementById("lb-mu-in"); if (i2) { i2.value = inp.value; i2.focus(); } return; } pintar(); };
    inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter") anadir(); });
    const teclas = ["∀x", "∃x", "∀y", "∃y", "¬", "∧", "∨", "→", "↔", "=", "≠", "(", ")", ...["Cuadrado", "Circulo", "Triangulo", "Rojo", "Azul", "Verde", "Grande", "Pequeno", "Izquierda", "MayorQue"].map((k) => LB_FO.nombre(k) + "(")];
    const P = (k) => '<span class="lb-mono" dir="ltr">' + LB_FO.nombre(k) + "(x" + (LB_FO.PRED[k][0] === 2 ? ", y" : "") + ")</span>";
    box.replaceChildren(
      lbH("p", { class: "lg-intro", html: lbT("muLede") }),
      lbH("div", { class: "lb-mesa" }, mundo, lbH("div", { class: "lb-sep" }, editor())),
      lbH("div", { class: "lb-mesa" },
        lbH("div", { class: "lb-fila" }, ...LAB.muRetos.map((r, i) => lbChip(r.nom, i === st.reto, () => { st.reto = i; st.activa = null; pintar(); }))),
        lbH("p", {}, R.txt),
        lbH("div", { class: "lb-oraciones" }, ...filas.map((x) => x.e)),
        lbH("div", { "aria-live": "polite" }, todas ? lbAviso("ok", lbT("muConseguido") + (st.reto === VACIO ? lbT("muSujetoVacio") : "")) : st.reto === IMPOSIBLE ? lbAviso("neutro", lbT("muImposible")) : null)),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, lbT("muTuya")),
        lbH("div", { class: "lb-fila" }, inp, lbH("button", { type: "button", class: "btn", onclick: anadir }, lbT("muAnadir"))),
        lbH("div", { class: "lg-teclas" }, ...teclas.map((c) => lbH("button", { type: "button", class: "chip", onmousedown: (ev) => ev.preventDefault(), onclick: () => lbInsertar(document.getElementById("lb-mu-in"), /^[∀∃]/.test(c) ? c + " " : c) }, c))),
        lbH("span", { class: "lb-err", "aria-live": "polite" }, st.err),
        lbH("div", { class: "lb-oraciones" }, ...st.mias.map((f, i) => filaOracion(f, null, () => { st.mias.splice(i, 1); pintar(); }).e)),
        lbH("details", { class: "lb-saber" }, lbH("summary", {}, lbT("muVocTit")),
          lbH("p", { html: lbT("muVoc", { p1: ["Cuadrado", "Circulo", "Triangulo", "Rojo", "Azul", "Verde", "Grande", "Pequeno"].map(P).join(", "), p2: P("Izquierda"), p3: P("MayorQue"), p4: P("MismoColor"), p5: P("MismaForma") }) }))));
  }
  return { montar(b) { box = b; pintar(); } };
})();

/* ================= RELACIONES ================= */
const LB_REU = (() => {
  const DOM = ["a", "b", "c", "d"], POS = { a: [80, 70], b: [240, 70], c: [240, 230], d: [80, 230] }, CENTRO = [160, 150], RN = 26;
  const PRESETS = [["ab", "ba", "ac", "ca", "bc", "cb"], ["ab", "ac", "ad", "bc", "bd", "cd"], ["aa", "bb", "cc", "dd", "ab", "ba", "cd", "dc"], ["ab", "bc", "cd", "da", "aa"], []];
  const RETOS = [(c) => c.sim && !c.trans, (c, R) => c.trans && c.asim && R.size >= 3, (c, R) => c.refl && c.sim && c.trans && R.size < 16, (c) => c.refl && c.antisim && !c.trans, (c, R) => c.sim && c.asim && R.size > 0];
  const ORDEN = ["refl", "irrefl", "sim", "asim", "antisim", "trans", "conexa"];
  const st = { R: new Set(PRESETS[0]), sel: null };
  const N = (x) => LAB.persona[x];
  let box = null;
  function flecha(x, y, doble) {
    const [x1, y1] = POS[x], [x2, y2] = POS[y], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, off = doble ? 7 : 0, px = -uy * off, py = ux * off;
    return lbS("line", { x1: x1 + ux * RN + px, y1: y1 + uy * RN + py, x2: x2 - ux * (RN + 6) + px, y2: y2 - uy * (RN + 6) + py, class: "lb-flecha", "marker-end": "url(#lb-punta)" });
  }
  function lazo(x) {
    const [cx, cy] = POS[x], ang = Math.atan2(0, Math.sign(cx - CENTRO[0])), a1 = ang - 0.6, a2 = ang + 0.6;
    const p1 = [cx + Math.cos(a1) * RN, cy + Math.sin(a1) * RN], p2 = [cx + Math.cos(a2) * (RN + 5), cy + Math.sin(a2) * (RN + 5)];
    return lbS("path", { d: `M${p1[0]},${p1[1]} A17,17 0 1 1 ${p2[0]},${p2[1]}`, class: "lb-flecha", fill: "none", "marker-end": "url(#lb-punta)" });
  }
  function tocar(x) { if (!st.sel) st.sel = x; else { const k = st.sel + x; st.R.has(k) ? st.R.delete(k) : st.R.add(k); st.sel = null; } pintar(); const g = box && box.querySelector('[data-per="' + x + '"]'); if (g) g.focus(); }
  function pintar() {
    if (!box || !box.isConnected) return;
    const svg = lbS("svg", { class: "lb-rel", viewBox: "0 0 320 300", role: "group", "aria-label": lbT("reGrafo"), dir: "ltr" });
    const defs = lbS("defs"), m = lbS("marker", { id: "lb-punta", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
    m.append(lbS("path", { d: "M0,0 L10,5 L0,10 z", class: "lb-punta" })); defs.append(m); svg.append(defs);
    st.R.forEach((k) => { const [x, y] = k; svg.append(x === y ? lazo(x) : flecha(x, y, st.R.has(y + x))); });
    DOM.forEach((x) => {
      const [cx, cy] = POS[x], g = lbS("g", { class: "lb-per" + (st.sel === x ? " lb-sel" : ""), tabindex: 0, role: "button", "data-per": x, "aria-label": N(x) + (st.sel === x ? lbT("reElegida") : "") });
      g.append(lbS("circle", { cx, cy, r: RN }));
      const t1 = lbS("text", { x: cx, y: cy + 2, "text-anchor": "middle", "dominant-baseline": "middle", class: "lb-per-l" }); t1.textContent = x;
      const t2 = lbS("text", { x: cx, y: cy + (cy < 150 ? -36 : 44), "text-anchor": "middle", class: "lb-per-n" }); t2.textContent = N(x);
      g.append(t1, t2);
      g.addEventListener("click", () => tocar(x));
      g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); tocar(x); } });
      svg.append(g);
    });
    const c = {};
    const props = ORDEN.map((id) => {
      const r = LB_RL.comprobar(id, st.R, DOM, N), P = LAB.reProps[id]; c[id] = r.ok;
      return lbH("div", { class: "lb-prop" }, lbH("span", { class: "lb-badge lb-" + (r.ok ? "v" : "f") }, lbT(r.ok ? "relSi" : "relNo")),
        lbH("div", {}, lbH("b", {}, P.nom), " · ", lbH("span", { class: "lb-mono lb-suave", dir: "ltr" }, LB_RL.FORM[id]), lbH("div", { class: "lb-nota" }, P.dice)),
        r.ok ? null : lbH("span", { class: "lb-ct" }, lbT("reFalla", { c: r.contra })));
    });
    box.replaceChildren(
      lbH("p", { class: "lg-intro" }, lbT("reLede")),
      lbH("div", { class: "lb-mesa" },
        lbH("div", { class: "lb-fila" }, ...LAB.rePresets.map((p, i) => lbChip(p.nom, false, () => { st.R = new Set(PRESETS[i]); st.sel = null; pintar(); }, { title: p.glosa || null }))),
        lbH("div", { class: "lb-dos" },
          lbH("div", { class: "lb-col" }, svg, lbH("p", { class: "lb-nota lb-centro", "aria-live": "polite" }, st.sel ? lbT("reAyudaSel", { x: N(st.sel), y: N(st.sel) }) : lbT("reAyuda", { n: st.R.size }))),
          lbH("div", { class: "lb-col" }, lbH("h3", {}, lbT("reProps")), lbH("div", { class: "lb-props" }, ...props)))),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, lbT("reRetos")), lbH("p", { class: "lb-nota" }, lbT("reRetosAyuda")),
        lbH("ul", { class: "lb-retos" }, ...RETOS.map((f, i) => { const ok = f(c, st.R); return lbH("li", {}, lbH("span", { class: "lb-badge lb-" + (ok ? "v" : "q") }, ok ? "✓" : "·"), lbH("span", {}, LAB.reRetos[i])); })),
        lbSaber(lbT("reSaberTit"), lbT("reSaber"))));
  }
  return { montar(b) { box = b; pintar(); } };
})();

/* ================= DEMOSTRACIONES GUIADAS ================= */
const LB_DEU = (() => {
  const OSC = (r, c) => (r + c) % 2 === 1, QUITADA = (r, c) => (r === 7 && c === 0) || (r === 0 && c === 7);
  const st = { demo: 0, estado: {}, extraDe: null, fichas: [], fsel: null, esfera: null, obj: {} };
  let box = null;
  const demos = () => LAB.demos;
  /* ---- dibujos ---- */
  function tablero(modo) {
    const L = 26, sv = lbS("svg", { viewBox: `0 0 ${8 * L + 4} ${8 * L + 4}`, class: "lb-dib", role: "img", "aria-label": lbT("xTabAria") });
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const x = 2 + c * L, y = 2 + r * L;
      if (QUITADA(r, c)) {
        sv.append(lbS("rect", { x, y, width: L, height: L, class: modo === "esquinas" ? "lb-t-quitada lb-t-marca" : "lb-t-quitada" }));
        if (modo === "esquinas") { const t = lbS("text", { x: x + L / 2, y: y + L / 2 + 5, "text-anchor": "middle", class: "lb-t-x" }); t.textContent = "✕"; sv.append(t); }
      } else sv.append(lbS("rect", { x, y, width: L, height: L, class: OSC(r, c) ? "lb-t-osc" : "lb-t-cla" }));
    }
    if (modo === "domino") sv.append(lbS("rect", { x: 2 + 2 * L + 3, y: 2 + 3 * L + 3, width: 2 * L - 6, height: L - 6, rx: 5, class: "lb-t-ficha" }));
    return sv;
  }
  function zenonFig(n) {
    const T = 200, sv = lbS("svg", { viewBox: `0 0 ${T + 4} ${T + 4}`, class: "lb-dib", role: "img", "aria-label": lbT("xZenAria", { n }) });
    sv.append(lbS("rect", { x: 2, y: 2, width: T, height: T, class: "lb-z-fondo" }));
    let x = 2, y = 2, w = T, hh = T;
    const etq = ["½", "¼", "⅛", "1/16"];
    for (let i = 0; i < n; i++) {
      let px, py, pw, ph;
      if (i % 2 === 0) { pw = w / 2; ph = hh; px = x; py = y; x += pw; w -= pw; } else { pw = w; ph = hh / 2; px = x; py = y; y += ph; hh -= ph; }
      sv.append(lbS("rect", { x: px, y: py, width: pw, height: ph, class: "lb-z-trozo", "fill-opacity": 0.18 + 0.1 * (i % 4) }));
      if (i < 4) { const t = lbS("text", { x: px + pw / 2, y: py + ph / 2 + 6, "text-anchor": "middle", "font-size": 18 - 3 * i, class: "lb-z-t" }); t.textContent = etq[i]; sv.append(t); }
    }
    return sv;
  }
  function arco(cx, cy, r, a1, a2, cls) {
    const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const d = (a2 - a1 + 360) % 360, [x1, y1] = p(a1), [x2, y2] = p(a1 + d);
    return lbS("path", { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${d > 180 ? 1 : 0} 1 ${x2},${y2} Z`, class: "lb-arco " + cls });
  }
  function triangulo(modo) {
    const A = [40, 180], B = [270, 180], C = [115, 60], ang = (P, Q) => Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI;
    const sv = lbS("svg", { viewBox: "0 0 310 210", class: "lb-dib", role: "img", "aria-label": lbT("xTriAria2"), dir: "ltr" });
    if (modo !== "solo") sv.append(lbS("line", { x1: 10, y1: C[1], x2: 300, y2: C[1], class: "lb-paralela" }));
    sv.append(lbS("polygon", { points: [A, B, C].map((p) => p.join(",")).join(" "), class: "lb-tri" }));
    sv.append(arco(...A, 26, ang(A, C), ang(A, B), "lb-fig-rj"));
    sv.append(arco(...B, 26, 180, ang(B, C), "lb-fig-az"));
    sv.append(arco(...C, 22, ang(C, B), ang(C, A), "lb-fig-vd"));
    if (modo === "alternos" || modo === "llano") sv.append(arco(...C, 30, ang(C, A), 180, "lb-fig-rj"));
    if (modo === "llano") sv.append(arco(...C, 30, 0, ang(C, B), "lb-fig-az"));
    [["A", A, [-16, 16]], ["B", B, [8, 16]], ["C", C, [-4, -12]]].forEach(([n, P, d]) => { const t = lbS("text", { x: P[0] + d[0], y: P[1] + d[1], class: "lb-tri-t" }); t.textContent = n; sv.append(t); });
    return sv;
  }
  function esfera() {
    const sv = lbS("svg", { viewBox: "0 0 240 250", class: "lb-dib", role: "img", "aria-label": lbT("xTriAria") });
    sv.append(lbS("circle", { cx: 120, cy: 120, r: 100, class: "lb-esf" }), lbS("ellipse", { cx: 120, cy: 120, rx: 100, ry: 28, class: "lb-esf-ec" }));
    const N = [120, 20], P = [120, 148], Q = [205, 134];
    sv.append(lbS("path", { d: `M${N[0]},${N[1]} Q118,80 ${P[0]},${P[1]} Q168,146 ${Q[0]},${Q[1]} Q178,60 ${N[0]},${N[1]} Z`, class: "lb-esf-tri" }));
    [N, P, Q].forEach((p) => sv.append(lbS("rect", { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10, class: "lb-esf-rect", transform: `rotate(45 ${p[0]} ${p[1]})` })));
    const t = lbS("text", { x: 120, y: 244, "text-anchor": "middle", class: "lb-esf-t" }); t.textContent = "90° + 90° + 90° = 270°"; sv.append(t);
    return sv;
  }
  function menon(tipo) {
    const sv = lbS("svg", { viewBox: "0 0 240 250", class: "lb-dib", role: "img" }), P = 40, O = 40;
    const rect = (x, y, w, hh, cls) => sv.append(lbS("rect", { x, y, width: w, height: hh, class: cls }));
    const lin = (x1, y1, x2, y2) => sv.append(lbS("line", { x1, y1, x2, y2, class: "lb-m-rej" }));
    const txt = (x, y, t) => { const e = lbS("text", { x, y, "text-anchor": "middle", class: "lb-m-t" }); e.textContent = t; sv.append(e); };
    const rejilla = (n) => { for (let i = 1; i < n; i++) { lin(O + i * P, O, O + i * P, O + n * P); lin(O, O + i * P, O + n * P, O + i * P); } };
    if (tipo === "base") { rect(O, O, 2 * P, 2 * P, "lb-m-marco"); rejilla(2); txt(O + P, O + 2 * P + 22, lbT("menLado2")); sv.setAttribute("aria-label", lbT("menAria1")); }
    if (tipo === "lado4") { rect(O, O, 4 * P, 4 * P, "lb-m-marco"); rejilla(4); rect(O, O, 2 * P, 2 * P, "lb-m-ini"); txt(O + 2 * P, O + 4 * P + 22, lbT("menLado4")); sv.setAttribute("aria-label", lbT("menAria2")); }
    if (tipo === "lado3") { rect(O, O, 3 * P, 3 * P, "lb-m-marco"); rejilla(3); rect(O, O, 2 * P, 2 * P, "lb-m-ini"); txt(O + 1.5 * P, O + 3 * P + 22, lbT("menLado3")); sv.setAttribute("aria-label", lbT("menAria3")); }
    if (tipo === "diagonales" || tipo === "mitades") {
      rect(O, O, 4 * P, 4 * P, "lb-m-borde"); lin(O + 2 * P, O, O + 2 * P, O + 4 * P); lin(O, O + 2 * P, O + 4 * P, O + 2 * P);
      sv.append(lbS("polygon", { points: `${O + 2 * P},${O} ${O + 4 * P},${O + 2 * P} ${O + 2 * P},${O + 4 * P} ${O},${O + 2 * P}`, class: tipo === "mitades" ? "lb-m-incl lb-lleno" : "lb-m-incl" }));
      if (tipo === "mitades") { sv.append(lbS("polygon", { points: `${O},${O + 2 * P} ${O + 2 * P},${O} ${O + 2 * P},${O + 2 * P}`, class: "lb-m-mitad" })); txt(O + 2 * P, O + 4 * P + 22, lbT("menMitades")); }
      else txt(O + 2 * P, O + 4 * P + 22, lbT("menCuatro"));
      sv.setAttribute("aria-label", lbT("menAria4"));
    }
    return sv;
  }
  function dibujo(img) {
    const [q, a] = String(img).split(":");
    return q === "menon" ? menon(a) : q === "tablero" ? tablero(a) : q === "zenon" ? zenonFig(+a) : q === "triangulo" ? triangulo(a) : null;
  }
  /* ---- estado de cada demostración ---- */
  function est(d) {
    if (!st.estado[d.id]) st.estado[d.id] = { paso: 0, fallos: 0, descartadas: {}, elegida: {}, orden: d.pasos.map((p) => lbBarajar(p.op.map((_, i) => i))) };
    return st.estado[d.id];
  }
  function elegir(d, i, k) {
    const E = est(d), op = d.pasos[i].op[k];
    if (op[1]) { E.elegida[i] = k; E.paso = i + 1; } else { E.fallos++; (E.descartadas[i] = E.descartadas[i] || []).push(k); }
    pintar();
    const foco = box && box.querySelector(".lb-paso.lb-actual .lb-opciones button:not(.lb-descartada)");
    if (foco && op[1]) foco.focus({ preventScroll: true });
  }
  /* ---- actividades al pie ---- */
  function extraRaiz(c) {
    const fr = [[7, 5], [17, 12], [41, 29], [99, 70], [239, 169], [577, 408]], seis = { minimumFractionDigits: 6, maximumFractionDigits: 6 };
    const out = lbH("div", { class: "lb-res", "aria-live": "polite", dir: "ltr" });
    const ia = lbH("input", { class: "lg-input lb-num", id: "lb-de-a", type: "number", min: 1, value: 7 }), ib = lbH("input", { class: "lg-input lb-num", id: "lb-de-b", type: "number", min: 1, value: 5 });
    const prueba = () => {
      const a = Math.abs(parseInt(ia.value, 10)), b = Math.abs(parseInt(ib.value, 10));
      if (!a || !b) { out.textContent = lbT("xRaizEnteros"); return; }
      const dif = a * a - 2 * b * b;
      out.textContent = "(" + a + "/" + b + ")² ≈ " + lbFmtN((a / b) ** 2, { maximumFractionDigits: 8 }) + "  ·  a² − 2b² = " + a * a + " − " + 2 * b * b + " = " + dif + ". " + (dif === 0 ? "" : lbT("xRaizNo", { f: a + "/" + b }));
    };
    ia.addEventListener("input", prueba); ib.addEventListener("input", prueba);
    c.replaceChildren(lbH("h3", {}, lbT("xRaizTit")), lbH("p", { class: "lb-nota" }, lbT("xRaiz")),
      lbH("div", { class: "lb-scroll" }, lbH("table", { class: "lb-casi", dir: "ltr" }, lbH("thead", {}, lbH("tr", {}, lbH("th", {}, "a/b"), lbH("th", {}, lbT("xRaizDec")), lbH("th", {}, "(a/b)²"), lbH("th", {}, "a² − 2b²"))),
        lbH("tbody", {}, ...fr.map(([a, b]) => lbH("tr", {}, lbH("td", {}, a + "/" + b), lbH("td", {}, lbFmtN(a / b, seis)), lbH("td", {}, lbFmtN((a / b) ** 2, seis)), lbH("td", {}, String(a * a - 2 * b * b))))))),
      lbH("div", { class: "lb-fila", dir: "ltr" }, lbH("label", { for: "lb-de-a" }, "a"), ia, lbH("span", {}, "/"), lbH("label", { for: "lb-de-b" }, "b"), ib), out);
    prueba();
  }
  function extraEuclides(c) {
    const PR = [2, 3, 5, 7, 11, 13, 17, 19];
    const rango = lbH("input", { type: "range", min: 1, max: 8, value: 6, class: "lb-rango", "aria-label": lbT("xEucCuantos") });
    const out = lbH("div", { class: "lb-res", "aria-live": "polite" });
    const factores = (n) => { const f = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; };
    const calc = () => {
      const n = +rango.value, lista = PR.slice(0, n), N = lista.reduce((a, b) => a * b, 1) + 1, f = factores(N);
      out.innerHTML = lbT("xEucLista", { l: lista.join(", ") }) + '<br><span dir="ltr">N = ' + lista.join(" · ") + " + 1 = <b>" + lbFmtN(N) + "</b></span><br>" +
        (f.length === 1 ? lbT("xEucPrimo") : lbT("xEucNoPrimo", { n: lbFmtN(N), f: f.map((x) => lbFmtN(x)).join(" · ") }));
    };
    rango.addEventListener("input", calc);
    c.replaceChildren(lbH("h3", {}, lbT("xEucTit")), lbH("p", { class: "lb-nota" }, lbT("xEuc")), rango, out);
    calc();
  }
  function extraTablero(c) {
    const libre = (r, cc) => !QUITADA(r, cc) && !st.fichas.some((f) => f.some(([a, b]) => a === r && b === cc));
    const pintarT = () => {
      const grid = lbH("div", { class: "lb-tabint", role: "group", "aria-label": lbT("xTabGrid"), dir: "ltr" });
      for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) {
        const fi = st.fichas.findIndex((f) => f.some(([a, b]) => a === r && b === cc));
        grid.append(lbH("button", { type: "button", class: "lb-tc " + (QUITADA(r, cc) ? "lb-fuera" : OSC(r, cc) ? "lb-osc" : "lb-cla") + (fi >= 0 ? " lb-puesta" : "") + (st.fsel && st.fsel[0] === r && st.fsel[1] === cc ? " lb-elegida" : ""),
          disabled: QUITADA(r, cc), "aria-label": lbT("xTabCasilla", { r: 8 - r, c: "abcdefgh"[cc] }) + (fi >= 0 ? lbT("xTabConFicha") : ""),
          onclick: () => {
            if (fi >= 0) { st.fichas.splice(fi, 1); st.fsel = null; }
            else if (!st.fsel) st.fsel = [r, cc];
            else {
              const [r0, c0] = st.fsel, vecina = Math.abs(r0 - r) + Math.abs(c0 - cc) === 1;
              if (vecina && libre(r, cc)) st.fichas.push([[r0, c0], [r, cc]]);
              st.fsel = (r0 === r && c0 === cc) || vecina ? null : [r, cc];
            }
            pintarT();
          } }));
      }
      let cla = 0, osc = 0;
      for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) if (libre(r, cc)) OSC(r, cc) ? osc++ : cla++;
      c.replaceChildren(lbH("h3", {}, lbT("xTabTit")), lbH("p", { class: "lb-nota" }, lbT("xTab")), grid,
        lbH("p", { class: "lb-res", "aria-live": "polite" }, lbT("xTabCuenta", { n: st.fichas.length, c: cla, o: osc }) + (osc === 0 ? lbT("xTabSinOsc", { c: cla }) : lbT("xTabSobran"))),
        lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn ghost", onclick: () => { st.fichas = []; st.fsel = null; pintarT(); } }, lbT("xTabVaciar"))));
    };
    pintarT();
  }
  function extraBarbero(c) {
    c.replaceChildren(lbH("h3", {}, lbT("xBarTit")), lbH("p", { class: "lb-nota" }, lbT("xBar")),
      lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn", onclick: () => {
        if (typeof LOG !== "undefined" && typeof logRender === "function") { LOG.tab = "arbol"; logRender(); LB_ARU.plantarBarbero(); const t = document.getElementById("lb-ar-trabajo"); if (t) t.scrollIntoView({ block: "start" }); }
      } }, lbT("xBarBtn"))));
  }
  function extraZenon(c) {
    const rango = lbH("input", { type: "range", min: 1, max: 30, value: 10, class: "lb-rango", "aria-label": lbT("xZenTramos") });
    const out = lbH("div", { class: "lb-res", "aria-live": "polite" });
    const f4 = { maximumSignificantDigits: 4 };
    const calc = () => {
      const n = +rango.value, falta = 100 / 2 ** n;
      const u = falta >= 1 ? lbT("xZenM", { x: lbFmtN(falta, f4) }) : falta >= 0.001 ? lbT("xZenMm", { x: lbFmtN(falta * 1000, f4) }) : falta >= 1e-6 ? lbT("xZenMicras", { x: lbFmtN(falta * 1e6, f4) }) : lbT("xZenNm", { x: lbFmtN(falta * 1e9, f4) });
      out.innerHTML = lbT("xZenRes", { n, r: lbFmtN(100 - falta, { maximumFractionDigits: 10 }), f: u }) + (n >= 30 ? lbT("xZenVirus") : n >= 21 ? lbT("xZenPelo") : "");
    };
    rango.addEventListener("input", calc);
    c.replaceChildren(lbH("h3", {}, lbT("xZenTit")), lbH("p", { class: "lb-nota" }, lbT("xZen")), rango, out);
    calc();
  }
  function extraTriangulo(c, d) {
    const ops = d.esfera;
    const pintarE = () => c.replaceChildren(lbH("h3", {}, lbT("xTriTit")), esfera(), lbH("p", { class: "lb-nota" }, lbT("xTri")),
      lbH("div", { class: "lb-opciones" }, ...ops.map((o, i) => lbH("button", { type: "button", "aria-pressed": String(st.esfera === i), onclick: () => { st.esfera = i; pintarE(); } }, o[0]))),
      st.esfera !== null && st.esfera !== undefined ? lbAviso(ops[st.esfera][1] ? "ok" : "warn", ops[st.esfera][2]) : null,
      lbSaber(lbT("xKantTit"), lbT("xKant1"), lbT("xKant2")));
    pintarE();
  }
  function extraAnselmo(c, d) {
    /* paso(s) al que apunta cada objeción; 0 = a todo el argumento (Gaunilo); Tomás: pasos 1 o 2; Kant: paso 4 */
    const BUENOS = [[0], [1, 2], [4]];
    const pintarA = () => c.replaceChildren(lbH("h3", {}, lbT("xAnsTit")), lbH("p", { class: "lb-nota" }, lbT("xAns")),
      ...d.objeciones.map((o, i) => lbH("div", { class: "lb-paso" },
        lbH("div", { class: "lb-expr lb-peq", html: "<b>" + o.quien + "</b>: " + o.txt }),
        lbH("div", { class: "lb-fila" }, ...[1, 2, 3, 4, 5, 6].map((k) => lbChip(lbT("xAnsPaso", { n: k }), st.obj[i] === k, () => { st.obj[i] = k; pintarA(); })),
          lbChip(lbT("xAnsTodo"), st.obj[i] === 0, () => { st.obj[i] = 0; pintarA(); })),
        st.obj[i] !== undefined ? lbAviso(BUENOS[i].includes(st.obj[i]) ? "ok" : "warn", (BUENOS[i].includes(st.obj[i]) ? lbT("xAnsBien") : lbT("xAnsRevisa")) + o.nota) : null)));
    pintarA();
  }
  function extra(d) {
    const c = document.getElementById("lb-de-extra"); if (!c) return;
    ({ raiz2: extraRaiz, euclides: extraEuclides, tablero: extraTablero, barbero: extraBarbero, zenon: extraZenon, triangulo: extraTriangulo, anselmo: extraAnselmo }[d.id] ||
      ((x) => x.replaceChildren(lbH("h3", {}, lbT("xMenTit")), lbH("p", { class: "lb-nota" }, lbT("xMen")))))(c, d);
  }
  function pintar() {
    if (!box || !box.isConnected) return;
    const d = demos()[st.demo], E = est(d);
    const vis = d.pasos.slice(0, Math.min(E.paso + 1, d.pasos.length));
    const ROL = { supuesto: "rolSupuesto", paso: "rolPaso", choque: "rolChoque", conclusion: "rolConclusion" };
    const pasos = vis.map((p, i) => {
      const hecho = i < E.paso;
      const caja = lbH("div", { class: "lb-paso" + (hecho ? "" : " lb-actual") + (p.tipo === "choque" && hecho ? " lb-choque" : "") },
        lbH("div", { class: "lb-cab-paso" }, lbH("span", { class: "lb-n" }, (i + 1) + "."), lbH("span", { class: "lb-rol lb-rol-" + p.tipo }, lbT(ROL[p.tipo]))),
        lbH("div", { class: "lb-expr", html: p.e }));
      if (p.img && (hecho || i === E.paso)) { const dib = dibujo(p.img); if (dib) caja.append(dib); }
      if (hecho) {
        const op = p.op[E.elegida[i]];
        caja.append(lbH("div", { class: "lb-porque", html: lbT(p.preg ? "deRespuesta" : "dePorque") + "<b>" + op[0] + "</b>" }));
        if (op[2]) caja.append(lbH("div", { class: "lb-nota-paso", html: op[2] }));
      } else {
        const desc = E.descartadas[i] || [];
        caja.append(lbH("div", { class: "lb-porque" }, typeof p.preg === "string" ? p.preg : p.preg ? lbT("deElige") : lbT("dePorQue")),
          lbH("div", { class: "lb-opciones" }, ...E.orden[i].map((k) => { const fuera = desc.includes(k); return lbH("button", { type: "button", class: fuera ? "lb-descartada" : null, "aria-disabled": String(fuera), onclick: () => !fuera && elegir(d, i, k) }, p.op[k][0]); })));
        if (desc.length) caja.append(lbH("div", { class: "lb-fallo" }, p.op[desc[desc.length - 1]][2]));
      }
      return caja;
    });
    const fin = E.paso >= d.pasos.length;
    box.replaceChildren(
      lbH("p", { class: "lg-intro" }, lbT("deLede")),
      lbH("div", { class: "lb-mesa" },
        lbH("div", { class: "lb-fila", role: "group" }, ...demos().map((x, i) => lbChip(x.nom, i === st.demo, () => { st.demo = i; st.esfera = null; st.obj = {}; pintar(); }))),
        lbH("p", { html: d.intro }),
        lbH("div", { class: "lb-de-cuerpo" },
          lbH("div", { class: "lb-de-pasos", "aria-live": "polite" }, ...pasos),
          lbH("aside", { class: "lb-de-esq", "aria-label": lbT("deEsqueleto") }, lbH("h3", {}, lbT("deEsqueleto")),
            lbH("ol", { class: "lb-esq" }, ...d.pasos.map((p, i) => lbH("li", { class: (i < E.paso ? "lb-hecho " : "") + "lb-r-" + p.tipo }, lbH("span", {}, i < E.paso ? p.esq : "…")))))),
        lbH("div", { "aria-live": "polite" }, fin ? lbAviso("ok", lbT("deCompleta", { x: E.fallos ? (E.fallos === 1 ? lbT("deUnFallo") : lbT("deFallos", { n: E.fallos })) : lbT("deSinFallo") }) + d.cierre) : null,
          fin ? lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn ghost", onclick: () => { delete st.estado[d.id]; pintar(); } }, lbT("deOtraVez")),
            d.id === "menon" ? lbH("button", { type: "button", class: "btn", onclick: () => { st.demo = 0; pintar(); } }, lbT("deVerRaiz")) : null) : null)),
      lbH("div", { class: "lb-mesa", id: "lb-de-extra" }));
    extra(d);
  }
  return { montar(b) { box = b; pintar(); } };
})();

/* ================= JUICIOS DE KANT (21-10-2026) =================
   Tabla de los juicios (A70/B95) y de las categorías (A80/B106) en una cuadrícula de cuatro títulos; cada fila abre
   su ejemplo, su escritura en la lógica actual y la mesa o pestaña del Rincón donde se trabaja. Debajo, un ejercicio:
   ponerle a un juicio una forma de cada título. Textos en LAB.kant (laboratorio.js); fórmulas y enlaces, aquí. */
const LB_KANT = (() => {
  const FORM = [["∀x (Mx → Cx)", "∃x (Mx ∧ Gx)", "Ca"], ["Ma", "¬Ma", "¬Ma"], ["La", "p → q", "(p ∨ q ∨ r) ∧ ¬(p ∧ q) ∧ ¬(p ∧ r) ∧ ¬(q ∧ r)"], ["◇p", "p", "□p"]];
  /* [pestaña del Rincón, rótulo]; los rótulos «mesa…» son del Laboratorio (lbT) y los demás de logicaview (logT) */
  const IR = [[[["cuantificadores", "tabCuantificadores"], ["mundo", "mesaMundo"]], [["cuantificadores", "tabCuantificadores"], ["mundo", "mesaMundo"]], [["mundo", "mesaMundo"]]],
    [[["mundo", "mesaMundo"]], [["mundo", "mesaMundo"]], [["conjuntos", "tabConjuntos"]]],
    [[["silogismos", "tabSilog"], ["mundo", "mesaMundo"]], [["arbol", "mesaArbol"], ["inferencia", "tabInferencia"]], [["hablamos", "mesaHablamos"], ["arbol", "mesaArbol"]]],
    [[], [], []]];
  const st = { sel: [2, 1], ej: 0, marcas: [-1, -1, -1, -1], comprobado: false };
  let box = null;
  const K = () => LAB.kant;
  const rot = (k) => (/^mesa/.test(k) ? lbT(k) : typeof logT === "function" ? logT(k) : k);
  function ir(tab) { if (typeof LOG === "undefined" || typeof logRender !== "function") return; LOG.tab = tab; logRender(); const b = document.getElementById("logicabox"); if (b) b.scrollIntoView({ block: "start" }); }
  function detalle() {
    const [t, m] = st.sel, T = K().titulos[t], M = T.momentos[m];
    const enlaces = IR[t][m];
    return lbH("div", { class: "lb-aviso lb-neutro lb-kant-det", "aria-live": "polite" },
      lbH("p", {}, lbH("b", {}, T.nom + " · " + M.juicio), " → ", lbH("b", {}, M.cat)),
      lbH("p", {}, lbH("span", { class: "lb-et" }, lbT("kEjemplo") + ": "), "«" + M.ej + "»"),
      lbH("p", {}, lbH("span", { class: "lb-et" }, lbT("kHoy") + ": "), lbMono(FORM[t][m]), lbH("span", { class: "lb-suave" }, "  (" + M.letras + ")")),
      lbH("p", { class: "lb-nota" }, M.nota),
      lbH("p", { class: "lb-nota" }, lbH("span", { class: "lb-et" }, lbT("kQueHace") + ": "), M.hace + "."),
      t === 3 ? lbH("p", { class: "lb-nota" }, lbT("kModal")) : null,
      t === 0 ? lbH("p", { class: "lb-nota" }, lbT("kParejaDudosa")) : null,
      enlaces.length ? lbH("div", { class: "lb-fila" }, lbH("span", { class: "lb-et" }, lbT("kTrabajala")), ...enlaces.map(([tab, l]) => lbH("button", { type: "button", class: "chip", onclick: () => ir(tab) }, rot(l)))) : null);
  }
  function cuadricula() {
    return lbH("div", { class: "lb-kant-grid" }, ...K().titulos.map((T, t) => lbH("section", { class: "lb-kant-card" },
      lbH("h4", {}, T.nom, " ", lbH("span", { class: "lb-suave" }, T.preg)),
      lbH("div", { class: "lb-kant-cab", "aria-hidden": "true" }, lbH("span", {}, lbT("kJuicio")), lbH("span", {}, lbT("kCategoria"))),
      ...T.momentos.map((M, m) => lbH("button", { type: "button", class: "lb-kant-fila", "aria-pressed": String(st.sel[0] === t && st.sel[1] === m),
        onclick: () => { st.sel = [t, m]; pintar(); const d = box.querySelector(".lb-kant-det"); if (d && window.innerWidth < 640) d.scrollIntoView({ block: "nearest" }); } }, lbH("span", {}, M.juicio), lbH("span", { class: "lb-kant-flecha", "aria-hidden": "true" }, "→"), lbH("span", {}, M.cat))))));
  }
  function ejercicio() {
    const E = K().ejercicio, it = E[st.ej], T = K().titulos;
    const filas = T.map((Ti, t) => {
      if (it.r[t] < 0) return lbH("div", { class: "lb-fila" }, lbH("span", { class: "lb-et lb-ancho" }, Ti.nom), lbH("span", { class: "lb-suave" }, lbT("kNoSePide")));
      const ok = st.comprobado ? st.marcas[t] === it.r[t] : null;
      return lbH("div", { class: "lb-kant-ej" + (ok === false ? " lb-kant-mal" : "") },
        lbH("div", { class: "lb-fila", role: "group", "aria-label": Ti.nom }, lbH("span", { class: "lb-et lb-ancho" }, Ti.nom),
          ...Ti.momentos.map((M, m) => lbChip(M.juicio, st.marcas[t] === m, () => { st.marcas[t] = m; st.comprobado = false; pintar(); }))),
        ok === null ? null : lbH("span", { class: ok ? "lb-x lb-okt" : "lb-x lb-mal" }, ok ? lbT("kBien") : lbT("kMal", { x: Ti.momentos[it.r[t]].juicio })));
    });
    const pedidos = it.r.map((r, t) => [r, t]).filter(([r]) => r >= 0), todas = st.comprobado && pedidos.every(([r, t]) => st.marcas[t] === r);
    return lbH("div", { class: "lb-mesa" }, lbH("h3", {}, lbT("kEjTit")), lbH("p", { class: "lb-nota" }, lbT("kEjAyuda")),
      lbH("p", { class: "lb-et" }, lbT("kFrase", { n: st.ej + 1, m: E.length })), lbH("p", { class: "lb-kant-frase" }, "«" + it.txt + "»"),
      ...filas,
      lbH("div", { class: "lb-fila" }, lbH("button", { type: "button", class: "btn", onclick: () => { st.comprobado = true; pintar(); } }, lbT("kComprobar")),
        lbH("button", { type: "button", class: "btn ghost", onclick: () => { st.ej = (st.ej + 1) % E.length; st.marcas = [-1, -1, -1, -1]; st.comprobado = false; pintar(); } }, lbT("kSiguiente"))),
      st.comprobado ? lbAviso(todas ? "ok" : "warn", (todas ? lbT("kTodas") : lbT("kRevisa")) + (it.nota ? " " + it.nota : "")) : null);
  }
  function pintar() {
    if (!box || !box.isConnected) return;
    const hayExplo = typeof THEORY !== "undefined" && THEORY["hf-kant-juicios"];
    box.replaceChildren(
      lbH("p", { class: "lg-intro", html: lbT("kLede") }),
      lbH("div", { class: "lb-mesa" }, cuadricula(), detalle(),
        lbH("p", { class: "lb-nota" }, lbT("kTercera", { t: K().terceras })),
        hayExplo ? lbH("p", {}, lbH("a", { href: "#teoria/hf-kant-juicios" }, lbT("kExplo") + " →")) : null),
      ejercicio());
  }
  return { montar(b) { box = b; pintar(); } };
})();

/* ---------- montaje (lo llama logRender en logicaview.js) ---------- */
function labMontar(mesa) {
  const box = document.getElementById("lb-box"); if (!box) return;
  ({ hablamos: LB_HBU, arbol: LB_ARU, deduccion: typeof LB_DNU !== "undefined" ? LB_DNU : null, induccion: typeof LB_INU !== "undefined" ? LB_INU : null, mundo: LB_MUU, relaciones: LB_REU, demos: LB_DEU, kant: LB_KANT, mundos: LB_MP }[mesa] || LB_HBU).montar(box);
}
