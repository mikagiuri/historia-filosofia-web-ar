"use strict";
/* ===== Rincón de lógica · Laboratorio · mesa «Spinoza» (en desarrollo, 21-10-2026): motor y vista =====
   FICHERO GENERADO: no editar aquí. Fuente en lab_iesmdb\proyectos\spinoza_isabelle\laboratorio_web\
   (motor_mundos.js + vista_mesa_web.js; construir_mesa_web.py). El motor busca contramodelos finitos con un
   resolutor SAT propio y está comprobado contra Isabelle/HOL: tools/test_lab_spinoza.js. */
// Motor del Laboratorio spinozista: busca mundos finitos (como Nitpick) que cumplan
// unas premisas y en los que falle una proposición. Sin dependencias.
// Fórmulas → lógica proposicional sobre un mundo de n cosas y k atributos →
// CNF (Tseitin) → resolutor SAT con propagación unitaria y aprendizaje de cláusulas.
// Dos teorías: «spinoza» (la cosa 0 es siempre Dios: es una constante, sin pérdida de generalidad)
// y «tiempo», el mundo de práctica de tiempo, duración y creación (21-10-2026, Mundo_tiempo_creacion.thy).
(function (raiz) {
  'use strict';

  // ---------- Términos proposicionales ----------
  const T = { t: 'T' }, F = { t: 'F' };
  function y(...a) {
    const r = [];
    for (const x of a.flat()) { if (x === F) return F; if (x !== T) r.push(x); }
    return r.length === 0 ? T : r.length === 1 ? r[0] : { t: 'and', a: r };
  }
  function o(...a) {
    const r = [];
    for (const x of a.flat()) { if (x === T) return T; if (x !== F) r.push(x); }
    return r.length === 0 ? F : r.length === 1 ? r[0] : { t: 'or', a: r };
  }
  function no(x) { return x === T ? F : x === F ? T : x.t === 'not' ? x.a : { t: 'not', a: x }; }
  const si = (a, b) => o(no(a), b);
  const sii = (a, b) => y(si(a, b), si(b, a));

  // ---------- Mundo y vocabulario ----------
  // Relaciones: nombre → tipos de argumentos (C = cosa, A = atributo).
  const RELACIONES = {
    En: ['C', 'C'], SeConcibePor: ['C', 'C'], Causa: ['C', 'C'], AlgoEnComun: ['C', 'C'],
    EsParteDe: ['C', 'C'], Limita: ['C', 'C'], MasRealidad: ['C', 'C'],
    TieneAtributo: ['C', 'A'], AtributoSeConcibePor: ['A', 'A'],
    EsenciaImplicaExistencia: ['C'], ConcebibleComoNoExistente: ['C'], Existe: ['C'],
    ModoDeAtributo: ['C', 'A'], SigueDeAtributoAbsoluto: ['C', 'A'], SigueDeModificacion: ['C', 'C'],
  };

  function Mundo(n, k) {
    this.n = n; this.k = k; this.vars = new Map(); this.nombres = [];
    this.C = [...Array(n).keys()]; this.A = [...Array(k).keys()];
  }
  Mundo.prototype.v = function (rel, ...args) {
    const clave = rel + '(' + args.join(',') + ')';
    let id = this.vars.get(clave);
    if (!id) { id = this.vars.size + 1; this.vars.set(clave, id); this.nombres[id] = [rel, args]; }
    return { t: 'v', id };
  };

  // Gramática: cada fórmula es una función (m) => término. Lo común a las dos teorías:
  function base(m, rels) {
    const L = {};
    for (const r of Object.keys(rels)) L[r] = (...a) => m.v(r, ...a);
    L.igual = (a, b) => (a === b ? T : F);
    L.distinto = (a, b) => (a !== b ? T : F);
    L.todaCosa = f => y(m.C.map(f));
    L.algunaCosa = f => o(m.C.map(f));
    L.todoAtr = f => y(m.A.map(f));
    L.algunAtr = f => o(m.A.map(f));
    return L;
  }
  function lenguaje(m) {
    const L = base(m, RELACIONES);
    L.Dios = 0;
    const { En, SeConcibePor: Co, TieneAtributo: Ti } = L;
    // Definiciones
    L.sustancia = x => y(En(x, x), Co(x, x), L.todaCosa(z => si(En(x, z), L.igual(z, x))), L.todaCosa(z => si(Co(x, z), L.igual(z, x))));
    L.modo = x => L.algunaCosa(z => y(L.distinto(z, x), En(x, z), Co(x, z)));
    L.afeccion = (mm, s) => y(L.distinto(mm, s), En(mm, s), Co(mm, s));
    L.anterior_por_naturaleza = (x, z) => y(Co(z, x), no(Co(x, z)));
    L.finita = x => L.algunaCosa(z => y(L.distinto(z, x), L.Limita(z, x), L.algunAtr(a => y(Ti(z, a), Ti(x, a)))));
    L.divisible = x => L.algunaCosa(p => y(L.distinto(p, x), L.EsParteDe(p, x)));
    L.atrIncluidosEstricto = (z, x) => y(L.todoAtr(a => si(Ti(z, a), Ti(x, a))), L.algunAtr(a => y(Ti(x, a), no(Ti(z, a)))));
    // Props. 16-36
    const { Causa: Ca, EsenciaImplicaExistencia: IE, ModoDeAtributo: MdA, SigueDeAtributoAbsoluto: SAA, SigueDeModificacion: SDM } = L;
    L.libre = x => y(IE(x), L.todaCosa(z => si(Ca(z, x), L.igual(z, x))));
    L.eterno = x => IE(x);
    L.atributo_eterno = a => L.todaCosa(s => si(Ti(s, a), L.eterno(s)));
    L.causa_inmanente = (z, x) => y(Ca(z, x), En(x, z));
    L.causa_transitiva = (z, x) => y(Ca(z, x), no(En(x, z)));
    L.contingente = x => y(no(IE(x)), no(L.algunaCosa(z => Ca(z, x))));
    L.finita_modo = x => L.algunaCosa(z => y(L.distinto(z, x), L.Limita(z, x), L.algunAtr(a => y(MdA(z, a), MdA(x, a)))));
    L.eterno_por_atributo = x => o(L.algunAtr(a => SAA(x, a)), L.algunaCosa(z => L.algunAtr(a => y(SDM(x, z), SAA(z, a)))));
    return L;
  }

  // ---------- Premisas (las mismas que en Spinoza_Etica_I.thy) ----------
  const PREMISAS = {
    A1: L => L.todaCosa(x => o(L.En(x, x), L.algunaCosa(z => y(L.distinto(z, x), L.En(x, z))))),
    A1_excluyente: L => L.todaCosa(x => {
      const otro = L.algunaCosa(z => y(L.distinto(z, x), L.En(x, z)));
      return o(y(L.En(x, x), no(otro)), y(no(L.En(x, x)), otro));
    }),
    A2: L => L.todaCosa(x => si(no(L.algunaCosa(z => y(L.distinto(z, x), L.SeConcibePor(x, z)))), L.SeConcibePor(x, x))),
    A4: L => L.todaCosa(x => L.todaCosa(z => si(L.Causa(x, z), L.SeConcibePor(z, x)))),
    A5: L => L.todaCosa(x => L.todaCosa(z => si(no(L.AlgoEnComun(x, z)), y(no(L.SeConcibePor(x, z)), no(L.SeConcibePor(z, x)))))),
    A7: L => L.todaCosa(x => si(L.ConcebibleComoNoExistente(x), no(L.EsenciaImplicaExistencia(x)))),
    D1: L => L.todaCosa(x => sii(L.Causa(x, x), L.EsenciaImplicaExistencia(x))),
    D4: L => L.todaCosa(x => L.todoAtr(a => si(L.TieneAtributo(x, a), L.sustancia(x)))),
    D6: L => y(L.sustancia(L.Dios), L.todoAtr(a => L.TieneAtributo(L.Dios, a))),
    H_conversa_A5: L => L.todaCosa(x => L.todaCosa(z => si(L.AlgoEnComun(x, z), o(L.SeConcibePor(x, z), L.SeConcibePor(z, x))))),
    H_quien_comparte_uno_comparte_todos: L => L.todaCosa(s => L.todaCosa(t => L.todoAtr(a =>
      si(y(L.TieneAtributo(s, a), L.TieneAtributo(t, a)), L.todoAtr(b => sii(L.TieneAtributo(s, b), L.TieneAtributo(t, b))))))),
    H_individuacion_por_atributos: L => L.todaCosa(s => L.todaCosa(t =>
      si(y(L.sustancia(s), L.sustancia(t), L.todoAtr(b => sii(L.TieneAtributo(s, b), L.TieneAtributo(t, b)))), L.igual(s, t)))),
    H_ser_en_implica_concebirse: L => L.todaCosa(x => L.todaCosa(z => si(L.En(x, z), L.SeConcibePor(x, z)))),
    H_solo_en_si_solo_por_si: L => L.todaCosa(x => si(L.todaCosa(z => si(L.En(x, z), L.igual(z, x))),
      L.todaCosa(z => si(L.SeConcibePor(x, z), L.En(x, z))))),
    H_atributo_compartido_es_comun: L => L.todaCosa(s => L.todaCosa(t => L.todoAtr(a =>
      si(y(L.TieneAtributo(s, a), L.TieneAtributo(t, a)), L.AlgoEnComun(s, t))))),
    H_todo_tiene_causa: L => L.todaCosa(x => L.algunaCosa(z => L.Causa(z, x))),
    H_realidad_es_atributos: L => L.todaCosa(x => L.todaCosa(z => si(L.MasRealidad(x, z), L.atrIncluidosEstricto(z, x)))),
    H_puente_atributo_sustancia: L => L.todaCosa(s => L.todaCosa(t => L.todoAtr(a => L.todoAtr(b =>
      si(y(L.TieneAtributo(s, a), L.TieneAtributo(t, b), L.AtributoSeConcibePor(a, b)), L.SeConcibePor(s, t)))))),
    H_todo_por_sus_partes: L => L.todaCosa(p => L.todaCosa(x => si(L.EsParteDe(p, x), L.SeConcibePor(x, p)))),
    H_sustancia_con_atributo: L => L.todaCosa(s => si(L.sustancia(s), L.algunAtr(a => L.TieneAtributo(s, a)))),
    H_modo_en_sustancia: L => L.todaCosa(x => L.todaCosa(z => si(y(L.modo(x), L.distinto(z, x), L.En(x, z)), L.sustancia(z)))),
    H_por_si_excluye_por_otro: L => L.todaCosa(x => si(L.algunaCosa(z => y(L.distinto(z, x), L.SeConcibePor(x, z))), no(L.SeConcibePor(x, x)))),
    // Props. 16-36
    H_inherencia_es_causalidad: L => L.todaCosa(x => L.todaCosa(z => si(y(L.En(x, z), L.distinto(z, x)), L.Causa(z, x)))),
    H_modo_de_atributo_es_modo: L => L.todaCosa(x => L.todoAtr(a => si(L.ModoDeAtributo(x, a), L.modo(x)))),
    H_todo_modo_de_algun_atributo: L => L.todaCosa(m => si(L.modo(m), L.algunAtr(a => L.ModoDeAtributo(m, a)))),
    H_limitar_es_determinar: L => L.todaCosa(x => L.todaCosa(z => si(L.Limita(z, x), L.Causa(z, x)))),
    H_lo_que_limita_es_finito: L => L.todaCosa(x => L.todaCosa(z => si(y(L.Limita(z, x), L.distinto(z, x)), L.finita_modo(z)))),
    H_absoluto_solo_de_Dios: L => L.todaCosa(x => L.todoAtr(a => si(L.SigueDeAtributoAbsoluto(x, a),
      y(L.ModoDeAtributo(x, a), L.todaCosa(z => si(L.Causa(z, x), L.igual(z, L.Dios))))))),
    H_mediato_de_Dios_y_su_modificacion: L => L.todaCosa(x => L.todaCosa(z => si(L.SigueDeModificacion(x, z),
      y(L.modo(z), L.Causa(z, x), L.todaCosa(w => si(L.Causa(w, x), o(L.igual(w, L.Dios), L.igual(w, z)))))))),
    H_dos_maneras_de_seguirse: L => L.todaCosa(m => si(L.modo(m),
      o(L.algunAtr(a => L.SigueDeAtributoAbsoluto(m, a)), L.algunaCosa(z => L.SigueDeModificacion(m, z))))),
    H_de_lo_finito_lo_finito: L => L.todaCosa(m => L.todaCosa(z => si(y(L.SigueDeModificacion(m, z), L.finita_modo(z)), L.finita_modo(m)))),
  };

  // ---------- Proposiciones: variables cuantificadas y cuerpo ----------
  // La variable «y» se llama 'y_': i18n_rebuild traduce el literal y entre comillas (la conjunción) en las webs traducidas.
  // Cada objetivo es ∀ vars. cuerpo; el contramodelo es un mundo con un caso en que el cuerpo falla.
  const OBJETIVOS = {
    TB: { vars: [['x', 'C']], cuerpo: (L, e) => o(L.sustancia(e.x), L.modo(e.x)) },
    P1: { vars: [['s', 'C'], ['m', 'C']], cuerpo: (L, e) => si(y(L.sustancia(e.s), L.afeccion(e.m, e.s)), L.anterior_por_naturaleza(e.s, e.m)) },
    P2: { vars: [['s', 'C'], ['t', 'C']], cuerpo: (L, e) => si(y(L.sustancia(e.s), L.sustancia(e.t), L.distinto(e.s, e.t)), no(L.AlgoEnComun(e.s, e.t))) },
    P3: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(no(L.AlgoEnComun(e.x, e.y_)), y(no(L.Causa(e.x, e.y_)), no(L.Causa(e.y_, e.x)))) },
    P5: { vars: [['s', 'C'], ['t', 'C'], ['a', 'A']], cuerpo: (L, e) => si(y(L.sustancia(e.s), L.sustancia(e.t), L.TieneAtributo(e.s, e.a), L.TieneAtributo(e.t, e.a)), L.igual(e.s, e.t)) },
    P6: { vars: [['y_', 'C'], ['s', 'C']], cuerpo: (L, e) => si(y(L.sustancia(e.s), L.distinto(e.y_, e.s)), no(L.Causa(e.y_, e.s))) },
    P7: { vars: [['s', 'C']], cuerpo: (L, e) => si(L.sustancia(e.s), L.EsenciaImplicaExistencia(e.s)) },
    P8: { vars: [['s', 'C']], cuerpo: (L, e) => si(L.sustancia(e.s), no(L.finita(e.s))) },
    P9: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.MasRealidad(e.x, e.y_), L.atrIncluidosEstricto(e.y_, e.x)) },
    P10d: { vars: [['s', 'C'], ['t', 'C'], ['a', 'A'], ['b', 'A']], cuerpo: (L, e) => si(y(L.TieneAtributo(e.s, e.a), L.TieneAtributo(e.t, e.b), L.AtributoSeConcibePor(e.a, e.b)), L.igual(e.s, e.t)) },
    P10f: { vars: [['s', 'C'], ['a', 'A'], ['b', 'A']], cuerpo: (L, e) => si(y(L.TieneAtributo(e.s, e.a), L.AtributoSeConcibePor(e.a, e.b)), L.igual(e.a, e.b)) },
    P11: { vars: [], cuerpo: L => no(L.ConcebibleComoNoExistente(L.Dios)) },
    P11e: { vars: [], cuerpo: L => L.Existe(L.Dios) },
    P12: { vars: [['s', 'C']], cuerpo: (L, e) => si(L.sustancia(e.s), no(L.divisible(e.s))) },
    P13: { vars: [], cuerpo: L => no(L.divisible(L.Dios)) },
    P14: { vars: [['s', 'C']], cuerpo: (L, e) => si(L.sustancia(e.s), L.igual(e.s, L.Dios)) },
    P15: { vars: [['x', 'C']], cuerpo: (L, e) => y(L.En(e.x, L.Dios), L.SeConcibePor(e.x, L.Dios)) },
    P24: { vars: [['m', 'C']], cuerpo: (L, e) => si(L.modo(e.m), y(no(L.EsenciaImplicaExistencia(e.m)), no(L.Causa(e.m, e.m)))) },
    // Props. 16-36
    P16c1: { vars: [['x', 'C']], cuerpo: (L, e) => L.Causa(L.Dios, e.x) },
    P17: { vars: [['y_', 'C']], cuerpo: (L, e) => si(L.Causa(e.y_, L.Dios), L.igual(e.y_, L.Dios)) },
    P17c2: { vars: [['x', 'C']], cuerpo: (L, e) => sii(L.libre(e.x), L.igual(e.x, L.Dios)) },
    P18: { vars: [['x', 'C']], cuerpo: (L, e) => y(L.causa_inmanente(L.Dios, e.x), no(L.causa_transitiva(L.Dios, e.x))) },
    P19: { vars: [['a', 'A']], cuerpo: (L, e) => y(L.eterno(L.Dios), L.atributo_eterno(e.a)) },
    P21: { vars: [['x', 'C'], ['a', 'A']], cuerpo: (L, e) => si(L.SigueDeAtributoAbsoluto(e.x, e.a), no(L.finita_modo(e.x))) },
    P21e: { vars: [['x', 'C'], ['a', 'A']], cuerpo: (L, e) => si(L.SigueDeAtributoAbsoluto(e.x, e.a),
      y(no(L.finita_modo(e.x)), L.eterno_por_atributo(e.x), no(L.eterno(e.x)))) },
    P22: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(y(L.SigueDeModificacion(e.x, e.y_), no(L.finita_modo(e.y_))), no(L.finita_modo(e.x))) },
    P23: { vars: [['m', 'C']], cuerpo: (L, e) => si(y(L.modo(e.m), no(L.finita_modo(e.m))),
      o(L.algunAtr(a => L.SigueDeAtributoAbsoluto(e.m, a)), L.algunaCosa(z => y(L.SigueDeModificacion(e.m, z), no(L.finita_modo(z)))))) },
    P26: { vars: [['x', 'C']], cuerpo: (L, e) => y(si(L.algunaCosa(z => L.Causa(z, e.x)), L.Causa(L.Dios, e.x)), si(no(L.Causa(L.Dios, e.x)), no(L.Causa(e.x, e.x)))) },
    P28: { vars: [['m', 'C']], cuerpo: (L, e) => si(y(L.modo(e.m), L.finita_modo(e.m)),
      L.algunaCosa(z => y(L.distinto(z, e.m), L.modo(z), L.finita_modo(z), L.Causa(z, e.m)))) },
    P29: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.contingente(e.x)) },
    P32: { vars: [['v', 'C']], cuerpo: (L, e) => si(L.modo(e.v), no(L.libre(e.v))) },
    P36: { vars: [['x', 'C']], cuerpo: (L, e) => L.algunaCosa(z => L.Causa(e.x, z)) },
  };

  // ---------- Mundo de práctica: tiempo, duración y creación ----------
  const TIEMPO = {
    RELACIONES: { Antes: ['C', 'C'], DuraMas: ['C', 'C'], Crea: ['C', 'C'] },
    maxAtributos: 1,
    lenguaje(m) {
      const L = base(m, TIEMPO.RELACIONES);
      L.increado = x => no(L.algunaCosa(z => L.Crea(z, x)));
      return L;
    },
    PREMISAS: {
      T_irreflexiva: L => L.todaCosa(x => no(L.Antes(x, x))),
      T_transitiva: L => L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.Antes(x, z), L.Antes(z, w)), L.Antes(x, w))))),
      D_irreflexiva: L => L.todaCosa(x => no(L.DuraMas(x, x))),
      D_transitiva: L => L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.DuraMas(x, z), L.DuraMas(z, w)), L.DuraMas(x, w))))),
      C_creador_anterior: L => L.todaCosa(x => L.todaCosa(z => si(L.Crea(x, z), L.Antes(x, z)))),
      C_un_creador: L => L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.Crea(x, w), L.Crea(z, w)), L.igual(x, z))))),
      C_creador_dura_mas: L => L.todaCosa(x => L.todaCosa(z => si(L.Crea(x, z), L.DuraMas(x, z)))),
      C_todo_creado: L => L.todaCosa(x => L.algunaCosa(z => L.Crea(z, x))),
    },
    OBJETIVOS: {
      Q1: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.Crea(e.x, e.x)) },
      Q2: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.Crea(e.x, e.y_), no(L.Crea(e.y_, e.x))) },
      Q3: { vars: [['x', 'C'], ['y_', 'C'], ['z', 'C']], cuerpo: (L, e) => si(y(L.Crea(e.x, e.y_), L.Crea(e.y_, e.z)), L.Antes(e.x, e.z)) },
      Q4: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.Crea(e.x, e.y_), no(L.DuraMas(e.y_, e.x))) },
      Q5: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.Antes(e.x, e.y_), L.DuraMas(e.x, e.y_)) },
      Q6: { vars: [], cuerpo: L => L.algunaCosa(x => L.increado(x)) },
      // Q8 es una posibilidad: se busca un mundo en el que OCURRA (lo creado dura más que su creador).
      Q8: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => y(L.Crea(x, z), L.DuraMas(z, x)))) },
      // Q9, otra posibilidad: algo con dos creadores distintos (hacen falta tres cosas).
      Q9: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => L.algunaCosa(w => y(L.distinto(x, z), L.Crea(x, w), L.Crea(z, w))))) },
      Q7: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(y(L.increado(e.x), L.increado(e.y_)), L.igual(e.x, e.y_)) },
    },
    clase: (L, x, verdad) => (evaluar(L.increado(x), verdad) ? 'increado' : 'creado'),
  };
  const SPINOZA = { RELACIONES, lenguaje, PREMISAS, OBJETIVOS,
    clase: (L, x, verdad) => (evaluar(L.sustancia(x), verdad) ? 'sustancia' : evaluar(L.modo(x), verdad) ? 'modo' : 'ninguna') };
  const TEORIAS = { spinoza: SPINOZA, tiempo: TIEMPO };
  const teoria = op => TEORIAS[(op && op.teoria) || 'spinoza'];

  function casos(m, vars) {
    let lista = [{}];
    for (const [nombre, tipo] of vars) {
      const dom = tipo === 'C' ? m.C : m.A, nueva = [];
      for (const e of lista) for (const d of dom) nueva.push({ ...e, [nombre]: d });
      lista = nueva;
    }
    return lista;
  }

  // ---------- CNF (Tseitin) ----------
  function aCNF(m, raizTerm) {
    const clausulas = [];
    let siguiente = m.vars.size;
    const memo = new Map();
    function lit(x) {
      if (x === T || x === F) throw new Error('constante inesperada');
      if (x.t === 'v') return x.id;
      if (x.t === 'not') return -lit(x.a);
      if (memo.has(x)) return memo.get(x);
      const hijos = x.a.map(lit), z = ++siguiente;
      if (x.t === 'and') { for (const h of hijos) clausulas.push([-z, h]); clausulas.push([z, ...hijos.map(h => -h)]); }
      else { clausulas.push([-z, ...hijos]); for (const h of hijos) clausulas.push([z, -h]); }
      memo.set(x, z);
      return z;
    }
    if (raizTerm === T) return { clausulas: [], nvars: siguiente };
    if (raizTerm === F) return { clausulas: [[]], nvars: siguiente };
    const terms = raizTerm.t === 'and' ? raizTerm.a : [raizTerm];
    for (const t of terms) {
      if (t.t === 'or') clausulas.push(t.a.map(lit));
      else clausulas.push([lit(t)]);
    }
    return { clausulas, nvars: siguiente };
  }

  // ---------- Resolutor SAT (CDCL sencillo, con literales vigilados) ----------
  function resolver(nvars, clausulas, limiteConflictos = 200000) {
    for (const c of clausulas) if (c.length === 0) return null;
    const valor = new Int8Array(nvars + 1);          // 0 sin asignar, 1 verdadero, -1 falso
    const nivel = new Int32Array(nvars + 1), razon = new Array(nvars + 1).fill(null);
    const actividad = new Float64Array(nvars + 1);
    const vigila = new Map();                          // literal → índices de cláusulas
    const cls = clausulas.map(c => [...new Set(c)]);
    const rastro = [], limites = [];
    let incr = 1, conflictos = 0;
    const val = l => (valor[Math.abs(l)] === 0 ? 0 : (l > 0 ? valor[l] : -valor[-l]));
    const vig = l => { let a = vigila.get(l); if (!a) { a = []; vigila.set(l, a); } return a; };
    function asignar(l, r) { const x = Math.abs(l); valor[x] = l > 0 ? 1 : -1; nivel[x] = limites.length; razon[x] = r; rastro.push(l); }
    const unidades = [];
    for (let i = 0; i < cls.length; i++) {
      const c = cls[i];
      if (c.some(l => c.includes(-l))) { cls[i] = null; continue; }
      if (c.length === 1) unidades.push(c[0]); else { vig(c[0]).push(i); vig(c[1]).push(i); }
      for (const l of c) actividad[Math.abs(l)] += 1;
    }
    for (const u of unidades) { const v = val(u); if (v === -1) return null; if (v === 0) asignar(u, null); }
    let cabeza = 0;
    function propagar() {
      while (cabeza < rastro.length) {
        const l = rastro[cabeza++], falsoL = -l, lista = vigila.get(falsoL);
        if (!lista) continue;
        for (let j = 0; j < lista.length; j++) {
          const ci = lista[j], c = cls[ci];
          if (c[0] === falsoL) { c[0] = c[1]; c[1] = falsoL; }
          if (val(c[0]) === 1) continue;
          let movido = false;
          for (let q = 2; q < c.length; q++) {
            if (val(c[q]) !== -1) { const t = c[1]; c[1] = c[q]; c[q] = t; vig(c[1]).push(ci); lista[j] = lista[lista.length - 1]; lista.pop(); j--; movido = true; break; }
          }
          if (movido) continue;
          if (val(c[0]) === -1) return ci;
          asignar(c[0], ci);
        }
      }
      return -1;
    }
    function analizar(ci) {
      const aprendida = [], visto = new Uint8Array(nvars + 1);
      let contador = 0, p = 0, idx = rastro.length - 1, c = cls[ci];
      const nivelActual = limites.length;
      do {
        for (const q of c) {
          if (q === p) continue;
          const x = Math.abs(q);
          if (!visto[x] && nivel[x] > 0) {
            visto[x] = 1; actividad[x] += incr;
            if (nivel[x] >= nivelActual) contador++; else aprendida.push(q);
          }
        }
        while (!visto[Math.abs(rastro[idx])]) idx--;
        p = rastro[idx]; idx--;
        c = razon[Math.abs(p)] !== null ? cls[razon[Math.abs(p)]] : [];
        visto[Math.abs(p)] = 0; contador--;
      } while (contador > 0);
      aprendida.unshift(-p);
      let atras = 0;
      for (let i = 1; i < aprendida.length; i++) atras = Math.max(atras, nivel[Math.abs(aprendida[i])]);
      return { aprendida, atras };
    }
    function retroceder(nv) {
      while (limites.length > nv) {
        const lim = limites.pop();
        while (rastro.length > lim) { const l = rastro.pop(); const x = Math.abs(l); valor[x] = 0; razon[x] = null; }
      }
      cabeza = rastro.length;
    }
    for (;;) {
      const conf = propagar();
      if (conf !== -1) {
        if (limites.length === 0) return null;
        if (++conflictos > limiteConflictos) return undefined;
        const { aprendida, atras } = analizar(conf);
        retroceder(atras);
        incr *= 1.05;
        if (aprendida.length === 1) { asignar(aprendida[0], null); }
        else {
          // el segundo vigilado ha de ser el de nivel más alto entre los demás
          let mi = 1;
          for (let i = 2; i < aprendida.length; i++) if (nivel[Math.abs(aprendida[i])] > nivel[Math.abs(aprendida[mi])]) mi = i;
          [aprendida[1], aprendida[mi]] = [aprendida[mi], aprendida[1]];
          cls.push(aprendida); const ci = cls.length - 1;
          vig(aprendida[0]).push(ci); vig(aprendida[1]).push(ci);
          asignar(aprendida[0], ci);
        }
        continue;
      }
      let mejor = 0, act = -1;
      for (let x = 1; x <= nvars; x++) if (valor[x] === 0 && actividad[x] > act) { act = actividad[x]; mejor = x; }
      if (mejor === 0) return valor;
      limites.push(rastro.length);
      asignar(-mejor, null);   // por defecto, falso: mundos con pocas relaciones
    }
  }

  // ---------- Búsqueda de contramodelo ----------
  function construir(m, premisas, objetivo, teo) {
    const L = teo.lenguaje(m);
    const partes = premisas.map(p => teo.PREMISAS[p](L));
    if (objetivo) {
      const obj = teo.OBJETIVOS[objetivo];
      // Posibilidad: ∃ caso. cuerpo (un mundo en que ocurre). Si no: ¬ ∀ vars. cuerpo  ≡  ∃ caso. ¬cuerpo
      if (obj.posible) partes.push(o(casos(m, obj.vars).map(e => obj.cuerpo(L, e))));
      else partes.push(o(casos(m, obj.vars).map(e => no(obj.cuerpo(L, e)))));
    }
    return { L, formula: y(partes) };
  }

  function buscarContramodelo(premisas, objetivo, opciones = {}) {
    const teo = teoria(opciones);
    const maxC = opciones.maxCosas || 4, maxA = teo.maxAtributos || opciones.maxAtributos || 2;
    const intentos = [];
    for (let n = 1; n <= maxC; n++) for (let k = 1; k <= maxA; k++) intentos.push([n, k]);
    intentos.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1]) || p[0] - q[0]);
    let agotado = true;
    for (const [n, k] of intentos) {
      const m = new Mundo(n, k);
      const { L, formula } = construir(m, premisas, objetivo, teo);
      if (formula === F) continue;
      const { clausulas, nvars } = aCNF(m, formula);
      const sol = resolver(nvars, clausulas, opciones.limiteConflictos);
      if (sol === undefined) { agotado = false; continue; }
      if (sol) return { encontrado: true, mundo: leerMundo(m, sol, L, objetivo, teo) };
    }
    return { encontrado: false, completo: agotado, maxC, maxA };
  }

  // ¿Caben juntas las premisas en algún mundo pequeño? (Si no, «no hay contramodelo» no dice nada.)
  function hayMundo(premisas, opciones = {}) {
    const r = buscarContramodelo(premisas, null, opciones);
    return { hay: r.encontrado, completo: r.completo, maxC: r.maxC, maxA: r.maxA };
  }

  // ---------- Lectura y evaluación del mundo encontrado ----------
  function evaluar(term, verdad) {
    if (term === T) return true; if (term === F) return false;
    switch (term.t) {
      case 'v': return verdad(term.id);
      case 'not': return !evaluar(term.a, verdad);
      case 'and': return term.a.every(x => evaluar(x, verdad));
      case 'or': return term.a.some(x => evaluar(x, verdad));
    }
    throw new Error('término desconocido');
  }

  function leerMundo(m, sol, L, objetivo, teo) {
    const hechos = {};
    for (const r of Object.keys(teo.RELACIONES)) hechos[r] = [];
    for (const [clave, id] of m.vars) {
      if (sol[id] === 1) { const [rel, args] = m.nombres[id]; hechos[rel].push(args); }
    }
    const verdad = id => sol[id] === 1;
    const clase = m.C.map(x => teo.clase(L, x, verdad));
    const obj = objetivo && teo.OBJETIVOS[objetivo];
    const fallo = (obj && !obj.posible && casos(m, obj.vars).find(e => !evaluar(obj.cuerpo(L, e), verdad))) || {};
    return { n: m.n, k: m.k, hechos, clase, fallo };
  }

  function evaluarPremisasEn(mundo, premisas, opciones) {
    // Comprobación independiente: ¿el mundo leído cumple de verdad las premisas y falla el objetivo?
    const teo = teoria(opciones);
    const m = new Mundo(mundo.n, mundo.k);
    const L = teo.lenguaje(m);
    const ciertos = new Set();
    for (const [rel, lista] of Object.entries(mundo.hechos)) for (const args of lista) ciertos.add(m.v(rel, ...args).id);
    const verdad = id => ciertos.has(id);
    return premisas.every(p => evaluar(teo.PREMISAS[p](L), verdad));
  }

  const API = { buscarContramodelo, hayMundo, evaluarPremisasEn, PREMISAS, OBJETIVOS, RELACIONES, TEORIAS,
    // Para las pruebas (comprobar_formales.js): piezas internas del motor.
    _internos: { Mundo, lenguaje, aCNF, resolver, casos, y, o, no, si, sii, T, F } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.MotorMundos = API;
})(typeof self !== 'undefined' ? self : this);

/* ---------- Vista de la mesa «Spinoza» del Laboratorio (Rincón de lógica) ----------
   Dos mundos: el de práctica (tiempo, duración y creación) y la Parte I de la Ética.
   Textos en laboratorio_spinoza.js (LABSPZ, traducibles); aquí, fórmulas, premisas de Isabelle y dibujo.
   Usa los estilos .lb-* de css/laboratorio.css y los suyos .spz-*. Se monta desde labMontar("spinoza"). */
const spzT = (k, v) => String((LABSPZ.t && LABSPZ.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));

/* Enunciado formal de cada proposición: el mismo que comprueba el motor (OBJETIVOS). Pruebas: tools/test_lab_spinoza.js. */
const SPZ_FORMAL = {
  TB: "∀x. sustancia(x) ∨ modo(x)",
  P1: "∀s m. sustancia(s) ∧ afeccion(m, s) → anterior_por_naturaleza(s, m)",
  P2: "∀s t. sustancia(s) ∧ sustancia(t) ∧ s ≠ t → ¬AlgoEnComun(s, t)",
  P3: "∀x y. ¬AlgoEnComun(x, y) → ¬Causa(x, y) ∧ ¬Causa(y, x)",
  P5: "∀s t a. sustancia(s) ∧ sustancia(t) ∧ TieneAtributo(s, a) ∧ TieneAtributo(t, a) → s = t",
  P6: "∀y s. sustancia(s) ∧ y ≠ s → ¬Causa(y, s)",
  P7: "∀s. sustancia(s) → EsenciaImplicaExistencia(s)",
  P8: "∀s. sustancia(s) → ¬finita(s)",
  P9: "∀x y. MasRealidad(x, y) → {a : TieneAtributo(y, a)} ⊊ {a : TieneAtributo(x, a)}",
  P10d: "∀s t a b. TieneAtributo(s, a) ∧ TieneAtributo(t, b) ∧ AtributoSeConcibePor(a, b) → s = t",
  P10f: "∀s a b. TieneAtributo(s, a) ∧ AtributoSeConcibePor(a, b) → a = b",
  P11: "¬ConcebibleComoNoExistente(Dios)",
  P11e: "Existe(Dios)",
  P12: "∀s. sustancia(s) → ¬divisible(s)",
  P13: "¬divisible(Dios)",
  P14: "∀s. sustancia(s) → s = Dios",
  P15: "∀x. En(x, Dios) ∧ SeConcibePor(x, Dios)",
  P24: "∀m. modo(m) → ¬EsenciaImplicaExistencia(m) ∧ ¬Causa(m, m)",
  P16c1: "∀x. Causa(Dios, x)",
  P17: "∀y. Causa(y, Dios) → y = Dios",
  P17c2: "∀x. libre(x) ↔ x = Dios",
  P18: "∀x. causa_inmanente(Dios, x) ∧ ¬causa_transitiva(Dios, x)",
  P19: "eterno(Dios) ∧ ∀a. atributo_eterno(a)",
  P21: "∀x a. SigueDeAtributoAbsoluto(x, a) → ¬finita_modo(x)",
  P21e: "∀x a. SigueDeAtributoAbsoluto(x, a) → ¬finita_modo(x) ∧ eterno_por_atributo(x) ∧ ¬eterno(x)",
  P22: "∀x y. SigueDeModificacion(x, y) ∧ ¬finita_modo(y) → ¬finita_modo(x)",
  P23: "∀m. modo(m) ∧ ¬finita_modo(m) → (∃a. SigueDeAtributoAbsoluto(m, a)) ∨ (∃y. SigueDeModificacion(m, y) ∧ ¬finita_modo(y))",
  P26: "∀x. ((∃y. Causa(y, x)) → Causa(Dios, x)) ∧ (¬Causa(Dios, x) → ¬Causa(x, x))",
  P28: "∀m. modo(m) ∧ finita_modo(m) → ∃y. y ≠ m ∧ modo(y) ∧ finita_modo(y) ∧ Causa(y, m)",
  P29: "∀x. ¬contingente(x)",
  P32: "∀v. modo(v) → ¬libre(v)",
  P36: "∀x. ∃y. Causa(x, y)",
};
const SPZ_DEF = {
  sustancia: "sustancia(x) :⟺ En(x, x) ∧ SeConcibePor(x, x) ∧ (∀y. En(x, y) → y = x) ∧ (∀y. SeConcibePor(x, y) → y = x)",
  modo: "modo(x) :⟺ ∃y. y ≠ x ∧ En(x, y) ∧ SeConcibePor(x, y)",
  afeccion: "afeccion(m, s) :⟺ m ≠ s ∧ En(m, s) ∧ SeConcibePor(m, s)",
  anterior_por_naturaleza: "anterior_por_naturaleza(x, y) :⟺ SeConcibePor(y, x) ∧ ¬SeConcibePor(x, y)",
  finita: "finita(x) :⟺ ∃y. y ≠ x ∧ Limita(y, x) ∧ ∃a. (TieneAtributo(y, a) ∧ TieneAtributo(x, a))",
  divisible: "divisible(x) :⟺ ∃p. p ≠ x ∧ EsParteDe(p, x)",
  libre: "libre(x) :⟺ EsenciaImplicaExistencia(x) ∧ (∀y. Causa(y, x) → y = x)",
  eterno: "eterno(x) :⟺ EsenciaImplicaExistencia(x)",
  atributo_eterno: "atributo_eterno(a) :⟺ ∀s. TieneAtributo(s, a) → eterno(s)",
  causa_inmanente: "causa_inmanente(y, x) :⟺ Causa(y, x) ∧ En(x, y)",
  causa_transitiva: "causa_transitiva(y, x) :⟺ Causa(y, x) ∧ ¬En(x, y)",
  contingente: "contingente(x) :⟺ ¬EsenciaImplicaExistencia(x) ∧ ¬∃y. Causa(y, x)",
  finita_modo: "finita_modo(x) :⟺ ∃y. y ≠ x ∧ Limita(y, x) ∧ ∃a. (ModoDeAtributo(y, a) ∧ ModoDeAtributo(x, a))",
  eterno_por_atributo: "eterno_por_atributo(x) :⟺ (∃a. SigueDeAtributoAbsoluto(x, a)) ∨ ∃y, a. (SigueDeModificacion(x, y) ∧ SigueDeAtributoAbsoluto(y, a))",
};
/* D1, D4 y D6 son también premisas: su fórmula es la de la casilla (PREMISAS del motor). */
const SPZ_PREMISA_DEF = {
  D1: "∀x. Causa(x, x) ↔ EsenciaImplicaExistencia(x)",
  D4: "∀x a. TieneAtributo(x, a) → sustancia(x)",
  D6: "sustancia(Dios) ∧ ∀a. TieneAtributo(Dios, a)",
};
const SPZ_P15 = ["A1", "H_ser_en_implica_concebirse", "H_solo_en_si_solo_por_si", "H_modo_en_sustancia", "D6",
  "H_sustancia_con_atributo", "H_individuacion_por_atributos", "H_quien_comparte_uno_comparte_todos"];
/* Premisas con que Isabelle demostró cada proposición (Spinoza_Etica_I.thy); null: Isabelle no la demuestra. */
const SPZ_ISABELLE = {
  TB: ["A1", "H_ser_en_implica_concebirse", "H_solo_en_si_solo_por_si"], P1: [], P2: ["H_conversa_A5"], P3: ["A4", "A5"],
  P5: ["H_individuacion_por_atributos", "H_quien_comparte_uno_comparte_todos"], P6: ["A4"], P7: ["A4", "D1", "H_todo_tiene_causa"],
  P8: ["D4", "H_individuacion_por_atributos", "H_quien_comparte_uno_comparte_todos"], P9: ["H_realidad_es_atributos"],
  P10d: ["H_puente_atributo_sustancia", "D4"], P10f: null, P11: ["A4", "D1", "H_todo_tiene_causa", "A7", "D6"], P11e: null,
  P12: ["H_todo_por_sus_partes"], P13: ["H_todo_por_sus_partes", "D6"],
  P14: ["D6", "H_sustancia_con_atributo", "H_individuacion_por_atributos", "H_quien_comparte_uno_comparte_todos"],
  P15: SPZ_P15, P24: ["A4", "D1", "H_por_si_excluye_por_otro"],
  P16c1: [...SPZ_P15, "A4", "H_todo_tiene_causa", "H_inherencia_es_causalidad"], P17: ["A4", "D6"],
  P17c2: [...SPZ_P15, "A4", "D1", "H_todo_tiene_causa", "H_por_si_excluye_por_otro"],
  P18: [...SPZ_P15, "A4", "H_todo_tiene_causa", "H_inherencia_es_causalidad"], P19: ["A4", "D1", "D4", "D6", "H_todo_tiene_causa"],
  P21: ["D6", "H_modo_de_atributo_es_modo", "H_limitar_es_determinar", "H_absoluto_solo_de_Dios"],
  P21e: ["D6", "A4", "D1", "H_por_si_excluye_por_otro", "H_modo_de_atributo_es_modo", "H_limitar_es_determinar", "H_absoluto_solo_de_Dios"],
  P22: ["D6", "H_modo_de_atributo_es_modo", "H_limitar_es_determinar", "H_lo_que_limita_es_finito", "H_mediato_de_Dios_y_su_modificacion"],
  P23: ["H_dos_maneras_de_seguirse", "H_de_lo_finito_lo_finito"],
  P26: [...SPZ_P15, "A4", "H_todo_tiene_causa", "H_inherencia_es_causalidad"],
  P28: ["D6", "A4", "D1", "H_por_si_excluye_por_otro", "H_modo_de_atributo_es_modo", "H_limitar_es_determinar", "H_lo_que_limita_es_finito", "H_absoluto_solo_de_Dios", "H_mediato_de_Dios_y_su_modificacion", "H_dos_maneras_de_seguirse"],
  P29: ["H_todo_tiene_causa"], P32: ["A4", "D1", "H_por_si_excluye_por_otro"], P36: null,
};
const SPZ_TEOREMA = { TB: "todo_sustancia_o_modo", P6: "P6_cor", P10d: "P10_debil", P16c1: "P16_cor1", P17c2: "P17_cor2", P21e: "P21_doble_eternidad" };
/* Caminos alternativos también demostrados en Isabelle. */
const SPZ_ALT = {
  P5: { premisas: ["H_conversa_A5", "H_atributo_compartido_es_comun"], teorema: "P5_por_P2" },
  P28: { premisas: ["H_modo_de_atributo_es_modo", "H_limitar_es_determinar", "H_lo_que_limita_es_finito"], teorema: "P28" },
};

/* Mundo de práctica: tiempo, duración y creación (Mundo_tiempo_creacion.thy). */
const TMP_FORMAL = {
  Q1: "∀x. ¬Crea(x, x)",
  Q2: "∀x y. Crea(x, y) → ¬Crea(y, x)",
  Q3: "∀x y z. Crea(x, y) ∧ Crea(y, z) → Antes(x, z)",
  Q4: "∀x y. Crea(x, y) → ¬DuraMas(y, x)",
  Q5: "∀x y. Antes(x, y) → DuraMas(x, y)",
  Q6: "∃x. increado(x)",
  Q7: "∀x y. increado(x) ∧ increado(y) → x = y",
  Q8: "∃x y. Crea(x, y) ∧ DuraMas(y, x)",
  Q9: "∃x y z. x ≠ y ∧ Crea(x, z) ∧ Crea(y, z)",
};
const TMP_DEF = { increado: "increado(x) :⟺ ¬∃y. Crea(y, x)" };
const TMP_REL = { Antes: "Antes(x, y)", DuraMas: "DuraMas(x, y)", Crea: "Crea(x, y)" };
const TMP_ISABELLE = {
  Q1: ["C_creador_anterior", "T_irreflexiva"], Q2: ["C_creador_anterior", "T_irreflexiva", "T_transitiva"],
  Q3: ["C_creador_anterior", "T_transitiva"], Q4: ["C_creador_dura_mas", "D_irreflexiva", "D_transitiva"], Q5: null,
  Q6: ["C_creador_anterior", "T_irreflexiva", "T_transitiva"], Q7: null,
};
/* Para lo que Isabelle no demuestra, se empieza con todas las premisas compatibles (sin «todo ha sido creado»). */
const TMP_COMPATIBLES = ["T_irreflexiva", "T_transitiva", "D_irreflexiva", "D_transitiva", "C_creador_anterior", "C_un_creador", "C_creador_dura_mas"];
/* La 4 y la 5 empiezan SIN la premisa discutible (petición del profesor, 21-10): lo primero que se ve es que lo creado
   puede durar más que su creador; admitirla es una decisión del alumno. «Las que usó Isabelle» la sigue marcando en la 4. */
const TMP_SIN_DISCUTIBLE = TMP_COMPATIBLES.filter((x) => x !== "C_creador_dura_mas");
const TMP_DEFECTO = { Q4: TMP_SIN_DISCUTIBLE, Q8: TMP_SIN_DISCUTIBLE, Q9: TMP_COMPATIBLES.filter((x) => x !== "C_un_creador") };
/* Posibilidades: Isabelle construye el mundo (teorema) y demuestra que las premisas «impide» lo hacen imposible. */
const TMP_POSIBLE = { Q8: { teorema: "Q8_posible", impide: ["C_creador_dura_mas", "D_irreflexiva", "D_transitiva"], teoremaNo: "Q8_imposible_con_dura_mas" },
  Q9: { teorema: "Q9_posible", impide: ["C_un_creador"], teoremaNo: "Q9_imposible_con_un_creador" } };

/* Fórmulas de las premisas del mundo de práctica y su forma (entrada del repaso que abre la etiqueta). */
const TMP_PREMISA_FORMAL = {
  T_irreflexiva: "∀x. ¬Antes(x, x)", T_transitiva: "∀x y z. Antes(x, y) ∧ Antes(y, z) → Antes(x, z)",
  D_irreflexiva: "∀x. ¬DuraMas(x, x)", D_transitiva: "∀x y z. DuraMas(x, y) ∧ DuraMas(y, z) → DuraMas(x, z)",
  C_creador_anterior: "∀x y. Crea(x, y) → Antes(x, y)", C_un_creador: "∀x y z. Crea(x, z) ∧ Crea(y, z) → x = y",
  C_creador_dura_mas: "∀x y. Crea(x, y) → DuraMas(x, y)", C_todo_creado: "∀x. ∃y. Crea(y, x)",
};
const TMP_PREMISA_FORMA = {
  T_irreflexiva: "irrefl", T_transitiva: "trans", D_irreflexiva: "irrefl", D_transitiva: "trans",
  C_creador_anterior: "inclusion", C_un_creador: "unico", C_creador_dura_mas: "inclusion", C_todo_creado: "serie",
};

/* Lee una fórmula en voz alta con las plantillas de LABSPZ.lectura (traducibles). Devuelve null si no sabe leerla. */
function spzLeer(f) {
  /* Devuelve HTML: las plantillas se escapan y las variables van en cursiva (<var>) para no confundirlas con «y». */
  const escL = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const LX = LABSPZ.lectura, tpl = (s, v) => escL(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? v[k] : ""));
  const lista = (xs, k) => (xs.length < 3 ? xs.reduce((a, b) => tpl(LX[k], { a, b })) : tpl(LX[k], { a: xs.slice(0, -1).join(", "), b: xs[xs.length - 1] }));
  const nombre = (x) => (x === "Dios" ? escL(LX.Dios) : "<var>" + escL(x) + "</var>");
  const esAtr = (v) => v === "a" || v === "b";
  /* Lo compuesto que va dentro de otra cosa, entre paréntesis para que no se mezcle. */
  const leer = (e, ctx) => {
    const s = e.at ? e.pos : e.txt;
    const par = ctx && (e.k === "q" || e.k === "si" || e.k === "sii" || (e.k === "kO" && ctx === "kY") || (e.k === "kY" && ctx === "kO"));
    return par ? "(" + s + ")" : s;
  };
  function analizar(src) {
    const toks = src.match(/[∀∃¬∧∨→↔≠=(),.]|[A-Za-zÀ-ÿ_]\w*|\S/g) || [];
    let i = 0;
    const ver = () => toks[i], tomar = (x) => { if (i >= toks.length || (x && toks[i] !== x)) throw 0; return toks[i++]; };
    function cuant(negado) {
      const q = tomar(), vs = [];
      while (ver() && ver() !== ".") { const v = tomar(); if (v !== ",") vs.push(v); }
      tomar(".");
      const cs = vs.filter((v) => !esAtr(v)), as = vs.filter(esAtr), partes = [], nom = (xs) => lista(xs.map(nombre), "conY");
      if (negado && cs.length + as.length === 1) partes.push(tpl(cs.length ? LX.noHay : LX.noHayAtr, { v: nom(cs.length ? cs : as) }));
      else if (negado) throw 0;
      else if (q === "∃" && cs.length && as.length) partes.push(tpl(LX.hayMixto, { c: nom(cs), a: nom(as) }));
      else if (q === "∀") {
        if (cs.length) partes.push(tpl(cs.length === 1 ? LX.paraToda : LX.paraTodas, { v: nom(cs) }));
        if (as.length) partes.push(tpl(as.length === 1 ? LX.paraTodo : LX.paraTodos, { v: nom(as) }));
      } else {
        if (cs.length) partes.push(tpl(cs.length === 1 ? LX.hayUna : LX.hayVarias, { v: nom(cs) }));
        if (as.length) partes.push(tpl(as.length === 1 ? LX.hayAtr : LX.hayAtrs, { v: nom(as) }));
      }
      const cab = lista(partes, "conY"), cuerpo = leer(expr());
      return { k: "q", txt: q === "∀" && !negado ? tpl(LX.trasTodo, { a: cab, b: cuerpo }) : cab + " " + cuerpo };
    }
    function atomo() {
      const n = tomar();
      if (!/^[A-Za-zÀ-ÿ_]/.test(n)) throw 0;
      if (ver() === "(") {
        tomar("("); const args = [];
        while (ver() !== ")") { const a = tomar(); if (a !== ",") args.push(nombre(a)); }
        tomar(")");
        const r = LX.rel[n]; if (!r) throw 0;
        return { at: true, pos: tpl(r[0], { 1: args[0], 2: args[1] }), neg: tpl(r[1], { 1: args[0], 2: args[1] }) };
      }
      if (ver() === "=" || ver() === "≠") {
        const op = tomar(), v = { 1: nombre(n), 2: nombre(tomar()) };
        return op === "=" ? { at: true, pos: tpl(LX.igual, v), neg: tpl(LX.distinto, v) } : { at: true, pos: tpl(LX.distinto, v), neg: tpl(LX.igual, v) };
      }
      throw 0;
    }
    function un() {
      const x = ver();
      if (x === "¬" && toks[i + 1] === "∃") { tomar(); return cuant(true); }
      if (x === "¬") { tomar(); const e = un(); return e.at ? { at: true, pos: e.neg, neg: e.pos } : { k: "لا", txt: tpl(LX.noEs, { a: leer(e, "لا") }) }; }
      if (x === "∀" || x === "∃") return cuant();
      if (x === "(") { tomar("("); const e = expr(); tomar(")"); return e; }
      return atomo();
    }
    const cadena = (sig, op, k, tipo) => () => { const xs = [sig()]; while (ver() === op) { tomar(); xs.push(sig()); } return xs.length === 1 ? xs[0] : { k: tipo, txt: lista(xs.map((e) => leer(e, tipo)), k) }; };
    const conj = cadena(un, "∧", "conY", "kY"), disy = cadena(conj, "∨", "conO", "kO");
    function impl() { const a = disy(); if (ver() === "→") { tomar(); const b = impl(); return { k: "si", txt: tpl(LX.si, { a: leer(a, "si"), b: leer(b) }) }; } return a; }
    function expr() { const a = impl(); if (ver() === "↔") { tomar(); const b = impl(); return { k: "sii", txt: tpl(LX.sii, { a: leer(a, "sii"), b: leer(b, "sii") }) }; } return a; }
    const r = expr(); if (i !== toks.length) throw 0;
    return r;
  }
  try {
    if (f.includes(":⟺")) { const [izq, der] = f.split(":⟺"); return tpl(LX.define, { a: leer(analizar(izq)), b: leer(analizar(der)) }) + "."; }
    const s = leer(analizar(f));
    return (/^[a-zà-ÿ]/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s) + ".";
  } catch (e) { return null; }
}

const LB_SPZ = (() => {
  let box = null;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sim = (t) => esc(t).replace(/([∀∃¬∧∨→↔≠⊊]|:⟺)/g, '<span class="lb-sim">$1</span>');
  const nombreAtr = (a) => "a" + (a + 1);
  const contiene = (l, s) => s.every((x) => l.includes(x));

  const ESTILOS_SPZ = {
    En: { color: "var(--lb)", guion: "", grosor: 1.8, k: "lyEn" },
    SeConcibePor: { color: "var(--muted)", guion: "5 4", grosor: 1.5, k: "lyConcibe" },
    Causa: { color: "var(--r-pol)", guion: "", grosor: 2.6, k: "lyCausa" },
    EsParteDe: { color: "var(--r-eti)", guion: "2 3", grosor: 1.8, k: "lyParte" },
    Limita: { color: "var(--e-ant)", guion: "8 3 2 3", grosor: 1.6, k: "lyLimita" },
    MasRealidad: { color: "var(--r-con)", guion: "1 3", grosor: 1.6, k: "lyRealidad" },
    SigueDeModificacion: { color: "var(--lb)", guion: "10 3", grosor: 1.4, k: "lyModif" },
  };
  const ESTILOS_TMP = {
    Antes: { color: "var(--r-con)", guion: "5 4", grosor: 1.6, k: "lyAntes" },
    DuraMas: { color: "var(--e-ant)", guion: "1 3", grosor: 1.8, k: "lyDura" },
    Crea: { color: "var(--r-pol)", guion: "", grosor: 2.6, k: "lyCrea" },
  };

  /* Lo que cambia de un mundo a otro. */
  const MUNDOS = {
    tiempo: {
      textos: () => LABSPZ.tiempo, formal: TMP_FORMAL, def: TMP_DEF, isabelle: TMP_ISABELLE, teorema: { Q6: "Q6_finito" }, alt: {},
      premisaFormal: TMP_PREMISA_FORMAL, premisaForma: TMP_PREMISA_FORMA,
      estilos: ESTILOS_TMP, maxA: 1, porDefecto: (id) => (TMP_DEFECTO[id] || TMP_ISABELLE[id] || TMP_COMPATIBLES).slice(), posibles: TMP_POSIBLE, inicio: { prop: "Q2", marcadas: ["C_creador_anterior", "T_irreflexiva"] },
      nombreCosa: (i) => "ABCD"[i] || "c" + i,
      formulaDef: (d) => TMP_DEF[d.id] || TMP_REL[d.id],
      clases: { increado: ["clIncreado", "doble"], creado: ["clCreado", "simple"] },
      leyendaFija: ["lyDobleT"],
      etiquetas: () => [],
      hechos(H, n) {
        const r2 = (rel, si, no) => (H[rel] || []).map(([a, b]) => (a === b ? spzT(si, { a: n(a) }) : spzT(no, { a: n(a), b: n(b) })));
        return [["hTiempo", r2("Antes", "fAntesSi", "fAntes")], ["hDuracion", r2("DuraMas", "fDuraSi", "fDura")], ["hCreacion", r2("Crea", "fCreaSi", "fCrea")]];
      },
      tam: (m) => spzT("hayMundoT", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) }),
      grupos: () => [["grupoT", 1]], pie: "notaPieT", lede: "ledeTiempo", notaDefs: "notaDefsTiempo",
      secciones: () => [["defsTiempo", LABSPZ.tiempo.defs]], extraContramodelo: () => "",
    },
    spinoza: {
      textos: () => LABSPZ, formal: SPZ_FORMAL, def: SPZ_DEF, isabelle: SPZ_ISABELLE, teorema: SPZ_TEOREMA, alt: SPZ_ALT,
      estilos: ESTILOS_SPZ, maxA: 2, porDefecto: (id) => (SPZ_ISABELLE[id] || []).slice(), posibles: {}, inicio: { prop: "P5", marcadas: ["H_individuacion_por_atributos"] },
      nombreCosa: (i) => (i === 0 ? spzT("Dios") : "c" + i),
      formulaDef: (d) => (SPZ_PREMISA_DEF[d.id] ? SPZ_PREMISA_DEF[d.id] + "   (" + spzT("casilla", { x: d.id }) + ")" : SPZ_DEF[d.id]),
      clases: { sustancia: ["clSustancia", "doble"], modo: ["clModo", "simple"], ninguna: ["clNinguna", "discontinuo"] },
      leyendaFija: ["lyDoble", "lyDiscont"],
      etiquetas(m, i) {
        const de = (rel) => (m.hechos[rel] || []).filter(([c]) => c === i).map(([, a]) => nombreAtr(a));
        const atrs = de("TieneAtributo"), mdo = de("ModoDeAtributo"), sig = de("SigueDeAtributoAbsoluto");
        return [atrs.length ? spzT("atributos", { x: atrs.join(", ") }) : "", mdo.length ? spzT("modoDe", { x: mdo.join(", ") }) : "", sig.length ? spzT("sigueDe", { x: sig.join(", ") }) : ""];
      },
      hechos(H, n) {
        const r2 = (rel, si, no) => (H[rel] || []).map(([a, b]) => (a === b && si ? spzT(si, { a: n(a) }) : spzT(no, { a: n(a), b: n(b) })));
        return [
          ["hSerEn", r2("En", "fEnSi", "fEn")], ["hConcebirse", r2("SeConcibePor", "fConcibeSi", "fConcibe")], ["hCausas", r2("Causa", "fCausaSi", "fCausa")],
          ["hComun", (H.AlgoEnComun || []).filter(([a, b]) => a < b).map(([a, b]) => spzT("fComun", { a: n(a), b: n(b) }))],
          ["hOtras", [...r2("EsParteDe", null, "fParte"), ...r2("Limita", null, "fLimita"), ...r2("MasRealidad", null, "fRealidad"),
            ...(H.AtributoSeConcibePor || []).map(([a, b]) => spzT("fAtrConcibe", { a: nombreAtr(a), b: nombreAtr(b) })),
            ...(H.EsenciaImplicaExistencia || []).map(([a]) => spzT("fIE", { a: n(a) })),
            ...(H.ConcebibleComoNoExistente || []).map(([a]) => spzT("fCNE", { a: n(a) })),
            ...(H.Existe || []).map(([a]) => spzT("fExiste", { a: n(a) }))]],
          ["hModos", [...(H.ModoDeAtributo || []).map(([c, a]) => spzT("fModoDe", { a: n(c), b: nombreAtr(a) })),
            ...(H.SigueDeAtributoAbsoluto || []).map(([c, a]) => spzT("fSigueAbs", { a: n(c), b: nombreAtr(a) })),
            ...r2("SigueDeModificacion", null, "fSigueMod")]],
        ];
      },
      tam: (m) => spzT("hayMundo", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }), k: m.k === 1 ? spzT("unAtr") : spzT("nAtrs", { n: m.k }) }),
      grupos: () => [["grupo1", 1], ["grupo2", 2]], pie: "notaPie", lede: "lede", notaDefs: "notaDefiniciones",
      secciones: () => [["defsSpinoza", LABSPZ.defsSpinoza], ["defsNuestras", LABSPZ.defsNuestras]],
      extraContramodelo: (m, marcadas) => (m.clase[0] !== "sustancia" && !marcadas.includes("D6") ? `<p class="lb-nota">${esc(spzT("diosNombre"))}</p>` : ""),
    },
  };
  const st = { mundo: "tiempo", turno: 0, porMundo: {} };
  for (const [id, M] of Object.entries(MUNDOS)) st.porMundo[id] = { prop: M.inicio.prop, marcadas: M.inicio.marcadas.slice(), html: "" };
  const W = () => MUNDOS[st.mundo], S = () => st.porMundo[st.mundo];
  const prop = () => W().textos().props.find((p) => p.id === S().prop);

  function definicionesDe(f) {
    const D = W().def, vistas = [], pend = [f];
    while (pend.length) {
      const g = pend.shift();
      for (const n of Object.keys(D)) if (!vistas.includes(n) && new RegExp("(^|[^A-Za-z_])" + n + "\\(").test(g)) { vistas.push(n); pend.push(D[n].split(":⟺")[1]); }
    }
    return vistas.map((n) => D[n]);
  }

  function dibujar(m) {
    const E = W().estilos, nombre = W().nombreCosa;
    const Wd = 560, H = m.n === 1 ? 270 : 390, cx = Wd / 2, cy = H / 2 + 6, R = m.n === 1 ? 0 : 118, r = 28;
    const inicio = m.n === 2 ? Math.PI : -Math.PI / 2;
    const pos = [...Array(m.n).keys()].map((i) => { const a = inicio + i * 2 * Math.PI / m.n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    let s = `<svg class="spz-svg" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(spzT("dibujoAria"))}"><defs>`;
    for (const [rel, e] of Object.entries(E)) s += `<marker id="spz-fl-${rel}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${e.color}"/></marker>`;
    s += "</defs>";
    const pares = {};
    for (const rel of Object.keys(E)) for (const [a, b] of m.hechos[rel] || []) { const c = a === b ? "l" + a : Math.min(a, b) + "-" + Math.max(a, b); (pares[c] = pares[c] || []).push([rel, a, b]); }
    for (const lista of Object.values(pares)) lista.forEach(([rel, a, b], idx) => {
      const e = E[rel];
      const at = `stroke="${e.color}" stroke-width="${e.grosor}" fill="none" ${e.guion ? `stroke-dasharray="${e.guion}"` : ""} marker-end="url(#spz-fl-${rel})"`;
      if (a === b) {
        const [x, y] = pos[a], rr = 12 + idx * 7, bx = x, by = y - (r + rr);
        s += `<path d="M${x - 10},${y - r} C${bx - rr - 10},${by} ${bx + rr + 10},${by} ${x + 10},${y - r}" ${at}/>`;
      } else {
        const [x1, y1] = pos[a], [x2, y2] = pos[b], dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
        const sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * (r + 2), ey = y2 - uy * (r + 2);
        const base = a < b ? 1 : -1, curva = (idx - (lista.length - 1) / 2) * 26 * base + (a < b ? 8 : -8);
        s += `<path d="M${sx},${sy} Q${(sx + ex) / 2 - uy * curva},${(sy + ey) / 2 + ux * curva} ${ex},${ey}" ${at}/>`;
      }
    });
    pos.forEach(([x, y], i) => {
      const [k, forma] = W().clases[m.clase[i]] || ["", "simple"], borde = forma === "doble" ? "var(--lb)" : forma === "simple" ? "var(--ink)" : "var(--muted)";
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--surface)" stroke="${borde}" stroke-width="2" ${forma === "discontinuo" ? 'stroke-dasharray="4 3"' : ""}/>`;
      if (forma === "doble") s += `<circle cx="${x}" cy="${y}" r="${r - 5}" fill="none" stroke="var(--lb)" stroke-width="1"/>`;
      s += `<text class="spz-nodo" x="${x}" y="${y + 5}" text-anchor="middle">${esc(nombre(i))}</text>`;
      const [e1, ...resto] = W().etiquetas(m, i);
      const l1 = [spzT(k), e1].filter(Boolean).join(" · "), l2 = resto.filter(Boolean).join(" · ");
      s += `<text class="spz-etq" x="${x}" y="${y + r + 18}" text-anchor="middle">${esc(l1)}</text>`;
      if (l2) s += `<text class="spz-etq" x="${x}" y="${y + r + 32}" text-anchor="middle">${esc(l2)}</text>`;
    });
    return s + "</svg>";
  }
  function leyenda(m) {
    return Object.entries(W().estilos).filter(([rel]) => (m.hechos[rel] || []).length)
      .map(([, e]) => `<span><svg width="30" height="10" aria-hidden="true"><line x1="0" y1="5" x2="30" y2="5" stroke="${e.color}" stroke-width="${e.grosor}" ${e.guion ? `stroke-dasharray="${e.guion}"` : ""}/></svg>${esc(spzT(e.k))}</span>`).join("") +
      W().leyendaFija.map((k) => `<span>${esc(spzT(k))}</span>`).join("");
  }
  function hechos(m) {
    const g = W().hechos(m.hechos, W().nombreCosa);
    return '<div class="spz-hechos">' + g.filter(([, l]) => l.length).map(([t, l]) => `<div><h4>${esc(spzT(t))}</h4><ul>${l.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`).join("") + "</div>";
  }

  function veredicto() {
    const p = prop(), M = W(), isa = M.isabelle[p.id], alt = M.alt[p.id], el = S().marcadas, mundo = st.mundo;
    const teorema = M.teorema[p.id] || p.id;
    if (p.posible) return posibilidad(p, M, el, mundo);
    if (isa && contiene(el, isa)) return demostrado(teorema, p.prueba, isa, p.pasos);
    if (alt && contiene(el, alt.premisas)) return demostrado(p.teoremaAlt || alt.teorema, p.pruebaAlt, alt.premisas);
    const miTurno = ++st.turno;
    pintarResultado(`<p class="lb-nota">${esc(spzT("buscando"))}</p>`);
    setTimeout(() => {
      if (miTurno !== st.turno || mundo !== st.mundo) return;
      const t0 = performance.now(), op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA };
      const r = MotorMundos.buscarContramodelo(el, p.id, op);
      if (r.encontrado) return contramodelo(r.mundo, Math.round(performance.now() - t0));
      const h = MotorMundos.hayMundo(el, op), ms = Math.round(performance.now() - t0);
      if (!h.hay && h.completo) incompatibles(h, ms); else sinMundo(r, ms);
    }, 20);
  }
  /* Posibilidad: ¿hay un mundo con estas premisas en el que ocurra? */
  function posibilidad(p, M, el, mundo) {
    const P = M.posibles[p.id];
    if (P && contiene(el, P.impide)) {
      st.turno++;
      return pintarResultado(`<div class="lb-aviso lb-mal"><span class="spz-sello">${esc(spzT("selloOk"))}</span><h3 class="spz-h">${esc(spzT("noPuede"))}</h3>
        ${p.notaNo ? `<p>${p.notaNo}</p>` : ""}<p class="lb-nota">${esc(spzT("imposibleIsa", { x: P.impide.join(", "), t: P.teoremaNo }))}</p></div>`);
    }
    const miTurno = ++st.turno;
    pintarResultado(`<p class="lb-nota">${esc(spzT("buscando"))}</p>`);
    setTimeout(() => {
      if (miTurno !== st.turno || mundo !== st.mundo) return;
      const t0 = performance.now(), op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA };
      const r = MotorMundos.buscarContramodelo(el, p.id, op), ms = Math.round(performance.now() - t0);
      if (r.encontrado) {
        const m = r.mundo;
        return pintarResultado(`<div class="lb-aviso lb-ok"><span class="spz-sello">${esc(spzT("selloPosible"))}</span><h3 class="spz-h">${esc(spzT("puedeOcurrir"))}</h3>
          <p>${esc(spzT("posibleTxt", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) }))}</p>${p.nota ? `<p>${p.nota}</p>` : ""}
          ${P ? `<p class="lb-nota">${esc(spzT("posibleIsa", { t: P.teorema }))}</p>` : ""}</div>
          <div class="lb-scroll spz-lienzo">${dibujar(m)}</div><div class="spz-leyenda">${leyenda(m)}</div>${hechos(m)}
          <p class="lb-nota">${esc(spzT("encontrado", { ms }))}</p>`);
      }
      const h = MotorMundos.hayMundo(el, op);
      if (!h.hay && h.completo) return incompatibles(h, ms);
      pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloDuda"))}</span><h3 class="spz-h">${esc(spzT("noPuede"))}</h3>
        <p>${esc(spzT("imposibleTxt", { c: r.maxC }))}</p>${p.notaNo ? `<p>${p.notaNo}</p>` : ""}<p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p></div>`);
    }, 20);
  }
  function demostrado(teorema, prueba, usadas, pasos) {
    st.turno++;
    const sobran = S().marcadas.filter((x) => !usadas.includes(x)), R = LABSPZ.repaso, M = W();
    const etq = (k) => (k === "hip" ? `<span class="spz-paso-et">${esc(R.pHip)}</span>` : k === "fin" ? `<span class="spz-paso-et">${esc(R.pFin)}</span>`
      : `<span class="lb-mono spz-paso-pr">${esc(k)}</span>` + (M.premisaForma && M.premisaForma[k] ? ` <button type="button" class="spz-forma" aria-expanded="false" data-spz-rep="${M.premisaForma[k]}">${esc(formaNombre(M.premisaForma[k]))}</button>` : ""));
    const cuerpo = pasos ? `<p class="spz-sub">${esc(R.tPasos)}</p><ol class="spz-pasos">${pasos.map((s) => `<li><span>${sim(s.txt)}</span> ${etq(s.k)}</li>`).join("")}</ol>` : `<p>${prueba}</p>`;
    pintarResultado(`<div class="lb-aviso lb-ok"><span class="spz-sello">${esc(spzT("selloOk"))}</span><h3 class="spz-h">${esc(spzT("seSigue"))}</h3>${cuerpo}
      <p class="lb-nota">${esc(spzT("teorema", { t: teorema, x: usadas.length ? usadas.join(", ") : spzT("ningunaAnadida") }))}${sobran.length ? " " + esc(spzT("sobran")) : ""}</p></div>`);
  }
  function contramodelo(m, ms) {
    const p = prop(), isa = W().isabelle[p.id] || [];
    const faltan = isa.filter((x) => !S().marcadas.includes(x));
    const lecc = faltan.map((x) => (p.leccion && p.leccion[x] ? `<p><b>${esc(spzT("sin", { x }))}</b> ${p.leccion[x]}</p>` : "")).join("");
    const nombre = W().nombreCosa;
    const fallo = Object.entries(m.fallo).map(([v, val]) => v.replace(/_$/, "") + " = " + (v === "a" || v === "b" ? nombreAtr(val) : nombre(val)));
    pintarResultado(`<div class="lb-aviso lb-mal"><span class="spz-sello">${esc(spzT("selloMal"))}</span><h3 class="spz-h">${esc(spzT("noSeSigue"))}</h3><p>${esc(W().tam(m))}</p>
      ${faltan.length ? `<p class="lb-nota">${esc(spzT("usoTambien", { x: faltan.join(", ") }))}</p>` : ""}${p.nota ? `<p>${p.nota}</p>` : ""}${lecc}</div>
      <div class="lb-scroll spz-lienzo">${dibujar(m)}</div><div class="spz-leyenda">${leyenda(m)}</div>
      <p class="lb-res spz-falla">${esc(fallo.length ? spzT("fallaCon", { x: fallo.join(", ") }) : spzT("fallaTal"))}</p>${conCosas(m)}${hechos(m)}
      ${W().extraContramodelo(m, S().marcadas)}
      <p class="lb-nota">${esc(spzT("encontrado", { ms }))}</p>`);
  }
  /* Quita los «para todo» del principio y lee la proposición con las cosas en que falla (x = A, y = B…). */
  function conCosas(m) {
    let f = W().formal[prop().id];
    const pre = f.match(/^∀([^.]*)\.\s*/);
    if (!pre || !Object.keys(m.fallo).length) return "";
    f = f.slice(pre[0].length);
    const nombre = W().nombreCosa;
    for (const [v, val] of Object.entries(m.fallo)) {
      const n = v.replace(/_$/, ""), por = n === "a" || n === "b" ? nombreAtr(val) : nombre(val);
      f = f.replace(new RegExp("(^|[^A-Za-z_])" + n + "(?![A-Za-z_])", "g"), (_, a) => a + "§" + por);
    }
    const l = spzLeer(f.replace(/§/g, ""));
    const sust = Object.entries(m.fallo).map(([v, val]) => v.replace(/_$/, "") + " = " + (v === "a" || v === "b" ? nombreAtr(val) : nombre(val))).join(", ");
    return l ? `<p class="spz-lee"><span class="spz-lee-et">${esc(LABSPZ.repaso.conCosas.replace("{x}", sust))}:</span> ${l} <span class="lb-nota">${esc(LABSPZ.repaso.falsoAqui)}</span></p>` : "";
  }
  function sinMundo(r, ms) {
    const isa = W().isabelle[prop().id];
    pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloDuda"))}</span><h3 class="spz-h">${esc(spzT("sinMundo"))}</h3>
      <p>${esc(r.completo ? (W().maxA === 1 ? spzT("sinMundoCompletoT", { c: r.maxC }) : spzT("sinMundoCompleto", { c: r.maxC, a: r.maxA })) : spzT("sinMundoCortado"))} ${esc(spzT("noDemuestra"))}</p>
      ${isa ? `<p class="lb-nota">${esc(isa.length ? spzT("necesitaCon", { x: isa.join(", ") }) : spzT("necesitaSin"))}</p>` : ""}
      <p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p></div>`);
  }
  function incompatibles(h, ms) {
    pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloNada"))}</span><h3 class="spz-h">${esc(spzT("incompatibles"))}</h3>
      <p>${esc(spzT("incompatiblesTxt", { c: h.maxC }))}</p><p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p></div>`);
  }
  function pintarResultado(html) { S().html = html; const r = box && box.querySelector("#spz-resultado"); if (r) r.innerHTML = html; }

  /* Guía plegada: qué es cada cosa y un recorrido para empezar (LABSPZ.guia). */
  function guia() {
    const G = LABSPZ.guia;
    const sec = (s) => `<h4>${esc(s.titulo)}</h4>` + (s.parrafos || []).map((x) => `<p>${x}</p>`).join("") + (s.lista ? `<ul>${s.lista.map((x) => `<li>${x}</li>`).join("")}</ul>` : "");
    return `<details class="lb-saber spz-guia"><summary>${esc(G.titulo)}</summary>${G.secciones.map(sec).join("")}
      <h4>${esc(G.tRecorrido)}</h4><ol>${G.recorrido.map((x) => `<li>${x}</li>`).join("")}</ol></details>`;
  }

  /* Una entrada del repaso; con «suelta», sin id, para desplegarla bajo una premisa. */
  function bloqueRepaso(b, suelta) {
    const RP = (typeof LAB !== "undefined" && LAB.reProps) || {};
    const tit = RP[b.id] ? RP[b.id].nom : b.titulo, dice = RP[b.id] ? RP[b.id].dice : "";
    return `<div class="spz-rep${suelta ? " spz-rep-suelta" : ""}"${suelta ? "" : ` id="spz-rep-${b.id}"`}><h4>${esc(tit)}</h4>${dice ? `<p>${esc(dice.charAt(0).toUpperCase() + dice.slice(1))}.</p>` : ""}${b.txt ? `<p>${b.txt}</p>` : ""}${b.lista ? `<ul>${b.lista.map((x) => `<li>${sim(x)}</li>`).join("")}</ul>` : ""}${b.ej ? `<p class="spz-rep-ej">${sim(b.ej)}</p>` : ""}</div>`;
  }
  function repaso() {
    const R = LABSPZ.repaso, bloque = (b) => bloqueRepaso(b);
    const G = LABSPZ.guia;
    return `<details class="lb-saber spz-repaso"><summary>${esc(R.titulo)}</summary><p class="lb-nota">${esc(R.intro)}</p>
      <div class="spz-reps">${R.bloques.map(bloque).join("")}</div>
      <h4>${esc(R.tSimbolos)}</h4><dl class="spz-simbolos">${G.simbolos.map((x) => `<div><dt class="lb-sim">${esc(x.s)}</dt><dd>${esc(x.t)}</dd></div>`).join("")}</dl>
      <div class="lb-fila"><button type="button" class="btn ghost" data-spz-ir="relaciones">${esc(R.bPracticar)}</button></div></details>`;
  }
  /* Sobre Isabelle y agradecimientos (LABSPZ.isabelle). */
  function sobreIsabelle() {
    const I = LABSPZ.isabelle;
    return `<details class="lb-saber spz-isabelle"><summary>${esc(I.titulo)}</summary>${I.parrafos.map((x) => `<p>${x}</p>`).join("")}
      <p class="spz-gracias">${I.gracias}</p><h4>${esc(I.tEnlaces)}</h4>
      <ul>${I.enlaces.map((e) => `<li><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.txt)}</a></li>`).join("")}</ul></details>`;
  }
  /* Una fórmula con su lectura debajo. */
  function conLectura(f, clase) {
    const l = spzLeer(f);
    return `<p class="lb-res ${clase || ""}">${sim(f)}</p>` + (l ? `<p class="spz-lee"><span class="spz-lee-et">${esc(LABSPZ.repaso.tLectura)}:</span> ${l}</p>` : "");
  }

  function formaNombre(id) {
    const RP = (typeof LAB !== "undefined" && LAB.reProps) || {}, b = LABSPZ.repaso.bloques.find((x) => x.id === id);
    return RP[id] ? RP[id].nom : b ? b.titulo : id;
  }

  function defFila(d) {
    const f = W().formulaDef(d), l = /:⟺/.test(f) ? spzLeer(f) : null;
    return `<li><span class="spz-origen">${esc(d.origen)}</span><span class="spz-texto">${d.texto}</span><span class="lb-res">${sim(f)}</span>${l ? `<span class="spz-lee"><span class="spz-lee-et">${esc(LABSPZ.repaso.tLectura)}:</span> ${l}</span>` : ""}</li>`;
  }

  function pintar() {
    const M = W(), X = M.textos(), p = prop(), isa = M.isabelle[p.id], defs = definicionesDe(M.formal[p.id]), el = S().marcadas;
    const opciones = (parte) => X.props.filter((x) => (x.parte || 1) === parte).map((x) => `<option value="${x.id}"${x.id === p.id ? " selected" : ""}>${esc(x.nombre)}</option>`).join("");
    const premisas = X.grupos.map((g) => `<fieldset class="spz-grupo"><legend>${esc(g.nom)}</legend>` +
      X.premisas.filter((x) => x.grupo === g.id).map((x) => `<label class="spz-premisa${isa && isa.includes(x.id) ? " spz-isa" : ""}" for="spz-pr-${x.id}">
        <input type="checkbox" id="spz-pr-${x.id}" value="${x.id}"${el.includes(x.id) ? " checked" : ""}>
        <span class="lb-mono spz-nom">${x.id}${isa && isa.includes(x.id) ? ` <span class="spz-usada">· ${esc(spzT("usoIsabelle"))}</span>` : ""}</span><span class="spz-que">${esc(x.que)}</span>${M.premisaFormal && M.premisaFormal[x.id] ? `<span class="spz-pf">${sim(M.premisaFormal[x.id])}${M.premisaForma[x.id] ? ` <button type="button" class="spz-forma" aria-expanded="false" data-spz-rep="${M.premisaForma[x.id]}">${esc(formaNombre(M.premisaForma[x.id]))}</button>` : ""}</span>` : ""}</label>`).join("") + "</fieldset>").join("");
    const botonMundo = (id, k) => `<button type="button" class="fbtn" data-spz-mundo="${id}" aria-pressed="${st.mundo === id}">${esc(spzT(k))}</button>`;
    const abierta = box.querySelector(".spz-guia") && box.querySelector(".spz-guia").open;
    const repAbierto = box.querySelector(".spz-repaso") && box.querySelector(".spz-repaso").open;
    const isaAbierto = box.querySelector(".spz-isabelle") && box.querySelector(".spz-isabelle").open;
    box.innerHTML = `<div class="lb-fila spz-mundos" role="group" aria-label="${esc(spzT("mundo"))}"><span class="lb-et">${esc(spzT("mundo"))}</span>${botonMundo("tiempo", "mundoTiempo")}${botonMundo("spinoza", "mundoSpinoza")}</div>
      <p class="lg-intro">${esc(spzT(M.lede))}</p>
      <div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("enDesarrollo"))}</span> ${spzT("avisoDesarrollo")}</div>
      ${guia()}
      ${repaso()}
      ${sobreIsabelle()}
      <section class="lb-mesa"><h3>${esc(spzT("tDefiniciones"))}</h3><p class="lb-nota">${spzT(M.notaDefs)}</p>
        ${M.secciones().map(([k, lista]) => `<p class="spz-sub">${esc(spzT(k))}</p><ul class="spz-defs">${lista.map(defFila).join("")}</ul>`).join("")}</section>
      <div class="lb-dos">
        <section class="lb-mesa"><h3>${esc(spzT("tPregunta"))}</h3>
          <label class="lb-et-campo" for="spz-prop">${esc(spzT("proposicion"))}<select id="spz-prop">${M.grupos().map(([k, parte]) => `<optgroup label="${esc(spzT(k))}">${opciones(parte)}</optgroup>`).join("")}</select></label>
          ${p.cita ? `<blockquote class="spz-cita">«${esc(p.cita)}»</blockquote>` : ""}
          <div class="spz-formal">${defs.length ? `<span class="spz-sub">${esc(spzT("defsUsa"))}</span><div class="spz-lista">${defs.map((d) => conLectura(d)).join("")}</div>` : ""}
            <span class="spz-sub">${esc(spzT("enLogica"))}</span>${conLectura(M.formal[p.id])}</div>
          <p class="lb-pregunta">${spzT(p.posible ? "seCompruebaPos" : "seComprueba", { x: p.pregunta })}</p>
          <p class="lb-nota">${esc(p.posible && M.posibles[p.id] ? spzT("posibleIsa", { t: M.posibles[p.id].teorema }) : isa ? (isa.length ? spzT("necesitaCon", { x: isa.join(", ") }) : spzT("necesitaSin")) : spzT("necesitaNo"))}</p>
          <div class="lb-fila"><button type="button" class="btn ghost" data-spz="isabelle">${esc(spzT("bIsabelle"))}</button><button type="button" class="btn ghost" data-spz="todas">${esc(spzT("bTodas"))}</button><button type="button" class="btn ghost" data-spz="ninguna">${esc(spzT("bNinguna"))}</button></div>
          <div class="spz-premisas">${premisas}</div>
          <div class="lb-fila"><button type="button" class="btn" data-spz="probar">${esc(spzT("bProbar"))}</button></div>
        </section>
        <section class="lb-mesa" aria-live="polite"><h3>${esc(spzT("tResultado"))}</h3><div id="spz-resultado">${S().html}</div></section>
      </div>
      <p class="lb-nota">${esc(spzT(M.pie))}</p>`;
    if (abierta) box.querySelector(".spz-guia").open = true;
    if (repAbierto) box.querySelector(".spz-repaso").open = true;
    if (isaAbierto) box.querySelector(".spz-isabelle").open = true;
    /* Las etiquetas de las premisas despliegan, justo debajo, la entrada del repaso que toca (sin marcar la casilla). */
    box.querySelectorAll("[data-spz-rep]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const et = b.closest(".spz-premisa"), sig = et.nextElementSibling;   /* premisas; los pasos, abajo (delegado) */
      if (sig && sig.classList.contains("spz-rep-suelta")) { sig.remove(); b.setAttribute("aria-expanded", "false"); return; }
      const bl = LABSPZ.repaso.bloques.find((x) => x.id === b.dataset.spzRep);
      if (bl) { et.insertAdjacentHTML("afterend", bloqueRepaso(bl, true)); b.setAttribute("aria-expanded", "true"); }
    }));
    const res = box.querySelector("#spz-resultado");
    res.addEventListener("click", (e) => {
      const b = e.target.closest("[data-spz-rep]"); if (!b) return;
      const li = b.closest("li"), sig = li.lastElementChild;
      if (sig && sig.classList.contains("spz-rep-suelta")) { sig.remove(); b.setAttribute("aria-expanded", "false"); return; }
      const bl = LABSPZ.repaso.bloques.find((x) => x.id === b.dataset.spzRep);
      if (bl) { li.insertAdjacentHTML("beforeend", bloqueRepaso(bl, true)); b.setAttribute("aria-expanded", "true"); }
    });
    box.querySelectorAll("[data-spz-ir]").forEach((b) => b.addEventListener("click", () => { location.hash = "#logica/" + b.dataset.spzIr; }));
    box.querySelectorAll("[data-spz-mundo]").forEach((b) => b.addEventListener("click", () => {
      if (st.mundo === b.dataset.spzMundo) return;
      st.mundo = b.dataset.spzMundo; st.turno++; pintar(); if (!S().html) veredicto();
    }));
    box.querySelector("#spz-prop").addEventListener("change", (e) => { S().prop = e.target.value; S().marcadas = W().porDefecto(S().prop); pintar(); veredicto(); });
    box.querySelectorAll(".spz-premisa input").forEach((i) => i.addEventListener("change", () => { S().marcadas = [...box.querySelectorAll(".spz-premisa input:checked")].map((x) => x.value); }));
    box.querySelectorAll("[data-spz]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.spz;
      if (a === "isabelle") S().marcadas = (W().isabelle[S().prop] || []).slice();
      if (a === "todas") S().marcadas = W().textos().premisas.map((x) => x.id);
      if (a === "ninguna") S().marcadas = [];
      if (a !== "probar") box.querySelectorAll(".spz-premisa input").forEach((i) => { i.checked = S().marcadas.includes(i.value); });
      veredicto();
    }));
  }
  return { montar(b) { box = b; pintar(); if (!S().html) veredicto(); } };
})();
