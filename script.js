// Nav active-state on click
document.querySelectorAll(".navlink").forEach(function (link) {
  link.addEventListener("click", function () {
    document.querySelectorAll(".navlink").forEach(function (l) { l.classList.remove("active"); });
    link.classList.add("active");
  });
});

// Boot sequence: terminal lines -> big name reveal -> hand off to the site
(function () {
  var boot = document.getElementById("boot");
  if (!boot) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem("bootSeen") === "1"; } catch (e) {}

  if (reduceMotion || alreadySeen) { boot.remove(); return; }
  try { sessionStorage.setItem("bootSeen", "1"); } catch (e) {}

  var lines = [
    "> initializing eldad.sys ...",
    "> loading credentials ......... [UNIT 8200 VERIFIED]",
    "> compiling skillset ........... [PYTHON / SQL / ML / LLM]",
    "> establishing secure link ..... [OK]"
  ];
  var lineEls = boot.querySelectorAll(".boot-line");
  var bar = boot.querySelector(".boot-bar-fill");
  var status = boot.querySelector(".boot-status");
  var joke = boot.querySelector(".boot-joke");
  var bootInner = boot.querySelector(".boot-inner");
  var nameEl = boot.querySelector(".boot-name");
  var finished = false;

  function typeLine(el, text, cb) {
    var i = 0;
    (function step() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) { setTimeout(step, 12); }
      else if (cb) { cb(); }
    })();
  }

  function runLine(idx) {
    if (idx >= lineEls.length) {
      requestAnimationFrame(function () { bar.style.width = "100%"; });
      setTimeout(function () {
        status.classList.add("show");
        setTimeout(function () { joke.classList.add("show"); }, 300);
        setTimeout(showName, 1100);
      }, 950);
      return;
    }
    typeLine(lineEls[idx], lines[idx], function () {
      setTimeout(function () { runLine(idx + 1); }, 100);
    });
  }

  function showName() {
    bootInner.style.opacity = "0";
    setTimeout(function () {
      bootInner.style.display = "none";
      nameEl.classList.add("show");
      setTimeout(finish, 950);
    }, 320);
  }

  function finish() {
    if (finished) return;
    finished = true;
    boot.classList.add("hide");
    setTimeout(function () { boot.remove(); }, 520);
  }

  boot.addEventListener("click", finish);
  runLine(0);
})();

// Full-page living particle network background
(function () {
  var canvas = document.getElementById("network-canvas");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var particles = [];
  var mouse = { x: null, y: null };
  var W = 0, H = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    var count = Math.max(30, Math.min(90, Math.floor((W * H) / 16000)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      });
    }
  }

  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", function () {
    mouse.x = null; mouse.y = null;
  });
  window.addEventListener("resize", resize);

  function step() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      if (mouse.x !== null) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0.01) { p.x += (dx / dist) * 0.6; p.y += (dy / dist) * 0.6; }
      }
    }
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var pa = particles[a], pb = particles[b];
        var ddx = pa.x - pb.x, ddy = pa.y - pb.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < 130) {
          ctx.strokeStyle = "rgba(32,227,178," + (0.22 * (1 - d / 130)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(32,227,178,0.55)";
      ctx.beginPath();
      ctx.arc(particles[a].x, particles[a].y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) { requestAnimationFrame(step); }
  }

  resize();
  step();
})();

// Scroll-triggered fade/slide reveals
(function () {
  var els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in-view"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  els.forEach(function (el) { io.observe(el); });
})();

// Glitch/redact hover effect for tagged stats
(function () {
  var els = document.querySelectorAll(".glitch");
  if (!els.length) return;
  var chars = "#%&*01_/\\[]{}";
  els.forEach(function (el) {
    var real = el.getAttribute("data-real") || el.textContent;
    var fake = el.getAttribute("data-fake") || real;
    var timer = null;
    var scrambling = false;

    function scrambleTo(target, done) {
      var frame = 0;
      var totalFrames = 7;
      clearInterval(timer);
      timer = setInterval(function () {
        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          el.textContent = target;
          if (done) done();
          return;
        }
        var out = "";
        for (var i = 0; i < target.length; i++) {
          out += Math.random() < 0.5 ? chars[Math.floor(Math.random() * chars.length)] : target[i];
        }
        el.textContent = out;
      }, 35);
    }

    el.addEventListener("mouseenter", function () {
      if (scrambling) return;
      scrambling = true;
      scrambleTo(fake, function () {
        setTimeout(function () { scrambleTo(real, function () { scrambling = false; }); }, 700);
      });
    });
  });
})();

// A little something for anyone looking at the source
console.log("%c👀 poking around in here, are we?", "font-size:16px;font-weight:800;color:#20e3b2;");
console.log("%crelax — no bugs in here. that I know of.", "font-size:12.5px;color:#b28bfa;");
console.log("%cif you are a recruiter: eldadsimanian@gmail.com — let's talk.", "font-size:12.5px;color:#f3f6f4;");
console.log("%c> clearance_check: [UNIT 8200] ......... VERIFIED", "font-family:monospace;font-size:12px;color:#8fe9cf;");

// Custom cursor ring, desktop pointer only
(function () {
  var isFine = window.matchMedia("(pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isFine || reduceMotion) return;

  var dot = document.createElement("div");
  dot.id = "cursor-dot";
  document.body.appendChild(dot);

  var targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  var curX = targetX, curY = targetY;

  window.addEventListener("mousemove", function (e) {
    targetX = e.clientX; targetY = e.clientY;
  });

  function raf() {
    curX += (targetX - curX) * 0.2;
    curY += (targetY - curY) * 0.2;
    dot.style.transform = "translate(" + curX + "px," + curY + "px) translate(-50%,-50%)";
    requestAnimationFrame(raf);
  }
  raf();

  document.querySelectorAll("a, .cta, .navlink, .nav-cta, .glitch").forEach(function (el) {
    el.addEventListener("mouseenter", function () { dot.classList.add("hover"); });
    el.addEventListener("mouseleave", function () { dot.classList.remove("hover"); });
  });
})();

// Magnetic pull on buttons, desktop pointer only
(function () {
  var isFine = window.matchMedia("(pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isFine || reduceMotion) return;

  document.querySelectorAll(".cta, .nav-cta").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width / 2);
      var my = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + (mx * 0.25).toFixed(1) + "px," + (my * 0.35).toFixed(1) + "px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  });
})();

// Scroll-linked parallax: section watermarks drift, hero visual shifts
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var marks = document.querySelectorAll(".section-watermark");
  var radar = document.querySelector(".radar");
  var hud = document.querySelector(".hud");
  var hero = document.querySelector(".hero");
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  var ticking = false;

  function update() {
    var vh = window.innerHeight;

    marks.forEach(function (el, i) {
      var rect = el.parentElement.getBoundingClientRect();
      var progress = (vh / 2) - (rect.top + rect.height / 2);
      var dir = i % 2 === 0 ? 1 : -1;
      var shift = clamp(progress * 0.15 * dir, -140, 140);
      el.style.transform = "translateY(-50%) translateX(" + shift.toFixed(1) + "px)";
    });

    if (hero) {
      var heroTop = hero.getBoundingClientRect().top;
      var heroProgress = clamp(-heroTop, 0, 700);
      if (radar) radar.style.transform = "translateY(" + (heroProgress * 0.12).toFixed(1) + "px)";
      if (hud) hud.style.transform = "translateY(" + (heroProgress * -0.08).toFixed(1) + "px)";
    }

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update();
})();
