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
  // ---------- Tercer mundo: el tiempo, definido (Mundo_tiempo_definido.thy) ----------
  // Los «atributos» de este mundo son instantes 0, 1, 2…; cada cosa empieza y acaba en un instante.
  // Antes, DuraMas, Sobrevive y ExisteEn son definiciones; las condiciones del tiempo (FIJAS) van siempre.
  const RELOJ = {
    RELACIONES: { Empieza: ['C', 'A'], Acaba: ['C', 'A'], Crea: ['C', 'C'] },
    maxAtributos: 4,
    lenguaje(m) {
      const L = base(m, RELOJ.RELACIONES), I = m.A;
      const cuando = (rel, x, f) => o(I.map(t => y(L[rel](x, t), f(t))));
      L.Antes = (x, z) => cuando('Empieza', x, t => cuando('Empieza', z, u => (t < u ? T : F)));
      L.Sobrevive = (x, z) => cuando('Acaba', x, t => cuando('Acaba', z, u => (u < t ? T : F)));
      L.DuraMas = (x, z) => cuando('Empieza', x, a => cuando('Acaba', x, b => cuando('Empieza', z, c2 => cuando('Acaba', z, d => (b - a > d - c2 ? T : F)))));
      L.ExisteEn = (x, t) => cuando('Empieza', x, a => cuando('Acaba', x, b => (a <= t && t <= b ? T : F)));
      L.increado = x => no(L.algunaCosa(z => L.Crea(z, x)));
      return L;
    },
    FIJAS: [
      L => L.todaCosa(x => L.algunAtr(t => L.Empieza(x, t))),
      L => L.todaCosa(x => L.todoAtr(t => L.todoAtr(u => si(y(L.Empieza(x, t), L.Empieza(x, u)), L.igual(t, u))))),
      L => L.todaCosa(x => L.algunAtr(t => L.Acaba(x, t))),
      L => L.todaCosa(x => L.todoAtr(t => L.todoAtr(u => si(y(L.Acaba(x, t), L.Acaba(x, u)), L.igual(t, u))))),
      L => L.todaCosa(x => L.todoAtr(t => L.todoAtr(u => si(y(L.Empieza(x, t), L.Acaba(x, u)), t <= u ? T : F)))),
    ],
    PREMISAS: {
      K_existe: L => L.todaCosa(x => L.todaCosa(z => si(L.Crea(x, z), L.algunAtr(t => y(L.Empieza(z, t), L.ExisteEn(x, t)))))),
      K_antes: L => L.todaCosa(x => L.todaCosa(z => si(L.Crea(x, z), L.Antes(x, z)))),
      // Más débil: quien crea no empieza después (puede crear a la vez que empieza lo creado, o crearse a sí mismo).
      K_no_despues: L => L.todaCosa(x => L.todaCosa(z => si(L.Crea(x, z), no(L.Antes(z, x))))),
      K_un_creador: L => L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.Crea(x, w), L.Crea(z, w)), L.igual(x, z))))),
      K_todo_creado: L => L.todaCosa(x => L.algunaCosa(z => L.Crea(z, x))),
    },
    OBJETIVOS: {
      R1: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.Antes(e.x, e.x)) },
      R2: { vars: [['x', 'C'], ['y_', 'C'], ['z', 'C']], cuerpo: (L, e) => si(y(L.Antes(e.x, e.y_), L.Antes(e.y_, e.z)), L.Antes(e.x, e.z)) },
      R3: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.Antes(e.x, e.y_), no(L.Antes(e.y_, e.x))) },
      R4: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.Crea(e.x, e.x)) },
      R5: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => y(L.Crea(x, z), L.Sobrevive(z, x)))) },
      R6: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => y(L.Crea(x, z), L.DuraMas(z, x)))) },
      R7: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(L.Sobrevive(e.x, e.y_), L.DuraMas(e.x, e.y_)) },
      R8: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(y(L.Antes(e.x, e.y_), L.Sobrevive(e.x, e.y_)), L.DuraMas(e.x, e.y_)) },
      R9: { vars: [], cuerpo: L => L.algunaCosa(x => L.increado(x)) },
      // R10, posibilidad: todo tiene creador (sin K_antes: crear a la vez, o crearse a sí mismo).
      R10: { vars: [], posible: true, cuerpo: L => L.todaCosa(x => L.algunaCosa(z => L.Crea(z, x))) },
    },
    clase: (L, x, verdad) => (evaluar(L.increado(x), verdad) ? 'increado' : 'creado'),
  };
  // ---------- Cuarto mundo: las cinco vías (Cinco_vias.thy) ----------
  // Los «atributos» son niveles (vías 1 y 2: el orden de las causas por sí, sin tiempo) o instantes (vía 3).
  // «Sin regreso al infinito»: en un mundo finito equivale a que haya niveles, y que quien mueve o causa esté en un nivel anterior.
  const VIAS = {
    RELACIONES: { Mueve: ['C', 'C'], Causa: ['C', 'C'], NivelM: ['C', 'A'], NivelC: ['C', 'A'], ExisteEn: ['C', 'A'],
      MasPerfecto: ['C', 'C'], TiendeAFin: ['C'], Conoce: ['C'], Dirige: ['C', 'C'] },
    ocultas: ['NivelM', 'NivelC'],   // solo sirven para escribir «sin regreso al infinito»: no se escriben ni se dibujan
    maxAtributos: 4,
    lenguaje(m) {
      const L = base(m, VIAS.RELACIONES);
      L.movido = x => L.algunaCosa(z => L.Mueve(z, x));
      L.causado = x => L.algunaCosa(z => L.Causa(z, x));
      L.contingente = x => L.algunAtr(t => no(L.ExisteEn(x, t)));
      L.necesario = x => L.todoAtr(t => L.ExisteEn(x, t));
      L.maximo = x => L.todaCosa(z => si(L.distinto(z, x), L.MasPerfecto(x, z)));
      L.primerMotor = x => y(no(L.movido(x)), L.algunaCosa(z => L.Mueve(x, z)));
      L.primeraCausa = x => y(no(L.causado(x)), L.algunaCosa(z => L.Causa(x, z)));
      return L;
    },
    PREMISAS: {
      V1_hay_movimiento: L => L.algunaCosa(x => L.movido(x)),
      V1_sin_regreso: L => y(L.todaCosa(x => L.algunAtr(t => L.NivelM(x, t))),
        L.todaCosa(x => L.todaCosa(z => L.todoAtr(t => L.todoAtr(u => si(y(L.Mueve(x, z), L.NivelM(x, t), L.NivelM(z, u)), t < u ? T : F)))))),
      V2_hay_causas: L => L.algunaCosa(x => L.causado(x)),
      V2_sin_regreso: L => y(L.todaCosa(x => L.algunAtr(t => L.NivelC(x, t))),
        L.todaCosa(x => L.todaCosa(z => L.todoAtr(t => L.todoAtr(u => si(y(L.Causa(x, z), L.NivelC(x, t), L.NivelC(z, u)), t < u ? T : F)))))),
      V3_siempre_algo: L => L.todoAtr(t => L.algunaCosa(x => L.ExisteEn(x, t))),
      V3_paso_de_Tomas: L => si(L.todaCosa(x => L.contingente(x)), L.algunAtr(t => L.todaCosa(x => no(L.ExisteEn(x, t))))),
      V4_orden: L => y(L.todaCosa(x => no(L.MasPerfecto(x, x))),
        L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.MasPerfecto(x, z), L.MasPerfecto(z, w)), L.MasPerfecto(x, w)))))),
      V4_comparables: L => L.todaCosa(x => L.todaCosa(z => si(L.distinto(x, z), o(L.MasPerfecto(x, z), L.MasPerfecto(z, x))))),
      V5_hay_fines: L => L.algunaCosa(x => y(L.TiendeAFin(x), no(L.Conoce(x)))),
      V5_dirigido: L => L.todaCosa(x => si(y(L.TiendeAFin(x), no(L.Conoce(x))), L.algunaCosa(z => y(L.Conoce(z), L.Dirige(z, x))))),
    },
    OBJETIVOS: {
      W1: { vars: [], cuerpo: L => L.algunaCosa(x => L.primerMotor(x)) },
      W1b: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.Mueve(e.x, e.x)) },
      W2: { vars: [], cuerpo: L => L.algunaCosa(x => L.primeraCausa(x)) },
      W3: { vars: [], cuerpo: L => L.algunaCosa(x => L.necesario(x)) },
      W3s: { vars: [], cuerpo: L => si(L.todaCosa(x => L.contingente(x)), L.algunAtr(t => L.todaCosa(x => no(L.ExisteEn(x, t))))) },
      W4: { vars: [], cuerpo: L => L.algunaCosa(x => L.maximo(x)) },
      W4u: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(y(L.maximo(e.x), L.maximo(e.y_)), L.igual(e.x, e.y_)) },
      W5: { vars: [], cuerpo: L => L.algunaCosa(z => y(L.Conoce(z), L.algunaCosa(x => L.Dirige(z, x)))) },
      WD: { vars: [['x', 'C'], ['y_', 'C']], cuerpo: (L, e) => si(y(L.primerMotor(e.x), L.primeraCausa(e.y_)), L.igual(e.x, e.y_)) },
    },
    clase: (L, x, verdad) => (evaluar(L.primerMotor(x), verdad) || evaluar(L.primeraCausa(x), verdad) ? 'primero' : 'otro'),
  };
  // ---------- Quinto mundo: las antinomias de Kant (Antinomias_dinamicas.thy y Antinomias_matematicas.thy) ----------
  // Los instantes (primera antinomia) son el tipo A con su orden numérico. Los niveles NivelC, NivelD y NivelP escriben
  // «sin regreso al infinito» como en las vías: en un mundo finito, eso es no tener círculos. Ocultos: ni se escriben ni se
  // dibujan. En un mundo finito siempre hay un primer instante, una primera causa y una parte última: los mundos que no
  // empiezan o se dividen sin fin son infinitos, y esos los construye Isabelle, no la mesa.
  const sinRegreso = (L, R, N) => y(L.todaCosa(x => L.algunAtr(t => N(x, t))),
    L.todaCosa(x => L.todaCosa(z => L.todoAtr(t => L.todoAtr(u => si(y(R(x, z), N(x, t), N(z, u)), t < u ? T : F))))));
  const ANT = {
    RELACIONES: { Mundo: ['A'], Parte: ['C', 'C'], EnEspacio: ['C'], Causa: ['C', 'C'], Fen: ['C'], CausaInt: ['C', 'C'],
      Cond: ['C', 'C'], EnMundo: ['C'], Fund: ['C', 'C'], NivelC: ['C', 'A'], NivelD: ['C', 'A'], NivelP: ['C', 'A'] },
    ocultas: ['NivelC', 'NivelD', 'NivelP'],
    maxAtributos: 4,
    lenguaje(m) {
      const L = base(m, ANT.RELACIONES);
      L.libre = x => no(L.algunaCosa(z => L.Causa(z, x)));
      L.incondicionado = x => no(L.algunaCosa(z => L.Cond(z, x)));
      L.simple = x => no(L.algunaCosa(z => L.Parte(z, x)));
      L.compuesto = x => L.algunaCosa(z => L.Parte(z, x));
      L.comienzo = () => L.algunAtr(t => y(L.Mundo(t), L.todoAtr(u => si(u < t ? T : F, no(L.Mundo(u))))));
      L.sinComienzo = () => y(L.algunAtr(t => L.Mundo(t)), L.todoAtr(t => si(L.Mundo(t), L.algunAtr(u => y(u < t ? T : F, L.Mundo(u))))));
      return L;
    },
    PREMISAS: {
      // Primera: en un mundo finito la serie de los estados pasados siempre está completa.
      T1_sintesis_completa: () => T,
      A1_tiempo_sin_principio: L => L.todoAtr(t => L.algunAtr(u => (u < t ? T : F))),
      A1_tiempo_vacio_homogeneo: L => L.todoAtr(t => L.todoAtr(u => si(y(L.Mundo(t), L.todoAtr(v => si(v < t ? T : F, no(L.Mundo(v)))), u < t ? T : F), L.Mundo(u)))),
      M1_hay_mundo: L => L.algunAtr(t => L.Mundo(t)),
      // Segunda
      T2_division_acaba: L => sinRegreso(L, L.Parte, L.NivelP),
      M_transitiva: L => L.todaCosa(x => L.todaCosa(z => L.todaCosa(w => si(y(L.Parte(x, z), L.Parte(z, w)), L.Parte(x, w))))),
      M_irreflexiva: L => L.todaCosa(x => no(L.Parte(x, x))),
      A2_espacio_divisible: L => L.todaCosa(x => si(L.EnEspacio(x), L.algunaCosa(z => y(L.Parte(z, x), L.EnEspacio(z))))),
      M2_hay_espacio: L => L.algunaCosa(x => L.EnEspacio(x)),
      // Tercera
      T3_serie_completa: L => sinRegreso(L, L.Causa, L.NivelC),
      A3_ley_natural: L => L.todaCosa(x => L.algunaCosa(z => L.Causa(z, x))),
      S3_ley_de_los_fenomenos: L => L.todaCosa(x => si(L.Fen(x), L.algunaCosa(z => y(L.Fen(z), L.Causa(z, x))))),
      // Cuarta
      T4_serie_completa: L => sinRegreso(L, L.Cond, L.NivelD),
      T4_condicion_en_el_tiempo: L => L.todaCosa(x => L.todaCosa(z => si(y(L.Cond(x, z), L.EnMundo(z)), L.EnMundo(x)))),
      A4_ley_dinamica: L => L.todaCosa(x => si(L.EnMundo(x), L.algunaCosa(z => L.Cond(z, x)))),
      M4_hay_mundo: L => L.algunaCosa(x => L.EnMundo(x)),
      S4_ley_en_el_mundo: L => L.todaCosa(x => si(L.EnMundo(x), L.algunaCosa(z => y(L.EnMundo(z), L.Cond(z, x))))),
    },
    OBJETIVOS: {
      K1T: { vars: [], cuerpo: L => L.comienzo() },
      K1A: { vars: [], cuerpo: L => no(L.comienzo()) },
      K1D: { vars: [], cuerpo: L => o(L.comienzo(), L.sinComienzo()) },
      K1S: { vars: [], posible: true, cuerpo: L => y(no(L.comienzo()), no(L.sinComienzo())) },
      K2T: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.compuesto(e.x), L.algunaCosa(s => y(L.simple(s), L.Parte(s, e.x)))) },
      K2A: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.EnEspacio(e.x), no(L.simple(e.x))) },
      K2M: { vars: [], posible: true, cuerpo: L => y(L.algunaCosa(s => L.simple(s)), L.algunaCosa(x => y(L.compuesto(x), no(L.algunaCosa(s => y(L.simple(s), L.Parte(s, x))))))) },
      K3T: { vars: [], cuerpo: L => L.algunaCosa(x => L.libre(x)) },
      K3A: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.libre(e.x)) },
      K3S: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => y(no(L.Fen(x)), L.libre(x), L.todaCosa(z => si(L.Fen(z), L.CausaInt(x, z))))) },
      K4T: { vars: [], cuerpo: L => L.algunaCosa(x => y(L.EnMundo(x), L.incondicionado(x))) },
      K4A: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.EnMundo(e.x), no(L.incondicionado(e.x))) },
      K4F: { vars: [['x', 'C']], cuerpo: (L, e) => si(no(L.EnMundo(e.x)), no(L.algunaCosa(z => y(L.EnMundo(z), L.Cond(e.x, z))))) },
      K4S: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => y(no(L.EnMundo(x)), L.incondicionado(x), L.todaCosa(z => si(L.EnMundo(z), L.Fund(x, z))))) },
      // Otras salidas, no las de Kant: soltar la premisa de la tesis. Sus mundos son infinitos (modelo_antitesis1-4).
      K1C: { vars: [], posible: true, cuerpo: L => L.sinComienzo() },
      K2C: { vars: [], posible: true, cuerpo: L => y(L.algunaCosa(x => L.compuesto(x)), L.todaCosa(x => no(L.simple(x)))) },
      K3C: { vars: [], posible: true, cuerpo: L => L.todaCosa(x => no(L.libre(x))) },
      K4C: { vars: [], posible: true, cuerpo: L => y(L.algunaCosa(x => L.EnMundo(x)), L.todaCosa(x => si(L.EnMundo(x), no(L.incondicionado(x)))),
        L.todaCosa(x => si(no(L.EnMundo(x)), no(L.algunaCosa(z => y(L.EnMundo(z), L.Cond(x, z))))))) },
    },
    clase: () => 'otro',
  };
  // ---------- Sexto mundo: del ser al cosmos (Parmenides_herederos.thy y Timeo_demiurgo.thy) ----------
  // «Es» se lee como «hay»: ExisteEn(x, t). Claro(x, t) hace de una cualidad que cambia (B8, 41: «mudar el color
  // brillante»). Las relaciones del Timeo no hablan del tiempo, salvo «comienza».
  const COSMOS = {
    RELACIONES: { ExisteEn: ['C', 'A'], Claro: ['C', 'A'], Vacio: ['C'], Generado: ['C'], Principio: ['C'], Siempre: ['C'],
      Deviene: ['C'], Visible: ['C'], Causa: ['C', 'C'], Bello: ['C'], Bueno: ['C'], Copia: ['C', 'C'] },
    maxAtributos: 3,
    lenguaje(m) {
      const L = base(m, COSMOS.RELACIONES);
      L.cambia = x => y(L.algunAtr(t => L.Claro(x, t)), L.algunAtr(t => no(L.Claro(x, t))));
      L.siempreEs = x => L.todoAtr(t => L.ExisteEn(x, t));
      L.comienza = x => L.algunAtr(t => y(L.ExisteEn(x, t), L.todoAtr(u => si(u < t ? T : F, no(L.ExisteEn(x, u))))));
      return L;
    },
    PREMISAS: {
      P_no_ser: L => L.todaCosa(x => L.todoAtr(t => L.ExisteEn(x, t))),
      P_salto_otro: L => L.todaCosa(x => L.todaCosa(z => L.todoAtr(t => si(L.distinto(x, z), no(L.ExisteEn(x, t)))))),
      P_salto_cambio: L => L.todaCosa(x => L.todoAtr(t => si(no(L.Claro(x, t)), no(L.ExisteEn(x, t))))),
      P_sin_vacio: L => L.todaCosa(x => no(L.Vacio(x))),
      P_separa: L => L.todaCosa(x => L.todaCosa(z => si(y(L.distinto(x, z), no(L.Vacio(x)), no(L.Vacio(z))), L.algunaCosa(w => L.Vacio(w))))),
      M_generado_principio: L => L.todaCosa(x => si(L.Generado(x), L.Principio(x))),
      M_no_generado: L => L.todaCosa(x => no(L.Generado(x))),
      M_conversa: L => L.todaCosa(x => si(L.Principio(x), L.Generado(x))),
      D_dos_planos: L => L.todaCosa(x => no(y(L.Siempre(x), L.Deviene(x)))),
      D_causa: L => L.todaCosa(x => si(L.Deviene(x), L.algunaCosa(d => L.Causa(d, x)))),
      D_visible: L => L.todaCosa(x => si(L.Visible(x), L.Deviene(x))),
      D_bello: L => L.todaCosa(x => si(L.Visible(x), L.Bello(x))),
      D_hacedor_bueno: L => L.todaCosa(d => L.todaCosa(x => si(y(L.Causa(d, x), L.Visible(x)), L.Bueno(d)))),
      D_modelo: L => L.todaCosa(d => L.todaCosa(x => si(y(L.Causa(d, x), L.Bello(x), L.Bueno(d)), L.algunaCosa(m2 => y(L.Siempre(m2), L.Copia(x, m2)))))),
      U_dos_copias: L => L.todaCosa(a => L.todaCosa(b => L.todaCosa(m2 => si(y(L.Copia(a, m2), L.Copia(b, m2), L.distinto(a, b)),
        L.algunaCosa(m3 => y(L.Copia(a, m3), L.distinto(m3, m2))))))),
      U_un_modelo: L => L.todaCosa(c => L.todaCosa(m2 => L.todaCosa(m3 => si(y(L.Copia(c, m2), L.Copia(c, m3)), L.igual(m2, m3))))),
      L_literal: L => L.todaCosa(d => L.todaCosa(x => si(L.Causa(d, x), L.comienza(x)))),
    },
    OBJETIVOS: {
      C1: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.cambia(e.x)) },
      C2: { vars: [['x', 'C'], ['z', 'C']], cuerpo: (L, e) => L.igual(e.x, e.z) },
      C3: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => y(L.distinto(x, z), L.siempreEs(x), L.siempreEs(z), L.cambia(x)))) },
      C4: { vars: [['x', 'C'], ['z', 'C']], cuerpo: (L, e) => si(y(no(L.Vacio(e.x)), no(L.Vacio(e.z))), L.igual(e.x, e.z)) },
      C5: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => L.algunaCosa(z => L.algunaCosa(w => y(L.distinto(x, z), no(L.Vacio(x)), no(L.Vacio(z)), L.Vacio(w))))) },
      C6: { vars: [['x', 'C']], cuerpo: (L, e) => no(L.Principio(e.x)) },
      C7: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.Visible(e.x), L.algunaCosa(d => L.Causa(d, e.x))) },
      C8: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.Visible(e.x), L.algunaCosa(m2 => y(L.Siempre(m2), L.Copia(e.x, m2)))) },
      C9: { vars: [['x', 'C']], cuerpo: (L, e) => si(L.Siempre(e.x), no(L.Deviene(e.x))) },
      C10: { vars: [['x', 'C'], ['z', 'C'], ['w', 'C']], cuerpo: (L, e) => si(y(L.Copia(e.x, e.w), L.Copia(e.z, e.w)), L.igual(e.x, e.z)) },
      C11: { vars: [], posible: true, cuerpo: L => L.algunaCosa(d => L.algunaCosa(x => y(L.Causa(d, x), L.algunAtr(t => L.ExisteEn(x, t)), no(L.comienza(x))))) },
      C12: { vars: [], posible: true, cuerpo: L => L.algunaCosa(x => y(L.comienza(x), L.siempreEs(x))) },
    },
    clase: () => 'otro',
  };
  const SPINOZA = { RELACIONES, lenguaje, PREMISAS, OBJETIVOS,
    clase: (L, x, verdad) => (evaluar(L.sustancia(x), verdad) ? 'sustancia' : evaluar(L.modo(x), verdad) ? 'modo' : 'ninguna') };
  const TEORIAS = { spinoza: SPINOZA, tiempo: TIEMPO, reloj: RELOJ, vias: VIAS, antinomias: ANT, cosmos: COSMOS };
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
  // Una premisa es el nombre de una de la teoría o una función L => término (escrita por el alumno);
  // un objetivo, el nombre de uno de la teoría o un objeto { vars, cuerpo, posible }.
  const premisa = (teo, p) => (typeof p === 'function' ? p : teo.PREMISAS[p]);
  const objetivoDe = (teo, o) => (o && typeof o === 'object' ? o : teo.OBJETIVOS[o]);
  function construir(m, premisas, objetivo, teo) {
    const L = teo.lenguaje(m);
    const partes = [...(teo.FIJAS || []).map(f => f(L)), ...premisas.map(p => premisa(teo, p)(L))];
    if (objetivo) {
      const obj = objetivoDe(teo, objetivo);
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
    const obj = objetivo && objetivoDe(teo, objetivo);
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
    return [...(teo.FIJAS || []), ...premisas.map(p => premisa(teo, p))].every(f => evaluar(f(L), verdad));
  }

  const API = { buscarContramodelo, hayMundo, evaluarPremisasEn, no, PREMISAS, OBJETIVOS, RELACIONES, TEORIAS,
    // Para las pruebas (comprobar_formales.js): piezas internas del motor.
    _internos: { Mundo, lenguaje, aCNF, resolver, casos, y, o, no, si, sii, T, F } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.MotorMundos = API;
})(typeof self !== 'undefined' ? self : this);

/* ---------- Vista de la mesa «Spinoza» del Laboratorio (Rincón de lógica) ----------
   Cuatro mundos: el de práctica (tiempo, duración y creación), el del tiempo definido, la Parte I de la Ética
   y las cinco vías de Tomás de Aquino.
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
/* Premisas que Isabelle demuestra que sobran (Spinoza_redundancia.thy): cada una por separado, no todas a la vez. */
const SPZ_SOBRA = {
  P16c1: { A1: "R_P16_cor1_sin_A1", H_ser_en_implica_concebirse: "R_P16_cor1_sin_concebirse" },
  P17c2: { A1: "R_P17_cor2_sin_A1", H_solo_en_si_solo_por_si: "R_P17_cor2_sin_solo_en_si", H_modo_en_sustancia: "R_P17_cor2_sin_modo_en_sustancia" },
  P21e: { A4: "R_P21e_sin_A4", H_por_si_excluye_por_otro: "R_P21e_sin_por_si_excluye" },
};
/* Mapa de propiedades de las relaciones (Propiedades_relaciones.thy): lema de cada fila de LABSPZ.repaso.mapa, en orden. */
const SPZ_MAPA_LEMAS = ["M1_irreflexiva_transitiva_asimetrica", "M2_asimetrica_irreflexiva", "M3_sin_regreso_asimetrica", "M4_sin_regreso_hay_primero",
  "M5_finito_sin_regreso", "M6_finito_total_maximo", "N1_asimetrica_no_transitiva", "N2_irreflexiva_no_asimetrica", "N3_transitiva_no_irreflexiva", "N4_infinito_con_regreso"];
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

/* Tercer mundo: el tiempo, definido (Mundo_tiempo_definido.thy). Los instantes son las variables t, u, v, w. */
const SPZ_VARS_A = { tiempo: [], spinoza: ["a", "b"], reloj: ["t", "u", "v", "w"], vias: ["t", "u", "v", "w"], antinomias: ["t", "u", "v", "w"], cosmos: ["t", "u"] };
const SPZ_DE_INSTANTES = ["reloj", "vias", "antinomias", "cosmos"];   /* mundos en que lo que en Spinoza son atributos son instantes */
let SPZ_MUNDO_LECTURA = null;   /* el mundo que se está leyendo (lo fija la vista); sin él, a y b son atributos */
const REL_FORMAL = {
  R1: "∀x. ¬Antes(x, x)", R2: "∀x y z. Antes(x, y) ∧ Antes(y, z) → Antes(x, z)", R3: "∀x y. Antes(x, y) → ¬Antes(y, x)",
  R4: "∀x. ¬Crea(x, x)", R5: "∃x y. Crea(x, y) ∧ Sobrevive(y, x)", R6: "∃x y. Crea(x, y) ∧ DuraMas(y, x)",
  R7: "∀x y. Sobrevive(x, y) → DuraMas(x, y)", R8: "∀x y. Antes(x, y) ∧ Sobrevive(x, y) → DuraMas(x, y)", R9: "∃x. increado(x)",
  R10: "∀x. ∃y. Crea(y, x)",
};
const REL_DEF = {
  Antes: "Antes(x, y) :⟺ ∃t u. Empieza(x, t) ∧ Empieza(y, u) ∧ t < u",
  Sobrevive: "Sobrevive(x, y) :⟺ ∃t u. Acaba(x, t) ∧ Acaba(y, u) ∧ u < t",
  ExisteEn: "ExisteEn(x, t) :⟺ ∃u v. Empieza(x, u) ∧ Acaba(x, v) ∧ u ≤ t ∧ t ≤ v",
  DuraMas: "DuraMas(x, y) :⟺ acaba(x) − empieza(x) > acaba(y) − empieza(y)",
  increado: "increado(x) :⟺ ¬∃y. Crea(y, x)",
};
const REL_FIJAS_FORMAL = { F_instantes: "0 < 1 < 2 < 3 < …", F_vida: "∀x. ∃t u. Empieza(x, t) ∧ Acaba(x, u) ∧ t ≤ u" };
const REL_PREMISA_FORMAL = {
  K_existe: "∀x y. Crea(x, y) → ∃t. Empieza(y, t) ∧ ExisteEn(x, t)", K_antes: "∀x y. Crea(x, y) → Antes(x, y)",
  K_no_despues: "∀x y. Crea(x, y) → ¬Antes(y, x)",
  K_un_creador: "∀x y z. Crea(x, z) ∧ Crea(y, z) → x = y", K_todo_creado: "∀x. ∃y. Crea(y, x)",
};
const REL_PREMISA_FORMA = { K_antes: "inclusion", K_un_creador: "unico", K_todo_creado: "serie" };
/* R1-R3 y R8 salen sin premisa ninguna: de lo que es el tiempo. */
const REL_ISABELLE = { R1: [], R2: [], R3: [], R4: ["K_antes"], R7: null, R8: [], R9: ["K_antes"] };
const REL_COMPATIBLES = ["K_existe", "K_antes", "K_un_creador"];
/* La 10 (todo puede tener creador) solo es posible sin K_antes: se empieza con la premisa más débil, K_no_despues. */
const REL_DEFECTO = { R10: ["K_existe", "K_no_despues", "K_un_creador"] };
const REL_POSIBLE = { R5: { teorema: "R5_posible" }, R6: { teorema: "R6_posible" },
  R10: { teorema: "R10_posible", impide: ["K_antes"], teoremaNo: "todo_creado_incompatible" } };

/* Cuarto mundo: las cinco vías de Tomás de Aquino (Cinco_vias.thy). Solo la tercera usa instantes (t, u, v, w).
   «Sin regreso al infinito» no se escribe en primer orden: en Isabelle es «la relación está bien fundada»; en la mesa,
   cada cosa lleva un número de orden y el motor siempre uno menor que lo movido (en un mundo finito es lo mismo). */
const VIA_FORMAL = {
  W1: "∃x. primerMotor(x)", W1b: "∀x. ¬Mueve(x, x)", W2: "∃x. primeraCausa(x)", W3: "∃x. necesario(x)",
  W3s: "(∀x. contingente(x)) → ∃t. ∀x. ¬ExisteEn(x, t)", W4: "∃x. maximo(x)", W4u: "∀x y. maximo(x) ∧ maximo(y) → x = y",
  W5: "∃y. Conoce(y) ∧ ∃x. Dirige(y, x)", WD: "∀x y. primerMotor(x) ∧ primeraCausa(y) → x = y",
};
const VIA_DEF = {
  movido: "movido(x) :⟺ ∃y. Mueve(y, x)",
  primerMotor: "primerMotor(x) :⟺ ¬movido(x) ∧ ∃y. Mueve(x, y)",
  causado: "causado(x) :⟺ ∃y. Causa(y, x)",
  primeraCausa: "primeraCausa(x) :⟺ ¬causado(x) ∧ ∃y. Causa(x, y)",
  contingente: "contingente(x) :⟺ ∃t. ¬ExisteEn(x, t)",
  necesario: "necesario(x) :⟺ ∀t. ExisteEn(x, t)",
  maximo: "maximo(x) :⟺ ∀y. y ≠ x → MasPerfecto(x, y)",
};
const VIA_PREMISA_FORMAL = {
  V1_hay_movimiento: "∃x. movido(x)", V1_sin_regreso: "wf(Mueve)",
  V2_hay_causas: "∃x. causado(x)", V2_sin_regreso: "wf(Causa)",
  V3_siempre_algo: "∀t. ∃x. ExisteEn(x, t)", V3_paso_de_Tomas: "(∀x. contingente(x)) → ∃t. ∀x. ¬ExisteEn(x, t)",
  V4_orden: "(∀x. ¬MasPerfecto(x, x)) ∧ (∀x y z. MasPerfecto(x, y) ∧ MasPerfecto(y, z) → MasPerfecto(x, z))",
  V4_comparables: "∀x y. x ≠ y → MasPerfecto(x, y) ∨ MasPerfecto(y, x)",
  V5_hay_fines: "∃x. TiendeAFin(x) ∧ ¬Conoce(x)", V5_dirigido: "∀x. TiendeAFin(x) ∧ ¬Conoce(x) → ∃y. Conoce(y) ∧ Dirige(y, x)",
};
const VIA_PREMISA_FORMA = { V4_orden: "trans" };
/* W4: Isabelle lo demuestra en un mundo finito (via4_finito); con infinitas cosas no vale (via4_sin_maximo). */
const VIA_ISABELLE = { W1: ["V1_hay_movimiento", "V1_sin_regreso"], W1b: ["V1_sin_regreso"], W2: ["V2_hay_causas", "V2_sin_regreso"],
  W3: ["V3_siempre_algo", "V3_paso_de_Tomas"], W3s: null, W4: ["V4_orden", "V4_comparables"], W4u: ["V4_orden"],
  W5: ["V5_hay_fines", "V5_dirigido"], WD: null };
const VIA_TEOREMA = { W1: "via1", W1b: "via1_irreflexiva", W2: "via2", W3: "via3", W4: "via4_finito", W4u: "via4_unico", W5: "via5" };
const VIA_COMPATIBLES = ["V1_hay_movimiento", "V1_sin_regreso", "V2_hay_causas", "V2_sin_regreso", "V3_siempre_algo", "V3_paso_de_Tomas",
  "V4_orden", "V4_comparables", "V5_hay_fines", "V5_dirigido"];
/* La 5 empieza sin el paso discutido (si no, se sigue de sí mismo); la 9, con las dos primeras vías completas. */
/* Quinto mundo: las antinomias de Kant (Antinomias_dinamicas.thy y Antinomias_matematicas.thy). Los instantes de la
   primera son t, u, v, w; las cosas, x, y, z. «Serie completa» = sin regreso al infinito (interpretación, como en las vías).
   En un mundo finito no hay regreso sin fin ni división sin fin: esos mundos los construye Isabelle con los enteros. */
const ANT_FORMAL = {
  K1T: "∃t. Mundo(t) ∧ ∀u. u < t → ¬Mundo(u)",
  K1A: "¬∃t. Mundo(t) ∧ ∀u. u < t → ¬Mundo(u)",
  K1D: "(∃t. Mundo(t) ∧ ∀u. u < t → ¬Mundo(u)) ∨ ((∃t. Mundo(t)) ∧ ∀t. Mundo(t) → ∃u. u < t ∧ Mundo(u))",
  K1S: "¬(∃t. Mundo(t) ∧ ∀u. u < t → ¬Mundo(u)) ∧ ¬((∃t. Mundo(t)) ∧ ∀t. Mundo(t) → ∃u. u < t ∧ Mundo(u))",
  K2T: "∀x. compuesto(x) → ∃y. simple(y) ∧ Parte(y, x)",
  K2A: "∀x. EnEspacio(x) → ¬simple(x)",
  K2M: "(∃x. simple(x)) ∧ ∃x. compuesto(x) ∧ ¬∃y. simple(y) ∧ Parte(y, x)",
  K3T: "∃x. libre(x)",
  K3A: "∀x. ¬libre(x)",
  K3S: "∃x. ¬Fen(x) ∧ libre(x) ∧ ∀y. Fen(y) → CausaInt(x, y)",
  K4T: "∃x. EnMundo(x) ∧ incondicionado(x)",
  K4A: "∀x. EnMundo(x) → ¬incondicionado(x)",
  K4F: "∀x. ¬EnMundo(x) → ¬∃y. EnMundo(y) ∧ Cond(x, y)",
  K4S: "∃x. ¬EnMundo(x) ∧ incondicionado(x) ∧ ∀y. EnMundo(y) → Fund(x, y)",
  K1C: "(∃t. Mundo(t)) ∧ ∀t. Mundo(t) → ∃u. u < t ∧ Mundo(u)",
  K2C: "(∃x. compuesto(x)) ∧ ∀x. ¬simple(x)",
  K3C: "∀x. ¬libre(x)",
  K4C: "(∃x. EnMundo(x)) ∧ (∀x. EnMundo(x) → ¬incondicionado(x)) ∧ ∀x. ¬EnMundo(x) → ¬∃y. EnMundo(y) ∧ Cond(x, y)",
};
const ANT_DEF = {
  libre: "libre(x) :⟺ ¬∃y. Causa(y, x)",
  incondicionado: "incondicionado(x) :⟺ ¬∃y. Cond(y, x)",
  simple: "simple(x) :⟺ ¬∃y. Parte(y, x)",
  compuesto: "compuesto(x) :⟺ ∃y. Parte(y, x)",
};
const ANT_PREMISA_FORMAL = {
  T1_sintesis_completa: "wf(Mundo)", A1_tiempo_sin_principio: "∀t. ∃u. u < t",
  A1_tiempo_vacio_homogeneo: "∀t u. Mundo(t) ∧ (∀v. v < t → ¬Mundo(v)) ∧ u < t → Mundo(u)", M1_hay_mundo: "∃t. Mundo(t)",
  T2_division_acaba: "wf(Parte)", M_transitiva: "∀x y z. Parte(x, y) ∧ Parte(y, z) → Parte(x, z)", M_irreflexiva: "∀x. ¬Parte(x, x)",
  A2_espacio_divisible: "∀x. EnEspacio(x) → ∃y. Parte(y, x) ∧ EnEspacio(y)", M2_hay_espacio: "∃x. EnEspacio(x)",
  T3_serie_completa: "wf(Causa)", A3_ley_natural: "∀x. ∃y. Causa(y, x)", S3_ley_de_los_fenomenos: "∀x. Fen(x) → ∃y. Fen(y) ∧ Causa(y, x)",
  T4_serie_completa: "wf(Cond)", T4_condicion_en_el_tiempo: "∀x y. Cond(x, y) ∧ EnMundo(y) → EnMundo(x)",
  A4_ley_dinamica: "∀x. EnMundo(x) → ∃y. Cond(y, x)", M4_hay_mundo: "∃x. EnMundo(x)",
  S4_ley_en_el_mundo: "∀x. EnMundo(x) → ∃y. EnMundo(y) ∧ Cond(y, x)",
};
const ANT_PREMISA_FORMA = { M_transitiva: "trans", M_irreflexiva: "irrefl" };
const ANT_ISABELLE = { K1T: ["T1_sintesis_completa", "M1_hay_mundo"], K1A: ["A1_tiempo_sin_principio", "A1_tiempo_vacio_homogeneo"],
  K1D: ["M1_hay_mundo"], K2T: ["T2_division_acaba", "M_transitiva"], K2A: ["A2_espacio_divisible"], K3T: ["T3_serie_completa"],
  K3A: ["A3_ley_natural"], K4T: ["T4_serie_completa", "T4_condicion_en_el_tiempo", "M4_hay_mundo"], K4A: ["A4_ley_dinamica"],
  K4F: ["T4_condicion_en_el_tiempo"] };
const ANT_TEOREMA = { K1T: "tesis1", K1A: "antitesis1", K1D: "con_mundo_dado_contradictorias", K2T: "tesis2", K2A: "antitesis2",
  K3T: "tesis3", K3A: "antitesis3", K4T: "tesis4", K4A: "antitesis4_en_el_mundo", K4F: "antitesis4_fuera" };
/* Posibilidades: las salidas de Kant (K1S, K2M, K3S, K4S) y las otras, soltando la premisa de la tesis (K1C-K4C).
   infinito: el mundo que lo muestra es infinito, la mesa no lo busca; impide: con esa premisa no puede ocurrir. */
const ANT_POSIBLE = { K1S: { teorema: "sin_mundo_dado_contrarias", impide: ["M1_hay_mundo"], teoremaNo: "con_mundo_dado_contradictorias" },
  K2M: { teorema: "mixto_contrarias", infinito: true }, K3S: { teorema: "solucion3" }, K4S: { teorema: "solucion4" },
  K1C: { teorema: "modelo_antitesis1", infinito: true, impide: ["T1_sintesis_completa"], teoremaNo: "tesis1" },
  K2C: { teorema: "modelo_antitesis2", infinito: true, impide: ["T2_division_acaba"], teoremaNo: "division_acaba_hay_simple" },
  K3C: { teorema: "modelo_antitesis3", infinito: true, impide: ["T3_serie_completa"], teoremaNo: "tesis3" },
  K4C: { teorema: "modelo_antitesis4", infinito: true, impide: ["T4_serie_completa"], teoremaNo: "salida4_con_serie_completa" } };
/* Los choques que Isabelle demuestra en cualquier mundo, también infinito (choque1-4). */
const ANT_CHOQUES = [{ p: ["T3_serie_completa", "A3_ley_natural"], t: "choque3" }, { p: ["T2_division_acaba", "A2_espacio_divisible", "M2_hay_espacio"], t: "choque2" },
  { p: ["T4_serie_completa", "T4_condicion_en_el_tiempo", "A4_ley_dinamica", "M4_hay_mundo"], t: "choque4" },
  { p: ["T1_sintesis_completa", "A1_tiempo_sin_principio", "A1_tiempo_vacio_homogeneo", "M1_hay_mundo"], t: "choque1" }];
const ANT_DEFECTO = { K1S: [], K2M: ["M_transitiva", "M_irreflexiva"], K3S: ["S3_ley_de_los_fenomenos"], K4S: ["S4_ley_en_el_mundo", "T4_condicion_en_el_tiempo"],
  K1C: ["A1_tiempo_sin_principio", "A1_tiempo_vacio_homogeneo", "M1_hay_mundo"], K2C: ["M_transitiva", "M_irreflexiva", "A2_espacio_divisible", "M2_hay_espacio"],
  K3C: ["A3_ley_natural"], K4C: ["T4_condicion_en_el_tiempo", "A4_ley_dinamica", "M4_hay_mundo"] };
const VIA_DEFECTO = { W3s: ["V3_siempre_algo"], WD: ["V1_hay_movimiento", "V1_sin_regreso", "V2_hay_causas", "V2_sin_regreso"] };

/* Sexto mundo: del ser al cosmos (Parmenides_herederos.thy y Timeo_demiurgo.thy). Cosas x, y, z, w; instantes t, u.
   «Es» = «hay»: ExisteEn(x, t). Claro(x, t) hace de una cualidad que cambia. */
const COS_FORMAL = {
  C1: "∀x. ¬cambia(x)",
  C2: "∀x y. x = y",
  C3: "∃x y. x ≠ y ∧ siempreEs(x) ∧ siempreEs(y) ∧ cambia(x)",
  C4: "∀x y. ¬Vacio(x) ∧ ¬Vacio(y) → x = y",
  C5: "∃x y z. x ≠ y ∧ ¬Vacio(x) ∧ ¬Vacio(y) ∧ Vacio(z)",
  C6: "∀x. ¬Principio(x)",
  C7: "∀x. Visible(x) → ∃y. Causa(y, x)",
  C8: "∀x. Visible(x) → ∃y. Siempre(y) ∧ Copia(x, y)",
  C9: "∀x. Siempre(x) → ¬Deviene(x)",
  C10: "∀x y z. Copia(x, z) ∧ Copia(y, z) → x = y",
  C11: "∃x y. Causa(x, y) ∧ (∃t. ExisteEn(y, t)) ∧ ¬comienza(y)",
  C12: "∃x. comienza(x) ∧ siempreEs(x)",
};
const COS_DEF = {
  cambia: "cambia(x) :⟺ (∃t. Claro(x, t)) ∧ ∃t. ¬Claro(x, t)",
  siempreEs: "siempreEs(x) :⟺ ∀t. ExisteEn(x, t)",
  comienza: "comienza(x) :⟺ ∃t. ExisteEn(x, t) ∧ ∀u. u < t → ¬ExisteEn(x, u)",
};
const COS_PREMISA_FORMAL = {
  P_no_ser: "∀x t. ExisteEn(x, t)", P_salto_otro: "∀x y t. x ≠ y → ¬ExisteEn(x, t)", P_salto_cambio: "∀x t. ¬Claro(x, t) → ¬ExisteEn(x, t)",
  P_sin_vacio: "∀x. ¬Vacio(x)", P_separa: "∀x y. x ≠ y ∧ ¬Vacio(x) ∧ ¬Vacio(y) → ∃z. Vacio(z)",
  M_generado_principio: "∀x. Generado(x) → Principio(x)", M_no_generado: "∀x. ¬Generado(x)", M_conversa: "∀x. Principio(x) → Generado(x)",
  D_dos_planos: "∀x. ¬(Siempre(x) ∧ Deviene(x))", D_causa: "∀x. Deviene(x) → ∃y. Causa(y, x)", D_visible: "∀x. Visible(x) → Deviene(x)",
  D_bello: "∀x. Visible(x) → Bello(x)", D_hacedor_bueno: "∀x y. Causa(x, y) ∧ Visible(y) → Bueno(x)",
  D_modelo: "∀x y. Causa(x, y) ∧ Bello(y) ∧ Bueno(x) → ∃z. Siempre(z) ∧ Copia(y, z)",
  U_dos_copias: "∀x y z. Copia(x, z) ∧ Copia(y, z) ∧ x ≠ y → ∃w. Copia(x, w) ∧ w ≠ z",
  U_un_modelo: "∀x y z. Copia(x, y) ∧ Copia(x, z) → y = z", L_literal: "∀x y. Causa(x, y) → comienza(y)",
};
const COS_ISABELLE = { C1: ["P_no_ser", "P_salto_cambio"], C2: ["P_no_ser", "P_salto_otro"], C4: ["P_sin_vacio", "P_separa"],
  C6: ["M_no_generado", "M_conversa"], C7: ["D_causa", "D_visible"], C8: ["D_causa", "D_visible", "D_bello", "D_hacedor_bueno", "D_modelo"],
  C9: ["D_dos_planos"], C10: ["U_dos_copias", "U_un_modelo"] };
const COS_TEOREMA = { C1: "inmovil_mesa", C2: "uno_mesa", C4: "uno_sin_vacio", C6: "Meliso_con_la_conversa", C7: "hay_hacedor_mesa",
  C8: "modelo_eterno_mesa", C9: "el_modelo_no_deviene", C10: "un_solo_cosmos_mesa" };
/* Las salidas de los herederos. C11 necesita infinitos instantes hacia atrás: lo construye Isabelle. */
const COS_POSIBLE = { C3: { teorema: "sin_el_salto" }, C5: { teorema: "muchos_con_vacio" },
  C11: { teorema: "lectura_dependencia", infinito: true, impide: ["L_literal"], teoremaNo: "literal_comienza" }, C12: { teorema: "tiempo_con_el_cosmos" } };
/* Meliso viene con sus propias premisas: así sale el contramodelo que le reprocha Aristóteles. */
const COS_DEFECTO = { C3: ["P_no_ser"], C5: ["P_separa"], C6: ["M_generado_principio", "M_no_generado"], C11: [], C12: [] };

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
  const mundoL = SPZ_MUNDO_LECTURA, deInst = SPZ_DE_INSTANTES.includes(mundoL);
  const esAtr = (v) => (mundoL ? SPZ_VARS_A[mundoL] : ["a", "b"]).includes(v);
  /* Lo compuesto que va dentro de otra cosa, entre paréntesis para que no se mezcle. */
  const leer = (e, ctx) => {
    const s = e.at ? e.pos : e.txt;
    const par = ctx && (e.k === "q" || e.k === "si" || e.k === "sii" || (e.k === "kO" && ctx === "kY") || (e.k === "kY" && ctx === "kO"));
    return par ? "(" + s + ")" : s;
  };
  function analizar(src) {
    const toks = src.match(/[∀∃¬∧∨→↔≠=<≤(),.]|[A-Za-zÀ-ÿ_]\w*|\S/g) || [];
    let i = 0;
    const ver = () => toks[i], tomar = (x) => { if (i >= toks.length || (x && toks[i] !== x)) throw 0; return toks[i++]; };
    function cuant(negado) {
      const q = tomar(), vs = [];
      while (ver() && ver() !== ".") { const v = tomar(); if (v !== ",") vs.push(v); }
      tomar(".");
      const cs = vs.filter((v) => !esAtr(v)), as = vs.filter(esAtr), partes = [], nom = (xs) => lista(xs.map(nombre), "conY");
      /* En el mundo del tiempo definido, lo que en Spinoza son atributos son instantes. */
      const K = deInst ? { todo1: LX.paraTodoI, todos: LX.paraTodosI, hay1: LX.hayInst, hays: LX.hayInsts, mixto: LX.hayMixtoI, no: LX.noHayInst }
        : { todo1: LX.paraTodo, todos: LX.paraTodos, hay1: LX.hayAtr, hays: LX.hayAtrs, mixto: LX.hayMixto, no: LX.noHayAtr };
      if (negado && cs.length + as.length === 1) partes.push(tpl(cs.length ? LX.noHay : K.no, { v: nom(cs.length ? cs : as) }));
      else if (negado) throw 0;
      else if (q === "∃" && cs.length && as.length) partes.push(tpl(K.mixto, { c: nom(cs), a: nom(as) }));
      else if (q === "∀") {
        if (cs.length) partes.push(tpl(cs.length === 1 ? LX.paraToda : LX.paraTodas, { v: nom(cs) }));
        if (as.length) partes.push(tpl(as.length === 1 ? K.todo1 : K.todos, { v: nom(as) }));
      } else {
        if (cs.length) partes.push(tpl(cs.length === 1 ? LX.hayUna : LX.hayVarias, { v: nom(cs) }));
        if (as.length) partes.push(tpl(as.length === 1 ? K.hay1 : K.hays, { v: nom(as) }));
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
      if (ver() === "<" || ver() === "≤") {
        const op = tomar(), v = { 1: nombre(n), 2: nombre(tomar()) };
        return { at: true, pos: tpl(op === "<" ? LX.menorI : LX.menorIgI, v), neg: tpl(LX.noEs, { a: tpl(op === "<" ? LX.menorI : LX.menorIgI, v) }) };
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

/* Lo que escribe el alumno: texto → árbol → fórmula del motor (y su forma canónica, para leerla en voz alta).
   Atajos: ~ ! no (¬), & (∧), | (∨), -> (→), <-> (↔), != (≠), todo (∀), hay (∃). Variables: letras minúsculas. */
function spzVocabulario(mundo) {
  const T = MotorMundos.TEORIAS[mundo], voc = {};
  for (const [n, tipos] of Object.entries(T.RELACIONES)) if (!(T.ocultas || []).includes(n)) voc[n] = tipos;
  const defs = { tiempo: TMP_DEF, reloj: REL_DEF, vias: VIA_DEF, antinomias: ANT_DEF, cosmos: COS_DEF }[mundo] || SPZ_DEF;
  for (const [n, f] of Object.entries(defs)) {
    const m = f.match(/^\w+\(([^)]*)\)/), args = m ? m[1].split(",").map((x) => x.trim()) : [];
    voc[n] = args.map((a) => (SPZ_VARS_A[mundo].includes(a) ? "A" : "C"));
  }
  return voc;
}
function spzCompilar(texto, mundo) {
  const voc = spzVocabulario(mundo), nombres = Object.keys(voc);
  const plano = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const canon = Object.fromEntries(nombres.map((n) => [plano(n), n]));
  const esVar = (t) => /^[a-z]\d*$/.test(t) && !canon[t];
  const esAtr = (v) => SPZ_VARS_A[mundo].includes(v);
  const constantes = mundo === "spinoza" ? { dios: "Dios", [plano(spzT("Dios"))]: "Dios" } : {};
  const err = (k, v) => { throw { k, v: v || {} }; };
  const src = String(texto || "").replace(/<->|<=>/g, "↔").replace(/->|=>/g, "→").replace(/!=/g, "≠").replace(/<=/g, "≤").replace(/[~!]/g, "¬").replace(/&/g, "∧").replace(/\|/g, "∨");
  const toks = src.match(/[∀∃¬∧∨→↔≠=<≤(),.:]|[A-Za-zÀ-ÿ؀-ۿ_][\wÀ-ÿ؀-ۿ]*|\S/g) || [];   // también letras árabes (palabras clave traducidas)
  if (!toks.length) return { ok: false, error: { k: "errVacio", v: {} } };
  /* Palabras para ∀, ∃ y ¬: las de la lengua de la web (palTodo, palHay, palNo) y, de respaldo, castellano e inglés. */
  const PAL = { todo: "∀", todos: "∀", all: "∀", forall: "∀", hay: "∃", existe: "∃", exists: "∃", some: "∃", no: "¬", not: "¬",
    [plano(spzT("palTodo"))]: "∀", [plano(spzT("palHay"))]: "∃", [plano(spzT("palNo"))]: "¬" };
  for (let k = 0; k < toks.length; k++) if (PAL[plano(toks[k])] && toks[k + 1] !== "(") toks[k] = PAL[plano(toks[k])];
  let i = 0;
  const ver = () => toks[i], tomar = () => toks[i++];
  const libres = [], ligadas = [];
  function termino(tipo, nombre, lugar) {
    const t = tomar();
    if (t == null) err("errFin");
    const c = constantes[plano(t)];
    if (c) { if (tipo === "A") err("errTipo", { x: nombre, n: lugar }); return { c }; }
    if (!esVar(t)) err("errEsperabaCosa", { x: t, y: nombre });
    if (tipo === "C" && esAtr(t)) err(SPZ_DE_INSTANTES.includes(mundo) ? "errTipoCI" : "errTipoC", { x: nombre, n: lugar });
    if (tipo === "A" && !esAtr(t)) err(SPZ_DE_INSTANTES.includes(mundo) ? "errTipoI" : "errTipo", { x: nombre, n: lugar });
    if (!ligadas.includes(t) && !libres.includes(t)) libres.push(t);
    return { v: t };
  }
  function atomo() {
    const t = tomar();
    if (t == null) err("errFin");
    if (t === ")") err("errAbre");
    if (/^[∧∨→↔.,:=≠<≤]$/.test(t)) err("errEsperaba", { x: t });
    const n = canon[plano(t)];
    if (n && ver() === "(") {
      tomar(); const tipos = voc[n], args = [];
      while (ver() !== ")") {
        if (ver() == null) err("errParen");
        if (args.length && tomar() !== ",") err("errArgs", { x: n, n: tipos.length });
        if (args.length >= tipos.length) err("errArgs", { x: n, n: tipos.length });
        args.push(termino(tipos[args.length], n, args.length + 1));
      }
      tomar();
      if (args.length !== tipos.length) err("errArgs", { x: n, n: tipos.length });
      return { at: n, args };
    }
    if (n) err("errFaltaParen", { x: n });
    if (esVar(t) || constantes[plano(t)]) {
      i--; const a = termino(null, "=", 1), op = tomar();
      if (op !== "=" && op !== "≠" && op !== "<" && op !== "≤") err(op == null ? "errFin" : "errSobra", { x: op });
      const b = termino(null, op, 2);
      if ((op === "<" || op === "≤") && !(a.v && esAtr(a.v) && b.v && esAtr(b.v))) err("errComp", { x: op });
      return { eq: op, a, b };
    }
    if (/^[A-Za-zÀ-ÿ]/.test(t)) err("errNombre", { x: t, y: nombres.join(", ") });
    err("errSimbolo", { x: t });
  }
  function cuant() {
    const q = tomar(), vs = [];
    while (ver() != null && esVar(ver())) vs.push(tomar());
    if (!vs.length) err("errCuant", { x: q });
    if (ver() === "." || ver() === ":") tomar();
    ligadas.push(...vs);
    const cuerpo = expr();
    vs.forEach(() => ligadas.pop());
    return { q, vs, cuerpo };
  }
  function un() {
    const t = ver();
    if (t === "¬") { tomar(); return { no: un() }; }
    if (t === "∀" || t === "∃") return cuant();
    if (t === "(") { tomar(); const e = expr(); if (tomar() !== ")") err("errParen"); return e; }
    return atomo();
  }
  const cadena = (sig, op, k) => () => { const xs = [sig()]; while (ver() === op) { tomar(); xs.push(sig()); } return xs.length === 1 ? xs[0] : { [k]: xs }; };
  const conj = cadena(un, "∧", "kY"), disy = cadena(conj, "∨", "kO");
  function impl() { const a = disy(); if (ver() === "→") { tomar(); return { si: [a, impl()] }; } return a; }
  function expr() { const a = impl(); if (ver() === "↔") { tomar(); return { sii: [a, impl()] }; } return a; }
  let arbol;
  try {
    arbol = expr();
    if (i < toks.length) err(toks[i] === ")" ? "errAbre" : "errSobra", { x: toks[i] });
  } catch (e) { if (e && e.k) return { ok: false, error: e }; throw e; }

  /* Forma canónica (para mostrarla y leerla) */
  const nivel = (n) => (n.q ? 0 : n.sii ? 1 : n.si ? 2 : n.kO ? 3 : n.kY ? 4 : n.no ? 5 : 6);
  const ter = (t) => t.c || t.v;
  function imp(n, min) {
    let s;
    if (n.q) s = n.q + n.vs.join(" ") + ". " + imp(n.cuerpo, 0);
    else if (n.sii) s = imp(n.sii[0], 2) + " ↔ " + imp(n.sii[1], 2);
    else if (n.si) s = imp(n.si[0], 3) + " → " + imp(n.si[1], 2);
    else if (n.kO) s = n.kO.map((x) => imp(x, 4)).join(" ∨ ");
    else if (n.kY) s = n.kY.map((x) => imp(x, 5)).join(" ∧ ");
    else if (n.no) s = "¬" + imp(n.no, 5);
    else if (n.eq) s = ter(n.a) + " " + n.eq + " " + ter(n.b);
    else s = n.at + "(" + n.args.map(ter).join(", ") + ")";
    return nivel(n) < min ? "(" + s + ")" : s;
  }
  const normal = imp(arbol, 0);

  /* Fórmula del motor: ev(nodo, L, entorno) */
  const { y, o, no, si, sii } = MotorMundos._internos;
  function ev(n, L, env) {
    if (n.q) {
      const cierra = (k, e2) => {
        if (k === n.vs.length) return ev(n.cuerpo, L, e2);
        const v = n.vs[k], dom = esAtr(v) ? (n.q === "∀" ? L.todoAtr : L.algunAtr) : (n.q === "∀" ? L.todaCosa : L.algunaCosa);
        return dom((d) => cierra(k + 1, { ...e2, [v]: d }));
      };
      return cierra(0, env);
    }
    if (n.no) return no(ev(n.no, L, env));
    if (n.kY) return y(n.kY.map((x) => ev(x, L, env)));
    if (n.kO) return o(n.kO.map((x) => ev(x, L, env)));
    if (n.si) return si(ev(n.si[0], L, env), ev(n.si[1], L, env));
    if (n.sii) return sii(ev(n.sii[0], L, env), ev(n.sii[1], L, env));
    const val = (t) => (t.c ? L[t.c] : env[t.v]);
    if (n.eq === "<" || n.eq === "≤") { const A = val(n.a), B = val(n.b); return (n.eq === "<" ? A < B : A <= B) ? MotorMundos._internos.T : MotorMundos._internos.F; }
    if (n.eq) return n.eq === "=" ? L.igual(val(n.a), val(n.b)) : L.distinto(val(n.a), val(n.b));
    return L[n.at](...n.args.map(val));
  }
  const tipoV = (v) => (esAtr(v) ? "A" : "C");
  const vars = libres.map((v) => [v, tipoV(v)]);
  /* Como premisa, las variables libres se leen como «para todo». */
  const cerrado = libres.length ? { q: "∀", vs: libres.slice(), cuerpo: arbol } : arbol;
  return {
    ok: true, normal, libres, normalCerrada: imp(cerrado, 0),
    objetivo: (posible) => ({ vars, posible: !!posible, cuerpo: (L, e) => ev(arbol, L, e) }),
    premisa: (L) => ev(cerrado, L, {}),
  };
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
  const ESTILOS_VIAS = {
    Mueve: { color: "var(--r-pol)", guion: "", grosor: 2.4, k: "lyMueve" },
    Causa: { color: "var(--e-ant)", guion: "6 3", grosor: 2, k: "lyCausa" },
    MasPerfecto: { color: "var(--r-con)", guion: "1 3", grosor: 1.8, k: "lyPerfecto" },
    Dirige: { color: "var(--lb)", guion: "8 3 2 3", grosor: 1.8, k: "lyDirige" },
  };
  /* En las vías solo se enseña lo que nombran la proposición, sus definiciones y las premisas marcadas:
     las demás relaciones el buscador las rellena al azar y despistarían. */
  function viasRelevantes() {
    const p = prop(), f = formalDe(p) || "";
    const txt = [f, ...S().marcadas.map((id) => VIA_PREMISA_FORMAL[id] || (S().mias.find((x) => x.id === id) || {}).texto || "")].join(" ");
    const todo = [txt, ...definicionesDe(txt)].join(" "), T = MotorMundos.TEORIAS.vias;
    return Object.keys(T.RELACIONES).filter((r) => !T.ocultas.includes(r) && new RegExp("(^|[^A-Za-z_])" + r + "(?![A-Za-z_])", "i").test(todo));
  }

  const ESTILOS_ANT = {
    Causa: { color: "var(--e-ant)", guion: "6 3", grosor: 2, k: "lyCausa" },
    CausaInt: { color: "var(--lb)", guion: "2 3", grosor: 2, k: "lyCausaInt" },
    Cond: { color: "var(--r-pol)", guion: "", grosor: 2.2, k: "lyCond" },
    Fund: { color: "var(--lb)", guion: "8 3 2 3", grosor: 2, k: "lyFund" },
    Parte: { color: "var(--r-con)", guion: "", grosor: 2, k: "lyParte" },
  };
  const ESTILOS_COS = {
    Causa: { color: "var(--r-pol)", guion: "", grosor: 2.4, k: "lyHace" },
    Copia: { color: "var(--lb)", guion: "6 3", grosor: 2, k: "lyCopia" },
  };
  /* Qué relaciones nombran la proposición, sus definiciones y las premisas marcadas (las demás despistarían). */
  function relevantes(teoria, premisaFormal) {
    const p = prop(), f = formalDe(p) || "";
    const txt = [f, ...S().marcadas.map((id) => premisaFormal[id] || (S().mias.find((x) => x.id === id) || {}).texto || "")].join(" ");
    const todo = [txt, ...definicionesDe(txt)].join(" "), T = MotorMundos.TEORIAS[teoria];
    return Object.keys(T.RELACIONES).filter((r) => !(T.ocultas || []).includes(r) && new RegExp("(^|[^A-Za-z_])" + r + "(?![A-Za-z_])", "i").test(todo));
  }

  /* Un desplegable de debate al pie del mundo, sin veredicto; «antes» (los antecedentes) es optativo. */
  function debate(D) {
    return `<details class="lb-saber spz-debate"><summary>${esc(D.titulo)}</summary>${D.parrafos.map((x) => `<p>${x}</p>`).join("")}
      ${D.antes ? `<h4>${esc(D.tAntes)}</h4><ul>${D.antes.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}</details>`;
  }
  /* Lo que cambia de un mundo a otro. */
  const MUNDOS = {
    tiempo: {
      textos: () => LABSPZ.tiempo, formal: TMP_FORMAL, def: TMP_DEF, isabelle: TMP_ISABELLE, teorema: { Q6: "Q6_finito" },
      alt: { Q1: { premisas: ["C_creador_dura_mas", "D_irreflexiva"], teorema: "Q1_por_duracion" } },   /* el camino de la duración, propuesto por el profesor */
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
    reloj: {
      textos: () => LABSPZ.reloj, formal: REL_FORMAL, def: REL_DEF, isabelle: REL_ISABELLE, teorema: {}, alt: {},
      premisaFormal: REL_PREMISA_FORMAL, premisaForma: REL_PREMISA_FORMA,
      estilos: { Crea: { color: "var(--r-pol)", guion: "", grosor: 2.6, k: "lyCrea" } }, maxA: 4,
      porDefecto: (id) => (REL_DEFECTO[id] || REL_ISABELLE[id] || REL_COMPATIBLES).slice(), posibles: REL_POSIBLE, inicio: { prop: "R1", marcadas: [] },
      nombreCosa: (i) => "ABCD"[i] || "c" + i,
      formulaDef: (d) => REL_FIJAS_FORMAL[d.id] || REL_DEF[d.id],
      clases: { increado: ["clIncreado", "doble"], creado: ["clCreado", "simple"] },
      leyendaFija: ["lyVida", "lyIncreadoR"],
      etiquetas: () => [],
      vidas(H) {
        const ini = {}, fin = {};
        for (const [x, i] of H.Empieza || []) ini[x] = i;
        for (const [x, i] of H.Acaba || []) fin[x] = i;
        return { ini, fin };
      },
      hechos(H, n) {
        const { ini, fin } = MUNDOS.reloj.vidas(H), cosas = Object.keys(ini).map(Number).sort();
        const par = (f, k) => cosas.flatMap((a) => cosas.filter((b) => a !== b && f(a, b)).map((b) => spzT(k, { a: n(a), b: n(b) })));
        return [
          ["hVidas", cosas.map((a) => spzT("fVida", { a: n(a), b: ini[a], c: fin[a] }))],
          ["hCreacion", (H.Crea || []).map(([a, b]) => (a === b ? spzT("fCreaSi", { a: n(a) }) : spzT("fCrea", { a: n(a), b: n(b) })))],
          ["hRelReloj", [...par((a, b) => ini[a] < ini[b], "fAntes"), ...par((a, b) => fin[a] > fin[b], "fSobrevive"), ...par((a, b) => fin[a] - ini[a] > fin[b] - ini[b], "fDura")]],
        ];
      },
      tam: (m) => spzT("hayMundoR", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }), k: m.k === 1 ? spzT("unInst") : spzT("nInst", { n: m.k }) }),
      sinTxt: (r) => spzT("sinMundoCompletoR", { c: r.maxC, a: r.maxA }),
      grupos: () => [["grupoR", 1]], pie: "notaPieR", lede: "ledeReloj", notaDefs: "notaDefsReloj",
      secciones: () => [["defsTiempoFijo", LABSPZ.reloj.fijas], ["defsReloj", LABSPZ.reloj.defs]], extraContramodelo: () => "",
      /* Dibujo: cada cosa es una barra sobre la línea del tiempo; las flechas, «creó a». */
      dibujar(m) {
        const { ini, fin } = MUNDOS.reloj.vidas(m.hechos), nombre = MUNDOS.reloj.nombreCosa;
        const Wd = 560, fila = 52, x0 = 70, x1 = 520, H = 40 + m.n * fila + 40, k = Math.max(m.k, 1);
        const xi = (i) => x0 + (k === 1 ? 0 : (i * (x1 - x0)) / (k - 1)), yf = (c) => 30 + c * fila;
        let s = `<svg class="spz-svg" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(spzT("dibujoAria"))}"><defs><marker id="spz-fl-CreaR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--r-pol)"/></marker></defs>`;
        for (let i = 0; i < k; i++) s += `<line x1="${xi(i)}" y1="20" x2="${xi(i)}" y2="${H - 30}" stroke="var(--line-soft)" stroke-dasharray="2 4"/><text class="spz-etq" x="${xi(i)}" y="${H - 14}" text-anchor="middle">${i}</text>`;
        s += `<text class="spz-etq" x="${(x0 + x1) / 2}" y="${H - 1}" text-anchor="middle">${esc(spzT("ejeInst"))}</text>`;
        for (let c2 = 0; c2 < m.n; c2++) {
          const a = xi(ini[c2] ?? 0), b = xi(fin[c2] ?? 0), y = yf(c2), doble = m.clase[c2] === "increado";
          s += `<text class="spz-nodo" x="22" y="${y + 19}" text-anchor="middle">${esc(nombre(c2))}</text>`;
          s += `<rect x="${a - 6}" y="${y + 4}" width="${Math.max(b - a, 0) + 12}" height="22" rx="8" fill="var(--lb-suave)" stroke="${doble ? "var(--lb)" : "var(--ink)"}" stroke-width="${doble ? 3 : 1.5}"/>`;
        }
        for (const [a, b] of m.hechos.Crea || []) {
          const x = xi(ini[b] ?? 0), ya = yf(a) + 15, yb = yf(b) + 15;
          s += a === b ? `<path d="M${x - 8},${ya - 12} C${x - 30},${ya - 34} ${x + 30},${ya - 34} ${x + 8},${ya - 12}" stroke="var(--r-pol)" stroke-width="2.4" fill="none" marker-end="url(#spz-fl-CreaR)"/>`
            : `<path d="M${x + 10},${ya} C${x + 34},${ya} ${x + 34},${yb} ${x + 8},${yb}" stroke="var(--r-pol)" stroke-width="2.4" fill="none" marker-end="url(#spz-fl-CreaR)"/>`;
        }
        return s + "</svg>";
      },
    },
    vias: {
      textos: () => LABSPZ.vias, formal: VIA_FORMAL, def: VIA_DEF, isabelle: VIA_ISABELLE, teorema: VIA_TEOREMA, alt: {},
      premisaFormal: VIA_PREMISA_FORMAL, premisaForma: VIA_PREMISA_FORMA,
      estilos: ESTILOS_VIAS, maxA: 4,
      porDefecto: (id) => (VIA_DEFECTO[id] || VIA_ISABELLE[id] || VIA_COMPATIBLES).slice(), posibles: {}, inicio: { prop: "W1", marcadas: ["V1_hay_movimiento"] },
      nombreCosa: (i) => "ABCD"[i] || "c" + i,
      formulaDef: (d) => VIA_DEF[d.id],
      clases: { primero: ["clPrimero", "doble"], otro: ["", "simple"] },
      leyendaFija: (m) => (m.clase.includes("primero") ? ["lyPrimero"] : []),
      /* Se quitan las relaciones que no vienen al caso; «primero» se recalcula con lo que queda. */
      filtrar(m) {
        const rel = viasRelevantes(), H = {};
        for (const r of rel) H[r] = m.hechos[r] || [];
        const primero = (r, i) => H[r] && H[r].some(([a]) => a === i) && !H[r].some(([, b]) => b === i);
        const clase = [...Array(m.n).keys()].map((i) => (primero("Mueve", i) || primero("Causa", i) ? "primero" : "otro"));
        return { ...m, hechos: H, clase };
      },
      etiquetas(m, i) {
        const H = m.hechos, de = (r) => (H[r] || []).filter(([c]) => c === i), ex = de("ExisteEn").map(([, t]) => t).sort();
        return [[de("TiendeAFin").length ? spzT("eFin") : "", de("Conoce").length ? spzT("eConoce") : ""].filter(Boolean).join(" · "),
          H.ExisteEn ? (ex.length ? spzT("eExiste", { x: ex.join(", ") }) : spzT("eNunca")) : ""];
      },
      hechos(H, n) {
        const r2 = (rel, si, no) => (H[rel] || []).map(([a, b]) => (a === b ? spzT(si, { a: n(a) }) : spzT(no, { a: n(a), b: n(b) })));
        const r1 = (rel, k) => (H[rel] || []).map(([a]) => spzT(k, { a: n(a) }));
        const ex = {};
        for (const [c, t] of H.ExisteEn || []) (ex[c] = ex[c] || []).push(t);
        return [["hMovimiento", r2("Mueve", "fMueveSi", "fMueve")], ["hCausas", r2("Causa", "fCausaSi", "fCausa")],
          ["hExistencia", Object.keys(ex).map(Number).sort().map((c) => spzT("fExisteV", { a: n(c), x: ex[c].sort().join(", ") }))],
          ["hPerfeccion", r2("MasPerfecto", "fPerfSi", "fPerf")],
          ["hFines", [...r1("TiendeAFin", "fFin"), ...r1("Conoce", "fConoce"), ...r2("Dirige", "fDirigeSi", "fDirige")]]];
      },
      tam: (m) => (m.hechos.ExisteEn ? spzT("hayMundoR", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }), k: m.k === 1 ? spzT("unInst") : spzT("nInst", { n: m.k }) })
        : spzT("hayMundoT", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) })),
      sinTxt: (r) => spzT("sinMundoCompletoR", { c: r.maxC, a: r.maxA }),
      grupos: () => [["grupoV1", 1], ["grupoV2", 2], ["grupoV3", 3], ["grupoV4", 4], ["grupoV5", 5], ["grupoVD", 6]],
      pie: "notaPieV", lede: "ledeVias", notaDefs: "notaDefsVias",
      secciones: () => [["defsVias", LABSPZ.vias.defs]], extraContramodelo: () => "",
      /* Enlaces a la exploración de Teoría y al plano de Genealogías, si esta web los tiene. */
      cabecera() {
        const ex = typeof THEORY !== "undefined" && THEORY["hf-cinco-vias"];
        const gen = typeof GENEALOGIAS_PLANOS !== "undefined" && GENEALOGIAS_PLANOS.some((x) => x.id === "dios");
        const l = [ex ? `<a href="#teoria/hf-cinco-vias">${esc(spzT("verExploVias"))} →</a>` : "", gen ? `<a href="#genealogias/plano/dios">${esc(spzT("verPlanoDios"))} →</a>` : ""].filter(Boolean);
        return l.length ? `<p class="lb-nota">${l.join(" · ")}</p>` : "";
      },
    },
    cosmos: {
      textos: () => LABSPZ.cosmos, formal: COS_FORMAL, def: COS_DEF, isabelle: COS_ISABELLE, teorema: COS_TEOREMA, alt: {},
      premisaFormal: COS_PREMISA_FORMAL, premisaForma: {},
      estilos: ESTILOS_COS, maxA: 3,
      porDefecto: (id) => (COS_DEFECTO[id] || COS_ISABELLE[id] || []).slice(), posibles: COS_POSIBLE, inicio: { prop: "C2", marcadas: ["P_no_ser"] },
      nombreCosa: (i) => "ABCD"[i] || "c" + i,
      formulaDef: (d) => COS_DEF[d.id],
      clases: { siempre: ["clSiempre", "doble"], vacio: ["clVacio", "doble"], otro: ["", "simple"] },
      leyendaFija: (m) => (m.clase.some((c) => c !== "otro") ? ["lyDobleC"] : []),
      filtrar(m) {
        const rel = relevantes("cosmos", COS_PREMISA_FORMAL), H = {};
        for (const r of rel) H[r] = m.hechos[r] || [];
        const es = (r, i) => (H[r] || []).some(([c2]) => c2 === i);
        const clase = [...Array(m.n).keys()].map((i) => (es("Siempre", i) ? "siempre" : es("Vacio", i) ? "vacio" : "otro"));
        return { ...m, hechos: H, clase };
      },
      etiquetas(m, i) {
        const H = m.hechos, es = (r) => (H[r] || []).some(([c2]) => c2 === i), inst = (r) => (H[r] || []).filter(([c2]) => c2 === i).map(([, t2]) => t2).sort();
        const ex = inst("ExisteEn"), cl = inst("Claro");
        return [[es("Deviene") ? spzT("eDeviene") : "", es("Visible") ? spzT("eVisible") : "", es("Bello") ? spzT("eBello") : "", es("Bueno") ? spzT("eBueno") : "",
          es("Generado") ? spzT("eGenerado") : "", es("Principio") ? spzT("ePrincipio") : ""].filter(Boolean).join(" · "),
          H.ExisteEn ? (ex.length ? spzT("eExiste", { x: ex.join(", ") }) : spzT("eNunca")) : "",
          H.Claro ? (cl.length ? spzT("eClaro", { x: cl.join(", ") }) : spzT("eNuncaClaro")) : ""];
      },
      hechos(H, n) {
        const r2 = (rel, si, no) => (H[rel] || []).map(([a, b]) => (a === b ? spzT(si, { a: n(a) }) : spzT(no, { a: n(a), b: n(b) })));
        const r1 = (rel, k) => (H[rel] || []).map(([a]) => spzT(k, { a: n(a) }));
        const por = (rel) => { const o = {}; for (const [c2, t2] of H[rel] || []) (o[c2] = o[c2] || []).push(t2); return o; };
        const ex = por("ExisteEn"), cl = por("Claro");
        return [["hExistencia", Object.keys(ex).map(Number).sort().map((c2) => spzT("fExisteV", { a: n(c2), x: ex[c2].sort().join(", ") }))],
          ["hClaro", Object.keys(cl).map(Number).sort().map((c2) => spzT("fClaroV", { a: n(c2), x: cl[c2].sort().join(", ") }))],
          ["hVacio", r1("Vacio", "fVacio")], ["hMeliso", [...r1("Generado", "fGenerado"), ...r1("Principio", "fPrincipio")]],
          ["hDemiurgo", [...r2("Causa", "fCausaSi", "fCausa"), ...r2("Copia", "fCopiaSi", "fCopia"), ...r1("Siempre", "fSiempre"), ...r1("Deviene", "fDeviene"),
            ...r1("Visible", "fVisible"), ...r1("Bello", "fBello"), ...r1("Bueno", "fBueno")]]];
      },
      tam: (m) => (m.hechos.ExisteEn || m.hechos.Claro ? spzT("hayMundoR", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }), k: m.k === 1 ? spzT("unInst") : spzT("nInst", { n: m.k }) })
        : spzT("hayMundoT", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) })),
      sinTxt: (r) => spzT("sinMundoCompletoR", { c: r.maxC, a: r.maxA }),
      grupos: () => [["grupoC1", 1], ["grupoC2", 2], ["grupoC3", 3], ["grupoC4", 4]],
      pie: "notaPieC", lede: "ledeCosmos", notaDefs: "notaDefsCosmos",
      debate: () => debate(LABSPZ.cosmos.debate),
      secciones: () => [["defsCosmos", LABSPZ.cosmos.defs]], extraContramodelo: () => "",
    },
    antinomias: {
      textos: () => LABSPZ.antinomias, formal: ANT_FORMAL, def: ANT_DEF, isabelle: ANT_ISABELLE, teorema: ANT_TEOREMA, alt: {},
      premisaFormal: ANT_PREMISA_FORMAL, premisaForma: ANT_PREMISA_FORMA,
      chequeaChoque: true, choques: ANT_CHOQUES,
      estilos: ESTILOS_ANT, maxA: 4,
      porDefecto: (id) => (ANT_DEFECTO[id] || ANT_ISABELLE[id] || []).slice(), posibles: ANT_POSIBLE, inicio: { prop: "K3T", marcadas: [] },
      nombreCosa: (i) => "ABCD"[i] || "c" + i,
      formulaDef: (d) => ANT_DEF[d.id],
      clases: { libre: ["clLibre", "doble"], incond: ["clIncond", "doble"], simple: ["clSimple", "doble"], otro: ["", "simple"] },
      leyendaFija: (m) => (m.clase.some((c) => c !== "otro") ? ["lyDobleA"] : []),
      notaSin: "notaSinA",
      filtrar(m) {
        const rel = relevantes("antinomias", ANT_PREMISA_FORMAL), H = {};
        for (const r of rel) H[r] = m.hechos[r] || [];
        const sin = (r, i) => !H[r].some(([, b]) => b === i);
        const clase = [...Array(m.n).keys()].map((i) => (H.Causa && sin("Causa", i) ? "libre" : H.Cond && sin("Cond", i) ? "incond" : H.Parte && sin("Parte", i) ? "simple" : "otro"));
        return { ...m, hechos: H, clase };
      },
      etiquetas(m, i) {
        const H = m.hechos, es = (r) => (H[r] || []).some(([c2]) => c2 === i);
        return [[es("Fen") ? spzT("eFen") : "", es("EnMundo") ? spzT("eEnMundo") : "", es("EnEspacio") ? spzT("eEspacio") : ""].filter(Boolean).join(" · ")];
      },
      hechos(H, n) {
        const r2 = (rel, si, no) => (H[rel] || []).map(([a, b]) => (a === b ? spzT(si, { a: n(a) }) : spzT(no, { a: n(a), b: n(b) })));
        const r1 = (rel, k) => (H[rel] || []).map(([a]) => spzT(k, { a: n(a) }));
        const inst = (H.Mundo || []).map(([t2]) => t2).sort((a, b) => a - b);
        return [["hTiempoMundo", H.Mundo ? [inst.length ? spzT("fMundoEn", { x: inst.join(", ") }) : spzT("fMundoNunca")] : []],
          ["hPartes", [...r2("Parte", "fParteSi", "fParte"), ...r1("EnEspacio", "fEspacio")]],
          ["hCausas", [...r2("Causa", "fCausaSi", "fCausa"), ...r2("CausaInt", "fCausaIntSi", "fCausaInt"), ...r1("Fen", "fFen")]],
          ["hCondiciones", [...r2("Cond", "fCondSi", "fCond"), ...r2("Fund", "fFundSi", "fFund"), ...r1("EnMundo", "fEnMundo")]]];
      },
      tam: (m) => (m.hechos.Mundo ? spzT("tamTiempo", { k: m.k === 1 ? spzT("unInst") : spzT("nInst", { n: m.k }) })
        : spzT("hayMundoT", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) })),
      sinTxt: (r) => spzT("sinMundoCompletoR", { c: r.maxC, a: r.maxA }),
      grupos: () => [["grupoA1", 1], ["grupoA2", 2], ["grupoA3", 3], ["grupoA4", 4]],
      pie: "notaPieA", lede: "ledeAnt", notaDefs: "notaDefsAnt",
      /* El debate sobre las premisas de Kant y sus antecedentes, sin veredicto. */
      debate: () => debate(LABSPZ.antinomias.debate),
      secciones: () => [["defsAnt", LABSPZ.antinomias.defs]], extraContramodelo: () => "",
      /* En la primera antinomia se dibuja la línea del tiempo; en las demás, el dibujo de siempre. */
      dibujar(m) {
        if (!m.hechos.Mundo) return null;
        const k = Math.max(m.k, 1), Wd = 560, H = 120, x0 = 60, x1 = 500, xi = (i) => x0 + (k === 1 ? (x1 - x0) / 2 : (i * (x1 - x0)) / (k - 1));
        const vivos = new Set((m.hechos.Mundo || []).map(([t2]) => t2));
        let s = `<svg class="spz-svg" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(spzT("dibujoAriaT"))}">`;
        s += `<line x1="${x0 - 30}" y1="50" x2="${x1 + 30}" y2="50" stroke="var(--line)" stroke-width="2"/>`;
        for (let i = 0; i < k; i++) {
          const v = vivos.has(i);
          s += `<circle cx="${xi(i)}" cy="50" r="14" fill="${v ? "var(--lb)" : "var(--surface)"}" stroke="var(--ink)" stroke-width="1.5"/><text class="spz-etq" x="${xi(i)}" y="86" text-anchor="middle">${i}</text>`;
        }
        s += `<text class="spz-etq" x="${(x0 + x1) / 2}" y="110" text-anchor="middle">${esc(spzT("ejeMundo"))}</text>`;
        return s + "</svg>";
      },
    },
    spinoza: {
      textos: () => LABSPZ, formal: SPZ_FORMAL, def: SPZ_DEF, isabelle: SPZ_ISABELLE, teorema: SPZ_TEOREMA, alt: SPZ_ALT, sobra: SPZ_SOBRA,
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
  /* (23-10) Modo guiado, por defecto: un reto cada vez, en tres pasos. La mesa de siempre queda como «Mesa libre».
     El modo elegido se recuerda en este navegador (si se puede). */
  const modoGuardado = () => { try { return localStorage.getItem("spz-modo"); } catch (e) { return null; } };
  const guardarModo = (m) => { try { localStorage.setItem("spz-modo", m); } catch (e) { /* sin almacenamiento */ } };
  const st = { mundo: "tiempo", turno: 0, porMundo: {}, modo: modoGuardado() === "libre" ? "libre" : "guiado", verTodas: false };
  for (const [id, M] of Object.entries(MUNDOS)) st.porMundo[id] = { prop: M.inicio.prop, marcadas: M.inicio.marcadas.slice(), html: "",
    propia: { texto: "", modo: "sigue" }, mias: [], nMias: 0 };
  const W = () => MUNDOS[st.mundo], S = () => st.porMundo[st.mundo];
  /* «✎ Escribe tu propia proposición»: se compila lo escrito y se trata como una proposición más (sin Isabelle). */
  const PROPIA = "propia_";
  function propia() {
    const P = S().propia, cmp = spzCompilar(P.texto, st.mundo);
    return { id: PROPIA, propia: true, nombre: spzT("propiaNombre"), posible: P.modo === "posible", comp: cmp,
      formal: cmp.ok ? cmp.normal : null, pregunta: cmp.ok ? spzLeer(cmp.normal) || esc(cmp.normal) : "" };
  }
  const prop = () => (S().prop === PROPIA ? propia() : W().textos().props.find((p) => p.id === S().prop));
  const formalDe = (p) => p.formal || W().formal[p.id];
  /* Premisas para el motor: las escritas por el alumno se compilan; las demás, por su nombre. */
  const motorPrem = (el) => el.map((id) => { const m = S().mias.find((x) => x.id === id); return m ? spzCompilar(m.texto, st.mundo).premisa : id; });
  const objDe = (p) => (p.comp ? p.comp.objetivo(p.posible) : p.id);
  const escA = (s) => esc(s).replace(/"/g, "&quot;");
  const SIMBOLOS = ["∀", "∃", "¬", "∧", "∨", "→", "↔", "=", "≠", "(", ")", ","];

  function definicionesDe(f) {
    const D = W().def, vistas = [], pend = [f];
    while (pend.length) {
      const g = pend.shift();
      for (const n of Object.keys(D)) if (!vistas.includes(n) && new RegExp("(^|[^A-Za-z_])" + n + "\\(").test(g)) { vistas.push(n); pend.push(D[n].split(":⟺")[1]); }
    }
    return vistas.map((n) => D[n]);
  }

  /* Lo que se enseña del mundo encontrado (en las vías, sin las relaciones que no vienen al caso). */
  const ver = (m) => (W().filtrar ? W().filtrar(m) : m);
  function dibujar(m) {
    if (W().dibujar) { const d = W().dibujar(m); if (d) return d; }   /* null: el dibujo de siempre */
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
      (typeof W().leyendaFija === "function" ? W().leyendaFija(m) : W().leyendaFija).map((k) => `<span>${esc(spzT(k))}</span>`).join("");
  }
  function hechos(m) {
    const g = W().hechos(m.hechos, W().nombreCosa);
    return '<div class="spz-hechos">' + g.filter(([, l]) => l.length).map(([t, l]) => `<div><h4>${esc(spzT(t))}</h4><ul>${l.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`).join("") + "</div>";
  }

  function veredicto() {
    SPZ_MUNDO_LECTURA = st.mundo;
    const p = prop(), M = W(), isa = M.isabelle[p.id], alt = M.alt[p.id], el = S().marcadas, mundo = st.mundo;
    const teorema = M.teorema[p.id] || p.id;
    if (p.propia && !p.comp.ok) { st.turno++; return pintarResultado(`<p class="lb-err">${esc(spzT(p.comp.error.k, p.comp.error.v))}</p>`); }
    if (p.posible) return posibilidad(p, M, el, mundo);
    /* (22-10) En las antinomias, lo que se enseña es el choque: si las premisas marcadas no caben juntas, se dice antes de dar nada por demostrado. */
    if (M.chequeaChoque && el.length > 1) {
      const op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA }, t0 = performance.now(), h = MotorMundos.hayMundo(motorPrem(el), op);
      if (!h.hay && h.completo) { st.turno++; return incompatibles(h, Math.round(performance.now() - t0), el, op); }
    }
    if (isa && contiene(el, isa)) return demostrado(teorema, p.prueba, isa, p.pasos, M.sobra && M.sobra[p.id]);
    if (alt && contiene(el, alt.premisas)) return demostrado(p.teoremaAlt || alt.teorema, p.pruebaAlt, alt.premisas, p.pasosAlt);
    const miTurno = ++st.turno;
    pintarResultado(`<p class="lb-nota spz-buscando">${esc(spzT("buscando"))}</p>`);
    setTimeout(() => {
      if (miTurno !== st.turno || mundo !== st.mundo) return;
      const t0 = performance.now(), op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA };
      const r = MotorMundos.buscarContramodelo(motorPrem(el), objDe(p), op);
      if (r.encontrado) return contramodelo(r.mundo, Math.round(performance.now() - t0));
      const h = MotorMundos.hayMundo(motorPrem(el), op), ms = Math.round(performance.now() - t0);
      if (!h.hay && h.completo) incompatibles(h, ms, el, op); else sinMundo(r, ms);
    }, 20);
  }
  /* Posibilidad: ¿hay un mundo con estas premisas en el que ocurra? */
  function posibilidad(p, M, el, mundo) {
    const P = M.posibles[p.id];
    if (P && P.impide && contiene(el, P.impide)) {
      st.turno++;
      return pintarResultado(`<div class="lb-aviso lb-mal"><span class="spz-sello">${esc(spzT("selloOk"))}</span><h3 class="spz-h">${esc(spzT("noPuede"))}</h3>
        ${p.notaNo ? `<p>${p.notaNo}</p>` : ""}<p class="lb-nota">${esc(spzT("imposibleIsa", { x: P.impide.join(", "), t: P.teoremaNo }))}</p></div>`);
    }
    /* (22-10) Un mundo infinito: la mesa no lo busca; lo construye Isabelle (antinomias). */
    if (P && P.infinito) {
      st.turno++;
      return pintarResultado(`<div class="lb-aviso lb-ok"><span class="spz-sello">${esc(spzT("selloPosible"))}</span><h3 class="spz-h">${esc(spzT("puedeOcurrir"))}</h3>
        <p>${esc(spzT("infinitoTxt", { t: P.teorema }))}</p>${p.nota ? `<p>${p.nota}</p>` : ""}</div>`);
    }
    const miTurno = ++st.turno;
    pintarResultado(`<p class="lb-nota spz-buscando">${esc(spzT("buscando"))}</p>`);
    setTimeout(() => {
      if (miTurno !== st.turno || mundo !== st.mundo) return;
      const t0 = performance.now(), op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA };
      const r = MotorMundos.buscarContramodelo(motorPrem(el), objDe(p), op), ms = Math.round(performance.now() - t0);
      if (r.encontrado) {
        const m = ver(r.mundo);
        return pintarResultado(`<div class="lb-aviso lb-ok"><span class="spz-sello">${esc(spzT("selloPosible"))}</span><h3 class="spz-h">${esc(spzT("puedeOcurrir"))}</h3>
          <p>${esc(spzT("posibleTxt", { n: m.n === 1 ? spzT("unaCosa") : spzT("nCosas", { n: m.n }) }))}</p>${p.nota ? `<p>${p.nota}</p>` : ""}
          ${P ? `<p class="lb-nota">${esc(spzT("posibleIsa", { t: P.teorema }))}</p>` : ""}</div>
          <div class="lb-scroll spz-lienzo">${dibujar(m)}</div><div class="spz-leyenda">${leyenda(m)}</div>${hechos(m)}
          <p class="lb-nota">${esc(spzT("encontrado", { ms }))}</p>`);
      }
      const h = MotorMundos.hayMundo(motorPrem(el), op);
      if (!h.hay && h.completo) return incompatibles(h, ms, el, op);
      pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloDuda"))}</span><h3 class="spz-h">${esc(spzT("noPuede"))}</h3>
        <p>${esc(spzT("imposibleTxt", { c: r.maxC }))}</p>${p.notaNo ? `<p>${p.notaNo}</p>` : ""}<p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p></div>`);
    }, 20);
  }
  function demostrado(teorema, prueba, usadas, pasos, sobra) {
    st.turno++;
    const sobran = S().marcadas.filter((x) => !usadas.includes(x)), R = LABSPZ.repaso, M = W();
    const etq = (k) => (k === "hip" ? `<span class="spz-paso-et">${esc(R.pHip)}</span>` : k === "fin" ? `<span class="spz-paso-et">${esc(R.pFin)}</span>`
      : `<span class="lb-mono spz-paso-pr">${esc(k)}</span>` + (M.premisaForma && M.premisaForma[k] ? ` <button type="button" class="spz-forma" aria-expanded="false" data-spz-rep="${M.premisaForma[k]}">${esc(formaNombre(M.premisaForma[k]))}</button>` : ""));
    const cuerpo = pasos ? `<p class="spz-sub">${esc(R.tPasos)}</p><ol class="spz-pasos">${pasos.map((s) => `<li><span>${sim(s.txt)}</span> ${etq(s.k)}</li>`).join("")}</ol>` : `<p>${prueba}</p>`;
    pintarResultado(`<div class="lb-aviso lb-ok"><span class="spz-sello">${esc(spzT("selloOk"))}</span><h3 class="spz-h">${esc(spzT("seSigue"))}</h3>${cuerpo}
      <p class="lb-nota">${esc(spzT("teorema", { t: teorema, x: usadas.length ? usadas.join(", ") : spzT("ningunaAnadida") }))}${sobran.length ? " " + esc(spzT("sobran")) : ""}</p>
      ${sobra ? `<p class="spz-sub">${esc(spzT("sobraIsa"))}</p><ul class="spz-sobra">${Object.entries(sobra).map(([x, t]) => `<li>${esc(spzT("sobraItem", { x, t }))}</li>`).join("")}</ul>` : ""}
      ${usadas.length > 1 ? botonSobra() : ""}</div><div id="spz-ejemplo"></div>`);
    ejemplo(usadas);
  }
  /* (23-10) Cuando se sigue, también un dibujo: un mundo de ejemplo que cumple las premisas (y por tanto la afirmación).
     Se pide que en él haya al menos un caso de cada relación que nombran la afirmación y las premisas, para que no salga
     un mundo vacío en que la afirmación se cumple sin decir nada; si eso no cabe, vale cualquier mundo de las premisas. */
  function ejemplo(usadas) {
    const mundo = st.mundo, turno = st.turno, M = W(), p = prop(), T = MotorMundos.TEORIAS[mundo];
    setTimeout(() => {
      if (turno !== st.turno || mundo !== st.mundo) return;
      const el = S().marcadas.length ? S().marcadas : usadas, pf = M.premisaFormal || {};
      const txt = [formalDe(p) || "", ...el.map((id) => pf[id] || "")].join(" "), todo = [txt, ...definicionesDe(txt)].join(" ");
      const rels = Object.keys(T.RELACIONES).filter((r) => !(T.ocultas || []).includes(r) && new RegExp("(^|[^A-Za-z_])" + r + "\\(").test(todo));
      const alguno = (r) => (L) => { const ex = (tipos, args) => (tipos.length ? (tipos[0] === "C" ? L.algunaCosa : L.algunAtr)((v) => ex(tipos.slice(1), [...args, v])) : L[r](...args)); return ex(T.RELACIONES[r], []); };
      const op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA }, prem = motorPrem(el);
      /* Y, si cabe, sin cosas relacionadas consigo mismas (un «A hace A» enseña poco): se prueba de más a menos exigente. */
      const binarias = rels.filter((r2) => { const tp = T.RELACIONES[r2]; return tp.length === 2 && tp[0] === "C" && tp[1] === "C"; });
      const irrefl = binarias.map((r2) => (L) => L.todaCosa((x) => MotorMundos.no(L[r2](x, x))));
      let r = { encontrado: false };
      for (const extra of [[...rels.map(alguno), ...irrefl], rels.map(alguno), []]) {
        r = MotorMundos.buscarContramodelo([...prem, ...extra], null, op);
        if (r.encontrado) break;
      }
      const caja = box && box.querySelector("#spz-ejemplo");
      if (!r.encontrado || !caja) return;
      const m = ver(r.mundo);
      caja.innerHTML = `<p class="spz-sub">${esc(spzT("tEjemplo"))}</p><p class="lb-nota">${esc(spzT("ejemploTxt"))}</p>
        <div class="lb-scroll spz-lienzo">${dibujar(m)}</div><div class="spz-leyenda">${leyenda(m)}</div>${hechos(m)}`;
      S().html = box.querySelector("#spz-resultado").innerHTML;
    }, 20);
  }
  /* Capas (22-10): ¿sobra alguna premisa? Se quita cada una y se busca un contramodelo en mundos pequeños. No demuestra nada. */
  const botonSobra = () => `<div class="lb-fila"><button type="button" class="btn ghost" data-spz-sobra="1">${esc(spzT("bSobra"))}</button></div><div id="spz-sobra-res" aria-live="polite"></div>`;
  const nombrePrem = (id) => { const m = S().mias.find((x) => x.id === id); return m ? m.texto : id; };
  function buscarSobrantes() {
    const caja = box.querySelector("#spz-sobra-res"); if (!caja) return;
    const p = prop(), M = W(), el = S().marcadas, mundo = st.mundo, turno = st.turno;
    caja.innerHTML = `<p class="lb-nota">${esc(spzT("buscando"))}</p>`;
    setTimeout(() => {
      if (turno !== st.turno || mundo !== st.mundo) return;
      const op = { teoria: mundo, maxCosas: 4, maxAtributos: M.maxA }, sin = [];
      let completo = true, maxC = 0;
      for (const x of el) {
        const r = MotorMundos.buscarContramodelo(motorPrem(el.filter((y) => y !== x)), objDe(p), op);
        if (!r.encontrado) { sin.push(nombrePrem(x)); completo = completo && r.completo; maxC = r.maxC; }
      }
      caja.innerHTML = sin.length ? `<p>${esc(spzT("sobraPosible", { x: sin.join(", "), c: maxC || 4 }))}</p><p class="lb-nota">${esc(spzT(completo ? "sobraNoDemuestra" : "sinMundoCortado"))}</p>`
        : `<p>${esc(spzT("sobraNinguna"))}</p>`;
    }, 20);
  }
  function contramodelo(m0, ms) {
    const m = ver(m0), p = prop(), isa = W().isabelle[p.id] || [];
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
    let f = formalDe(prop());
    if (!f) return "";
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
    const isa = W().isabelle[prop().id], varias = S().marcadas.length > 1;
    pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloDuda"))}</span><h3 class="spz-h">${esc(spzT("sinMundo"))}</h3>
      <p>${esc(r.completo ? (W().sinTxt ? W().sinTxt(r) : W().maxA === 1 ? spzT("sinMundoCompletoT", { c: r.maxC }) : spzT("sinMundoCompleto", { c: r.maxC, a: r.maxA })) : spzT("sinMundoCortado"))} ${esc(spzT("noDemuestra"))}</p>
      ${isa ? `<p class="lb-nota">${esc(isa.length ? spzT("necesitaCon", { x: isa.join(", ") }) : spzT("necesitaSin"))}</p>` : ""}
      ${W().notaSin ? `<p class="lb-nota">${esc(spzT(W().notaSin))}</p>` : ""}
      <p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p>${varias ? botonSobra() : ""}</div>`);
  }
  /* Capas (22-10): de las premisas que no caben juntas, el grupo mínimo que choca (se quitan una a una mientras siga el choque). */
  const choqueIsa = (el) => { const ch = (W().choques || []).find((c2) => contiene(el, c2.p)); return ch ? ch.t : null; };
  function incompatibles(h, ms, el, op) {
    let nucleo = el.slice();
    for (const x of el) {
      const resto = nucleo.filter((y) => y !== x), h2 = MotorMundos.hayMundo(motorPrem(resto), op);
      if (!h2.hay && h2.completo) nucleo = resto;
    }
    pintarResultado(`<div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("selloNada"))}</span><h3 class="spz-h">${esc(spzT("incompatibles"))}</h3>
      <p>${esc(spzT("incompatiblesTxt", { c: h.maxC }))}</p>
      ${nucleo.length && nucleo.length < el.length ? `<p>${esc(spzT("chocan", { x: nucleo.map(nombrePrem).join(", ") }))}</p>` : nucleo.length ? `<p>${esc(spzT("chocanTodas"))}</p>` : `<p>${esc(spzT("chocanFijas"))}</p>`}
      ${choqueIsa(el) ? `<p class="lb-nota">${esc(spzT("choqueIsa", { t: choqueIsa(el) }))}</p>` : W().notaSin ? `<p class="lb-nota">${esc(spzT(W().notaSin))}</p>` : ""}
      <p class="lb-nota">${esc(spzT("busqueda", { ms }))}</p></div>`);
  }
  function pintarResultado(html) {
    S().html = html; const r = box && box.querySelector("#spz-resultado"); if (r) r.innerHTML = html;
    if (st.modo === "guiado") pintarSugerencias(html);
  }
  /* ---------- Modo guiado ---------- */
  const ORDEN = [["tiempo", "mundoTiempo", "gQTiempo"], ["reloj", "mundoReloj", "gQReloj"], ["spinoza", "mundoSpinoza", "gQSpinoza"],
    ["vias", "mundoVias", "gQVias"], ["antinomias", "mundoAnt", "gQAnt"], ["cosmos", "mundoCosmos", "gQCosmos"]];
  /* Los retos, en el orden de los grupos del desplegable. */
  const retos = () => { const X = W().textos(); return W().grupos().flatMap(([, parte]) => X.props.filter((x) => (x.parte || 1) === parte)); };
  /* Un «?» que explica una palabra al pasar el ratón o al tocarlo; no desplaza nada. */
  const glo = (k) => `<span class="spz-glo" tabindex="0" role="note" aria-label="${escA(spzT(k))}" data-def="${escA(spzT(k))}">?</span>`;
  const corto = (txt) => { const s = String(txt).replace(/<[^>]+>/g, "").split(/[:(]|\. /)[0].trim(); return s.length > 70 ? s.slice(0, 68) + "…" : s; };
  const quePrem = (id) => { const x = W().textos().premisas.find((y) => y.id === id); return x ? corto(x.que) : nombrePrem(id); };
  /* Qué premisas enseñar en el paso 2: las del grupo del reto, las de la prueba y las marcadas; las demás, plegadas. */
  function premisasDelReto(p) {
    const X = W().textos(), g = X.grupos && X.grupos[(p.parte || 1) - 1];
    const base = new Set([...(W().isabelle[p.id] || []), ...W().porDefecto(p.id), ...S().marcadas]);
    if (g) X.premisas.filter((x) => x.grupo === g.id).forEach((x) => base.add(x.id));
    let vis = X.premisas.filter((x) => base.has(x.id));
    if (vis.length < 2) vis = X.premisas.slice();
    return { vis, resto: X.premisas.filter((x) => !vis.includes(x)) };
  }
  function tipoResultado(html) {
    const h = (k) => html.includes(esc(spzT(k)));
    return h("incompatibles") ? "choque" : h("seSigue") && !h("noSeSigue") ? "ok" : h("noSeSigue") ? "mal" : h("puedeOcurrir") ? "pos" : h("noPuede") ? "nopuede" : "";
  }
  function pintarSugerencias(html) {
    const c = box && box.querySelector("#spz-sug"); if (!c) return;
    if (!html || html.includes("spz-buscando")) { c.innerHTML = ""; return; }
    const p = prop(), tipo = tipoResultado(html), isa = W().isabelle[p.id] || [], el = S().marcadas, P = W().posibles[p.id];
    const expl = { ok: "gExplOk", mal: "gExplMal", pos: "gExplPos", nopuede: "gExplNoPuede", choque: "gExplChoque" }[tipo];
    const bot = (accion, id, k) => `<button type="button" class="btn ghost spz-sug-b" data-spz-${accion}="${escA(id)}">${esc(spzT(k, { x: quePrem(id) }))}</button>`;
    let b = [];
    if (tipo === "ok") b = el.filter((x) => isa.includes(x)).map((x) => bot("quita", x, "gQuita"));
    if (tipo === "mal") b = isa.filter((x) => !el.includes(x)).map((x) => bot("pon", x, "gPon"));
    if (tipo === "pos" && P && P.impide) b = P.impide.filter((x) => !el.includes(x)).map((x) => bot("pon", x, "gPonPos"));
    if (tipo === "choque") b = el.map((x) => bot("quita", x, "gQuita"));
    const lista = retos(), i = lista.findIndex((x) => x.id === p.id);
    c.innerHTML = `${expl ? `<p class="spz-expl">${esc(spzT(expl))} ${tipo === "mal" ? glo("gloContramodelo") : tipo === "ok" ? glo("gloIsabelle") : ""}</p>` : ""}
      ${b.length ? `<p class="spz-sub">${esc(spzT("gProbarAhora"))}</p><div class="spz-sug-lista">${b.join("")}</div>` : ""}
      ${i >= 0 && i < lista.length - 1 ? `<div class="lb-fila"><button type="button" class="btn" data-spz-mover="1">${esc(spzT("gSiguiente"))}</button></div>` : ""}`;
  }
  const barraModo = () => `<div class="lb-fila spz-modo" role="group" aria-label="${escA(spzT("modoEt"))}">${[["guiado", "modoGuiado"], ["libre", "modoLibre"]]
    .map(([m, k]) => `<button type="button" class="fbtn" data-spz-modo="${m}" aria-pressed="${st.modo === m}">${esc(spzT(k))}</button>`).join("")}</div>`;
  function pintarGuiado() {
    SPZ_MUNDO_LECTURA = st.mundo;
    /* La primera vez que se entra en un mundo en modo guiado, se empieza por el reto 1. */
    if (!S().guiado) { S().guiado = true; S().prop = retos()[0].id; S().marcadas = W().porDefecto(S().prop); S().html = ""; }
    const M = W(), X = M.textos(), p = prop().propia ? retos()[0] : prop();
    if (S().prop !== p.id) { S().prop = p.id; S().marcadas = M.porDefecto(p.id); }
    const lista = retos(), i = lista.findIndex((x) => x.id === p.id), defs = definicionesDe(formalDe(p) || "");
    const { vis, resto } = premisasDelReto(p), el = S().marcadas;
    const tarjeta = (x) => `<label class="spz-pcard${el.includes(x.id) ? " on" : ""}" for="spz-pr-${x.id}"><input type="checkbox" id="spz-pr-${x.id}" value="${x.id}"${el.includes(x.id) ? " checked" : ""}>
      <span class="spz-pcard-t">${esc(x.que)}</span><span class="lb-mono spz-pcard-id">${x.id}</span></label>`;
    const mcard = ([id, k, q]) => `<button type="button" class="spz-mcard" data-spz-mundo="${id}" aria-pressed="${st.mundo === id}">
      ${id === "tiempo" ? `<span class="spz-mcard-e">${esc(spzT("gEmpieza"))}</span>` : ""}<span class="spz-mcard-t">${esc(spzT(k))}</span>
      <span class="spz-mcard-q">${esc(spzT(q))}</span><span class="spz-mcard-n">${esc(spzT("gNRetos", { n: MUNDOS[id].textos().props.length }))}</span></button>`;
    box.innerHTML = `${barraModo()}
      <div class="spz-como"><h3 class="spz-h">${esc(spzT("gComoT"))}</h3><ol><li>${esc(spzT("gComo1"))}</li><li>${esc(spzT("gComo2"))} ${glo("gloPremisa")}</li><li>${esc(spzT("gComo3"))} ${glo("gloMundo")}</li></ol><p class="lb-nota">${esc(spzT("gNombre"))}</p></div>
      <p class="spz-sub">${esc(spzT("gElige"))}</p><div class="spz-mcards" role="group" aria-label="${escA(spzT("mundo"))}">${ORDEN.map(mcard).join("")}</div>
      <details class="lb-saber spz-sobre"><summary>${esc(spzT("gSobre"))}</summary><p>${esc(spzT(M.lede))}</p>${M.cabecera ? M.cabecera() : ""}
        <p class="lb-nota">${spzT(M.notaDefs)}</p>${M.secciones().map(([k, l]) => `<p class="spz-sub">${esc(spzT(k))}</p><ul class="spz-defs">${l.map(defFila).join("")}</ul>`).join("")}
        <p class="lb-nota">${spzT("avisoDesarrollo")}</p></details>
      <section class="spz-reto" aria-labelledby="spz-reto-t">
        <div class="spz-reto-cab"><button type="button" class="btn ghost" data-spz-mover="-1" aria-label="${escA(spzT("gAnterior"))}"${i <= 0 ? " disabled" : ""}>←</button>
          <span class="spz-reto-n">${esc(spzT("gReto", { k: i + 1, n: lista.length }))}</span>
          <button type="button" class="btn ghost" data-spz-mover="1" aria-label="${escA(spzT("gSiguienteR"))}"${i >= lista.length - 1 ? " disabled" : ""}>→</button>
          <label class="spz-reto-sel"><select id="spz-prop" aria-label="${escA(spzT("gSaltar"))}">${M.grupos().map(([k, parte]) => `<optgroup label="${esc(spzT(k))}">${X.props.filter((x) => (x.parte || 1) === parte).map((x) => `<option value="${x.id}"${x.id === p.id ? " selected" : ""}>${esc(x.nombre)}</option>`).join("")}</optgroup>`).join("")}</select></label></div>
        <h3 class="spz-reto-t" id="spz-reto-t">${esc(p.nombre)}</h3>${p.cita ? `<blockquote class="spz-cita">«${esc(p.cita)}»</blockquote>` : ""}
        <div class="spz-paso"><span class="spz-num" aria-hidden="true">1</span><div><h4>${esc(spzT("g1T"))}</h4><p class="spz-afirma">${p.pregunta}</p>
          <p class="lb-nota">${esc(spzT(p.posible ? "g1Puede" : "g1Sigue"))}</p>
          <details class="spz-verlog"><summary>${esc(spzT("gVerLogica"))}</summary><div class="spz-formal">${defs.length ? `<span class="spz-sub">${esc(spzT("defsUsa"))}</span><div class="spz-lista">${defs.map((d) => conLectura(d)).join("")}</div>` : ""}
            <span class="spz-sub">${esc(spzT("enLogica"))}</span>${conLectura(formalDe(p))}</div></details></div></div>
        <div class="spz-paso"><span class="spz-num" aria-hidden="true">2</span><div><h4>${esc(spzT("g2T"))} ${glo("gloPremisa")}</h4><p class="lb-nota">${esc(spzT("g2Nota"))}</p>
          <div class="spz-pcards">${vis.map(tarjeta).join("")}</div>
          ${resto.length ? `<details class="spz-resto"${st.verTodas ? " open" : ""}><summary>${esc(spzT("gVerTodas", { n: resto.length }))}</summary><div class="spz-pcards">${resto.map(tarjeta).join("")}</div></details>` : ""}
          <div class="lb-fila">${(M.isabelle[p.id] || []).length ? `<button type="button" class="btn ghost" data-spz="isabelle">${esc(spzT("gMarcarPrueba"))}</button>` : ""}<button type="button" class="btn ghost" data-spz="ninguna">${esc(spzT("gNinguna"))}</button></div></div></div>
        <div class="spz-paso"><span class="spz-num" aria-hidden="true">3</span><div><h4>${esc(spzT("g3T"))}</h4>
          <button type="button" class="btn spz-grande" data-spz="probar">${esc(spzT(p.posible ? "bPuede" : "bProbar"))}</button></div></div>
        <div id="spz-sug" aria-live="polite"></div>
        <div id="spz-resultado" aria-live="polite">${S().html || `<p class="lb-nota spz-pista">${esc(spzT("gPista"))}</p>`}</div>
      </section>
      ${M.debate ? M.debate() : ""}
      <p class="lb-nota">${esc(spzT(M.pie))}</p>`;
    if (S().html) pintarSugerencias(S().html);
    const irA = (id) => { S().prop = id; S().marcadas = W().porDefecto(id); S().html = ""; st.turno++; pintar(); box.querySelector(".spz-reto").scrollIntoView({ block: "start" }); };
    box.querySelectorAll("[data-spz-modo]").forEach((b) => b.addEventListener("click", () => cambiarModo(b.dataset.spzModo)));
    box.querySelectorAll("[data-spz-mundo]").forEach((b) => b.addEventListener("click", () => {
      if (st.mundo === b.dataset.spzMundo) return;
      st.mundo = b.dataset.spzMundo; st.turno++; S().html = ""; pintar();
    }));
    box.onclick = (e) => {
      const mv = e.target.closest("[data-spz-mover]");
      if (mv) { const j = i + Number(mv.dataset.spzMover); if (j >= 0 && j < lista.length) irA(lista[j].id); return; }
      const q = e.target.closest("[data-spz-quita]"), pn = e.target.closest("[data-spz-pon]");
      if (q || pn) {
        const id = (q || pn).dataset[q ? "spzQuita" : "spzPon"];
        S().marcadas = q ? S().marcadas.filter((x) => x !== id) : [...new Set([...S().marcadas, id])];
        pintar(); veredicto(); return;
      }
      if (e.target.closest("[data-spz-sobra]")) return buscarSobrantes();
    };
    box.querySelector("#spz-prop").addEventListener("change", (e) => irA(e.target.value));
    const resto2 = box.querySelector(".spz-resto"); if (resto2) resto2.addEventListener("toggle", () => { st.verTodas = resto2.open; });
    box.querySelectorAll(".spz-pcard input").forEach((inp) => inp.addEventListener("change", () => {
      inp.closest(".spz-pcard").classList.toggle("on", inp.checked);
      S().marcadas = [...box.querySelectorAll(".spz-pcard input:checked")].map((x) => x.value);
    }));
    box.querySelectorAll("[data-spz]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.spz;
      if (a === "isabelle") S().marcadas = (W().isabelle[S().prop] || []).slice();
      if (a === "ninguna") S().marcadas = [];
      if (a !== "probar") { pintar(); return; }
      veredicto();
    }));
  }
  function cambiarModo(m) {
    if (st.modo === m) return;
    st.modo = m; guardarModo(m); st.turno++;
    if (m === "guiado") S().html = "";
    pintar(); if (m === "libre" && !S().html) veredicto();
  }

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
      <h4>${esc(R.tMapa)}</h4><p class="lb-nota">${esc(R.introMapa)}</p>
      <ul class="spz-mapa">${R.mapa.map((f, i) => `<li class="${f.sigue ? "lb-ok" : "lb-mal"}"><span class="spz-sello">${esc(spzT(f.sigue ? "selloOk" : "selloMal"))}</span>
        <span>${esc(f.si)} <span class="lb-sim">${f.sigue ? "⇒" : "⇏"}</span> ${esc(f.da)}.${f.ej ? ` <span class="lb-nota">${esc(f.ej)}</span>` : ""}<span class="lb-mono spz-lema">${SPZ_MAPA_LEMAS[i]}</span></span></li>`).join("")}</ul>
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

  function vistaPropia() {
    const P = S().propia;
    if (!P.texto.trim()) return "";
    const cmp = spzCompilar(P.texto, st.mundo);
    if (!cmp.ok) return `<p class="lb-err">${esc(spzT(cmp.error.k, cmp.error.v))}</p>`;
    return `<span class="spz-sub">${esc(spzT("hasEscrito"))}</span>${conLectura(cmp.normal)}` +
      (cmp.libres.length ? `<p class="lb-nota">${esc(spzT("libresTodo", { x: cmp.libres.join(", ") }))}</p>` : "");
  }
  const tecla = (s, destino, etiqueta) => `<button type="button" class="fbtn spz-tecla" data-ins="${escA(s)}"${destino ? ` data-dest="${destino}"` : ""}>${esc(etiqueta || s)}</button>`;
  function editor() {
    const P = S().propia, voc = Object.keys(spzVocabulario(st.mundo));
    return `<div class="spz-editor">
      <label class="lb-et-campo" for="spz-escribe">${esc(spzT("tEscribe"))}<input id="spz-escribe" class="lb-mono spz-escribe" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" dir="ltr" value="${escA(P.texto)}" placeholder="${escA(spzT("phEscribe"))}"></label>
      <div class="lb-fila spz-teclado" role="group" aria-label="${escA(spzT("tTeclado"))}">${SIMBOLOS.map((s) => tecla(s)).join("")}</div>
      <div class="lb-fila spz-teclado" role="group" aria-label="${escA(spzT("tVocabulario"))}">${voc.map((n) => tecla(n + "(", null, n)).join("")}${st.mundo === "spinoza" ? tecla(spzT("Dios")) : ""}</div>
      <p class="lb-nota">${esc(spzT("atajos", { t: spzT("palTodo"), h: spzT("palHay"), n: spzT("palNo") }))}</p>
      <div id="spz-vista-propia" aria-live="polite">${vistaPropia()}</div>
      <div class="lb-fila" role="radiogroup">${[["sigue", "modoSigue"], ["posible", "modoPosible"]].map(([v, k]) => `<label class="spz-modo"><input type="radio" name="spz-modo" value="${v}"${P.modo === v ? " checked" : ""}> ${esc(spzT(k))}</label>`).join("")}</div>
      <p class="lb-nota">${esc(spzT("sinIsabelle"))}</p></div>`;
  }
  function misPremisas(el) {
    const mias = S().mias.map((m) => {
      const cmp = spzCompilar(m.texto, st.mundo), f = cmp.ok ? cmp.normalCerrada : m.texto, l = cmp.ok ? spzLeer(f) : "";
      return `<label class="spz-premisa" for="spz-pr-${m.id}"><input type="checkbox" id="spz-pr-${m.id}" value="${m.id}"${el.includes(m.id) ? " checked" : ""}>
        <span class="lb-res spz-pf">${sim(f)}</span><span class="spz-que">${l || ""}</span>
        <span class="spz-pf"><button type="button" class="spz-forma" data-quitar="${m.id}">${esc(spzT("bQuitar"))}</button></span></label>`;
    }).join("");
    return `<fieldset class="spz-grupo spz-mias"><legend>${esc(spzT("tTusPremisas"))}</legend>${mias || `<p class="lb-nota">${esc(spzT("noHayPropias"))}</p>`}
      <div class="lb-fila"><input id="spz-nueva" class="lb-mono lb-crece" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" dir="ltr" placeholder="${escA(spzT("phPremisa"))}"><button type="button" class="btn ghost" data-spz-anadir="1">${esc(spzT("bAnadir"))}</button></div>
      <div class="lb-fila spz-teclado">${SIMBOLOS.map((s) => tecla(s, "nueva")).join("")}</div>
      <p id="spz-nueva-err" class="lb-err" aria-live="polite"></p></fieldset>`;
  }

  function defFila(d) {
    const f = W().formulaDef(d), l = /:⟺/.test(f) ? spzLeer(f) : null;
    return `<li><span class="spz-origen">${esc(d.origen)}</span><span class="spz-texto">${d.texto}</span><span class="lb-res">${sim(f)}</span>${l ? `<span class="spz-lee"><span class="spz-lee-et">${esc(LABSPZ.repaso.tLectura)}:</span> ${l}</span>` : ""}</li>`;
  }

  function pintar() {
    box.onclick = null;
    if (st.modo === "guiado") return pintarGuiado();
    SPZ_MUNDO_LECTURA = st.mundo;
    const M = W(), X = M.textos(), p = prop(), isa = M.isabelle[p.id], defs = definicionesDe(formalDe(p) || ""), el = S().marcadas;
    const opciones = (parte) => X.props.filter((x) => (x.parte || 1) === parte).map((x) => `<option value="${x.id}"${x.id === p.id ? " selected" : ""}>${esc(x.nombre)}</option>`).join("");
    const premisas = X.grupos.map((g) => `<fieldset class="spz-grupo"><legend>${esc(g.nom)}</legend>` +
      X.premisas.filter((x) => x.grupo === g.id).map((x) => `<label class="spz-premisa${isa && isa.includes(x.id) ? " spz-isa" : ""}" for="spz-pr-${x.id}">
        <input type="checkbox" id="spz-pr-${x.id}" value="${x.id}"${el.includes(x.id) ? " checked" : ""}>
        <span class="lb-mono spz-nom">${x.id}${isa && isa.includes(x.id) ? ` <span class="spz-usada">· ${esc(spzT("usoIsabelle"))}</span>` : ""}</span><span class="spz-que">${esc(x.que)}</span>${M.premisaFormal && M.premisaFormal[x.id] ? `<span class="spz-pf">${sim(M.premisaFormal[x.id])}${M.premisaForma[x.id] ? ` <button type="button" class="spz-forma" aria-expanded="false" data-spz-rep="${M.premisaForma[x.id]}">${esc(formaNombre(M.premisaForma[x.id]))}</button>` : ""}</span>` : ""}</label>`).join("") + "</fieldset>").join("");
    const botonMundo = (id, k) => `<button type="button" class="fbtn" data-spz-mundo="${id}" aria-pressed="${st.mundo === id}">${esc(spzT(k))}</button>`;
    const abierta = box.querySelector(".spz-guia") && box.querySelector(".spz-guia").open;
    const repAbierto = box.querySelector(".spz-repaso") && box.querySelector(".spz-repaso").open;
    const isaAbierto = box.querySelector(".spz-isabelle") && box.querySelector(".spz-isabelle").open;
    box.innerHTML = `${barraModo()}<div class="lb-fila spz-mundos" role="group" aria-label="${esc(spzT("mundo"))}"><span class="lb-et">${esc(spzT("mundo"))}</span>${botonMundo("tiempo", "mundoTiempo")}${botonMundo("reloj", "mundoReloj")}${botonMundo("spinoza", "mundoSpinoza")}${botonMundo("vias", "mundoVias")}${botonMundo("antinomias", "mundoAnt")}${botonMundo("cosmos", "mundoCosmos")}</div>
      <p class="lg-intro">${esc(spzT(M.lede))}</p>${M.cabecera ? M.cabecera() : ""}
      <div class="lb-aviso lb-warn"><span class="spz-sello">${esc(spzT("enDesarrollo"))}</span> ${spzT("avisoDesarrollo")}</div>
      ${guia()}
      ${repaso()}
      ${sobreIsabelle()}
      <section class="lb-mesa"><h3>${esc(spzT("tDefiniciones"))}</h3><p class="lb-nota">${spzT(M.notaDefs)}</p>
        ${M.secciones().map(([k, lista]) => `<p class="spz-sub">${esc(spzT(k))}</p><ul class="spz-defs">${lista.map(defFila).join("")}</ul>`).join("")}</section>
      <div class="lb-dos">
        <section class="lb-mesa"><h3>${esc(spzT("tPregunta"))}</h3>
          <label class="lb-et-campo" for="spz-prop">${esc(spzT("proposicion"))}<select id="spz-prop">${M.grupos().map(([k, parte]) => `<optgroup label="${esc(spzT(k))}">${opciones(parte)}</optgroup>`).join("")}<option value="${PROPIA}"${p.propia ? " selected" : ""}>${esc(spzT("propiaNombre"))}</option></select></label>
          ${p.propia ? editor() : `${p.cita ? `<blockquote class="spz-cita">«${esc(p.cita)}»</blockquote>` : ""}
          <div class="spz-formal">${defs.length ? `<span class="spz-sub">${esc(spzT("defsUsa"))}</span><div class="spz-lista">${defs.map((d) => conLectura(d)).join("")}</div>` : ""}
            <span class="spz-sub">${esc(spzT("enLogica"))}</span>${conLectura(M.formal[p.id])}</div>
          <p class="lb-pregunta">${spzT(p.posible ? "seCompruebaPos" : "seComprueba", { x: p.pregunta })}</p>
          <p class="lb-nota">${esc(p.posible && M.posibles[p.id] ? spzT("posibleIsa", { t: M.posibles[p.id].teorema }) : isa ? (isa.length ? spzT("necesitaCon", { x: isa.join(", ") }) : spzT("necesitaSin")) : spzT("necesitaNo"))}</p>`}
          <div class="lb-fila">${p.propia ? "" : `<button type="button" class="btn ghost" data-spz="isabelle">${esc(spzT("bIsabelle"))}</button>`}<button type="button" class="btn ghost" data-spz="todas">${esc(spzT("bTodas"))}</button><button type="button" class="btn ghost" data-spz="ninguna">${esc(spzT("bNinguna"))}</button></div>
          <div class="spz-premisas">${premisas}${misPremisas(el)}</div>
          <div class="lb-fila"><button type="button" class="btn" data-spz="probar">${esc(spzT("bProbar"))}</button></div>
        </section>
        <section class="lb-mesa" aria-live="polite"><h3>${esc(spzT("tResultado"))}</h3><div id="spz-resultado">${S().html}</div></section>
      </div>
      ${M.debate ? M.debate() : ""}
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
      if (e.target.closest("[data-spz-sobra]")) return buscarSobrantes();
      const b = e.target.closest("[data-spz-rep]"); if (!b) return;
      const li = b.closest("li"), sig = li.lastElementChild;
      if (sig && sig.classList.contains("spz-rep-suelta")) { sig.remove(); b.setAttribute("aria-expanded", "false"); return; }
      const bl = LABSPZ.repaso.bloques.find((x) => x.id === b.dataset.spzRep);
      if (bl) { li.insertAdjacentHTML("beforeend", bloqueRepaso(bl, true)); b.setAttribute("aria-expanded", "true"); }
    });
    /* Escribir: proposición propia, teclado de símbolos, modo y premisas propias */
    const ed = box.querySelector("#spz-escribe"), nueva = box.querySelector("#spz-nueva");
    if (ed) {
      ed.addEventListener("input", () => { S().propia.texto = ed.value; box.querySelector("#spz-vista-propia").innerHTML = vistaPropia(); });
      ed.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); veredicto(); } });
    }
    box.querySelectorAll("[data-ins]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const campo = b.dataset.dest ? nueva : ed; if (!campo) return;
      const v = campo.value, a = campo.selectionStart == null ? v.length : campo.selectionStart, z = campo.selectionEnd == null ? a : campo.selectionEnd;
      campo.value = v.slice(0, a) + b.dataset.ins + v.slice(z);
      campo.focus(); campo.setSelectionRange(a + b.dataset.ins.length, a + b.dataset.ins.length);
      campo.dispatchEvent(new Event("input"));
    }));
    box.querySelectorAll('input[name="spz-modo"]').forEach((r) => r.addEventListener("change", () => { S().propia.modo = r.value; }));
    const anadir = () => {
      const cmp = spzCompilar(nueva.value, st.mundo), er = box.querySelector("#spz-nueva-err");
      if (!cmp.ok) { er.textContent = spzT(cmp.error.k, cmp.error.v); return; }
      const id = "mia" + ++S().nMias;
      S().mias.push({ id, texto: nueva.value }); S().marcadas.push(id);
      pintar(); const n2 = box.querySelector("#spz-nueva"); if (n2) n2.focus();
    };
    box.querySelector("[data-spz-anadir]").addEventListener("click", anadir);
    nueva.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); anadir(); } });
    nueva.addEventListener("input", () => { box.querySelector("#spz-nueva-err").textContent = ""; });
    box.querySelectorAll("[data-quitar]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = b.dataset.quitar;
      S().mias = S().mias.filter((x) => x.id !== id); S().marcadas = S().marcadas.filter((x) => x !== id);
      pintar();
    }));
    box.querySelectorAll("[data-spz-ir]").forEach((b) => b.addEventListener("click", () => { location.hash = "#logica/" + b.dataset.spzIr; }));
    box.querySelectorAll("[data-spz-modo]").forEach((b) => b.addEventListener("click", () => cambiarModo(b.dataset.spzModo)));
    box.querySelectorAll("[data-spz-mundo]").forEach((b) => b.addEventListener("click", () => {
      if (st.mundo === b.dataset.spzMundo) return;
      st.mundo = b.dataset.spzMundo; st.turno++; pintar(); if (!S().html) veredicto();
    }));
    box.querySelector("#spz-prop").addEventListener("change", (e) => { S().prop = e.target.value; S().marcadas = W().porDefecto(S().prop); pintar(); veredicto(); });
    box.querySelectorAll(".spz-premisa input").forEach((i) => i.addEventListener("change", () => { S().marcadas = [...box.querySelectorAll(".spz-premisa input:checked")].map((x) => x.value); }));
    box.querySelectorAll("[data-spz]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.spz;
      if (a === "isabelle") S().marcadas = (W().isabelle[S().prop] || []).slice();
      if (a === "todas") S().marcadas = [...W().textos().premisas.map((x) => x.id), ...S().mias.map((x) => x.id)];
      if (a === "ninguna") S().marcadas = [];
      if (a !== "probar") box.querySelectorAll(".spz-premisa input").forEach((i) => { i.checked = S().marcadas.includes(i.value); });
      veredicto();
    }));
  }
  return { montar(b) { box = b; pintar(); if (!S().html && st.modo === "libre") veredicto(); } };
})();
