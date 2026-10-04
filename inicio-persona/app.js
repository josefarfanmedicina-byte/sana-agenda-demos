/* SANA · Inicio Persona — prototipo con datos ficticios. Sin backend, sin librerías, sin analítica. */
(function () {
  "use strict";
  var KEY = "sana_inicio_v1", BASE = 2, TOTAL = 4;
  var $ = function (id) { return document.getElementById(id); };
  var mem = false;
  function get() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return mem; } }
  function set(v) { mem = v; try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} }

  function paint() {
    var done = get(), n = BASE + (done ? 1 : 0);
    $("btn-hecho").hidden = done; $("hecho-row").hidden = !done; $("nota-hecho").hidden = !done;
    $("siguiente").classList.toggle("is-done", done);
    $("plan-txt").textContent = n + " de " + TOTAL + " pasos completados";
    $("bar-fill").style.width = (n * 100 / TOTAL) + "%";
    $("bar").setAttribute("aria-valuenow", String(n));
  }
  $("btn-hecho").addEventListener("click", function () { set(true); paint(); $("btn-deshacer").focus(); });
  $("btn-deshacer").addEventListener("click", function () { set(false); paint(); $("btn-hecho").focus(); });

  /* Próxima cita: hoja simple con los mismos datos (#cita) */
  function sheet() { $("cita").hidden = location.hash !== "#cita"; }
  window.addEventListener("hashchange", sheet); sheet();

  /* Tu plan: enlace inerte con feedback sutil */
  $("abrir-plan").addEventListener("click", function (e) { e.preventDefault(); $("plan-hint").hidden = false; });

  /* Pestañas: solo Inicio está activa; las otras muestran "Próximamente" sin navegar */
  var timer = null;
  Array.prototype.forEach.call(document.querySelectorAll(".tab[data-tab]"), function (t) {
    if (t.getAttribute("data-tab") === "inicio") return;
    t.addEventListener("click", function () {
      var el = $("toast"); el.hidden = false; clearTimeout(timer); timer = setTimeout(function () { el.hidden = true; }, 1800);
    });
  });
  paint();
})();
