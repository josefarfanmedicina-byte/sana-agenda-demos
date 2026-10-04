/* SANA Agenda 24/7 — demo neutra: vista del profesional (#/profesional). Datos 100% FICTICIOS, sin backend.
   Lee las solicitudes que el paciente de ejemplo deja en el localStorage de ESTE navegador. Todo texto con textContent. */
(function () {
  "use strict";
  var S = window.SANA, C = S.C, SEEDKEY = "sana:" + C.slug + ":seed";
  var q = function (id) { return document.getElementById(id); };
  function h(tag, props) {
    var e = document.createElement(tag), p = props || {};
    Object.keys(p).forEach(function (k) { var v = p[k]; if (v == null || v === false) return; if (k === "class") e.className = v; else if (k === "text") e.textContent = v; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); });
    for (var i = 2; i < arguments.length; i++) { var kid = arguments[i]; if (kid == null || kid === false) continue; (Array.isArray(kid) ? kid : [kid]).forEach(function (x) { e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); }
    return e;
  }

  /* ---- Citas ficticias de ejemplo (para que la agenda no esté vacía y algunos horarios aparezcan ocupados) ---- */
  function openDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 30 && out.length < n; i++) { if (S.scheduleFor(d)) out.push(S.iso(d)); d.setDate(d.getDate() + 1); }
    return out;
  }
  function seed() {
    var today = S.iso(new Date());
    if (localStorage.getItem(SEEDKEY) === today) return;
    var list = S.load().filter(function (c) { return !c.demo; });
    var days = openDays(4);
    [["Paciente Ejemplo A", "Consulta general (ejemplo)", "Primera consulta", "10:30", 1, "confirmada"],
     ["Paciente Ejemplo B", "Control (ejemplo)", "Control / seguimiento", "15:30", 1, "pendiente"],
     ["Paciente Ejemplo C", "Consulta general (ejemplo)", "Primera consulta", "09:30", 2, "confirmada"],
     ["Paciente Ejemplo D", "Control (ejemplo)", "Control / seguimiento", "16:00", 3, "pendiente"]].forEach(function (b, i) {
      var f = days[Math.min(b[4], days.length - 1)]; if (!f) return;
      list.push({ id: "demo-" + i, demo: true, nombre: b[0], servicio: b[1], motivo: b[2], fecha: f, hora: b[3], estado: b[5] });
    });
    S.save(list); localStorage.setItem(SEEDKEY, today);
  }
  seed();

  /* ---- Estilos mínimos de la vista profesional (los botones reutilizan las clases de la plantilla) ---- */
  var st = document.createElement("style");
  st.textContent = "#proView{max-width:720px;margin:0 auto;padding:18px 18px 40px}#proView h1{font-size:1.5rem;color:var(--dark);margin:6px 0 4px}#proView h2{font-size:1.1rem;color:var(--dark);margin:22px 0 8px}#proView h3{font-size:.95rem;color:var(--muted);margin:14px 0 6px;text-transform:capitalize}" +
    ".pro-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:10px}.pro-card b{display:block}.pro-card .m{color:var(--muted);font-size:.9rem}" +
    ".pro-badge{display:inline-block;font-size:.76rem;font-weight:700;padding:3px 10px;border-radius:999px;background:#FFF4D6;color:#6B4E00;margin-top:6px}.pro-badge.ok{background:#DDF1E8;color:#14513F}.pro-badge.new{background:var(--accent);color:var(--dark)}" +
    ".pro-row{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}.pro-row:last-child{border-bottom:0}.pro-hora{flex:none;font-weight:800;color:var(--dark);min-width:52px}" +
    ".pro-actions{display:grid;gap:10px;margin-top:18px}.pro-actions .btn{width:100%}.pro-link-row{margin-top:10px}";
  document.head.appendChild(st);

  /* ---- Vista profesional ---- */
  var view = h("div", { id: "proView", class: "hidden", "aria-live": "polite" });
  document.body.insertBefore(view, document.body.querySelector("script"));
  var HIDE = ["header.hero", "main", "footer", "#fab"];
  function badge(c) { return !c.demo ? h("span", { class: "pro-badge new", text: "Nueva solicitud" }) : h("span", { class: "pro-badge" + (c.estado === "confirmada" ? " ok" : ""), text: c.estado === "confirmada" ? "Confirmada" : "Por confirmar" }); }
  function reset() { localStorage.removeItem(S.KEY); localStorage.removeItem(SEEDKEY); location.hash = ""; location.reload(); }
  function drawPro() {
    var today = S.iso(new Date());
    var list = S.load().filter(function (c) { return c.estado !== "cancelada" && c.fecha >= today; }).sort(function (a, b) { return (a.fecha + a.hora).localeCompare(b.fecha + b.hora); });
    var nuevas = list.filter(function (c) { return !c.demo; }), byDay = {};
    list.forEach(function (c) { (byDay[c.fecha] = byDay[c.fecha] || []).push(c); });
    view.replaceChildren(
      h("p", { class: "pro-badge", text: "Muestra con datos ficticios" }),
      h("h1", { id: "pro-titulo", text: "Vista del profesional" }),
      h("p", { class: "sub", text: "Así recibe " + C.profesional.nombre + " cada solicitud y ve su agenda. Todo es de ejemplo." }),
      h("h2", { id: "pro-nuevas-t", text: "Solicitudes nuevas (" + nuevas.length + ")" }),
      h("div", { id: "pro-nuevas" }, nuevas.length ? nuevas.map(function (c) {
        return h("div", { class: "pro-card", "data-nueva": "1" }, h("b", { text: c.nombre }), h("span", { class: "m", text: c.servicio + " · " + c.motivo }), h("span", { class: "m", style: "display:block", text: S.fechaLarga(c.fecha) + " · " + c.hora }), badge(c));
      }) : h("div", { class: "pro-card" }, h("span", { class: "m", text: "Aún no hay solicitudes nuevas. Haz una como paciente y aparecerá aquí." }))),
      h("h2", { text: "Agenda" }),
      h("div", { id: "pro-agenda", class: "pro-card" }, Object.keys(byDay).sort().map(function (d) {
        return h("div", {}, h("h3", { text: (d === today ? "Hoy · " : "") + S.fechaLarga(d) }), byDay[d].map(function (c) {
          return h("div", { class: "pro-row", "data-cita": c.id }, h("span", { class: "pro-hora", text: c.hora }), h("div", {}, h("b", { text: c.nombre }), h("span", { class: "m", text: c.servicio }), badge(c)));
        }));
      })),
      h("div", { class: "pro-actions" },
        h("a", { class: "btn btn-solid", id: "ver-paciente", href: "#/" }, "Ver como paciente"),
        h("button", { class: "btn btn-outline", id: "reset-pro", type: "button", onclick: reset }, "Reiniciar demo")));
  }
  function route() {
    var pro = location.hash === "#/profesional";
    HIDE.forEach(function (s) { var e = document.querySelector(s); if (e) e.classList.toggle("hidden", pro); });
    view.classList.toggle("hidden", !pro);
    if (pro) drawPro();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ---- Enlaces entre ambas vistas ---- */
  var cta = document.querySelector(".cta-row");
  if (cta) cta.appendChild(h("a", { class: "btn btn-ghost", id: "ver-profesional", href: "#/profesional" }, "Ver como profesional"));
  var foot = document.querySelector("footer");
  if (foot) foot.appendChild(h("p", { class: "pro-link-row" }, h("button", { class: "btn btn-outline", id: "reset", type: "button", onclick: reset, style: "width:auto;display:inline-flex" }, "Reiniciar demo")));
  var booking = q("booking");
  if (booking && window.MutationObserver) {
    new MutationObserver(function () {
      if (booking.querySelector(".ok-ring") && !booking.querySelector(".pro-go")) booking.appendChild(h("a", { class: "btn btn-solid pro-go", id: "ver-profesional-2", href: "#/profesional", style: "width:100%;margin-top:10px" }, "Ver como profesional"));
    }).observe(booking, { childList: true, subtree: true });
  }
  route();
})();
