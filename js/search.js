"use strict";
/* ===== Buscador global «Buscar en el aula» =====
   Paleta de comandos que indexa (1) las SECCIONES del menú (cualquier data-view), (2) los TÍTULOS del
   contenido con clave (teoría, lecturas, materiales, infografías, cuestionarios, tarjetas, esquemas, PAU,
   ilustres, clases) y, desde el 08-10, (3) el TEXTO COMPLETO: cada apartado de la teoría, cada término
   del glosario con su definición, cada pregunta de los cuestionarios, cada tarjeta, cada cita y cada
   párrafo de las lecturas. Los resultados salen con el fragmento donde aparece lo buscado, agrupados
   por tipo, y abren el apartado exacto (teoría «#teoria/clave/n», glosario filtrado por el término,
   y en lecturas, citas y tarjetas se desplaza al fragmento). La coincidencia es por raíz: «epicúreo»
   encuentra «epicureísmo»; «ideak» encuentra «ideia» (reglas simples de castellano y euskera, sin
   diccionario). El índice se construye una vez, al abrir el buscador (unos 3 MB de texto: décimas de
   segundo). Navega reutilizando show() + los loaders globales; no cambia la estructura de navegación.
   Atajos: Ctrl/⌘+K o «/» para abrir, Esc para cerrar, ↑↓ mover, ↵ abrir. */
(function(){
  /* ---- normalización ----
     fold(): minúsculas y sin acentos, CONSERVANDO la longitud (carácter a carácter), para poder localizar
     la coincidencia en el texto original y recortar el fragmento. norm(): la antigua, por si se necesita. */
  var ACC = { "á":"a","à":"a","ä":"a","â":"a","ã":"a","é":"e","è":"e","ë":"e","ê":"e","í":"i","ì":"i","ï":"i","î":"i",
    "ó":"o","ò":"o","ö":"o","ô":"o","õ":"o","ú":"u","ù":"u","ü":"u","û":"u","ñ":"n","ç":"c","ý":"y" };
  function fold(s){ return (s == null ? "" : String(s)).toLowerCase().replace(/[áàäâãéèëêíìïîóòöôõúùüûñçý]/g, function(c){ return ACC[c] || c; }); }
  var _tmp = null;
  function textOf(n){   /* texto de un elemento: entidades decodificadas y un espacio entre bloques contiguos */
    if (!_tmp) _tmp = document.createElement("div");
    _tmp.innerHTML = (n.innerHTML || "").replace(/<(br|\/p|\/li|\/td|\/th|\/tr|\/h[1-6]|\/div|\/dd|\/dt|\/blockquote|\/figcaption)[^>]*>/gi, " $&");
    return (_tmp.textContent || "").replace(/\s+/g, " ").trim();
  }
  function strip(s){ return String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/\*\*?/g, "").replace(/\s+/g, " ").trim(); }
  /* raíz: quita terminaciones frecuentes del castellano y del euskera; solo en palabras de 5+ letras y
     dejando al menos 4. «epicureismo» y «epicureos» → «epicure»; «ideiak», «ideiaren» → «ideia». */
  var SUF = ["mente", "ciones", "cion", "siones", "sion", "ismos", "ismo", "istas", "ista", "idades", "idad", "ables", "able", "ibles", "ible",
    "mientos", "miento", "adores", "ador", "ismoa", "ismoak", "tasuna", "tasunak", "tasun", "keta", "ketak", "ekin", "arekin", "etara", "etako", "etan",
    "aren", "arentzat", "ari", "ak", "ek", "ko", "ra", "tik", "an", "es", "os", "as", "o", "a", "e", "s"];
  function stem(w){
    if (w.length < 5) return w;
    for (var i = 0; i < SUF.length; i++){
      var sf = SUF[i];
      if (w.length - sf.length >= 4 && w.slice(-sf.length) === sf) return w.slice(0, -sf.length);
    }
    return w;
  }
  function stems(text){ return " " + fold(text).split(/[^a-z0-9]+/).filter(Boolean).map(stem).join(" ") + " "; }

  var SUBJ = { fil: "الفلسفة 1", hf: "تاريخ الفلسفة", ipc: "التفكير النقدي" };
  function subjName(s){ return SUBJ[s] || ""; }
  var BLOCK = { A: "المحور A", B: "المحور B", C: "المحور C" };
  var LOADER = window.VIEW_LOADERS || {
    teoria: "loadTheory", lecturas: "loadLectura", materiales: "loadMaterial",
    infografias: "loadInfografia", cuestionarios: "loadQuiz", tarjetas: "loadDeck",
    esquemas: "loadEsq", pau: "loadPau", mapas: "loadMap"
  };
  /* orden de los grupos en los resultados */
  var ORDER = ["القسم", "الدروس", "الفقرة", "مسرد المصطلحات", "قراءة", "مقطع", "اقتباس", "سؤال", "بطاقة", "خطاطة", "المورد", "قصة", "إنفوغرافيك", "اختبار", "بطاقات", "PAU", "علَم", "Clase"];

  var index = null;
  /* entrada: { type, label, meta, go, arg, text (fragmento original donde buscar), hay (fold de label+meta+clave),
                body (fold del texto), st (raíces del texto), find (texto que localizar en la vista al abrir) } */
  function add(out, e){
    var full = (e.label || "") + " " + (e.meta || "") + " " + (e.arg || "");
    e.hay = fold(full); e.body = fold(e.text || ""); e.st = stems(full + " " + (e.text || ""));
    out.push(e);
  }
  function build(){
    if (index) return index;
    var out = [];
    /* (1) Secciones del menú */
    var seen = {}, tabs = document.getElementById("tabs");
    if (tabs) tabs.querySelectorAll("button[data-view]").forEach(function(b){
      var id = b.dataset.view, label = strip(b.textContent);
      if (!id || seen[id]) return; seen[id] = 1;
      add(out, { type: "القسم", label: label, meta: "الانتقال إلى القسم", go: id, arg: null, text: "" });
    });
    /* (2) títulos con clave */
    function addAll(obj, go, labelFn, metaFn, type, textFn){
      if (typeof obj === "undefined" || !obj) return;
      Object.keys(obj).forEach(function(k){
        var it = obj[k]; if (!it) return;
        var label = strip(labelFn(it)); if (!label) return;
        add(out, { type: type, label: label, meta: strip(metaFn(it)), go: go, arg: k, text: textFn ? strip(textFn(it)) : "" });
      });
    }
    var T = typeof THEORY !== "undefined" ? THEORY : null;
    addAll(T, "teoria", function(i){ return i.title; }, function(i){ return i.tema; }, "الدروس");
    var LE = typeof LECTURAS !== "undefined" ? LECTURAS : null;
    addAll(LE, "lecturas", function(i){ return i.title; }, function(i){ return i.tema; }, "قراءة");
    var matsSinCuentos = null, cuentos = null;
    if (typeof MATERIALS !== "undefined" && MATERIALS){ matsSinCuentos = {}; cuentos = {}; Object.keys(MATERIALS).forEach(function(k){ (/^ipc-lec-/.test(k) && !/soluciones/.test(k) ? cuentos : matsSinCuentos)[k] = MATERIALS[k]; }); }
    addAll(matsSinCuentos, "materiales", function(i){ return i.title; }, function(i){ return i.tema; }, "المورد", function(i){ return i.html || i.desc || ""; });
    addAll(cuentos, "cuentos", function(i){ return i.title; }, function(i){ return "قصص للتفكير"; }, "قصة");
    addAll(typeof INFOGRAFIAS !== "undefined" ? INFOGRAFIAS : null, "infografias", function(i){ return i.label || i.title; }, function(i){ return subjName(i.subject) + (i.block && BLOCK[i.block] ? " · " + BLOCK[i.block] : ""); }, "إنفوغرافيك");
    var Q = typeof QUIZZES !== "undefined" ? QUIZZES : null;
    addAll(Q, "cuestionarios", function(i){ return i.name; }, function(i){ return subjName(i.subject); }, "اختبار");
    var D = typeof DECKS !== "undefined" ? DECKS : null;
    addAll(D, "tarjetas", function(i){ return i.name; }, function(i){ return subjName(i.subject); }, "بطاقات");
    var ES = typeof ESQUEMAS !== "undefined" ? ESQUEMAS : null;
    addAll(ES, "esquemas", function(i){ return i.title; }, function(i){ return i.tema || subjName(i.subject); }, "خطاطة", function(i){
      if (!i.v2) return ""; var parts = [i.v2.pregunta || "", i.v2.raiz || "", i.v2.idea || ""];
      (function walk(n){ parts.push((n.rel || "") + " " + (n.t || "") + " " + (n.d || "") + " " + (n.a || "")); (n.c || []).forEach(walk); })({ c: i.v2.ramas || [] });
      return parts.join(" · "); });
    addAll(typeof PAU !== "undefined" ? PAU : null, "pau", function(i){ return i.title; }, function(i){ return i.kick || "PAU"; }, "PAU");
    addAll(typeof ILUSTRES !== "undefined" ? ILUSTRES : null, "ilustres", function(i){ return i.name; }, function(i){ return i.dates + (i.role ? " · " + i.role : ""); }, "علَم", function(i){ return [i.idea, i.bio, i.anecdota].filter(Boolean).join(" · "); });
    addAll(typeof CLASES_IDX !== "undefined" ? CLASES_IDX : null, "clases", function(i){ return i.label; }, function(i){ return i.meta; }, "Clase");

    /* (3) texto completo */
    /* teoría: un apartado por cada <h2> de primer nivel, con el mismo número que el «§» (theoryMarcaSecs) */
    if (T) Object.keys(T).forEach(function(k){
      var t = T[k]; if (!t || !t.html) return;
      var d = document.createElement("div"); d.innerHTML = t.html;
      var sec = 0, title = "", buf = [];
      function flush(){
        var text = strip(buf.join(" ")); buf = [];
        if (!text) return;
        add(out, { type: "الفقرة", label: (title || t.title), meta: t.title + " · " + t.tema, go: "teoria", arg: sec ? k + "/" + sec : k, text: text });
      }
      [].forEach.call(d.children, function(n){
        if (n.tagName === "H2"){ flush(); sec++; title = strip(n.textContent); }
        else buf.push(textOf(n));
      });
      flush();
    });
    /* glosario: término + definición (+ raíz) */
    if (typeof GLOSARIO !== "undefined" && GLOSARIO) GLOSARIO.forEach(function(g){
      add(out, { type: "مسرد المصطلحات", label: g.t, meta: (g.area || "") + (g.tema ? " · " + g.tema : ""), go: "glosario", arg: null, glo: g, text: strip((g.def || "") + (g.et ? " · " + g.et : "")) });
    });
    /* lecturas: por párrafo (o bloque), agrupando los muy cortos */
    if (LE) Object.keys(LE).forEach(function(k){
      var t = LE[k]; if (!t || !t.html) return;
      var d = document.createElement("div"); d.innerHTML = t.html;
      var cur = "", h = "";
      function flush(){ var text = strip(cur); cur = ""; if (text.length > 40) add(out, { type: "مقطع", label: h || t.title, meta: t.title, go: "lecturas", arg: k, text: text, find: text.slice(0, 60) }); }
      [].forEach.call(d.querySelectorAll("h2, h3, p, li, blockquote"), function(n){
        if (n.tagName === "H2" || n.tagName === "H3"){ flush(); h = strip(n.textContent); return; }
        if (n.closest("blockquote") && n.tagName !== "BLOCKQUOTE") return;
        cur += " " + textOf(n);
        if (cur.length > 500) flush();
      });
      flush();
    });
    /* cuestionarios: cada pregunta con sus opciones */
    if (Q) Object.keys(Q).forEach(function(k){
      var q = Q[k]; if (!q || !q.items) return;
      q.items.forEach(function(it){ if (it && it.q) add(out, { type: "سؤال", label: strip(it.q), meta: q.name, go: "cuestionarios", arg: k, text: strip((it.o || []).join(" · ")) }); });
    });
    /* tarjetas: anverso y reverso */
    if (D) Object.keys(D).forEach(function(k){
      var dk = D[k]; if (!dk || !dk.cards) return;
      dk.cards.forEach(function(c){ if (c && c[1]) add(out, { type: "بطاقة", label: strip(c[1]), meta: dk.name, go: "tarjetas", arg: k, text: strip(c[2] || ""), find: strip(c[1]).slice(0, 60) }); });
    });
    /* citas */
    if (typeof CITAS !== "undefined" && CITAS && document.getElementById("citas")) CITAS.forEach(function(c){
      if (c && c.c) add(out, { type: "اقتباس", label: strip(c.c), meta: c.a || "", go: "citas", arg: null, text: strip(c.o || ""), find: strip(c.c).slice(0, 60) });
    });
    /* adagios (09-10) */
    if (typeof ADAGIOS !== "undefined" && ADAGIOS && document.getElementById("adagios")) ADAGIOS.forEach(function(a){
      if (a && a.es) add(out, { type: "مأثورة", label: a.es, meta: "", go: "adagios", arg: a.id, text: strip(a.la + " " + (a.sen || "") + " " + (a.o || "")), find: a.es.slice(0, 60) });   // el latín, solo tras λ: se busca pero no se muestra
    });
    index = out;
    return out;
  }

  /* ---- búsqueda ---- */
  function matchTok(e, t){
    if (e.hay.indexOf(t) >= 0 || e.body.indexOf(t) >= 0) return true;
    var s = stem(t); if (s.length < 3) return false;
    return e.st.indexOf(" " + s) >= 0;   /* raíz de la palabra buscada = inicio de alguna raíz del texto */
  }
  function search(q){
    var nq = fold(q).trim();
    if (!nq) return [];
    var toks = nq.split(/[^a-z0-9]+/).filter(Boolean);
    if (!toks.length) return [];
    var res = [];
    build().forEach(function(e){
      for (var i = 0; i < toks.length; i++) if (!matchTok(e, toks[i])) return;
      var nl = fold(e.label), score = 0;
      if (nl === nq) score -= 200;
      else if (nl.indexOf(nq) === 0) score -= 120;
      else if (nl.indexOf(nq) >= 0) score -= 60;
      else if (e.hay.indexOf(nq) >= 0) score -= 30;
      else if (e.body.indexOf(nq) >= 0) score -= 20;   /* la frase entera, en el texto */
      if (e.type === "القسم") score -= 5;
      if (e.type === "مسرد المصطلحات") score -= 10;
      score += Math.min(10, Math.floor((e.text || "").length / 400));   /* a igualdad, el fragmento corto */
      res.push({ e: e, score: score });
    });
    res.sort(function(a, b){ return a.score - b.score || a.e.label.localeCompare(b.e.label); });
    /* agrupado por tipo, en el orden de ORDER, con tope por grupo y total */
    var groups = {}, total = 0;
    res.forEach(function(r){ var t = r.e.type; if (!groups[t]) groups[t] = []; if (groups[t].length < 12 && total < 80){ groups[t].push(r.e); total++; } });
    var items = [];
    ORDER.concat(Object.keys(groups).filter(function(t){ return ORDER.indexOf(t) < 0; })).forEach(function(t){
      if (groups[t]) groups[t].forEach(function(e){ items.push(e); });
    });
    return { items: items, total: res.length, toks: toks };
  }

  /* fragmento con la primera coincidencia resaltada: busca en el texto original mediante fold() (misma longitud) */
  function snippet(e, toks){
    var src = e.text || "", f = e.body, pos = -1, len = 0;
    for (var i = 0; i < toks.length && pos < 0; i++){
      var p = f.indexOf(toks[i]); if (p >= 0){ pos = p; len = toks[i].length; }
      else { var s = stem(toks[i]); if (s.length >= 3){ var re = new RegExp("(^|[^a-z0-9])(" + s + "[a-z0-9]*)"); var m = re.exec(f); if (m){ pos = m.index + m[1].length; len = m[2].length; } } }
    }
    if (pos < 0) return { pre: src.slice(0, 160), hit: "", post: src.length > 160 ? "…" : "" };
    var a = Math.max(0, pos - 70), b = Math.min(src.length, pos + len + 110);
    if (a > 0){ var sp = src.lastIndexOf(" ", a + 15); if (sp > 0 && sp < pos) a = sp + 1; }
    return { pre: (a > 0 ? "…" : "") + src.slice(a, pos), hit: src.slice(pos, pos + len), post: src.slice(pos + len, b) + (b < src.length ? "…" : "") };
  }
  function markLabel(label, toks){
    var f = fold(label);
    for (var i = 0; i < toks.length; i++){ var p = f.indexOf(toks[i]); if (p >= 0) return { pre: label.slice(0, p), hit: label.slice(p, p + toks[i].length), post: label.slice(p + toks[i].length) }; }
    return { pre: label, hit: "", post: "" };
  }

  /* ---- interfaz ---- */
  var ov, input, list, count, current = [], sel = -1, lastToks = [];

  function css(){
    var s = document.createElement("style");
    s.textContent =
      ".searchbtn{margin-right:.15rem}" +
      ".search-ov{position:fixed;inset:0;z-index:1000;display:flex;justify-content:center;align-items:flex-start;" +
        "padding:8vh 16px 16px;background:rgba(20,21,25,.42);backdrop-filter:blur(2px)}" +
      ".search-ov[hidden]{display:none}" +
      ".search-box{width:min(720px,100%);background:var(--surface,#fff);color:var(--ink,#222);" +
        "border:1px solid var(--line,#ccc);border-radius:var(--radius,14px);box-shadow:var(--shadow,0 12px 40px rgba(0,0,0,.3));overflow:hidden;display:flex;flex-direction:column;max-height:84vh}" +
      ".search-box input{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--line,#ccc);" +
        "background:transparent;color:inherit;font:500 1.05rem/1.3 var(--sans,system-ui);padding:.95rem 1.1rem;outline:none}" +
      ".search-count{padding:.35rem 1rem 0;color:var(--muted,#666);font-size:.78rem}" +
      ".search-res{list-style:none;margin:0;padding:.3rem;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}" +
      ".search-res li.s-group{padding:.6rem .7rem .15rem;color:var(--muted,#666);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600;cursor:default}" +
      ".search-res li.s-it{display:grid;grid-template-columns:1fr auto;gap:.1rem .6rem;padding:.5rem .7rem;border-radius:10px;cursor:pointer}" +
      ".search-res li .s-label{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".search-res li .s-meta{grid-column:1/-1;color:var(--muted,#666);font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".search-res li .s-snip{grid-column:1/-1;font-size:.86rem;line-height:1.35;color:var(--ink,#222);opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".search-res li mark{background:color-mix(in srgb,var(--accent,#357) 22%,transparent);color:inherit;border-radius:3px;padding:0 1px}" +
      ".search-res li .s-type{color:var(--muted,#666);font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;" +
        "border:1px solid var(--line,#ccc);border-radius:999px;padding:.05rem .5rem;flex:none;align-self:start}" +
      ".search-res li.sel,.search-res li.s-it:hover{background:var(--surface-2,#eee)}" +
      ".search-res li.sel .s-type{border-color:var(--accent,#357)}" +
      ".search-empty{padding:.9rem 1rem;color:var(--muted,#666)}" +
      ".search-hint{padding:.5rem .9rem;border-top:1px solid var(--line,#ccc);color:var(--muted,#666);font-size:.78rem}" +
      ".search-flash{animation:searchflash 2.4s ease-out}@keyframes searchflash{0%,40%{background:color-mix(in srgb,var(--accent,#357) 22%,transparent)}100%{background:transparent}}" +
      "@media (max-width:520px){.search-ov{padding:3vh 8px 8px}.search-box{max-height:92vh}.search-res li .s-label{white-space:normal}.search-hint{display:none}}";
    document.head.appendChild(s);
  }

  function ensure(){
    if (ov) return;
    css();
    ov = document.createElement("div");
    ov.className = "search-ov"; ov.id = "searchoverlay"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "البحث في القسم");
    ov.innerHTML =
      '<div class="search-box">' +
        '<input id="searchinput" type="search" autocomplete="off" spellcheck="false" ' +
          'placeholder="ابحثوا في كل الموقع: الدروس، المسرد، القراءات، الأسئلة، الاقتباسات…" aria-label="البحث في القسم">' +
        '<div class="search-count" id="searchcount"></div>' +
        '<ul id="searchresults" class="search-res" role="listbox" aria-label="النتائج"></ul>' +
        '<div class="search-hint">↑↓ تنقّل · ↵ فتح · esc إغلاق</div>' +
      '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector("#searchinput");
    list = ov.querySelector("#searchresults");
    count = ov.querySelector("#searchcount");
    ov.addEventListener("mousedown", function(e){ if (e.target === ov) close(); });
    var tm = null;
    input.addEventListener("input", function(){ clearTimeout(tm); tm = setTimeout(function(){ render(search(input.value)); }, 90); });
    input.addEventListener("keydown", onKey);
    list.addEventListener("click", function(e){
      var li = e.target.closest("li[data-i]"); if (li) activate(+li.dataset.i);
    });
  }

  function setMarked(el, parts){   /* textContent por trozos: sin inyectar HTML de los datos */
    el.textContent = "";
    el.appendChild(document.createTextNode(parts.pre));
    if (parts.hit){ var m = document.createElement("mark"); m.textContent = parts.hit; el.appendChild(m); }
    el.appendChild(document.createTextNode(parts.post));
  }
  function render(r){
    var items = r && r.items ? r.items : [];
    current = items; sel = items.length ? 0 : -1; lastToks = r && r.toks ? r.toks : [];
    if (!input.value.trim()){ list.innerHTML = ""; count.textContent = ""; return; }
    if (!items.length){ list.innerHTML = '<li class="search-empty">لا توجد نتائج</li>'; count.textContent = ""; return; }
    count.textContent = r.total + " " + (r.total === 1 ? "نتيجة" : "نتائج") + (r.total > items.length ? " · " + "تُعرض الأولى فقط:" : "");
    var html = "", lastType = null;
    items.forEach(function(e, i){
      if (e.type !== lastType){ html += '<li class="s-group"></li>'; lastType = e.type; }
      html += '<li role="option" class="s-it' + (i === sel ? " sel" : "") + '" data-i="' + i + '"><span class="s-label"></span><span class="s-type"></span><span class="s-meta"></span><span class="s-snip"></span></li>';
    });
    list.innerHTML = html;
    var lis = list.querySelectorAll("li"), gi = 0, type = null;
    [].forEach.call(lis, function(li){
      if (li.classList.contains("s-group")){ type = items[+li.nextElementSibling.dataset.i].type; li.textContent = type; return; }
      var e = items[+li.dataset.i];
      setMarked(li.querySelector(".s-label"), markLabel(e.label, lastToks));
      li.querySelector(".s-type").textContent = e.type;
      li.querySelector(".s-meta").textContent = e.meta || "";
      var sn = li.querySelector(".s-snip");
      if (e.text){ setMarked(sn, snippet(e, lastToks)); } else sn.remove();
    });
    list.scrollTop = 0;
  }

  function move(d){
    if (!current.length) return;
    sel = (sel + d + current.length) % current.length;
    [].forEach.call(list.querySelectorAll("li.s-it"), function(li){ li.classList.toggle("sel", +li.dataset.i === sel); });
    var el = list.querySelector('li[data-i="' + sel + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }

  /* tras abrir la vista: localiza el fragmento en la pantalla y lo señala */
  function scrollToText(viewId, find){
    [].forEach.call(document.querySelectorAll(".search-flash"), function(x){ x.classList.remove("search-flash"); });   /* el resalte anterior */
    var view = document.getElementById(viewId); if (!view || !find) return;
    var want = fold(find).replace(/\s+/g, "");   /* sin espacios: textContent y textOf los reparten distinto */
    /* el elemento VISIBLE más pequeño que contiene el texto (los contenedores también lo contienen) */
    var cands = view.querySelectorAll("p, li, dd, dt, td, th, summary, h2, h3, h4, blockquote, article, .card, .flashcard, .cit, figure, div"), best = null, bestLen = Infinity;
    var hidden = null, hiddenLen = Infinity;
    for (var i = 0; i < cands.length; i++){
      var el = cands[i], txt = fold(el.textContent || "").replace(/\s+/g, "");
      if (txt.indexOf(want) < 0) continue;
      if (el.offsetParent === null){ if (txt.length < hiddenLen){ hidden = el; hiddenLen = txt.length; } continue; }   /* oculto (desplegable cerrado) */
      if (txt.length < bestLen){ best = el; bestLen = txt.length; }
    }
    if (!best && hidden){   /* está dentro de un <details> cerrado: se abre y se usa */
      var d = hidden.closest("details"), n = 0;
      while (d && n++ < 6){ d.open = true; d = d.parentElement && d.parentElement.closest("details"); }
      if (hidden.offsetParent !== null) best = hidden;
    }
    if (!best) return false;
    best.scrollIntoView({ block: "center" }); best.classList.remove("search-flash"); void best.offsetWidth; best.classList.add("search-flash");
    return true;
  }

  function activate(i){
    var e = current[i]; if (!e) return;
    close();
    if (typeof show === "function") show(e.go);
    if (e.go === "glosario" && e.glo){
      /* el glosario se filtra por el término: materia y bloque del término, área «todas», búsqueda = término */
      try {
        if (typeof gloSubject !== "undefined"){ gloSubject = e.glo.subject || gloSubject; gloBloque = "all"; gloArea = "all"; gloQuery = e.glo.t; }
        if (typeof renderGloControls === "function") renderGloControls();
        if (typeof renderGloList === "function") renderGloList();
      } catch (err) {}
      setTimeout(function(){ scrollToText("glosario", e.glo.t); }, 60);
      return;
    }
    var fn = LOADER[e.go];
    if (e.arg && fn && typeof window[fn] === "function") window[fn](e.arg);
    if (e.find) setTimeout(function(){ scrollToText(e.go, e.find); }, 120);
  }

  function onKey(e){
    if (e.key === "ArrowDown"){ e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
    else if (e.key === "Enter"){ e.preventDefault(); if (sel >= 0) activate(sel); }
    else if (e.key === "Escape"){ e.preventDefault(); close(); }
  }

  function open(){ ensure(); ov.hidden = false; input.value = ""; render(null); input.focus(); }
  function close(){ if (ov){ ov.hidden = true; } }

  function mountBtn(){
    var bar = document.querySelector(".bar-in"); if (!bar) return;
    var btn = document.createElement("button");
    btn.className = "theme searchbtn"; btn.id = "searchbtn"; btn.type = "button";
    btn.title = "البحث في القسم (Ctrl+K)"; btn.setAttribute("aria-label", "البحث في القسم");
    btn.textContent = "🔎";
    btn.addEventListener("click", open);
    var ref = document.getElementById("navtoggle") || document.getElementById("theme");
    if (ref) bar.insertBefore(btn, ref); else bar.appendChild(btn);
  }
  mountBtn();

  document.addEventListener("keydown", function(e){
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")){ e.preventDefault(); open(); return; }
    if (e.key === "/" && !(ov && !ov.hidden)){
      var a = document.activeElement, tag = a && a.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (a && a.isContentEditable)) return;
      e.preventDefault(); open();
    }
  });
})();
