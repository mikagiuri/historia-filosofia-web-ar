"use strict";
/* ===== Mi mapa (DUA, ficha D3.2; decisión del profesor P5, 24-10) =====
   El alumno hace su propio mapa mientras lee el tema o sus apuntes: escribe una idea por
   línea, la sangría cuelga unas ideas de otras y Markmap (el mismo de «Mapas
   conceptuales») lo dibuja al momento. No se entrega ni se corrige: es para estudiar.
   - Se guarda en el dispositivo (clave «aula-mimapa», que «Mi progreso» exporta).
   - Se descarga en un .html que se abre SIN CONEXIÓN (el dibujo va dentro, como SVG)
     y en un .md para volver a cargarlo aquí.
   - Se puede empezar desde un mapa de la web, entero o solo con las ramas principales.
   Solo en FIL y HF: tools/build_eso.js quita la sección y este fichero.
   Va en el conmutador de «Mapas e infografías» (conmutadores.js, regla 4.8). */
(function(){
  const sec = document.getElementById("mimapa");
  if (!sec) return;
  const KEY = "aula-mimapa";
  const $ = id => document.getElementById(id);
  const selMios = $("mmmios"), titulo = $("mmtitulo"), texto = $("mmtexto"), svg = $("mmsvg");
  const selBase = $("mmbase"), soloRamas = $("mmsolo");

  /* ---- guardado: { actual: id, mapas: { id: { titulo, texto, fecha } } } ---- */
  function leer(){ const s = store.get(KEY, null); return s && s.mapas ? s : { actual: null, mapas: {} }; }
  let st = leer();
  function nuevoId(){ return "m" + Date.now().toString(36); }
  function guardar(){ store.set(KEY, st); }
  function actual(){
    if (!st.actual || !st.mapas[st.actual]){
      const ids = Object.keys(st.mapas);
      if (ids.length) st.actual = ids[ids.length - 1];
      else { st.actual = nuevoId(); st.mapas[st.actual] = { titulo: "", texto: "", fecha: Date.now() }; }
    }
    return st.mapas[st.actual];
  }

  /* ---- texto con sangría → Markdown de Markmap ---- */
  function nivel(linea){
    const m = /^[\t ]*/.exec(linea)[0];
    let n = 0; for (const c of m) n += c === "\t" ? 2 : 1;
    return Math.floor(n / 2);
  }
  function aMarkdown(tit, txt){
    const lineas = String(txt || "").split(/\r?\n/).filter(l => l.trim());
    const base = lineas.length ? Math.min.apply(null, lineas.map(nivel)) : 0;
    const cuerpo = lineas.map(l => "  ".repeat(Math.max(0, nivel(l) - base)) + "- " + l.trim().replace(/^[-*•·]\s+/, "")).join("\n");
    return "# " + (String(tit || "").trim() || "خريطتي") + "\n\n" + cuerpo + "\n";
  }
  /* Markdown (de un .md o de un mapa de la web) → título + texto con sangría */
  function deMarkdown(md, soloPrincipales){
    let tit = "", out = [], prof = 0;
    String(md || "").split(/\r?\n/).forEach(l => {
      if (!l.trim()) return;
      const h = /^(#{1,6})\s+(.*)$/.exec(l.trim());
      if (h){
        if (h[1].length === 1 && !tit){ tit = h[2]; return; }
        prof = h[1].length - 2;
        if (!soloPrincipales || prof < 2) out.push("  ".repeat(Math.max(0, prof)) + h[2]);
        prof = Math.max(0, prof) + 1;
        return;
      }
      const li = /^(\s*)[-*+]\s+(.*)$/.exec(l);
      const n = (li ? Math.floor(li[1].replace(/\t/g, "  ").length / 2) : 0) + prof;
      if (!soloPrincipales || n < 2) out.push("  ".repeat(n) + (li ? li[2] : l.trim()));
    });
    return { titulo: tit.replace(/<[^>]+>/g, ""), texto: out.map(s => s.replace(/<[^>]+>/g, "")).join("\n") };
  }

  /* ---- dibujo con Markmap (lo carga lazy_libs.js al abrir la vista) ---- */
  let mm = null, tf = null, espera = false;
  function listo(){ const k = window.markmap; return k && typeof k.Transformer === "function" && k.Markmap && typeof k.Markmap.create === "function"; }
  function dibujar(){
    if (!sec.classList.contains("active")) return;
    if (!listo()){
      if (espera) return; espera = true;
      setTimeout(() => { espera = false; dibujar(); }, 250);
      return;
    }
    const m = actual();
    const k = window.markmap;
    if (!tf) tf = new k.Transformer();
    const data = tf.transform(aMarkdown(m.titulo, m.texto)).root;
    if (!mm) mm = k.Markmap.create(svg, { autoFit: true, initialExpandLevel: -1, colorFreezeLevel: 2, spacingVertical: 6, spacingHorizontal: 80, paddingX: 14, duration: 200 }, data);
    else mm.setData(data);
    requestAnimationFrame(() => { try { mm.fit(); } catch (e) {} });
  }
  window.drawMiMapa = dibujar;

  /* ---- interfaz ---- */
  function pintarLista(){
    const ids = Object.keys(st.mapas);
    selMios.innerHTML = ids.map(id => {
      const m = st.mapas[id];
      return '<option value="' + id + '">' + esc((m.titulo || "").trim() || "بلا عنوان") + "</option>";
    }).join("");
    selMios.value = st.actual;
  }
  function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function cargarEnEditor(){ const m = actual(); titulo.value = m.titulo; texto.value = m.texto; pintarLista(); dibujar(); }

  let t = null;
  function alEscribir(){
    const m = actual(); m.titulo = titulo.value; m.texto = texto.value; m.fecha = Date.now();
    guardar();
    clearTimeout(t); t = setTimeout(() => { pintarLista(); dibujar(); }, 350);
  }
  titulo.addEventListener("input", alEscribir);
  texto.addEventListener("input", alEscribir);

  /* Tab y Mayús+Tab sangran y quitan sangría en el cuadro; Esc lo suelta para que Tab
     vuelva a mover el foco (WCAG 2.1.2: sin trampa de teclado; se dice en la entradilla). */
  let suelto = false;
  texto.addEventListener("keydown", e => {
    if (e.key === "Escape"){ suelto = true; return; }
    if (e.key !== "Tab" || suelto) return;
    e.preventDefault();
    const v = texto.value, a = texto.selectionStart, b = texto.selectionEnd;
    const ini = v.lastIndexOf("\n", a - 1) + 1, fin = v.indexOf("\n", b) === -1 ? v.length : v.indexOf("\n", b);
    const bloque = v.slice(ini, fin).split("\n");
    const nuevo = bloque.map(l => e.shiftKey ? l.replace(/^( {1,2}|\t)/, "") : "  " + l).join("\n");
    texto.value = v.slice(0, ini) + nuevo + v.slice(fin);
    const d = nuevo.length - (fin - ini);
    texto.selectionStart = bloque.length > 1 ? ini : Math.max(ini, a + (e.shiftKey ? Math.min(0, d) : 2));
    texto.selectionEnd = bloque.length > 1 ? ini + nuevo.length : texto.selectionStart + (b - a);
    alEscribir();
  });
  texto.addEventListener("focus", () => { suelto = false; });

  selMios.addEventListener("change", () => { st.actual = selMios.value; guardar(); cargarEnEditor(); });
  $("mmnuevo").addEventListener("click", () => {
    st.actual = nuevoId(); st.mapas[st.actual] = { titulo: "", texto: "", fecha: Date.now() };
    guardar(); cargarEnEditor(); titulo.focus();
  });
  $("mmborrar").addEventListener("click", () => {
    if (!confirm("هل تريد حذف هذه الخريطة من هذا الجهاز؟ لا يمكن التراجع.")) return;
    delete st.mapas[st.actual]; st.actual = null; guardar(); cargarEnEditor();
  });

  /* empezar desde un mapa de la web (los de esta materia) */
  if (typeof MAPS !== "undefined"){
    selBase.innerHTML = '<option value="">—</option>' + Object.keys(MAPS).map(k => '<option value="' + k + '">' + esc(MAPS[k].title) + "</option>").join("");
  }
  $("mmusar").addEventListener("click", () => {
    const k = selBase.value; if (!k || typeof MAPS === "undefined" || !MAPS[k]) return;
    const m = actual();
    if ((m.texto.trim() || m.titulo.trim()) && !confirm("سيحلّ هذا محلّ ما في الخريطة المفتوحة. هل تتابع؟")) return;
    const r = deMarkdown(MAPS[k].md, soloRamas.checked);
    m.titulo = r.titulo || MAPS[k].title; m.texto = r.texto; m.fecha = Date.now();
    guardar(); cargarEnEditor();
  });

  /* ---- descargas ---- */
  function nombre(ext){
    const s = (actual().titulo || "mi mapa").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "mi_mapa";
    return "mapa_" + s + "." + ext;
  }
  function bajar(contenido, tipo, fichero){
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement("a"); a.href = url; a.download = fichero;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  $("mmmd").addEventListener("click", () => { const m = actual(); bajar(aMarkdown(m.titulo, m.texto), "text/markdown;charset=utf-8", nombre("md")); });
  /* .html que se abre SIN CONEXIÓN. Lleva dentro d3 y markmap-view (las mismas versiones que
     carga la web, ~300 KB) y los datos del mapa: se puede plegar, desplegar y ampliar como aquí.
     Si al descargar no hay conexión para recogerlas, se guarda el dibujo estático (SVG). */
  const LIBS = ["https://cdn.jsdelivr.net/npm/d3@7.9.0", "https://cdn.jsdelivr.net/npm/markmap-view@0.18.10"];
  /* Las dos licencias piden que el aviso vaya en cada copia: van enteras en un comentario del .html
     y, a la vista, una línea al pie. Textos de cdn.jsdelivr.net/npm/<paquete>@<versión>/LICENSE (24-10). */
  const LICENCIAS = "d3 7.9.0 (licencia ISC)\n\nCopyright 2010-2023 Mike Bostock\n\n" +
    "Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\n" +
    "THE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.\n\n" +
    "markmap-view 0.18.10 (MIT License)\n\nCopyright (c) 2020 Gerald\n\n" +
    "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\n" +
    "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\n" +
    "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.";
  const OPC = { initialExpandLevel: -1, colorFreezeLevel: 2, spacingVertical: 6, spacingHorizontal: 80, paddingX: 14, duration: 200 };
  function cabecera(tit, extra){
    return '<!doctype html>\n<html lang="' + (document.documentElement.lang || "es") + '"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + tit + '</title>' +
      '<style>html,body{margin:0;height:100%;font-family:system-ui,sans-serif;background:#fff;color:#222}' +
      'h1{font-size:1.15rem;margin:0;padding:12px 16px 4px}p{margin:0;padding:0 16px 8px;font-size:.85rem;color:#555}' +
      'svg{display:block;width:100%;height:calc(100% - 90px)}footer{padding:4px 16px;font-size:.75rem;color:#666}' + (extra || "") + '</style></head><body>\n<!--\n' + LICENCIAS.replace(/--/g, "- -") + '\n-->\n<h1>' + tit + '</h1>';
  }
  function pie(){ return "<footer>" + esc("رُسمت باستخدام d3 (رخصة ISC، © Mike Bostock) وmarkmap (رخصة MIT، © Gerald)؛ ونصوص الرخصتين موجودة داخل هذا الملف.") + "</footer>\n"; }
  function svgEstatico(tit){
    const g = svg.querySelector("g"); if (!g || !mm) return null;
    const r = mm.state && mm.state.rect, pad = 20;
    const bb = r && isFinite(r.x2 - r.x1) && r.x2 > r.x1 ? { x: r.x1, y: r.y1, width: r.x2 - r.x1, height: r.y2 - r.y1 } : g.getBBox();
    const copia = svg.cloneNode(true);
    copia.querySelector("g").removeAttribute("transform");
    copia.setAttribute("viewBox", (bb.x - pad) + " " + (bb.y - pad) + " " + (bb.width + 2 * pad) + " " + (bb.height + 2 * pad));
    copia.removeAttribute("style"); copia.removeAttribute("id");
    copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return cabecera(tit, "svg{height:auto;max-width:100%}") + copia.outerHTML + pie() + "</body></html>\n";
  }
  $("mmhtml").addEventListener("click", async () => {
    if (!listo()) return;
    const m = actual(), tit = esc((m.titulo || "").trim() || "خريطتي");
    if (!tf) tf = new window.markmap.Transformer();
    const datos = JSON.stringify(tf.transform(aMarkdown(m.titulo, m.texto)).root).replace(/</g, "\\u003c");
    let pag = null;
    try {
      const codigo = await Promise.all(LIBS.map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); })));
      const js = codigo.map(c => "<script>" + c.replace(/<\/script/gi, "<\\/script") + "<\/script>").join("\n");
      pag = cabecera(tit) + '<p>' + esc("اضغط على عقدة لطيّ فروعها أو بسطها؛ واسحب للتنقّل، واستعمل العجلة للتكبير.") + '</p>' +
        '<svg id="m"></svg>\n' + pie() + js + '\n<script>markmap.Markmap.create(document.getElementById("m"), ' + JSON.stringify(OPC) + ', ' + datos + ');<\/script>\n</body></html>\n';
    } catch (e) { pag = svgEstatico(tit); }
    if (pag) bajar(pag, "text/html;charset=utf-8", nombre("html"));
  });
  $("mmcargar").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      const r = deMarkdown(String(lector.result || ""), false);
      st.actual = nuevoId(); st.mapas[st.actual] = { titulo: r.titulo || f.name.replace(/\.[^.]+$/, ""), texto: r.texto, fecha: Date.now() };
      guardar(); cargarEnEditor();
    };
    lector.readAsText(f);
    e.target.value = "";
  });

  cargarEnEditor();
  /* lazy_libs.js carga Markmap al abrir la vista; el dibujo se hace cada vez que la sección se
     vuelve visible (al cargar está oculta y sin tamaño, y con un enlace #mimapa se activa tarde). */
  new MutationObserver(() => { if (sec.classList.contains("active")) setTimeout(dibujar, 0); })
    .observe(sec, { attributes: true, attributeFilter: ["class"] });
})();
