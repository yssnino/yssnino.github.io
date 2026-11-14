/* Delay Help Center: backup flight search */
(function () {
  "use strict";
  var L = window.NV_LINKS, U = window.NV_UTIL;
  var panel = document.getElementById("panel-delay");
  if (!panel || !L) return;
  var err = panel.querySelector(".err");
  var from = document.getElementById("d-from"), to = document.getElementById("d-to");
  function go(when, fromOverride) {
    err.textContent = "";
    var d = U.iso(U.addDays(new Date(), when === "1" ? 1 : 0));
    var w = window.open("about:blank", "_blank");
    var pFrom = fromOverride ? Promise.resolve(fromOverride) : U.resolveCode(from);
    Promise.all([pFrom, U.resolveCode(to)]).then(function (c) {
      var o = { from: c[0], to: c[1], depart: d, ret: "", adults: +document.getElementById("d-adults").value, children: +document.getElementById("d-kids").value, infants: 0, cabin: "" };
      var url = when === "x" ? L.expediaFlights(o) : L.aviasales(o);
      if (w) { w.opener = null; w.location.href = url; } else location.href = url;
    }).catch(function () {
      if (w) w.close();
      err.textContent = "Please enter where you are and where you're going (pick from the list, or type a 3-letter code like ATL).";
      (fromOverride ? to : from).focus();
    });
  }
  panel.querySelectorAll("[data-when]").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-when")); }); });
  document.querySelectorAll("[data-metro]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!to.value.trim()) { err.textContent = "First enter where you're trying to get to in the backup flight search above."; document.getElementById("backup").scrollIntoView({ behavior: "smooth" }); to.focus(); return; }
      go("0", b.getAttribute("data-metro"));
    });
  });
})();
