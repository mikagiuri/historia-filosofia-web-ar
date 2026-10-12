"use strict";
/* ===== Galería · retratos de museo (dominio público) ===== push a GALERIA
   Los retratos que antes salían en la tira «Retratos y obras» (retratosview.js, ya retirada) al final
   de la teoría pasan ahora a la Galería, en el grupo «Retrato · museo», sin duplicar lo ya existente.
   Bloque por época, como galeria_retratos2.js. */
const RETRATOS_BLOQUE = {
  "سقراط": "A", "أفلاطون": "A", "أرسطو": "A", "Hipatia de Alejandría": "A", "Aspasia": "A", "Alcibíades": "A",
  "Alejandro Magno": "A", "Diógenes": "A", "أبيقور": "A", "سينيكا": "A", "Marco Aurelio": "A",
  "La Escuela de Atenas": "A", "La muerte de Sócrates": "A", "La Academia de Platón": "A", "La alegoría de la caverna": "A", "El oráculo de Delfos": "A",
  "أوغسطين": "B", "توما الأكويني": "B", "ابن رشد": "B", "ديكارت": "B", "اسبينوزا": "B", "John Locke": "B",
  "David Hume": "B", "Rousseau": "B", "كانط": "B", "هيغل": "B", "Karl Marx": "B", "Nietzsche": "B", "Schopenhauer": "B",
  "John Stuart Mill": "B", "Nicolás Copérnico": "B", "Galileo Galilei": "B", "Isaac Newton": "B", "Charles Darwin": "B",
  "Mary Wollstonecraft": "B", "Olympe de Gouges": "B", "Marie Curie": "B", "Rosalind Franklin": "B",
  "Simone de Beauvoir": "C", "حنا أرندت": "C", "Ortega y Gasset": "C", "María Zambrano": "C", "Wittgenstein": "C",
  "Ernst Cassirer": "C", "Karl Popper": "C", "Thomas Kuhn": "C", "Albert Einstein": "C", "William James": "C", "John Dewey": "C"
};
try {
  if (typeof RETRATOS !== "undefined" && Array.isArray(RETRATOS) && typeof GALERIA !== "undefined" && Array.isArray(GALERIA)) {
    const ya = new Set(GALERIA.map(function (g) { return String(g.t || "").toLowerCase().trim(); }));
    RETRATOS.forEach(function (r) {
      const nom = r.name;
      if (!nom || ya.has(nom.toLowerCase().trim())) return;   // duplicado: ya está en la Galería
      GALERIA.push({
        f: r.file,
        t: nom,
        pie: [r.title, (r.artist && r.artist !== "Desconocido" && r.artist !== "Unknown author") ? r.artist : "", r.license, "Wikimedia Commons"].filter(Boolean).join(" · "),
        bloque: RETRATOS_BLOQUE[nom] || "B",
        unidad: "Retrato · museo (dominio público)",
        ia: false
      });
    });
  }
} catch (e) {}
