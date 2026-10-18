"use strict";
/* ===== Galería · obras de arte por época (dominio público) ===== se añaden a GALERIA
   sin editar galeria.js. Fuente: recursos/imagenes_museos/epocas/manifest.csv (Wikimedia Commons). */
const GALERIA_EPOCAS = [
 {
  "f": "media/galeria_museo/epocas/academia_liceo_MANNapoli_124545_plato_s_academy_mosaic_cropped.jpg",
  "t": "الأكاديمية والليسيوم والرواق",
  "pie": "MANNapoli 124545 plato's academy mosaic (cropped) · 1st century CE. 2015-07-29 13:01:41 for photograph · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/academia_liceo_Roman_Mosaic_of_the_Academy_of_Plato_Seven_Philosophers_from_Villa_of_T_Sim.jpg",
  "t": "الأكاديمية والليسيوم والرواق",
  "pie": "Roman Mosaic of the Academy of Plato Seven Philosophers; from Villa of T. Siminius Stephanus, Pompeii (48451826467) · Gary Todd from Xinzheng, China · 2019-08-02 02:16 · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/academia_liceo_Stoa_of_Attalos_Athens_Agora.jpg",
  "t": "الأكاديمية والليسيوم والرواق",
  "pie": "Stoa of Attalos Athens Agora · Ian W. Scott · 2005-03-20 · CC BY 3.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3AStoa_of_Attalos_Athens_Agora.JPG",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/helenismo_Alexander_Battle_of_Issus_Mosaic.jpg",
  "t": "الإسكندر والعصر الهلنستي",
  "pie": "So-called Alexander Mosaic · circa 310 BC (original) · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/helenismo_Laocoon_group_left_part_Pio_Clementino_Museum_Vatican_Museums.jpg",
  "t": "الإسكندر والعصر الهلنستي",
  "pie": "Laocoon group (left part), Pio Clementino Museum, Vatican Museums · Quentin Lowagie / Klow · 2014-08-12 14:38:37 · CC BY 4.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3ALaocoon_group_%28left_part%29%2C_Pio_Clementino_Museum%2C_Vatican_Museums.jpg",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/atenas_clasica_Head_of_Lion_edge_Parthenon_Acropolis_Athens_Greece.jpg",
  "t": "أثينا والديمقراطية",
  "pie": "Head of Lion edge Parthenon Acropolis Athens Greece · Jebulon · 2015-05-17 16:42:09 · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/atenas_clasica_Restoration_work_Parthenon_facade_Acropolis_Athens_Greece.jpg",
  "t": "أثينا والديمقراطية",
  "pie": "Restoration work Parthenon facade Acropolis Athens Greece · Jebulon · 2015-05-17 16:37:08 · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/mito_logos_Achilles_and_Ajax_playing_dice_Attic_black_figured_amphora_signed_by_Exekias_as.jpg",
  "t": "أخيل وأياكس يلعبان النرد",
  "pie": "Achilles and Ajax playing dice, Attic black-figured amphora, signed by Exekias as both painter and potter, 540-530 BC, inv. 16757 - Museo Gregoriano Etrusco - Vatican Museums - DSC01049 · Daderot · 2019-04-06 04:48:03 · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/mito_logos_Attic_Red_Figure_Calyx_Krater_Fragment_by_Euphronios_Getty_103TF4.jpg",
  "t": "من الأسطورة إلى اللوغوس",
  "pie": "Attic Red-Figure Calyx Krater Fragment, by Euphronios (Getty 103TF4) · Euphronios · 2024-08-28 15:01:47 · CC0 · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/roma_estoica_Giovanni_Paolo_Panini_Interior_of_the_Pantheon_Rome_Google_Art_Project.jpg",
  "t": "روما والرواقية",
  "pie": "Interior of the Pantheon, Rome title QS:P1476,en:\"Interior of the Pantheon, Rome\" label QS:Len,\"Interior of the Pantheon, Rome\" · Giovanni Paolo Panini · circa 1734 date QS:P571,+1734-00-00T00:00:00Z/9,P1480,Q57279 · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/roma_estoica_Marcus_Aurelius_Capitoline_Hill_September_2015_1.jpg",
  "t": "روما والرواقية",
  "pie": "Marcus Aurelius Capitoline Hill September 2015-1 · Alvesgaspar · 2015-09-12 12:30:05 · PD · Wikimedia Commons",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/roma_estoica_Roman_Forum_Panorama_45485038075.jpg",
  "t": "روما والرواقية",
  "pie": "Roman Forum, Panorama (45485038075) · Sonse · 2018-11-14 15:50 · CC BY 2.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3ARoman_Forum%2C_Panorama_%2845485038075%29.jpg",
  "bloque": "A",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/renacimiento_Antonello_da_Messina_St_Jerome_in_his_study_National_Gallery_London.jpg",
  "t": "عصر النهضة",
  "pie": "Saint Jerome in his Study label QS:Lit,\"San Girolamo nel suo studio\" label QS:Lde,\"Der heilige Hieronymus im Gehäus\" label QS:Lja,\"書斎の聖ヒエロニムス\" label QS:Len,\"Saint Jerome in his Study\" · Antonello da Messina · circa 1474 date QS:P571,+1474-00-00T00:00:00Z/9,P1480,Q57279 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/renacimiento_Da_Vinci_Vitruve_Luc_Viatour.jpg",
  "t": "عصر النهضة",
  "pie": "Vitruvian Man label QS:Les,\"Hombre de Vitruvio\" label QS:Lis,\"Vitrúvíski maðurinn\" label QS:Lms,\"L'uomo vitruviano\" label QS:Len-gb,\"Vitruvian Man\" label QS:Lbg,\"Витрувиански човек\" label QS:Lro,\"Omul Vitruvian\" label QS:Lzh-hk,\"維特魯威人\" label QS:Lsk,\"Vitruviánsky muž\" label QS:Luk,\"Вітрувіанська людина\" label QS:Lzh-hant,\"維特魯威人\" label QS:Lzh-cn,\"维特鲁威人\" label QS:Lko,\"비트루비우스적 인간\" label QS:Las,\"ৱিত্ৰুৱীয় মানুহ\" label QS:Leo,\"Vitruvia homo\" label QS:Lmk,\"Витрувиев човек\" label QS:Lbs,\"Vitruvijanski čovjek\" label QS:Lsyl,\"ꠅꠤꠔ꠆ꠞꠥꠅꠤꠅ ꠝꠣꠘꠥꠡ\" label QS:Lbn,\"ভিত্রুভিয়ানো মানব\" label QS:Lfr,\"Homme de Vitruve\" label QS:Lhr,\"Vitruvijev čovjek\" label QS:Lvi,\"Người Vitruvius\" label QS:Llv,\"Vitrūvija cilvēks\" label QS:Laf,\"Vitruviaanse Man\" label QS:Lsr,\"Витрувијев човек\" label QS:Lzu,\"The Vitruvian Man\" label QS:Lzh-sg,\"维特鲁威人\" label QS:Lnb,\"Den vitruviske mann\" label QS:Laz,\"Vitruvius insanı\" label QS:Len,\"Vitruvian Man\" label QS:Lar,\"الرجل الفيتروفي\" label QS:Lhu,\"Vitruvius-tanulmány\" label QS:Lgu,\"da vinci\" label QS:Leu,\"Vitruvioren gizona\" label QS:Last,\"Home de Vitruvio\" label QS:Lca,\"Home de Vitruvi\" label QS:Lde,\"Vitruvianischer Mensch\" label QS:Lbe,\"Вітрувіянскі чалавек\" label QS:Lhy,\"Վիտրուվիանյան մարդ\" label QS:Lzh,\"维特鲁威人\" label QS:Lda,\"Homo Vitruvianus\" label QS:Lka,\"ვიტრუვიანელი ადამიანი\" label QS:Lja,\"ウィトルウィウス的人体図\" label QS:Lhe,\"האדם הוויטרובי\" label QS:Lla,\"Homo Vitruvianus\" label QS:Lhi,\"विट्रुवियन मैन\" label QS:Lwuu,\"维特鲁威人\" label QS:Lfi,\"Vitruviuksen mies\" label QS:Lhyw,\"Վիդրովանեան մարդ\" label QS:Lta,\"விட்ருவியன் மனிதன்\" label QS:Lit,\"Uomo vitruviano\" label QS:Lsq,\"Njeriu Vitruvian\" label QS:Lel,\"Άνθρωπος του Βιτρούβιου\" label QS:Lid,\"Manusia Vitruvian\" label QS:Loc,\"Òme de Vitruvi\" label QS:Lru,\"Витрувианский человек\" label QS:Ltr,\"Vitruvius Adamı\" label QS:Lsr-ec,\"Витрувијев човек\" label QS:Lsr-el,\"Vitruvijev čovek\" label QS:Lcy,\"Dyn Vitruvius\" label QS:Lzh-tw,\"維特魯威人\" label QS:Lsco,\"Vitruvian Man\" label QS:Llt,\"Vitruvijaus žmogus\" label QS:Lsl,\"Vitruvijev človek\" label QS:Ltl,\"Lalaking Vitruvio\" label QS:Lsv,\"Vitruvianske mannen\" label QS:Lth,\"วิทรูเวียนแมน\" label QS:Lwar,\"Tawotawo ni Vitruvio\" label QS:Lpl,\"Człowiek witruwiański\" label QS:Lml,\"വിട്രൂവിയൻ മാൻ\" label QS:Lnl,\"Vitruviusman\" label QS:Lary,\"الراجل لڤيتروڤي (ليوناردو دا ڤينشي)\" label QS:Lfa,\"مرد ویتروین\" label QS:Lpt,\"Homem Vitruviano\" label QS:Lsh,\"Vitruvijev čovjek\" label QS:Lgl,\"O home de Vitruvio\" label QS:Lcs,\"Vitruviánský muž\" label QS:Lzh-hans,\"维特鲁威人\" label QS:Lcv,\"Витрувий этемӗ\" · Leonardo da Vinci · circa 1492 date QS:P571,+1492-00-00T00:00:00Z/9,P1480,Q57279 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/renacimiento_W_rttembergische_Landesbibliothek_Stuttgart_Gutenberg_Genesis.png",
  "t": "عصر النهضة",
  "pie": "Württembergische Landesbibliothek Stuttgart Gutenberg Genesis · Württembergische Landesbibliothek, Stuttgart · 1455 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/al_andalus_Great_Mosque_of_Cordoba_interior_8th_10th_centuries_29539115350.jpg",
  "t": "الفلسفة العربية واليهودية",
  "pie": "Great Mosque of Cordoba, interior, 8th - 10th centuries (29539115350) · Richard Mortel from Riyadh, Saudi Arabia · Taken on 11 August 2016, 11:37 · CC BY 2.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3AGreat_Mosque_of_Cordoba%2C_interior%2C_8th_-_10th_centuries_%2829539115350%29.jpg",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/al_andalus_Great_Mosque_of_Cordoba_interior_8th_10th_centuries_38_29721130342.jpg",
  "t": "الفلسفة العربية واليهودية",
  "pie": "Great Mosque of Cordoba, interior, 8th - 10th centuries (38) (29721130342) · Richard Mortel from Riyadh, Saudi Arabia · Taken on 11 August 2016, 11:53 · CC BY 2.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3AGreat_Mosque_of_Cordoba%2C_interior%2C_8th_-_10th_centuries_%2838%29_%2829721130342%29.jpg",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/al_andalus_Two_tiered_arches_at_the_Mosque_Cathedral_of_C_rdoba.jpg",
  "t": "الفلسفة العربية واليهودية",
  "pie": "Two-tiered arches at the Mosque–Cathedral of Córdoba · GourmetBean · 2024-07-16 14:43:38 · CC BY 4.0 · Wikimedia Commons",
  "page": "https://commons.wikimedia.org/wiki/File%3ATwo-tiered_arches_at_the_Mosque%E2%80%93Cathedral_of_C%C3%B3rdoba.jpg",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/edad_media_Chartres_Cathedral_Apostles_lintel_central_portal_west_fa_ade_Vanderbilt_ACT_00.jpg",
  "t": "العصور الوسطى",
  "pie": "Chartres Cathedral; Apostles; lintel, central portal, west façade - Vanderbilt ACT - 00000077 · Anne C. Richardson , Jim Womack · 2023-08-09 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/edad_media_Henry_of_Germany_delivering_a_lecture_to_university_students_in_Bologna_by_Laur.jpg",
  "t": "العصور الوسطى",
  "pie": "Henry of Germany delivering a lecture to university students in Bologna by Laurentius de Voltolina (21114437820) · Levan Ramishvili from Tbilisi, Georgia · 2015-09-11 00:01 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/edad_media_The_Scribe_at_Work.jpg",
  "t": "العصور الوسطى",
  "pie": "Portrait of Jean Miélot · Jean Le Tavernier · after 1456 date QS:P571,+1456-00-00T00:00:00Z/7,P1319,+1456- · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/reforma_Der_Anschlag_von_Luthers_95_Thesen.jpg",
  "t": "الإصلاح البروتستانتي",
  "pie": "German: Luther schlägt die 95 Thesen an Luther publishes the 95 Theses title QS:P1476,de:\"Luther schlägt die 95 Thesen an\" label QS:Lde,\"Luther schlägt die 95 Thesen an\" label QS:Len,\" Luther publishes the 95 Theses \" · Julius Hübner · 1878 date QS:P571,+1878-00-00T00:00:00Z/9 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/reforma_Ninety_Five_Theses_WDL7497.png",
  "t": "الإصلاح البروتستانتي",
  "pie": "Ninety-Five Theses · Luther, Martin, 1483-1546 · 1517 date QS:P571,+1517-00-00T00:00:00Z/9 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_cientifica_1660_engraving_Scenographia_Systematis_Copernicani.jpg",
  "t": "الثورة العلمية",
  "pie": "Latin: Scenographia Systematis Copernicani The Copernican System title QS:P1476,la:\"Scenographia Systematis Copernicani\" label QS:Lla,\"Scenographia Systematis Copernicani\" label QS:Len,\"The Copernican System\" label QS:Lla,\"Scenographia Systematis Copernicani\" · Unknown author · 1660 date QS:P571,+1660-00-00T00:00:00Z/9 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_cientifica_Cellarius_Harmonia_Macrocosmica_Scenographia_Systematis_CopernicaniF.jpg",
  "t": "الثورة العلمية",
  "pie": "Cellarius Harmonia Macrocosmica - Scenographia Systematis CopernicaniFXD · Andreas Cellarius · 1661 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_cientifica_Copernican_heliocentrism_diagram_2.jpg",
  "t": "الثورة العلمية",
  "pie": "Copernican heliocentrism diagram-2 · Copernican_heliocentrism_diagram.jpg : Own work from Copernicus 1543 derivative work: Professor marginalia ( talk ) · 2010-12-16 23:28 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_industrial_Lantern_Slide_Cross_Section_of_Watt_s_Rotative_Double_Acting_Condens.jpg",
  "t": "الثورة الصناعية",
  "pie": "Lantern Slide - Cross-Section of Watt's Rotative Double-Acting Condensing Steam Engine, Birmingham, England, circa 1782 · Unknown author · 2016-03-17 00:49:33 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_industrial_Philipp_Jakob_Loutherbourg_d_J_002.jpg",
  "t": "الثورة الصناعية",
  "pie": "Coalbrookdale by Night title QS:P1476,en:\"Coalbrookdale by Night \" label QS:Len,\"Coalbrookdale by Night \" label QS:Les,\"Coalbrookdale por la noche\" label QS:Lfr,\"Coalbrookdale de nuit\" label QS:Larz,\"كولبروكديل ليلا\" label QS:Lde,\"Coalbrookdale by Night\" · Philip James de Loutherbourg · 1801 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_industrial_Philipp_Jakob_Loutherbourg_d_J_Coalbrookdale_by_Night_WGA13730.jpg",
  "t": "الثورة الصناعية",
  "pie": "Coalbrookdale by Night label QS:Len,\"Coalbrookdale by Night\" · Philip James de Loutherbourg · 1801 date QS:P571,+1801-00-00T00:00:00Z/9 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/poder_moderno_Leviathan_frontispiece.jpg",
  "t": "السلطة والعقد الاجتماعي",
  "pie": "Leviathan frontispiece · Abraham Bosse · 1651 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/poder_moderno_Leviathan_frontispiece_cropped_British_Library.jpg",
  "t": "السلطة والعقد الاجتماعي",
  "pie": "Leviathan frontispiece cropped British Library · Abraham Bosse · 1651 · CC0 · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/poder_moderno_Leviathan_frontispiece_cropped_British_Museum.jpg",
  "t": "السلطة والعقد الاجتماعي",
  "pie": "Leviathan frontispiece cropped British Museum · Abraham Bosse · 1651 · PD · Wikimedia Commons",
  "bloque": "B",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/feminismo_Suffragette_parade_Mar_3_1913.png",
  "t": "الحركة النسوية",
  "pie": "Suffragette parade Mar. 3, 1913 · Bain, George Grantham, 1865-1944. · 1913-03-03 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/feminismo_Suffragette_parade_Mar_3_1913_Wash_D_C_LCCN2001704194.jpg",
  "t": "الحركة النسوية",
  "pie": "Suffragette parade Mar. 3, 1913; Wash., D.C. LCCN2001704194 · George Grantham Bain Collection · 1913-03-03 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/feminismo_Suffragette_parade_Washington_D_C_on_March_3_1913_LCCN2005693330.jpg",
  "t": "الحركة النسوية",
  "pie": "Suffragette parade, Washington, D.C., on March 3, 1913 LCCN2005693330 · Miscellaneous Items in High Demand, PPOC, Library of Congress · 1913 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/sospecha_xix_Andr_Devambez_La_Barricade_ou_l_Attente.jpg",
  "t": "القرن 19 والارتياب",
  "pie": "La Barricade ou l'Attente · André Devambez · 1911 date QS:P571,+1911-00-00T00:00:00Z/9 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/sospecha_xix_Barricade_place_Vendome_Commune_Paris_1871.jpg",
  "t": "القرن 19 والارتياب",
  "pie": "Barricade place Vendome Commune Paris 1871 · Unknown author · 1871 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/sospecha_xix_Barricade_the_paris_commune_may_1871_andre_devambez_677166a1.jpg",
  "t": "القرن 19 والارتياب",
  "pie": "Barricade-the-paris-commune-may-1871-andre-devambez-677166a1 · André Devambez · 1911 · CC0 · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/guerras_xx_Cheshire_Regiment_trench_Somme_1916.jpg",
  "t": "الحروب والوجودية (القرن 20)",
  "pie": "Cheshire Regiment trench Somme 1916 · John Warwick Brooke · 1916-07 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/guerras_xx_Trench_First_World_War_Fortepan_85689.jpg",
  "t": "الحروب والوجودية (القرن 20)",
  "pie": "Trench, First World War Fortepan 85689 · FOTO:Fortepan — ID 85689 : Adományozó/Donor: Moravecz János. · 1916 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/guerras_xx_Trench_First_World_War_Fortepan_85695.jpg",
  "t": "الحروب والوجودية (القرن 20)",
  "pie": "Trench, First World War Fortepan 85695 · FOTO:Fortepan — ID 85695 : Adományozó/Donor: Moravecz János. archive copy at the Wayback Machine · 1916 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/ilustracion_Encyclop_die_ou_Dictionnaire_raisonn_des_sciences_des_arts_et_des_m_tiers_fron.jpg",
  "t": "الأنوار",
  "pie": "Encyclopédie, ou Dictionnaire raisonné des sciences, des arts et des métiers frontispice titre 1751 · Unknown author · 1751 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/ilustracion_Encyclopedie_de_D_Alembert_et_Diderot_Premiere_Page_ENC_1_NA5.jpg",
  "t": "الأنوار",
  "pie": "Encyclopedie de D'Alembert et Diderot - Premiere Page - ENC 1-NA5 · Long List of Contributors to the Encyclopédie · circa 1751 date QS:P,+1751-00-00T00:00:00Z/9,P1480,Q5727902 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/ilustracion_Encyclopedie_frontispice_full.jpg",
  "t": "الأنوار",
  "pie": "Encyclopedie frontispice full · Benoît-Louis Prévost / Charles-Nicolas Cochin · 1764 (pinx) &amp; 1772 (sculp.) · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_francesa_Henry_Singleton_the_Storming_of_the_Bastille.jpg",
  "t": "الثورة الفرنسية",
  "pie": "The Storming of the Bastille · Henry Singleton · between circa 1789 and circa 1791 date QS:P,+1750-00-00T00:0 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_francesa_Prise_de_la_Bastille.jpg",
  "t": "الثورة الفرنسية",
  "pie": "Prise de la Bastille · Jean-Pierre Houël · 1789 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 },
 {
  "f": "media/galeria_museo/epocas/revolucion_francesa_Prise_de_la_Bastille_clean.jpg",
  "t": "الثورة الفرنسية",
  "pie": "The Storming of the Bastille label QS:Lca,\"Presa de la Bastilla\" label QS:Lde,\"Sturm auf die Bastille\" label QS:Lpt,\"Tomada da Bastilha\" label QS:Len,\"The Storming of the Bastille\" label QS:Lbe,\"Узяцце Бастыліі\" label QS:Lfr,\"La prise de la Bastille\" label QS:Lbar,\"Irgendwelche idioten laufen in ne Festung\" · Jean-Pierre Houël · 1789 · PD · Wikimedia Commons",
  "bloque": "C",
  "unidad": "Contexto histórico · museo (dominio público)",
  "ia": false
 }
];
try { if (typeof GALERIA !== "undefined" && Array.isArray(GALERIA)) GALERIA.push.apply(GALERIA, GALERIA_EPOCAS); } catch(e){}
