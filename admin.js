/* ============================================================
   OcePvP - admin panel
   ------------------------------------------------------------
   Talks to the Render API (its address is in config.js).
   The password is checked by the server on every request, so
   there is nothing secret in this file.
   ============================================================ */

(function () {
  "use strict";

  const STATUSES = [
    { key: "new", label: "New" },
    { key: "planned", label: "Planned" },
    { key: "added", label: "Added" },
    { key: "declined", label: "Declined" }
  ];

  const KEY_STORE = "ocepvp.admin.key";

  const gate = document.getElementById("gate");
  const panel = document.getElementById("panel");
  const gateForm = document.getElementById("gateForm");
  const gatePass = document.getElementById("gatePass");
  const gateBtn = document.getElementById("gateBtn");
  const gateError = document.getElementById("gateError");
  const panelError = document.getElementById("panelError");
  const list = document.getElementById("list");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");

  let password = null;
  let suggestions = [];
  let activeFilter = "new";

  function apiBase() {
    return typeof OCE_API === "string" ? OCE_API : "";
  }

  /* ---------- api ---------- */
  function api(path, options) {
    const base = apiBase();
    if (!base) {
      return Promise.reject(new Error("No API address set. Put your Render URL in config.js."));
    }

    const opts = options || {};
    const headers = { "Content-Type": "application/json" };
    if (password) headers["x-admin-password"] = password;

    return fetch(base + "/api/suggestions" + (path || ""), {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body
    }).then(function (res) {
      return res.json().catch(function () {
        throw new Error("The server didn't answer properly. Is the API running?");
      }).then(function (data) {
        if (res.status === 401) {
          const err = new Error(data.error || "Wrong password.");
          err.unauthorised = true;
          throw err;
        }
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        return data;
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.hidden = false;
  }

  function friendly(err) {
    return err instanceof TypeError
      ? "Couldn't reach the server. It may be waking up — wait a minute and try again."
      : err.message;
  }

  /* ---------- screens ---------- */
  function showGate() {
    password = null;
    try { sessionStorage.removeItem(KEY_STORE); } catch (e) {}
    panel.hidden = true;
    gate.hidden = false;
    gatePass.focus();
  }

  function showPanel() {
    gate.hidden = true;
    panel.hidden = false;
  }

  /* ---------- login / logout ---------- */
  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    gateError.hidden = true;
    gateBtn.disabled = true;
    gateBtn.textContent = "Checking...";

    // Logging in = asking the API for the list with this password.
    password = gatePass.value;
    api("")
      .then(function (data) {
        try { sessionStorage.setItem(KEY_STORE, password); } catch (e) {}
        suggestions = data.suggestions || [];
        gatePass.value = "";
        showPanel();
        render();
      })
      .catch(function (err) {
        password = null;
        showError(gateError, friendly(err));
        gatePass.select();
      })
      .finally(function () {
        gateBtn.disabled = false;
        gateBtn.textContent = "Log in";
      });
  });

  document.getElementById("logout").addEventListener("click", showGate);
  document.getElementById("refresh").addEventListener("click", load);

  /* ---------- data ---------- */
  function load() {
    panelError.hidden = true;
    api("")
      .then(function (data) {
        suggestions = data.suggestions || [];
        render();
      })
      .catch(function (err) {
        if (err.unauthorised) return showGate();
        showError(panelError, friendly(err));
      });
  }

  function setStatus(id, status) {
    api("/" + id, { method: "PUT", body: JSON.stringify({ status: status }) })
      .then(function () {
        const s = suggestions.find(function (x) { return x.id === id; });
        if (s) s.status = status;
        render();
      })
      .catch(function (err) {
        if (err.unauthorised) return showGate();
        showError(panelError, friendly(err));
        load();
      });
  }

  function remove(id) {
    const s = suggestions.find(function (x) { return x.id === id; });
    if (!s || !confirm('Delete the suggestion "' + s.game + '"? This can\'t be undone.')) return;
    api("/" + id, { method: "DELETE" })
      .then(function () {
        suggestions = suggestions.filter(function (x) { return x.id !== id; });
        render();
      })
      .catch(function (err) {
        if (err.unauthorised) return showGate();
        showError(panelError, friendly(err));
      });
  }

  /* ---------- rendering ---------- */
  function renderFilters() {
    const counts = { all: suggestions.length };
    STATUSES.forEach(function (st) {
      counts[st.key] = suggestions.filter(function (x) { return x.status === st.key; }).length;
    });

    const items = [{ key: "all", label: "All" }].concat(STATUSES);
    filters.innerHTML = items.map(function (f) {
      return '<button type="button" class="chip' + (f.key === activeFilter ? " active" : "") +
        '" data-filter="' + f.key + '">' + f.label + " <b>" + counts[f.key] + "</b></button>";
    }).join("");

    filters.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter");
        render();
      });
    });
  }

  function formatDate(value) {
    const d = new Date(value);
    if (isNaN(d)) return escapeHtml(value || "");
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function card(s) {
    const options = STATUSES.map(function (st) {
      return '<option value="' + st.key + '"' + (st.key === s.status ? " selected" : "") + ">" +
        st.label + "</option>";
    }).join("");

    const who = s.username
      ? '<img src="https://minotar.net/helm/' + encodeURIComponent(s.username) + '/32.png" alt="" ' +
        "onerror=\"this.style.visibility='hidden'\"> " + escapeHtml(s.username)
      : '<span style="color:var(--dim)">Anonymous</span>';

    return (
      '<article class="card sugg status-' + escapeHtml(s.status) + '">' +
        '<div class="sugg-main">' +
          "<h3>" + escapeHtml(s.game) + "</h3>" +
          (s.details
            ? '<p class="sugg-details">' + escapeHtml(s.details) + "</p>"
            : '<p class="sugg-details empty-details">No details given.</p>') +
          '<div class="sugg-meta"><span class="who">' + who + "</span><span>" +
            formatDate(s.created_at) + "</span></div>" +
        "</div>" +
        '<div class="sugg-actions">' +
          '<select data-status="' + s.id + '" aria-label="Status">' + options + "</select>" +
          '<button class="btn btn-danger btn-sm" data-delete="' + s.id + '">Delete</button>' +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    renderFilters();

    const q = search.value.trim().toLowerCase();
    const shown = suggestions.filter(function (s) {
      if (activeFilter !== "all" && s.status !== activeFilter) return false;
      if (!q) return true;
      return (s.game + " " + s.details + " " + s.username).toLowerCase().indexOf(q) !== -1;
    });

    if (!shown.length) {
      list.innerHTML =
        '<div class="empty"><b>' +
        (suggestions.length ? "Nothing matches" : "No suggestions yet") +
        "</b><span>" +
        (suggestions.length
          ? "Try another filter or search."
          : "When someone uses the form on the Games page, it'll show up here.") +
        "</span></div>";
      return;
    }

    list.innerHTML = shown.map(card).join("");

    list.querySelectorAll("[data-status]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        setStatus(sel.getAttribute("data-status"), sel.value);
      });
    });
    list.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        remove(btn.getAttribute("data-delete"));
      });
    });
  }

  search.addEventListener("input", render);

  /* ---------- start: still logged in from earlier in this tab? ---------- */
  let saved = null;
  try { saved = sessionStorage.getItem(KEY_STORE); } catch (e) {}

  if (saved) {
    password = saved;
    api("")
      .then(function (data) {
        suggestions = data.suggestions || [];
        showPanel();
        render();
      })
      .catch(function () { showGate(); });
  } else {
    showGate();
  }
})();
