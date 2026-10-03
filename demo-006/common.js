/* SANA Agenda 24/7 — utilidades compartidas. Sin servidor: datos en localStorage (solo demo). */
(function () {
  const C = window.SANA_CONFIG;
  const KEY = "sana:" + C.slug + ":citas";
  const SEEDKEY = "sana:" + C.slug + ":seed";
  const DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const DIAS3 = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseISO = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fromMin = n => pad(Math.floor(n / 60)) + ":" + pad(n % 60);
  const fechaLarga = s => { const d = parseISO(s); return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()]; };

  function theme() {
    const r = document.documentElement.style, c = C.colores || {};
    if (c.primario) r.setProperty("--primary", c.primario);
    if (c.oscuro) r.setProperty("--dark", c.oscuro);
    if (c.acento) r.setProperty("--accent", c.acento);
    if (C.sitio && C.sitio.titulo) document.title = C.sitio.titulo;
  }

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  // Citas de ejemplo (solo si config.demo === true). Se regeneran cada día para que siempre sean futuras.
  function seed() {
    if (!C.demo || C.modo === "solicitud") return;
    const today = iso(new Date());
    if (localStorage.getItem(SEEDKEY) === today) return;
    let list = load().filter(c => !c.demo);
    const base = [
      ["Paciente Ejemplo A", "Primera consulta", "Primera consulta", "10:00", 0, "pendiente"],
      ["Paciente Ejemplo B", "Control / seguimiento", "Control / seguimiento", "11:30", 0, "confirmada"],
      ["Paciente Ejemplo C", "Teleconsulta", "Consulta general", "09:30", 1, "confirmada"],
      ["Paciente Ejemplo D", "Primera consulta", "Primera consulta", "15:00", 1, "pendiente"],
      ["Paciente Ejemplo E", "Control / seguimiento", "Control / seguimiento", "10:30", 2, "pendiente"],
      ["Paciente Ejemplo F", "Primera consulta", "Consulta general", "16:00", 3, "cancelada"]
    ];
    const open = openDays(); // días laborables a partir de hoy
    base.forEach((b, i) => {
      const f = open[Math.min(b[4], open.length - 1)];
      if (!f) return;
      list.push({ id: "demo-" + i, demo: true, nombre: b[0], telefono: "9XX XXX XXX", servicio: b[1], motivo: b[2], fecha: f, hora: b[3], estado: b[5], creada: new Date().toISOString() });
    });
    save(list);
    localStorage.setItem(SEEDKEY, today);
  }

  function scheduleFor(date) {
    const a = C.agenda, dow = date.getDay();
    if (!a.dias.includes(dow)) return null;
    const o = (a.horarios_por_dia || {})[String(dow)] || {};
    return { inicio: o.inicio || a.inicio, fin: o.fin || a.fin };
  }
  function openDays() {
    const out = [], t = new Date(); t.setHours(0, 0, 0, 0);
    for (let i = 0; i <= C.agenda.dias_adelante; i++) {
      const d = new Date(t); d.setDate(t.getDate() + i);
      if (scheduleFor(d)) out.push(iso(d));
    }
    return out;
  }
  // Devuelve [{hora, libre}] para una fecha ISO
  function slotsFor(fecha, duracion) {
    const d = parseISO(fecha), sch = scheduleFor(d);
    if (!sch) return [];
    const a = C.agenda, step = a.duracion_min, now = new Date();
    const isToday = iso(now) === fecha, nowMin = now.getHours() * 60 + now.getMinutes();
    const taken = new Set(load().filter(c => c.fecha === fecha && c.estado !== "cancelada").map(c => c.hora));
    const out = [];
    for (let m = toMin(sch.inicio); m + step <= toMin(sch.fin); m += step) {
      if (a.descanso && m < toMin(a.descanso.fin) && m + step > toMin(a.descanso.inicio)) continue;
      const hora = fromMin(m);
      out.push({ hora, libre: !taken.has(hora) && !(isToday && m <= nowMin + 30) });
    }
    return out;
  }

  function normPhone(raw) {
    const d = String(raw || "").replace(/\D/g, "");
    if (/^9\d{8}$/.test(d)) return "51" + d;
    if (/^519\d{8}$/.test(d)) return d;
    return null;
  }
  function tpl(s, vars) { return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : "{" + k + "}")); }
  function waLink(number, text) {
    const n = (number || "").replace(/\D/g, "");
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(text);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  window.SANA = { C, KEY, DIAS, DIAS3, MESES, pad, iso, parseISO, fechaLarga, theme, load, save, seed, scheduleFor, slotsFor, normPhone, tpl, waLink, esc };
})();
