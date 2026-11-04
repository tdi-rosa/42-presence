(() => {
  "use strict";
  const STATE_KEY = "dayflow_v1";
  let lastDate = "";

  window.addEventListener("dayflow:agenda-render", event => {
    const date = event.detail?.date;
    const view = event.detail?.view;
    if (!date) return;
    lastDate = date;
    render(date, view);
  });

  function readState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch { return {}; }
  }

  function dateLabel(date) {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(year, month - 1, day));
  }

  function scheduled(date, state) {
    const day = new Date(date + "T12:00:00").getDay();
    return (state.events || []).filter(item => {
      if (!item) return false;
      const recurrent = item.recurrence?.type === "weekly"
        && item.recurrence.days?.includes(day)
        && date >= item.recurrence.startDate;
      if (!recurrent && item.date !== date) return false;
      const override = state.occurrences?.[item.id + "@" + date];
      return !override?.deleted;
    });
  }

  function chooseBlocks(date) {
    if (date === "2026-11-05") {
      return [
        { icon: "⌘", when: "Matin", title: "42 · Hansar Protocol", detail: "Une vraie séance de travail" },
        { icon: "◫", when: "Après-midi", title: "Déménagement", detail: "Reprendre à l’appartement" },
        { icon: "♨", when: "Soir", title: "Curry maison", detail: "Bien manger, garder des portions" }
      ];
    }
    if (date === "2026-11-04") {
      return [
        { icon: "↗", when: "Matin", title: "Course + 42", detail: "Go : décomposer run" },
        { icon: "◫", when: "Après-midi", title: "Déménagement", detail: "Si les conditions le permettent" },
        { icon: "◎", when: "Soir", title: "Réunion NA", detail: "Créneau agenda : 18 h 30" }
      ];
    }

    const items = scheduled(date, readState());
    const sport = items.find(e => /sport|course/i.test(e.title));
    const school = items.find(e => e.category === "work42");
    const move = items.find(e => e.category === "moving");
    const meet = items.find(e => e.category === "social");
    const blocks = [];
    if (school || sport) blocks.push({
      icon: "↗", when: "Matin",
      title: school ? (sport ? "Sport + 42" : "42") : "Sport",
      detail: school ? "Protéger le temps d’apprentissage" : "Prendre soin de soi"
    });
    if (move) blocks.push({ icon: "◫", when: "Après-midi", title: "Déménagement", detail: "Bloc flexible" });
    if (meet) blocks.push({ icon: "◎", when: meet.start || "Réunion", title: meet.title.replace(/^Réunion\s*[—-]\s*/i,""), detail: "Rendez-vous à garder en tête" });
    return blocks.slice(0,3);
  }

  function render(date, view) {
    const agenda = document.getElementById("screenAgenda");
    const anchor = agenda?.querySelector(".focus-card");
    if (!agenda || !anchor) return;
    let card = document.getElementById("dailyCompass");
    if (!card) {
      card = document.createElement("section");
      card.id = "dailyCompass";
      card.className = "daily-compass";
      card.setAttribute("aria-label", "Cap de la journée");
      agenda.insertBefore(card, anchor);
    }
    card.hidden = view !== "day";
    if (card.hidden) return;
    const blocks = chooseBlocks(date);
    const highlight = date === "2026-11-04" || date === "2026-11-05";
    const lead = date === "2026-11-05" ? "Hansar Protocol, déménagement et bon curry" : highlight ? "Avancer sur Go, sans forcer le rythme" : "Quelques repères pour la journée";
    const extra = date === "2026-11-04" ? '<p class="compass-note"><span aria-hidden="true">◇</span> Fibre : technicien entre 14 h et 16 h · présence sur place</p>' : "";
    card.innerHTML =
      '<div class="compass-head"><span class="compass-eyebrow">CAP DU JOUR</span><span class="compass-date">' + esc(dateLabel(date)) + '</span></div>' +
      '<p class="compass-lead">' + esc(lead) + '</p>' +
      '<div class="compass-grid">' +
      (blocks.length ? blocks.map(block =>
        '<article class="compass-tile"><span class="compass-icon" aria-hidden="true">' + esc(block.icon) + '</span>' +
        '<span class="compass-when">' + esc(block.when) + '</span>' +
        '<strong>' + esc(block.title) + '</strong>' +
        '<small>' + esc(block.detail) + '</small></article>'
      ).join("") : '<p class="compass-empty">Pas de rendez-vous particulier prévu. Une journée à inventer.</p>') +
      '</div>' + extra;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }
})();