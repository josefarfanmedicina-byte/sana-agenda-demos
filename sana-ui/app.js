/* SANA UI — prototipo visual. Datos 100% ficticios. Sin backend, sin librerías, sin analítica.
   Todo texto se inserta con textContent/nodos DOM (nunca innerHTML con datos). */
(function () {
  "use strict";
  var KEY = "sana_ui_state_v1", SEED = window.SANA_SEED, D = window.SANA_DATA;
  var app = document.getElementById("app");
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function h(tag, props) {
    var e = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) {
      var v = p[k]; if (v === false || v == null) return;
      if (k === "class") e.className = v; else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, ""); else e.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) { k.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof k === "string" ? document.createTextNode(k) : k); }
  var NS = "http://www.w3.org/2000/svg";
  var ICONS = {
    home: ["M3 11l9-8 9 8", "M5 10v10h14V10"], cal: ["M4 6h16v15H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
    doc: ["M7 3h7l5 5v13H7z", "M14 3v5h5"], line: ["M3 12h4l3-8 4 16 3-8h4"],
    sun: ["M12 8a4 4 0 100 8 4 4 0 000-8z", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M5 5l2 2", "M17 17l2 2", "M19 5l-2 2", "M7 17l-2 2"],
    clock: ["M12 3a9 9 0 100 18 9 9 0 000-18z", "M12 7v5l3 2"]
  };
  function icon(name) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "svg"); s.setAttribute("aria-hidden", "true");
    ICONS[name].forEach(function (d) { var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); s.appendChild(p); }); return s;
  }
  var MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function parse(s) { var m = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?$/.exec(s || ""); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : NaN; }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtD(s) { var d = new Date(parse(s)); return DIA[d.getUTCDay()] + " " + d.getUTCDate() + " " + MES[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function fmtShort(s) { var d = new Date(parse(s)); return d.getUTCDate() + " " + MES[d.getUTCMonth()]; }
  function fmtDT(s) { var d = new Date(parse(s)); return d.getUTCDate() + " " + MES[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); }
  function addMin(s, n) { var d = new Date(parse(s) + n * 60000); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()) + "T" + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); }
  function whenCita(c) { return c.fecha === SEED.hoy ? "Hoy" : fmtD(c.fecha); }

  /* ---- estado (localStorage, solo ficticio) ---- */
  var mem = null;
  function load() { try { var r = localStorage.getItem(KEY); if (r) { var s = JSON.parse(r); if (s && s.version === SEED.version) return s; } } catch (e) {} return mem || clone(SEED); }
  var S = load();
  function save() { mem = S; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function tick(n) { S.sim = addMin(S.sim, n); return S.sim; }
  function reset() { S = clone(SEED); save(); if (location.hash === "#/inicio") render(); else location.hash = "#/inicio"; }

  /* ---- marco común ---- */
  var PERSONA_TABS = [["inicio", "#/inicio", "home", "Inicio"], ["cita", "#/cita", "cal", "Cita"], ["resultados", "#/resultados", "doc", "Resultados"], ["linea", "#/linea", "line", "Línea de salud"]];
  var PRO_TABS = [["hoy", "#/pro", "sun", "Hoy"], ["agenda", "#/pro/agenda", "cal", "Agenda"], ["proresultados", "#/pro/resultados", "doc", "Resultados"], ["seguimientos", "#/pro/seguimientos", "clock", "Seguimientos"]];
  function shell(role, active, content) {
    var tabs = (role === "pro" ? PRO_TABS : PERSONA_TABS);
    var top = h("header", { class: "topbar" },
      h("span", { class: "logo" }, h("i", { "aria-hidden": "true", text: "S" }), h("b", { text: "SANA" })),
      h("div", { class: "switch", role: "group", "aria-label": "Cambiar de vista" },
        h("a", { id: "sw-personas", class: "sw" + (role === "persona" ? " on" : ""), href: "#/inicio", "aria-current": role === "persona" ? "page" : false }, "Personas"),
        h("a", { id: "sw-pro", class: "sw" + (role === "pro" ? " on" : ""), href: "#/pro", "aria-current": role === "pro" ? "page" : false }, "Profesionales")));
    var nav = h("nav", { class: "tabs", "aria-label": role === "pro" ? "Navegación de profesionales" : "Navegación de personas" },
      tabs.map(function (t) { return h("a", { class: "tab" + (active === t[0] ? " on" : ""), href: t[1], "data-tab": t[0], "aria-current": active === t[0] ? "page" : false }, icon(t[2]), h("span", { text: t[3] })); }));
    var foot = h("footer", { class: "foot" }, h("p", { text: "Datos 100% ficticios · No apto para pacientes reales · Sin envío real de mensajes." }),
      h("button", { class: "btn btn-quiet", id: "reset", type: "button", onclick: reset }, "Reiniciar demo"));
    var wrap = h("div", { class: "screen role-" + role }, top, h("main", { class: "main" }, content), foot);
    app.replaceChildren(wrap, nav);
    var t = wrap.querySelector("h1"); if (t) t.setAttribute("tabindex", "-1");
    window.scrollTo(0, 0);
    return wrap;
  }
  function badge(txt, kind, id) { return h("span", { class: "badge b-" + kind, id: id || false, text: txt }); }
  function hero(sub, greet) {
    return h("section", { class: "hero" }, h("p", { class: "greet", id: "saludo", text: greet }), h("h1", { text: "SANA — Tu salud, más clara." }), h("p", { class: "sub", text: sub }));
  }
  function cardHead(title, linkText, href) {
    return h("div", { class: "chead" }, h("h2", { text: title }), linkText ? h("a", { class: "more", href: href }, linkText) : null);
  }

  /* ---- 1. HOME PERSONAS ---- */
  function vInicio() {
    var c = S.cita, last = S.checkin;
    var moods = h("div", { class: "moods", role: "group", "aria-label": "¿Cómo estás?" }, D.animos.map(function (a) {
      var on = last && last.id === a.id;
      return h("button", { class: "mood" + (on ? " on" : ""), type: "button", "data-mood": a.id, "aria-pressed": on ? "true" : "false", onclick: function () {
        S.checkin = { id: a.id, emo: a.emo, txt: a.txt, sim: tick(2) }; save(); render(); } }, h("span", { class: "emo", "aria-hidden": "true", text: a.emo }), h("span", { class: "mt", text: a.txt }));
    }));
    var nameBox = h("div", { class: "namebox", id: "namebox", hidden: true });
    var nameIn = h("input", { type: "text", id: "in-nombre", maxlength: "30", "aria-label": "Tu nombre", autocomplete: "off" });
    nameIn.value = S.nombre;
    nameBox.appendChild(h("div", { class: "row" }, nameIn, h("button", { class: "btn btn-main btn-sm", id: "guardar-nombre", type: "button", onclick: function () {
      var v = nameIn.value.trim().slice(0, 30); if (v) { S.nombre = v; save(); render(); } } }, "Guardar")));
    var content = [
      hero("Tu cita, tus indicaciones y tus resultados, en un solo lugar.", "Hola, " + S.nombre),
      h("button", { class: "linkbtn", id: "cambiar-nombre", type: "button", onclick: function () { nameBox.hidden = !nameBox.hidden; if (!nameBox.hidden) nameIn.focus(); } }, "Cambiar nombre (ejemplo)"),
      nameBox,
      h("section", { class: "card feel", id: "animo" },
        h("h2", { text: "¿Cómo estás?" }), moods,
        last ? h("p", { class: "okline", id: "checkin-estado", text: "Registrado: " + last.txt + " · " + fmtDT(last.sim) + " (hora de ejemplo)" })
             : h("p", { class: "muted small", id: "checkin-estado", text: "Toca una opción. Se guarda solo en este dispositivo (ejemplo)." }),
        h("p", { class: "muted small", text: "SANA no interpreta tu respuesta ni da consejos." })),
      h("section", { class: "card next", id: "home-cita" },
        cardHead("Próxima cita", "Ver cita", "#/cita"),
        h("p", { class: "bigline" }, h("b", { text: whenCita(c) }), " · " + c.hora),
        h("p", { class: "muted", text: D.profesional + " · " + D.lugar }),
        c.estado === "confirmada" ? badge("Confirmada", "ok", "home-cita-estado") : badge("Por confirmar", "wait", "home-cita-estado")),
      h("section", { class: "card", id: "home-indic" }, cardHead("Medicamentos e indicaciones (ejemplo)", false),
        h("ul", { class: "plain" }, D.indicaciones.map(function (i) { return h("li", {}, h("b", { text: i.t }), h("span", { class: "muted block", text: i.d })); }))),
      h("section", { class: "card", id: "home-res" }, cardHead("Resultados recientes", "Ver todos", "#/resultados"),
        h("ul", { class: "rows" }, D.resultados.slice(0, 2).map(function (r) { return resRow(r); }))),
      h("section", { class: "card", id: "home-linea" }, cardHead("Tu línea de salud", "Ver línea", "#/linea"),
        h("ol", { class: "mini" }, D.linea.slice(0, 3).map(function (l) { return h("li", {}, h("span", { class: "dot t-" + l.tipo }), h("span", {}, h("b", { text: l.titulo }), h("span", { class: "muted block small", text: fmtShort(l.fecha) }))); })))
    ];
    shell("persona", "inicio", content);
  }
  function resRow(r) {
    return h("li", {}, h("a", { class: "rowlink", href: "#/resultado/" + r.id }, h("span", {}, h("b", { text: r.nombre }), h("span", { class: "muted block small", text: fmtD(r.fecha) })), badge(r.estado === "disponible" ? "Disponible" : "Lo revisará tu profesional", r.estado === "disponible" ? "info" : "soft")));
  }

  /* ---- 2. HOME PROFESIONALES (Hoy / Agenda / Resultados / Seguimientos) ---- */
  function vPro(section) {
    var c = S.cita, pend = S.pendientes.filter(function (p) { return !p.hecho; });
    var hoyList = D.hoyPacientes.filter(function (p) { return p.id !== "p1" || c.fecha === SEED.hoy; });
    var cards = hoyList.map(function (p) {
      var st = p.id === "p1" ? (c.estado === "confirmada" ? ["Confirmada", "ok"] : ["Por confirmar", "wait"]) : ["Por confirmar", "wait"];
      if (p.id === "p3") st = ["Confirmada", "ok"];
      return h("article", { class: "card pat", "data-pid": p.id }, h("div", { class: "hora", text: p.hora }), h("div", { class: "pi" }, h("h3", { text: p.nombre }), h("p", { class: "muted", text: p.motivo })), badge(st[0], st[1]));
    });
    var agenda = D.agendaExtra.slice(); agenda.push({ fecha: c.fecha, hora: c.hora, nombre: "Ana Torres" });
    agenda.sort(function (a, b) { return parse(a.fecha + "T" + a.hora) - parse(b.fecha + "T" + b.hora); });
    var byDay = {}; agenda.forEach(function (a) { (byDay[a.fecha] = byDay[a.fecha] || []).push(a); });
    var segIn = h("input", { type: "text", id: "in-seguimiento", maxlength: "80", placeholder: "Ej.: Llamar a un paciente (ejemplo)", "aria-label": "Nuevo seguimiento", autocomplete: "off" });
    var segErr = h("p", { class: "err", id: "seg-err", role: "alert" });
    var content = [
      hero("Tus pacientes de hoy y lo pendiente, sin vueltas.", "Buen día, " + D.profesional),
      h("button", { class: "btn btn-main", id: "ir-pendientes", type: "button", onclick: function () { var e = document.getElementById("pendientes"); if (e) e.scrollIntoView({ block: "start" }); } }, "Revisar pendientes (" + pend.length + ")"),
      h("section", { id: "hoy", class: "sec" }, h("h2", { class: "sech", text: "Pacientes de hoy · " + fmtD(SEED.hoy) }), h("div", { class: "stack" }, cards.length ? cards : h("p", { class: "muted", text: "Sin pacientes hoy." }))),
      h("section", { id: "pendientes", class: "sec" }, h("h2", { class: "sech", text: "Pendientes importantes" }),
        h("div", { class: "stack" }, S.pendientes.map(function (p) {
          return h("article", { class: "card pend" + (p.hecho ? " done" : ""), "data-qid": p.id }, h("p", { class: "ptxt", text: p.texto }),
            p.hecho ? badge("Hecho", "ok") : h("button", { class: "btn btn-outline btn-sm", type: "button", "data-k": "hecho", onclick: function () { p.hecho = true; save(); render(); } }, "Marcar como hecho")); }))),
      h("section", { id: "agenda", class: "sec" }, h("h2", { class: "sech", text: "Agenda" }),
        h("div", { class: "card" }, Object.keys(byDay).sort().map(function (d) {
          return h("div", { class: "day" }, h("h3", { text: d === SEED.hoy ? "Hoy · " + fmtShort(d) : fmtD(d) }), h("ul", { class: "plain tight" }, byDay[d].map(function (a) { return h("li", {}, h("b", { text: a.hora }), " · " + a.nombre); })));
        }))),
      h("section", { id: "proresultados", class: "sec" }, h("h2", { class: "sech", text: "Resultados nuevos" }),
        h("div", { class: "card" }, h("ul", { class: "rows" }, D.resultadosNuevos.map(function (r) { return h("li", {}, h("span", { class: "rowlink" }, h("span", {}, h("b", { text: r.nombre }), h("span", { class: "muted block small", text: r.item + " (ejemplo)" })), badge("Nuevo", "info"))); })))),
      h("section", { id: "seguimientos", class: "sec" }, h("h2", { class: "sech", text: "Seguimientos" }),
        h("div", { class: "card" }, h("ul", { class: "plain", id: "seg-lista" }, S.seguimientos.map(function (s) { return h("li", { class: "seg", text: s.texto }); })),
          h("div", { class: "row addrow" }, segIn, h("button", { class: "btn btn-main btn-sm", id: "add-seguimiento", type: "button", onclick: function () {
            var v = segIn.value.trim(); if (!v) { segErr.textContent = "Escribe un recordatorio breve."; return; }
            S.seguimientos.push({ id: "s" + (S.nextId++), texto: v.slice(0, 80) }); save(); render(); } }, "Agregar")), segErr,
          h("p", { class: "muted small", text: "Solo recordatorios breves de ejemplo. No escribas datos de salud reales." })))
    ];
    var activeTab = { hoy: "hoy", pendientes: "hoy", agenda: "agenda", proresultados: "proresultados", seguimientos: "seguimientos" }[section] || "hoy";
    shell("pro", activeTab, content);
    if (section && section !== "hoy") { var el = document.getElementById(section); if (el) el.scrollIntoView({ block: "start" }); }
  }

  /* ---- 3. LÍNEA DE TIEMPO ---- */
  var filtro = "todo";
  function vLinea() {
    var TIPOS = [["todo", "Todo"], ["cita", "Citas"], ["resultado", "Resultados"], ["plan", "Planes"]];
    var list = h("ol", { class: "timeline", id: "tl-lista" });
    function paint() {
      list.replaceChildren();
      D.linea.filter(function (l) { return filtro === "todo" || l.tipo === filtro; }).forEach(function (l) {
        var body = [h("span", { class: "tt muted small", text: fmtD(l.fecha) }), h("b", { class: "block", text: l.titulo }), h("span", { class: "muted block small", text: l.detalle })];
        list.appendChild(h("li", { class: "tl-item t-" + l.tipo, "data-tipo": l.tipo }, l.dest ? h("a", { class: "tl-link", href: l.dest }, body) : h("div", { class: "tl-link" }, body)));
      });
    }
    var chips = h("div", { class: "fchips", role: "group", "aria-label": "Filtrar por tipo" }, TIPOS.map(function (t) {
      return h("button", { class: "fchip" + (filtro === t[0] ? " on" : ""), type: "button", "data-f": t[0], "aria-pressed": filtro === t[0] ? "true" : "false", onclick: function () {
        filtro = t[0]; Array.prototype.forEach.call(chips.children, function (c) { var on = c.getAttribute("data-f") === filtro; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); }); paint(); } }, t[1]);
    }));
    paint();
    shell("persona", "linea", [h("h1", { text: "Tu línea de salud" }), h("p", { class: "lead", text: "Tus citas, resultados y planes, en orden. Nada más." }), chips, h("section", { class: "card" }, list)]);
  }

  /* ---- 4. VISTA DE CITA ---- */
  function vCita() {
    var c = S.cita, repro = h("div", { class: "repro", id: "repro", hidden: true });
    repro.appendChild(h("p", { class: "muted", text: "Elige un nuevo horario (simulado):" }));
    D.slots.forEach(function (s) {
      repro.appendChild(h("button", { class: "btn btn-outline", type: "button", "data-slot": s.fecha + " " + s.hora, onclick: function () {
        c.fecha = s.fecha; c.hora = s.hora; c.estado = "por_confirmar"; c.confSim = null; c.reprogramada = true; tick(3); save(); render(); } }, fmtD(s.fecha) + " · " + s.hora));
    });
    var details = function (id, title, kids, open) { var d = h("details", { class: "card det", id: id }, h("summary", { text: title }), kids); if (open) d.setAttribute("open", ""); return d; };
    shell("persona", "cita", [
      h("h1", { text: "Tu cita" }),
      h("section", { class: "card cita-main" },
        h("p", { class: "cdate", id: "cita-fecha", text: whenCita(c) + " · " + c.hora }),
        h("p", { class: "muted", text: fmtD(c.fecha) }),
        h("p", {}, h("b", { text: D.profesional }), h("span", { class: "muted block", text: D.lugar + " (ejemplo)" })),
        h("p", {}, c.estado === "confirmada" ? badge("Confirmada", "ok", "cita-estado") : badge("Por confirmar", "wait", "cita-estado"),
          c.reprogramada ? h("span", { class: "muted small", id: "cita-repro", text: "  Reprogramada (simulado)" }) : null),
        c.estado === "confirmada" ? h("p", { class: "okline", id: "cita-conf-info", text: "Confirmaste tu asistencia: " + fmtDT(c.confSim) + " (hora de ejemplo)." })
          : h("button", { class: "btn btn-main", id: "confirmar-cita", type: "button", onclick: function () { c.estado = "confirmada"; c.confSim = tick(4); save(); render(); } }, "Confirmar cita"),
        h("button", { class: "btn btn-outline", id: "reprogramar", type: "button", "aria-expanded": "false", onclick: function (e) { repro.hidden = !repro.hidden; e.currentTarget.setAttribute("aria-expanded", repro.hidden ? "false" : "true"); } }, "Reprogramar"),
        repro, h("p", { class: "muted small", text: "Simulado: no se avisa a nadie." })),
      details("preparar", "Qué preparar", h("ul", { class: "plain" }, ["Llega 10 minutos antes (ejemplo).", "Lleva tu documento de identidad (ejemplo).", "Anota tus preguntas para la consulta (ejemplo)."].map(function (t) { return h("li", { text: t }); })), true),
      details("llegar", "Cómo llegar", h("div", {}, h("p", { text: D.direccion }), h("ol", { class: "steps" }, ["Entrada por la puerta azul (ejemplo).", "Sube al 2.º piso por la escalera o el ascensor (ejemplo).", "Pregunta en recepción por la Dra. de ejemplo."].map(function (t) { return h("li", { text: t }); })), h("p", { class: "muted small", text: "Sin mapas externos: es una dirección y pasos de ejemplo." })), false)
    ]);
  }

  /* ---- 5. RESULTADOS SIMPLES ---- */
  function vResultados() {
    shell("persona", "resultados", [h("h1", { text: "Tus resultados" }), h("p", { class: "lead", text: "Aquí solo ves que están disponibles. Tu profesional te los explica." }),
      h("section", { class: "card" }, h("ul", { class: "rows" }, D.resultados.map(resRow))),
      h("p", { class: "muted small", text: "No es un diagnóstico; tu profesional te lo explicará." })]);
  }
  function vResultado(id) {
    var r = D.resultados.filter(function (x) { return x.id === id; })[0];
    if (!r) return shell("persona", "resultados", [h("h1", { text: "No encontramos este resultado" }), h("a", { class: "btn btn-main", href: "#/resultados" }, "Volver a Resultados")]);
    shell("persona", "resultados", [
      h("a", { class: "back", href: "#/resultados" }, "← Resultados"),
      h("h1", { text: r.nombre }), h("p", { class: "muted", text: fmtD(r.fecha) }),
      h("p", {}, badge(r.estado === "disponible" ? "Disponible" : "Lo revisará tu profesional", r.estado === "disponible" ? "info" : "soft", "res-estado")),
      h("section", { class: "card" }, h("h2", { text: "¿Qué es esto?" }), h("p", { text: r.exp }),
        h("div", { class: "ejemplo", id: "res-dato" }, h("span", { class: "tag", text: "Dato de ejemplo" }), h("p", { text: r.dato.replace("Dato de ejemplo: ", "Valor: ") + " (ficticio, sin interpretación)" }))),
      h("div", { class: "notice", id: "aviso-diag", role: "note" }, h("b", { text: "No es un diagnóstico; " }), "tu profesional te lo explicará.")]);
  }

  /* ---- router ---- */
  function render() {
    var parts = (location.hash || "#/inicio").replace(/^#\/?/, "").split("/"), r = parts[0], a = parts[1];
    if (a && !/^[A-Za-z0-9_]+$/.test(a)) a = "";
    switch (r) {
      case "cita": return vCita();
      case "resultados": return vResultados();
      case "resultado": return vResultado(a);
      case "linea": return vLinea();
      case "pro": return vPro(a === "resultados" ? "proresultados" : (a || "hoy"));
      default: return vInicio();
    }
  }
  window.addEventListener("hashchange", render);
  render();
})();
