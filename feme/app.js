/* Demo personalizada (lote 4) — SANA Agenda 24/7. Datos de ejemplo, sin backend. Todo texto dinámico con textContent. */
(function () {
  "use strict";
  var C = window.DEMO, KEY = "sana:" + C.slug + ":citas", SEED = "sana:" + C.slug + ":seed";
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DIAS3 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var app = document.getElementById("app");
  Object.keys(C.colores || {}).forEach(function (k) { document.documentElement.style.setProperty("--" + k, C.colores[k]); });
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parse = function (s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var toMin = function (t) { var p = t.split(":").map(Number); return p[0] * 60 + p[1]; };
  var larga = function (s) { var d = parse(s); return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; };
  var byId = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };

  /* ---------- DOM seguro ---------- */
  function h(tag, props) {
    var e = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) {
      var v = p[k]; if (v == null || v === false) return;
      if (k === "class") e.className = v; else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) { var kid = arguments[i]; if (kid == null || kid === false) continue; (Array.isArray(kid) ? kid : [kid]).forEach(function (x) { if (x != null && x !== false) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); }
    return e;
  }
  var NS = "http://www.w3.org/2000/svg";
  var ICONS = {
    edificio: "M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2",
    video: "M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 10l6-3v10l-6-3",
    chev: "M9 6l6 6-6 6", back: "M15 6l-6 6 6 6", check: "M5 12.5l4.5 4.5L19 7.5", user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    heart: "M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z"
  };
  function icon(n, size) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size || 24); s.setAttribute("height", size || 24);
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", ICONS[n]); s.appendChild(p); return s;
  }

  /* ---------- Datos (localStorage, solo ficticios) ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(l) { localStorage.setItem(KEY, JSON.stringify(l)); }
  function horas(d) { return C.horarios[d.getDay()] || []; }
  function libres(fecha) {
    var taken = {}, now = new Date(), esHoy = fecha === iso(now), nowMin = now.getHours() * 60 + now.getMinutes();
    load().forEach(function (c) { if (c.estado !== "cancelada" && c.fecha === fecha) taken[c.hora] = 1; });
    return horas(parse(fecha)).map(function (x) { return { hora: x, libre: !taken[x] && !(esHoy && toMin(x) <= nowMin) }; });
  }
  function proximosDias(n, soloLibres) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 60 && out.length < n; i++, d.setDate(d.getDate() + 1)) {
      var f = iso(d); if (!horas(d).length) continue;
      if (soloLibres && !libres(f).some(function (x) { return x.libre; })) continue;
      out.push(f);
    }
    return out;
  }
  function seed() {
    var hoy = iso(new Date()); if (localStorage.getItem(SEED) === hoy) return;
    var l = load().filter(function (c) { return !c.demo; }), d = proximosDias(4, false);
    [["Paciente Ejemplo A", 0, 0, 0, "10:00", 1, "confirmada"],
     ["Paciente Ejemplo B", 1, 1, 1, "16:00", 1, "pendiente"],
     ["Paciente Ejemplo C", 0, 2, 0, "11:00", 2, "pendiente"],
     ["Paciente Ejemplo D", 1, 0, 1, "17:00", 2, "confirmada"],
     ["Paciente Ejemplo E", 0, 1, 0, "09:00", 3, "pendiente"]].forEach(function (b, i) {
      var f = d[Math.min(b[5], d.length - 1)]; if (!f || horas(parse(f)).indexOf(b[4]) < 0) return;
      l.push({ id: "demo-" + i, demo: true, nombre: b[0], modalidad: C.modalidades[b[1] % C.modalidades.length].id, servicio: C.servicios[b[2] % C.servicios.length].id, motivo: C.motivos[b[3] % C.motivos.length], fecha: f, hora: b[4], estado: b[6] });
    });
    save(l); localStorage.setItem(SEED, hoy);
  }

  /* ---------- Estado del asistente ---------- */
  var HASMOD = C.modalidades.length > 1;
  var SEQ = HASMOD ? ["mod", "srv", "dia", "hora", "datos", "listo"] : ["srv", "dia", "hora", "datos", "listo"];
  var LABEL = { mod: "Modalidad", srv: "Servicio", dia: "Día", hora: "Hora", datos: "Tus datos", listo: "Listo" };
  var stepOf = function (k) { return SEQ.indexOf(k) + 1; };
  function newW() { return { step: 1, mod: HASMOD ? null : C.modalidades[0].id, srv: null, fecha: null, hora: null, cita: null }; }
  var W = newW();
  function show(view, focusSel) {
    app.replaceChildren(view); view.classList.add("enter"); window.scrollTo(0, 0);
    if (focusSel) { var f = view.querySelector(focusSel); if (f) { f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); } }
  }

  /* ---------- Inicio ---------- */
  function vInicio() {
    var v = h("div", {},
      h("header", { class: "hero" }, h("div", { class: "wrap" },
        h("div", { class: "brandrow" }, h("div", { class: "mark", "aria-hidden": "true", text: C.iniciales }), h("span", { class: "eyebrow", text: "Agenda online" })),
        h("h1", { id: "titulo", text: C.nombre }),
        h("p", { class: "lead", text: C.tagline }),
        h("div", { class: "chips" }, h("span", { class: "chip", text: C.chipModalidad }), h("span", { class: "chip", text: "Servicios de ejemplo" })),
        h("div", { class: "cta" },
          h("a", { class: "btn btn-primary", id: "solicitar", href: "#/cita" }, "Solicitar una cita"),
          h("a", { class: "btn btn-line", id: "ver-admin", href: "#/admin" }, "Ver como administración")))),
      h("main", { class: "wrap" },
        h("section", { class: "sec" }, h("h2", { text: "Así de simple" }), h("div", { class: "how" },
          [["Elige lo que necesitas", HASMOD ? "Servicio y modalidad de ejemplo." : "Servicio de ejemplo."], ["Escoge el día y la hora", "Ves los horarios de ejemplo al instante."], ["Deja tu solicitud", "Te confirman el horario por WhatsApp."]].map(function (s, i) {
            return h("div", { class: "card" }, h("div", { class: "num", text: String(i + 1) }), h("div", { class: "item" }, h("b", { text: s[0] }), h("span", { text: s[1] })));
          }))),
        h("section", { class: "sec" }, h("h2", { text: C.tituloServicios || "Servicios de ejemplo" }), h("div", { class: "list" },
          C.servicios.map(function (s) { return h("div", { class: "card item" }, h("b", { text: s.nombre }), h("span", { text: s.desc })); }))),
        h("section", { class: "sec" }, h("div", { class: "card safe item" }, h("b", { text: "Si es una urgencia" }), h("span", { text: "No esperes esta solicitud: acude al servicio de emergencias o al centro de salud más cercano." }))),
        h("p", { class: "small", style: "margin-top:14px", text: "No escribas síntomas ni datos de salud aquí. Los horarios y servicios de esta demo son de ejemplo." })));
    show(v);
  }

  /* ---------- Asistente de solicitud ---------- */
  function opt(ic, titulo, desc, onclick, extra) {
    return h("button", Object.assign({ class: "opt", type: "button", onclick: onclick }, extra || {}),
      ic ? h("span", { class: "ic" }, icon(ic)) : null, h("span", {}, h("b", { text: titulo }), desc ? h("small", { text: desc }) : null), h("span", { class: "chev" }, icon("chev", 20)));
  }
  function frame(n, title, sub, body) {
    var N = SEQ.length, bar = h("div", { class: "progress", role: "progressbar", "aria-valuemin": 1, "aria-valuemax": N, "aria-valuenow": n, "aria-label": "Paso " + n + " de " + N });
    SEQ.forEach(function (_, i) { bar.appendChild(h("i", { class: i < n ? "on" : "" })); });
    var back = n === 1 ? h("a", { class: "back", href: "#/", id: "atras" }, icon("back", 20), "Inicio") : n < N ? h("button", { class: "back", id: "atras", type: "button", onclick: function () { W.step = n - 1; wizard(); } }, icon("back", 20), "Atrás") : null;
    return h("div", { class: "wrap" }, h("div", { class: "top" }, back, bar, h("div", { class: "steplabel", text: "Paso " + n + " de " + N + " · " + LABEL[SEQ[n - 1]] })),
      h("section", { class: "step" }, h("h2", { id: "paso-titulo", text: title }), sub ? h("p", { class: "sub", text: sub }) : null, body));
  }
  function wizard() {
    var n = W.step, k = SEQ[n - 1], body, v, nx = function () { W.step = n + 1; wizard(); };
    if (k === "mod") {
      body = h("div", { class: "opts", id: "opts-mod" }, C.modalidades.map(function (m) { return opt(m.icono, m.nombre, m.desc, function () { W.mod = m.id; nx(); }, { "data-id": m.id }); }));
      v = frame(n, "¿Cómo prefieres tu cita?", "Elige la modalidad que te resulte más cómoda (ejemplo).", body);
    } else if (k === "srv") {
      body = h("div", { class: "opts", id: "opts-srv" }, C.servicios.map(function (s) { return opt(null, s.nombre, s.desc, function () { W.srv = s.id; nx(); }, { "data-id": s.id }); }));
      v = frame(n, "¿Qué servicio necesitas?", "Servicios de ejemplo.", body);
    } else if (k === "dia") {
      body = h("div", { class: "days", id: "days" }, proximosDias(9, true).map(function (f) {
        var d = parse(f);
        return h("button", { class: "day", type: "button", "data-iso": f, "aria-label": larga(f), onclick: function () { W.fecha = f; W.hora = null; nx(); } }, h("small", { text: DIAS3[d.getDay()] }), h("strong", { text: String(d.getDate()) }), h("em", { text: MESES[d.getMonth()].slice(0, 3) }));
      }));
      v = frame(n, "Elige un día", "Horarios de ejemplo, a partir de hoy.", body);
    } else if (k === "hora") {
      body = h("div", { class: "slots", id: "slots" }, libres(W.fecha).map(function (s) {
        return h("button", { class: "slot", type: "button", "data-hora": s.hora, disabled: !s.libre, "aria-label": s.hora + (s.libre ? "" : " (ocupado)"), onclick: function () { W.hora = s.hora; nx(); } }, s.hora);
      }));
      v = frame(n, "Elige una hora", larga(W.fecha) + " · horarios de ejemplo", body);
    } else if (k === "datos") { v = vDatos(); }
    else { v = vListo(); }
    show(v, "#paso-titulo");
  }
  function resumen(m, s, f, hr) {
    return h("div", { class: "sum" }, [["Modalidad", m], ["Servicio", s], ["Día", f], ["Hora", hr]].map(function (r) { return h("div", {}, h("span", { text: r[0] }), h("span", { text: r[1] })); }));
  }
  function normPhone(t) { var d = String(t).replace(/\D/g, ""); if (d.length === 11 && d.indexOf("51") === 0) d = d.slice(2); return /^9\d{8}$/.test(d) ? d : null; }
  function vDatos() {
    var M = byId(C.modalidades, W.mod), S = byId(C.servicios, W.srv);
    var en = h("div", { class: "err", id: "en" }), et = h("div", { class: "err", id: "et" }), ec = h("div", { class: "err", id: "ec" });
    var form = h("form", { id: "f", novalidate: true, onsubmit: function (e) {
      e.preventDefault();
      var nombre = form.n.value.trim(), tel = normPhone(form.t.value);
      en.textContent = nombre.length < 3 ? "Escribe tu nombre." : ""; et.textContent = tel ? "" : "Ingresa un celular de 9 dígitos (empieza con 9).";
      ec.textContent = form.c.checked ? "" : "Necesitamos tu consentimiento para coordinar la cita.";
      if (nombre.length < 3 || !tel || !form.c.checked) return;
      if (!libres(W.fecha).some(function (x) { return x.hora === W.hora && x.libre; })) { W.step = stepOf("hora"); W.hora = null; wizard(); return; }
      var c = { id: "c" + Date.now(), nombre: nombre, telefono: tel, modalidad: W.mod, servicio: W.srv, motivo: form.m.value, fecha: W.fecha, hora: W.hora, estado: "pendiente" };
      var l = load(); l.push(c); save(l); W.cita = c; W.step = SEQ.length; wizard();
    } },
      h("label", { for: "n", text: C.labelNombre || "Nombre completo" }), h("input", { id: "n", name: "n", type: "text", autocomplete: "name", maxlength: 60, placeholder: "Ej. María Pérez" }), en,
      h("label", { for: "t", text: "Celular (WhatsApp)" }), h("input", { id: "t", name: "t", type: "tel", inputmode: "tel", autocomplete: "tel", maxlength: 16, placeholder: "9XX XXX XXX" }), et,
      h("label", { for: "m", text: "Motivo general" }), h("select", { id: "m", name: "m" }, C.motivos.map(function (m) { return h("option", { text: m }); })),
      h("label", { class: "consent", for: "c" }, h("input", { id: "c", name: "c", type: "checkbox" }), h("span", { text: "Acepto que se use mi nombre y celular solo para coordinar esta cita." })), ec,
      h("div", { class: "note priv", id: "priv", text: "No escribas síntomas ni datos de salud aquí. Eso lo conversas directamente en la atención." }),
      h("div", { class: "note urg", id: "urg", text: "Si es una urgencia, no esperes esta solicitud: acude a emergencias." }),
      h("div", { class: "actions" }, h("button", { class: "btn btn-solid full", type: "submit", id: "enviar" }, "Enviar solicitud")));
    return frame(stepOf("datos"), "Tus datos", null, h("div", {}, resumen(M.nombre, S.nombre, larga(W.fecha), W.hora), form));
  }
  function waLink(c) {
    var M = byId(C.modalidades, c.modalidad), S = byId(C.servicios, c.servicio);
    var t = "Hola, soy " + c.nombre + ". Quisiera solicitar una cita (" + M.nombre.toLowerCase() + ", " + S.nombre.toLowerCase() + ") para el " + larga(c.fecha) + " a las " + c.hora + ". Mi celular: " + c.telefono + ". ¿Me confirman, por favor? Gracias.";
    return "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(t);
  }
  function vListo() {
    var c = W.cita, M = byId(C.modalidades, c.modalidad), S = byId(C.servicios, c.servicio);
    var body = h("div", { class: "ok" }, h("div", { class: "ring" }, icon("check", 42)),
      h("p", { class: "sub", text: "Tu solicitud (de ejemplo) llegará al equipo, que te confirmará el horario por WhatsApp." }),
      h("div", { style: "text-align:left" }, resumen(M.nombre, S.nombre, larga(c.fecha), c.hora), h("div", { class: "sum", style: "margin-top:-6px" }, h("div", {}, h("span", { text: "A nombre de" }), h("span", { id: "ok-nombre", text: c.nombre })))),
      h("div", { class: "actions" },
        h("a", { class: "btn btn-solid full", id: "ver-admin-2", href: "#/admin" }, "Ver como administración"),
        h("a", { class: "btn btn-outline full", id: "wa", target: "_blank", rel: "noopener", href: waLink(c) }, "Abrir WhatsApp con mi solicitud"),
        h("button", { class: "btn btn-ghost full", id: "otra", type: "button", onclick: function () { W = newW(); wizard(); } }, "Hacer otra solicitud")),
      h("p", { class: "small", style: "margin-top:14px", text: "Demo: no hay número de WhatsApp configurado, por eso WhatsApp te pedirá elegir un contacto." }));
    return frame(SEQ.length, "Solicitud lista", null, body);
  }

  /* ---------- Administración ---------- */
  var admDia = null;
  function vAdmin() {
    var hoy = iso(new Date());
    var l = load().filter(function (c) { return c.estado !== "cancelada" && c.fecha >= hoy; }).sort(function (a, b) { return (a.fecha + a.hora).localeCompare(b.fecha + b.hora); });
    var dias = []; l.forEach(function (c) { if (dias.indexOf(c.fecha) < 0) dias.push(c.fecha); });
    if (!admDia || dias.indexOf(admDia) < 0) admDia = dias[0] || null;
    var pend = l.filter(function (c) { return c.estado === "pendiente"; }).length;
    function badges(c) { var M = byId(C.modalidades, c.modalidad); return h("div", { class: "meta" }, h("span", { class: "pill", "data-modalidad": c.modalidad, text: M ? M.nombre : "" }), !c.demo ? h("span", { class: "pill new", text: "Nueva" }) : null); }
    var reqs = l.length ? l.map(function (c) {
      var S = byId(C.servicios, c.servicio), conf = c.estado === "confirmada";
      var st = h("button", { class: "state " + (conf ? "c" : "p"), type: "button", "data-estado": c.estado, "aria-label": "Estado de " + c.nombre + ": " + (conf ? "Confirmada" : "Pendiente") + ". Tocar para cambiar.", onclick: function () {
        var all = load(); all.forEach(function (x) { if (x.id === c.id) x.estado = conf ? "pendiente" : "confirmada"; }); save(all); vAdmin();
      } }, conf ? icon("check", 18) : null, conf ? "Confirmada" : "Pendiente");
      return h("article", { class: "card req", "data-id": c.id }, h("div", { class: "when", text: larga(c.fecha) + " · " + c.hora }), h("div", { class: "who", text: c.nombre }), badges(c), h("div", { class: "srv", text: (S ? S.nombre : "") + " · " + c.motivo }), st);
    }) : [h("div", { class: "card empty", text: "Aún no hay solicitudes. Haz una como paciente y aparecerá aquí." })];
    var agDia = l.filter(function (c) { return c.fecha === admDia; });
    var v = h("div", { class: "wrap wide adm" },
      h("a", { class: "back", href: "#/", id: "ver-paciente" }, icon("back", 20), "Ver como paciente"),
      h("span", { class: "pill", style: "display:block;width:max-content;margin:6px 0", text: "Vista de administración · demo" }),
      h("h1", { id: "adm-titulo", text: "Solicitudes de citas" }),
      h("div", { class: "tiles" }, h("div", { class: "card tile" }, h("b", { id: "n-pend", text: String(pend) }), h("span", { text: "Pendientes" })), h("div", { class: "card tile" }, h("b", { id: "n-conf", text: String(l.length - pend) }), h("span", { text: "Confirmadas" }))),
      h("div", { class: "cols" },
        h("section", { "aria-labelledby": "t-sol" }, h("h2", { id: "t-sol", class: "sec-h", style: "margin:18px 0 10px;font-size:1.15rem;color:var(--dark)", text: "Próximas solicitudes (por día y hora)" }), h("div", { id: "solicitudes" }, reqs)),
        h("section", { "aria-labelledby": "t-ag" }, h("h2", { id: "t-ag", style: "margin:18px 0 10px;font-size:1.15rem;color:var(--dark)", text: "Agenda del día" }),
          h("div", { class: "chipsrow", id: "dchips" }, dias.map(function (f) { return h("button", { class: "dchip", type: "button", "aria-pressed": f === admDia ? "true" : "false", "data-iso": f, onclick: function () { admDia = f; vAdmin(); } }, larga(f).replace(/ de /, " ")); })),
          h("div", { class: "card", id: "agenda" }, agDia.length ? agDia.map(function (c) {
            var S = byId(C.servicios, c.servicio), M = byId(C.modalidades, c.modalidad);
            return h("div", { class: "ag", "data-id": c.id }, h("span", { class: "h", text: c.hora }), h("div", {}, h("b", { text: c.nombre }), h("span", { class: "s", text: (M ? M.nombre : "") + " · " + (S ? S.nombre : "") }), h("div", { class: "meta", style: "margin-top:4px" }, h("span", { class: "pill", text: c.estado === "confirmada" ? "Confirmada" : "Pendiente" }))));
          }) : h("p", { class: "empty", text: "Sin citas para este día." })))));
    show(v);
  }

  /* ---------- Rutas ---------- */
  function route() {
    var r = location.hash;
    if (r === "#/cita") { W = newW(); wizard(); }
    else if (r === "#/admin") vAdmin();
    else vInicio();
  }
  document.getElementById("reset").addEventListener("click", function () { localStorage.removeItem(KEY); localStorage.removeItem(SEED); admDia = null; location.hash = "#/"; location.reload(); });
  window.addEventListener("hashchange", route);
  seed(); route();
})();
