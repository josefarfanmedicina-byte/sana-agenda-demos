/* Construye la demo desde la URL (?n=&e=&m=&o=). Entrada NO confiable: saneada en shared.js y mostrada solo con textContent. */
(function () {
  "use strict";
  var K = window.SANA_CREA, P = K.params(location.search), E = K.ESP[P.e];
  var PRES = { id: "presencial", nombre: "Atención presencial", desc: "En el consultorio (de ejemplo).", icono: "edificio" };
  var ONL = { id: "online", nombre: "Atención online", desc: "Por videollamada, desde donde estés (ejemplo).", icono: "video" };
  var mods = P.m === "presencial" ? [PRES] : P.m === "online" ? [ONL] : [PRES, ONL];
  var hsh = 0; Array.from(P.n + "|" + P.e + "|" + P.m).forEach(function (c) { hsh = (hsh * 33 + c.codePointAt(0)) >>> 0; });
  var sem = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00"], hor = {};
  [1, 2, 3, 4, 5].forEach(function (d) { hor[d] = sem; }); hor[6] = sem.slice(0, 4);
  var psi = P.e === "psicologia";
  window.DEMO = {
    slug: "crea-" + hsh.toString(36), nombre: P.n, iniciales: K.iniciales(P.n), colores: K.colores(P.n),
    tagline: P.esp + " · demo con servicios y horarios de ejemplo.", chipModalidad: K.MOD[P.m], tituloServicios: "Servicios de ejemplo",
    whatsapp: "", modalidades: mods,
    servicios: E.s.map(function (s, i) { return { id: "s" + (i + 1), nombre: s, desc: "Servicio de ejemplo." }; }),
    motivos: psi ? ["Primera sesión", "Sesión de seguimiento", "Prefiero explicarlo en la atención"] : ["Primera consulta", "Control o seguimiento", "Prefiero explicarlo en la consulta"],
    horarios: hor
  };
  document.title = "Demo de " + P.n + " — datos de ejemplo";
  var c = window.DEMO.colores; Object.keys(c).forEach(function (k) { document.documentElement.style.setProperty("--" + k, c[k]); });
  document.getElementById("pie-nombre").textContent = P.n;
})();
