/* ============================================================
   OcePvP - shared site behaviour
   nav, copy-ip, toasts, scroll reveals, games grid
   ============================================================ */

(function () {
  "use strict";

  /* ---------- mobile nav ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("nav.main");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  /* ---------- toast ---------- */
  let toastEl = null;
  let toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () {
      toastEl.classList.add("show");
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- copy server ip ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (el) {
    el.addEventListener("click", function () {
      const value = el.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () { toast("Copied " + value); },
          function () { toast(value); }
        );
      } else {
        toast(value);
      }
    });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- scroll reveal ---------- */
  function observeReveals(root) {
    const els = (root || document).querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }
  observeReveals();

  /* ============================================================
     GAMES - renders into any element with data-games.
     data-games-limit="3" shows only the first few (home page).
     ============================================================ */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function gameCard(g) {
    const tags = (g.tags || [])
      .map(function (t) { return "<span>" + escapeHtml(t) + "</span>"; })
      .join("");
    return (
      '<article class="card game reveal">' +
        '<div class="banner">' +
          (g.status ? '<em class="status">' + escapeHtml(g.status) + "</em>" : "") +
          "<span>" + escapeHtml(g.icon || "⚔️") + "</span>" +
        "</div>" +
        '<div class="body">' +
          "<h3>" + escapeHtml(g.name || "Untitled game") + "</h3>" +
          "<p>" + escapeHtml(g.description || "") + "</p>" +
          '<div class="foot">' +
            '<span class="players">' + escapeHtml(g.players || "") + "</span>" +
            '<div class="tags">' + tags + "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  const games = typeof GAMES !== "undefined" && Array.isArray(GAMES) ? GAMES : [];

  document.querySelectorAll("[data-games]").forEach(function (grid) {
    const limit = parseInt(grid.getAttribute("data-games-limit"), 10);
    const list = limit ? games.slice(0, limit) : games;

    if (!list.length) {
      grid.innerHTML =
        '<div class="empty" style="grid-column:1/-1">' +
          "<b>Games coming soon</b>" +
          "<span>The game list is being put together. Check the Discord for what's live right now.</span>" +
        "</div>";
      return;
    }

    grid.innerHTML = list.map(gameCard).join("");
    observeReveals(grid);
  });

  document.querySelectorAll("[data-games-count]").forEach(function (el) {
    el.textContent = games.length + (games.length === 1 ? " game" : " games");
  });
})();


/* ============================================================
   SUGGESTION FORM (games.html)
   Posts straight into Discord using the webhook in config.js.
   ============================================================ */
(function () {
  "use strict";

  const form = document.getElementById("suggestForm");
  if (!form) return;

  const notice = document.getElementById("suggestNotice");
  const button = document.getElementById("s_submit");
  const details = document.getElementById("s_details");
  const counter = document.getElementById("s_count");

  const COOLDOWN_MS = 60 * 1000;       // one suggestion a minute
  const MAX_PER_HOUR = 5;
  const STORE = "ocepvp.suggests";

  function show(message, ok) {
    notice.textContent = message;
    notice.className = "notice " + (ok ? "notice-ok" : "notice-bad");
    notice.hidden = false;
  }

  details.addEventListener("input", function () {
    counter.textContent = details.value.length;
  });

  /* Light friction only - it lives in this browser, so it stops accidents
     and double-clicks rather than someone determined. */
  function recentSends() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "[]");
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return saved.filter(function (t) { return t > hourAgo; });
    } catch (err) {
      return [];
    }
  }

  function rememberSend() {
    try {
      const sends = recentSends();
      sends.push(Date.now());
      localStorage.setItem(STORE, JSON.stringify(sends));
    } catch (err) { /* private browsing - not important */ }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const webhook = typeof OCE_WEBHOOK === "string" ? OCE_WEBHOOK : "";
    const game = document.getElementById("s_game").value.trim();
    const username = document.getElementById("s_username").value.trim();
    const text = details.value.trim();
    const trap = document.getElementById("s_website").value;

    if (!webhook) {
      show("Suggestions aren't switched on yet — tell us in the Discord instead.", false);
      return;
    }
    if (game.length < 2) {
      show("Give your game idea a name.", false);
      document.getElementById("s_game").focus();
      return;
    }
    if (username && !/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      show("That doesn't look like a Minecraft username (3-16 letters, numbers or _).", false);
      document.getElementById("s_username").focus();
      return;
    }

    // Bots fill the hidden field. Pretend it worked and send nothing.
    if (trap) {
      form.reset();
      counter.textContent = "0";
      show("Thanks! Your suggestion was sent to the staff team.", true);
      return;
    }

    const sends = recentSends();
    const last = sends.length ? sends[sends.length - 1] : 0;
    if (Date.now() - last < COOLDOWN_MS) {
      show("Hold on a moment before sending another one.", false);
      return;
    }
    if (sends.length >= MAX_PER_HOUR) {
      show("You've sent a few suggestions already — try again later.", false);
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";

    const payload = {
      username: "OcePvP Suggestions",
      // stops anyone using a suggestion to ping @everyone
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: game.slice(0, 250),
          description: text ? text.slice(0, 1000) : "_No details given._",
          color: 0x22d3ee,
          fields: [
            {
              name: "From",
              value: username ? "`" + username + "`" : "_Anonymous_",
              inline: true
            }
          ],
          footer: { text: "Sent from the Games page" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (res.status === 429) {
          throw new Error("Too many suggestions right now — try again in a minute.");
        }
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          throw new Error("The suggestion box isn't working right now. Tell us in the Discord.");
        }
        if (!res.ok) throw new Error("That didn't send. Try again in a moment.");

        rememberSend();
        form.reset();
        counter.textContent = "0";
        show("Thanks! Your suggestion was sent to the staff team.", true);
      })
      .catch(function (err) {
        show(
          err instanceof TypeError
            ? "Couldn't reach Discord. Check your connection and try again."
            : err.message,
          false
        );
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Send suggestion";
      });
  });
})();
