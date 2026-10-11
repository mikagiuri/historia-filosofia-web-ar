"use strict";
/* ===== Cruces entre juegos por tesis (11-10-2026) =====
   La «Red de tesis» de Genealogías (genealogias_tesis.js, GEN_TESIS) hace de centro común. Aquí se etiqueta qué tesis
   corresponden a cada nudo de «Nudos», a cada estación y tensión de la «Rayuela filosófica» (redes de HF y de 1.º) y en
   qué estación de la Rayuela se vive cada módulo de Nudos. Con estas etiquetas, cada juego enlaza con los otros:
   · Nudos: al saltar un nudo, «En la historia de la filosofía» (tesis y su enlace de acuerdo o desacuerdo); en el
     cuaderno, «Vívelo en la Rayuela».
   · Rayuela: al terminar un viaje, «Para seguir pensando» (tesis de tu recorrido y módulos de Nudos).
   · Genealogías: al abrir una tesis, «En los juegos» (módulos de Nudos y estaciones de la Rayuela donde aparece).
   Solo identificadores (no se traduce). Las tesis son ids de GEN_TESIS; las estaciones, claves de RAYUELA_HF/RAYUELA_FIL.
   Una etiqueta dice «aquí se discute esta tesis», no que la respuesta del alumno coincida con ella: sin perfiles
   (criterios de criba de actividades gamificadas). En la web de 1.º no hay Genealogías: los enlaces a la Red de tesis
   no salen y sí los de Nudos y Rayuela. */
const CRUCES_TESIS = {
  nudos: {
    mentir: {
      rayuela: { hf: "18", fil: "4" },
      nudos: {
        "M1=A|M3=A": ["kan-mentir", "mil-util"], "M7=A|M3=A": ["kan-ley", "kan-mentir"], "M2=A|M5=D": ["mil-util"],
        "M6=A|M4=A": ["kan-ley"], "M6=A|M3=A": ["kan-ley", "kan-mentir"], "M2=A|M6=A": ["mil-util", "kan-ley"]
      }
    },
    creer: {
      rayuela: { hf: "6", fil: "5" },
      nudos: { "C3=A|C4=A": ["pro-medida", "pla-ideas"] }
    }
  },
  rayuela: {
    hf: {
      estaciones: {
        "1": ["soc-examen"], "2": ["soc-virtud", "ari-habito"], "3": ["epi-placer", "mil-socrates"], "4": ["des-cogito"],
        "5": ["des-dual", "ari-forma"], "6": ["agu-creer", "tom-armonia"], "7": ["ari-polis", "pla-rey"],
        "9": ["ari-exp", "des-innatas", "hum-impr"], "11": ["des-innatas", "loc-tabla"], "12": ["hum-causa", "kan-exp"],
        "13": ["des-dual"], "14": ["hob-guerra", "rou-bueno"], "15": ["hob-guerra", "loc-resistir"], "16": ["mil-util", "kan-ley"],
        "17": ["kan-sapere"], "18": ["kan-ley", "kan-mentir", "mil-util"], "19": ["kan-exp", "nie-fabula"],
        "20": ["mar-conciencia", "mar-tesis"], "21": ["nie-dios"], "23": ["sar-exist", "ort-circ"], "24": ["bea-mujer"],
        "90": ["epi-placer"], "92": ["des-cogito"], "93": ["soc-virtud"], "94": ["des-dual", "ari-forma"], "95": ["nie-dios", "sar-exist"],
        "96": ["hob-guerra", "loc-resistir"], "97": ["hum-causa", "kan-exp"], "98": ["mil-util", "kan-ley"], "99": ["loc-resistir", "mar-conciencia"],
        "100": ["bea-mujer", "sar-exist"]
      },
      tensiones: {
        "t-verdad-perspectiva": ["pro-medida", "pla-ideas"], "t-sentido-nihilismo": ["nie-dios"], "t-alma-materia": ["des-dual"],
        "t-fe-razon": ["agu-creer", "tom-armonia"], "t-sentidos-razon": ["des-innatas", "loc-tabla"], "t-duda-certeza": ["des-cogito"],
        "t-placer-deber": ["epi-placer", "kan-ley"], "t-suma-derechos": ["mil-util", "kan-ley"], "t-dios-muerte": ["tom-vias", "nie-dios"],
        "t-costumbre-ciencia": ["hum-causa", "kan-exp"], "t-lobos-dialogo": ["hob-guerra", "ari-polis"], "t-ciudad-corrompe": ["ari-polis", "rou-bueno"],
        "t-autoridad-pensar": ["kan-sapere"], "t-desobedecer-autoridad": ["loc-resistir", "hob-guerra"], "t-necesidad-libertad": ["sar-exist"]
      },
      nudos: { "t-verdad-perspectiva": "creer", "t-fe-razon": "creer", "t-suma-derechos": "mentir", "t-placer-deber": "mentir" }
    },
    fil: {
      estaciones: {
        "2": ["des-innatas", "loc-tabla", "hum-impr"], "4": ["kan-ley", "mil-util", "soc-virtud"], "5": ["pro-medida", "pla-ideas"],
        "7": ["des-dual"], "8": ["pla-ideas", "des-cogito"], "10": ["sar-exist"], "11": ["tom-vias"], "13": ["sar-exist"],
        "15": ["mil-util", "kan-ley"], "16": ["epi-placer", "mil-socrates"], "17": ["soc-virtud"], "18": ["pla-ideas", "hum-esclava"],
        "20": ["hob-guerra", "loc-resistir", "rou-bueno"],
        "90": ["pro-medida", "pla-ideas"], "91": ["des-dual"], "93": ["epi-placer", "mil-socrates"], "94": ["hob-guerra", "loc-resistir"], "95": ["pro-medida", "pla-ideas"]
      },
      tensiones: {
        "t-relativismo-universal": ["pro-medida", "pla-ideas"], "t-materia-mente": ["des-dual"], "t-real-enchufe": ["mil-socrates"],
        "t-consecuencias-deber": ["mil-util", "kan-ley"], "t-obedecer-pensar": ["kan-sapere"], "t-duda-certeza": ["des-cogito"],
        "t-razon-experiencia": ["des-innatas", "loc-tabla"], "t-naturaleza-libertad": ["sar-exist"]
      },
      nudos: { "t-relativismo-universal": "creer", "t-consecuencias-deber": "mentir" }
    }
  }
};

/* textos de interfaz: cadenas enteras (las traduce web_i18n/ui/<lang>.json) */
const CRU_TXT = {
  historia: "في تاريخ الفلسفة", juegos: "في الألعاب", seguir: "لمواصلة التفكير",
  concuerdan: "تتفقان", seOponen: "تتعارضان",
  nudos: "عُقَد", rayuela: "حجلة فلسفية", vivelo: "عيشوها في الحجلة: ابدؤوا رحلة من محطة «{t}»",
  deshaz: "فكّروا فيها بهدوء في «عُقَد»: «{t}»", estacion: "ابدؤوا رحلة من محطة «{t}»",
  nota: "تُناقَش هذه الأطروحة هنا، ولا يعني ذلك أن إجابتكم تطابقها."
};
function cruT(k, v){ return String(CRU_TXT[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : "")); }
function cruEsc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function cruVista(id){ return !!document.getElementById(id); }
/* red de la Rayuela cargada en esta web (la misma regla que rayuelaview.js) */
function cruRed(){ return typeof RAYUELA_HF !== "undefined" ? "hf" : (typeof RAYUELA_FIL !== "undefined" ? "fil" : null); }
function cruRay(){ return typeof RAYUELA_HF !== "undefined" ? RAYUELA_HF : (typeof RAYUELA_FIL !== "undefined" ? RAYUELA_FIL : null); }
function cruTesis(id){ return typeof GEN_TESIS !== "undefined" ? GEN_TESIS.tesis.find(t => t.id === id) : null; }
function cruHayRed(){ return typeof GEN_TESIS !== "undefined" && cruVista("genealogias"); }
/* bloque «En la historia de la filosofía»: las tesis y, entre ellas, sus enlaces de acuerdo o desacuerdo con su porqué */
function cruTesisHtml(ids, titulo){
  if (!cruHayRed() || !ids || !ids.length) return "";
  const I = typeof ILUSTRES !== "undefined" ? ILUSTRES : {}, ts = [...new Set(ids)].map(cruTesis).filter(Boolean);
  if (!ts.length) return "";
  const enl = GEN_TESIS.enlaces.filter(e => { const [a, b] = e.k.split("|"); return ts.some(t => t.id === a) && ts.some(t => t.id === b); });
  return '<div class="cru-box"><b>' + cruT(titulo || "historia") + '</b><ul>' + ts.map(t =>
    '<li><button type="button" class="cru-a" data-igo="genealogias" data-iarg="tesis/' + t.id + '"><strong>' + cruEsc(I[t.ilustre] ? I[t.ilustre].name : t.ilustre) + '</strong>: «' + cruEsc(t.t) + '»</button></li>').join("") + '</ul>' +
    enl.map(e => '<p class="cru-enl cru-' + e.tipo + '"><b>' + cruT(e.tipo === "acuerdo" ? "concuerdan" : "seOponen") + '.</b> ' + cruEsc(e.por) + '</p>').join("") + '</div>';
}
/* tesis de un nudo de Nudos */
function cruNudoTesis(mod, k){ const m = CRUCES_TESIS.nudos[mod]; return (m && m.nudos[k]) || []; }
/* enlace «Vívelo en la Rayuela» de un módulo de Nudos */
function cruNudoRayuela(mod){
  const m = CRUCES_TESIS.nudos[mod], red = cruRed(), R = cruRay(), n = m && m.rayuela && red ? m.rayuela[red] : null;
  if (!n || !R || !R.estaciones[n] || !cruVista("rayuela")) return "";
  return '<p class="cru-box"><button type="button" class="cru-a" data-igo="rayuela" data-iarg="' + n + '">' + cruEsc(cruT("vivelo", { t: R.estaciones[n].titulo })) + '</button></p>';
}
/* «Para seguir pensando» al final de un viaje de la Rayuela: tesis de las estaciones y tensiones del recorrido y módulos de Nudos */
function cruRayuelaFinal(ruta, tens){
  const red = cruRed(), C = red && CRUCES_TESIS.rayuela[red]; if (!C) return "";
  const ids = [], mods = new Set();
  (ruta || []).forEach(n => (C.estaciones[n] || []).forEach(x => ids.push(x)));
  (tens || []).forEach(t => { (C.tensiones[t] || []).forEach(x => ids.push(x)); if (C.nudos[t]) mods.add(C.nudos[t]); });
  Object.keys(CRUCES_TESIS.nudos).forEach(mod => { const r = CRUCES_TESIS.nudos[mod].rayuela; if (r && (ruta || []).includes(r[red])) mods.add(mod); });
  const N = typeof NUDOS !== "undefined" && cruVista("nudos") ? NUDOS : [];
  const nud = [...mods].map(id => N.find(m => m.id === id)).filter(Boolean);
  const tes = cruTesisHtml([...new Set(ids)].slice(0, 6), "historia");
  if (!tes && !nud.length) return "";
  return '<div class="ray-box cru-seguir"><b>' + cruT("seguir") + '</b>' + tes +
    (nud.length ? '<p class="cru-links">' + nud.map(m => '<button type="button" class="cru-a" data-igo="nudos" data-iarg="' + m.id + '">' + cruEsc(cruT("deshaz", { t: m.titulo })) + '</button>').join("<br>") + '</p>' : "") + '</div>';
}
/* «En los juegos» de una tesis en la Red de tesis: módulos de Nudos y estaciones (de pregunta) de la Rayuela de esta web */
function cruJuegosDeTesis(id){
  const out = [], N = typeof NUDOS !== "undefined" && cruVista("nudos") ? NUDOS : [];
  Object.keys(CRUCES_TESIS.nudos).forEach(mod => {
    const m = N.find(x => x.id === mod), usa = Object.values(CRUCES_TESIS.nudos[mod].nudos).some(a => a.includes(id));
    if (m && usa) out.push('<button type="button" class="cru-a" data-igo="nudos" data-iarg="' + mod + '">' + cruEsc(cruT("nudos")) + ': «' + cruEsc(m.titulo) + '»</button>');
  });
  const red = cruRed(), R = cruRay(), C = red && CRUCES_TESIS.rayuela[red];
  if (R && C && cruVista("rayuela")) Object.keys(C.estaciones).forEach(n => {
    const s = R.estaciones[n];
    if (s && s.tipo === "pregunta" && C.estaciones[n].includes(id)) out.push('<button type="button" class="cru-a" data-igo="rayuela" data-iarg="' + n + '">' + cruEsc(cruT("rayuela")) + ': ' + cruEsc(cruT("estacion", { t: s.titulo })) + '</button>');
  });
  return out.length ? '<div class="cru-box cru-juegos"><b>' + cruT("juegos") + '</b><p class="cru-links">' + out.join("<br>") + '</p><p class="cru-nota">' + cruT("nota") + '</p></div>' : "";
}
