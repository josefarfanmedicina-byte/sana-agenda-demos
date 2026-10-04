(function () {
  const S = window.SANA, C = S.C, P = C.profesional, esc = S.esc;
  S.theme(); S.seed();
  const SOL = C.modo === "solicitud"; // v1 real: la reserva es una SOLICITUD que se envía por WhatsApp (sin backend)
  const T = SOL ? {
    sub: "Solicita tu cita a cualquier hora. El consultorio te confirmará el horario por WhatsApp.",
    chip: "Solicitud de cita online",
    legend: "Horarios referenciales: el consultorio confirma la disponibilidad. Hora de Perú (UTC-5).",
    submit: "Preparar solicitud",
    okTitle: "¡Solicitud lista!",
    okSub: "Último paso: envíala por WhatsApp. El consultorio te confirmará tu horario.",
    when: "Horario solicitado",
    btn: "Enviar solicitud por WhatsApp",
    again: "Hacer otra solicitud"
  } : {
    sub: "Disponible las 24 horas. Recibirás la confirmación por WhatsApp.",
    chip: "Reserva 24/7",
    legend: "Horarios tachados = ocupados. Hora de Perú (UTC-5).",
    submit: "Confirmar cita",
    okTitle: "¡Cita registrada!",
    okSub: "Un último paso: envía la confirmación por WhatsApp.",
    when: "Día",
    btn: "Confirmar por WhatsApp",
    again: "Reservar otra"
  };
  const dur = s => (s.duracion_min ? " · " + s.duracion_min + " min" : "");

  // ---------- Perfil ----------
  const q = id => document.getElementById(id);
  q("brandName").textContent = P.nombre;
  q("brandIni").textContent = P.iniciales || P.nombre.replace(/^(Dr\.?|Dra\.?)\s+/i, "").slice(0, 2).toUpperCase();
  q("pNombre").textContent = P.nombre;
  q("pEsp").textContent = P.especialidad;
  q("pTag").textContent = P.tagline || "";
  q("pBio").textContent = P.bio;
  q("footAddr").textContent = P.ubicacion ? "📍 " + P.ubicacion : "";
  if (C.panel === false) q("panelLink").remove();
  if (C.sitio && C.sitio.pie) q("footBrand").innerHTML = esc(C.sitio.pie).replace(/&lt;(\/?)b&gt;/g, "<$1b>"); // el pie admite solo <b>…</b>; todo lo demás sigue escapado
  q("bookSub").textContent = T.sub;
  if (SOL) { document.querySelector(".hero .btn-primary").textContent = "Solicitar cita"; document.querySelector("#reservar h2").textContent = "Solicita tu cita"; }
  q("avatar").innerHTML = P.foto ? '<img alt="' + esc(P.nombre) + '" src="' + esc(P.foto) + '">' : esc(P.iniciales || "");
  q("chips").innerHTML = [P.modalidad, P.ubicacion, T.chip].filter(Boolean).map(t => '<span class="chip">' + esc(t) + "</span>").join("");
  if (C.demo) { q("demoBar").classList.remove("hidden"); if (C.sitio && C.sitio.aviso_demo) q("demoBar").textContent = C.sitio.aviso_demo; }
  const waGeneric = S.waLink(C.whatsapp, "Hola " + P.nombre + ", quisiera hacer una consulta sobre una cita.");
  ["heroWa", "fab"].forEach(id => q(id).href = waGeneric);

  // ---------- Servicios ----------
  const state = { step: 1, servicio: null, fecha: null, hora: null, cita: null };
  function renderServices() {
    q("servicesList").innerHTML = C.servicios.map((s, i) =>
      '<button class="svc' + (state.servicio === i ? " sel" : "") + '" data-i="' + i + '"><span class="ico">' + esc(s.nombre[0]) + '</span><span><b>' + esc(s.nombre) + "</b><small>" + esc(s.descripcion || "") + dur(s) + "</small></span>" +
      (s.precio ? '<span class="price">' + esc(s.precio) + "</span>" : "") + "</button>").join("");
    q("servicesList").querySelectorAll(".svc").forEach(b => b.onclick = () => {
      state.servicio = +b.dataset.i; state.fecha = state.hora = null; state.step = 2; renderServices(); render();
      q("reservar").scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---------- Reserva ----------
  const bar = n => '<div class="steps">' + [1, 2, 3, 4].map(i => '<span class="' + (i <= n ? "on" : "") + '"></span>').join("") + "</div>";
  function dayList() {
    const out = [], t = new Date(); t.setHours(0, 0, 0, 0);
    for (let i = 0; i <= C.agenda.dias_adelante; i++) {
      const d = new Date(t); d.setDate(t.getDate() + i);
      const iso = S.iso(d), sl = S.slotsFor(iso), libres = sl.filter(s => s.libre).length;
      if (S.scheduleFor(d)) out.push({ d, iso, libres });
    }
    return out;
  }

  function render() {
    const b = q("booking");
    if (state.step === 1) {
      b.innerHTML = bar(1) + '<div class="step-title">1. Elige un servicio</div><div class="services" id="svc2"></div>';
      b.querySelector("#svc2").innerHTML = C.servicios.map((s, i) => '<button class="svc" data-i="' + i + '"><span class="ico">' + esc(s.nombre[0]) + "</span><span><b>" + esc(s.nombre) + "</b><small>" + esc(s.descripcion || "") + dur(s) + "</small></span>" + (s.precio ? '<span class="price">' + esc(s.precio) + "</span>" : "") + "</button>").join("");
      b.querySelectorAll(".svc").forEach(x => x.onclick = () => { state.servicio = +x.dataset.i; state.step = 2; renderServices(); render(); });
    } else if (state.step === 2) {
      const days = dayList();
      b.innerHTML = bar(2) + '<div class="step-title">2. Elige día y hora <small>' + esc(C.servicios[state.servicio].nombre) + '</small></div>' +
        '<div class="days" id="days"></div><div id="slots"></div><p class="legend">' + esc(T.legend) + (C.nota_horario ? '<br><b>' + esc(C.nota_horario) + '</b>' : "") + '</p>' +
        '<div class="nav-row"><button class="btn btn-outline" id="back">Atrás</button><button class="btn btn-solid" id="next" disabled>Continuar</button></div>';
      const dEl = b.querySelector("#days");
      dEl.innerHTML = days.map(x => '<button class="day' + (state.fecha === x.iso ? " sel" : "") + '" data-iso="' + x.iso + '"' + (x.libres ? "" : " disabled") + "><small>" + S.DIAS3[x.d.getDay()] + "</small><b>" + x.d.getDate() + "</b><em>" + S.MESES[x.d.getMonth()].slice(0, 3) + "</em></button>").join("");
      dEl.querySelectorAll(".day").forEach(x => x.onclick = () => { state.fecha = x.dataset.iso; state.hora = null; render(); });
      const sEl = b.querySelector("#slots");
      if (!state.fecha) sEl.innerHTML = '<div class="empty">Selecciona un día para ver los horarios.</div>';
      else {
        const sl = S.slotsFor(state.fecha);
        sEl.innerHTML = '<div class="step-title" style="margin-top:6px">' + esc(S.fechaLarga(state.fecha)) + '</div><div class="slots">' +
          sl.map(s => '<button class="slot' + (state.hora === s.hora ? " sel" : "") + '" data-h="' + s.hora + '"' + (s.libre ? "" : " disabled") + ">" + s.hora + "</button>").join("") + "</div>";
        sEl.querySelectorAll(".slot").forEach(x => x.onclick = () => { state.hora = x.dataset.h; render(); });
        const sel = dEl.querySelector(".sel"); if (sel) sel.scrollIntoView({ inline: "center", block: "nearest" });
      }
      b.querySelector("#next").disabled = !(state.fecha && state.hora);
      b.querySelector("#next").onclick = () => { state.step = 3; render(); };
      b.querySelector("#back").onclick = () => { state.step = 1; render(); };
    } else if (state.step === 3) {
      const s = C.servicios[state.servicio];
      b.innerHTML = bar(3) + '<div class="step-title">3. Tus datos</div>' +
        '<div class="summary"><div><span>Servicio</span><span>' + esc(s.nombre) + "</span></div><div><span>Día</span><span>" + esc(S.fechaLarga(state.fecha)) + "</span></div><div><span>Hora</span><span>" + state.hora + "</span></div></div>" +
        '<form id="f" novalidate><label for="n">Nombre completo</label><input id="n" autocomplete="name" placeholder="Ej. María Pérez" maxlength="60"><div class="err" id="en"></div>' +
        '<label for="t">Celular (WhatsApp)</label><input id="t" inputmode="tel" autocomplete="tel" placeholder="9XX XXX XXX" maxlength="16"><div class="err" id="et"></div>' +
        '<label for="m">Motivo general</label><select id="m">' + C.motivos.map(m => "<option>" + esc(m) + "</option>").join("") + "</select>" +
        '<div class="privacy">🔒 No escribas información clínica ni diagnósticos. Solo usamos tu nombre y celular para coordinar tu cita.' + (C.privacidad_reforzada ? ' No necesitas contar por qué consultas: eso lo conversas directamente en la atención.' : "") + '</div>' +
        '<div class="nav-row"><button type="button" class="btn btn-outline" id="back">Atrás</button><button class="btn btn-solid" type="submit">' + esc(T.submit) + '</button></div></form>';
      b.querySelector("#back").onclick = () => { state.step = 2; render(); };
      b.querySelector("#f").onsubmit = e => {
        e.preventDefault();
        const n = q("n").value.trim(), t = S.normPhone(q("t").value);
        q("en").textContent = n.length < 3 ? "Escribe tu nombre." : "";
        q("et").textContent = t ? "" : "Ingresa un celular peruano de 9 dígitos (empieza con 9).";
        if (n.length < 3 || !t) return;
        // revalidar disponibilidad
        if (!S.slotsFor(state.fecha).find(x => x.hora === state.hora && x.libre)) { alert("Ese horario acaba de ocuparse. Elige otro."); state.step = 2; state.hora = null; render(); return; }
        const cita = { id: "c" + Date.now(), nombre: n, telefono: t, servicio: s.nombre, motivo: q("m").value, fecha: state.fecha, hora: state.hora, estado: "pendiente", creada: new Date().toISOString(), origen: "web", prueba: !!C.demo };
        if (!SOL) { const list = S.load(); list.push(cita); S.save(list); } // en modo solicitud no se guarda nada
        state.cita = cita; state.step = 4; render();
      };
    } else {
      const c = state.cita;
      const txt = S.tpl(C.mensajes.confirmacion, { profesional: P.nombre, nombre: c.nombre, servicio: c.servicio, fecha: S.fechaLarga(c.fecha), hora: c.hora, telefono: c.telefono.replace(/^51/, "") });
      b.innerHTML = bar(4) + '<div class="center"><div class="ok-ring">✓</div><h2>' + esc(T.okTitle) + '</h2><p class="sub">' + esc(T.okSub) + '</p></div>' +
        '<div class="summary"><div><span>Nombre</span><span>' + esc(c.nombre) + "</span></div><div><span>Servicio</span><span>" + esc(c.servicio) + "</span></div><div><span>" + esc(T.when) + "</span><span>" + esc(S.fechaLarga(c.fecha)) + " · " + c.hora + "</span></div></div>" +
        '<a class="btn btn-wa" style="width:100%" target="_blank" rel="noopener" href="' + S.waLink(C.whatsapp, txt) + '">' + esc(T.btn) + "</a>" +
        (C.demo ? '<div class="demo-note">' + esc((C.sitio && C.sitio.nota_demo) || "DEMO: aquí el botón abre tu chat de WhatsApp con el mensaje ya escrito. En esta demo no hay número configurado, así que WhatsApp te pedirá elegir un contacto. Cita guardada solo en este navegador.") + "</div>" : "") +
        '<div class="nav-row"><button class="btn btn-outline" id="again">' + esc(T.again) + "</button>" + (C.panel === false ? "" : '<a class="btn btn-outline" href="panel.html">Ver panel</a>') + "</div>";
      b.querySelector("#again").onclick = () => { state.step = 1; state.fecha = state.hora = null; state.servicio = null; renderServices(); render(); };
    }
  }
  // ---------- Secciones opcionales (plan Completa): se muestran solo si el config las trae ----------
  const show = id => q(id).classList.remove("hidden");
  if (C.ubicacion_mapa && P.ubicacion) {
    q("ubicBox").innerHTML = "<p><b>" + esc(P.ubicacion) + "</b></p>" + (P.modalidad ? '<p class="note">' + esc(P.modalidad) + "</p>" : "") +
      '<p style="margin-top:12px"><a class="btn btn-outline" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(P.ubicacion) + '">Ver en Google Maps</a></p>';
    show("ubicacion");
  }
  if (Array.isArray(C.galeria) && C.galeria.length) {
    q("galBox").innerHTML = C.galeria.map(g => '<img loading="lazy" alt="' + esc(g.alt || "") + '" src="' + esc(g.src) + '">').join(""); show("galeria");
  }
  if (Array.isArray(C.faq) && C.faq.length) {
    q("faqBox").innerHTML = C.faq.map(f => '<details class="faq"><summary>' + esc(f.p) + "</summary><p>" + esc(f.r) + "</p></details>").join(""); show("faq");
  }
  if (Array.isArray(C.redes) && C.redes.length) {
    q("redBox").innerHTML = C.redes.map(r => '<a class="btn btn-outline" target="_blank" rel="noopener" href="' + esc(r.url) + '">' + esc(r.nombre) + "</a>").join(" "); show("redes");
  }
  if (C.aviso_privacidad) { q("privBox").style.display = "block"; q("privBox").textContent = C.aviso_privacidad; }

  renderServices(); render();
})();
