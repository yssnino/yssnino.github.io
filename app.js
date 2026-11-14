/* Nino Travel — search + UI logic (no build step, no dependencies) */
(function () {
  "use strict";
  var C = window.NV_CONFIG || { affiliates: {}, stripe: {} };
  var A = C.affiliates || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- helpers ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parseISO(v) { if (!v) return null; var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ddmm(v) { var d = parseISO(v); return pad(d.getDate()) + pad(d.getMonth() + 1); }
  function mdy(v) { var d = parseISO(v); return pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + "/" + d.getFullYear(); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function enc(s) { return encodeURIComponent(String(s).trim()); }
  function qs(obj) {
    return Object.keys(obj).filter(function (k) { return obj[k] !== "" && obj[k] != null; })
      .map(function (k) { return k + "=" + enc(obj[k]); }).join("&");
  }
  function open(url) {
    var w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  }
  function wrapExpedia(url) {
    return A.expediaCamref ? "https://prf.hn/click/camref:" + A.expediaCamref + "/destination:" + encodeURIComponent(url) : url;
  }
  function on(sel, fn) { var el = $(sel); if (el) el.addEventListener("click", fn); }
  function showErr(panel, msg) { var e = $(".err", panel); if (e) e.textContent = msg || ""; }

  /* ---------- partner link builders (exported for testing) ---------- */
  var L = {
    aviasales: function (o) {
      var p = o.from + ddmm(o.depart) + o.to + (o.ret ? ddmm(o.ret) : "") + (o.cabin || "") +
        Math.min(9, o.adults) + Math.min(9, o.children || 0) + Math.min(9, o.infants || 0);
      return "https://www.aviasales.com/search/" + p + (A.travelpayoutsMarker ? "?marker=" + enc(A.travelpayoutsMarker) : "");
    },
    expediaFlights: function (o) {
      var u = "https://www.expedia.com/Flights-Search?trip=" + (o.ret ? "roundtrip" : "oneway") +
        "&leg1=from:" + o.from + ",to:" + o.to + ",departure:" + mdy(o.depart) + "TANYT" +
        (o.ret ? "&leg2=from:" + o.to + ",to:" + o.from + ",departure:" + mdy(o.ret) + "TANYT" : "") +
        "&passengers=adults:" + o.adults + ",children:0,seniors:0,infantinlap:Y&mode=search";
      return wrapExpedia(u);
    },
    booking: function (o) {
      var u = "https://www.booking.com/searchresults.html?" + qs({ ss: o.dest, checkin: o.checkin, checkout: o.checkout, group_adults: o.adults, group_children: o.children || 0, no_rooms: o.rooms || 1, aid: A.bookingAid });
      for (var i = 0; i < (o.children || 0); i++) u += "&age=8";
      return u;
    },
    expediaHotels: function (o) {
      return wrapExpedia("https://www.expedia.com/Hotel-Search?" + qs({ destination: o.dest, startDate: o.checkin, endDate: o.checkout, adults: o.adults, rooms: o.rooms || 1 }));
    },
    expediaCars: function (o) {
      return wrapExpedia("https://www.expedia.com/carsearch?" + qs({ locn: o.loc, date1: mdy(o.pickup), date2: mdy(o.dropoff), time1: "1000AM", time2: "1000AM" }));
    },
    discoverCars: function () {
      return "https://www.discovercars.com/" + (A.discoverCarsAid ? "?a_aid=" + enc(A.discoverCarsAid) : "");
    },
    getyourguide: function (o) {
      return "https://www.getyourguide.com/s/?" + qs({ q: o.q, partner_id: A.getyourguidePartnerId });
    },
    viator: function (o) {
      return "https://www.viator.com/searchResults/all?" + qs({ text: o.q, pid: A.viatorPid, mcid: A.viatorMcid, medium: A.viatorPid ? "link" : "" });
    },
    airalo: function (o) {
      var u = "https://www.airalo.com/" + o.slug + "-esim";
      return A.airaloTrackingUrl ? A.airaloTrackingUrl + (A.airaloTrackingUrl.indexOf("?") > -1 ? "&" : "?") + "u=" + encodeURIComponent(u) : u;
    }
  };
  window.NV_LINKS = L;
  window.NV_UTIL = { resolveCode: function (i) { return resolveCode(i); }, iso: iso, addDays: addDays };

  /* ---------- tabs ---------- */
  var tabs = $$(".tab");
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
      $("#" + x.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (n) { var nt = tabs[(i + n + tabs.length) % tabs.length]; selectTab(nt); nt.focus(); e.preventDefault(); }
    });
  });
  $$("[data-open-tab]").forEach(function (a) {
    a.addEventListener("click", function () { var t = $("#tab-" + a.getAttribute("data-open-tab")); if (t) selectTab(t); });
  });

  /* ---------- default dates ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  $$('input[type="date"]').forEach(function (i) { i.min = iso(today); });
  function setDefault(id, days) { var el = $(id); if (el && !el.value) el.value = iso(addDays(today, days)); }
  setDefault("#f-depart", 21); setDefault("#f-return", 28);
  setDefault("#h-in", 21); setDefault("#h-out", 24);
  setDefault("#c-pick", 21); setDefault("#c-drop", 24);
  $$('input[type="date"]').forEach(function (i) {
    i.addEventListener("change", function () {
      var pair = { "f-depart": "#f-return", "h-in": "#h-out", "c-pick": "#c-drop" }[i.id];
      if (pair) { var o = $(pair); o.min = i.value; if (o.value && o.value <= i.value) o.value = iso(addDays(parseISO(i.value), i.id === "f-depart" ? 7 : 3)); }
    });
  });

  /* ---------- trip type ---------- */
  $$('input[name="trip"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var one = $('input[name="trip"]:checked').value === "oneway";
      $("#f-return-wrap").style.display = one ? "none" : "";
    });
  });

  /* ---------- airport autocomplete (Travelpayouts public autocomplete API) ---------- */
  var cache = {};
  function lookup(term) {
    term = term.trim();
    if (cache[term]) return Promise.resolve(cache[term]);
    var url = "https://autocomplete.travelpayouts.com/places2?locale=en&types[]=city&types[]=airport&term=" + enc(term);
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) { cache[term] = d || []; return cache[term]; });
  }
  function label(p) {
    return p.type === "airport" ? p.name + " (" + (p.city_name || "") + ")" : p.name + ", " + (p.country_name || "");
  }
  function setupAC(input) {
    var list = document.createElement("ul");
    list.className = "ac-list"; list.id = input.id + "-list"; list.setAttribute("role", "listbox"); list.hidden = true;
    input.parentNode.appendChild(list);
    input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false"); input.setAttribute("aria-controls", list.id);
    var items = [], active = -1, timer;
    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }
    function choose(p) { input.value = label(p) + " — " + p.code; input.dataset.code = p.code; close(); }
    function render() {
      list.innerHTML = "";
      items.slice(0, 7).forEach(function (p, i) {
        var li = document.createElement("li"); li.setAttribute("role", "option"); li.id = list.id + "-" + i;
        li.innerHTML = "<span></span><span class='code'></span>";
        li.firstChild.textContent = label(p); li.lastChild.textContent = p.code;
        li.addEventListener("mousedown", function (e) { e.preventDefault(); choose(p); });
        list.appendChild(li);
      });
      list.hidden = !items.length; input.setAttribute("aria-expanded", String(!!items.length));
    }
    input.addEventListener("input", function () {
      delete input.dataset.code;
      var v = input.value; clearTimeout(timer);
      if (v.trim().length < 2) { items = []; render(); return; }
      timer = setTimeout(function () { lookup(v).then(function (d) { items = d; active = -1; render(); }).catch(function () { items = []; render(); }); }, 180);
    });
    input.addEventListener("keydown", function (e) {
      if (list.hidden) return;
      var lis = $$("li", list);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + lis.length) % lis.length;
        lis.forEach(function (l, i) { l.setAttribute("aria-selected", i === active); });
        input.setAttribute("aria-activedescendant", lis[active].id); e.preventDefault();
      } else if (e.key === "Enter" && active > -1) { choose(items[active]); e.preventDefault(); }
      else if (e.key === "Escape") close();
    });
    input.addEventListener("blur", function () { setTimeout(close, 120); });
  }
  $$("[data-ac]").forEach(setupAC);

  function resolveCode(input) {
    if (input.dataset.code) return Promise.resolve(input.dataset.code);
    var v = input.value.trim();
    var m = v.match(/\b([A-Za-z]{3})$/);
    if (/^[A-Za-z]{3}$/.test(v)) return Promise.resolve(v.toUpperCase());
    if (!v) return Promise.reject(new Error("empty"));
    return lookup(v).then(function (d) {
      if (d && d[0]) { input.dataset.code = d[0].code; return d[0].code; }
      if (m) return m[1].toUpperCase();
      throw new Error("notfound");
    });
  }

  /* ---------- search handlers ---------- */
  function num(id) { return parseInt($(id).value, 10) || 0; }
  function flightSearch(which) {
    var panel = $("#panel-flights"); showErr(panel, "");
    var oneway = $('input[name="trip"]:checked').value === "oneway";
    var dep = $("#f-depart").value, ret = oneway ? "" : $("#f-return").value;
    if (!dep) return showErr(panel, "Please pick a departure date.");
    if (!oneway && !ret) return showErr(panel, "Please pick a return date, or choose One-way.");
    var adults = num("#f-adults"), children = num("#f-children"), infants = num("#f-infants");
    if (adults < 1) return showErr(panel, "At least one adult is required.");
    if (infants > adults) return showErr(panel, "Each lap infant needs an adult.");
    // open a blank tab synchronously so pop-up blockers allow it, then fill it in
    var w = window.open("about:blank", "_blank");
    Promise.all([resolveCode($("#f-from")), resolveCode($("#f-to"))]).then(function (c) {
      var o = { from: c[0], to: c[1], depart: dep, ret: ret, adults: adults, children: children, infants: infants, cabin: $("#f-cabin").value };
      var url = which === "expedia" ? L.expediaFlights(o) : L.aviasales(o);
      if (w) { w.opener = null; w.location.href = url; } else window.location.href = url;
    }).catch(function () {
      if (w) w.close();
      showErr(panel, "Please choose your departure and destination cities from the list (or type a 3-letter airport code like ATL).");
    });
  }
  on("#btn-flights", function () { flightSearch("aviasales"); });
  on("#btn-flights-alt", function () { flightSearch("expedia"); });

  function hotelOpts(panel) {
    showErr(panel, "");
    var dest = $("#h-dest").value.trim(), ci = $("#h-in").value, co = $("#h-out").value;
    if (!dest) { showErr(panel, "Where are you going? Enter a city, area or hotel name."); return null; }
    if (!ci || !co || co <= ci) { showErr(panel, "Please choose a check-out date after check-in."); return null; }
    return { dest: dest, checkin: ci, checkout: co, adults: Math.max(1, num("#h-adults")), children: num("#h-children"), rooms: Math.max(1, num("#h-rooms")) };
  }
  on("#btn-hotels", function () { var o = hotelOpts($("#panel-hotels")); if (o) open(L.booking(o)); });
  on("#btn-hotels-alt", function () { var o = hotelOpts($("#panel-hotels")); if (o) open(L.expediaHotels(o)); });

  on("#btn-cars", function () {
    var p = $("#panel-cars"); showErr(p, "");
    var loc = $("#c-loc").value.trim(), a = $("#c-pick").value, b = $("#c-drop").value;
    if (!loc) return showErr(p, "Enter a pick-up city or airport.");
    if (!a || !b || b <= a) return showErr(p, "Please choose a drop-off date after pick-up.");
    open(L.expediaCars({ loc: loc, pickup: a, dropoff: b }));
  });
  on("#btn-cars-alt", function () { open(L.discoverCars()); });

  function actQ() { var p = $("#panel-activities"); showErr(p, ""); var q = $("#a-q").value.trim(); if (!q) showErr(p, "Enter a city or attraction."); return q; }
  on("#btn-act", function () { var q = actQ(); if (q) open(L.getyourguide({ q: q })); });
  on("#btn-act-alt", function () { var q = actQ(); if (q) open(L.viator({ q: q })); });

  on("#btn-esim", function () { open(L.airalo({ slug: $("#e-country").value })); });

  // Enter key submits the active panel
  $$(".panel").forEach(function (p) {
    p.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && !e.defaultPrevented && e.target.getAttribute("aria-expanded") !== "true") {
        var b = $(".btn-primary", p); if (b) { e.preventDefault(); b.click(); }
      }
    });
  });

  /* ---------- destination cards ---------- */
  $$("[data-dest]").forEach(function (card) {
    var city = card.getAttribute("data-dest"), code = card.getAttribute("data-code");
    var h = $('[data-act="hotels"]', card), t = $('[data-act="todo"]', card), f = $('[data-act="flights"]', card);
    var ci = iso(addDays(today, 21)), co = iso(addDays(today, 24));
    if (h) h.href = L.booking({ dest: city, checkin: ci, checkout: co, adults: 2, rooms: 1 });
    if (t) t.href = L.getyourguide({ q: city });
    if (f) f.addEventListener("click", function (e) {
      e.preventDefault(); selectTab($("#tab-flights"));
      var to = $("#f-to"); to.value = city + " — " + code; to.dataset.code = code;
      $("#search").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { $("#f-from").focus(); }, 400);
    });
  });

  /* ---------- Stripe payment links ---------- */
  $$("[data-stripe]").forEach(function (b) {
    if (b.dataset.nvDone) return; b.dataset.nvDone = "1";
    var url = (C.stripe || {})[b.getAttribute("data-stripe")];
    if (url) { b.href = url; b.target = "_blank"; b.rel = "noopener"; }
    else { b.removeAttribute("href"); b.setAttribute("aria-disabled", "true"); b.textContent = "Coming soon"; b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); }
  });

  /* ---------- deal alerts ---------- */
  var nf = $("#alerts-form");
  if (nf) nf.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $(".msg", nf), email = $("#alert-email", nf).value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = "Please enter a valid email address."; return; }
    if (!C.newsletterEndpoint) {
      msg.textContent = "Deal alerts are launching soon. Until then, follow " + (C.socialHandle || "us") + " for travel deals.";
      return;
    }
    msg.textContent = "Signing you up…";
    fetch(C.newsletterEndpoint, { method: "POST", body: new FormData(nf), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; nf.reset(); msg.textContent = "You're on the list! Check your inbox to confirm."; })
      .catch(function () { msg.textContent = "Sorry, something went wrong. Please try again later."; });
  });

  /* ---------- contact + misc ---------- */
  $$("[data-contact]").forEach(function (el) {
    if (C.contactEmail) { el.innerHTML = ""; var a = document.createElement("a"); a.href = "mailto:" + C.contactEmail; a.textContent = C.contactEmail; el.appendChild(a); }
    else { el.innerHTML = ""; var s = document.createElement("a"); s.href = C.socialUrl; s.rel = "noopener"; s.textContent = "a direct message to " + C.socialHandle + " on TikTok"; el.appendChild(s); }
  });
  var mb = $(".menu-btn");
  if (mb && !mb.dataset.nvDone) { mb.dataset.nvDone = "1"; mb.addEventListener("click", function () { var n = $(".nav-links"); var o = n.classList.toggle("open"); mb.setAttribute("aria-expanded", o); }); }
  $$(".nav-links a").forEach(function (a) { a.addEventListener("click", function () { $(".nav-links").classList.remove("open"); }); });
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
