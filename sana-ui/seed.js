/* SANA UI — estado semilla. TODO ES FICTICIO (personas, fechas, resultados, indicaciones, lugares). */
window.SANA_SEED = {
  version: 1,
  sim: "2026-10-07T08:00",
  hoy: "2026-10-07",
  nombre: "Ana",
  checkin: null,
  cita: { fecha: "2026-10-07", hora: "10:00", estado: "por_confirmar", confSim: null, reprogramada: false },
  pendientes: [
    { id: "q1", texto: "Revisar resultado de ejemplo de Luis Mendoza", hecho: false },
    { id: "q2", texto: "Confirmar cita de María López (ejemplo)", hecho: false },
    { id: "q3", texto: "Responder nota de seguimiento de Ana Torres (ejemplo)", hecho: false }
  ],
  seguimientos: [
    { id: "s1", texto: "Llamar a Luis en 3 días (ejemplo)" },
    { id: "s2", texto: "Revisar plan de María la próxima semana (ejemplo)" }
  ],
  nextId: 10
};
/* Datos fijos de ejemplo (no editables) */
window.SANA_DATA = {
  profesional: "Dra. de ejemplo",
  lugar: "Consultorio de ejemplo",
  direccion: "Av. Ejemplo 123, 2.º piso, Lima (dirección ficticia)",
  slots: [ { fecha: "2026-10-08", hora: "09:30" }, { fecha: "2026-10-09", hora: "11:00" }, { fecha: "2026-10-12", hora: "16:00" } ],
  indicaciones: [
    { t: "Medicamento de ejemplo A", d: "1 unidad de ejemplo con el desayuno" },
    { t: "Caminata de ejemplo", d: "20 minutos, a tu ritmo" },
    { t: "Anotar tu peso de ejemplo", d: "Una vez por semana" }
  ],
  resultados: [
    { id: "r2", nombre: "Control de presión de ejemplo", fecha: "2026-10-02", estado: "revisa", dato: "Dato de ejemplo: 3",
      exp: "Este es un resultado de ejemplo ficticio. En SANA verías aquí una explicación general y neutra de qué es este tipo de control." },
    { id: "r1", nombre: "Examen de sangre de ejemplo", fecha: "2026-09-30", estado: "disponible", dato: "Dato de ejemplo: 5",
      exp: "Este es un examen de ejemplo ficticio. Aquí aparecería una descripción general de qué se midió, sin interpretarlo." },
    { id: "r3", nombre: "Examen de orina de ejemplo", fecha: "2026-09-20", estado: "disponible", dato: "Dato de ejemplo: 2",
      exp: "Este es un examen de ejemplo ficticio. La explicación completa te la da tu profesional." }
  ],
  linea: [
    { id: "l1", tipo: "cita", fecha: "2026-10-07", titulo: "Cita con la Dra. de ejemplo", detalle: "Control de ejemplo", dest: "#/cita" },
    { id: "l2", tipo: "resultado", fecha: "2026-10-02", titulo: "Control de presión de ejemplo", detalle: "Lo revisará tu profesional", dest: "#/resultado/r2" },
    { id: "l3", tipo: "plan", fecha: "2026-10-01", titulo: "Plan después de tu consulta (ejemplo)", detalle: "3 indicaciones de ejemplo", dest: "" },
    { id: "l4", tipo: "resultado", fecha: "2026-09-30", titulo: "Examen de sangre de ejemplo", detalle: "Disponible", dest: "#/resultado/r1" },
    { id: "l5", tipo: "cita", fecha: "2026-09-24", titulo: "Consulta de ejemplo (realizada)", detalle: "Con la Dra. de ejemplo", dest: "" },
    { id: "l6", tipo: "resultado", fecha: "2026-09-20", titulo: "Examen de orina de ejemplo", detalle: "Disponible", dest: "#/resultado/r3" },
    { id: "l7", tipo: "plan", fecha: "2026-09-12", titulo: "Plan anterior (ejemplo)", detalle: "2 indicaciones de ejemplo", dest: "" }
  ],
  hoyPacientes: [
    { id: "p1", nombre: "Ana Torres", hora: "10:00", motivo: "Control metabólico" },
    { id: "p2", nombre: "Luis Mendoza", hora: "11:00", motivo: "Seguimiento post consulta" },
    { id: "p3", nombre: "María López", hora: "12:30", motivo: "Control de presión" }
  ],
  agendaExtra: [
    { fecha: "2026-10-07", hora: "11:00", nombre: "Luis Mendoza" },
    { fecha: "2026-10-07", hora: "12:30", nombre: "María López" },
    { fecha: "2026-10-08", hora: "15:00", nombre: "Luis Mendoza" },
    { fecha: "2026-10-09", hora: "10:30", nombre: "María López" }
  ],
  resultadosNuevos: [
    { nombre: "Luis Mendoza", item: "Examen de sangre de ejemplo" },
    { nombre: "María López", item: "Control de presión de ejemplo" }
  ],
  animos: [
    { id: "genial", emo: "😄", txt: "Genial" }, { id: "bien", emo: "🙂", txt: "Bien" }, { id: "normal", emo: "😐", txt: "Normal" },
    { id: "cansado", emo: "😴", txt: "Cansado/a" }, { id: "agobiado", emo: "😟", txt: "Agobiado/a" }
  ]
};
