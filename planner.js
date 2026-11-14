/* Trip budget planner — runs entirely in the browser */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  if (!$("p-adults")) return;
  var fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  function v(id) { var n = parseFloat($(id).value); return isFinite(n) && n > 0 ? n : 0; }
  function calc() {
    var people = v("p-adults") + v("p-kids"), nights = v("p-nights");
    var rows = [
      ["Flights", v("p-flight") * people],
      ["Bags & seats", v("p-bags")],
      ["Airport parking / rides", v("p-park")],
      ["Car & transfers", v("p-transport")],
      ["Stay (rooms × nights)", v("p-hotel") * v("p-rooms") * nights],
      ["Taxes & fees on stay", v("p-hotel") * v("p-rooms") * nights * v("p-tax") / 100 + v("p-resort") * v("p-rooms") * nights],
      ["Food", v("p-food") * people * Math.max(1, nights + 1)],
      ["Activities", v("p-act")],
      ["Insurance, eSIM, souvenirs", v("p-extra")]
    ];
    var sub = rows.reduce(function (s, r) { return s + r[1]; }, 0);
    var buf = sub * v("p-buffer") / 100; rows.push(["Buffer", buf]);
    var total = sub + buf;
    $("r-total").textContent = fmt.format(total);
    $("r-pp").textContent = people ? fmt.format(total / people) + " per person · " + fmt.format(nights ? total / nights : total) + (nights ? " per night" : "") : "Add at least one traveler.";
    var t = $("r-table"); t.innerHTML = "";
    rows.forEach(function (r) { var tr = document.createElement("tr"); var a = document.createElement("td"); a.textContent = r[0]; var b = document.createElement("td"); b.style.textAlign = "right"; b.textContent = fmt.format(r[1]); tr.appendChild(a); tr.appendChild(b); t.appendChild(tr); });
    var dest = $("p-dest").value.trim(), L = window.NV_LINKS, U = window.NV_UTIL;
    if (dest && L && U) {
      var ci = U.iso(U.addDays(new Date(), 30)), co = U.iso(U.addDays(new Date(), 30 + Math.max(1, nights)));
      $("r-hotels").href = L.booking({ dest: dest, checkin: ci, checkout: co, adults: Math.max(1, v("p-adults")), children: v("p-kids"), rooms: Math.max(1, v("p-rooms")) });
      $("r-todo").href = L.getyourguide({ q: dest });
    }
  }
  document.querySelectorAll("[data-calc], #p-dest").forEach(function (i) { i.addEventListener("input", calc); });
  calc();
})();
