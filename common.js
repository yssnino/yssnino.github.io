(function () {
  var S = (window.NV_CONFIG || {}).stripe || {};
  document.querySelectorAll("[data-stripe]").forEach(function (b) {
    if (b.dataset.nvDone) return; b.dataset.nvDone = "1";
    var url = S[b.getAttribute("data-stripe")];
    if (url) { b.href = url; b.target = "_blank"; b.rel = "noopener"; }
    else { b.removeAttribute("href"); b.setAttribute("aria-disabled", "true"); b.textContent = "Coming soon"; b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); }
  });
})();
