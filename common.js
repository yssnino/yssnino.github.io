/* Shared bits for all pages: contact links, mobile menu, footer year, Stripe buttons */
(function () {
  var C = window.NV_CONFIG || {};
  document.querySelectorAll("[data-contact]").forEach(function (el) {
    el.innerHTML = "";
    var a = document.createElement("a");
    if (C.contactEmail) { a.href = "mailto:" + C.contactEmail; a.textContent = C.contactEmail; }
    else { a.href = C.socialUrl || "#"; a.rel = "noopener"; a.textContent = "a direct message to " + (C.socialHandle || "us") + " on TikTok"; }
    el.appendChild(a);
  });
  var mb = document.querySelector(".menu-btn");
  if (mb && !mb.dataset.nvDone) { mb.dataset.nvDone = "1"; mb.addEventListener("click", function () { var o = document.querySelector(".nav-links").classList.toggle("open"); mb.setAttribute("aria-expanded", o); }); }
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
(function () {
  var S = (window.NV_CONFIG || {}).stripe || {};
  document.querySelectorAll("[data-stripe]").forEach(function (b) {
    if (b.dataset.nvDone) return; b.dataset.nvDone = "1";
    var url = S[b.getAttribute("data-stripe")];
    if (url) { b.href = url; b.target = "_blank"; b.rel = "noopener"; }
    else { b.removeAttribute("href"); b.setAttribute("aria-disabled", "true"); b.textContent = "Coming soon"; b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); }
  });
})();
