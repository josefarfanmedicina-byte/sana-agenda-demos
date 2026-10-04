# SANA v0 PROTOTYPE — "Tu salud, más clara."

**Prototipo navegable con 100 % DATOS FICTICIOS. NO es un producto, NO es producción, NO es apto para pacientes reales.**

**Wedge:** después de cada consulta, SANA convierte las indicaciones del profesional en un plan claro para el paciente: qué hacer, cuándo hacerlo y qué sigue.

Flujo demostrado: Profesional → crea plan en menos de 60 s → envía plan → la persona abre el plan → entiende qué sigue → marca una acción → SANA registra el progreso.

## Las 6 pantallas (hash routing)
| # | Ruta | Quién | Qué hace |
|---|---|---|---|
| 1 | `#/pacientes` | Profesional | Mis pacientes (3 ficticios), botón NUEVO PLAN, "Métricas del prototipo" (colapsada) |
| 2 | `#/crear` | Profesional | Crear plan en una pantalla: indicaciones, medicamentos/tareas, examen o control, próxima cita; plantillas rápidas (chips) |
| 3 | `#/enviado/<id>` | Profesional | "Plan enviado correctamente.", enlace ficticio, estado No abierto/Abierto, progreso |
| 4 | `#/mi-plan/<id>` | Persona (sin login) | QUÉ HACER / QUÉ TOMAR / QUÉ SIGUE / CUÁNDO VOLVER |
| 5 | `#/progreso/<id>` | Persona | Marcar tareas con un toque, confirmar cita, aviso "check ≠ cumplimiento" |
| 6 | `#/linea/<id>` | Persona | Planes anteriores, próxima cita, documentos ficticios |

## Probar en el teléfono
- **Publicado:** https://josefarfanmedicina-byte.github.io/sana-agenda-demos/sana-v0/
- **Local:** `cd /workspace/starx/sana_v0 && python3 -m http.server 8767` y abrir `http://<IP-de-la-PC>:8767/` desde el teléfono (misma red Wi-Fi), o `http://localhost:8767/` en la PC.
- Recorrido sugerido: **NUEVO PLAN** → tocar una plantilla rápida → **ENVIAR PLAN** → "Abrir como si fuera el paciente" → "Marcar lo que ya hice" → marcar una tarea → "Confirmar mi cita" → pestaña "Mi línea" → volver a Mis pacientes → abrir "Métricas del prototipo".
- **Reiniciar demo** (pie de cada pantalla) restaura el estado semilla.

## Qué es simulado
- **Todo**: personas, medicamentos ("Medicamento de ejemplo A/B/C"), fechas, documentos y resultados son inventados y están rotulados como ejemplo ficticio. No hay dosis ni fármacos reales.
- **No se envía nada**: "Plan enviado" no manda ningún mensaje; el "enlace del paciente" es un enlace interno del prototipo que abre la vista de la persona.
- **Reloj simulado**: las fechas/horas de los eventos (plan creado, abierto, tarea marcada, cita confirmada) avanzan por reglas internas; no son la hora real.
- **Métricas**: la North Star conceptual ("% de planes con al menos un siguiente paso completado en 14 días") se calcula solo sobre los eventos simulados guardados en el navegador.
- **Estado** en `localStorage` del propio navegador, solo con datos ficticios. Sin cookies, sin analítica, sin backend, sin librerías externas.
- **Qué significa un check**: solo "marcaste esta acción como realizada". No confirma toma real ni cumplimiento clínico.
- La IA no interviene: no interpreta ni genera nada clínico. No hay diagnóstico, recetas, chat, pagos ni mensajería real.

## Límites reales y nota de seguridad
> **El acceso por enlace sin contraseña es solo para demostrar la experiencia (UX). NO es apto para producción.**

Antes de usar con pacientes reales harían falta, como mínimo: HTTPS completo, autenticación y autorización reales, permisos por rol, consentimiento informado, política de privacidad, seguridad (cifrado, auditoría, copias), revisión legal (Ley 29733 y normas de salud) y manejo correcto de datos de salud. Nada de eso existe en este prototipo.

## Seguridad de render
Todo texto escrito por el usuario se inserta con `textContent`/nodos DOM; no se usa `innerHTML` con datos. Una entrada como `<b>x</b>` se muestra como texto literal (probado).

## Archivos
`index.html`, `styles.css`, `seed.js` (estado semilla ficticio), `app.js` (rutas y pantallas), `test_sana_v0.py` (prueba E2E móvil 390×844), `capturas/`, `FUTURE.md`.

## Probar
```bash
cd /workspace/starx/sana_v0 && python3 -m http.server 8767 &
/workspace/.venv/bin/python test_sana_v0.py http://localhost:8767/
/workspace/.venv/bin/python test_sana_v0.py https://josefarfanmedicina-byte.github.io/sana-agenda-demos/sana-v0/
```
