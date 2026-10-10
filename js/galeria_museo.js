"use strict";
/* ===== Galería · imágenes de museo (dominio público) ===== se añaden a GALERIA (galeria.js)
   sin editar ese archivo. Fuente: recursos/imagenes_museos/manifest.csv (Wikimedia Commons). */
const GALERIA_MUSEO = [
 {
  "f": "media/retratos/museo/alcibiades.jpg",
  "t": "ألكيبيادس",
  "pie": "Academische studie naar prent buste van Alcibiades 1806 Dominique Cool · Dominique Cools / After Alexandre Chaponnier · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/alejandro.jpg",
  "t": "الإسكندر الأكبر",
  "pie": "Alejandro Magno Alexander The Great Bust Alexander BM 1857 cropped · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/aristoteles.jpg",
  "t": "أرسطو",
  "pie": "Aristotle Altemps Inv8575 · After Lysippos · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/aspasia.jpg",
  "t": "Aspasia",
  "pie": "Aspasia Canini · Giovanni Angelo Canini · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/diogenes.jpg",
  "t": "ديوجين",
  "pie": "Diogenes statue Sinop enhanced · Diogenes-statue-Sinop.JPG: Tony f derivative work: Singinglemon (talk) · CC BY 3.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File:Diogenes-statue-Sinop-enhanced.jpg",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/delfos.jpg",
  "t": "معبد دلفي",
  "pie": "Voorbereiding tot het raadplegen van het orakel van Delphi Voorbereydi · Rijksmuseum · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/epicuro.jpg",
  "t": "أبيقور",
  "pie": "Epicurus Massimo Inv197306 · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/hipatia.jpg",
  "t": "هيباتيا السكندرية",
  "pie": "Hypatia Charles William Mitchell · Charles William Mitchell · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/academia.jpg",
  "t": "أكاديمية أفلاطون",
  "pie": "MANNapoli 124545 plato s academy mosaic · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/escuela-atenas.jpg",
  "t": "مدرسة أثينا",
  "pie": "The School of Athens by Raffaello Sanzio da Urbino · Raphael · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/caverna.jpg",
  "t": "أمثولة الكهف",
  "pie": "Platon Cave Sanraedam 1604 · Jan Saenredam / After Cornelis van Haarlem · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/muerte-socrates.jpg",
  "t": "موت سقراط",
  "pie": "David The Death of Socrates · Jacques-Louis David · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/marco-aurelio.jpg",
  "t": "ماركوس أوريليوس",
  "pie": "Head Marcus Aurelius archmus Heraklion · Jebulon · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/platon.jpg",
  "t": "أفلاطون",
  "pie": "Plato bust · Jpergrc · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/seneca.jpg",
  "t": "سينيكا",
  "pie": "Bust of Pseudo Seneca MET DP359039 · Peter Paul Rubens · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/socrates.jpg",
  "t": "سقراط",
  "pie": "Bust Socrates Musei Capitolini MC1163 · Public Domain · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Antigua · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/agustin.jpg",
  "t": "أوغسطين",
  "pie": "Saint Augustine of Hippo Engraving Wellcome V0031651 · Wellcome Collection · CC BY 4.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File:Saint_Augustine_of_Hippo._Engraving._Wellcome_V0031651.jpg",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/averroes.jpg",
  "t": "ابن رشد",
  "pie": "The Disgrace of Averroes Vies Des Savants Illustr s · Louis Figuier (15 February 1819 – 8 November 1894) · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/hume.jpg",
  "t": "David Hume",
  "pie": "Allan Ramsay David Hume 1711 1776 Historian and philosopher PG 3521 Na · Allan Ramsay · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/descartes.jpg",
  "t": "ديكارت",
  "pie": "Frans Hals Portret van Ren Descartes · After Frans Hals · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/locke.jpg",
  "t": "John Locke",
  "pie": "John Locke by John Greenhill · John Greenhill · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/rousseau.jpg",
  "t": "Rousseau",
  "pie": "Jean Jacques Rousseau painted portrait · Maurice Quentin de La Tour · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/spinoza.jpg",
  "t": "اسبينوزا",
  "pie": "Spinoza · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/aquino.jpg",
  "t": "توما الأكويني",
  "pie": "St thomas aquinas · Carlo Crivelli · Public Domain · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Medieval-Moderna · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/arendt.jpg",
  "t": "حنا أرندت",
  "pie": "Hannah Arendt 1933 · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/hegel.jpg",
  "t": "هيغل",
  "pie": "Hegel portrait by Schlesinger 1831 · Jakob Schlesinger (1792-1855) · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/mill.jpg",
  "t": "John Stuart Mill",
  "pie": "John Stuart Mill by John Watkins 1865 · John Watkins · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/kant.jpg",
  "t": "كانط",
  "pie": "Immanuel Kant Gemaelde 1 · Johann Gottlieb Becker (1720-1782) · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/marx.jpg",
  "t": "Karl Marx",
  "pie": "Karl Marx by John Jabez Edwin Mayall 1875 Restored · John Jabez Edwin Mayall · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/zambrano.jpg",
  "t": "María Zambrano",
  "pie": "Mar a Zambrano ca 1918 · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/nietzsche.jpg",
  "t": "Nietzsche",
  "pie": "Nietzsche1882 · Gustav-Adolf Schultze (d. 1897) · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/ortega.jpg",
  "t": "Ortega y Gasset",
  "pie": "Jos Ortega y Gasset cropped · SAS Scandinavian Airlines · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/schopenhauer.jpg",
  "t": "Schopenhauer",
  "pie": "Arthur Schopenhauer by J Sch fer 1859b · Johann Schäfer · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/beauvoir.jpg",
  "t": "Simone de Beauvoir",
  "pie": "Simone de Beauvoir drawing · aeneastudio · CC BY 2.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File:Simone_de_Beauvoir_drawing.jpg",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/retratos/museo/wittgenstein.jpg",
  "t": "Wittgenstein",
  "pie": "Ludwig Wittgenstein · Moritz Nähr · Public Domain · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contemporánea · museo (dominio público)",
  "ia": false
 }
];
try { if (typeof GALERIA !== "undefined" && Array.isArray(GALERIA)) {
  GALERIA.forEach(function(g){ if (g.ia === undefined) g.ia = true; });  /* las ilustraciones del libro son generadas con IA */
  GALERIA.push.apply(GALERIA, GALERIA_MUSEO);
} } catch(e){}
