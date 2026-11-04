(() => {
  "use strict";

  const STATE_KEY = "dayflow_v1";
  const ALERTS_VERSION = 5;

  const seededAlerts = [
    {
      id: "alert-shower-gel-2026-11-01",
      title: "Acheter du gel douche",
      detail: "À acheter dès que possible.",
      symbol: "!",
      priority: "high",
      done: false,
      createdAt: "2026-11-01T23:23:00+01:00"
    },
    {
      id: "alert-fiber-technician-2026-11-04",
      title: "Rendez-vous technicien fibre",
      detail: "Mercredi 4 novembre · 14 h–16 h · être présent au nouvel appartement.",
      symbol: "!",
      priority: "critical",
      done: false,
      dueDate: "2026-11-04",
      createdAt: "2026-11-03T23:00:00+01:00"
    },
    {
      id: "alert-freebox-cancellation-2026-11-05",
      title: "Demander la résiliation de la Freebox",
      detail: "Raccordement échoué le 4 novembre. Demander le rapport du technicien et la prise en charge des frais au 3244.",
      symbol: "!",
      priority: "high",
      done: false,
      createdAt: "2026-11-04T22:39:00+01:00"
    },
    {
      id: "alert-freebox-fiber-2026-11-04",
      title: "Prendre la box Free avec moi",
      detail: "Récupérée lundi 2 novembre · technicien fibre mercredi 4 novembre.",
      symbol: "✓",
      priority: "critical",
      done: true,
      dueDate: "2026-11-03",
      completedDate: "2026-11-02",
      createdAt: "2026-11-01T23:23:00+01:00"
    }
  ];

  seedAlerts();
  renderAlerts();

  document.querySelectorAll('.nav-button[data-screen="agenda"]').forEach(button => {
    button.addEventListener("click", () => setTimeout(renderAlerts, 0));
  });

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATE_KEY));
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function seedAlerts() {
    const state = readState();
    if (!state) return;
    if (!Array.isArray(state.alerts)) state.alerts = [];

    const previousVersion = Number(state.alertsVersion) || 0;

    seededAlerts.forEach(alert => {
      if (!state.alerts.some(item => item?.id === alert.id)) state.alerts.push({ ...alert });
    });

    if (previousVersion < 2) {
      const freebox = state.alerts.find(item => item?.id === "alert-freebox-fiber-2026-11-04");
      if (freebox) {
        freebox.done = true;
        freebox.doneAt = freebox.doneAt || new Date().toISOString();
        freebox.completedDate = "2026-11-02";
        freebox.detail = "Récupérée lundi 2 novembre · technicien fibre mercredi 4 novembre.";
        freebox.symbol = "✓";
      }
    }

    if (previousVersion < 4) {
      const fiber = state.alerts.find(item => item?.id === "alert-fiber-technician-2026-11-04");
      if (fiber && !fiber.done) fiber.detail = "Mercredi 4 novembre · 14 h–16 h · être présent au nouvel appartement.";
    }

    if (previousVersion < 5) {
      const visit = state.alerts.find(item => item?.id === "alert-fiber-technician-2026-11-04");
      if (visit) {
        visit.done = true;
        visit.doneAt = visit.doneAt || new Date().toISOString();
        visit.completedDate = "2026-11-04";
        visit.detail = "Le technicien est passé le 4 novembre, mais le raccordement a échoué.";
      }
    }
    state.alertsVersion = ALERTS_VERSION;
    writeState(state);
  }

  function renderAlerts() {
    const screen = document.getElementById("screenAgenda");
    if (!screen) return;
    const state = readState();
    if (!state) return;

    const active = (state.alerts || []).filter(alert => alert && !alert.done);
    let host = document.getElementById("importantAlerts");
    if (!host) {
      host = document.createElement("section");
      host.id = "importantAlerts";
      host.className = "important-alerts";
      const controls = screen.querySelector(".control-row");
      if (controls?.nextSibling) screen.insertBefore(host, controls.nextSibling);
      else screen.prepend(host);
    }

    host.hidden = active.length === 0;
    if (!active.length) {
      host.innerHTML = "";
      return;
    }

    host.innerHTML = `
      <p class="alert-kicker">IMPORTANT · À NE PAS OUBLIER</p>
      ${active.map(alert => `
        <article class="important-alert" data-alert-id="${escapeHtml(alert.id)}">
          <div class="alert-icon" aria-hidden="true">${escapeHtml(alert.symbol || "!")}</div>
          <div class="alert-copy">
            <p class="alert-title">${escapeHtml(alert.title)}</p>
            <p class="alert-meta">${escapeHtml(alert.detail || "")}</p>
          </div>
          <button class="alert-done" type="button" data-done-id="${escapeHtml(alert.id)}">Fait</button>
        </article>
      `).join("")}
    `;

    host.querySelectorAll("[data-done-id]").forEach(button => {
      button.addEventListener("click", () => markDone(button.dataset.doneId));
    });
  }

  function markDone(id) {
    const state = readState();
    if (!state || !Array.isArray(state.alerts)) return;
    const alert = state.alerts.find(item => item?.id === id);
    if (!alert) return;
    alert.done = true;
    alert.doneAt = new Date().toISOString();
    writeState(state);
    renderAlerts();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'\"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '\"': "&quot;"
    }[char]));
  }
})();
