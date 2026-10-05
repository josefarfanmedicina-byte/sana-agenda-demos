/* SANA — lógica compartida (landing y demo): listas blancas, saneo de entrada, iniciales y color determinista. Sin red, sin almacenamiento de datos del usuario. */
(function (g) {
  "use strict";
  var ESP = {
    "medicina-general": { label: "Medicina general", s: ["Consulta de medicina general", "Control de medicina general"] },
    "pediatria": { label: "Pediatría", s: ["Consulta de pediatría", "Control de pediatría"] },
    "ginecologia": { label: "Ginecología", s: ["Consulta ginecológica", "Control ginecológico"] },
    "dermatologia": { label: "Dermatología", s: ["Consulta de dermatología", "Control de dermatología"] },
    "psicologia": { label: "Psicología", s: ["Primera sesión", "Sesión de seguimiento"] },
    "nutricion": { label: "Nutrición", s: ["Consulta de nutrición", "Control de nutrición"] },
    "odontologia": { label: "Odontología", s: ["Consulta odontológica", "Control odontológico"] },
    "cardiologia": { label: "Cardiología", s: ["Consulta de cardiología", "Control de cardiología"] },
    "traumatologia": { label: "Traumatología", s: ["Consulta de traumatología", "Control de traumatología"] },
    "oftalmologia": { label: "Oftalmología", s: ["Consulta de oftalmología", "Control de oftalmología"] },
    "terapia-fisica": { label: "Terapia física", s: ["Evaluación de terapia física", "Sesión de terapia física"] },
    "otra": { label: "Otra", s: ["Primera consulta", "Control o seguimiento"] }
  };
  var MOD = { presencial: "Presencial", online: "Online", ambas: "Presencial y online" };
  function limpiar(v, max) {
    v = String(v == null ? "" : v);
    try { v = v.normalize("NFC"); } catch (e) {}
    v = v.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g, " ").replace(/\s+/g, " ").trim();
    return Array.from(v).slice(0, max).join("").trim();
  }
  var STOP = { dr: 1, dra: 1, de: 1, del: 1, la: 1, las: 1, el: 1, los: 1, y: 1, e: 1, "&": 1, consultorio: 1, centro: 1, clinica: 1, "clínica": 1 };
  function iniciales(n) {
    var w = n.split(/[\s.\-&,/]+/).filter(function (x) { return x && /[\p{L}\p{N}]/u.test(x); });
    var sig = w.filter(function (x) { return !STOP[x.toLowerCase()]; });
    var use = (sig.length ? sig : w).slice(0, 2).map(function (x) { return Array.from(x.replace(/[^\p{L}\p{N}]/gu, ""))[0] || ""; }).join("");
    return (use || "SA").toLocaleUpperCase("es");
  }
  function hsl(h, s, l) {
    s /= 100; l /= 100; var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return "#" + [f(0), f(8), f(4)].map(function (x) { return ("0" + Math.round(x * 255).toString(16)).slice(-2); }).join("").toUpperCase();
  }
  function lum(hex) { var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contraste(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function colores(n) {
    var hsh = 0; Array.from(n.toLowerCase()).forEach(function (ch) { hsh = (hsh * 31 + ch.codePointAt(0)) >>> 0; });
    var h = hsh % 360, s = 38, L = 38, primary = hsl(h, s, L);
    while (contraste("#FFFFFF", primary) < 4.6 && L > 10) { L -= 2; primary = hsl(h, s, L); }
    var dark = hsl(h, 42, Math.max(L - 14, 12)), bl = 80, brand = hsl(h, 55, bl);
    while (contraste(dark, brand) < 4.6 && bl < 95) { bl += 2; brand = hsl(h, 55, bl); }
    return { primary: primary, dark: dark, brand: brand, "brand-soft": hsl(h, 45, 94), bg: hsl(h, 30, 97.5), line: hsl(h, 22, 86), ink: "#232D2F", muted: "#5A6668" };
  }
  function params(search) {
    var q = new URLSearchParams(search || "");
    var n = limpiar(q.get("n"), 60) || "Tu consultorio";
    var e = limpiar(q.get("e"), 30).toLowerCase(); if (!Object.prototype.hasOwnProperty.call(ESP, e)) e = "medicina-general";
    var m = limpiar(q.get("m"), 12).toLowerCase(); if (!Object.prototype.hasOwnProperty.call(MOD, m)) m = "ambas";
    var o = e === "otra" ? limpiar(q.get("o"), 40) : "";
    return { n: n, e: e, m: m, o: o, esp: e === "otra" ? (o || "Otra especialidad") : ESP[e].label };
  }
  g.SANA_CREA = { ESP: ESP, MOD: MOD, limpiar: limpiar, iniciales: iniciales, colores: colores, contraste: contraste, params: params };
})(window);
