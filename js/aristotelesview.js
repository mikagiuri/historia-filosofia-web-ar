"use strict";
/* ===== Eudaimonía ===== juego de la ética de Aristóteles ===== depende de: juego_aristoteles.js, store.js =====
   Motor (funciones ariE*, sin DOM: también lo usa tools/sim_eudaimonia.js) + vista (render*). */

const ARI_KEYS = ["sal","hac","car","rep","ene","phr"];
let ariRng = Math.random;   // la simulación lo sustituye por un generador con semilla

/* ================= MOTOR ================= */
function ariEtapas(){ return JUEGO_ARIS.meta.etapas; }
function ariTotalRondas(){ return ariEtapas().reduce((s,e) => s + e.rondas, 0); }
function ariEtapaDe(round){ let n = 0; for(const e of ariEtapas()){ n += e.rondas; if(round < n) return e; } return ariEtapas()[ariEtapas().length-1]; }
function ariClamp(v){ return Math.max(0, Math.min(12, v)); }

function ariENew(charId){
  const c = JUEGO_ARIS.chars.find(x => x.id === charId);
  const st = {}; ARI_KEYS.forEach(k => st[k] = c[k]);
  return { char:c, st, ini:Object.assign({}, st), flags:new Set(), used:new Set(), round:0, cur:null, log:[], over:null };
}

function ariEtapaOk(d, et){ const e = d.etapa; return Array.isArray(e) ? e.includes(et) : e === et; }
function ariCondOk(S, d){ return !d.cond || Object.keys(d.cond).every(k => S.st[k] >= d.cond[k]); }
function ariOrientOk(S, d){ return !d.orient || d.orient.includes(S.char.orient); }

// siguiente dilema (o null si la vida ha terminado)
function ariENext(S){
  if(S.over) return null;
  if(S.round < ariTotalRondas() && !S.pasoHecho?.[S.round]){ (S.pasoHecho = S.pasoHecho || {})[S.round] = true; S.ultimoPaso = ariEPaso(S); if(S.over) return null; } else S.ultimoPaso = null;
  const D = JUEGO_ARIS.dilemmas, libre = d => !S.used.has(d.id);
  const urg = D.find(d => d.urgente && d.req && S.flags.has(d.req) && libre(d));
  if(!urg && S.round >= ariTotalRondas()) return null;
  const et = ariEtapaDe(S.round).id;
  let d = urg || D.find(d => !d.urgente && d.req && S.flags.has(d.req) && libre(d) && ariEtapaOk(d, et));
  if(!d){
    const pool = D.filter(d => !d.req && libre(d) && ariEtapaOk(d, et) && ariOrientOk(S, d) && ariCondOk(S, d));
    const peso = pool.flatMap(d => d.orient ? [d, d] : [d]);   // los dilemas de tu orientación salen el doble
    const alt = D.filter(d => !d.req && libre(d) && ariOrientOk(S, d) && ariCondOk(S, d));
    const src = peso.length ? peso : alt;
    if(!src.length) return null;
    d = src[Math.floor(ariRng() * src.length)];
  }
  S.used.add(d.id); S.cur = d; return d;
}
// al cambiar de etapa: rentas y desgaste de la vida corriente
function ariEPaso(S){
  if(S.over || S.round === 0) return null;
  const e = ariEtapaDe(S.round), antes = ariEtapaDe(S.round - 1);
  if(e === antes || !e.paso) return null;
  const real = ariEApply(S, e.paso); ariEChequeo(S);
  S.log.push({ paso:true, etapa:e.label, t:e.paso.t, real });
  return { t:e.paso.t, real };
}

function ariBlocked(S, o){ return (S.char.bloquea || []).some(t => (o.tags || []).includes(t)); }

// efecto real de un conjunto de cambios para este personaje (rasgos: mods por tag + multiplicadores)
function ariEEff(S, base, tags){
  const d = {}; ARI_KEYS.forEach(k => { if(base[k]) d[k] = base[k]; });
  (tags || []).forEach(t => { const m = (S.char.mods || {})[t]; if(m) ARI_KEYS.forEach(k => { if(m[k]) d[k] = (d[k] || 0) + m[k]; }); });
  const mu = S.char.mult || {};
  ARI_KEYS.forEach(k => {
    if(!d[k] || !mu[k]) return;
    const f = d[k] > 0 ? mu[k].up : mu[k].down; if(!f) return;
    const v = Math.abs(d[k]) * f; d[k] = Math.sign(d[k]) * (f >= 1 ? Math.round(v) : Math.floor(v));
  });
  return d;
}
// aplica y devuelve el cambio efectivo (tras recortar a 0-12)
function ariEApply(S, d){
  const real = {};
  ARI_KEYS.forEach(k => { if(!d[k]) return; const v = ariClamp(S.st[k] + d[k]); if(v !== S.st[k]) real[k] = v - S.st[k]; S.st[k] = v; });
  return real;
}
function ariEMuere(S, tipo, texto){ S.over = { tipo, texto }; }
function ariEChequeo(S){
  if(S.over) return;
  if(S.st.sal <= 0) ariEMuere(S, "muerte", "صحتك لا تتحمل أكثر من ذلك.");
  else if(S.st.hac <= 0 && !S.char.noRuina) ariEMuere(S, "ruina", "لم يبق لك شيء: الإفلاس يُبعدك عن حياة المدينة.");
}
function ariPExito(S, o){ return Math.min(0.85 + (S.char.riesgo || 0), (o.pBase == null ? 0.3 : o.pBase) + S.st.phr * 0.06 + (S.char.riesgo || 0)); }

// resuelve la opción i del dilema actual: devuelve la lista de sucesos para mostrarlos
function ariEResolve(S, i){
  const d = S.cur, o = d.opts[i], ev = [], ronda = { n:S.round + 1, etapa:ariEtapaDe(S.round).label, d, o, cambios:[] };
  if(S.st.sal < S.ini.sal) S.st.sal++;   // el cuerpo se recupera poco a poco, sin pasar de su estado inicial
  const push = (tipo, extra, delta) => { const real = ariEApply(S, delta || {}); const e = Object.assign({ tipo, real }, extra); ev.push(e); ronda.cambios.push(e); return e; };
  push("decision", {}, ariEEff(S, o, o.tags));
  if(o.set) S.flags.add(o.set);
  if(o.risk){
    const p = ariPExito(S, o), ok = ariRng() < p, sub = (ok ? o.win : o.lose) || (ok ? { car:1 } : { car:-1, sal:-1 });
    if(sub.set) S.flags.add(sub.set);
    push("dado", { ok, r:sub.r, prudente:S.st.phr >= 7 }, ariEEff(S, sub));
  }
  if(o.muerte && !S.over){
    const pm = o.muerte >= 1 ? 1 : o.muerte * (1 - 0.04 * S.st.phr);
    if(ariRng() < pm){ ariEMuere(S, "muerte", o.muerteT || "Mueres."); push("muerte", { t:o.muerteT }); }
  }
  ariEChequeo(S);
  if(!S.over && ariRng() < JUEGO_ARIS.chanceProb){
    const c = JUEGO_ARIS.chance[Math.floor(ariRng() * JUEGO_ARIS.chance.length)];
    push("azar", { card:c }, ariEEff(S, c));
    ariEChequeo(S);
  }
  if(!S.over) ariEPeligro(S, push);
  ariEChequeo(S);
  S.log.push(ronda); S.round++;
  return ev;
}

function ariEPeligro(S, push){
  const P = JUEGO_ARIS.peligro, ene = S.st.ene;
  if(ene < P.umbral) return;
  const p = Math.min(P.max, P.porPunto * (ene - P.umbral + 1));
  if(ariRng() >= p) return;
  const r = ariRng();
  if(S.st.rep >= 7 && r < (S.char.ostracismo || 0.35)){ push("peligro", { t:P.ostracismo.t, d:P.ostracismo.d, img:P.ostracismo.img }, P.ostracismo); return; }
  const tipo = r < 0.72 ? "juicio" : "atentado", E = P[tipo];
  const s = ariRng() + 0.04 * S.st.phr + (tipo === "juicio" ? 0.03 * S.st.rep - 0.04 * ene : 0);
  const sal = E.salidas.find(x => s >= x.min);
  const e = push("peligro", { t:(tipo === "juicio" ? E.t + ": " + sal.t : sal.t), d:sal.d, img:sal.img || E.img, em:E.em, muerte:!!sal.muerte }, sal.muerte ? {} : sal);
  if(sal.muerte) ariEMuere(S, "muerte", sal.d);
  return e;
}

// balance final
function ariEFinal(S){
  const st = S.st, parts = { car:2 * st.car, phr:st.phr, sal:Math.min(st.sal, 8), hac:Math.min(st.hac, 8), rep:Math.min(st.rep, 6) };
  const eud = Object.values(parts).reduce((a,b) => a + b, 0), F = JUEGO_ARIS.finales;
  let band;
  if(S.over) band = S.over.tipo === "muerte" ? (st.car >= 7 ? F.muerte_noble : F.muerte) : (st.car >= 7 ? F.ruina_noble : F.ruina);
  else if(st.car <= 3 && st.hac + st.rep >= 12) band = F.prospero;
  else {
    band = JUEGO_ARIS.bands.find(b => eud >= b.min);
    if((st.sal <= 2 || st.hac <= 2) && band.min > 28) band = JUEGO_ARIS.bands.find(b => b.min === 28);   // sin bienes no hay vida plena
  }
  return { eud, parts, band };
}

/* ===== Juzgar la vida (20-10, artefacto «Los pesos de la felicidad») · lógica sin DOM =====
   La misma vida del motor, puntuada por varias teorías (datos en JUEGO_ARIS.juzgar). No cambia el balance del juego. */
const FEL = (() => {
  const J = () => JUEGO_ARIS.juzgar;
  // muertes de opción del juego, clasificadas una a una (dilema:opción → causa)
  const MUERTES = { "delion:1":"temeridad", "leon:3":"fidelidad", "sicilia:0":"ambicion", "stasis:3":"fidelidad", "alejandria:0":"fidelidad",
    "golpe:0":"ambicion", "carcel:1":"fidelidad", "c-tirano:3":"ambicion", "c-oligarca:0":"temeridad" };
  function causaOpcion(d, i){
    const k = MUERTES[d.id + ":" + i]; if(k) return k;
    const o = d.opts[i], tags = o.tags || [];
    if((o.car || 0) >= 2 || tags.includes("justo") || tags.includes("verdad")) return "fidelidad";
    if(tags.includes("injusto") || (o.rep || 0) >= 2 || (o.hac || 0) >= 2) return "ambicion";
    return "temeridad";
  }
  // nota de 0 a 100: suma de peso × valor (hasta el tope) / máximo posible; los pesos negativos restan; × factor si se trunca
  function puntuar(st, T, causa){
    let pts = 0, max = 0;
    ARI_KEYS.forEach(k => {
      const w = T.w[k] || 0, v = Math.min(st[k], T.tope[k]);
      if(w > 0){ pts += w * v; max += w * T.tope[k]; } else if(w < 0) pts += w * st[k];
    });
    let pct = max > 0 ? Math.max(0, 100 * pts / max) : 0;
    if(causa) pct *= T.muerte[causa] ?? 1;
    return Math.round(pct * 10) / 10;
  }
  function valorOpcion(S, o, E){
    if(!E.w) return ariRng();
    const base = ariEEff(S, o, o.tags);
    let v = ARI_KEYS.reduce((s, k) => s + (E.w[k] || 0) * (base[k] || 0), 0);
    if(o.risk){
      const p = ariPExito(S, o), win = ariEEff(S, o.win || { car:1 }), lose = ariEEff(S, o.lose || { car:-1, sal:-1 });
      v += ARI_KEYS.reduce((s, k) => s + (E.w[k] || 0) * (p * (win[k] || 0) + (1 - p) * (lose[k] || 0)), 0);
    }
    if(o.muerte) v -= E.muerte * (o.muerte >= 1 ? 1 : o.muerte) * 10;
    return v + ariRng() * 0.01;
  }
  function elegir(S, E){
    const opts = S.cur.opts.map((o, i) => ({ o, i })).filter(x => !ariBlocked(S, x.o)), val = new Map(opts.map(x => [x.i, valorOpcion(S, x.o, E)]));
    return opts.reduce((a, b) => val.get(b.i) > val.get(a.i) ? b : a).i;
  }
  // vida nueva, con registro de la trayectoria
  function nueva(charId){ const S = ariENew(charId); return { S, tray:[{ r:0, st:Object.assign({}, S.st), etapa:ariEtapaDe(0).label }], decisiones:[], estilo:null }; }
  function siguiente(V){
    const d = ariENext(V.S);
    if(V.S.over && !V.causa) V.causa = V.S.over.tipo === "ruina" ? "ruina" : "salud";   // el paso de etapa también puede acabar una vida
    return d;
  }
  function decidir(V, i){
    const S = V.S, d = S.cur, o = d.opts[i], ev = ariEResolve(S, i);
    if(S.over && !V.causa){
      if(ev.some(e => e.tipo === "muerte")) V.causa = causaOpcion(d, i);
      else if(ev.some(e => e.tipo === "peligro" && e.muerte)) V.causa = "enemigos";
      else V.causa = S.over.tipo === "ruina" ? "ruina" : "salud";
    }
    V.decisiones.push({ r:S.round, o:o.t });
    V.tray.push({ r:S.round, st:Object.assign({}, S.st), etapa:ariEtapaDe(Math.max(0, S.round - 1)).label, o:o.t });
    return ev;
  }
  function automatica(charId, estiloId){
    const E = J().estilos.find(x => x.id === estiloId), V = nueva(charId);
    V.estilo = E.nombre;
    let n = 0;
    while(siguiente(V) && n++ < 40) decidir(V, elegir(V.S, E));
    return V;
  }
  function veredictos(V, teorias){
    const causa = V.S.over ? V.causa || "salud" : null;
    return teorias.map(T => ({ T, pct:puntuar(V.S.st, T, causa), curva:V.tray.map((p, i) => ({ r:p.r, pct:puntuar(p.st, T, i === V.tray.length - 1 ? causa : null) })) }));
  }
  return { puntuar, nueva, siguiente, decidir, automatica, veredictos, elegir };
})();

/* ================= VISTA ================= */
const ARI = { S:null, answered:false };
function ariBox(){ return document.getElementById("aribox"); }
function ariEsc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function ariImg(id){ return JUEGO_ARIS.meta.imgBase + id + ".jpg"; }
// retrato del personaje; sin ilustración, un medallón con su inicial
function ariRetrato(c, cls, alt){
  return c.sinImg ? '<span class="' + cls + ' ari-noimg" role="img" aria-label="' + ariEsc(c.name) + '">' + ariEsc(c.name.charAt(0)) + '</span>'
    : '<img class="' + cls + '" loading="lazy" src="' + ariImg("char-" + c.id) + '" alt="' + (alt ? ariEsc(c.name) : "") + '">';
}
function ariStat(k){ return JUEGO_ARIS.stats.find(s => s.k === k); }
function ariNivel(k, v){ return ariStat(k).niveles.find(n => v <= n[0])[1]; }
function ariAlerta(k, v){ return (k === "sal" || k === "hac") ? v <= 2 : k === "ene" ? v >= 6 : false; }

// conmutador de mesas: el juego o «Juzgar la vida»
function ariModoBar(){
  if(!JUEGO_ARIS.juzgar) return "";
  const U = JUEGO_ARIS.juzgar.ui;
  return '<div class="fgroup ari-modo" role="group">' + [["jugar", U.modoJugar], ["juzgar", U.modoJuzgar]].map(m =>
    '<button class="fbtn" type="button" data-ari-modo="' + m[0] + '" aria-pressed="' + ((ARI.modo || "jugar") === m[0]) + '">' + ariEsc(m[1]) + '</button>').join("") + '</div>';
}
function ariModoWire(box){
  box.querySelectorAll("[data-ari-modo]").forEach(b => b.addEventListener("click", () => { ARI.modo = b.dataset.ariModo; renderAriStart(); }));
}

function renderAriStart(){
  const box = ariBox(); if(!box) return;
  if(ARI.modo === "juzgar" && JUEGO_ARIS.juzgar){ renderFel(box); return; }
  const cards = JUEGO_ARIS.chars.map(c =>
    '<button class="ari-char" data-char="' + c.id + '">' +
      '<div class="ari-portrait">' + ariRetrato(c, "ari-portrait-img", true) + '<span class="ari-orient">' + c.orient + '</span></div>' +
      '<div class="ari-char-b"><div class="ari-char-h"><b>' + c.name + '</b></div>' +
        '<p class="ari-perfil">' + ariEsc(c.perfil) + '</p>' +
        '<div class="ari-trait"><span class="ari-vir">' + ariEsc(c.virtud) + '</span> ' + ariEsc(c.virtudT) + '</div>' +
        '<div class="ari-trait"><span class="ari-deb">' + ariEsc(c.debilidad) + '</span> ' + ariEsc(c.debilidadT) + '</div>' +
        '<div class="ari-frase">«' + c.frase + '»</div></div>' +
    '</button>').join("");
  const et = ariEtapas().map(e => e.label.toLowerCase()), etTxt = et.slice(0, -1).join("، ") + " و" + et[et.length-1] + ": " + ariTotalRondas() + " قرارًا في المجموع";
  box.innerHTML = '<div class="ari-wrap">' + ariModoBar() +
    '<details class="ari-intro" open><summary>كيف تلعبون</summary>' +
      '<ul>' +
        '<li>اختاروا شخصية وعيشوا حياتها في ثلاث مراحل، ' + etTxt + '.</li>' +
        '<li>لن تروا أرقامًا: فقط حال <b>صحتكم</b> 🏋️ و<b>ثروتكم</b> 💰 و<b>خُلُقكم</b> 🧠 و<b>سمعتكم</b> 🏛️ و<b>أعدائكم</b> ⚔️ و<b>تعقّلكم</b> 🧭. تنكشف الأرقام في النهاية.</li>' +
        '<li>إذا نفدت صحتكم أو ثروتكم، تنتهي اللعبة.</li>' +
        '<li>إذا كثر أعداؤكم، فقد يقدّمونكم في كل جولة إلى المحاكمة، أو ينفونكم، أو يسجنونكم، أو يقتلونكم. لا فرق إن كان ذلك بسبب طموح مفرط أو لأنكم رفضتم أن تُفسَدوا.</li>' +
        '<li>التعقّل لا ينجيكم من الخطر، لكنه يساعدكم على الخروج بحال أفضل من المحاكمات والقرارات الخطرة 🎲.</li>' +
      '</ul>' +
      '<p class="ari-intro-h">ما علاقة هذا بأرسطو؟</p>' +
      '<ul>' +
        '<li><i>السعادة (eudaimonía)</i> هي حياة كاملة ناجحة، لا لحظة جميلة: لذلك يكون الحكم عليها في النهاية. «السنونوة الواحدة لا تصنع الربيع».</li>' +
        '<li>وهي قبل كل شيء نشاط للنفس وفق الفضيلة: وفي الحصيلة النهائية يُحسب الخُلُق مرتين.</li>' +
        '<li>لكنها تحتاج إلى خيرات خارجية (الصحة، الموارد، الأصدقاء، السمعة الحسنة). ومن ينتهي إلى المصيبة، مثل بريام، لا يُسمّى سعيدًا.</li>' +
        '<li>الفضيلة وسط «نسبي إلينا»: فهي لا تكلّف ألكيبيادس ما تكلّف سقراط. لذلك لكل شخصية سماتها الخاصة.</li>' +
        '<li><i>التعقّل (phrónesis)</i> هو معرفة ما يجب فعله في كل حالة بعينها.</li>' +
      '</ul></details>' +
    '<div class="ari-col-h">اختاروا شخصيتكم</div>' +
    '<div class="ari-chars">' + cards + '</div>' +
    '<p class="ia-note">رسوم مولَّدة بالذكاء الاصطناعي</p></div>';
  box.querySelectorAll("[data-char]").forEach(b => b.addEventListener("click", () => ariStart(b.dataset.char)));
  ariModoWire(box);
}

function ariStart(id){ ARI.S = ariENew(id); ariRenderDilemma(); }

function ariHud(){
  const S = ARI.S, et = ariEtapaDe(S.round);
  const pills = JUEGO_ARIS.stats.map(s => '<span class="ari-pill' + (ariAlerta(s.k, S.st[s.k]) ? " warn" : "") + '" title="' + s.label + '">' + s.em + ' ' + s.label + ': <b>' + ariNivel(s.k, S.st[s.k]) + '</b></span>').join("");
  return '<div class="ari-hud">' +
    '<span class="ari-who">' + ariRetrato(S.char, "ari-mini") + ' ' + S.char.name + '</span>' +
    '<span class="ari-stat">' + et.label + ' · القرار <b>' + (S.round + 1) + '</b>/' + Math.max(ariTotalRondas(), S.round + 1) + '</span></div>' +
    '<div class="ari-pills">' + pills + '</div>';
}

// pistas cualitativas (sin números) para cada opción
function ariHints(o){
  const S = ARI.S, eff = ariEEff(S, o, o.tags), h = [];
  if(o.muerte) h.push("☠️ حياتكم على المحك");
  if(o.risk) h.push("🎲 غير مضمون");
  if((eff.ene || 0) >= 2 || (o.lose && (o.lose.ene || 0) >= 3)) h.push("⚔️ ستكسبون أعداء");
  if((eff.hac || 0) <= -3) h.push("💰 مكلف");
  if((eff.sal || 0) <= -2) h.push("🏋️ مُجهد للجسد");
  return h.length ? '<span class="ari-hints">' + h.map(x => '<span>' + x + '</span>').join("") + '</span>' : "";
}

function ariRenderDilemma(){
  const S = ARI.S, d = ariENext(S);
  if(!d){ ariResult(); return; }
  ARI.answered = false;
  const opts = d.opts.map((o,i) => {
    const bl = ariBlocked(S, o);
    return '<button class="ari-opt" data-i="' + i + '"' + (bl ? " disabled" : "") + '><span class="k">' + "ABCD"[i] + '</span><span class="ari-ot">' + ariEsc(o.t) +
      (bl ? ' <span class="ari-blk">إفراطكم لا يسمح لكم بذلك.</span>' : ariHints(o)) + '</span></button>';
  }).join("");
  ariBox().innerHTML = '<div class="ari-wrap">' + ariHud() +
    (S.ultimoPaso ? '<p class="ari-hist">⏳ ' + ariEsc(S.ultimoPaso.t) + '</p>' + ariArrows(S.ultimoPaso.real) : '') +
    '<div class="ari-card"><div class="ari-virtue">' + ariEsc(d.virtue) + '</div>' +
      '<p class="ari-sit">' + ariEsc(d.sit) + '</p>' +
      '<div class="ari-opts">' + opts + '</div>' +
      '<div class="ari-res" id="ariRes"></div>' +
      '<div class="ari-foot"><button class="ari-next" id="ariNext" hidden></button></div>' +
    '</div></div>';
  ariBox().querySelectorAll(".ari-opt").forEach(b => b.addEventListener("click", () => ariChoose(+b.dataset.i)));
  document.getElementById("ariNext").addEventListener("click", ariRenderDilemma);
}

// flechas sin números: ↑ / ↑↑ (el color dice si es bueno o malo)
function ariArrows(real){
  const p = ARI_KEYS.filter(k => real[k]).map(k => {
    const v = real[k], bueno = k === "ene" ? v < 0 : v > 0, s = ariStat(k);
    return '<span class="' + (bueno ? "up" : "down") + '">' + s.em + ' ' + s.label + ' ' + (v > 0 ? "↑" : "↓").repeat(Math.abs(v) >= 3 ? 2 : 1) + '</span>';
  });
  return p.length ? '<div class="ari-arrows">' + p.join("") + '</div>' : "";
}
function ariCard(cls, img, ph, tag, title, text, real){
  return '<div class="ari-chance-card ' + cls + '">' +
    (img ? '<img class="ari-chance-img" src="' + ariImg(img) + '" alt="">' : '<div class="ari-chance-ph">' + ph + '</div>') +
    '<div class="ari-chance-t"><span class="ari-chance-tag">' + tag + '</span><b>' + ariEsc(title) + '</b><p>' + ariEsc(text) + '</p>' + ariArrows(real) + '</div></div>';
}

function ariChoose(i){
  if(ARI.answered) return; ARI.answered = true;
  const S = ARI.S, d = S.cur, o = d.opts[i];
  const btns = [...document.querySelectorAll(".ari-opt")];
  btns.forEach((b,j) => { b.disabled = true; if(j !== i) b.classList.add("dim"); });
  btns[i].classList.add("chosen");
  const ev = ariEResolve(S, i);
  let html = '';
  ev.forEach(e => {
    if(e.tipo === "decision") html += (o.r ? '<p class="ari-line">' + ariEsc(o.r) + '</p>' : '') + ariArrows(e.real);
    else if(e.tipo === "dado") html += '<div class="ari-dado ' + (e.ok ? "win" : "lose") + '">🎲 <b>' + (e.ok ? "تنجح" : "تفشل") + '.</b> ' + ariEsc(e.r || "") + (e.prudente ? ' <span class="ari-hint">(تعقّلكم منحكم أفضلية)</span>' : '') + ariArrows(e.real) + '</div>';
    else if(e.tipo === "muerte") html += ariCard("bad", null, "☠️", "الموت", "لقد متّم", e.t, {});
    else if(e.tipo === "azar") html += ariCard(e.card.bad ? "bad" : "good", e.card.img, e.card.bad ? "🃏" : "🎴", "🎲 بطاقة الحظ", e.card.t, e.card.d, e.real);
    else if(e.tipo === "peligro") html += ariCard("bad", e.img, e.em || "⚔️", "⚔️ أعداؤكم يتحرّكون", e.t, e.d, e.real);
  });
  if(d.hist) html += '<p class="ari-hist">📜 ' + ariEsc(d.hist) + '</p>';
  if(S.over && S.over.tipo === "muerte" && !ev.some(e => e.tipo === "muerte" || (e.tipo === "peligro" && e.muerte))) html += ariCard("bad", null, "☠️", "الموت", "لقد متّم", S.over.texto, {});
  if(S.over && S.over.tipo === "ruina") html += ariCard("bad", "azar-ruina", "🪨", "الإفلاس", "لقد أفلستم", S.over.texto, {});
  const res = document.getElementById("ariRes"); res.innerHTML = html; res.classList.add("show");
  const hud = document.querySelector("#aribox .ari-pills"); if(hud){ const tmp = document.createElement("div"); tmp.innerHTML = ariHud(); hud.replaceWith(tmp.querySelector(".ari-pills")); }
  const nx = document.getElementById("ariNext");
  const fin = S.over || !ariHayMas(S);
  nx.textContent = S.over ? "شاهدوا النهاية ✝" : fin ? "شاهدوا حصيلة حياتكم" : "التالي →";
  nx.hidden = false;
}
function ariHayMas(S){ return S.round < ariTotalRondas() || JUEGO_ARIS.dilemmas.some(d => d.urgente && d.req && S.flags.has(d.req) && !S.used.has(d.id)); }

/* ---------- balance final: aquí se revelan los números ---------- */
function ariFmt(d){ return ARI_KEYS.filter(k => d[k]).map(k => '<span class="' + ((k === "ene" ? d[k] < 0 : d[k] > 0) ? "up" : "down") + '">' + (d[k] > 0 ? "+" : "") + d[k] + ariStat(k).em + '</span>').join(" ") || "—"; }
function ariResult(){
  const S = ARI.S, F = ariEFinal(S), c = S.char;
  const key = "aula-eudaimonia-best"; let best = {}; try{ best = store.get(key, {}) || {}; }catch(e){}
  const prev = best[c.id] || 0, record = !S.over && F.eud > prev;
  if(record){ best[c.id] = F.eud; try{ store.set(key, best); }catch(e){} }
  const q = JUEGO_ARIS.reflect[Math.floor(Math.random() * JUEGO_ARIS.reflect.length)];
  const filas = JUEGO_ARIS.stats.map(s => '<tr><td>' + s.em + ' ' + s.label + '</td><td>' + S.ini[s.k] + '</td><td><b>' + S.st[s.k] + '</b></td><td>' + ariNivel(s.k, S.st[s.k]) + '</td></tr>').join("");
  const P = F.parts;
  const formula = '2 × الخُلُق (' + P.car + ') + التعقّل (' + P.phr + ') + الصحة (' + P.sal + ') + الثروة (' + P.hac + ') + السمعة (' + P.rep + ') = <b>' + F.eud + '</b>';
  const log = S.log.map(r => {
    if(r.paso) return '<li class="paso"><b>' + ariEsc(r.etapa) + '.</b> ' + ariEsc(r.t) + ' <span class="ari-log-c">' + ariFmt(r.real) + '</span></li>';
    const cambios = r.cambios.map(e => {
      const lbl = e.tipo === "decision" ? "قرار" : e.tipo === "dado" ? "🎲 " + (e.ok ? "تنجح" : "تفشل") : e.tipo === "azar" ? "حظ: " + e.card.t : e.tipo === "peligro" ? "⚔️ " + e.t : "☠️ موت";
      return '<span class="ari-log-c">' + ariEsc(lbl) + ' ' + ariFmt(e.real) + '</span>';
    }).join("");
    return '<li><div class="ari-log-h"><b>' + r.n + '. ' + ariEsc(r.etapa) + ' · ' + ariEsc(r.d.virtue) + '</b></div><div class="ari-log-s">' + ariEsc(r.d.sit) + '</div><div class="ari-log-o">→ ' + ariEsc(r.o.t) + '</div><div class="ari-log-cs">' + cambios + '</div></li>';
  }).join("");
  ariBox().innerHTML = '<div class="ari-wrap"><div class="ari-result' + (S.over ? " dead" : "") + '">' +
    '' + ariRetrato(c, "ari-result-img") + '' +
    '<div class="ari-badge">' + F.band.emoji + '</div>' +
    '<div class="ari-rank">' + F.band.label + '</div>' +
    (F.band.texto ? '<p class="ari-band-t">' + ariEsc(F.band.texto) + '</p>' : '') +
    (S.over ? '<p class="ari-stats2">' + c.name + ' · ' + ariEsc(S.over.texto) + ' (القرار ' + S.round + ')</p>' : '') +
    '<div class="ari-final">' + F.eud + ' <span>السعادة (eudaimonía)</span></div>' +
    '<p class="ari-formula">' + formula + '</p>' +
    '<p class="ari-stats2">' + (record ? 'أفضل حياة لكم مع ' + c.name + '! 🎉' : (prev ? 'أفضل حياة مع ' + c.name + ': ' + Math.max(prev, S.over ? 0 : F.eud) : '')) + '</p>' +
    '<table class="ari-reveal"><thead><tr><th></th><th>في البداية</th><th>في النهاية</th><th></th></tr></thead><tbody>' + filas + '</tbody></table>' +
    '<div class="ari-destino"><b>ما حدث فعلًا لـ ' + c.name + ':</b> ' + ariEsc(c.destino) + '</div>' +
    '<details class="ari-log"><summary>حياتكم، قرارًا بعد قرار (مع الأرقام)</summary><ol>' + log + '</ol></details>' +
    '<blockquote class="ari-reflect">للتفكير: ' + ariEsc(q) + '</blockquote>' +
    '<div class="ari-actions"><button class="btn2 primary" id="ariAgain">حياة أخرى</button>' +
      '<button class="btn2" id="ariHome">تغيير الشخصية</button></div>' +
  '</div></div>';
  document.getElementById("ariAgain").addEventListener("click", () => ariStart(c.id));
  document.getElementById("ariHome").addEventListener("click", renderAriStart);
}

/* ================= VISTA · Juzgar la vida ================= */
const renderFel = (() => {
  const st = { V:null, modo:null, sel:"aristoteles", mia:null, vidas:[] };
  let box = null;
  const J = () => JUEGO_ARIS.juzgar, U = () => JUEGO_ARIS.juzgar.ui;
  const q = sel => box.querySelector(sel);
  const fx = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m);
  const clon = o => JSON.parse(JSON.stringify(o));
  const loc = () => { const l = (document.documentElement.lang || "es").slice(0, 2); return l === "ar" ? "ar-u-nu-latn" : l; };
  const fmt = x => (Math.round(x * 10) / 10).toLocaleString(loc());
  const fmtF = x => (Math.round(x * 100) / 100).toLocaleString(loc());   // factores: 0,35
  const EM = k => ariStat(k).em, NOM = k => ariStat(k).label;
  function h(tag, attrs, ...kids){
    const e = document.createElement(tag);
    for(const [k, v] of Object.entries(attrs || {})){
      if(v == null || v === false) continue;
      if(k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach(c => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
    return e;
  }
  const SVGNS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, txt){ const e = document.createElementNS(SVGNS, tag); for(const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v); if(txt != null) e.textContent = txt; return e; }
  const teorias = () => [...J().teorias, st.mia];
  const pj = () => JUEGO_ARIS.chars.find(c => c.id === q("#fel-pj").value);
  const causaN = k => J().causas[k || "salud"];

  /* ---------- 1 · vivir ---------- */
  function pintarPerfil(){
    const c = pj(), u = U();
    q("#fel-perfil").textContent = c.name + " (" + c.orient.toLowerCase() + "). " + (c.perfil || "") +
      (c.virtudT ? " " + u.virtud + " (" + c.virtud + "): " + c.virtudT : "") + (c.debilidadT ? " " + u.debilidad + " (" + c.debilidad + "): " + c.debilidadT : "");
  }
  function pintarStats(){
    const base = st.V ? st.V.S.st : pj();
    q("#fel-stats").replaceChildren(...ARI_KEYS.map(k => h("div", { class:"fel-stat", title:NOM(k) }, h("span", {}, EM(k) + " " + NOM(k)),
      h("div", { class:"fel-sb" }, h("div", { style:"width:" + (100 * base[k] / 12) + "%" })), h("b", { class:"fel-mono" }, String(base[k])))));
  }
  function deltaTxt(real){
    const ks = ARI_KEYS.filter(k => real && real[k]);
    if(!ks.length) return h("span", { class:"fel-delta" }, U().sinCambios);
    return h("span", { class:"fel-delta" }, ...ks.map(k => h("span", { class:(k === "ene" ? real[k] < 0 : real[k] > 0) ? "up" : "down" }, (real[k] > 0 ? "+" : "") + real[k] + EM(k) + " ")));
  }
  function evLinea(e){
    const u = U();
    if(e.tipo === "decision") return h("div", {}, h("b", {}, u.tuDecision + " "), deltaTxt(e.real));
    if(e.tipo === "dado") return h("div", {}, h("b", {}, (e.ok ? u.saleBien : u.saleMal) + " "), (e.r || "") + " ", deltaTxt(e.real));
    if(e.tipo === "azar") return h("div", {}, h("b", {}, u.fortuna + " "), (e.card.t || "") + (e.card.d ? ". " + e.card.d : "") + " ", deltaTxt(e.real));
    if(e.tipo === "peligro") return h("div", {}, h("b", {}, u.peligro + " "), (e.t || "") + (e.d ? ". " + e.d : "") + " ", deltaTxt(e.real));
    if(e.tipo === "muerte") return h("div", {}, h("b", {}, u.muerte + " "), e.t || "");
    return null;
  }
  function jugar(){ st.respondida = false; st.V = FEL.nueva(pj().id); st.V.estilo = U().jugadaPorTi; st.modo = "manual"; siguienteManual(); }
  function siguienteManual(){
    const d = FEL.siguiente(st.V);
    pintarStats();
    if(!d){ terminar(); return; }
    pintarDilema(d);
  }
  function pintarDilema(d){
    st.respondida = false;
    const S = st.V.S, et = ariEtapaDe(S.round).label;
    const pasoT = S.ultimoPaso ? h("div", { class:"fel-aviso" }, h("b", {}, U().pasaTiempo + " "), S.ultimoPaso.t + " ", deltaTxt(S.ultimoPaso.real)) : null;
    q("#fel-juego").replaceChildren(h("div", { class:"fel-dilema" }, pasoT, h("span", { class:"fel-etq" }, et + " · " + U().ronda + " " + (S.round + 1) + (d.virtue ? " · " + d.virtue : "")), h("p", { class:"fel-situ" }, d.sit),
      h("div", { class:"fel-ops" }, ...d.opts.map((o, i) => { const bl = ariBlocked(S, o); return h("button", { type:"button", disabled:bl, onclick:() => elegir(i) }, o.t + (bl ? " " + U().bloqueada : "")); }))));
    pintarTray();
  }
  function elegir(i){
    st.respondida = true;
    const V = st.V, o = V.S.cur.opts[i], ev = FEL.decidir(V, i);
    pintarStats(); pintarTray();
    q("#fel-juego").replaceChildren(h("div", { class:"fel-dilema" }, h("p", { class:"fel-situ" }, o.r || ""), h("div", { class:"fel-ev" }, ...ev.map(evLinea).filter(Boolean)),
      h("div", { class:"fel-fila" }, h("button", { type:"button", class:"fel-b prim", onclick:siguienteManual }, V.S.over ? U().verFinal : U().seguir))));
    q("#fel-juego .prim").focus();
  }
  function auto(){ st.V = FEL.automatica(pj().id, q("#fel-estilo").value); st.modo = "auto"; pintarStats(); terminar(); }
  function terminar(){
    const V = st.V, S = V.S, u = U();
    V.final = ariEFinal(S);
    const C = causaN(V.causa);
    const cab = S.over ? (S.over.tipo === "muerte" ? u.muereAntes : u.acabaRuina) + " · " + C.nombre.toLowerCase() : u.completa;
    q("#fel-juego").replaceChildren(h("div", { class:"fel-aviso " + (S.over ? "mal" : "ok") }, h("b", {}, cab + ". "),
      (S.over ? S.over.texto + " (" + C.desc + ".) " : "") + fx(u.decisiones, { n:V.decisiones.length }) + (st.modo === "auto" ? " " + fx(u.conEstiloX, { e:V.estilo }) : "") + ". " + u.bajaVer));
    q("#fel-guardar").disabled = false;
    pintarTray(); pintarPesos();
    q("#fel-m-pesos").hidden = false;
  }

  /* ---------- 2 · trayectoria ---------- */
  function mini(k, tray){
    const W = 260, H = 110, ml = 24, mr = 10, mt = 18, mb = 18, iw = W - ml - mr, ih = H - mt - mb;
    const n = Math.max(1, tray[tray.length - 1].r), X = r => ml + r / n * iw, Y = v => mt + ih - v / 12 * ih;
    const sv = s("svg", { viewBox:`0 0 ${W} ${H}`, role:"img", "aria-label":fx(U().deA, { k:NOM(k), a:tray[0].st[k], b:tray[tray.length - 1].st[k] }) });
    sv.append(s("text", { x:0, y:11, class:"fel-svg-t" }, EM(k) + " " + NOM(k)));
    // madurez sombreada (rondas de la etapa central)
    const et = ariEtapas(), r0 = et[0].rondas, r1 = Math.min(r0 + et[1].rondas, n);
    if(n > r0) sv.append(s("rect", { x:X(r0), y:mt, width:Math.max(0, X(r1) - X(r0)), height:ih, class:"fel-svg-band" }));
    [0, 6, 12].forEach(v => { sv.append(s("line", { x1:ml, x2:ml + iw, y1:Y(v), y2:Y(v), class:"fel-svg-grid" })); sv.append(s("text", { x:ml - 5, y:Y(v) + 3.5, "text-anchor":"end", class:"fel-svg-ax" }, v)); });
    if(tray.length > 1) sv.append(s("polyline", { points:tray.map(p => X(p.r) + "," + Y(p.st[k])).join(" "), class:"fel-svg-line" }));
    const u = tray[tray.length - 1];
    sv.append(s("circle", { cx:X(u.r), cy:Y(u.st[k]), r:4, class:"fel-svg-dot" }));
    sv.append(s("text", { x:Math.min(X(u.r) + 6, W - 14), y:Y(u.st[k]) - 6, class:"fel-svg-val" }, u.st[k]));
    if(st.V && st.V.S.over && tray.length > 1) sv.append(s("text", { x:X(u.r) - 3, y:mt - 4, "text-anchor":"end", class:"fel-svg-dead" }, "†"));
    const guia = s("line", { y1:mt, y2:mt + ih, class:"fel-guia", visibility:"hidden" });
    const zona = s("rect", { x:ml, y:mt, width:iw, height:ih, fill:"transparent" });
    const mover = ev => {
      const b = sv.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - b.left) * (W / b.width);
      const r = Math.round((px - ml) / iw * n), p = tray.reduce((a, c) => Math.abs(c.r - r) < Math.abs(a.r - r) ? c : a);
      box.querySelectorAll("#fel-mult .fel-guia").forEach(g => { g.setAttribute("x1", X(p.r)); g.setAttribute("x2", X(p.r)); g.setAttribute("visibility", "visible"); });
      const vals = ARI_KEYS.map(k2 => EM(k2) + p.st[k2]).join(" ");
      q("#fel-tip").textContent = p.r === 0 ? U().puntoPartida + " " + vals : fx(U().rondaX, { n:p.r, e:p.etapa }) + " " + (p.o ? "«" + p.o + "»" : "") + " → " + vals;
    };
    zona.addEventListener("pointermove", mover); zona.addEventListener("touchmove", mover, { passive:true });
    zona.addEventListener("pointerleave", () => box.querySelectorAll("#fel-mult .fel-guia").forEach(g => g.setAttribute("visibility", "hidden")));
    sv.append(guia, zona);
    return h("div", { class:"fel-graf" }, sv);
  }
  function pintarTray(){
    const V = st.V, ok = V && V.tray.length > 1;
    q("#fel-m-tray").hidden = !ok;
    if(ok) q("#fel-mult").replaceChildren(...ARI_KEYS.map(k => mini(k, V.tray)));
  }

  /* ---------- 3 · pesos ---------- */
  function curvaFel(T){
    const u = U(), ver = FEL.veredictos(st.V, [T])[0], c = ver.curva;
    const W = 520, H = 140, ml = 34, mr = 46, mt = 10, mb = 20, iw = W - ml - mr, ih = H - mt - mb, n = Math.max(1, c[c.length - 1].r);
    const X = r => ml + r / n * iw, Y = v => mt + ih - v / 100 * ih;
    const sv = s("svg", { viewBox:`0 0 ${W} ${H}`, role:"img", "aria-label":fx(u.curvaAria, { t:T.nombre, p:fmt(ver.pct) }) });
    [0, 50, 100].forEach(v => { sv.append(s("line", { x1:ml, x2:ml + iw, y1:Y(v), y2:Y(v), class:"fel-svg-grid" })); sv.append(s("text", { x:ml - 6, y:Y(v) + 3.5, "text-anchor":"end", class:"fel-svg-ax" }, v + " %")); });
    [0, n].forEach((r, i) => sv.append(s("text", { x:X(r), y:H - 5, "text-anchor":i ? "end" : "start", class:"fel-svg-ax" }, fx(u.rondaN, { n:r }))));
    sv.append(s("polyline", { points:c.map(p => X(p.r) + "," + Y(p.pct)).join(" "), class:"fel-svg-line acc" }));
    const z = c[c.length - 1];
    sv.append(s("circle", { cx:X(z.r), cy:Y(z.pct), r:4, class:"fel-svg-dot acc" }));
    sv.append(s("text", { x:X(z.r) + 7, y:Y(z.pct) + 4, class:"fel-svg-val" }, fmt(z.pct) + " %"));
    const f = T.muerte[st.V.causa] ?? 1;
    return h("div", { class:"fel-graf" }, h("h3", {}, fx(u.curvaT, { t:T.nombre })), sv,
      h("p", { class:"fel-d" }, st.V.S.over && f < 1 ? fx(u.caida, { c:causaN(st.V.causa).nombre.toLowerCase(), f:fmtF(f) }) : u.soloFinal));
  }
  function rango(attrs, onv){ return h("input", Object.assign({ type:"range", oninput:ev => { onv(+ev.target.value, ev.target); pintarVeredictos(); pintarComp(); } }, attrs)); }
  function tablaPesos(T){
    const u = U(), edit = T.id === "mia";
    const filas = ARI_KEYS.map(k => {
      const w = T.w[k] || 0, top = T.tope[k];
      const celW = edit ? h("td", {}, rango({ min:-3, max:3, step:0.5, value:w, "aria-label":fx(u.pesoDe, { k:NOM(k) }) }, (v, el) => { T.w[k] = v; el.parentNode.nextSibling.textContent = fmt(v); })) : null;
      const celT = edit ? h("td", {}, rango({ min:1, max:12, step:1, value:top, "aria-label":fx(u.topeDe, { k:NOM(k) }) }, (v, el) => { T.tope[k] = v; el.parentNode.nextSibling.textContent = v; })) : null;
      return h("tr", {}, h("td", {}, EM(k) + " " + NOM(k)), celW, h("td", { class:"fel-mono" }, fmt(w)), celT, h("td", { class:"fel-mono" }, w < 0 ? "—" : String(top)));
    });
    const causaV = st.V && st.V.S.over ? st.V.causa : null;
    const muertes = Object.entries(J().causas).map(([k, C]) => h("tr", { class:k === causaV ? "esta" : null }, h("td", {}, C.nombre + (k === causaV ? " " + u.estaVida : "")),
      edit ? h("td", {}, rango({ min:0, max:1, step:0.05, value:T.muerte[k], "aria-label":fx(u.factorDe, { k:C.nombre }) }, (v, el) => { T.muerte[k] = v; el.parentNode.nextSibling.textContent = "×" + fmtF(v); })) : null,
      h("td", { class:"fel-mono" }, "×" + fmtF(T.muerte[k]))));
    return h("div", { class:"fel-col" },
      h("table", { class:"fel-pesos" }, h("thead", {}, h("tr", {}, h("th", {}, u.variable), h("th", { colspan:edit ? 2 : null }, u.peso), h("th", { colspan:edit ? 2 : null }, u.tope))), h("tbody", {}, ...filas)),
      h("h3", {}, u.truncada),
      h("table", { class:"fel-pesos" }, h("thead", {}, h("tr", {}, h("th", {}, u.causa), h("th", { colspan:edit ? 2 : null }, edit ? u.factor : u.multiplica))), h("tbody", {}, ...muertes)),
      h("p", { class:"fel-d" }, u.comoCalcula));
  }
  function pintarVeredictos(){
    if(!st.V || !st.V.final) return;
    const sel = T => { st.sel = T.id; pintarPesos(); };
    q("#fel-ver").replaceChildren(...FEL.veredictos(st.V, teorias()).map(({ T, pct }) => h("div", { class:"fel-ver" + (T.id === st.sel ? " sel" : ""), role:"listitem", tabindex:0, "aria-label":T.nombre + ": " + fmt(pct) + " %",
      onclick:() => sel(T), onkeydown:ev => { if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); sel(T); } } },
      h("span", { class:"nm" }, T.nombre, h("small", {}, T.sub)), h("div", { class:"fel-vbar" }, h("div", { class:"fel-vb", style:"width:" + pct + "%" })), h("b", {}, fmt(pct) + " %"))));
  }
  function pintarPesos(){
    if(!st.V || !st.V.final) return;
    const f = st.V.final, u = U();
    q("#fel-juego-dice").textContent = fx(u.juegoDice, { n:f.eud, b:f.band.label });
    pintarVeredictos();
    const T = teorias().find(t => t.id === st.sel);
    q("#fel-teoria").replaceChildren(...[h("div", { class:"fel-aviso neutro" }, h("b", {}, T.nombre + ". "), T.txt),
      T.id !== "mia" ? h("div", { class:"fel-fila" }, h("button", { type:"button", class:"fel-b", onclick:() => { Object.assign(st.mia, { w:clon(T.w), tope:clon(T.tope), muerte:clon(T.muerte) }); st.sel = "mia"; pintarPesos(); pintarComp(); } }, u.copiar)) : null,
      tablaPesos(T), curvaFel(T)].filter(Boolean));
  }

  /* ---------- 4 · comparar ---------- */
  function guardar(V){
    st.vidas.push({ V, et:V.S.char.name + " · " + V.estilo + (V.S.over ? " · † " + causaN(V.causa).nombre.toLowerCase() : "") });
    pintarComp();
  }
  function pintarComp(){
    const T = teorias(), u = U(), filas = st.vidas.map(x => Object.assign({}, x, { pcts:FEL.veredictos(x.V, T).map(v => v.pct) }));
    const mejores = T.map((_, j) => Math.max(...filas.map(f => f.pcts[j]), -1));
    q("#fel-comp").replaceChildren(h("thead", {}, h("tr", {}, h("th", {}, u.vidaCol), ...T.map(t => h("th", {}, t.nombre)), h("th", {}, ""))),
      h("tbody", {}, ...(filas.length ? filas.map((f, i) => h("tr", {}, h("td", {}, f.et), ...f.pcts.map((p, j) => h("td", { class:p === mejores[j] ? "mejor" : null }, (p === mejores[j] ? "★ " : "") + fmt(p))),
        h("td", {}, h("button", { type:"button", "aria-label":u.quitar, title:u.quitar, onclick:() => { st.vidas.splice(i, 1); pintarComp(); } }, "×"))))
        : [h("tr", {}, h("td", { colspan:T.length + 2, class:"fel-d fel-vacio" }, u.vacio))])));
  }

  /* ---------- montaje ---------- */
  return function(b){
    box = b;
    const u = U();
    if(!st.mia) st.mia = Object.assign(clon(J().teorias[0]), { id:"mia" }, J().mia);
    box.innerHTML = '<div class="ari-wrap fel">' + ariModoBar() + '</div>';
    const wrap = box.firstChild;
    const sec = (id, t, ...kids) => h("section", { class:"fel-mesa", id, "aria-labelledby":id + "-t" }, h("h2", { id:id + "-t" }, t), ...kids);
    wrap.append(
      h("p", { class:"fel-lede" }, u.lede),
      h("p", { class:"fel-aviso neutro" }, u.aviso),
      sec("fel-m-vivir", u.t1,
        h("div", { class:"fel-fila" }, h("label", { class:"fel-d", for:"fel-pj" }, u.personaje), h("select", { class:"fel-sel", id:"fel-pj" }, ...JUEGO_ARIS.chars.map(c => h("option", { value:c.id }, c.name + " (" + c.orient.toLowerCase() + ")")))),
        h("p", { class:"fel-perfil", id:"fel-perfil" }),
        h("div", { class:"fel-fila" }, h("button", { type:"button", class:"fel-b prim", onclick:jugar }, u.jugarYo), h("span", { class:"fel-d" }, u.o),
          h("button", { type:"button", class:"fel-b", onclick:auto }, u.auto), h("label", { class:"fel-d", for:"fel-estilo" }, u.conEstilo),
          h("select", { class:"fel-sel", id:"fel-estilo" }, ...J().estilos.map(e => h("option", { value:e.id }, e.nombre)))),
        h("div", { class:"fel-stats", id:"fel-stats", "aria-live":"polite" }),
        h("div", { id:"fel-juego" })),
      sec("fel-m-tray", u.t2, h("p", { class:"fel-d" }, u.t2d), h("div", { class:"fel-mult", id:"fel-mult" }), h("p", { class:"fel-tip", id:"fel-tip", "aria-live":"polite" })),
      sec("fel-m-pesos", u.t3, h("p", { class:"fel-d", id:"fel-juego-dice" }), h("div", { class:"fel-veredictos", id:"fel-ver", role:"list" }), h("div", { id:"fel-teoria" })),
      sec("fel-m-comp", u.t4, h("p", { class:"fel-d" }, u.t4d),
        h("div", { class:"fel-fila" }, h("button", { type:"button", class:"fel-b", id:"fel-guardar", disabled:true, onclick:ev => { if(st.V && st.V.final){ guardar(st.V); ev.target.disabled = true; } } }, u.guardar),
          h("button", { type:"button", class:"fel-b", onclick:() => { for(let i = 0; i < 10; i++){ const c = JUEGO_ARIS.chars[Math.floor(Math.random() * JUEGO_ARIS.chars.length)], e = J().estilos[Math.floor(Math.random() * 4)]; const V = FEL.automatica(c.id, e.id); V.final = ariEFinal(V.S); guardar(V); } } }, u.diez),
          h("button", { type:"button", class:"fel-b", onclick:() => { st.vidas = []; pintarComp(); } }, u.vaciar)),
        h("div", { class:"fel-tscroll" }, h("table", { class:"fel-comp", id:"fel-comp" })),
        h("details", { class:"fel-saber" }, h("summary", {}, u.paraPensar), h("ol", {}, ...J().preguntas.map(p => h("li", {}, p))))));
    ariModoWire(box);
    q("#fel-m-tray").hidden = true; q("#fel-m-pesos").hidden = true;
    q("#fel-pj").addEventListener("change", () => { pintarPerfil(); if(!st.V || st.V.final){ st.V = null; pintarStats(); } });
    if(st.V){   // volver a la mesa: se conserva la última vida
      q("#fel-pj").value = st.V.S.char.id; pintarPerfil(); pintarStats(); pintarComp();
      if(st.V.final) terminar(); else if(st.respondida) siguienteManual(); else { pintarTray(); pintarDilema(st.V.S.cur); }
      return;
    }
    // abre con un ejemplo vivido para que se vea qué hace la mesa
    q("#fel-pj").value = "alcibiades"; q("#fel-estilo").value = "ambicioso";
    pintarPerfil(); pintarComp(); auto();
  };
})();

/* ---------- init ---------- */
function initAri(){ if(typeof JUEGO_ARIS === "undefined") return; renderAriStart(); }
if(typeof document !== "undefined" && document.addEventListener){
  document.addEventListener("DOMContentLoaded", initAri);
  (function(){ const nav = document.getElementById("tabs"); if(nav) nav.addEventListener("click", e => { const b = e.target.closest("button"); if(b && b.dataset.view === "eudaimonia") renderAriStart(); }); })();
}
