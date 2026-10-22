"use strict";
/* ===== Rincón de lógica · Laboratorio · mesa «Inducción y abducción» (22-10-2026, nube, rama claude/logica-huecos-itinerario) =====
   Rama lateral del itinerario (desde el nivel 1, docs/39). Textos en laboratorio_induccion.js (IND). Cada caso: elegir qué
   forma de razonar es (generalización, analogía, inferencia causal o mejor explicación), y después ver qué la haría más
   fuerte o más débil y cuál es la falacia vecina. Usa los ayudantes de laboratorioview.js (lbH, lbChip, lbAviso, lbSaber).
   (22-10, revisión) El veredicto y los aciertos se anuncian en una región aria-live estable (fuera de lo que se repinta);
   el foco vuelve al mismo control tras repintar; el nombre del tipo dentro de la frase sale de IND.tipos[].frase. */
const LB_INU = (() => {
  const iT = (k, v) => String((IND.t && IND.t[k]) || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ""));
  const st = { i: 0, resp: {}, ver: {} };
  let box = null, cuerpo = null, vivo = null, dichas = -1;
  const SOLO_LECTOR = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";
  const tipoDe = (t) => IND.tipos.find((x) => x.tipo === t) || {};
  const fraseTipo = (t) => tipoDe(t).frase || tipoDe(t).nom || t;
  function pintar() {
    if (!box || !box.isConnected || !cuerpo) return;
    const act = document.activeElement, foco = act && act.getAttribute && cuerpo.contains(act) ? act.getAttribute("data-k") : null;
    const C = IND.casos, c = C[st.i], r = st.resp[st.i], aciertos = Object.keys(st.resp).filter((k) => st.resp[k] === C[k].tipo).length;
    const veredicto = r != null ? iT(r === c.tipo ? "inBien" : "inMal", { x: fraseTipo(c.tipo) }) : "";
    const marcador = iT("inAciertos", { a: aciertos, n: Object.keys(st.resp).length });
    cuerpo.replaceChildren(
      lbH("p", { class: "lg-intro" }, iT("inLede")),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, iT("inTiposTit")),
        lbH("div", { class: "lb-dos" }, ...IND.tipos.map((t) => lbH("div", { class: "lb-col" }, lbH("p", {}, lbH("b", {}, t.nom + ". "), t.dice), lbH("p", { class: "lb-nota" }, t.fuerte)))),
        lbSaber(iT("inHumeTit"), iT("inHume")), lbSaber(iT("inPeirceTit"), iT("inPeirce"))),
      lbH("div", { class: "lb-mesa" }, lbH("h3", {}, iT("inCasosTit")), lbH("p", { class: "lb-nota" }, iT("inCasosAyuda")),
        lbH("div", { class: "lb-fila lb-entre" }, lbH("span", { class: "lb-et" }, iT("inCaso", { n: st.i + 1, t: C.length })), lbH("span", { class: "lb-et" }, marcador)),
        lbH("p", { class: "lb-in-caso" }, c.txt),
        lbH("p", { class: "lb-nota" }, iT("inQueTipo")),
        lbH("div", { class: "lb-fila", role: "group", "aria-label": iT("inQueTipo") }, ...IND.tipos.map((t) => lbChip(t.nom, r === t.tipo, () => { if (r == null) { st.resp[st.i] = t.tipo; pintar(); } }, { disabled: r != null && r !== t.tipo, "data-k": "t" + t.tipo }))),
        r != null ? lbAviso(r === c.tipo ? "ok" : "mal", veredicto) : null,
        r != null ? lbH("div", { class: "lb-sep" }, lbH("p", {}, lbH("b", {}, iT("inPregunta") + " "), c.q),
          st.ver[st.i] ? lbH("p", {}, lbH("b", {}, iT("inRespuesta") + " "), c.r) : lbH("p", {}, lbH("button", { type: "button", class: "btn ghost", "data-k": "ver", onclick: () => { st.ver[st.i] = true; pintar(); } }, iT("inVer"))),
          st.ver[st.i] ? lbH("p", { class: "lb-nota" }, lbH("b", {}, iT("inVecina") + " "), c.vecina) : null) : null,
        lbH("div", { class: "lb-fila" },
          lbH("button", { type: "button", class: "btn ghost", disabled: st.i === 0, "data-k": "ant", onclick: () => { st.i--; pintar(); } }, iT("inAnterior")),
          lbH("button", { type: "button", class: "btn", disabled: st.i === C.length - 1, "data-k": "sig", onclick: () => { st.i++; pintar(); } }, iT("inSiguiente")))),
      lbH("div", { class: "lb-mesa" }, lbSaber(iT("inLimiteTit"), iT("inLimite"))));
    /* se anuncia solo al responder (cambia el número de respuestas): el veredicto y los aciertos */
    const n = Object.keys(st.resp).length;
    if (n !== dichas) { if (dichas >= 0 && r != null) vivo.textContent = veredicto + " " + marcador; dichas = n; }
    /* foco: al mismo control; si se ha desactivado (p. ej. un tipo no elegido), al que se eligió o a «Siguiente» */
    if (foco) { const dest = [foco, r != null ? "t" + r : "", "sig", "ant"].map((k) => k && cuerpo.querySelector('[data-k="' + k + '"]')).find((x) => x && !x.disabled); if (dest && dest.focus) dest.focus(); }
  }
  return { montar(b) {
    box = b; cuerpo = lbH("div", {}); vivo = lbH("div", { role: "status", "aria-live": "polite", "aria-atomic": "true", style: SOLO_LECTOR }); dichas = -1;
    box.replaceChildren(cuerpo, vivo); pintar();
  } };
})();
