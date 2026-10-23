"use strict";
/* ===== La República ===== juego de diseño de la ciudad de Platón (v4) =====
   Diseñas una ciudad con perfiles (+/−). Cada persona tiene TRES VIRTUDES del alma:
   Sabiduría (sophía, SJ 🦉; antes «sabiduría-justicia»: desde el 21-10 la justicia de la ciudad es el equilibrio de las tres funciones, Rep. IV 433b-c), Valentía (V 🛡️) y Templanza (T 🍷). Coste = suma de las 3.
     · Guardián: las tres virtudes ≥4  (444 → máx. 555)
     · Guerrero: valentía y templanza ≥4  (x44 → máx. 355)
     · Productor: templanza ≥4  (xx4 → máx. 335)
   La PRODUCCIÓN 🌾 NO es una virtud: es un stat DE LA CIUDAD. Solo la generan los
   productores (cada uno alimenta a 2 personas) y debe cubrir a toda la población.
   Luego, tantos turnos como cartas del mazo (Real 8 / Fácil 7), fundados en
   Platón/Aristóteles, con penalizaciones graduadas y ULTRAEXIGENTES (un diseño
   casi perfecto también cae), eventos positivos, eventos que MATAN ciudadanos,
   penalización creciente a las ciudades de menos de 30 habitantes y CARTAS DEL
   DESTINO (peste, guerra, terremoto, muerte del fundador): sucesos inevitables
   que golpean a cualquier ciudad — la fortuna/necesidad que ni la polis justa
   evita. El mazo siempre incluye varias (Real 3 / Fácil 2). Las acciones son
   la tabla de salvación de quien diseñó mal. */

const REP_ARM0 = 10, REP_START = 10, REP_TARGET = 30;   // armonía: empieza en 10 (referencia de la barra); NO tiene techo, puede subir por encima
const REP_FATE = ["peste","guerra","terremoto","fundador"];   // cartas del destino (daño inevitable)
const REP_AP0 = 6;
const REP_OUT = 2;   // cada productor alimenta (produce para) 2 personas
const REP_MODES = {
  facil: { name:"سهل", budget:265, ratio:false, deck:7 },
  real:  { name:"واقعي",  budget:225, ratio:true,  deck:8 }
};
const REP_ROSTER = {
  Z: [ { id:"z_recto", name:"حرّاس مستقيمون", sj:4,v:4,t:4, note:"الفضائل الثلاث في حدها الأدنى" },
       { id:"z_sabio", name:"حرّاس حكماء", sj:5,v:4,t:4, note:"حكمة أكثر" },
       { id:"z_pleno", name:"حرّاس كاملون", sj:5,v:5,t:5, note:"أقصى فضيلة" } ],
  G: [ { id:"g_tropa", name:"محاربون", sj:1,v:4,t:4, note:"الأساسيات" },
       { id:"g_vet", name:"قدامى المحاربين", sj:2,v:5,t:4, note:"ذوو خبرة" },
       { id:"g_heroe", name:"أبطال", sj:3,v:5,t:5, note:"الأفضل" } ],
  E: [ { id:"labriego", name:"فلاحون", sj:1,v:1,t:4, note:"الشعب العامل" },
       { id:"diligente", name:"منتجون مجتهدون", sj:2,v:2,t:5, note:"معتدلون وكادحون" } ]
};
const REP_IMG = "media/juegos/platon/";
/* (20-10, tanda 2) dos versiones: A «degen» (Rep. VIII-X) y B «clases» (Rep. II-IV). La web usa estos valores;
   REP_AP0, REP_MODES y REP_ACTS se quedan como están porque los lee la versión impresa (tools/cartas_juegos.js). */
const REP_V2 = { ap0:8, apTurno:1, apFase:2, maxActs:3, deck:{ facil:12, real:14 }, dlgTurns:[1,4,7,10], justicia:0.5 };   // justicia: armonía por turno con las tres funciones (21-10)
const REP_JUEGO_KEY = "aula-republica-juego";
const REP_EV_V = { golpe:"a", victoria:"a", delos:"a", esparta:"a", pericles:"a", timocracia:"a",
  caverna:"b", hambruna:"b", reforma:"b", cosecha:"b" };   // el resto, en las dos
const REP_DLG_V = { trasimaco:"a", giges:"a", poetas:"a", filosofo:"a", metales:"b", comunidad:"b", adimanto:"b", caverna:"b" };
const REP_ACT_V = { moviliza:"ab", heroismo:"a", educacion:"ab", cosecha:"ab", purga:"a" };   // cartas antiguas por versión
function repZsj(x){ const Z=rep.t.Z; if(!Z.n) return; Z.sj=Math.max(Z.n, Z.sj+x*Z.n); Z.max=Math.max(1,Math.min(5,Z.max+x)); if(x<0) Z.just=0; else if(Z.max>=5) Z.just=Z.n; }
function repArm(x){ rep.armonia=Math.round((rep.armonia+x)*10)/10; }
const REP_ACT_RUN = {
  censura:()=>repZsj(1), limite:()=>repArm(1), sorteo:()=>{ rep.ap+=2; repArm(-1); },
  escolta:()=>{ repArm(2); rep.t.escolta=true; }, consejo:()=>repArm(2), zanganos:()=>repArm(1),
  oficio:()=>{ rep.t.prodBonus=(rep.t.prodBonus||0)+6; }, musica:()=>repZsj(1), lana:()=>{ rep.t.hero=true; },
  pruebas:()=>{ rep.t.Z.just=rep.t.Z.n; }, comun:()=>repArm(2), mito:()=>repArm(1),
  rey:()=>{ if(rep.t.Z.max>=5) repArm(3); }, bajar:()=>{ repArm(2); repZsj(-1); }
};
const REP_ACT_OK = { lana:()=>!rep.t.hero, rey:()=>rep.t.Z.n>0 };
function repV(){ return rep.juego==="clases" ? "b" : "a"; }
function repActsFor(all){
  const v=repV(), D=repD(), M=repMazo(), mz=(M&&M.acciones||[]);   // el mazo ya es de su versión: no se mira «v», que pasa por la traducción
  const ids=new Set(mz.map(a=>a.id));
  const old=REP_ACTS.filter(a=>(REP_ACT_V[a.id]||"ab").includes(v));
  const t2=(D&&D.acciones||[]).filter(a=>a.v===v && !ids.has(a.id)).map(a=>Object.assign({}, a, { run:REP_ACT_RUN[a.id], ok:REP_ACT_OK[a.id] }));
  const t3=mz.map(a=>Object.assign({}, a, { src:a.src||a.loc, run:()=>repApplyEf(a.ef), ok:()=>repCond(a.req) }));
  const L=old.concat(t2, t3);
  return all ? L : L.filter(a=>a.fase==null || rep.fase<0 || a.fase<=rep.fase); }
function repFases(){ const D=repD(); return (rep.juego==="clases" && D && D.fases) ? D.fases : []; }
function repFaseIdx(turn){ const F=repFases(); if(!F.length) return -1; return Math.min(F.length-1, Math.floor(turn*F.length/rep.turns)); }
function repFunc(){   // Versión B: las cuatro funciones de la ciudad
  const Z=rep.t.Z, sophia=Z.max>=5 && Z.n>0, andreia=repNGeff()>=rep.t.E.n/2.5 && rep.t.G.n>0, sophrosyne=repProd()>=repPop();
  return { sophia, andreia, sophrosyne, dikaiosyne: sophia&&andreia&&sophrosyne }; }
const REP_ACTS = [
  { id:"moviliza", name:"التعبئة", ap:2, img:"ac-agoge", d:"يُدرَّب منتج ليصير محاربًا.", ok:()=>rep.t.E.n>1,
    run:()=>{ repMove("E","G",1); } },
  { id:"heroismo", name:"البطولة", ap:1, img:"ac-heroismo", d:"في هذا الدور، تُحتسب قيمة المحاربين ×1,5.", ok:()=>!rep.t.hero, run:()=>{ rep.t.hero=true; } },
  { id:"educacion", name:"إصلاح التعليم", ap:1, img:"ac-ejemplo", d:"يكسب الحرّاس حكمةً (+3) ويُعَدّون مكتملي التكوين.", run:()=>{ rep.t.Z.sj+=3; if(rep.t.Z.max<5)rep.t.Z.max=5; rep.t.Z.just=rep.t.Z.n; } },
  { id:"cosecha", name:"دعم الإنتاج", ap:1, img:"ac-vida", d:"تنتج المدينة غذاءً أكثر (+8 إنتاج).", run:()=>{ rep.t.prodBonus=(rep.t.prodBonus||0)+8; } },
  { id:"purga", name:"تطهير الفاسدين", ap:2, img:"ac-politica", d:"تستعيدون نقطة انسجام واحدة.", run:()=>{ rep.armonia=Math.round((rep.armonia+1)*10)/10; } }
];

const rep = repFresh();
function repFresh(){ return { mode:"real", acciones:"si", cnt:{}, armonia:REP_START, turn:0, turns:8, deck:[], resolved:false, nZ:0,nG:0,nE:0, t:null, ap:0, apTurn:0, used:new Set(), log:[], turnActs:[], designText:"",
  reg:0, regLog:[], dlgPlan:{}, dlgDone:{}, posturas:[], juego:repJuegoLoad(), erChoice:null, fase:-1, flags:new Set(), dura:[], escudo:{}, dlgUsed:new Set(), pend:[] }; }
var repJuegoMem=null;   // (var: repFresh() se llama antes de esta línea) respaldo en memoria si el navegador no deja guardar
function repJuegoLoad(){ let j=null; try{ j=store.get(REP_JUEGO_KEY,null); }catch(e){} return (j==="degen"||j==="clases")?j:repJuegoMem; }
function repJuegoSave(j){ repJuegoMem=j; try{ store.set(REP_JUEGO_KEY,j); }catch(e){} }   // (20-10) régimen del libro VIII y diálogos (republica_dialogos.js)
/* ---------- (20-10) degeneración del libro VIII y diálogos de la República ---------- */
const REP_DLG_TURNS = [1,3,5];   // índices de turno antes de los que sale un diálogo (2.º, 4.º y 6.º)
function repD(){ return (typeof REP_DIAL!=="undefined") ? REP_DIAL : null; }
function repMd(s){ return String(s||"").replace(/\*([^*]+)\*/g,"<em>$1</em>"); }
function repRegFor(a){ const R=repD().regimenes; let i=0; while(i<R.length-1 && a<R[i].min) i++; return i; }
function repUpdReg(){   // la ciudad solo baja de régimen, nunca sube (546a: «todo lo que nace se corrompe»)
  if(!repD() || rep.juego==="clases") return false;   // (20-10) la degeneración es solo de la Versión A
  const n=Math.max(rep.reg, (rep.armonia<=0||repPop()<3) ? repD().regimenes.length-1 : repRegFor(rep.armonia));
  if(n>rep.reg){ rep.regLog.push({ n:rep.turn+1, from:rep.reg, to:n }); rep.reg=n; return true; } return false; }
function repGloName(id){ try{ const g=(typeof GLOSARIO!=="undefined") && GLOSARIO.find(x=>x.id===id); return g ? g.t : null; }catch(e){ return null; } }
function repGloLinks(ids, temas){ const L=(ids||[]).map(id=>({ id, t:repGloName(id) })).filter(x=>x.t);
  return repTemaLinks(temas) + (L.length ? '<p class="rep-glo">📖 '+L.map(x=>'<a href="#glosario/'+x.id+'">'+x.t+'</a>').join(" · ")+'</p>' : ""); }
/* (21-10) enlaces a la teoría: el tema de Platón (hf-platon) y el de política clásica (hf-politica); el título sale de THEORY, ya traducido */
const REP_TEMA_PLATON = "hf-platon", REP_TEMA_POLITICA = "hf-politica";
function repTemaLinks(keys){ let TH=null; try{ TH=(typeof THEORY!=="undefined")?THEORY:null; }catch(e){} if(!TH) return "";
  const L=(keys||[]).filter(k=>TH[k]&&TH[k].title); return L.length ? '<p class="rep-glo rep-tema">📘 '+L.map(k=>'<a href="#teoria/'+k+'">'+TH[k].title+'</a>').join(" · ")+'</p>' : ""; }
function repLadder(){ const D=repD(); if(!D) return ""; if(rep.juego==="clases") return repFuncBar(); const FB=repFuncBar();
  return '<div class="rep-ladder" role="list" aria-label="'+D.ui.regTitulo+'"><span class="rep-ladder-h">'+D.ui.hudReg+'</span>'+D.regimenes.map((r,i)=>
    '<span role="listitem" class="rep-lr'+(i===rep.reg?' on':'')+(i<rep.reg?' past':'')+'" title="'+r.lema+'">'+r.emoji+' '+r.name+'</span>').join('<i aria-hidden="true">›</i>')+'</div>'+FB; }
function repFuncBar(){ const D=repD(); if(!D||!rep.t) return ""; const f=repFunc(), F=repFases(), fi=repFaseIdx(Math.min(rep.turn,rep.turns-1));
  return '<div class="rep-ladder rep-funcs" role="list" aria-label="'+D.ui.funciones+'">'+(fi>=0?'<span class="rep-ladder-h">'+D.ui.fase+': <b>'+F[fi].name+'</b></span>':'')+
    D.funciones.map(x=>'<span role="listitem" class="rep-lr'+(f[x.k]?' on':'')+'" title="'+(f[x.k]?x.ok:x.no)+'">'+x.emoji+' '+x.name+(f[x.k]?' ✓':' ✗')+'</span>').join("")+'</div>'; }
function repHud(){
  return '<div class="rep-hud"><span class="stat">الدور <b>'+(Math.min(rep.turn+1,rep.turns))+'</b>/'+rep.turns+'</span>'+
      '<span class="stat" title="تبدؤون من 10، لكن لا يوجد سقف: يمكنكم أن تتجاوزوه.">⚖️ الانسجام <b id="repArm">'+repFmt(rep.armonia)+'</b></span>'+
      (rep.acciones==="si"?'<span class="stat">🔧 AP <b id="repAp">'+rep.ap+'</b></span>':'')+'</div>'+
    '<div class="rep-arm'+(rep.armonia<=4?' low':'')+(rep.armonia>REP_ARM0?' over':'')+'"><i style="width:'+Math.min(100,Math.max(0,rep.armonia/REP_ARM0*100))+'%"></i></div>'+
    repLadder(); }
const REP_REQ_OLD = new Set(["sabios","justos","ejercito"]);
function repReq(k){ const Z=rep.t.Z;
  if(k==="sabios") return Z.max>=5;
  if(k==="justos") return Z.n>0 && Z.just>=Z.n/2;
  if(k==="ejercito") return rep.t.G.n>=2*Z.n;
  return false; }
/* (20-10, tanda 3) intérprete de los mazos de datos (republica_mazo_a.js / _b.js): condiciones y efectos declarativos */
function repMazo(){ const v=repV(); try{ return v==="b" ? (typeof REP_MAZO_B!=="undefined"?REP_MAZO_B:null) : (typeof REP_MAZO_A!=="undefined"?REP_MAZO_A:null); }catch(e){ return null; } }
function repCond(req){ if(!req) return true; req=String(req).trim(); if(req[0]==="!") return !repCond(req.slice(1));
  const t=rep.t; if(!t) return false; const Z=t.Z;
  if(req.indexOf("flag:")===0) return !!(rep.flags && rep.flags.has(req.slice(5)));
  if(req.indexOf("reg>=")===0) return rep.reg>=(+req.slice(5)||0);
  switch(req){
    case "sabios": return Z.max>=5 && Z.n>0;
    case "justos": return Z.n>0 && Z.just>=Z.n/2;
    case "ejercito": return t.G.n>=2*Z.n;
    case "defensa": return repNGeff()>=t.E.n/2.5 && t.G.n>0;
    case "alimenta": return repProd()>=repPop();
    case "mayoriaE": return t.E.n>=0.6*repPop();
    case "equilibrio": return repCond("sabios") && repCond("defensa") && repCond("alimenta");
    case "pequena": return repPop()<REP_TARGET;
    case "semilla": return !!t.escolta;
  } return false; }
function repTEf(ef){   // efectos sobre rep.t (seguros en la previsualización, que restaura rep.t)
  const t=rep.t;
  if(ef.prod) t.prodBonus=(t.prodBonus||0)+ef.prod;
  if(ef.zsj && t.Z.n>0){ const Z=t.Z; Z.sj=Math.max(Z.n, Z.sj+ef.zsj*Z.n); Z.max=Math.max(1,Math.min(5,Z.max+ef.zsj)); if(ef.zsj<0) Z.just=0; else if(Z.max>=5) Z.just=Z.n; }
  if(ef.gv && t.G.n>0) t.G.v+=ef.gv*t.G.n;
  if(ef.et && t.E.n>0) t.E.t+=ef.et*t.E.n;
  if(Array.isArray(ef.mov)){ const [a,b,n]=ef.mov; if(t[a] && t[b] && t[a].n>n) repMove(a,b,n); }
  if(Array.isArray(ef.kill)){ const [c,n]=ef.kill; if(t[c]) repKill(c,n); }
  if(ef.hero) t.hero=true;
  if(ef.just) t.Z.just=t.Z.n;
  if(ef.escolta) t.escolta=true; }
function repApplyEf(ef){ ef=ef||{};
  if(ef.arm) rep.armonia=Math.round((rep.armonia+ef.arm)*10)/10;
  if(ef.ap && rep.acciones==="si") rep.ap=Math.max(0,rep.ap+ef.ap);
  if(ef.sj && rep.t.Z.n>0){ const Z=rep.t.Z; Z.sj=Math.max(Z.n, Z.sj+ef.sj*Z.n); Z.max=Math.max(1,Math.min(5,Z.max+ef.sj));
    if(ef.sj<0) Z.just=0; else if(Z.max>=5) Z.just=Z.n; }
  if(typeof ef.mov==="number" && rep.t.E.n>ef.mov) repMove("E","G",ef.mov);
  repTEf(Object.assign({}, ef, { mov:Array.isArray(ef.mov)?ef.mov:null }));
  if(ef.dura) (rep.dura=rep.dura||[]).push({ k:ef.dura.k, n:ef.dura.n||0, left:ef.dura.turnos||1 });
  if(ef.escudo) (ef.escudo.tags||ef.escudo.ev||[]).forEach(id=>{ (rep.escudo=rep.escudo||{})[id]=ef.escudo.turnos||1; });
  if(ef.si && repCond(ef.si.req)) repApplyEf(ef.si.ef||{}); }
function repMazoEvento(e){   // convierte un evento de datos en evento del motor (effect devuelve {d,msg})
  return { id:e.id, name:e.name, src:e.loc||e.src||"", img:e.img||"", threat:e.threat||"", data:e,
    effect:()=>{ const ok=repCond(e.req), br=(ok?e.si:e.no)||{}, ef=br.ef||{}; repTEf(ef); if(ef.si && repCond(ef.si.req)) repTEf(ef.si.ef||{});
      return { d:(ef.arm||0)+((ef.si&&repCond(ef.si.req)&&ef.si.ef&&ef.si.ef.arm)||0), msg:br.msg||"" }; } }; }
function repEvAll(){ const M=repMazo(); return REP_EVENTS.concat(M&&M.eventos ? M.eventos.filter(e=>!e.elige).map(repMazoEvento) : []); }
function repEvFind(id){ return repEvAll().find(e=>e.id===id); }
function repEnded(){ return rep.turn>=rep.turns || rep.armonia<=0 || repPop()<3; }
function repRenderDialog(d){
  const U=repD().ui;
  repBox().innerHTML='<div class="rep-wrap">'+repHud()+'<div class="rep-dialog reveal">'+
    '<div class="rep-dl-h"><span class="rep-dl-ic" aria-hidden="true">'+d.emoji+'</span><div><span class="rep-ev-tag">'+U.dialogo+' · '+d.loc+'</span><h3>'+d.quien+'</h3></div></div>'+
    '<p class="rep-dl-sit">'+repMd(d.situacion)+'</p>'+
    '<blockquote class="rep-dl-cita">'+repMd(d.cita)+' <cite>'+d.loc+'</cite></blockquote>'+
    (d.griego?'<p class="rep-dl-gr">'+repMd(d.griego)+'</p>':'')+
    '<p class="rep-dl-q"><b>'+repMd(d.pregunta)+'</b> '+U.elige+'</p>'+
    '<div class="rep-dl-opts">'+d.opts.map((o,i)=>'<button class="rep-dl-opt" data-dopt="'+i+'"><b>'+repMd(o.t)+'</b><span>'+U.porque+': '+repMd(o.razon)+'</span></button>').join("")+'</div>'+
    '<p class="rep-dl-note">'+U.abierto+'</p></div></div>';
  repBox().querySelectorAll("[data-dopt]").forEach(b=>b.addEventListener("click",()=>repChooseDialog(d,+b.dataset.dopt)));
}
function repChooseDialog(d,i){
  if(rep.dlgDone[rep.turn]) return; rep.dlgDone[rep.turn]=true;
  const U=repD().ui, o=d.opts[i], br=o.req ? ((REP_REQ_OLD.has(o.req)?repReq(o.req):repCond(o.req))?o.si:o.no) : o, before=rep.armonia;
  (rep.flags=rep.flags||new Set()).add(d.id+"_"+i);
  repApplyEf(br.ef);
  rep.posturas.push({ n:rep.turn+1, id:d.id, quien:d.quien, loc:d.loc, cita:d.cita, t:o.t, razon:o.razon, r:br.r, platon:d.platon, critica:d.critica, glo:d.glo||[], before, after:rep.armonia });
  const prev=rep.reg; repUpdReg();
  const s=rep.armonia-before, cls=s<0?"bad":s>0?"good":"ok";
  repBox().innerHTML='<div class="rep-wrap">'+repHud()+'<div class="rep-dialog">'+
    '<div class="rep-dl-h"><span class="rep-dl-ic" aria-hidden="true">'+d.emoji+'</span><div><span class="rep-ev-tag">'+U.dialogo+' · '+d.loc+'</span><h3>'+d.quien+'</h3></div></div>'+
    '<div class="rep-dl-chosen"><b>'+repMd(o.t)+'</b><span>'+U.porque+': '+repMd(o.razon)+'</span></div>'+
    '<div class="rep-dl-sec"><span class="rep-ev-tag">'+U.resultado+'</span><div class="rep-status '+cls+'">'+repMd(br.r)+'</div></div>'+
    '<div class="rep-dl-sec"><span class="rep-ev-tag">'+U.responde+'</span><blockquote class="rep-dl-cita">'+repMd(d.platon.txt)+' <cite>'+d.platon.loc+'</cite></blockquote></div>'+
    '<div class="rep-dl-sec"><span class="rep-ev-tag">'+U.objeta+' · '+d.critica.autor+'</span><blockquote class="rep-dl-cita crit">'+repMd(d.critica.txt)+' <cite>'+d.critica.loc+'</cite></blockquote></div>'+
    repGloLinks(d.glo, [REP_TEMA_PLATON])+
    '<div class="rep-resolve"><button id="repNext">'+U.seguir+'</button></div></div></div>';
  document.getElementById("repNext").addEventListener("click",()=>{
    if(repEnded()) repResult(); else if(rep.reg>prev) repRenderDegen(prev); else repRenderTurn(); });
}
function repRenderDegen(from){
  const D=repD(), U=D.ui, steps=D.regimenes.slice(from+1, rep.reg+1);
  repBox().innerHTML='<div class="rep-wrap">'+repHud()+'<div class="rep-degen reveal"><span class="rep-ev-tag fate">'+U.degenera+'</span>'+
    steps.map(r=>'<div class="rep-degen-step"><h3>'+r.emoji+' '+r.name+'</h3><p class="rep-dl-sit"><b>'+r.lema+'</b> '+repMd(r.causa)+'</p>'+
      '<blockquote class="rep-dl-cita">'+r.cita+' <cite>'+r.loc+'</cite></blockquote>'+repGloLinks(r.glo, [REP_TEMA_POLITICA, REP_TEMA_PLATON])+'</div>').join("")+
    '<div class="rep-resolve"><button id="repNext">'+U.seguir+'</button></div></div></div>';
  document.getElementById("repNext").addEventListener("click",()=>{ if(repEnded()) repResult(); else repRenderTurn(); });
}
function repBox(){ return document.getElementById("repbox"); }
function cost(c){ return c.sj+c.v+c.t; }
function repShuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// ---- estado de la ciudad diseñada ----
function repCompute(){
  const cls={}; let pts=0;
  ["Z","G","E"].forEach(k=>{ let n=0,sj=0,v=0,t=0,max=0,just=0;
    REP_ROSTER[k].forEach(c=>{ const q=rep.cnt[c.id]||0; if(q){ n+=q; pts+=cost(c)*q; sj+=c.sj*q; v+=c.v*q; t+=c.t*q; max=Math.max(max,c.sj); if(c.sj>=5)just+=q; } });
    cls[k]={n,sj,v,t,max,just}; });
  rep.nZ=cls.Z.n; rep.nG=cls.G.n; rep.nE=cls.E.n; rep._cls=cls;
  const pop=cls.Z.n+cls.G.n+cls.E.n, prod=REP_OUT*cls.E.n;
  return { nZ:cls.Z.n, nG:cls.G.n, nE:cls.E.n, pop, pts, prod };
}
function repLegal(){
  const s=repCompute(); const m=REP_MODES[rep.mode]; const errs=[];
  if(s.nZ<1||s.nG<1||s.nE<1) errs.push("يجب أن يوجد حارس واحد ومحارب واحد ومنتج واحد على الأقل.");
  if(s.pts>m.budget) errs.push("تجاوزتم الميزانية ("+s.pts+"/"+m.budget+" نقطة).");
  if(m.ratio && s.nE < 2*(s.nZ+s.nG)) errs.push("قاعدة أفلاطون: يجب أن يكون المنتجون ("+s.nE+") ≥ 2×(الحرّاس+المحاربين) = "+2*(s.nZ+s.nG)+".");
  return { ok:errs.length===0, errs, s };
}

// ---- durante la partida: totales derivados y muertes ----
function T(){ return rep.t; }
function repPop(){ return rep.t.Z.n+rep.t.G.n+rep.t.E.n; }
function repNGeff(){ return rep.t.hero ? rep.t.G.n*1.5 : rep.t.G.n; }
function repSum(stat){ return rep.t.Z[stat]+rep.t.G[stat]+rep.t.E[stat]; }
function repProd(){ return REP_OUT*rep.t.E.n + (rep.t.prodBonus||0); }   // producción de la CIUDAD (solo productores)
function repKill(cls,n){ const c=rep.t[cls]; if(c.n<=0)return 0; const k=Math.min(n,c.n); const f=(c.n-k)/c.n;
  c.sj*=f; c.v*=f; c.t*=f; c.just=Math.round(c.just*f); c.n-=k; return k; }
function repMove(a,b,n){ const A=rep.t[a],B=rep.t[b]; if(A.n<n)return; const proto=REP_ROSTER[b][0];
  const fa=(A.n-n)/A.n; A.sj*=fa;A.v*=fa;A.t*=fa; A.n-=n;
  B.n+=n; B.sj+=proto.sj*n; B.v+=proto.v*n; B.t+=proto.t*n; }

/* ================= EVENTOS (v4) — d: cambio de armonía (± ); kill:{cls,n}; ================= */
const F=Math.floor;
const REP_EVENTS = [
  // — negativos graduados (Platón, República) —
  { id:"rebelion", name:"ثورة المنتجين", src:"Rep. IV", img:"ev-matxinada",
    threat:"عدد المنتجين أكبر من اللازم مقارنة بالمحاربين: X = (المنتجون − المحاربون) ÷ 4.",
    effect:()=>{ const x=F(Math.max(0,rep.t.E.n-rep.t.G.n)/4); return { d:-x, msg:x?("ثورة: −"+x):"عامة الناس تحت السيطرة." }; } },
  { id:"golpe", name:"انقلاب", src:"Rep. VIII", img:"ev-golpe",
    threat:"جيش يفوق الحكومة قوة بكثير ينفذ انقلابًا (فيقتل حارسًا).",
    effect:()=>{ if(repNGeff()>rep.t.Z.n*3){ const k=repKill("Z",1); return { d:-3, msg:"انقلاب! −3 ويموت "+k+" حارس." }; }
      if(rep.t.G.n>rep.t.Z.n*2) return { d:-1, msg:"توتر عسكري: −1." }; return { d:0, msg:"الجيش يحترم الحكومة." }; } },
  { id:"corrupcion", name:"الفساد", src:"Rep. I", img:"ev-corrupcion",
    threat:"تخسر نقطة واحدة عن كل حارس ليس عادلاً تماماً (الحكمة < 5).",
    effect:()=>{ const x=rep.t.Z.n-rep.t.Z.just; return { d:-x, msg:x?("−"+x+" بسبب حرّاس غير عادلين بما يكفي"):"كل حرّاسكم عادلون." }; } },
  { id:"caverna", name:"ظلال في الكهف", src:"Rep. VII, 514a-520d", img:"ev-sabiduria",   // (21-10) no castiga la ignorancia de la masa, sino que no haya filósofos que vuelvan a bajar (519c-520d)
    threat:"على الذين خرجوا من الكهف أن يعودوا إليه ليحكموا. فإن لم يكن بين الحرّاس من بلغ الحكمة التامة، حكم الذين لم يروا إلا الظلال.",
    effect:()=>{ return rep.t.Z.max>=5 && rep.t.Z.n>0 ? { d:1, msg:"يعود الذين رأوا النور ليحكموا: +1." } : { d:-2, msg:"لم يخرج أحد من الكهف: الظلال هي التي تحكم. −2." }; } },
  // — Aristóteles / muertes / tamaño —
  { id:"ataque", name:"هجوم خارجي", src:"Pol. VII", img:"ev-ataque",
    threat:"إذا كان المدافعون قلة (المحاربون < المنتجون ÷ 2,5)، يدخل العدو ويقتل.",
    effect:()=>{ if(repNGeff() < rep.t.E.n/2.5){ const k=repKill("G",F(rep.t.G.n/4))+repKill("E",F(rep.t.E.n/12)); return { d:-2, msg:"غزو: −2"+(k?" ويموت "+k+" مواطن.":".") }; } return { d:0, msg:"الدفاع صامد." }; } },
  { id:"peste", name:"الطاعون", src:"القدر", img:"ev-hambruna", fate:true,
    threat:"يفتك وباء بعامة الناس: فيقتل جزءًا من المنتجين والمحاربين.",
    effect:()=>{ const k=repKill("E",F(rep.t.E.n/5))+repKill("G",F(rep.t.G.n/8)); return { d:-2, msg:"الطاعون: −2 ويموت "+k+" مواطن." }; } },
  { id:"hambruna", name:"المجاعة", src:"Pol. I", img:"ev-hambruna",
    threat:"إذا لم يوجد هامش إنتاج مريح (الفائض < 10% من السكان)، يقع الجوع والموت.",
    effect:()=>{ const margin=repPop()*0.1, surplus=repProd()-repPop(); if(surplus<margin){ const x=F((margin-surplus)/3)||1, k=repKill("E",F(Math.max(0,-surplus)/6)); return { d:-x, msg:"الجوع: −"+x+(k?" ويموت "+k+" منتج.":".") }; } return { d:0, msg:"الإنتاج يغذي المدينة." }; } },
  { id:"menguada", name:"مدينة متقلصة", src:"Pol. I", img:"ev-ataque",
    threat:"المدينة الصغيرة لا تكفي نفسها: كلما قل السكان عن 30، ساءت الحال (÷2).",
    effect:()=>{ const x=F(Math.max(0,REP_TARGET-repPop())/2); return { d:-x, msg:x?("ضعف ("+repPop()+" ساكن): −"+x):"مدينة مكتفية ذاتيًا." }; } },
  // — positivos —
  { id:"alianza", name:"تحالف تجاري", src:"Rep. II, 371a-d", img:"ev-corrupcion",   // (21-10) los comerciantes y el mercado de la ciudad sana
    threat:"إذا كان المنتجون هم الأغلبية (≥60%)، تزدهر التجارة.",
    effect:()=>{ return rep.t.E.n >= 0.6*repPop() ? { d:2, msg:"تجارة مزدهرة: +2." } : { d:0, msg:"لا أغلبية منتجة." }; } },
  { id:"victoria", name:"نصر عسكري", src:"Rep. IV, 422a-d", img:"ev-golpe",   // (21-10) los «atletas de la guerra» frente a ciudades más ricas
    threat:"جيش قوي (المحاربون ≥ الحرّاس ×3) يربح حربًا.",
    effect:()=>{ return repNGeff() >= rep.t.Z.n*3 ? { d:1, msg:"نصر: +1." } : { d:0, msg:"لا قوة كافية للانتصار." }; } },
  { id:"reforma", name:"إصلاح عادل", src:"Rep.", img:"ev-sabiduria",
    threat:"إذا كان حرّاسك عادلين تماماً (متوسط الحكمة ≥ 5) استعدت الانسجام.",
    effect:()=>{ return (rep.t.Z.sj/Math.max(1,rep.t.Z.n))>=5 ? { d:2, msg:"حكم رشيد: +2." } : { d:0, msg:"تنقص العدالة الكاملة في القمة." }; } },
  { id:"cosecha", name:"موسم حصاد وفير", src:"—", img:"ev-hambruna",
    threat:"إذا أنتجت المدينة أكثر من حاجتها (الفائض ≥ 40% من السكان)، يعمّ الرخاء.",
    effect:()=>{ return (repProd()-repPop()) >= repPop()*0.4 ? { d:2, msg:"فائض: +2." } : { d:0, msg:"لا فائض يُذكر." }; } },
  // — Atenas y su historia (contexto de Platón y Aristóteles) —
  { id:"delos", name:"الحلف الديلي", src:"التاريخ", img:"ev-delos",
    threat:"مع أسطول قوي (المحاربون ≥ المنتجون ÷ 2,5)، يدفع الحلفاء الجزية؛ وإلا فإنهم يتمردون.",
    effect:()=>{ return repNGeff() >= rep.t.E.n/2.5 ? { d:2, msg:"جزية الحلفاء: +2." } : { d:-1, msg:"الحلفاء يتمردون: −1." }; } },
  { id:"esparta", name:"غزو إسبرطة", src:"حرب البيلوبونيز", img:"ev-esparta",
    threat:"تخرّب إسبرطة الحقول. إذا كان المدافعون قلة (المحاربون < المنتجون ÷ 3)، تقع مذبحة.",
    effect:()=>{ if(repNGeff() < rep.t.E.n/3){ const k=repKill("E",F(rep.t.E.n/8))+repKill("G",F(rep.t.G.n/6)); return { d:-3, msg:"دمار: −3 ويموت "+k+" مواطن." }; } return { d:-1, msg:"تصمدون خلف الأسوار: −1." }; } },
  { id:"socrates", name:"محاكمة سقراط", src:"الدفاع", img:"ev-socrates",
    threat:"تحاكم المدينة أحكم رجالها. ومن دون حارس بلغ الحكمة التامة (الحكمة 5) تُدينه.",
    effect:()=>{ return rep.t.Z.max>=5 ? { d:1, msg:"الحكمة تبرّئه: +1." } : { d:-2, msg:"يُدينون أحكم الناس: −2." }; } },
  { id:"pericles", name:"طموح بريكليس", src:"التاريخ", img:"ev-pericles",
    threat:"زعيم لامع يباشر أعمالًا عظيمة. مع حرّاس معتدلين (متوسط الاعتدال ≥4,5) يكون عصرًا ذهبيًا؛ وبلا اعتدال تقع الغطرسة (hybris).",
    effect:()=>{ const tavg=rep.t.Z.t/Math.max(1,rep.t.Z.n); return tavg>=4.5 ? { d:2, msg:"العصر الذهبي لبريكليس: +2." } : { d:-2, msg:"طموح مفرط (hybris): −2." }; } },
  { id:"sofistas", name:"صعود السفسطائيين", src:"Gorgias", img:"ev-sofistas",
    threat:"أساتذة البلاغة يستميلون الشباب. إذا كان أقل من ثلاثة أرباع حرّاسكم عادلين تمامًا، فإنهم ينتصرون.",
    effect:()=>{ return rep.t.Z.just >= rep.t.Z.n*0.75 ? { d:1, msg:"الفلاسفة يفنّدون حججهم: +1." } : { d:-2, msg:"النسبية تفسد: −2." }; } },
  { id:"timocracia", name:"حكم الشرف (التيموقراطية)", src:"Rep. VIII", img:"ev-timocracia",
    threat:"إذا تجاوز عدد المحاربين عدد الحرّاس بمقدار 1,5×، يحل الشرف محل العقل.",
    effect:()=>{ return rep.t.G.n > rep.t.Z.n*1.5 ? { d:-2, msg:"تنحدر المدينة إلى حكم الشرف (التيموقراطية): −2." } : { d:1, msg:"العقل ما زال في القيادة: +1." }; } },
  { id:"oraculo", name:"عرّافة مقلقة", src:"Delfos", img:"ev-oraculo",
    threat:"تنطق الكاهنة بيثيا بنبوءة غامضة. القدر، هذه المرة، لا يتوقف على مدينتكم.",
    effect:()=>{ return rep.rng<0.55 ? { d:-2, msg:"نذير شؤم: −2." } : { d:1, msg:"نذير خير: +1." }; } },
  // — CARTAS DEL DESTINO (inevitables: golpean a cualquier ciudad, se diseñe como se diseñe) —
  { id:"guerra", name:"حرب طويلة", src:"القدر", img:"ev-guerra", fate:true,
    threat:"لا تنجو مدينة من الحرب: فهي تستنزف المدينة وتكلف المحاربين أرواحهم.",
    effect:()=>{ const k=repKill("G",F(rep.t.G.n/8)); return { d:-2, msg:"الحرب تستنزف المدينة: −2"+(k?" ويسقط "+k+" محارب.":".") }; } },
  { id:"terremoto", name:"زلزال", src:"القدر", img:"ev-terremoto", fate:true,
    threat:"تهتز الأرض من دون إنذار: فتهدم وتقتل من دون تمييز بين الطبقات.",
    effect:()=>{ const k=repKill("E",F(rep.t.E.n/10))+repKill("Z",F(rep.t.Z.n/12)); return { d:-2, msg:"تنهار المدينة: −2"+(k?" ويموت "+k+" شخص.":".") }; } },
  { id:"fundador", name:"موت المؤسس", src:"القدر", img:"ev-fundador", fate:true,
    threat:"يموت مؤسس المدينة: ويفتح الخلاف على الخلافة أزمة لا ترحم أحدًا.",
    effect:()=>{ return { d:-2, msg:"أزمة الخلافة: −2." }; } }
];

/* ---------- setup ---------- */
function renderRepPick(){
  const box=repBox(); const D=repD(); if(!box||!D) return; const U=D.ui;
  box.innerHTML='<div class="rep-wrap"><h2 class="rep-pick-h">'+U.elegir+'</h2><p class="rep-dl-note">'+U.elegirIntro+'</p><div class="rep-pick">'+
    ["degen","clases"].map(k=>{ const V=D.versiones[k]; return '<button class="rep-pick-card'+(rep.juego===k?' on':'')+'" data-juego="'+k+'"><span class="rep-pick-ic" aria-hidden="true">'+V.emoji+'</span>'+
      '<span class="rep-ev-tag">'+V.eyebrow+' · '+V.libros+'</span><b>'+V.name+'</b><span class="rep-pick-lema">'+V.lema+'</span><span class="rep-pick-intro">'+V.intro+'</span><span class="rep-pick-go">'+U.jugarEsta+'</span></button>'; }).join("")+
    '</div><div class="rep-actions2"><button class="btn2" id="repChuleta">'+U.chuleta+'</button></div></div>';
  box.querySelectorAll("[data-juego]").forEach(b=>b.addEventListener("click",()=>{ repJuegoSave(b.dataset.juego); rep.juego=b.dataset.juego; renderRepStart(true); }));
  document.getElementById("repChuleta").addEventListener("click",renderRepChuleta);
}
function renderRepStart(force){
  const box=repBox(); if(!box) return; Object.assign(rep, repFresh());
  if(repD() && (!rep.juego || force===false)){ renderRepPick(); return; }
  const D=repD(), V=D?D.versiones[rep.juego]:null;
  box.innerHTML='<div class="rep-wrap">'+(V?'<div class="rep-vhead"><span class="rep-pick-ic" aria-hidden="true">'+V.emoji+'</span><div><span class="rep-ev-tag">'+V.eyebrow+' · '+V.libros+'</span><b>'+V.name+'</b><span class="rep-pick-lema">'+V.lema+'</span></div>'+
      '<span class="rep-vbtns"><button class="btn2" id="repCambiar">'+D.ui.cambiar+'</button><button class="btn2" id="repChuleta">'+D.ui.chuleta+'</button></span></div>'+(rep.juego==="clases"?'<p class="rep-dl-note rep-doxa">'+repMd(D.doxa)+'</p>':''):'')+
    '<div class="rep-modes-pick" id="repModes"></div>'+
    '<div class="rep-design"><div class="rep-roster" id="repRoster"></div><aside class="rep-summary" id="repSummary"></aside></div>'+
    '<p class="ia-note">رسوم مولَّدة بالذكاء الاصطناعي</p></div>';
  drawRepModes(); drawRepRoster(); drawRepSummary();
  const cb=document.getElementById("repCambiar"); if(cb) cb.addEventListener("click",()=>renderRepStart(false));
  const ch=document.getElementById("repChuleta"); if(ch) ch.addEventListener("click",renderRepChuleta);
}
function drawRepModes(){
  document.getElementById("repModes").innerHTML=
    '<span class="flabel">مستوى الصعوبة</span>'+Object.entries(REP_MODES).map(([k,m])=>'<button class="pbtn" data-mode="'+k+'" aria-pressed="'+(k===rep.mode)+'">'+m.name+'</button>').join("")+
    '<span class="flabel" style="margin-left:.8rem">الإجراءات</span><button class="pbtn" data-acc="si" aria-pressed="'+(rep.acciones==="si")+'">مع إجراءات</button><button class="pbtn" data-acc="لا" aria-pressed="'+(rep.acciones==="لا")+'">بدون إجراءات</button>'+
    '<button class="pbtn rep-rnd" id="repRandom">🎲 عشوائي</button>'+
    (repHistLoad().length?'<button class="pbtn rep-hist-open" id="repHistOpen">📚 الألعاب ('+repHistLoad().length+')</button>':'');
  document.querySelectorAll("#repModes [data-mode]").forEach(b=>b.addEventListener("click",()=>{ rep.mode=b.dataset.mode; drawRepModes(); drawRepSummary(); }));
  document.querySelectorAll("#repModes [data-acc]").forEach(b=>b.addEventListener("click",()=>{ rep.acciones=b.dataset.acc; drawRepModes(); }));
  const rnd=document.getElementById("repRandom"); if(rnd) rnd.addEventListener("click",repRandom);
  const ho=document.getElementById("repHistOpen"); if(ho) ho.addEventListener("click",renderRepHistory);
}
function statPips(c){ return '<span class="rep-pips">🦉'+c.sj+' 🛡️'+c.v+' 🍷'+c.t+' <em>· '+cost(c)+'</em></span>'; }
function drawRepRoster(){
  const sec=(title,list)=>'<div class="rep-rsec"><h3>'+title+'</h3>'+list.map(c=>{ const n=rep.cnt[c.id]||0;
    return '<div class="rep-rrow prod"><div class="rep-rname">'+c.name+' <span class="rep-note">'+c.note+'</span><br>'+statPips(c)+'</div>'+
      '<div class="rep-step"><button data-esub="'+c.id+'" aria-label="−1 '+c.name+'">−</button><span class="n">'+n+'</span><button data-eadd="'+c.id+'" aria-label="+1 '+c.name+'">+</button></div></div>'; }).join("")+'</div>';
  document.getElementById("repRoster").innerHTML =
    sec("🦉 الحراس <span class=\"rep-floor\">الفضائل الثلاث ≥4</span>",REP_ROSTER.Z)+
    sec("🛡️ المحاربون <span class=\"rep-floor\">الشجاعة والاعتدال ≥4</span>",REP_ROSTER.G)+
    sec("🌾 المنتجون <span class=\"rep-floor\">الاعتدال ≥4 · يُطعمون المدينة</span>",REP_ROSTER.E);
  if(repD() && rep.juego==="clases" && repD().ui.rosterB){ const H=document.querySelectorAll("#repRoster .rep-rsec h3"); repD().ui.rosterB.forEach((h,i)=>{ if(H[i]) H[i].innerHTML=repMd(h); }); }
  document.querySelectorAll("#repRoster [data-eadd]").forEach(b=>b.addEventListener("click",()=>{ const id=b.dataset.eadd; rep.cnt[id]=(rep.cnt[id]||0)+1; drawRepRoster(); drawRepSummary(); }));
  document.querySelectorAll("#repRoster [data-esub]").forEach(b=>b.addEventListener("click",()=>{ const id=b.dataset.esub; if(rep.cnt[id]>0){ rep.cnt[id]--; drawRepRoster(); drawRepSummary(); } }));
}
function drawRepSummary(){
  const { ok, errs, s }=repLegal(); const m=REP_MODES[rep.mode]; const fed=s.prod>=s.pop;
  document.getElementById("repSummary").innerHTML=
    '<div class="rep-sum-h">مدينتكم</div>'+
    '<div class="rep-sum-row"><span>السكان</span><b class="'+(s.pop>=REP_TARGET?"ok":"")+'">'+s.pop+(s.pop<REP_TARGET?' <small>(&lt;30: عقوبة)</small>':'')+'</b></div>'+
    '<div class="rep-sum-row"><span>النقاط</span><b class="'+(s.pts<=m.budget?"ok":"bad")+'">'+s.pts+' / '+m.budget+'</b></div>'+
    '<div class="rep-sum-classes"><span>🦉 '+s.nZ+'</span><span>🛡️ '+s.nG+'</span><span>🌾 '+s.nE+'</span></div>'+
    '<div class="rep-sum-row"><span>🌾 الإنتاج</span><b class="'+(fed?"ok":"bad")+'">'+s.prod+' <small>vs '+s.pop+' يأكلون</small></b></div>'+
    (m.ratio?'<div class="rep-sum-row"><span>النسبة</span><b class="'+(s.nE>=2*(s.nZ+s.nG)?"ok":"bad")+'">الإنتاج ≥ 2×النخبة</b></div>':'')+
    '<div class="rep-fate-note">🎴 انتبهوا: العالم قاسٍ. فإلى جانب الأحداث التي تعاقب التصميم السيئ (وهي الآن أشد)، تضم المجموعة <b>بطاقات القدر</b> —الطاعون، الحرب، الزلزال، موت المؤسس— وهي تضرب أي مدينة. حتى التصميم المثالي ليس في مأمن؛ و<b>الإجراءات</b> هي طوق نجاتكم.</div>'+
    (ok?'<button class="rep-play" id="repPlay">أسّسوا الجمهورية →</button>':'<ul class="rep-errs">'+errs.map(e=>'<li>'+e+'</li>').join("")+'</ul>');
  const p=document.getElementById("repPlay"); if(p) p.addEventListener("click",repStart);
}
function repRandom(){
  const m=REP_MODES[rep.mode], pick=arr=>arr[Math.floor(Math.random()*arr.length)];
  for(let a=0;a<200;a++){ rep.cnt={};
    [REP_ROSTER.Z,REP_ROSTER.G,REP_ROSTER.E].forEach(arr=>{ rep.cnt[pick(arr).id]=1; });
    for(let g=0;g<300;g++){ const s=repCompute(); if(s.pts>=m.budget-6) break;
      const r=Math.random(), cls=r<0.7?REP_ROSTER.E:(r<0.86?REP_ROSTER.G:REP_ROSTER.Z); const c=pick(cls);
      if(s.pts+cost(c)>m.budget) continue; rep.cnt[c.id]=(rep.cnt[c.id]||0)+1; }
    if(repLegal().ok){ drawRepRoster(); drawRepSummary(); return; } }
  rep.cnt={}; rep.cnt[REP_ROSTER.Z[0].id]=1; rep.cnt[REP_ROSTER.G[0].id]=1; rep.cnt[REP_ROSTER.E[0].id]=6;
  drawRepRoster(); drawRepSummary();
}

/* ---------- turnos ---------- */
function repStart(){
  const s0=repCompute(); const c=rep._cls; rep.armonia=REP_START; rep.turn=0; rep.ap=(rep.acciones==="si")?(repD()?REP_V2.ap0:REP_AP0):0;
  // crónica: instantánea del diseño inicial
  const parts=[]; ["Z","G","E"].forEach(k=>REP_ROSTER[k].forEach(p=>{ const q=rep.cnt[p.id]||0; if(q) parts.push(q+"× "+p.name); }));
  rep.designText=parts.join(", ")+" — "+s0.pop+" نسمة، "+s0.pts+" نقطة";
  rep.log=[];
  const n=repD()?REP_V2.deck[rep.mode]:REP_MODES[rep.mode].deck;   // (20-10) web: Real 14 · Fácil 12 (impresa: 8 · 7) — cada carta es un turno
  rep.turns=n;
  const nFate=(rep.mode==="real")?3:2;                                  // cartas del destino inevitables por partida
  const forced=repShuffle(REP_FATE).slice(0,nFate).concat("menguada");  // + «Ciudad menguada» siempre presente
  const forcedSet=new Set(forced);
  const M3=repD()?repMazo():null; rep.flags=new Set(); rep.dura=[]; rep.escudo={}; rep.dlgUsed=new Set(); rep.chainT=new Set();
  rep.pend=M3&&M3.eventos ? M3.eventos.filter(e=>e.aparece) : [];   // (tanda 3) eventos encadenados: entran cuando se cumple «aparece»
  const pool=REP_EVENTS.concat(M3&&M3.eventos?M3.eventos.filter(e=>!e.aparece&&!e.elige).map(repMazoEvento):[]).filter(e=>!forcedSet.has(e.id) && (!repD() || !REP_EV_V[e.id] || REP_EV_V[e.id]===repV())).map(e=>e.id);   // el resto: eventos condicionales de la versión
  const rest=repShuffle(pool).slice(0, Math.max(0, n-forced.length));
  rep.deck=repShuffle(rest.concat(forced));
  rep.t={ Z:Object.assign({},c.Z), G:Object.assign({},c.G), E:Object.assign({},c.E), hero:false, prodBonus:0 };
  rep.reg=0; rep.regLog=[]; rep.dlgPlan={}; rep.dlgDone={}; rep.posturas=[];
  if(repD()){ REP_V2.dlgTurns.forEach(tn=>{ if(tn<n) rep.dlgPlan[tn]="slot"; }); }   // (tanda 3) el diálogo se elige al llegar el turno (fase, aparece)
  rep.fase=repFaseIdx(0);
  repRenderTurn();
}
function repFmt(n){ n=Math.round(n*10)/10; return Number.isInteger(n)?n:n.toFixed(1); }
function repDlgBank(){ const D=repD(), M=repMazo(); if(!D) return [];
  return D.dialogos.filter(d=>!REP_DLG_V[d.id] || REP_DLG_V[d.id]===repV()).concat(M&&M.dialogos||[], (M&&M.eventos||[]).filter(e=>e.elige).map(e=>Object.assign({ id:e.id, aparece:e.aparece }, e.elige))); }
function repDlgPick(){ const ok=repDlgBank().filter(d=>!rep.dlgUsed.has(d.id) && (d.fase==null || rep.reg>=d.fase || repV()==="b") && repCond(d.aparece));
  const chained=ok.filter(d=>d.aparece); const pool=chained.length?chained:ok; return pool.length ? pool[Math.floor(Math.random()*pool.length)] : null; }
function repTurnStart(){   // una vez por turno: efectos que duran, escudos, eventos encadenados
  if(rep._started===rep.turn) return; rep._started=rep.turn;
  (rep.dura||[]).forEach(x=>{ if(x.left>0){ if(x.k==="arm") repArm(x.n); x.left--; } });
  if(rep.pend && rep.pend.length){ const ready=rep.pend.filter(e=>repCond(e.aparece)); ready.forEach(e=>{
      rep.pend=rep.pend.filter(x=>x!==e);
      if(e.elige){ if(!rep.dlgPlan[rep.turn]) rep.dlgPlan[rep.turn]=Object.assign({ id:e.id }, e.elige); }
      else { rep.chainT=rep.chainT||new Set();   // cada encadenado, en su propio hueco (el turno actual o el siguiente libre que no sea del destino)
        for(let k=rep.turn;k<rep.turns;k++){ const cur=repEvFind(rep.deck[k]); if(cur && !cur.fate && !rep.chainT.has(k)){ rep.deck[k]=e.id; rep.chainT.add(k); break; } } } }); }
  if(rep.dlgPlan[rep.turn]==="slot"){ const d=repDlgPick(); if(d){ rep.dlgPlan[rep.turn]=d; } else delete rep.dlgPlan[rep.turn]; }
  const dl=rep.dlgPlan[rep.turn]; if(dl && dl.id) rep.dlgUsed.add(dl.id); }
function repRenderTurn(){
  if(repD()) repTurnStart();
  const dl=rep.dlgPlan && rep.dlgPlan[rep.turn]; if(dl && dl!=="slot" && !rep.dlgDone[rep.turn]){ repRenderDialog(dl); return; }   // (20-10) antes del turno, el diálogo
  rep.resolved=false; rep.apTurn=0; rep.used=new Set(); rep.turnActs=[]; rep.t.hero=false;
  let faseMsg="";
  if(repD() && rep.acciones==="si" && rep.turn>0 && rep._apPaid!==rep.turn){ rep._apPaid=rep.turn; rep.ap+=REP_V2.apTurno;
    const fi=repFaseIdx(rep.turn); if(fi>rep.fase){ rep.fase=fi; rep.ap+=REP_V2.apFase; faseMsg=repFases()[fi]; } }
  else if(repD() && rep.turn>0){ const fi=repFaseIdx(rep.turn); if(fi>rep.fase){ rep.fase=fi; faseMsg=repFases()[fi]; } }
  rep.rng=Math.random();   // azar fijo del turno (oráculo): igual en previsualización y resolución
  const ev=repEvFind(rep.deck[rep.turn]);
  repBox().innerHTML='<div class="rep-wrap">'+
    '<div class="rep-hud"><span class="stat">الدور <b>'+(rep.turn+1)+'</b>/'+rep.turns+'</span>'+
      '<span class="stat" title="تبدؤون من 10، لكن لا يوجد سقف: يمكنكم أن تتجاوزوه.">⚖️ الانسجام <b id="repArm">'+repFmt(rep.armonia)+'</b></span>'+
      (rep.acciones==="si"?'<span class="stat">🔧 AP <b id="repAp">'+rep.ap+'</b></span>':'')+'</div>'+
    '<div class="rep-arm'+(rep.armonia<=4?' low':'')+(rep.armonia>REP_ARM0?' over':'')+'"><i style="width:'+Math.min(100,Math.max(0,rep.armonia/REP_ARM0*100))+'%"></i></div>'+repLadder()+
    '<div class="rep-classes" id="repClasses"></div>'+
    '<div class="rep-city" id="repCity"></div>'+
    (faseMsg?'<div class="rep-fase"><span class="rep-ev-tag">'+repD().ui.fase+' · '+faseMsg.name+(rep.acciones==="si"?' · '+repD().ui.nuevaFase:'')+'</span><p>'+faseMsg.lema+'</p></div>':'')+
    '<div class="rep-event reveal" id="repEvent"></div>'+
    (rep.acciones==="si"?'<div class="rep-actions-h">'+(repD()?repD().ui.accionesMax:'')+'</div><div class="rep-acts" id="repActs"></div>':'')+
    '<div class="rep-resolve"><button id="repResolve">واجهوا الحدث →</button></div></div>';
  repDrawTurn(ev);
  document.getElementById("repResolve").addEventListener("click",()=>repResolve(ev));
}
function repDrawTurn(ev){
  document.getElementById("repClasses").innerHTML=[
    { em:"🦉", l:"الحراس", c:rep.t.Z.n }, { em:"🛡️", l:"المحاربون", c:rep.t.G.n+(rep.t.hero?" ×1,5":"") }, { em:"🌾", l:"المنتجون", c:rep.t.E.n }
  ].map((x,i)=>(repD()&&repV()==="b"&&repD().ui.clasesB)?Object.assign(x,{ l:repD().ui.clasesB[i] }):x)
   .map(x=>'<div class="rep-class"><div class="c">'+x.em+' '+x.c+'</div><div class="l">'+x.l+'</div></div>').join("");
  // stat de CIUDAD: producción vs población
  const prod=repProd(), pop=repPop(), sur=prod-pop;
  const city=document.getElementById("repCity");
  if(city) city.innerHTML='<span class="rep-cstat">🌾 الإنتاج <b>'+prod+'</b></span>'+
    '<span class="rep-cstat">👥 يأكلون <b>'+pop+'</b></span>'+
    '<span class="rep-cstat rep-sur '+(sur<0?"bad":"ok")+'">'+(sur<0?"⚠ عجز ":"✓ فائض +")+Math.abs(sur)+'</span>';
  // previsualizar el efecto sin aplicarlo (clonando rep.t)
  const snap=JSON.parse(JSON.stringify(rep.t)); const pre=ev.effect(); rep.t=snap;
  const good=pre.d>0, bad=pre.d<0; const evb=document.getElementById("repEvent");
  evb.classList.toggle("danger",bad); evb.classList.toggle("safe",!bad);
  evb.innerHTML='<img class="rep-ev-img" src="'+REP_IMG+ev.img+'.jpg" alt="">'+
    '<div class="rep-ev-body"><span class="rep-ev-tag'+(ev.fate?' fate':'')+'">'+(ev.fate?'🎴 بطاقة القدر · لا مفرّ منها':'🃏 حدث الدور'+(ev.src&&ev.src!=="—"?' · '+ev.src:''))+'</span><h3>'+repMd(ev.name)+'</h3>'+
    '<div class="threat">'+repMd(ev.threat)+'</div>'+(/^(Rep\.|Rép\.|Errep\.|República|Republic|République|Errepublika|الجمهورية)/.test(String(ev.src||""))?repTemaLinks([REP_TEMA_PLATON]):"")+
    '<div class="rep-status '+(bad?"bad":good?"good":"ok")+'">'+(bad?"⚠ ":good?"✓ ":"• ")+repMd(pre.msg)+'</div></div>';
  if(rep.acciones==="si"){ const acts=document.getElementById("repActs");
    const MX=repD()?REP_V2.maxActs:2;
    acts.innerHTML=repActsFor().map(a=>{ const dis=rep.apTurn>=MX||rep.used.has(a.id)||rep.ap<a.ap||(a.ok&&!a.ok());
      return '<button class="rep-act" data-act="'+a.id+'"'+(dis?" disabled":"")+(a.src?' title="'+a.src+'"':'')+'>'+(a.img?'<span class="rep-act-art"><img src="'+REP_IMG+a.img+'.jpg" alt="" onerror="this.parentNode.remove()"></span>':'')+'<span class="rep-act-b"><b>'+repMd(a.name)+' <span class="ap">'+a.ap+' AP</span></b><span class="d">'+repMd(a.d)+'</span></span></button>'; }).join("");
    acts.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>repDoAct(b.dataset.act,ev))); }
}
function repDoAct(id,ev){ const a=repActsFor().find(x=>x.id===id); const MX=repD()?REP_V2.maxActs:2;
  if(!a||rep.apTurn>=MX||rep.used.has(id)||rep.ap<a.ap||(a.ok&&!a.ok())) return;
  a.run(); rep.ap-=a.ap; rep.apTurn++; rep.used.add(id); rep.turnActs.push(a.name); (rep.flags=rep.flags||new Set()).add(id);
  const ael=document.getElementById("repAp"); if(ael)ael.textContent=rep.ap;
  const arm=document.getElementById("repArm"); if(arm)arm.textContent=repFmt(rep.armonia);
  document.querySelector("#republica .rep-arm > i").style.width=Math.min(100,Math.max(0,rep.armonia/REP_ARM0*100))+"%";
  repDrawTurn(ev); }
function repResolve(ev){
  if(rep.resolved) return; rep.resolved=true;
  const before=rep.armonia;
  const r=ev.effect(); let dd=r.d; if(rep.t.escolta && repD()){ dd-=0.5; r.msg+=" "+repD().ui.escolta; }
  if(repD() && rep.t && repFunc().dikaiosyne){ dd+=REP_V2.justicia; r.msg+=" "+repD().ui.justiciaTurno; }   // (21-10) la justicia conserva a las demás virtudes (Rep. IV 433b-c)
  if(repD()){ if(dd<0 && rep.escudo && rep.escudo[ev.id]>0){ dd=0; r.msg+=" 🛡️"; }
    (rep.dura||[]).forEach(x=>{ if(x.k==="menos" && x.left>0 && dd<0) dd=Math.min(0,dd+x.n); });
    Object.keys(rep.escudo||{}).forEach(k=>{ rep.escudo[k]--; }); }
  const after=Math.round((before+dd)*10)/10; rep.armonia=after;   // sin techo
  const prevReg=rep.reg, degen=repUpdReg();
  rep.log.push({ n:rep.turn+1, ev:ev.name, src:ev.src, fate:!!ev.fate, msg:r.msg, acts:rep.turnActs.slice(), before, after, Z:rep.t.Z.n, G:rep.t.G.n, E:rep.t.E.n, reg:rep.reg });
  rep.turn++;
  if(repEnded()) repResult(); else if(degen) repRenderDegen(prevReg); else repRenderTurn();
}
/* ---------- crónica de la partida ---------- */
function repChronicleText(){
  const m=REP_MODES[rep.mode]; const L=[
    "سجل جمهوريتي — قسم الفلسفة · IES Martín de Bertendona",
    "اللعبة: "+(rep.gameName||"(بلا اسم)"),
    "النمط: "+m.name+" · "+(rep.acciones==="si"?"مع إجراءات":"بدون إجراءات"),
    "التصميم الأول: "+rep.designText, ""];
  rep.log.forEach(e=>{
    L.push("الدور "+e.n+" — "+e.ev+(e.src&&e.src!=="—"?" ("+e.src+")":"")+(e.fate?" [بطاقة القدر]":""));
    L.push("   النتيجة: "+e.msg);
    if(e.acts.length) L.push("   إجراءاتكم: "+e.acts.join(", "));
    L.push("   الانسجام "+repFmt(e.before)+" → "+repFmt(e.after)+"  ·  المدينة "+e.Z+"/"+e.G+"/"+e.E+" (الحراس/المحاربون/المنتجون)");
    L.push("");
  });
  L.push("الخاتمة: "+(rep._rank||"—")+" — "+repFmt(Math.max(0,rep.armonia))+" من الانسجام (الأساس "+REP_ARM0+") بعد "+rep.log.length+" أدوار عشتموها.");
  const D=repD(); if(D){ const U=D.ui, R=D.regimenes, rg=R[rep.reg], V=D.versiones[rep.juego||"degen"];   // (20-10) régimen, diálogos y guion de disertación
    L.splice(3, 0, U.version+": "+V.eyebrow+" · "+V.name+" ("+V.libros+")");
    if(rep.juego==="clases"){ const f=repFunc(); L.push("", "== "+U.funciones.toUpperCase()+" ==");
      D.funciones.forEach(x=>L.push("   "+(f[x.k]?"✓ ":"✗ ")+x.name+" — "+x.gr.replace(/\*/g,"")+" — "+x.clase+": "+(f[x.k]?x.ok:x.no)+" ("+x.loc+")"));
      L.push("", D.doxa.replace(/\*/g,""));
      if(rep.erChoice!=null){ const E=D.er, o=E.opts[rep.erChoice]; L.push("", "== "+E.titulo.toUpperCase()+" ==", E.cita+" ("+E.loc+")", "   → "+o.t, "   "+o.r, E.cierre); }
      L.push("", "== "+U.posturas.toUpperCase()+" =="); }
    else { L.push("", "== "+U.finRegimen.toUpperCase()+": "+rg.name.toUpperCase()+" ==", rg.lema, rg.cita+" ("+rg.loc+")");
    rep.regLog.forEach(x=>L.push("   "+x.n+": "+R.slice(x.from,x.to+1).map(r=>r.name).join(" → ")));
    L.push("", U.escalera);
    if(rep.erChoice!=null){ const E=D.er, o=E.opts[rep.erChoice]; L.push("", "== "+E.titulo.toUpperCase()+" ==", E.cita+" ("+E.loc+")", "   → "+o.t, "   "+o.r, E.cierre); }
    L.push("", "== "+U.posturas.toUpperCase()+" =="); }
    if(!rep.posturas.length) L.push(U.sinDialogos);
    rep.posturas.forEach(p=>{ L.push("", p.quien+" ("+p.loc+"): "+p.cita, "   → "+p.t, "   "+U.porque+": "+p.razon, "   "+U.resultado+": "+p.r,
      "   "+U.responde+": "+p.platon.txt.replace(/\*/g,"")+" ("+p.platon.loc+")", "   "+U.objeta+" ("+p.critica.autor+"): "+p.critica.txt.replace(/\*/g,"")+" ("+p.critica.loc+")"); });
    L.push("", "== "+U.disertacion.toUpperCase()+" ==", "1. "+U.dTesis, "2. "+U.dPlaton, "3. "+U.dObjecion, "4. "+U.dTuya);
    const glo=[...new Set([].concat(...rep.posturas.map(p=>p.glo), ...R.slice(0,rep.reg+1).map(r=>r.glo)))].map(id=>repGloName(id)).filter(Boolean);
    if(glo.length) L.push("", U.glosario+": "+glo.join(", ")); }
  return L.join("\n");
}
function repDownloadText(txt,name){
  try{ const blob=new Blob([txt],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download=(name||"cronica")+".txt";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(e){}
}
/* nombre de archivo único y legible: mi-republica-<ciudad>-AAAA-MM-DD-HHMM */
function repFileSlug(s){ return String(s||"").normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40); }
function repStamp(ts){ const d=ts?new Date(ts):new Date(); const p=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"-"+p(d.getHours())+p(d.getMinutes()); }
function repChronicleFilename(name,ts){ const s=repFileSlug(name); return "mi-republica"+(s?"-"+s:"")+"-"+repStamp(ts); }
function repDownloadChronicle(){ repDownloadText(repChronicleText(),repChronicleFilename(rep.gameName||rep._defaultName)); }
/* ---------- historial de partidas (localStorage) ---------- */
const REP_HIST_KEY="aula-republica-hist", REP_HIST_MAX=12;
function repHistLoad(){ try{ const h=store.get(REP_HIST_KEY,[]); return Array.isArray(h)?h:[]; }catch(e){ return []; } }
function repHistPush(rec){ try{ const h=repHistLoad(); h.unshift(rec); while(h.length>REP_HIST_MAX) h.pop(); store.set(REP_HIST_KEY,h); }catch(e){} }
/* ---- exportar / importar historial (JSON, para llevarlo entre equipos) ---- */
function repExportHistory(){
  const h=repHistLoad();
  if(!h.length){ alert("لا توجد بعدُ ألعاب محفوظة لتصديرها."); return; }
  const data={ app:"aula-republica", version:1, exportado:new Date().toISOString(), partidas:h };
  try{ const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="republica-partidas-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(e){ alert("تعذّر إنشاء الملف."); }
}
function repImportHistoryFile(file){
  if(!file) return;
  const rd=new FileReader();
  rd.onload=function(){
    let data; try{ data=JSON.parse(rd.result); }catch(e){ alert("الملف ليس JSON صالحًا."); return; }
    const arr = Array.isArray(data) ? data : (data && Array.isArray(data.partidas) ? data.partidas : null);
    if(!arr){ alert("الملف لا يحتوي على ألعاب من «الجمهورية»."); return; }
    const valid=arr.filter(r=>r && typeof r==="object" && typeof r.text==="string");
    if(!valid.length){ alert("الملف لا يحتوي على أي لعبة صالحة."); return; }
    const cur=repHistLoad();
    const seen={}; cur.forEach(r=>{ if(r&&r.ts!=null) seen[r.ts]=true; });
    const nuevos=valid.filter(r=> r.ts==null || !seen[r.ts]);
    if(!nuevos.length){ alert("هذه الألعاب موجودة أصلًا في هذا الجهاز. لم تتم إضافة أي لعبة."); return; }
    let merged=cur.concat(nuevos);
    merged.sort((a,b)=>(b.ts||0)-(a.ts||0));
    while(merged.length>REP_HIST_MAX) merged.pop();
    store.set(REP_HIST_KEY,merged);
    alert("تم استيراد "+nuevos.length+" لعبة. يُحتفظ بآخر "+REP_HIST_MAX+" ألعاب.");
    renderRepHistory();
  };
  rd.onerror=function(){ alert("تعذّرت قراءة الملف."); };
  rd.readAsText(file);
}
function repEsc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
const REP_NAMES=["Calípolis","Magnesia","أثينا الجديدة","Politeia","Eunomía","Kalonia","Aristópolis","مدينة الشمس","Sofópolis","Areté"];
function repDefaultName(){ return REP_NAMES[Math.floor(Math.random()*REP_NAMES.length)]; }
function repHistSetLatestName(name){
  const nm=(name||"").trim().slice(0,40)||rep._defaultName||"(بلا اسم)"; rep.gameName=nm;
  try{ const h=repHistLoad(); if(h.length){ h[0].name=nm; h[0].text=repChronicleText(); store.set(REP_HIST_KEY,h); } }catch(e){}
}
function renderRepHistory(){
  const box=repBox(); if(!box) return; const h=repHistLoad();
  box.innerHTML='<div class="rep-wrap"><div class="rep-hist">'+
    '<div class="rep-hist-top"><button class="btn2" id="repHistBack">← العودة إلى التصميم</button><h3>📚 الألعاب المحفوظة</h3>'+
      '<span class="rep-hist-io">'+(h.length?'<button class="btn2" id="repHistExport" title="حمّلوا كل ألعابكم في ملف JSON لحفظها أو نقلها إلى جهاز آخر">⬆️ تصدير</button>':'')+'<button class="btn2" id="repHistImport" title="حمّلوا ألعابًا من ملف JSON مُصدَّر (تُضاف إلى ألعاب هذا الجهاز دون حذفها)">⬇️ استيراد</button>'+(h.length?'<button class="btn2" id="repHistClear" title="احذفوا كل الألعاب المحفوظة في هذا المتصفح (لا يؤثر ذلك في الملفات المصدَّرة)">🗑️ حذف الكل</button>':'')+'</span>'+
      '<input type="file" id="repHistFile" accept="application/json,.json" style="display:none">'+
      '</div>'+
    (h.length? h.map((r,i)=>'<details class="rep-hist-item"><summary><span class="rep-hist-badge">'+r.emoji+'</span> '+(r.name?'<b class="rep-hist-name">'+repEsc(r.name)+'</b> · ':'')+r.rank+' · ⚖ '+r.arm+' · '+r.turns+' أدوار · '+r.mode+(r.acc==="لا"?" (بدون إجراءات)":"")+' · <span class="rep-hist-date">'+r.date+'</span></summary>'+
        '<pre class="rep-hist-text">'+repEsc(r.text)+'</pre>'+
        '<div class="rep-hist-btns"><button class="btn2" data-hcopy="'+i+'">📋 نسخ</button><button class="btn2" data-hdl="'+i+'">💾 تنزيل</button></div></details>').join("")
      : '<p class="rep-hist-empty">لم تُنهوا أي لعبة بعد. العبوا لعبة وستُحفظ هنا (يُحتفظ بآخر '+REP_HIST_MAX+').</p>')+
    '</div></div>';
  document.getElementById("repHistBack").addEventListener("click",renderRepStart);
  const clr=document.getElementById("repHistClear"); if(clr) clr.addEventListener("click",()=>{ if(confirm("هل تريدون حذف كل الألعاب المحفوظة؟")){ store.set(REP_HIST_KEY,[]); renderRepHistory(); } });
  const exp=document.getElementById("repHistExport"); if(exp) exp.addEventListener("click",repExportHistory);
  const imp=document.getElementById("repHistImport"), fi=document.getElementById("repHistFile");
  if(imp&&fi){ imp.addEventListener("click",()=>fi.click()); fi.addEventListener("change",()=>{ repImportHistoryFile(fi.files&&fi.files[0]); fi.value=""; }); }
  box.querySelectorAll("[data-hcopy]").forEach(b=>b.addEventListener("click",()=>{ const r=repHistLoad()[+b.dataset.hcopy]; if(r&&navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(r.text).then(()=>{ const o=b.textContent; b.textContent="✓ تم النسخ!"; setTimeout(()=>{b.textContent=o;},1400); }).catch(()=>{}); } }));
  box.querySelectorAll("[data-hdl]").forEach(b=>b.addEventListener("click",()=>{ const r=repHistLoad()[+b.dataset.hdl]; if(r) repDownloadText(r.text,repChronicleFilename(r.name,r.ts)); }));
}
function repCopyChronicle(btn){
  const txt=repChronicleText();
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>{ const o=btn.textContent; btn.textContent="✓ تم النسخ!"; setTimeout(()=>{btn.textContent=o;},1600); }).catch(()=>{}); }
}
function repErBlock(){   // (20-10) Versión A: epílogo con el mito de Er (República X, 614b-621d)
  const D=repD(), E=D.er, U=D.ui;
  return '<div class="rep-dialog rep-er" id="repEr"><div class="rep-dl-h"><span class="rep-dl-ic" aria-hidden="true">🌌</span><div><span class="rep-ev-tag">'+E.loc+'</span><h3>'+E.titulo+(rep.juego==="clases"?' <span class="rep-cr-badge">'+U.opcional+'</span>':'')+'</h3></div></div>'+
    '<p class="rep-dl-sit">'+E.situacion+'</p><blockquote class="rep-dl-cita">'+E.cita+' <cite>'+E.loc+'</cite></blockquote><p class="rep-dl-gr">'+repMd(E.griego)+'</p>'+
    (rep.erChoice==null
      ? '<p class="rep-dl-q"><b>'+E.pregunta+'</b></p><div class="rep-dl-opts">'+E.opts.map((o,i)=>'<button class="rep-dl-opt" data-er="'+i+'"><b>'+o.t+'</b></button>').join("")+'</div>'
      : '<div class="rep-dl-chosen"><b>'+U.erElige+': '+E.opts[rep.erChoice].t+'</b><span>'+E.opts[rep.erChoice].r+'</span></div><p class="rep-dl-note">'+E.cierre+'</p>')+'</div>'; }
function repErWire(){ document.querySelectorAll("#repEr [data-er]").forEach(b=>b.addEventListener("click",()=>{ rep.erChoice=+b.dataset.er;
  const el=document.getElementById("repEr"); if(el){ el.outerHTML=repErBlock(); }
  try{ const h=repHistLoad(); if(h.length){ h[0].text=repChronicleText(); store.set(REP_HIST_KEY,h); } }catch(e){} })); }
function repFuncPanel(){   // (20-10) Versión B: qué función cumple cada clase
  const D=repD(), f=repFunc();
  return '<div class="rep-final-reg"><div class="rep-cr-title">⚖️ '+D.ui.funciones+'</div><ul class="rep-func-list">'+D.funciones.map(x=>
    '<li class="'+(f[x.k]?'ok':'bad')+'"><b>'+x.emoji+' '+x.name+'</b> '+repMd(x.gr)+' · <em>'+x.clase+'</em><br>'+(f[x.k]?'✓ '+x.ok:'✗ '+x.no)+' <cite>'+x.loc+'</cite></li>').join("")+'</ul>'+
    '<p class="rep-dl-note">'+repMd(D.doxa)+'</p></div>'; }
function repFinalBlocks(){   // (20-10) régimen final, posturas y guion de disertación
  const D=repD(); if(!D) return ""; const U=D.ui, rg=D.regimenes[rep.reg];
  const glo=[...new Set([].concat(...rep.posturas.map(p=>p.glo), ...(rep.juego==="clases"?[["g-las-tres-partes-del-alma","g-justicia","g-sabiduria","g-valentia","g-templanza"]]:D.regimenes.slice(0,rep.reg+1).map(r=>r.glo))))];
  return (rep.juego==="clases" ? repFuncPanel()+repErBlock() :
    '<div class="rep-final-reg">'+repLadder()+'<p class="rep-dl-sit"><b>'+rg.lema+'</b></p>'+
      '<blockquote class="rep-dl-cita">'+rg.cita+' <cite>'+rg.loc+'</cite></blockquote>'+
      '<p class="rep-dl-note">'+U.escalera+'</p></div>'+repErBlock())+
    '<div class="rep-chronicle"><div class="rep-cr-title">🗣️ '+U.posturas+'</div>'+
      (rep.posturas.length ? '<ol class="rep-cr-list">'+rep.posturas.map(p=>'<li class="rep-cr-item"><div class="rep-cr-h"><span class="rep-cr-n">T'+p.n+'</span><b>'+p.quien+'</b> <span class="rep-cr-badge">'+p.loc+'</span></div>'+
        '<div class="rep-cr-msg"><b>'+p.t+'</b> '+U.porque+': '+p.razon+'</div><div class="rep-cr-acts">'+U.objeta+' ('+p.critica.autor+'): '+repMd(p.critica.txt)+' <cite>'+p.critica.loc+'</cite></div></li>').join("")+'</ol>'
        : '<p class="rep-dl-note">'+U.sinDialogos+'</p>')+'</div>'+
    '<div class="rep-diser"><div class="rep-cr-title">✍️ '+U.disertacion+'</div>'+repTemaLinks([REP_TEMA_PLATON, REP_TEMA_POLITICA])+'<ol><li>'+U.dTesis+'</li><li>'+U.dPlaton+'</li><li>'+U.dObjecion+'</li><li>'+U.dTuya+'</li></ol>'+repGloLinks(glo)+'</div>';
}
function repResult(){
  const a=rep.armonia; let emoji,rank;
  if(a<=0||repPop()<3){ emoji="💥"; rank="الجمهورية تنهار"; }
  else if(a>=8){ emoji="🏛️"; rank="جمهورية منسجمة"; }
  else if(a>=5){ emoji="⚖️"; rank="جمهورية مستقرة"; }
  else { emoji="⚠️"; rank="جمهورية هشّة، لكنها صامدة"; }
  const D=repD(); if(D && rep.juego==="clases"){ const f=repFunc(), dead=a<=0||repPop()<3;   // (20-10) B: grado de ciudad justa
    const fb=D.finB.find(x=>!dead && a>=x.min && (!x.todas || f.dikaiosyne)) || D.finB[D.finB.length-1]; emoji=fb.emoji; rank=fb.name; }
  else if(D){ repUpdReg(); const rg=D.regimenes[rep.reg];   // (20-10) A: el desenlace es el régimen del libro VIII
    if(a<=0||repPop()<3){ emoji="💥"; rank=D.ui.hunde; } else { emoji=rg.emoji; rank=rg.name; } }
  rep._rank=rank;
  const key="aula-republica-best"; const best=store.get(key,0); const record=a>best; if(record) store.set(key,a);
  // guardar en el historial del navegador (con nombre por defecto, editable después)
  rep._defaultName=repDefaultName(); rep.gameName=rep._defaultName;
  const ts=Date.now(); let fecha; try{ fecha=new Date(ts).toLocaleString("ar-MA-u-nu-latn",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); }catch(e){ fecha=new Date(ts).toLocaleString(); }
  repHistPush({ ts, date:fecha, name:rep.gameName, emoji, rank, mode:REP_MODES[rep.mode].name+(D&&rep.juego?" · "+D.versiones[rep.juego].eyebrow:""), acc:rep.acciones, arm:repFmt(Math.max(0,a)), turns:rep.log.length, text:repChronicleText() });
  const qs=["ماذا تُظهر هذه اللعبة عن حاجة مجتمع أفلاطون إلى التوازن؟",
    "ما المخاطر التي تنتج عن السلطة المفرطة لكل طبقة اجتماعية؟",
    "هل صحيح، كما قال أفلاطون، أن المجتمع لا يمكن أن يخلص دون حكام فلاسفة؟",
    "هل تستحق المدينة العادلة العناء إذا كان تحقيقها يقتضي التخلي عن المساواة بين الطبقات؟"];
  const chronicle=rep.log.map(e=>{ const s=e.after-e.before, cls=s<0?"bad":s>0?"good":"ok";
    return '<li class="rep-cr-item'+(e.fate?" fate":"")+'"><div class="rep-cr-h"><span class="rep-cr-n">T'+e.n+'</span><b>'+repMd(e.ev)+'</b>'+(e.fate?' <span class="rep-cr-badge">القدر</span>':'')+'<span class="rep-cr-arm '+cls+'">'+repFmt(e.before)+'→'+repFmt(e.after)+'</span></div>'+
      '<div class="rep-cr-msg">'+repMd(e.msg)+'</div>'+
      (e.acts.length?'<div class="rep-cr-acts">🔧 '+repMd(e.acts.join(", "))+'</div>':'')+'</li>'; }).join("");
  repBox().innerHTML='<div class="rep-wrap"><div class="rep-result">'+
    '<div class="rep-badge">'+emoji+'</div><div class="rep-rank">'+rank+'</div>'+
    '<div class="rep-final">'+repFmt(Math.max(0,a))+' <span>من الانسجام</span></div>'+
    '<p class="rep-pop">'+rep.log.length+' أدوار عشتموها · المدينة في النهاية '+rep.t.Z.n+'/'+rep.t.G.n+'/'+rep.t.E.n+' · '+(rep.acciones==="si"?"مع إجراءات":"بدون إجراءات")+' · '+(record?"أفضل جمهورية لكم! 🎉":"أفضل نتيجة: "+repFmt(Math.max(best,a)))+'</p>'+
    '<div class="rep-name"><label for="repName">🏷️ اسم هذه اللعبة</label><input id="repName" type="text" maxlength="40" value="'+repEsc(rep.gameName)+'" placeholder="أعطوا جمهوريتكم اسمًا"></div>'+
    repFinalBlocks()+
    '<div class="rep-chronicle"><div class="rep-cr-title">📜 سجل جمهوريتكم</div><ol class="rep-cr-list">'+chronicle+'</ol></div>'+
    '<div class="rep-save"><button class="btn2" id="repSave">💾 حفظ السجل (.txt)</button><button class="btn2" id="repCopy">📋 نسخ السجل</button><button class="btn2" id="repHistView">📚 عرض السجل التاريخي</button></div>'+
    '<blockquote class="rep-reflect">للتفكير: '+qs[Math.floor(Math.random()*qs.length)]+'</blockquote>'+
    '<div class="rep-actions2"><button class="btn2 primary" id="repAgain">صمّموا مدينة أخرى</button></div></div></div>';
  document.getElementById("repAgain").addEventListener("click",renderRepStart);
  const sv=document.getElementById("repSave"); if(sv) sv.addEventListener("click",repDownloadChronicle);
  const cp=document.getElementById("repCopy"); if(cp) cp.addEventListener("click",()=>repCopyChronicle(cp));
  const hv=document.getElementById("repHistView"); if(hv) hv.addEventListener("click",renderRepHistory);
  if(D) repErWire();   // (21-10) el mito de Er cierra las dos versiones
  const nm=document.getElementById("repName"); if(nm){ nm.addEventListener("input",()=>repHistSetLatestName(nm.value)); nm.addEventListener("focus",()=>nm.select()); }
}
function renderRepChuleta(){   // (20-10) chuleta: todas las reglas y fórmulas de las dos versiones
  const D=repD(), box=repBox(); if(!D||!box) return; const U=D.ui, V=D.versiones;
  const actRow=a=>'<tr><td><b>'+repMd(a.name)+'</b>'+(a.fase!=null&&D.fases[a.fase]?' <span class="rep-cr-badge">'+U.fase+' '+(a.fase+1)+'</span>':'')+(a.src?'<br><cite>'+a.src+'</cite>':'')+'</td><td class="c">'+a.ap+'</td><td>'+a.d+(a.cita?'<br><cite>'+repMd(a.cita)+'</cite>':'')+'</td></tr>';
  const byV=(v,fn)=>{ const j=rep.juego; rep.juego=(v==="b"?"clases":"degen"); try{ return fn(); } finally{ rep.juego=j; } };
  const MA=(typeof REP_MAZO_A!=="undefined")?REP_MAZO_A:{}, MB=(typeof REP_MAZO_B!=="undefined")?REP_MAZO_B:{};
  const tabla=(rows,cols)=>rows&&rows.length?'<table class="rep-ch-t">'+rows.map(r=>'<tr>'+cols.map((c,i)=>'<td>'+(i===0?'<b>':'')+repMd(r[c]||'')+(i===0?'</b>':'')+'</td>').join("")+'</tr>').join("")+'</table>':'';
  const cartas=list=>(list||[]).map(c=>'<p><b>'+c.name+'</b> '+repMd(c.txt||'')+(c.cita?' '+repMd(c.cita):'')+(c.loc?' <cite>('+c.loc+')</cite>':'')+'</p>').join("");
  const actTable=list=>'<table class="rep-ch-t"><tr><th>'+U.cAcciones+'</th><th class="c">AP</th><th></th></tr>'+list.map(actRow).join("")+'</table>';
  const old=v=>REP_ACTS.filter(a=>(REP_ACT_V[a.id]||"ab").includes(v));
  const evV=e=>(REP_EV_V[e.id]||e.v)==="a"?" · A":(REP_EV_V[e.id]||e.v)==="b"?" · B":"";
  box.innerHTML='<div class="rep-wrap rep-chuleta"><div class="rep-hist-top"><button class="btn2" id="repChBack">'+U.volver+'</button><h3>📋 '+U.chuletaT+'</h3>'+
      '<button class="btn2" onclick="void 0 /* sin imprimir en la web de alumnado */">🖨️</button></div>'+
    '<h4>'+U.cClases+'</h4><p>'+U.cClasesT+'</p><table class="rep-ch-t">'+["Z","G","E"].map(k=>REP_ROSTER[k].map(c=>'<tr><td>'+c.name+'</td><td>🦉'+c.sj+' 🛡️'+c.v+' 🍷'+c.t+'</td><td class="c">'+cost(c)+'</td></tr>').join("")).join("")+'</table>'+
    '<h4>'+U.cEconomia+'</h4><p>'+U.cEconomiaT+' '+U.cTurnos+'</p>'+
    '<h4>'+U.cVictoria+'</h4><p>'+U.cVictoriaA+'</p><p>'+U.cVictoriaB+'</p><p>'+U.cFunciones+'</p>'+
    '<h4>'+V.degen.emoji+' '+V.degen.eyebrow+' · '+V.degen.name+'</h4><table class="rep-ch-t">'+D.regimenes.map((r,i)=>'<tr><td><b>'+r.emoji+' '+r.name+'</b></td><td>'+(i===0?'≥ 8':i===D.regimenes.length-1?'< 2':'< '+D.regimenes[i-1].min)+'</td><td>'+r.lema+' '+repMd(r.causa)+'<br><cite>'+r.cita+' ('+r.loc+')</cite></td></tr>').join("")+'</table>'+
    cartas(MA.almas)+tabla(MA.tabla,["name","alma","causa","cita","loc"])+
    actTable(byV("a",()=>repActsFor(true)))+
    '<h4>'+V.clases.emoji+' '+V.clases.eyebrow+' · '+V.clases.name+'</h4><table class="rep-ch-t">'+D.funciones.map(x=>'<tr><td><b>'+x.emoji+' '+x.name+'</b><br>'+repMd(x.gr)+'</td><td>'+x.clase+'</td><td>'+x.ok+'<br><cite>'+x.loc+'</cite></td></tr>').join("")+'</table>'+
    '<p>'+D.fases.map((f,i)=>'<b>'+(i+1)+'. '+f.name+'</b>: '+f.lema).join("<br>")+'</p><p>'+repMd(D.doxa)+'</p>'+
    cartas(MB.clases)+tabla(MB.tabla,["name","alma","virtud","cumple","desborda","falta"])+
    actTable(byV("b",()=>repActsFor(true)))+
    '<h4>'+U.cEventos+'</h4><table class="rep-ch-t">'+REP_EVENTS.concat((MA.eventos||[]).concat(MB.eventos||[]).map(e=>Object.assign({ src:e.loc||"", threat:e.threat||(e.elige&&e.elige.situacion)||"" }, e))).map(e=>'<tr><td><b>'+repMd(e.name)+'</b>'+evV(e)+'<br><cite>'+e.src+'</cite></td><td colspan="2">'+e.threat+'</td></tr>').join("")+'</table>'+
    '<p>'+U.cDestino+'</p><p>'+U.cDialogos+'</p></div>';
  document.getElementById("repChBack").addEventListener("click",()=>renderRepStart(rep.juego?true:false));
}
function initRep(){ renderRepStart(); }
document.addEventListener("DOMContentLoaded", initRep);
(function(){ const nav=document.getElementById("tabs"); if(nav) nav.addEventListener("click", e=>{ const b=e.target.closest("button"); if(b && b.dataset.view==="republica") renderRepStart(); }); })();
