"use strict";
/* ===== Esquemas en cuadrícula (prototipo, 08-10-2026) =====
   Coloca el árbol v2 de un esquema (raíz → ramas → hijos) en una cuadrícula compacta con la regla de
   vecindad 8: cada hijo ocupa una de las 8 celdas que rodean a su padre, una celda por concepto.
   Es el método de CREACIONMAPASCONCEPTUALES (CSP de febrero de 2026) portado a JavaScript:
   backtracking con reinicios aleatorios reproducibles (semilla fija) y la mejor colocación por
   puntuación (raíz al centro, flechas cortas, sin aspas de diagonales). Dibuja con una cuadrícula
   CSS (un concepto por celda) y un SVG encima para las flechas, con los colores del tema.
   Pestaña «Cuadrícula» de Esquemas, en todos los esquemas con v2 (prototipo del 08-10 con tres; extendido
   el mismo día a los 62 tras comprobar que todos caben: ≤17 nodos, ≤5 hijos por concepto). */
const EsqGrid = (function (){
  const NEIGH = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  /* ---- generador con semilla (mulberry32): la misma semilla da siempre la misma cuadrícula ---- */
  function rng(seed){ let a = seed >>> 0; return function (){ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, rnd){ for (let i = arr.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* ---- árbol a partir del v2: nodos {id, t, rel, a, k, depth, parent}, ordenados en profundidad con
     los subárboles grandes primero (el padre siempre va antes que el hijo) ---- */
  function buildTree(v){
    const nodes = [], children = {};
    function add(src, parent, depth, id){
      const n = { id: id, t: src.t, rel: src.rel || "", a: src.a || "", k: !!src.k, depth: depth, parent: parent };
      nodes.push(n); children[id] = [];
      (src.c || []).forEach(function (h, i){ children[id].push(add(h, id, depth + 1, id + "." + i)); });
      return id;
    }
    add({ t: v.raiz, c: v.ramas || [] }, null, 0, "r");
    const size = {};
    function sz(id){ size[id] = 1 + children[id].reduce(function (s, c){ return s + sz(c); }, 0); return size[id]; }
    sz("r");
    Object.keys(children).forEach(function (id){ children[id].sort(function (a, b){ return size[b] - size[a]; }); });
    const order = []; (function walk(id){ order.push(id); children[id].forEach(walk); })("r");
    const byId = {}; nodes.forEach(function (n){ byId[n.id] = n; });
    return { nodes: nodes, byId: byId, children: children, order: order };
  }

  /* ---- solver: una colocación aleatoria válida (o null) ---- */
  function solveOnce(tree, rows, cols, rnd, limit){
    const pos = {}, cellNode = {}, pending = {}, order = tree.order, rc = (rows - 1) / 2, cc = (cols - 1) / 2;
    order.forEach(function (id){ pending[id] = tree.children[id].length; });
    let steps = 0;
    function key(r, c){ return r * cols + c; }
    function neigh(r, c){ const out = []; for (const d of NEIGH){ const rr = r + d[0], c2 = c + d[1]; if (rr >= 0 && rr < rows && c2 >= 0 && c2 < cols) out.push([rr, c2]); } return out; }
    function free(r, c){ return neigh(r, c).filter(function (p){ return !(key(p[0], p[1]) in cellNode); }).length; }
    function feasible(r, c){
      for (const p of neigh(r, c)){ const n = cellNode[key(p[0], p[1])]; if (n !== undefined && pending[n] > 0 && free(p[0], p[1]) < pending[n]) return false; }
      const me = cellNode[key(r, c)]; return pending[me] === 0 || free(r, c) >= pending[me];
    }
    const cells = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r, c]);
    shuffle(cells, rnd); cells.sort(function (a, b){ return (Math.abs(a[0] - rc) + Math.abs(a[1] - cc) + rnd() * 1.5) - (Math.abs(b[0] - rc) + Math.abs(b[1] - cc) + rnd() * 1.5); });
    function place(i){
      if (i === order.length) return true;
      if (++steps > limit) return false;
      const id = order[i], par = tree.byId[id].parent;
      let cands;
      if (par === null) cands = cells;
      else { const p = pos[par]; cands = shuffle(neigh(p[0], p[1]).filter(function (q){ return !(key(q[0], q[1]) in cellNode); }), rnd); }
      for (const cell of cands){
        pos[id] = cell; cellNode[key(cell[0], cell[1])] = id; if (par !== null) pending[par]--;
        if (feasible(cell[0], cell[1]) && place(i + 1)) return true;
        if (par !== null) pending[par]++; delete cellNode[key(cell[0], cell[1])]; delete pos[id];
      }
      return false;
    }
    return place(0) ? pos : null;
  }

  function score(tree, pos, rows, cols){
    const rc = (rows - 1) / 2, cc = (cols - 1) / 2, r = pos.r;
    let s = Math.abs(r[0] - rc) + Math.abs(r[1] - cc);
    const diag = {};
    tree.nodes.forEach(function (n){ if (n.parent === null) return;
      const a = pos[n.parent], b = pos[n.id], dr = a[0] - b[0], dc = a[1] - b[1];
      s += Math.abs(dr) + Math.abs(dc);
      if (Math.abs(dr) === 1 && Math.abs(dc) === 1){ const k = Math.min(a[0], b[0]) + "," + Math.min(a[1], b[1]); (diag[k] = diag[k] || []).push(dr * dc); }
    });
    Object.keys(diag).forEach(function (k){ if (diag[k].indexOf(1) >= 0 && diag[k].indexOf(-1) >= 0) s += 50; });   /* aspa de dos diagonales */
    return s;
  }

  /* ---- comprobación previa (el «contrato» del método): un concepto solo tiene 8 vecinos, y sus nietos han de
     estar en la segunda corona (16 celdas). Con k hijos y g nietos hace falta 24 - k ≥ g. Devuelve null si cabe,
     o {id, k, g, cap} del primer concepto que no cabe: así el fallo se explica en vez de buscar a ciegas. ---- */
  function whyNotFit(tree){
    for (const id in tree.children){
      const k = tree.children[id].length;
      if (k > 8) return { id: id, k: k, g: 0, cap: 8 };
      const g = tree.children[id].reduce(function (s, c){ return s + tree.children[c].length; }, 0);
      if (g > 24 - k) return { id: id, k: k, g: g, cap: 24 - k };
    }
    return null;
  }

  /* ---- mejor colocación en rows×cols: reinicios cortos durante `ms` milisegundos (o `max` soluciones) ---- */
  function layout(tree, rows, cols, seed, ms, max, limit){
    if (tree.nodes.length > rows * cols) return null;
    if (whyNotFit(tree)) return null;
    const rnd = rng(seed || 1), t0 = Date.now();
    let best = null, bestS = Infinity, found = 0, tries = 0;
    /* presupuesto por nº de intentos (determinista con la semilla, no depende de la carga de la CPU); el tiempo solo es un tope de seguridad */
    while (tries < (ms || 300) && found < (max || 80) && Date.now() - t0 < 2500){
      tries++;
      const sol = solveOnce(tree, rows, cols, rnd, limit || 150);
      if (!sol) continue;
      found++; const sc = score(tree, sol, rows, cols);
      if (sc < bestS){ bestS = sc; best = sol; }
    }
    return best;
  }

  /* ---- formas de cuadrícula a probar, por orden, según el ancho disponible. Primero las que caben sin
     deslizar (tantas columnas como permita el ancho, de la más cuadrada a la más alta); si el árbol no
     cabe en ninguna (p. ej. varios nodos con 4 hijos en 3 columnas), las cuadradas con desplazamiento
     horizontal dentro de la cuadrícula. Las celdas pueden estrecharse hasta MIN_COL. ---- */
  const MIN_COL = 100, GAP = 20;
  function gridShapes(n, width){
    const sq = Math.max(4, Math.ceil(Math.sqrt(n))), out = [], seen = {};
    let fit = Math.max(2, Math.floor((width + GAP) / (MIN_COL + GAP)));   /* columnas que caben sin deslizar */
    if (fit < 3 && Math.floor((width + GAP) / (86 + GAP)) >= 3) fit = 3;   /* teléfono: 3 columnas con celdas de hasta 86 px antes que deslizar */
    function add(r, c, scroll){ const k = r + "x" + c; if (!seen[k]){ seen[k] = 1; out.push({ rows: r, cols: c, scroll: scroll }); } }
    if (n > 25 && fit < sq){ add(sq, sq, true); add(sq + 1, sq, true); }   /* mapas grandes en pantalla estrecha: las formas altas casi nunca caben y cuestan segundos; primero la cuadrada (con desplazamiento) */
    for (let c = Math.min(fit, sq); c >= 3; c--){ const r = Math.max(c, Math.ceil(n / c)); add(r, c, false); add(r + 1, c, false); }
    add(sq, sq, true); add(sq + 1, sq, true);
    if (fit < 3) for (let c = 3; c <= sq; c++){ add(Math.max(c, Math.ceil(n / c)), c, true); }
    return out;
  }

  const CSS = `
#esquemas .esqg-wrap{position:relative}
.esqg{--c:var(--hf);position:relative;display:grid;gap:22px 20px;font-family:var(--sans);color:var(--ink);align-items:stretch}
.esqg[data-s="fil"]{--c:var(--fil)} .esqg[data-s="ipc"]{--c:var(--ipc)}
.esqg-n{position:relative;z-index:1;border-radius:12px;padding:9px 10px;background:var(--surface-2);border:1px solid var(--line);font-size:1em;line-height:1.3;display:flex;flex-direction:column;justify-content:center;min-height:62px;overflow-wrap:anywhere}
.esqg-n[data-d="0"]{background:var(--c);color:var(--surface);border-color:var(--c);font-weight:700;font-size:1.08em;text-align:center;border-radius:999px;padding:12px 12px;letter-spacing:.02em}
.esqg-n[data-d="1"]{border:2px solid var(--c);background:color-mix(in srgb,var(--c) 12%,var(--surface));font-weight:700}
.esqg-n[data-d="2"]{background:var(--surface-2)}
.esqg-n[data-d="3"]{background:var(--surface);border-style:dashed}
.esqg-n.esqg-k .esqg-t{color:var(--c)}
.esqg-rel{display:block;font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0 0 2px}
.esqg-n[data-d="1"] .esqg-rel{color:var(--c)}
.esqg-t{font-weight:inherit}
.esqg-a{font-size:.8rem;color:var(--muted);font-style:italic;margin:2px 0 0}
#esquemas #esqsvg svg.esqg-svg,.esqg-svg{position:absolute;inset:0;width:100%;height:100%;max-width:none;margin:0;overflow:visible;pointer-events:none;z-index:0}   /* más específica que «#esquemas #esqsvg svg{height:auto}» de esquemasview.js */
.esqg-svg .esqg-e{fill:none;stroke:var(--muted);stroke-width:1.6}
.esqg-svg .esqg-m{fill:var(--muted)}
.esqg-svg .esqg-x path{fill:none;stroke:var(--c);stroke-width:1.5;stroke-dasharray:5 4}
.esqg-svg .esqg-x .esqg-mx{fill:var(--c)}
.esqg-svg .esqg-x text{font:italic 12px var(--sans);fill:var(--ink);text-anchor:middle;dominant-baseline:middle}
.esqg-svg .esqg-x rect{fill:var(--surface);stroke:var(--line);rx:4}
#esquemas #esqsvg svg.esqg-x-layer,.esqg-x-layer{z-index:2}
.esqg-b{display:inline-block;min-width:18px;height:18px;line-height:18px;border-radius:999px;background:var(--c);color:var(--surface);font-size:.7rem;font-weight:700;text-align:center;margin:0 3px 0 0;vertical-align:1px}
.esqg-n[data-d="0"] .esqg-b{background:var(--surface);color:var(--c)}
.esqg-bs{position:absolute;top:-9px;right:8px}
.esqg-xl{margin:12px 0 0;padding:10px 14px 10px 32px;border:1px dashed var(--line);border-radius:12px;font-size:.92rem}
.esqg-xl li{margin:3px 0}
.esqg-xl li::marker{color:var(--c);font-weight:700}
.esqg-xl em{color:var(--c);font-style:normal;font-weight:600}
.esqg-xl .esqg-xr{color:var(--muted)}
.esqg-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px}
.esqg-top .esq2-q{margin:0;flex:1 1 200px}
@media (max-width:520px){.esqg-n{padding:7px 8px;min-height:54px}}
.esqg-short .esqg-a{display:none}
.esqg-short .esqg-has{cursor:pointer}
.esqg-short .esqg-has::after{content:"+";position:absolute;right:7px;bottom:3px;font-size:.8rem;color:var(--muted);line-height:1}
.esqg-short .esqg-open .esqg-a{display:block;font-style:normal;color:var(--ink)}
.esqg-short .esqg-open::after{content:"−"}
@media print{.esqg-n{break-inside:avoid}.esqg-short .esqg-a{display:block}.esqg-short .esqg-has::after{content:""}}
`;
  let cssDone = false;
  function injectCss(){ if (cssDone) return; const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); cssDone = true; }
  function esc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* texto con **negrita** de Markdown (los mapas Markmap): se escapa y luego se marca */
  function md(s){ return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }

  /* Markmap (cabeceras # ## ### y viñetas) → árbol v2 {raiz, ramas:[{t, a, c}]}. En cada viñeta, «**Título**: resto»
     o «**Título** — resto» se parte en título (t) y detalle (a); si no, la línea entera es el título. */
  function fromMarkmap(mdText){
    const root = { t: "", c: [] }, stack = [{ lvl: 0, node: root }];
    let lastH = 0;
    mdText.split("\n").forEach(function (raw){
      const h = raw.match(/^(#+)\s+(.*)/), b = raw.match(/^(\s*)[-*]\s+(.*)/);
      if (!h && !b) return;
      let lvl, text;
      if (h){ lvl = h[1].length; lastH = lvl; text = h[2].trim(); }
      else { lvl = lastH + 1 + Math.floor(b[1].length / 2); text = b[2].trim(); }
      while (stack.length > 1 && stack[stack.length - 1].lvl >= lvl) stack.pop();
      const node = { t: text, c: [] };
      const m = text.match(/^\*\*([^*]+)\*\*\s*(?::|—|–|-)\s+(.+)$/);
      if (m){ node.t = m[1].trim(); node.a = m[2].trim(); }
      else if (!h && text.length > 28){
        /* viñeta larga sin «Título: resto»: etiqueta corta = las palabras en negrita (si las hay) o las primeras
           palabras; la frase entera queda como detalle (se ve al tocar la caja) */
        const bold = (text.match(/\*\*([^*]+)\*\*/g) || []).map(function (b){ return b.replace(/\*\*/g, ""); });
        const label = bold.length ? bold.join(" · ") : text.replace(/[*_]/g, "").split(/\s+/).slice(0, 5).join(" ") + "…";
        if (label.length < text.length - 6){ node.t = label; node.a = text; }
      }
      if (stack.length === 1 && !root.t && h && lvl === 1){ root.t = node.t; stack.push({ lvl: lvl, node: root }); return; }
      stack[stack.length - 1].node.c.push(node);
      stack.push({ lvl: lvl, node: node });
    });
    return { raiz: root.t || "·", ramas: root.c };
  }

  /* punto del borde de la caja `b` en la recta de su centro al punto (x,y) */
  function edgePoint(b, x, y){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = x - cx, dy = y - cy;
    if (!dx && !dy) return [cx, cy];
    const t = Math.min(Math.abs((b.w / 2) / (dx || 1e-9)), Math.abs((b.h / 2) / (dy || 1e-9)));
    return [cx + dx * t, cy + dy * t];
  }

  let showCross = false;   /* las curvas cruzan cajas en una cuadrícula densa: por defecto, insignias + leyenda */
  function drawArrows(grid, tree, cruces){
    const NS = "http://www.w3.org/2000/svg";
    grid.querySelectorAll(".esqg-svg").forEach(function (s){ s.remove(); });
    const g0 = grid.getBoundingClientRect(), box = {};
    grid.querySelectorAll(".esqg-n").forEach(function (el){ const r = el.getBoundingClientRect(); box[el.dataset.id] = { x: r.left - g0.left, y: r.top - g0.top, w: r.width, h: r.height }; });
    const mid = "esqg" + (++drawArrows.n);
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "esqg-svg");
    svg.innerHTML = '<defs><marker id="' + mid + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="esqg-m" d="M0,0 L10,5 L0,10 z"/></marker>' +
      '<marker id="' + mid + 'x" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="esqg-mx" d="M0,0 L10,5 L0,10 z"/></marker></defs>';
    tree.nodes.forEach(function (n){
      if (n.parent === null) return;
      const A = box[n.parent], B = box[n.id]; if (!A || !B) return;
      const p = edgePoint(A, B.x + B.w / 2, B.y + B.h / 2), q = edgePoint(B, A.x + A.w / 2, A.y + A.h / 2);
      const l = document.createElementNS(NS, "line"); l.setAttribute("class", "esqg-e");
      l.setAttribute("x1", p[0]); l.setAttribute("y1", p[1]); l.setAttribute("x2", q[0]); l.setAttribute("y2", q[1]); l.setAttribute("marker-end", "url(#" + mid + ")");
      svg.appendChild(l);
    });
    grid.appendChild(svg);
    /* relaciones entre ramas: curva discontinua por encima de las cajas, con su etiqueta */
    if (cruces && cruces.length){
      const byT = {}; tree.nodes.forEach(function (n){ if (!(n.t in byT)) byT[n.t] = n.id; });
      const sx = document.createElementNS(NS, "svg"); sx.setAttribute("class", "esqg-svg esqg-x-layer"); sx.style.display = showCross ? "" : "none";
      const g = document.createElementNS(NS, "g"); g.setAttribute("class", "esqg-x"); sx.appendChild(g);
      cruces.forEach(function (x, i){
        const A = box[byT[x.de]], B = box[byT[x.a]]; if (!A || !B) return;
        const ac = [A.x + A.w / 2, A.y + A.h / 2], bc = [B.x + B.w / 2, B.y + B.h / 2];
        const p = edgePoint(A, bc[0], bc[1]), q = edgePoint(B, ac[0], ac[1]);
        /* control desplazado en perpendicular (hacia el centro de la cuadrícula, para no salirse) */
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
        const off = 34 + 12 * (i % 3), gw = grid.clientWidth, gh = grid.clientHeight;
        let nx = -dy / len * off, ny = dx / len * off;
        if ((mx + nx - gw / 2) ** 2 + (my + ny - gh / 2) ** 2 > (mx - nx - gw / 2) ** 2 + (my - ny - gh / 2) ** 2){ nx = -nx; ny = -ny; }
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", "M" + p[0] + "," + p[1] + " Q" + (mx + nx) + "," + (my + ny) + " " + q[0] + "," + q[1]); path.setAttribute("marker-end", "url(#" + mid + "x)");
        const t = document.createElementNS(NS, "text"); t.setAttribute("x", mx + nx / 2); t.setAttribute("y", my + ny / 2); t.textContent = x.rel;
        g.appendChild(path); g.appendChild(t);
      });
      grid.appendChild(sx);
      g.querySelectorAll("text").forEach(function (t){ const b = t.getBBox(), r = document.createElementNS(NS, "rect");
        r.setAttribute("x", b.x - 4); r.setAttribute("y", b.y - 2); r.setAttribute("width", b.width + 8); r.setAttribute("height", b.height + 4); g.insertBefore(r, t); });
    }
  }
  drawArrows.n = 0;

  let ro = null;
  /* opts.short: cuadrícula de mapas: solo la etiqueta en cada caja; el detalle se abre al tocarla */
  function render(e, st, opts){
    const short = !!(opts && opts.short);
    injectCss();
    const v = e.v2, tree = buildTree(v), n = tree.nodes.length;
    const width = st.clientWidth || 700;
    let shape = null, pos = null;
    for (const sh of gridShapes(n, width)){ pos = layout(tree, sh.rows, sh.cols, 1, 300, 60); if (pos){ shape = sh; break; } }   /* 300 intentos por forma: las que no caben se descartan en ~0,1 s */
    if (!pos){
      const why = whyNotFit(tree);
      st.innerHTML = '<p class="esq-wait">' + (why
        ? "هذه الخريطة لا تتسع لها الشبكة: حول مفهوم له فروع كثيرة هكذا لا يوجد مكان لكل مفاهيمه الفرعية." + " (" + esc(tree.byId[why.id].t) + ": " + why.k + " → " + why.g + " / " + why.cap + ")"
        : "هذه الخطاطة لا تتسع لها الشبكة.") + "</p>";
      return;
    }
    const scrollX = !!shape.scroll;   /* solo cuando ninguna forma cabía en el ancho: celdas de MIN_COL y desplazamiento */
    const cellW = scrollX ? MIN_COL : (width - GAP * (shape.cols - 1)) / shape.cols;
    const fontPx = cellW < 125 ? 12.5 : cellW < 145 ? 13.5 : cellW < 170 ? 14.5 : 15.5;   /* letra según el ancho de celda */
    const hasX = Array.isArray(v.cruces) && v.cruces.length > 0;
    /* relaciones entre ramas: insignia numerada en las dos cajas (①…) y leyenda debajo de la cuadrícula */
    const badges = {};
    if (hasX) v.cruces.forEach(function (x, i){ [x.de, x.a].forEach(function (t){ (badges[t] = badges[t] || []).push(i + 1); }); });
    st.innerHTML = '<div class="esqg-top">' + (v.pregunta ? '<p class="esq2-q">' + esc(v.pregunta) + "</p>" : "") +
      (hasX ? '<label class="esq2-xtog"><input type="checkbox" id="esqgxtog"' + (showCross ? " checked" : "") + '> رسم العلاقات بين الفروع</label>' : "") + "</div>" +
      '<div class="esqg-wrap"' + (scrollX ? ' style="overflow-x:auto;padding-bottom:6px"' : "") + '><div class="esqg' + (short ? " esqg-short" : "") + '" data-s="' + esc(e.subject) + '" style="font-size:' + fontPx + 'px;grid-template-columns:repeat(' + shape.cols + ',minmax(' + (scrollX ? MIN_COL + "px" : "0") + ',1fr))">' +
      tree.nodes.map(function (nd){ const p = pos[nd.id];
        const bs = badges[nd.t] ? '<span class="esqg-bs">' + badges[nd.t].map(function (i){ return '<span class="esqg-b">' + i + "</span>"; }).join("") + "</span>" : "";
        return '<div class="esqg-n' + (nd.k ? " esqg-k" : "") + (short && nd.a ? " esqg-has" : "") + '" data-id="' + nd.id + '" data-d="' + Math.min(nd.depth, 3) + '" style="grid-row:' + (p[0] + 1) + ';grid-column:' + (p[1] + 1) + '">' + bs +
          (nd.rel ? '<span class="esqg-rel">' + esc(nd.rel) + "</span>" : "") + '<span class="esqg-t">' + md(nd.t) + "</span>" + (nd.a ? '<span class="esqg-a">' + md(nd.a) + "</span>" : "") + "</div>"; }).join("") +
      "</div></div>" +
      (hasX ? '<ol class="esqg-xl">' + v.cruces.map(function (x){ return "<li><em>" + esc(x.de) + '</em> <span class="esqg-xr">' + esc(x.rel) + "</span> <em>" + esc(x.a) + "</em></li>"; }).join("") + "</ol>" : "") +
      '<p class="esq2-hint">' + (scrollX ? "حرّكوا الشبكة نحو الجانبين." + " " : "") + (short ? "انقروا على مربع لرؤية نصه كاملًا." + " " : "") + "كل مفهوم يلامس المفهوم الذي يتفرع عنه (حتى بشكل قطري)." +
        (tree.nodes.some(function (nd){ return nd.rel; }) ? " " + "نوع العلاقة مكتوب داخل كل مربع." : "") + "</p>";   /* literales enteros entre comillas: así los traduce ui/<lang>.json */
    const grid = st.querySelector(".esqg");
    drawArrows(grid, tree, v.cruces);
    if (short) grid.querySelectorAll(".esqg-has").forEach(function (el){ el.addEventListener("click", function (){ el.classList.toggle("esqg-open"); drawArrows(grid, tree, v.cruces); }); });
    const cb = st.querySelector("#esqgxtog");
    if (cb) cb.addEventListener("change", function (){ showCross = cb.checked; const l = grid.querySelector(".esqg-x-layer"); if (l) l.style.display = showCross ? "" : "none"; });
    /* al cambiar el ancho: si cambia la forma de la cuadrícula se recoloca; si no, solo se redibujan las flechas */
    if (ro) ro.disconnect();
    if (window.ResizeObserver){
      let last = st.clientWidth, tm = null;
      ro = new ResizeObserver(function (){ clearTimeout(tm); tm = setTimeout(function (){
        if (!document.body.contains(grid)) return;
        const w = st.clientWidth;
        if (gridShapes(n, w)[0].cols !== gridShapes(n, last)[0].cols){ render(e, st); return; }   /* cambia el nº de columnas que caben: recolocar */
        if (w !== last){ last = w; drawArrows(grid, tree, v.cruces); }
      }, 120); });
      ro.observe(st);
    }
  }

  return { render: render, layout: layout, buildTree: buildTree, score: score, fromMarkmap: fromMarkmap, whyNotFit: whyNotFit };
})();
