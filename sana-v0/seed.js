/* SANA v0 — estado semilla. TODO ES FICTICIO (personas, medicamentos, fechas, documentos). */
window.SANA_SEED = {
  version: 1,
  sim: "2026-10-05T09:00",               // reloj simulado (no es la hora real)
  nextId: 4,
  profesional: "Dra. Profesional de Ejemplo",
  patients: [
    { id: "p1", nombre: "Ana Torres",   motivo: "Control metabólico" },
    { id: "p2", nombre: "Luis Mendoza", motivo: "Seguimiento post consulta" },
    { id: "p3", nombre: "María López",  motivo: "Control de presión" }
  ],
  plans: [
    { id: "pl1", patientId: "p1", status: "activo", creadoSim: "2026-10-01T10:30", abiertoSim: "2026-10-01T11:20",
      indicaciones: ["Camina 20 minutos al día (ejemplo ficticio).", "Bebe agua durante el día (ejemplo ficticio)."],
      tareas: [
        { id: "t1", tipo: "tomar", nombre: "Medicamento de ejemplo A", instruccion: "1 unidad de ejemplo con el desayuno", frecuencia: "diario", desde: "2026-10-02", done: true, doneSim: "2026-10-02T08:05" },
        { id: "t2", tipo: "hacer", nombre: "Caminata de ejemplo", instruccion: "20 minutos, a tu ritmo", frecuencia: "diario", desde: "2026-10-02", done: false, doneSim: null },
        { id: "t3", tipo: "hacer", nombre: "Anotar tu peso de ejemplo", instruccion: "Una vez por semana, en el mismo horario", frecuencia: "semanal", desde: "2026-10-05", done: false, doneSim: null }
      ],
      control: { texto: "Examen de ejemplo (laboratorio ficticio)", fecha: "2026-10-19" },
      cita: { fecha: "2026-10-26", hora: "10:00", confirmada: false, confirmadaSim: null }, segundos: 41, toques: 5 },
    { id: "pl2", patientId: "p2", status: "activo", creadoSim: "2026-10-04T18:00", abiertoSim: null,
      indicaciones: ["Descansa lo necesario esta semana (ejemplo ficticio).", "Anota cómo te sientes cada noche, sin diagnósticos (ejemplo ficticio)."],
      tareas: [
        { id: "t4", tipo: "tomar", nombre: "Medicamento de ejemplo B", instruccion: "1 unidad de ejemplo después de cenar", frecuencia: "diario", desde: "2026-10-05", done: false, doneSim: null },
        { id: "t5", tipo: "hacer", nombre: "Llamar para agendar tu control", instruccion: "Cuando tengas un momento", frecuencia: "una_vez", desde: "2026-10-05", done: false, doneSim: null }
      ],
      control: { texto: "Control de ejemplo con tu profesional", fecha: "2026-10-12" },
      cita: { fecha: "2026-10-12", hora: "16:30", confirmada: false, confirmadaSim: null }, segundos: 38, toques: 5 },
    { id: "pl0", patientId: "p3", status: "anterior", creadoSim: "2026-09-12T09:00", abiertoSim: "2026-09-12T12:10",
      indicaciones: ["Toma tus medidas de ejemplo en la mañana (ficticio)."],
      tareas: [
        { id: "t6", tipo: "hacer", nombre: "Registrar medida de ejemplo", instruccion: "Una vez al día, en reposo", frecuencia: "diario", desde: "2026-09-13", done: true, doneSim: "2026-09-13T07:40" }
      ],
      control: { texto: "Control de ejemplo", fecha: "2026-09-26" },
      cita: { fecha: "2026-09-26", hora: "09:30", confirmada: true, confirmadaSim: "2026-09-24T10:15" }, segundos: 33, toques: 4 }
  ],
  docs: [
    { id: "d1", patientId: "p1", nombre: "Resultado de ejemplo — laboratorio (ficticio)", fecha: "2026-09-20" },
    { id: "d2", patientId: "p3", nombre: "Documento de ejemplo — constancia de control (ficticio)", fecha: "2026-09-26" },
    { id: "d3", patientId: "p2", nombre: "Documento de ejemplo — indicaciones anteriores (ficticio)", fecha: "2026-09-15" }
  ],
  events: [
    { sim: "2026-09-12T09:00", type: "plan_creado",     planId: "pl0", patientId: "p3", detail: "Plan creado" },
    { sim: "2026-09-12T12:10", type: "plan_abierto",    planId: "pl0", patientId: "p3", detail: "Plan abierto" },
    { sim: "2026-09-13T07:40", type: "tarea_marcada",   planId: "pl0", patientId: "p3", detail: "Registrar medida de ejemplo" },
    { sim: "2026-09-24T10:15", type: "cita_confirmada", planId: "pl0", patientId: "p3", detail: "Cita confirmada" },
    { sim: "2026-10-01T10:30", type: "plan_creado",     planId: "pl1", patientId: "p1", detail: "Plan creado" },
    { sim: "2026-10-01T11:20", type: "plan_abierto",    planId: "pl1", patientId: "p1", detail: "Plan abierto" },
    { sim: "2026-10-02T08:05", type: "tarea_marcada",   planId: "pl1", patientId: "p1", detail: "Medicamento de ejemplo A" },
    { sim: "2026-10-04T18:00", type: "plan_creado",     planId: "pl2", patientId: "p2", detail: "Plan creado" }
  ]
};
window.SANA_TEMPLATES = [
  { id: "metabolico", label: "Control metabólico (ejemplo)", indic: ["Camina 20 minutos al día (ejemplo ficticio).", "Bebe agua durante el día (ejemplo ficticio)."],
    items: [ { tipo: "tomar", nombre: "Medicamento de ejemplo A", instruccion: "1 unidad de ejemplo con el desayuno", frecuencia: "diario" },
             { tipo: "hacer", nombre: "Caminata de ejemplo", instruccion: "20 minutos, a tu ritmo", frecuencia: "diario" } ],
    control: "Examen de ejemplo (laboratorio ficticio)", ctrlDias: 14, citaDias: 21, hora: "10:00" },
  { id: "postconsulta", label: "Post consulta (ejemplo)", indic: ["Descansa lo necesario esta semana (ejemplo ficticio).", "Anota cómo te sientes cada noche, sin diagnósticos (ejemplo ficticio)."],
    items: [ { tipo: "tomar", nombre: "Medicamento de ejemplo B", instruccion: "1 unidad de ejemplo después de cenar", frecuencia: "diario" },
             { tipo: "hacer", nombre: "Llamar para agendar tu control", instruccion: "Cuando tengas un momento", frecuencia: "una_vez" } ],
    control: "Control de ejemplo con tu profesional", ctrlDias: 7, citaDias: 7, hora: "16:30" },
  { id: "presion", label: "Control de presión (ejemplo)", indic: ["Toma tus medidas de ejemplo en la mañana (ficticio).", "Evita comidas muy saladas esta semana (ejemplo ficticio)."],
    items: [ { tipo: "tomar", nombre: "Medicamento de ejemplo C", instruccion: "1 unidad de ejemplo por la mañana", frecuencia: "diario" },
             { tipo: "hacer", nombre: "Registrar medida de ejemplo", instruccion: "Una vez al día, en reposo", frecuencia: "diario" } ],
    control: "Control de ejemplo", ctrlDias: 14, citaDias: 14, hora: "09:30" }
];
