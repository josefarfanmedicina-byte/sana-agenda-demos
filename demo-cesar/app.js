/* SANA Personas — demo personal. DATOS 100% DE EJEMPLO, sin backend. Texto dinámico siempre con textContent. */
(function () {
  "use strict";
  var KEY = "sana:demo-cesar:v1", app = document.getElementById("app"), tabs = document.getElementById("tabs");
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parse = function (s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var larga = function (s) { var d = parse(s); return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; };
  var corta = function (s) { var d = parse(s); return d.getDate() + " " + MESES[d.getMonth()].slice(0, 3); };
  var plusDays = function (n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return iso(d); };

  /* ---- Plan de EJEMPLO ---- */
  var PLAN = [
    { id: "h1", grupo: "hacer", t: "Caminar 20 minutos (ejemplo)", w: "Hoy" },
    { id: "h2", grupo: "hacer", t: "Preparar tu lista de preguntas (ejemplo)", w: "Antes de tu próxima cita" },
    { id: "m1", grupo: "tomar", t: "Medicamento de ejemplo A", w: "Mañana · 8:00 a. m. · como te indicó tu profesional" },
    { id: "m2", grupo: "tomar", t: "Medicamento de ejemplo B", w: "Noche · 8:00 p. m. · como te indicó tu profesional" },
    { id: "e1", grupo: "examen", t: "Examen de ejemplo", w: "Antes de tu próxima cita" }
  ];
  var GRUPOS = [["hacer", "Qué hacer"], ["tomar", "Qué tomar (horarios de ejemplo)"], ["examen", "Qué examen o control sigue"]];

  /* ---- Estado (localStorage, solo ficticio) ---- */
  function fresh() { return { v: 1, done: { h1: true }, cita: "pendiente", fecha: plusDays(4), hoy: plusDays(0) }; }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1 && s.done) return s; } catch (e) {} var f = fresh(); localStorage.setItem(KEY, JSON.stringify(f)); return f; }
  function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
  function count(s) { return PLAN.filter(function (p) { return s.done[p.id]; }).length; }
  function toggle(id) { var s = load(); if (s.done[id]) delete s.done[id]; else s.done[id] = true; save(s); }

  /* ---- DOM seguro ---- */
  function h(tag, props) {
    var e = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) { var v = p[k]; if (v == null || v === false) return; if (k === "class") e.className = v; else if (k === "text") e.textContent = v; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v); });
    (function add(list) { list.forEach(function (x) { if (x == null || x === false) return; if (Array.isArray(x)) add(x); else e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); })(Array.prototype.slice.call(arguments, 2));
    return e;
  }
  var NS = "http://www.w3.org/2000/svg", IC = { inicio: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10", plan: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", cita: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", linea: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", check: "M5 12.5l4.5 4.5L19 7.5" };
  function icon(n, sz) { var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", sz || 24); s.setAttribute("height", sz || 24); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true"); var p = document.createElementNS(NS, "path"); p.setAttribute("d", IC[n]); s.appendChild(p); return s; }
  function meter(n) { return h("div", { class: "meter", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": PLAN.length, "aria-valuenow": n, "aria-label": "Pasos marcados" }, h("i", { style: "width:" + Math.round(n / PLAN.length * 100) + "%" })); }
  function cnt(n) { return h("span", { class: "count", "data-count": n, text: n + " de " + PLAN.length + " pasos marcados" }); }

  var ROUTES = ["inicio", "plan", "cita", "linea", "medico"], cur = "inicio";
  function bar(extra) { return h("div", { class: "bar" }, h("span", { class: "brand", text: "SANA" }), extra); }
  function medBtn() { return h("a", { class: "btn btn-out btn-sm", id: "ver-medico", href: "#/medico" }, "Ver como médico"); }
  function resetBtn() { return h("div", { class: "reset" }, h("button", { class: "btn btn-ghost", id: "reset", type: "button", onclick: function () { localStorage.removeItem(KEY); rendered = null; location.hash = "#/inicio"; render(); } }, "Reiniciar demo")); }
  var rendered = null;
  function page(cls, kids) { var y = window.scrollY, s = h("main", { class: "screen " + (cls || ""), id: "screen" }, kids); if (rendered === cur) s.style.animation = "none"; app.replaceChildren(s); if (rendered === cur) window.scrollTo(0, y); return s; }

  /* ---- 1. Inicio ---- */
  function vInicio() {
    var s = load(), n = count(s), next = PLAN.filter(function (p) { return !s.done[p.id]; })[0];
    var status = h("p", { class: "status", id: "status", "aria-live": "polite" });
    var main = next ? h("section", { class: "card next", id: "siguiente" }, h("div", { class: "kicker", text: "Tu siguiente paso" }), h("h2", { id: "sig-titulo", text: next.t }), h("p", { class: "when", text: next.w }),
      h("button", { class: "btn btn-pri full", id: "hecho", type: "button", onclick: function () { toggle(next.id); vInicio(); document.getElementById("status").textContent = "Listo · marcado por ti. Esto no confirma toma real."; } }, "Marcar como hecho"), status, h("span", { class: "tag", style: "margin-top:6px", text: "Ejemplo ficticio" }))
      : h("section", { class: "card next", id: "siguiente" }, h("div", { class: "kicker", text: "Tu siguiente paso" }), h("h2", { id: "sig-titulo", text: "Marcaste todos los pasos de tu plan" }), h("p", { class: "when", text: "Ahora solo falta tu próxima cita." }), h("a", { class: "btn btn-pri full", style: "margin-top:18px", href: "#/cita" }, "Ver mi cita"));
    var v = page("", [
      bar(medBtn()),
      h("h1", { id: "saludo", text: "Hola, César" }), h("p", { class: "sub", text: "Tu salud, más clara" }),
      main,
      h("section", { class: "card", id: "prox-cita" }, h("div", { class: "kicker", text: "Próxima cita" }), h("div", { class: "row", style: "margin-top:6px" }, h("div", {}, h("b", { text: larga(s.fecha) + " · 4:30 p. m." }), h("div", { class: "when", text: "Dr. de ejemplo" })), h("span", { class: "tag " + (s.cita === "confirmada" ? "ok" : "warn"), text: s.cita === "confirmada" ? "Confirmada" : "Por confirmar" })), h("a", { class: "link", href: "#/cita" }, "Ver cita")),
      h("section", { class: "card", id: "mi-plan-res" }, h("div", { class: "kicker", text: "Tu plan" }), cnt(n), meter(n), h("a", { class: "link", id: "abrir-plan", href: "#/plan" }, "Abrir plan")),
      resetBtn()]);
    return v;
  }

  /* ---- 2/3. Mi plan ---- */
  function vPlan() {
    var s = load(), n = count(s);
    var blocks = GRUPOS.map(function (g) {
      return h("section", { class: "block", "data-grupo": g[0] }, h("h2", { text: g[1] }), PLAN.filter(function (p) { return p.grupo === g[0]; }).map(function (p) {
        return h("button", { class: "step", type: "button", "data-id": p.id, "aria-pressed": s.done[p.id] ? "true" : "false", onclick: function () { toggle(p.id); vPlan(); } },
          h("span", { class: "box" }, icon("check", 18)), h("span", {}, h("b", { text: p.t }), h("small", { text: p.w })));
      }), g[0] === "examen" ? h("div", { class: "plain", text: "Control de ejemplo con tu profesional, según lo conversado en la consulta." }) : null);
    });
    page("", [bar(medBtn()), h("h1", { id: "plan-titulo", text: "Mi plan" }), h("p", { class: "sub", text: "Después de tu consulta de ejemplo" }),
      h("section", { class: "card", id: "progreso" }, cnt(n), meter(n), h("p", { class: "hint", id: "aviso-check", text: "Un check significa solo que marcaste este paso como hecho. No confirma que lo hayas tomado ni mide cumplimiento clínico." })),
      blocks,
      h("section", { class: "block", "data-grupo": "volver" }, h("h2", { text: "Cuándo volver" }), h("div", { class: "plain" }, h("b", { text: larga(s.fecha) + " · 4:30 p. m." }), h("p", { class: "when", text: "Si tienes dudas antes, escríbele a tu profesional. Si es una urgencia, acude a emergencias." }), h("a", { class: "link", href: "#/cita" }, "Ver cita"))),
      resetBtn()]);
  }

  /* ---- 4. Cita ---- */
  function vCita() {
    var s = load(), conf = s.cita === "confirmada";
    page("", [bar(medBtn()), h("h1", { id: "cita-titulo", text: "Próxima cita" }), h("p", { class: "sub", text: "Control de ejemplo" }),
      h("section", { class: "card" }, h("span", { class: "tag " + (conf ? "ok" : "warn"), id: "cita-estado", text: conf ? "Confirmada" : "Por confirmar" }),
        h("div", { class: "sum" }, [["Día", larga(s.fecha)], ["Hora", "4:30 p. m."], ["Profesional", "Dr. de ejemplo"], ["Lugar", "Consultorio de ejemplo"]].map(function (r) { return h("div", {}, h("span", { text: r[0] }), h("span", { text: r[1] })); })),
        conf ? h("button", { class: "btn btn-out full", id: "deshacer", type: "button", style: "margin-top:16px", onclick: function () { var x = load(); x.cita = "pendiente"; save(x); vCita(); } }, "Deshacer confirmación")
             : h("button", { class: "btn btn-pri full", id: "confirmar", type: "button", style: "margin-top:16px", onclick: function () { var x = load(); x.cita = "confirmada"; save(x); vCita(); } }, "Confirmar cita")),
      h("section", { class: "card" }, h("div", { class: "kicker", text: "Qué preparar" }), h("ul", { class: "list" }, [h("li", { text: "Lleva tu lista de preguntas (ejemplo)." }), h("li", { text: "Llega 10 minutos antes." }), h("li", { text: "Trae este plan para conversarlo con tu profesional." })])),
      resetBtn()]);
  }

  /* ---- 5. Línea de tiempo ---- */
  function vLinea() {
    var s = load();
    var items = [[plusDays(-30), "Documento de ejemplo: Informe anterior", "Disponible", false], [plusDays(-14), "Resultado de ejemplo: Examen anterior", "Disponible", false], [s.hoy, "Consulta de ejemplo realizada", "Con el Dr. de ejemplo", false], [s.hoy, "Plan de ejemplo recibido", "Disponible", false], [s.fecha, "Próxima cita: control de ejemplo", s.cita === "confirmada" ? "Confirmada" : "Por confirmar", true]];
    page("", [bar(medBtn()), h("h1", { id: "linea-titulo", text: "Mi línea de tiempo" }), h("p", { class: "sub", text: "Documentos y resultados de ejemplo" }),
      h("ol", { class: "tl", id: "tl" }, items.map(function (it) { return h("li", { class: it[3] ? "future" : "" }, h("b", { text: it[1] }), h("span", { class: "d", text: (it[0] === s.hoy ? "Hoy" : corta(it[0])) }), h("span", { class: "tag " + (it[2] === "Disponible" ? "blue" : it[2] === "Confirmada" ? "ok" : it[2] === "Por confirmar" ? "warn" : ""), style: "margin-top:4px", text: it[2] })); })),
      h("p", { class: "fine", text: "Sin valores ni interpretación: tu profesional te explicará cada documento." }), resetBtn()]);
  }

  /* ---- 6. Vista médico (sincronizada por localStorage) ---- */
  function vMedico() {
    var s = load(), n = count(s);
    page("med", [h("div", { class: "bar" }, h("span", { class: "brand", text: "SANA" }), h("a", { class: "btn btn-out btn-sm", id: "volver-paciente", href: "#/inicio" }, "Volver a la vista del paciente")),
      h("span", { class: "tag blue", text: "Vista del médico · ejemplo" }), h("h1", { id: "med-titulo", text: "Plan de César" }), h("p", { class: "sub" }, h("span", { class: "dot" }), "Se actualiza en vivo con las marcas del paciente"),
      h("section", { class: "card" }, h("div", { class: "kicker", text: "Plan creado" }), h("div", { style: "font-size:1.35rem;font-weight:800;margin-top:6px", id: "med-tiempo", text: "Plan creado en 48 s (ejemplo)" }), h("p", { class: "when", text: "Tiempo ilustrativo, no medido." })),
      h("section", { class: "card", id: "med-progreso" }, h("div", { class: "kicker", text: "Progreso del paciente" }), cnt(n), meter(n),
        h("div", { id: "med-pasos" }, PLAN.map(function (p) { return h("div", { class: "mrow", "data-id": p.id, "data-done": s.done[p.id] ? "1" : "0" }, h("span", { class: "tag " + (s.done[p.id] ? "ok" : ""), text: s.done[p.id] ? "Marcado" : "Pendiente" }), h("span", { text: p.t })); })),
        h("p", { class: "hint", text: "Una marca significa que el paciente marcó el paso como hecho. No confirma toma real ni cumplimiento clínico." })),
      h("section", { class: "card" }, h("div", { class: "kicker", text: "Próxima cita" }), h("div", { class: "row", style: "margin-top:6px" }, h("b", { text: larga(s.fecha) + " · 4:30 p. m." }), h("span", { id: "med-cita", class: "tag " + (s.cita === "confirmada" ? "ok" : "warn"), text: s.cita === "confirmada" ? "Confirmada" : "Por confirmar" }))),
      resetBtn()]);
  }

  var VIEWS = { inicio: vInicio, plan: vPlan, cita: vCita, linea: vLinea, medico: vMedico };
  var TABS = [["inicio", "Inicio"], ["plan", "Mi plan"], ["cita", "Cita"], ["linea", "Línea"]];
  function renderTabs() {
    tabs.classList.toggle("hide", cur === "medico");
    tabs.replaceChildren(h("div", { class: "in" }, TABS.map(function (t) { return h("a", { class: "tab", id: "tab-" + t[0], href: "#/" + t[0], "aria-current": cur === t[0] ? "page" : null }, icon(t[0], 24), t[1]); })));
  }
  function render(focus) {
    var m = /^#\/(\w+)/.exec(location.hash); cur = m && VIEWS[m[1]] ? m[1] : "inicio";
    VIEWS[cur](); rendered = cur; renderTabs(); if (focus !== "keep") window.scrollTo(0, 0);
    if (focus !== false) { var hd = app.querySelector("h1"); if (hd) { hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true }); } }
  }
  window.addEventListener("hashchange", function () { rendered = null; render(); });
  window.addEventListener("storage", function (e) { if (e.key === KEY && cur === "medico") { var y = window.scrollY; vMedico(); window.scrollTo(0, y); } });
  render(false);
})();
