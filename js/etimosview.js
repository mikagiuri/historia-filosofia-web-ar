"use strict";
/* ===== Vista Étimos ===== depende de: etimos.js (ETIMOS) =====
   Transversalidad con Latín: cada concepto clave con su raíz griega (transliterada) y latina, y su
   evolución al castellano y al euskera. Lista buscable; cada ficha enlaza con su término del glosario
   si existe. Textos de interfaz en ETI_TXT (en castellano; los traduce web_i18n/ui/<lang>.json); los
   datos (etimos.js) los traduce tm/<lang>.json. Estilos propios inyectados una vez, con las variables
   de tema de styles.css (respetan claro/oscuro y RTL). */

const ETI_TXT = {
  criterio: "من أين تأتي كل كلمة في الفلسفة: جذرها اليوناني وجذرها اللاتيني، وكيف وصلت إلى الإسبانية والباسكية. اليونانية مكتوبة بحروف لاتينية ومائلة؛ واللاتينية مذكورة بدقّة.",
  buscar: "ابحث عن مفهوم أو جذر أو تعريف…",
  cuenta: "{n} مفهومًا", cuenta1: "مفهوم واحد",
  ninguno: "لا توجد مفاهيم تطابق البحث.",
  griego: "اليونانية", latin: "اللاتينية", castellano: "الإسبانية", euskera: "الباسكية",
  verTermino: "انظر «{t}» في القاموس",
};
const etiT = (k, v) => String(ETI_TXT[k] == null ? k : ETI_TXT[k]).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));

function etiDatos(){ return typeof ETIMOS === "undefined" ? [] : ETIMOS; }
function etiFold(s){ return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function etiEsc(s){ return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function etiBold(s){ return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
function etiIt(s){ return s.replace(/\*([^*]+)\*/g, "<i>$1</i>"); }
function etiFmt(s){ return etiIt(etiBold(etiEsc(s))); }
function etiHi(escaped, q){
  if (!q || q.length < 2) return escaped;
  const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
  return escaped.replace(rx, "<mark>$1</mark>");
}

const ETI_CSS = `
#etimos .etitools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0 4px}
#etimos .etisearch{flex:1;min-width:220px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;font:inherit;background:var(--surface);color:var(--ink)}
#etimos .etisearch:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
#etimos .eticount{color:var(--muted);font-size:13px;margin:10px 0 16px}
#etimos .etilist{display:grid;gap:12px}
#etimos .etiitem{border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:var(--radius);padding:14px 16px 15px;background:var(--surface);box-shadow:var(--shadow)}
#etimos .etiitem .top{display:flex;flex-wrap:wrap;justify-content:space-between;column-gap:12px;align-items:baseline}
#etimos .etiitem h4{margin:0 0 7px;font-size:18px;font-family:var(--serif);color:var(--ink)}
#etimos .etiitem .tag{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:600;white-space:nowrap}
#etimos .etiroots{display:grid;gap:4px;margin:0 0 9px;padding:9px 12px;background:var(--surface-2);border-radius:10px;font-size:13.5px;line-height:1.5}
#etimos .etiroots .r{display:flex;gap:7px}
#etimos .etiroots .rk{flex:0 0 5.4em;color:var(--muted);font-weight:600;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding-top:2px}
#etimos .etiroots .rv{color:var(--ink)}
#etimos .etiroots .rv i{color:var(--ink)}
#etimos .etiitem p.def{margin:0;font-size:14.5px;line-height:1.55;color:var(--ink)}
#etimos .etiitem .eti-glo{margin-top:8px;font-size:12.5px}
#etimos .etiitem .eti-glo button{background:none;border:0;padding:0;font:inherit;color:var(--accent);cursor:pointer;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}
#etimos mark{background:var(--accent);color:var(--on-accent);padding:0 2px;border-radius:3px}
#etimos .etiempty{color:var(--muted);padding:24px 2px}
#etimos .etiitem.eti-hit{outline:2px solid var(--accent);outline-offset:2px}
`;

let _etiReady = false;
function etiInject(){
  if (_etiReady) return;
  const st = document.createElement("style"); st.textContent = ETI_CSS;
  document.head.appendChild(st); _etiReady = true;
}

let etiQuery = "";
function etiRow(k, v){ return v ? '<div class="r"><span class="rk">' + etiT(k) + '</span><span class="rv">' + v + '</span></div>' : ""; }

function etiGlo(e){
  if (!e.g || typeof DICCIONARIO === "undefined" || !DICCIONARIO.some(g => g.id === e.g)) return "";
  return '<div class="eti-glo"><button type="button" data-eti-glo="' + etiEsc(e.g) + '">' + etiEsc(etiT("verTermino", { t: e.t })) + '</button></div>';
}

function etiRender(){
  etiInject();
  const box = document.getElementById("etimosbox");
  if (!box) return;
  const data = etiDatos();
  const q = etiFold(etiQuery);
  const rows = data.filter(e => !q || etiFold(e.t + " " + e.def + " " + (e.gr || "") + " " + (e.lat || "") + " " + (e.cast || "") + " " + (e.eusk || "")).includes(q));
  const tools = '<div class="etitools"><input class="etisearch" id="etisearch" type="search" placeholder="' +
    etiEsc(etiT("buscar")) + '" autocomplete="off" aria-label="' + etiEsc(etiT("buscar")) + '" value="' + etiEsc(etiQuery) + '"></div>' +
    '<p class="eticount">' + (rows.length === 1 ? etiT("cuenta1") : etiT("cuenta", { n: rows.length })) + '</p>';
  const list = !rows.length ? '<p class="etiempty">' + etiT("ninguno") + '</p>' :
    '<div class="etilist">' + rows.map(e => {
      const roots = '<div class="etiroots">' +
        etiRow("griego", etiFmt(e.gr)) + etiRow("latin", etiFmt(e.lat)) +
        etiRow("castellano", etiFmt(e.cast)) + etiRow("euskera", etiFmt(e.eusk)) + '</div>';
      return '<article class="etiitem"' + (e.id ? ' data-eid="' + etiEsc(e.id) + '"' : '') + '>' +
        '<div class="top"><h4>' + etiHi(etiEsc(e.t), etiQuery) + '</h4>' +
        (e.area ? '<span class="tag">' + etiEsc(e.area) + '</span>' : '') + '</div>' +
        roots + '<p class="def">' + etiHi(etiFmt(e.def), etiQuery) + '</p>' + etiGlo(e) + '</article>';
    }).join("") + '</div>';
  box.innerHTML = '<p class="cas-criterio">' + etiT("criterio") + '</p>' + tools + list;
  const inp = document.getElementById("etisearch");
  if (inp){
    let t = null;
    inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { etiQuery = inp.value.trim(); etiRender(); const f = document.getElementById("etisearch"); if (f){ f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 140); });
  }
}

/* clic en el enlace al glosario (delegado, acotado a la sección) */
document.addEventListener("click", e => {
  if (!e.target.closest("#etimos")) return;
  const g = e.target.closest("[data-eti-glo]");
  if (g){ (window.show || show)("diccionario"); if (typeof loadDiccionario === "function") loadDiccionario(g.dataset.etiGlo); }
});

/* enlace profundo #etimos/<id>: enmarca y trae a la vista el concepto */
function loadEtimos(id){
  etiQuery = ""; etiRender();
  if (!id) return;
  const el = document.querySelector('#etimosbox [data-eid="' + (id || "").replace(/"/g, "") + '"]');
  if (!el) return;
  el.classList.add("eti-hit");
  setTimeout(() => el.scrollIntoView({ block: "center", behavior: A11y.motion() }), 60);
}
window.loadEtimos = loadEtimos;

if (document.getElementById("etimosbox") && typeof ETIMOS !== "undefined") etiRender();
