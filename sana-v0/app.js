/* SANA v0 — prototipo navegable. Datos 100% ficticios. Sin backend, sin librerías, sin analítica.
   Seguridad de render: TODO texto se inserta con textContent / nodos DOM (nunca innerHTML con datos). */
(function () {
  "use strict";
  var KEY = "sana_v0_state_v1";
  var SEED = window.SANA_SEED, TPL = window.SANA_TEMPLATES;
  var app = document.getElementById("app");

  /* ---------- utilidades ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function h(tag, props) {
    var e = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) {
      var v = p[k];
      if (v === false || v == null) return;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, "");
      else e.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, k) {
    if (k == null || k === false) return;
    if (Array.isArray(k)) { k.forEach(function (x) { add(e, x); }); return; }
    e.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
  }
  var MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function parse(s) { var m = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?$/.exec(s || ""); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : NaN; }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtD(s) { var t = parse(s); if (isNaN(t)) return "—"; var d = new Date(t); return DIA[d.getUTCDay()] + " " + d.getUTCDate() + " " + MES[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function fmtDT(s) { var t = parse(s); if (isNaN(t)) return "—"; var d = new Date(t); return d.getUTCDate() + " " + MES[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); }
  function addDays(s, n) { var d = new Date(parse(s) + n * 86400000); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()); }
  function addMin(s, n) { var d = new Date(parse(s) + n * 60000); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()) + "T" + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); }
  var FREC = { una_vez: "Una sola vez", diario: "Todos los días", dos_dia: "2 veces al día", semanal: "Una vez por semana" };

  /* ---------- estado (localStorage, solo datos ficticios) ---------- */
  var mem = null;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var s = JSON.parse(raw); if (s && s.version === SEED.version) return s; } } catch (e) {}
    return mem || clone(SEED);
  }
  var S = load();
  function save() { mem = S; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function tick(min) { S.sim = addMin(S.sim, min); return S.sim; }
  function patient(id) { return S.patients.filter(function (p) { return p.id === id; })[0]; }
  function plan(id) { return S.plans.filter(function (p) { return p.id === id; })[0]; }
  function activePlan(pid) { return S.plans.filter(function (p) { return p.patientId === pid && p.status === "activo"; })[0]; }
  function progress(pl) { var d = pl.tareas.filter(function (t) { return t.done; }).length; return { done: d, total: pl.tareas.length }; }
  function logEvent(type, pl, detail) { S.events.push({ sim: S.sim, type: type, planId: pl.id, patientId: pl.patientId, detail: detail }); }
  var EV = { plan_creado: "Plan creado", plan_abierto: "Plan abierto", tarea_marcada: "Tarea marcada", cita_confirmada: "Cita confirmada" };
  function northStar() {
    var total = 0, ok = 0;
    S.plans.forEach(function (pl) {
      total++;
      var lim = parse(addDays(pl.creadoSim.slice(0, 10), 14) + "T" + pl.creadoSim.slice(11));
      var hit = S.events.some(function (e) { return e.planId === pl.id && (e.type === "tarea_marcada" || e.type === "cita_confirmada") && parse(e.sim) <= lim; });
      if (hit) ok++;
    });
    return { ok: ok, total: total, pct: total ? Math.round(ok * 100 / total) : 0 };
  }

  /* ---------- piezas de UI ---------- */
  var tCrearInicio = 0, toquesCrear = 0;
  function appbar(opts) {
    return h("header", { class: "appbar" },
      opts.back ? h("a", { class: "back", href: opts.back.href }, "← " + opts.back.text) : h("span", { class: "brand-mini" }, "SANA"),
      h("span", { class: "modo " + (opts.persona ? "modo-persona" : "modo-pro") }, opts.persona ? "Vista de la persona" : "Vista del profesional"));
  }
  function tabs(planId, active) {
    function t(href, key, ico, txt) { return h("a", { class: "tab" + (active === key ? " on" : ""), href: href, "aria-current": active === key ? "page" : false }, h("span", { class: "ico", "aria-hidden": "true" }, ico), h("span", { text: txt })); }
    return h("nav", { class: "tabs", "aria-label": "Navegación de la persona" },
      t("#/mi-plan/" + planId, "plan", "📋", "Mi plan"), t("#/progreso/" + planId, "progreso", "✔", "Progreso"), t("#/linea/" + planId, "linea", "🕑", "Mi línea"));
  }
  function foot() {
    return h("footer", { class: "foot" },
      h("p", { text: "Datos 100% ficticios · No apto para pacientes reales · Sin envío real de mensajes." }),
      h("button", { class: "btn btn-quiet", id: "reset", type: "button", onclick: reset }, "Reiniciar demo"));
  }
  function reset() { S = clone(SEED); save(); if (location.hash === "#/pacientes") render(); else location.hash = "#/pacientes"; }
  function page(children, persona, tabbed) {
    var wrap = h("div", { class: "screen" + (tabbed ? " has-tabs" : "") }, children);
    app.replaceChildren(wrap);
    var t = wrap.querySelector("h1"); if (t) { t.setAttribute("tabindex", "-1"); }
    window.scrollTo(0, 0);
    return wrap;
  }
  function bar(done, total) {
    var pct = total ? Math.round(done * 100 / total) : 0;
    return h("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(done), "aria-label": "Progreso" }, h("i", { style: "width:" + pct + "%" }));
  }
  function notFound() {
    page([appbar({ back: { href: "#/pacientes", text: "Mis pacientes" } }), h("main", { class: "main" }, h("h1", { text: "No encontramos este plan" }), h("p", { class: "lead", text: "El enlace no corresponde a un plan de este prototipo (quizá reiniciaste la demo)." }), h("a", { class: "btn btn-main", href: "#/pacientes" }, "Ir a Mis pacientes")), foot()]);
  }

  /* ---------- 1. MIS PACIENTES ---------- */
  function vPacientes() {
    var cards = S.patients.map(function (p) {
      var pl = activePlan(p.id), pr = pl ? progress(pl) : null;
      return h("article", { class: "card pcard", "data-pid": p.id },
        h("div", { class: "prow" }, h("div", { class: "avatar", "aria-hidden": "true" }, p.nombre.split(" ").map(function (w) { return w[0]; }).join("")),
          h("div", {}, h("h2", { class: "pname", text: p.nombre }), h("p", { class: "muted", text: p.motivo }))),
        h("div", { class: "badges" },
          h("span", { class: "badge " + (pl ? "b-ok" : "b-off"), "data-k": "plan" }, pl ? "Plan activo" : "Sin plan activo"),
          pl ? h("span", { class: "badge " + (pl.abiertoSim ? "b-ok" : "b-wait"), "data-k": "abierto" }, pl.abiertoSim ? "Abrió el plan" : "Aún no abre el plan") : null),
        pl ? h("div", { class: "pprog" }, bar(pr.done, pr.total), h("p", { class: "muted", "data-k": "prog", text: pr.done + " de " + pr.total + " acciones marcadas" })) : null,
        pl ? h("a", { class: "link", href: "#/enviado/" + pl.id }, "Ver plan enviado") : null);
    });
    var ns = northStar();
    var rows = S.events.slice().sort(function (a, b) { return parse(b.sim) - parse(a.sim); }).slice(0, 8).map(function (e) {
      var p = patient(e.patientId);
      return h("li", {}, h("b", { text: EV[e.type] || e.type }), " · " + (p ? p.nombre : "") + " · " + fmtDT(e.sim) + " (simulado)", e.type === "tarea_marcada" ? " — " : "", e.type === "tarea_marcada" ? h("span", { text: e.detail }) : null);
    });
    page([appbar({}),
      h("main", { class: "main" },
        h("h1", { text: "Mis pacientes" }), h("p", { class: "lead", text: "SANA — Tu salud, más clara." }),
        h("p", { class: "muted small", text: "Después de cada consulta, SANA convierte tus indicaciones en un plan claro para el paciente. Ejemplo ficticio." }),
        h("div", { class: "stack" }, cards),
        h("details", { class: "card metrics", id: "metricas" },
          h("summary", {}, "Métricas del prototipo"),
          h("p", { class: "muted small", text: "North Star (concepto): % de planes con al menos un siguiente paso completado en 14 días. Calculada solo sobre eventos simulados de este prototipo." }),
          h("p", { class: "ns" }, h("b", { id: "ns-value", text: ns.pct + "%" }), h("span", { id: "ns-detail", text: " (" + ns.ok + " de " + ns.total + " planes)" })),
          h("h3", { text: "Registro de eventos simulados" }), h("ol", { class: "evlist", id: "evlist" }, rows),
          h("p", { class: "muted small", id: "simclock", text: "Reloj simulado: " + fmtDT(S.sim) }))),
      h("div", { class: "sticky" }, h("a", { class: "btn btn-main", id: "btn-nuevo-plan", href: "#/crear" }, "NUEVO PLAN")),
      foot()]);
  }

  /* ---------- 2. CREAR PLAN ---------- */
  function itemRow(it) {
    var row = h("div", { class: "item", "data-row": "1" });
    function lab(txt, ctl) { return h("label", { class: "fl" }, h("span", { text: txt }), ctl); }
    var tipo = h("select", { "data-f": "tipo", "aria-label": "Tipo" }, h("option", { value: "tomar", text: "Para tomar" }), h("option", { value: "hacer", text: "Para hacer" }));
    tipo.value = it.tipo || "tomar";
    var nombre = h("input", { type: "text", "data-f": "nombre", maxlength: "60", placeholder: "Ej.: Medicamento de ejemplo A", autocomplete: "off" }); nombre.value = it.nombre || "";
    var ins = h("input", { type: "text", "data-f": "instruccion", maxlength: "120", placeholder: "Ej.: 1 unidad de ejemplo con el desayuno", autocomplete: "off" }); ins.value = it.instruccion || "";
    var fr = h("select", { "data-f": "frecuencia", "aria-label": "Frecuencia" }, Object.keys(FREC).map(function (k) { return h("option", { value: k, text: FREC[k] }); }));
    fr.value = it.frecuencia || "diario";
    var desde = h("input", { type: "date", "data-f": "desde" }); desde.value = it.desde || S.sim.slice(0, 10);
    row.appendChild(lab("Tipo", tipo)); row.appendChild(lab("Nombre", nombre)); row.appendChild(lab("Instrucción", ins));
    row.appendChild(h("div", { class: "two" }, lab("Frecuencia", fr), lab("Desde", desde)));
    row.appendChild(h("button", { class: "btn btn-quiet rm", type: "button", onclick: function () { var box = document.getElementById("items"); if (box.children.length > 1) row.remove(); } }, "Quitar"));
    return row;
  }
  function vCrear(pid) {
    var withoutPlan = S.patients.filter(function (p) { return !activePlan(p.id); })[0];
    var sel = h("select", { id: "sel-paciente", "aria-label": "Paciente" }, S.patients.map(function (p) { return h("option", { value: p.id, text: p.nombre + " — " + p.motivo }); }));
    sel.value = (pid && patient(pid)) ? pid : (withoutPlan || S.patients[0]).id;
    var items = h("div", { id: "items" });
    function setItems(list) { items.replaceChildren(); list.forEach(function (it) { items.appendChild(itemRow(it)); }); }
    setItems([{}]);
    var indic = h("textarea", { id: "f-indic", rows: "4", maxlength: "600", placeholder: "Una indicación por línea, frases simples." });
    var ctrlTxt = h("input", { id: "f-control-txt", type: "text", maxlength: "100", placeholder: "Ej.: Examen de ejemplo", autocomplete: "off" });
    var ctrlFecha = h("input", { id: "f-control-fecha", type: "date" });
    var citaFecha = h("input", { id: "f-cita-fecha", type: "date" });
    var citaHora = h("input", { id: "f-cita-hora", type: "time" });
    var err = h("div", { class: "errbox", id: "err", role: "alert" });
    var chips = TPL.map(function (t) {
      return h("button", { class: "chip", type: "button", "data-tpl": t.id, onclick: function () {
        indic.value = t.indic.join("\n"); setItems(t.items); ctrlTxt.value = t.control;
        var hoy = S.sim.slice(0, 10); ctrlFecha.value = addDays(hoy, t.ctrlDias); citaFecha.value = addDays(hoy, t.citaDias); citaHora.value = t.hora; err.replaceChildren();
      } }, t.label);
    });
    function enviar() {
      var errs = [];
      var lines = indic.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 8);
      var tareas = [];
      Array.prototype.forEach.call(items.querySelectorAll("[data-row]"), function (r) {
        var g = function (f) { return r.querySelector('[data-f="' + f + '"]').value; };
        var nombre = g("nombre").trim();
        if (nombre) tareas.push({ tipo: g("tipo") === "hacer" ? "hacer" : "tomar", nombre: nombre.slice(0, 60), instruccion: g("instruccion").trim().slice(0, 120), frecuencia: FREC[g("frecuencia")] ? g("frecuencia") : "diario", desde: g("desde") || S.sim.slice(0, 10) });
      });
      if (!lines.length) errs.push("Escribe al menos una indicación (o toca una plantilla rápida).");
      if (!tareas.length) errs.push("Agrega al menos un medicamento o tarea con nombre.");
      if (!citaFecha.value || !citaHora.value) errs.push("Elige fecha y hora de la próxima cita.");
      else if (parse(citaFecha.value) < parse(S.sim.slice(0, 10))) errs.push("La próxima cita no puede ser antes de hoy (fecha simulada: " + fmtD(S.sim.slice(0, 10)) + ").");
      if (ctrlTxt.value.trim() && !ctrlFecha.value) errs.push("Elige la fecha del examen o control siguiente.");
      if (errs.length) { err.replaceChildren(h("ul", {}, errs.map(function (m) { return h("li", { text: m }); }))); err.scrollIntoView({ block: "center" }); return; }
      var pidSel = sel.value, old = activePlan(pidSel); if (old) old.status = "anterior";
      var id = "pl" + (S.nextId++);
      var t0 = tick(3), segundos = Math.max(1, Math.round((performance.now() - tCrearInicio) / 1000));
      var pl = { id: id, patientId: pidSel, status: "activo", creadoSim: t0, abiertoSim: null,
        indicaciones: lines.map(function (x) { return x.slice(0, 140); }),
        tareas: tareas.map(function (t, i) { t.id = id + "_t" + (i + 1); t.done = false; t.doneSim = null; return t; }),
        control: { texto: ctrlTxt.value.trim().slice(0, 100), fecha: ctrlTxt.value.trim() ? ctrlFecha.value : "" },
        cita: { fecha: citaFecha.value, hora: citaHora.value, confirmada: false, confirmadaSim: null }, segundos: segundos, toques: toquesCrear };
      S.plans.push(pl); logEvent("plan_creado", pl, "Plan creado"); save();
      location.hash = "#/enviado/" + id;
    }
    var wrap = page([appbar({ back: { href: "#/pacientes", text: "Mis pacientes" } }),
      h("main", { class: "main" },
        h("h1", { text: "Crear plan" }),
        h("p", { class: "lead", text: "Frases simples. SANA no interpreta ni sugiere nada clínico: tú decides todo." }),
        h("div", { class: "card" }, h("label", { class: "fl", for: "sel-paciente" }, h("span", { text: "Paciente (ficticio)" }), sel)),
        h("div", { class: "card" }, h("h2", { text: "Plantillas rápidas" }), h("p", { class: "muted small", text: "Ejemplos ficticios que rellenan todo. Puedes editar." }), h("div", { class: "chips" }, chips)),
        h("section", { class: "card" }, h("h2", {}, h("span", { class: "step", text: "A" }), " Indicaciones"), h("label", { class: "sr", for: "f-indic", text: "Indicaciones" }), indic),
        h("section", { class: "card" }, h("h2", {}, h("span", { class: "step", text: "B" }), " Medicamentos o tareas"), items,
          h("button", { class: "btn btn-outline", id: "add-item", type: "button", onclick: function () { items.appendChild(itemRow({})); } }, "+ Añadir otro")),
        h("section", { class: "card" }, h("h2", {}, h("span", { class: "step", text: "C" }), " Examen o control siguiente"),
          h("label", { class: "fl", for: "f-control-txt" }, h("span", { text: "¿Cuál?" }), ctrlTxt), h("label", { class: "fl", for: "f-control-fecha" }, h("span", { text: "¿Para cuándo?" }), ctrlFecha)),
        h("section", { class: "card" }, h("h2", {}, h("span", { class: "step", text: "D" }), " Próxima cita"),
          h("div", { class: "two" }, h("label", { class: "fl", for: "f-cita-fecha" }, h("span", { text: "Fecha" }), citaFecha), h("label", { class: "fl", for: "f-cita-hora" }, h("span", { text: "Hora" }), citaHora))),
        err),
      h("div", { class: "sticky" }, h("button", { class: "btn btn-main", id: "btn-enviar", type: "button", onclick: enviar }, "ENVIAR PLAN")),
      foot()]);
    tCrearInicio = performance.now(); toquesCrear = 0;
    wrap.addEventListener("click", function (e) { if (e.target.closest("button, select, input, textarea, a")) toquesCrear++; }, true);
  }

  /* ---------- 3. PLAN ENVIADO ---------- */
  function vEnviado(id) {
    var pl = plan(id); if (!pl) return notFound();
    var p = patient(pl.patientId), pr = progress(pl);
    var url = location.href.split("#")[0] + "#/mi-plan/" + pl.id;
    page([appbar({ back: { href: "#/pacientes", text: "Mis pacientes" } }),
      h("main", { class: "main" },
        h("div", { class: "okmark", "aria-hidden": "true" }, "✓"),
        h("h1", { text: "Plan enviado correctamente." }),
        h("p", { class: "lead" }, "Para ", h("b", { text: p.nombre }), ". Simulación: no se envió ningún mensaje real."),
        h("div", { class: "card" }, h("h2", { text: "Enlace del paciente (ficticio)" }),
          h("p", { class: "muted small", text: "En el prototipo, este enlace abre la vista de la persona, sin contraseña. No apto para producción." }),
          h("a", { class: "linkbox", id: "link-paciente", href: "#/mi-plan/" + pl.id, text: url }),
          h("a", { class: "btn btn-outline", id: "abrir-enlace", href: "#/mi-plan/" + pl.id }, "Abrir como si fuera el paciente")),
        h("div", { class: "card" }, h("h2", { text: "Estado" }),
          h("p", {}, h("span", { class: "badge " + (pl.abiertoSim ? "b-ok" : "b-wait"), id: "estado-apertura", text: pl.abiertoSim ? "Abierto" : "No abierto" }),
            pl.abiertoSim ? h("span", { class: "muted small", text: "  " + fmtDT(pl.abiertoSim) + " (hora simulada)" }) : null),
          bar(pr.done, pr.total), h("p", { class: "muted", id: "progreso-txt", text: pr.done + " de " + pr.total + " acciones marcadas" }),
          h("p", { class: "muted small", id: "tiempo-creacion", text: "Plan creado en " + pl.segundos + " s y " + pl.toques + " toques (medido en la pantalla de creación)." }))),
      h("div", { class: "sticky" }, h("a", { class: "btn btn-main", id: "btn-volver", href: "#/pacientes" }, "Volver al paciente")),
      foot()]);
  }

  /* ---------- 4. MI PLAN ---------- */
  function blk(key, titulo, ico, children) { return h("section", { class: "card blk blk-" + key, "data-bloque": key }, h("h2", {}, h("span", { class: "bico", "aria-hidden": "true" }, ico), " " + titulo), children); }
  function vMiPlan(id) {
    var pl = plan(id); if (!pl) return notFound();
    if (!pl.abiertoSim) { tick(12); pl.abiertoSim = S.sim; logEvent("plan_abierto", pl, "Plan abierto"); save(); }
    var p = patient(pl.patientId), first = p.nombre.split(" ")[0];
    var hacer = pl.tareas.filter(function (t) { return t.tipo === "hacer"; }), tomar = pl.tareas.filter(function (t) { return t.tipo === "tomar"; });
    function item(t) { return h("li", {}, h("b", { text: t.nombre }), t.instruccion ? h("span", { text: " — " + t.instruccion }) : null, h("span", { class: "muted small block", text: FREC[t.frecuencia] + " · desde " + fmtD(t.desde) })); }
    page([appbar({ persona: true, back: { href: "#/enviado/" + pl.id, text: "Panel del profesional" } }),
      h("main", { class: "main" },
        h("p", { class: "chip-ficticio", text: "Ejemplo ficticio" }),
        h("h1", {}, "Hola, ", h("span", { id: "nombre-paciente", text: first })),
        h("p", { class: "lead", text: "Este es tu plan después de la consulta con " + S.profesional + ". Tómalo con calma, un paso a la vez." }),
        blk("hacer", "QUÉ HACER", "🌿", [h("ul", { class: "plain" }, pl.indicaciones.map(function (x) { return h("li", { text: x }); })), hacer.length ? h("ul", { class: "plain" }, hacer.map(item)) : null]),
        blk("tomar", "QUÉ TOMAR", "💧", tomar.length ? h("ul", { class: "plain" }, tomar.map(item)) : h("p", { class: "muted", text: "En este plan no hay nada para tomar." })),
        blk("sigue", "QUÉ SIGUE", "➡️", pl.control.texto ? h("p", {}, h("b", { text: pl.control.texto }), h("span", { class: "block muted", text: "Para el " + fmtD(pl.control.fecha) })) : h("p", { class: "muted", text: "No hay un examen o control pendiente." })),
        blk("volver", "CUÁNDO VOLVER", "📅", [h("p", {}, h("b", { text: fmtD(pl.cita.fecha) }), " a las " + pl.cita.hora + ". ", pl.cita.confirmada ? h("span", { class: "badge b-ok", text: "Confirmada" }) : null),
          h("p", { class: "urg", text: "Si es una urgencia, no esperes la cita: acude a emergencias." })]),
        h("a", { class: "btn btn-main", id: "ir-progreso", href: "#/progreso/" + pl.id }, "Marcar lo que ya hice")),
      tabs(pl.id, "plan"), foot()], true, true);
  }

  /* ---------- 5. PROGRESO ---------- */
  function vProgreso(id) {
    var pl = plan(id); if (!pl) return notFound();
    var pr = progress(pl);
    var tasks = pl.tareas.map(function (t) {
      return h("div", { class: "card task" + (t.done ? " done" : ""), "data-tid": t.id },
        h("div", {}, h("h2", { class: "tname", text: t.nombre }), h("p", { class: "muted", text: (t.tipo === "tomar" ? "Para tomar" : "Para hacer") + " · " + FREC[t.frecuencia] })),
        t.done ? h("p", { class: "doneinfo", "data-k": "hora", text: "Marcada como realizada: " + fmtDT(t.doneSim) + " (hora simulada)" }) : null,
        h("button", { class: "btn " + (t.done ? "btn-done" : "btn-main"), type: "button", "data-k": "marcar", disabled: t.done, onclick: function () {
          if (t.done) return; t.done = true; t.doneSim = tick(8); logEvent("tarea_marcada", pl, t.nombre); save(); render(); } }, t.done ? "✓ Marcada" : "Marcar como realizada"));
    });
    var cita = pl.cita;
    page([appbar({ persona: true, back: { href: "#/enviado/" + pl.id, text: "Panel del profesional" } }),
      h("main", { class: "main" },
        h("h1", { text: "Mi progreso" }),
        h("div", { class: "card" }, bar(pr.done, pr.total), h("p", { class: "big", id: "prog-total", text: pr.done + " de " + pr.total + " acciones marcadas" })),
        h("div", { class: "notice", id: "aviso-check", role: "note" }, h("b", { text: "Importante: " }), "un check significa solo que marcaste esta acción como realizada. No confirma que hayas tomado algo de verdad ni que cumplas un tratamiento, y no es una evaluación clínica."),
        h("div", { class: "stack" }, tasks),
        h("div", { class: "card cita" }, h("h2", { text: "Próxima cita" }), h("p", {}, h("b", { text: fmtD(cita.fecha) }), " a las " + cita.hora),
          cita.confirmada ? h("p", { class: "doneinfo", id: "cita-estado", text: "Confirmada: " + fmtDT(cita.confirmadaSim) + " (hora simulada)" }) : h("p", { class: "muted", id: "cita-estado", text: "Aún sin confirmar" }),
          h("button", { class: "btn " + (cita.confirmada ? "btn-done" : "btn-outline"), id: "cita-confirmar", type: "button", disabled: cita.confirmada, onclick: function () {
            if (cita.confirmada) return; cita.confirmada = true; cita.confirmadaSim = tick(5); logEvent("cita_confirmada", pl, "Cita confirmada"); save(); render(); } }, cita.confirmada ? "✓ Confirmada" : "Confirmar mi cita"))),
      tabs(pl.id, "progreso"), foot()], true, true);
  }

  /* ---------- 6. MI LÍNEA DE TIEMPO ---------- */
  function vLinea(id) {
    var pl = plan(id); if (!pl) return notFound();
    var p = patient(pl.patientId);
    var planes = S.plans.filter(function (x) { return x.patientId === p.id; }).sort(function (a, b) { return parse(b.creadoSim) - parse(a.creadoSim); });
    var docs = S.docs.filter(function (d) { return d.patientId === p.id; });
    var cur = activePlan(p.id);
    page([appbar({ persona: true, back: { href: "#/enviado/" + pl.id, text: "Panel del profesional" } }),
      h("main", { class: "main" },
        h("h1", { text: "Mi línea de tiempo" }),
        h("p", { class: "lead", text: "Solo lo esencial: tus planes, tu próxima cita y tus documentos de ejemplo. No es una historia clínica." }),
        h("section", { class: "card", id: "tl-proxima" }, h("h2", { text: "Próxima cita" }),
          cur ? h("p", {}, h("b", { text: fmtD(cur.cita.fecha) }), " a las " + cur.cita.hora + " · " + (cur.cita.confirmada ? "Confirmada" : "Sin confirmar")) : h("p", { class: "muted", text: "No hay una cita pendiente." })),
        h("section", { class: "card", id: "tl-planes" }, h("h2", { text: "Planes" }),
          h("ol", { class: "timeline" }, planes.map(function (x) { var r = progress(x); return h("li", { class: "tl-item" }, h("b", { text: x.status === "activo" ? "Plan actual" : "Plan anterior" }), h("span", { class: "block muted", text: fmtDT(x.creadoSim) + " (hora simulada) · " + r.done + " de " + r.total + " acciones marcadas" })); }))),
        h("section", { class: "card", id: "tl-docs" }, h("h2", { text: "Documentos y resultados (ejemplos ficticios)" }),
          docs.length ? h("ul", { class: "plain" }, docs.map(function (d) { return h("li", {}, h("b", { text: d.nombre }), h("span", { class: "block muted small", text: fmtD(d.fecha) + " · sin contenido real" })); })) : h("p", { class: "muted", text: "Sin documentos." }))),
      tabs(pl.id, "linea"), foot()], true, true);
  }

  /* ---------- router por hash ---------- */
  function render() {
    var parts = (location.hash || "#/pacientes").replace(/^#\/?/, "").split("/"), r = parts[0], a = parts[1];
    var safe = /^[A-Za-z0-9_]+$/;
    if (a && !safe.test(a)) a = "";
    switch (r) {
      case "crear": return vCrear(a);
      case "enviado": return vEnviado(a);
      case "mi-plan": return vMiPlan(a);
      case "progreso": return vProgreso(a);
      case "linea": return vLinea(a);
      default: return vPacientes();
    }
  }
  window.addEventListener("hashchange", render);
  render();
})();
