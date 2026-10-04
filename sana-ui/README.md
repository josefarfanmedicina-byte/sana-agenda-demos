# SANA UI — prototipo visual "Tu salud, más clara."

**Prototipo VISUAL con 100 % DATOS FICTICIOS. NO es un producto, NO es producción, NO es apto para pacientes reales.**
Objetivo: que alguien mire SANA 10 segundos y entienda qué hace: *tu cita, tus indicaciones y tus resultados en un solo lugar* (personas) y *tus pacientes de hoy y lo pendiente* (profesionales).
Reutiliza el sistema de diseño de `sana_v0` (paleta verde/azul calma, tarjetas grandes, tipografía del sistema) sin modificarlo.

## Pantallas (hash routing, máximo 6)
| # | Ruta | Contenido |
|---|---|---|
| 1 | `#/inicio` | **Home Personas**: ¿Cómo estás? (check-in local) → Próxima cita → Medicamentos/indicaciones (ejemplo) → Resultados recientes → Línea de salud (vista previa) |
| 2 | `#/pro` (+ `#/pro/agenda`, `#/pro/resultados`, `#/pro/seguimientos`) | **Home Profesionales**: Pacientes de hoy → Pendientes → Agenda → Resultados nuevos → Seguimientos (secciones de la misma pantalla) |
| 3 | `#/linea` | **Línea de tiempo** vertical con filtros (Todo / Citas / Resultados / Planes) |
| 4 | `#/cita` | **Vista de cita**: fecha/hora, lugar y profesional ficticios, qué preparar, cómo llegar (sin mapas), Confirmar / Reprogramar simulados |
| 5 | `#/resultados`, `#/resultado/<id>` | **Resultados simples**: estados neutros ("Disponible" / "Lo revisará tu profesional"), detalle con explicación genérica y aviso "No es un diagnóstico; tu profesional te lo explicará." |
| 6 | (integrada) | **Navegación**: conmutador Personas/Profesionales arriba + barra inferior (Inicio, Cita, Resultados, Línea de salud / Hoy, Agenda, Resultados, Seguimientos). En pantallas anchas (≥ 900 px) la barra pasa a ser lateral. |

## Probar en el teléfono
- **Publicado:** https://josefarfanmedicina-byte.github.io/sana-agenda-demos/sana-ui/
- **Local:** `cd /workspace/starx/sana_ui && python3 -m http.server 8768` y abrir `http://<IP-de-la-PC>:8768/` en el teléfono (misma red Wi-Fi).
- Recorrido: toca un ánimo en "¿Cómo estás?" → Cita → Confirmar cita → cambia a **Profesionales** y mira a Ana "Confirmada" → Resultados → Línea de salud (prueba los filtros). **Reiniciar demo** (pie de cada pantalla) restaura el estado inicial.

## Qué es simulado
- **Todo**: personas (Ana Torres, Luis Mendoza, María López), profesional ("Dra. de ejemplo"), lugar, fechas, resultados e indicaciones son inventados y rotulados como ejemplo. Sin fármacos reales ni dosis reales.
- El **check-in** solo se guarda en el `localStorage` del navegador; SANA no lo interpreta ni da consejos.
- **Confirmar / Reprogramar** cambian el estado local; no se avisa a nadie. No se envía ningún mensaje.
- **Resultados**: sin valores de referencia, rangos ni semáforos; cualquier valor está rotulado "Dato de ejemplo".
- El **reloj** es simulado (7 oct 2026 por defecto), no la hora real.
- Sin backend, sin librerías externas, sin analítica, sin cookies, sin mapas externos. No hay IA, chat, pagos, login ni mensajería.

## Nota de seguridad
> **No apto para pacientes reales.** Antes de usarlo con personas reales harían falta como mínimo: HTTPS completo, autenticación y autorización, consentimiento informado, política de privacidad, seguridad (cifrado, auditoría), revisión legal (Ley 29733 y normativa de salud) y manejo correcto de datos de salud. Nada de eso existe aquí.

Todo texto escrito por el usuario (nombre, recordatorios) se inserta con `textContent`; una entrada como `<b>x</b>` se ve como texto literal.

## Archivos
`index.html`, `styles.css`, `seed.js`, `app.js`, `test_sana_ui.py`, `capturas/`, `FUTURE.md`.

## Pruebas
```bash
cd /workspace/starx/sana_ui && python3 -m http.server 8768 &
/workspace/.venv/bin/python test_sana_ui.py http://localhost:8768/
/workspace/.venv/bin/python test_sana_ui.py https://josefarfanmedicina-byte.github.io/sana-agenda-demos/sana-ui/
```
