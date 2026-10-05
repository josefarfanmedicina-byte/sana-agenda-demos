/* Landing "Crea tu demo": todo en el navegador, sin red ni almacenamiento. Textos con textContent; URLs construidas por nosotros. */
(function () {
  "use strict";
  var K = window.SANA_CREA, $ = function (id) { return document.getElementById(id); };
  var sel = $("e");
  Object.keys(K.ESP).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = K.ESP[k].label; sel.appendChild(o); });
  sel.addEventListener("change", function () { $("otra-box").hidden = sel.value !== "otra"; });
  var WA = "https://wa.me/51930319029?text=";
  function linkDemo(n, e, m, o) {
    var q = new URLSearchParams(); q.set("n", n); q.set("e", e); q.set("m", m); if (e === "otra" && o) q.set("o", o);
    var u = new URL("demo/", location.href); u.search = q.toString(); u.hash = ""; return u.href;
  }
  $("f").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var n = K.limpiar($("n").value, 60), e = sel.value, m = (document.querySelector("input[name=m]:checked") || {}).value, o = K.limpiar($("o").value, 40);
    if (!Object.prototype.hasOwnProperty.call(K.ESP, e)) e = "medicina-general";
    if (!Object.prototype.hasOwnProperty.call(K.MOD, m)) m = "ambas";
    $("en").textContent = n.length < 2 ? "Escribe el nombre de tu consultorio." : "";
    $("eo").textContent = e === "otra" && o.length < 2 ? "Escribe tu especialidad." : "";
    if (n.length < 2 || (e === "otra" && o.length < 2)) return;
    var url = linkDemo(n, e, m, o);
    $("res-nombre").textContent = n; $("link").value = url; $("abrir").setAttribute("href", url); $("copiado").textContent = "";
    $("wa").setAttribute("href", WA + encodeURIComponent("Hola Dr. José, soy de " + n + ". Quiero esto en mi consultorio. Mi demo: " + url));
    $("compartir").hidden = !navigator.share;
    var r = $("resultado"); r.hidden = false; r.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
  $("copiar").addEventListener("click", function () {
    var v = $("link").value, done = function () { $("copiado").textContent = "¡Link copiado!"; };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(done, fallback); else fallback();
    function fallback() { var i = $("link"); i.focus(); i.select(); try { document.execCommand("copy"); done(); } catch (e) { $("copiado").textContent = "Mantén presionado el link para copiarlo."; } }
  });
  $("compartir").addEventListener("click", function () {
    navigator.share({ title: "Mi demo de SANA Agenda", text: "Mira cómo mis pacientes podrían pedir cita:", url: $("link").value }).catch(function () {});
  });
})();
