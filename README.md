# Nino Travel

Static, mobile-first travel search & planning site for **Nino Travel** by YSSN Nino.
Live: https://yssnino.github.io/

* No build step: plain HTML/CSS/JS. Edit and push; GitHub Pages publishes automatically.
* **All affiliate IDs and Stripe Payment Links live in `config.js`.** Paste them there; nothing else needs to change.
  Search links work with blank IDs (they just aren't commission-tracked yet).
* Pages: home/search (`index.html`), Delay Help Center, Kids' Zone, guides, trip budget planner, policies.
* Paid PDF guides are NOT stored in this public repo (anyone can browse a public repo). They are kept off-repo until a delivery method that isn't publicly browsable is set up.
* `.github/workflows/decode-binaries.yml` turns uploaded `*.b64` files into binaries (PNG images).
