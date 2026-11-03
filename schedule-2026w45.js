(() => {
  "use strict";

  const STATE_KEY = "dayflow_v1";
  const MIGRATION_KEY = "dayflow_schedule_2026w45_v1";

  if (localStorage.getItem(MIGRATION_KEY)) { seedFiberSlot(); return; }

  let state;
  try {
    state = JSON.parse(localStorage.getItem(STATE_KEY));
  } catch {
    state = null;
  }

  if (!state || typeof state !== "object") {
    state = {
      version: 1,
      createdAt: new Date().toISOString(),
      events: [],
      occurrences: {},
      reviews: {},
      tracker: null,
      settings: { weekly42Goal: 35 }
    };
  }

  if (!Array.isArray(state.events)) state.events = [];
  if (!state.occurrences || typeof state.occurrences !== "object") state.occurrences = {};
  if (!state.reviews || typeof state.reviews !== "object") state.reviews = {};
  if (!state.settings) state.settings = { weekly42Goal: 35 };
  if (!("tracker" in state)) state.tracker = null;

  const createdAt = new Date().toISOString();

  const hasEvent = (title, date, start) => state.events.some(event =>
    event && event.title === title && event.date === date && event.start === start
  );

  const addOneOff = ({ id, title, category, date, start, end, note = "", protected: isProtected = false }) => {
    if (hasEvent(title, date, start)) return;
    state.events.push({
      id,
      title,
      category,
      date,
      start,
      end,
      recurrence: null,
      protected: isProtected,
      note,
      createdAt
    });
  };

  const alreadyHasMorning42 = state.events.some(event =>
    event && event.category === "work42" && event.start === "10:00" && event.end === "13:30" && event.recurrence
  );

  if (!alreadyHasMorning42) {
    state.events.push({
      id: "seed-42-morning-2026w45",
      title: "42 — matinée protégée",
      category: "work42",
      date: "2026-11-02",
      start: "10:00",
      end: "13:30",
      recurrence: { type: "weekly", days: [1, 2, 3, 4, 5], startDate: "2026-11-02" },
      protected: true,
      note: "Socle de travail du matin. À déplacer seulement si une obligation l'impose.",
      createdAt
    });
  }

  ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"].forEach((date, index) => {
    addOneOff({
      id: `seed-sport-${index}`,
      title: "Sport / course",
      category: "daily",
      date,
      start: "08:30",
      end: "09:15",
      note: "Petit sport du matin avant 42."
    });
    addOneOff({
      id: `seed-lunch-${index}`,
      title: "Déjeuner / pause",
      category: "daily",
      date,
      start: "13:30",
      end: "14:30"
    });
    addOneOff({
      id: `seed-moving-${index}`,
      title: "Déménagement — Pannevayot",
      category: "moving",
      date,
      start: "14:30",
      end: "17:00",
      note: "Bloc flexible de l'après-midi."
    });
  });

  addOneOff({
    id: "seed-rp-2026-11-03",
    title: "Réunion — Révolution Permanente",
    category: "social",
    date: "2026-11-03",
    start: "19:00",
    end: "20:30",
    note: "Heure de début confirmée. Durée ajustable dans Dayflow."
  });

  addOneOff({
    id: "seed-na-2026-11-04",
    title: "Réunion — Narcotiques Anonymes avec Marie-Laure",
    category: "social",
    date: "2026-11-04",
    start: "18:30",
    end: "20:00",
    note: "Heure de début confirmée. Durée ajustable dans Dayflow."
  });

  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  localStorage.setItem(MIGRATION_KEY, createdAt);
  seedFiberSlot();

  function seedFiberSlot() {
    const fiberKey = "dayflow_fiber_2026_11_04_14_16_v1";
    if (localStorage.getItem(fiberKey)) return;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(STATE_KEY)); } catch { saved = null; }
    if (!saved || !Array.isArray(saved.events)) return;

    const exists = saved.events.some(e => e?.date === "2026-11-04"
      && /fibre|technicien.*free|free.*technicien/i.test(e.title || ""));
    if (!exists) {
      saved.events.push({
        id: "seed-fiber-technician-2026-11-04",
        title: "Technicien fibre — nouvel appartement",
        category: "admin",
        date: "2026-11-04",
        start: "14:00",
        end: "16:00",
        recurrence: null,
        protected: true,
        note: "Créneau d'intervention communiqué : entre 14 h et 16 h. Être sur place pendant tout le créneau. Box Free déjà récupérée.",
        createdAt: new Date().toISOString()
      });
    }
    localStorage.setItem(STATE_KEY, JSON.stringify(saved));
    localStorage.setItem(fiberKey, new Date().toISOString());
  }
})();
