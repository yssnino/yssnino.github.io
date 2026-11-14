/* Kids' Zone games — all original, no external assets */
(function () {
  "use strict";
  function $(s) { return document.querySelector(s); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var ICONS = {
    plane: '<path fill="#16213E" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
    sun: '<circle cx="12" cy="12" r="5" fill="#F2C14E"/><g stroke="#F2C14E" stroke-width="2" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></g>',
    cloud: '<path fill="#8ECAE6" d="M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    heart: '<path fill="#E76F51" d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.3 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.7 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21z"/>',
    star: '<path fill="#F4A261" d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z"/>',
    bag: '<rect x="4" y="7" width="16" height="13" rx="2" fill="#2A9D8F"/><path d="M9 7V4h6v3" stroke="#16213E" stroke-width="2" fill="none"/>',
    pin: '<path fill="#B56576" d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
    boat: '<path fill="#264653" d="M3 15h18l-3 5H6z"/><path fill="#E9C46A" d="M11 3v10H5z"/><path fill="#E76F51" d="M13 5v8h5z"/>'
  };
  /* memory */
  var grid = $("#memory-grid"), msg = $("#memory-msg");
  function newMemory() {
    if (!grid) return;
    grid.innerHTML = ""; msg.textContent = "";
    var deck = shuffle(Object.keys(ICONS).concat(Object.keys(ICONS)));
    var open = [], found = 0, moves = 0, lock = false;
    deck.forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.dataset.k = k;
      b.setAttribute("aria-label", "Hidden card");
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + "</svg>";
      b.addEventListener("click", function () {
        if (lock || b.classList.contains("up") || b.classList.contains("done")) return;
        b.classList.add("up"); b.setAttribute("aria-label", k); open.push(b);
        if (open.length === 2) {
          moves++; lock = true;
          var a = open[0], c = open[1];
          if (a.dataset.k === c.dataset.k) {
            a.classList.add("done"); c.classList.add("done"); open = []; lock = false; found++;
            msg.textContent = found === 8 ? "You found them all in " + moves + " moves! 🎉" : "Match! " + found + " of 8";
          } else {
            setTimeout(function () { a.classList.remove("up"); c.classList.remove("up"); a.setAttribute("aria-label", "Hidden card"); c.setAttribute("aria-label", "Hidden card"); open = []; lock = false; }, 800);
          }
        }
      });
      grid.appendChild(b);
    });
  }
  var mn = $("#memory-new"); if (mn) mn.addEventListener("click", newMemory); newMemory();
  /* bingo */
  var ITEMS = ["Pilot", "Rolling suitcase", "Someone napping", "Coffee cup", "Plane taking off", "Baby stroller", "Neck pillow", "Departure board", "Backpack", "Someone wearing a hat", "Water fountain", "Moving walkway", "Window seat view", "Luggage cart", "Red suitcase", "Sunglasses", "Headphones", "Someone reading a book", "Snack stand", "Escalator", "Gate number 7", "A dog (service or pet)", "Airport map", "Flight attendant", "Someone in flip-flops", "Clock", "Fuel truck", "A plane's tail logo", "Someone waving", "Wheelchair helper", "Charging station", "Rainy window"];
  var bg = $("#bingo-grid"), bm = $("#bingo-msg");
  function checkBingo(cells) {
    var on = cells.map(function (c) { return c.getAttribute("aria-pressed") === "true"; });
    var lines = [];
    for (var i = 0; i < 4; i++) { lines.push([i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3]); lines.push([i, i + 4, i + 8, i + 12]); }
    lines.push([0, 5, 10, 15]); lines.push([3, 6, 9, 12]);
    return lines.some(function (l) { return l.every(function (x) { return on[x]; }); });
  }
  function newBingo() {
    if (!bg) return;
    bg.innerHTML = ""; bm.textContent = "";
    var cells = shuffle(ITEMS.slice()).slice(0, 16).map(function (t) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = t; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
        bm.textContent = checkBingo(cells) ? "BINGO! Great spotting! ✈️" : "";
      });
      bg.appendChild(b); return b;
    });
  }
  var bn = $("#bingo-new"); if (bn) bn.addEventListener("click", newBingo); newBingo();
  /* breathing */
  var balloon = $("#balloon"), cue = $("#breath-cue"), bb = $("#breath-btn"), timer = null, round = 0;
  function stopBreath() { clearTimeout(timer); timer = null; balloon.className = "breath"; cue.textContent = "Nice job. How do you feel?"; bb.textContent = "Start"; }
  function cycle() {
    round++;
    balloon.className = "breath in"; cue.textContent = "Breathe in… 2… 3… 4";
    timer = setTimeout(function () {
      cue.textContent = "Hold… 2";
      timer = setTimeout(function () {
        balloon.className = "breath"; balloon.style.transitionDuration = "6s"; cue.textContent = "Slowly let it out… 3… 4… 5… 6";
        timer = setTimeout(function () { balloon.style.transitionDuration = ""; if (round < 5) cycle(); else { round = 0; stopBreath(); } }, 6000);
      }, 2000);
    }, 4000);
  }
  if (bb) bb.addEventListener("click", function () { if (timer) { round = 0; stopBreath(); } else { bb.textContent = "Stop"; cycle(); } });
  /* stories */
  var WHO = ["a sleepy giraffe pilot", "a robot who loves pancakes", "two best-friend suitcases", "a tiny dragon with a boarding pass", "a grandma who can talk to clouds", "a puppy flight attendant", "a kid inventor with rocket sneakers", "a shy little airplane named Pip"];
  var WHERE = ["on a plane made of candy", "at the busiest airport on the moon", "inside a snow globe city", "on an island where it rains bubbles", "in a hotel run by penguins", "on a train that flies at night", "in a theme park under the sea"];
  var WHAT = ["lost the map to the treasure gate", "has to deliver a birthday cake before it melts", "discovers the luggage can talk", "needs to find the last missing puzzle piece", "accidentally shrinks to the size of a peanut", "must teach a cloud how to rain", "finds a door marked 'Gate ∞'"];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var sb = $("#story-btn"); if (sb) sb.addEventListener("click", function () { $("#story").textContent = "Once upon a time, " + pick(WHO) + " " + pick(WHERE) + " " + pick(WHAT) + ". What happens next?"; });
  /* printing a single coloring page */
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      var svg = b.parentNode.querySelector("svg").outerHTML;
      var w = window.open("", "_blank");
      if (!w) { window.print(); return; }
      w.document.write('<!doctype html><title>Nino Travel coloring page</title><style>body{margin:0;font-family:sans-serif;text-align:center}svg{width:95vw;height:auto;max-height:85vh}p{color:#555;font-size:12px}</style>' + svg + "<p>Nino Travel · Kids' Zone · free for personal use</p><script>window.onload=function(){window.print()}<\/script>");
      w.document.close();
    });
  });
})();
