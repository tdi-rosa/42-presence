(() => {
  "use strict";

  const APP_VERSION = "2.4.2";
  const STATE_KEY = "dayflow_v1";
  const LEGACY_KEY = "presence42_v1";
  const MIGRATION_KEY = "dayflow_presence42_migrated_v1";
  const DAY_START = 7;
  const DAY_END = 23;
  const HOUR_HEIGHT = 72;
  const SLOT_MINUTES = 15;
  const WEEKLY_42_GOAL = 35;

  const CATEGORIES = {
    work42: { label: "42 / travail", color: "#2e8b75" },
    admin: { label: "Obligations / administratif", color: "#cd7a3b" },
    moving: { label: "Déménagement", color: "#8268a8" },
    daily: { label: "Vie quotidienne", color: "#527f9e" },
    social: { label: "Association / social", color: "#a5657d" },
    rest: { label: "Repos", color: "#767b80" }
  };

  const $ = id => document.getElementById(id);
  const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const fmtShort = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const fmtWeekday = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });

  let state = loadState();
  let selectedDate = startOfDay(new Date());
  let agendaView = "day";
  let currentScreen = "agenda";
  let installPrompt = null;
  let toastTimer = null;
  let updateTimer = null;
  let activeReviewEnergy = null;

  migrateLegacyPresence();
  seedProtectedMorningIfNeeded();
  saveState();

  init();

  function init() {
    fillCategorySelect();
    bindNavigation();
    bindAgendaControls();
    bindEventModal();
    bindReview();
    bindDataActions();
    bindInstallPrompt();
    renderCategoryLegend();
    registerServiceWorker();
    renderAll();
    setInterval(() => {
      if (currentScreen === "agenda") renderAgenda();
    }, 60000);
  }

  // ---------- state ----------

  function defaultState() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      events: [],
      occurrences: {},
      reviews: {},
      tracker: null,
      settings: { weekly42Goal: WEEKLY_42_GOAL }
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATE_KEY));
      if (!parsed || typeof parsed !== "object") return defaultState();
      if (!Array.isArray(parsed.events)) parsed.events = [];
      if (!parsed.occurrences || typeof parsed.occurrences !== "object") parsed.occurrences = {};
      if (!parsed.reviews || typeof parsed.reviews !== "object") parsed.reviews = {};
      if (!parsed.settings) parsed.settings = { weekly42Goal: WEEKLY_42_GOAL };
      if (!("tracker" in parsed)) parsed.tracker = null;
      return parsed;
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function seedProtectedMorningIfNeeded() {
    if (state.events.length > 0) return;
    const monday = startOfWeek(new Date());
    state.events.push({
      id: uid(),
      title: "42 — matinée protégée",
      category: "work42",
      date: dateKey(monday),
      start: "10:00",
      end: "13:30",
      recurrence: { type: "weekly", days: [1, 2, 3, 4, 5], startDate: dateKey(monday) },
      protected: true,
      note: "Socle de travail du matin. À déplacer seulement si une obligation l'impose.",
      createdAt: new Date().toISOString()
    });
  }

  function migrateLegacyPresence() {
    if (localStorage.getItem(MIGRATION_KEY)) return;
    let legacy;
    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    } catch {
      legacy = null;
    }

    if (legacy && Array.isArray(legacy.sessions)) {
      legacy.sessions.forEach(session => {
        if (!session || !session.start) return;
        const start = new Date(session.start);
        const end = session.end ? new Date(session.end) : null;
        if (!Number.isFinite(start.getTime()) || (end && !Number.isFinite(end.getTime()))) return;
        if (!end || end <= start) return;
        splitAcrossDays(start, end).forEach(part => {
          const event = {
            id: uid(),
            title: "42 — présence importée",
            category: "work42",
            date: dateKey(part.start),
            start: timeKey(part.start),
            end: timeKey(part.end),
            recurrence: null,
            protected: false,
            note: "Importé depuis 42 Présence.",
            createdAt: new Date().toISOString()
          };
          state.events.push(event);
          state.occurrences[instanceKey(event.id, event.date)] = {
            status: "done",
            actualStart: timeKey(part.start),
            actualEnd: timeKey(part.end)
          };
        });
      });
    }

    if (legacy && legacy.activeStart) {
      const start = new Date(legacy.activeStart);
      if (Number.isFinite(start.getTime()) && !state.tracker) {
        const today = startOfDay(new Date());
        const startDay = startOfDay(start);
        if (+today === +startDay) {
          const event = {
            id: uid(),
            title: "42 — session en cours",
            category: "work42",
            date: dateKey(start),
            start: timeKey(start),
            end: addMinutesToTime(timeKey(start), 60),
            recurrence: null,
            protected: false,
            note: "Session reprise depuis 42 Présence.",
            createdAt: new Date().toISOString()
          };
          state.events.push(event);
          const key = instanceKey(event.id, event.date);
          state.occurrences[key] = { status: "planned", actualStart: timeKey(start), actualEnd: null };
          state.tracker = { instanceKey: key, startedAt: start.toISOString(), eventId: event.id, date: event.date };
        }
      }
    }

    localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
  }

  // ---------- navigation ----------

  function bindNavigation() {
    document.querySelectorAll(".nav-button").forEach(button => {
      button.addEventListener("click", () => {
        setScreen(button.dataset.screen);
      });
    });
    $("todayButton").addEventListener("click", () => {
      selectedDate = startOfDay(new Date());
      setScreen("agenda");
      renderAll();
    });
  }

  function setScreen(name) {
    currentScreen = name;
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    document.querySelectorAll(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.screen === name));
    $("screenAgenda").classList.toggle("active", name === "agenda");
    $("screenReview").classList.toggle("active", name === "review");
    $("screenData").classList.toggle("active", name === "data");
    $("addEventButton").hidden = name !== "agenda";
    renderHeader();
    if (name === "review") renderReview();
    if (name === "data") renderData();
  }

  function renderHeader() {
    const title = $("pageTitle");
    const subtitle = $("pageSubtitle");
    if (currentScreen === "agenda") {
      title.textContent = isToday(selectedDate) ? "Aujourd’hui" : capitalize(fmtLong.format(selectedDate));
      subtitle.textContent = agendaView === "day" ? "Protéger le matin, organiser le reste." : weekRangeLabel(selectedDate);
    } else if (currentScreen === "review") {
      title.textContent = "Bilan du soir";
      subtitle.textContent = capitalize(fmtLong.format(selectedDate));
    } else {
      title.textContent = "Données";
      subtitle.textContent = "Suivi 42, sauvegarde et installation.";
    }
  }

  // ---------- agenda ----------

  function bindAgendaControls() {
    document.querySelectorAll(".segment").forEach(button => {
      button.addEventListener("click", () => {
        agendaView = button.dataset.view;
        document.querySelectorAll(".segment").forEach(b => b.classList.toggle("active", b === button));
        renderAgenda();
        renderHeader();
      });
    });

    $("prevDate").addEventListener("click", () => moveSelectedDate(agendaView === "week" ? -7 : -1));
    $("nextDate").addEventListener("click", () => moveSelectedDate(agendaView === "week" ? 7 : 1));
    $("dateChip").addEventListener("click", () => {
      selectedDate = startOfDay(new Date());
      renderAll();
    });
    $("addEventButton").addEventListener("click", () => openEventModal());
    $("trackerButton").addEventListener("click", toggleTracker);
  }

  function moveSelectedDate(days) {
    selectedDate = addDays(selectedDate, days);
    renderAll();
  }

  function renderAgenda() {
    const date = selectedDate;
    $("dateChip").textContent = agendaView === "day" ? shortDateChip(date) : `S${isoWeekNumber(date)}`;
    $("dayView").hidden = agendaView !== "day";
    $("weekView").hidden = agendaView !== "week";
    if (agendaView === "day") renderDay(date);
    else renderWeek(date);
    renderToday42Card();
    renderHeader();
    window.dispatchEvent(new CustomEvent("dayflow:agenda-render", {
      detail: { date: dateKey(date), view: agendaView }
    }));
  }

  function renderDay(date) {
    const container = $("dayView");
    const occurrences = occurrencesForDate(date);
    container.innerHTML = "";

    const timeline = document.createElement("div");
    timeline.className = "timeline";

    for (let hour = DAY_START; hour < DAY_END; hour += 1) {
      const row = document.createElement("div");
      row.className = "hour-row";
      row.style.top = `${(hour - DAY_START) * HOUR_HEIGHT}px`;
      const label = document.createElement("span");
      label.className = "hour-label";
      label.textContent = `${String(hour).padStart(2, "0")}:00`;
      row.appendChild(label);
      timeline.appendChild(row);
    }

    occurrences.forEach(occ => timeline.appendChild(buildDayEvent(occ)));

    if (isToday(date)) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const minStart = DAY_START * 60;
      const minEnd = DAY_END * 60;
      if (minutes >= minStart && minutes <= minEnd) {
        const line = document.createElement("div");
        line.className = "current-time-line";
        line.style.top = `${((minutes - minStart) / 60) * HOUR_HEIGHT}px`;
        timeline.appendChild(line);
      }
    }

    container.appendChild(timeline);
  }

  function buildDayEvent(occ) {
    const category = CATEGORIES[occ.category] || CATEGORIES.daily;
    const startMinutes = clamp(timeToMinutes(occ.start), DAY_START * 60, DAY_END * 60);
    let endMinutes = clamp(timeToMinutes(occ.end), DAY_START * 60, DAY_END * 60);
    if (endMinutes <= startMinutes) endMinutes = startMinutes + SLOT_MINUTES;
    const block = document.createElement("article");
    block.className = `event-block ${occ.protected ? "protected" : ""} ${occ.status || "planned"}`;
    block.style.setProperty("--event-color", category.color);
    block.style.top = `${((startMinutes - DAY_START * 60) / 60) * HOUR_HEIGHT + 2}px`;
    block.style.height = `${Math.max(32, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 4)}px`;
    block.dataset.instanceKey = occ.instanceKey;
    block.dataset.eventId = occ.id;

    const title = document.createElement("div");
    title.className = "event-title";
    title.textContent = occ.title;
    const meta = document.createElement("div");
    meta.className = "event-meta";
    meta.textContent = `${occ.start}–${occ.end}${occ.recurrence ? " · ↻" : ""}`;
    block.append(title, meta);

    if (occ.actualStart && occ.actualEnd) {
      const actual = document.createElement("span");
      actual.className = "event-actual";
      actual.textContent = `fait ${durationLabel(timeDurationMinutes(occ.actualStart, occ.actualEnd))}`;
      block.appendChild(actual);
    }

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.setAttribute("aria-label", `Déplacer ${occ.title}`);
    handle.textContent = "⋮⋮";
    block.appendChild(handle);

    block.addEventListener("click", event => {
      if (event.target.closest(".drag-handle")) return;
      openEventModal(occ);
    });
    enableDrag(block, handle, occ);
    return block;
  }

  function enableDrag(block, handle, occ) {
    handle.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      block.classList.add("dragging");
      const originY = event.clientY;
      const originalStart = timeToMinutes(occ.start);
      const originalEnd = timeToMinutes(occ.end);
      const duration = Math.max(SLOT_MINUTES, originalEnd - originalStart);
      let nextStart = originalStart;

      const move = moveEvent => {
        const deltaY = moveEvent.clientY - originY;
        const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / SLOT_MINUTES) * SLOT_MINUTES;
        nextStart = clamp(originalStart + deltaMinutes, DAY_START * 60, DAY_END * 60 - duration);
        const visualDelta = ((nextStart - originalStart) / 60) * HOUR_HEIGHT;
        block.style.transform = `translateY(${visualDelta}px)`;
        const meta = block.querySelector(".event-meta");
        meta.textContent = `${minutesToTime(nextStart)}–${minutesToTime(nextStart + duration)}${occ.recurrence ? " · ↻" : ""}`;
      };

      const finish = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", finish);
        handle.removeEventListener("pointercancel", finish);
        block.classList.remove("dragging");
        block.style.transform = "";
        if (nextStart !== originalStart) {
          setOccurrenceTime(occ, minutesToTime(nextStart), minutesToTime(nextStart + duration));
          saveState();
          renderAll();
          showToast(occ.recurrence ? "Ce jour a été déplacé, la série reste inchangée." : "Bloc déplacé.");
        } else {
          renderAgenda();
        }
      };

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", finish, { once: true });
      handle.addEventListener("pointercancel", finish, { once: true });
    });
  }

  function setOccurrenceTime(occ, start, end) {
    if (occ.recurrence) {
      const record = state.occurrences[occ.instanceKey] || {};
      state.occurrences[occ.instanceKey] = { ...record, overrideStart: start, overrideEnd: end };
    } else {
      const event = state.events.find(item => item.id === occ.id);
      if (event) {
        event.start = start;
        event.end = end;
      }
    }
  }

  function renderWeek(date) {
    const weekStart = startOfWeek(date);
    const strip = document.createElement("div");
    strip.className = "week-strip";

    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const occurrences = occurrencesForDate(day);
      const totals = totals42ForDate(day);
      const card = document.createElement("section");
      card.className = `week-day ${isToday(day) ? "today" : ""}`;
      const head = document.createElement("div");
      head.className = "week-day-head";
      head.innerHTML = `<span class="week-day-name">${escapeHtml(fmtWeekday.format(day))}</span><strong class="week-day-date">${day.getDate()}</strong><div class="week-day-total">42 : ${hoursLabel(totals.actual)} / ${hoursLabel(totals.planned)}</div>`;
      card.appendChild(head);

      occurrences.forEach(occ => {
        const category = CATEGORIES[occ.category] || CATEGORIES.daily;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "week-chip";
        chip.style.setProperty("--event-color", category.color);
        chip.innerHTML = `<strong>${escapeHtml(occ.title)}</strong><span>${occ.start}–${occ.end}${occ.status === "done" ? " · fait" : ""}</span>`;
        chip.addEventListener("click", () => {
          selectedDate = day;
          openEventModal(occ);
        });
        card.appendChild(chip);
      });
      strip.appendChild(card);
    }

    $("weekView").innerHTML = "";
    $("weekView").appendChild(strip);
  }

  function renderToday42Card() {
    const totals = totals42ForDate(selectedDate);
    $("planned42Today").textContent = hoursLabel(totals.planned);
    $("actual42Today").textContent = hoursLabel(totals.actual);
    const trackerButton = $("trackerButton");
    if (state.tracker) {
      const start = new Date(state.tracker.startedAt);
      trackerButton.textContent = `■ Terminer · ${timeKey(start)}`;
      trackerButton.classList.add("active");
    } else {
      trackerButton.textContent = "▶ 42 maintenant";
      trackerButton.classList.remove("active");
    }
  }

  // ---------- occurrences ----------

  function occurrencesForDate(date) {
    const key = dateKey(date);
    const day = date.getDay();
    const items = [];

    for (const event of state.events) {
      let matches = false;
      if (event.recurrence?.type === "weekly") {
        matches = event.recurrence.days.includes(day) && key >= event.recurrence.startDate;
      } else {
        matches = event.date === key;
      }
      if (!matches) continue;

      const instance = instanceKey(event.id, key);
      const record = state.occurrences[instance] || {};
      if (record.deleted) continue;
      const start = record.overrideStart || event.start;
      const end = record.overrideEnd || event.end;
      items.push({
        ...event,
        title: record.titleOverride || event.title,
        category: record.categoryOverride || event.category,
        protected: record.protectedOverride ?? event.protected,
        date: key,
        start,
        end,
        instanceKey: instance,
        status: record.status || "planned",
        actualStart: record.actualStart || null,
        actualEnd: record.actualEnd || null,
        occurrenceNote: record.note || ""
      });
    }

    return items.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }

  function totals42ForDate(date) {
    return occurrencesForDate(date)
      .filter(occ => occ.category === "work42")
      .reduce((acc, occ) => {
        acc.planned += timeDurationMinutes(occ.start, occ.end);
        if (occ.actualStart && occ.actualEnd) acc.actual += timeDurationMinutes(occ.actualStart, occ.actualEnd);
        else if (state.tracker?.instanceKey === occ.instanceKey && occ.actualStart) {
          const now = new Date();
          if (dateKey(now) === occ.date) acc.actual += Math.max(0, (now.getHours() * 60 + now.getMinutes()) - timeToMinutes(occ.actualStart));
        }
        return acc;
      }, { planned: 0, actual: 0 });
  }

  function totals42ForRange(start, endInclusive) {
    let planned = 0;
    let actual = 0;
    for (let cursor = startOfDay(start); cursor <= endInclusive; cursor = addDays(cursor, 1)) {
      const totals = totals42ForDate(cursor);
      planned += totals.planned;
      actual += totals.actual;
    }
    return { planned, actual };
  }

  // ---------- tracker ----------

  function toggleTracker() {
    if (state.tracker) stopTracker();
    else startTracker();
  }

  function startTracker() {
    const now = new Date();
    const todayKey = dateKey(now);
    selectedDate = startOfDay(now);
    let target = occurrencesForDate(now).find(occ => occ.category === "work42" && timeToMinutes(occ.start) <= now.getHours() * 60 + now.getMinutes() && timeToMinutes(occ.end) >= now.getHours() * 60 + now.getMinutes());

    if (!target) {
      const rounded = roundMinutes(now.getHours() * 60 + now.getMinutes(), 5);
      const event = {
        id: uid(),
        title: "42 — session libre",
        category: "work42",
        date: todayKey,
        start: minutesToTime(rounded),
        end: minutesToTime(Math.min(rounded + 60, 23 * 60 + 59)),
        recurrence: null,
        protected: false,
        note: "",
        createdAt: new Date().toISOString()
      };
      state.events.push(event);
      target = occurrencesForDate(now).find(occ => occ.id === event.id);
    }

    const record = state.occurrences[target.instanceKey] || {};
    state.occurrences[target.instanceKey] = { ...record, actualStart: timeKey(now), actualEnd: null, status: "planned" };
    state.tracker = { instanceKey: target.instanceKey, startedAt: now.toISOString(), eventId: target.id, date: todayKey };
    saveState();
    renderAll();
    showToast("Session 42 démarrée.");
  }

  function stopTracker() {
    const now = new Date();
    const tracker = state.tracker;
    if (!tracker) return;
    const record = state.occurrences[tracker.instanceKey] || {};
    state.occurrences[tracker.instanceKey] = { ...record, actualEnd: timeKey(now), status: "done" };

    const event = state.events.find(item => item.id === tracker.eventId);
    if (event && !event.recurrence && event.title === "42 — session libre") {
      event.end = timeKey(now);
    }

    state.tracker = null;
    saveState();
    renderAll();
    showToast("Session 42 enregistrée.");
  }

  // ---------- event modal ----------

  function fillCategorySelect() {
    $("eventCategory").innerHTML = Object.entries(CATEGORIES)
      .map(([value, data]) => `<option value="${value}">${escapeHtml(data.label)}</option>`)
      .join("");
  }

  function bindEventModal() {
    $("closeEventModal").addEventListener("click", closeEventModal);
    $("eventModalBackdrop").addEventListener("click", event => {
      if (event.target === $("eventModalBackdrop")) closeEventModal();
    });
    $("eventDone").addEventListener("change", syncActualFields);
    $("eventForm").addEventListener("submit", saveEventFromForm);
    $("deleteEventButton").addEventListener("click", deleteCurrentEvent);
  }

  function openEventModal(occ = null) {
    const form = $("eventForm");
    form.reset();
    $("eventId").value = occ?.id || "";
    $("eventInstanceKey").value = occ?.instanceKey || "";
    $("eventModalTitle").textContent = occ ? "Modifier le bloc" : "Nouveau bloc";
    $("deleteEventButton").hidden = !occ;
    $("seriesEditRow").hidden = !occ?.recurrence;
    $("editWholeSeries").checked = false;

    if (occ) {
      $("eventTitle").value = occ.title;
      $("eventCategory").value = occ.category;
      $("eventDate").value = occ.date;
      $("eventStart").value = occ.start;
      $("eventEnd").value = occ.end;
      $("eventRecurring").checked = Boolean(occ.recurrence);
      $("eventProtected").checked = Boolean(occ.protected);
      $("eventDone").checked = occ.status === "done";
      $("actualStart").value = occ.actualStart || occ.start;
      $("actualEnd").value = occ.actualEnd || occ.end;
      $("eventNote").value = occ.occurrenceNote || occ.note || "";
    } else {
      const baseStart = isToday(selectedDate) ? roundMinutes(new Date().getHours() * 60 + new Date().getMinutes(), 15) : 14 * 60;
      $("eventDate").value = dateKey(selectedDate);
      $("eventStart").value = minutesToTime(clamp(baseStart, DAY_START * 60, DAY_END * 60 - 60));
      $("eventEnd").value = minutesToTime(clamp(baseStart + 60, DAY_START * 60 + 60, DAY_END * 60));
      $("eventCategory").value = "daily";
    }
    syncActualFields();
    $("eventModalBackdrop").classList.add("open");
    $("eventModalBackdrop").setAttribute("aria-hidden", "false");
    setTimeout(() => $("eventTitle").focus(), 80);
  }

  function closeEventModal() {
    $("eventModalBackdrop").classList.remove("open");
    $("eventModalBackdrop").setAttribute("aria-hidden", "true");
  }

  function syncActualFields() {
    $("actualFields").hidden = !$("eventDone").checked;
    if ($("eventDone").checked) {
      if (!$("actualStart").value) $("actualStart").value = $("eventStart").value;
      if (!$("actualEnd").value) $("actualEnd").value = $("eventEnd").value;
    }
  }

  function saveEventFromForm(event) {
    event.preventDefault();
    const id = $("eventId").value;
    const instance = $("eventInstanceKey").value;
    const date = $("eventDate").value;
    const start = $("eventStart").value;
    const end = $("eventEnd").value;
    if (!date || !start || !end || timeToMinutes(end) <= timeToMinutes(start)) {
      showToast("La fin doit être après le début.");
      return;
    }

    if (!id) {
      const newEvent = {
        id: uid(),
        title: $("eventTitle").value.trim(),
        category: $("eventCategory").value,
        date,
        start,
        end,
        recurrence: $("eventRecurring").checked ? { type: "weekly", days: [parseDate(date).getDay()], startDate: date } : null,
        protected: $("eventProtected").checked,
        note: $("eventNote").value.trim(),
        createdAt: new Date().toISOString()
      };
      state.events.push(newEvent);
      const key = instanceKey(newEvent.id, date);
      if ($("eventDone").checked) {
        state.occurrences[key] = {
          status: "done",
          actualStart: $("actualStart").value || start,
          actualEnd: $("actualEnd").value || end
        };
      }
      selectedDate = parseDate(date);
    } else {
      const base = state.events.find(item => item.id === id);
      if (!base) return;
      const editSeries = Boolean(base.recurrence && $("editWholeSeries").checked);

      if (base.recurrence && !editSeries) {
        const originalDate = instance.split("@")[1] || date;
        const originalKey = instanceKey(id, originalDate);
        const record = state.occurrences[originalKey] || {};
        if (date !== originalDate) {
          state.occurrences[originalKey] = { ...record, deleted: true };
          const oneOff = {
            id: uid(),
            title: $("eventTitle").value.trim(),
            category: $("eventCategory").value,
            date,
            start,
            end,
            recurrence: $("eventRecurring").checked ? { type: "weekly", days: [parseDate(date).getDay()], startDate: date } : null,
            protected: $("eventProtected").checked,
            note: $("eventNote").value.trim(),
            createdAt: new Date().toISOString()
          };
          state.events.push(oneOff);
          const newKey = instanceKey(oneOff.id, date);
          state.occurrences[newKey] = occurrenceFormRecord(start, end);
        } else {
          state.occurrences[originalKey] = {
            ...record,
            overrideStart: start,
            overrideEnd: end,
            titleOverride: $("eventTitle").value.trim() !== base.title ? $("eventTitle").value.trim() : undefined,
            categoryOverride: $("eventCategory").value !== base.category ? $("eventCategory").value : undefined,
            protectedOverride: $("eventProtected").checked !== Boolean(base.protected) ? $("eventProtected").checked : undefined,
            note: $("eventNote").value.trim(),
            ...occurrenceFormRecord(start, end)
          };
        }
      } else {
        base.title = $("eventTitle").value.trim();
        base.category = $("eventCategory").value;
        base.start = start;
        base.end = end;
        base.protected = $("eventProtected").checked;
        base.note = $("eventNote").value.trim();
        if ($("eventRecurring").checked) {
          base.recurrence = base.recurrence || { type: "weekly", days: [parseDate(date).getDay()], startDate: date };
          if (editSeries) {
            base.recurrence.days = [parseDate(date).getDay()];
            base.recurrence.startDate = base.recurrence.startDate || date;
          }
        } else {
          base.recurrence = null;
          base.date = date;
        }
        const key = instance || instanceKey(base.id, date);
        state.occurrences[key] = { ...(state.occurrences[key] || {}), ...occurrenceFormRecord(start, end) };
      }
      selectedDate = parseDate(date);
    }

    saveState();
    closeEventModal();
    renderAll();
    showToast("Bloc enregistré.");
  }

  function occurrenceFormRecord(start, end) {
    if ($("eventDone").checked) {
      return {
        status: "done",
        actualStart: $("actualStart").value || start,
        actualEnd: $("actualEnd").value || end
      };
    }
    return { status: "planned", actualStart: null, actualEnd: null };
  }

  function deleteCurrentEvent() {
    const id = $("eventId").value;
    const instance = $("eventInstanceKey").value;
    const event = state.events.find(item => item.id === id);
    if (!event) return;

    if (event.recurrence && !$("editWholeSeries").checked) {
      state.occurrences[instance] = { ...(state.occurrences[instance] || {}), deleted: true };
    } else {
      state.events = state.events.filter(item => item.id !== id);
      Object.keys(state.occurrences).forEach(key => {
        if (key.startsWith(`${id}@`)) delete state.occurrences[key];
      });
      if (state.tracker?.eventId === id) state.tracker = null;
    }
    saveState();
    closeEventModal();
    renderAll();
    showToast(event.recurrence && !$("editWholeSeries").checked ? "Occurrence supprimée." : "Bloc supprimé.");
  }

  // ---------- review ----------

  function bindReview() {
    $("energyPicker").querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        activeReviewEnergy = Number(button.dataset.energy);
        renderEnergyPicker();
      });
    });
    $("reviewForm").addEventListener("submit", saveReview);
    $("copyTwoWeeks").addEventListener("click", copyTwoWeeks);
  }

  function renderReview() {
    const key = dateKey(selectedDate);
    const review = state.reviews[key] || {};
    const totals = totals42ForDate(selectedDate);
    $("reviewPlanned").textContent = hoursLabel(totals.planned);
    $("reviewActual").textContent = hoursLabel(totals.actual);
    activeReviewEnergy = review.energy ?? null;
    $("workedWell").value = review.workedWell || "";
    $("blockedBy").value = review.blockedBy || "";
    $("reviewNote").value = review.note || "";
    renderEnergyPicker();
    renderReviewHistory();
  }

  function renderEnergyPicker() {
    $("energyPicker").querySelectorAll("button").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.energy) === activeReviewEnergy);
    });
  }

  function saveReview(event) {
    event.preventDefault();
    const key = dateKey(selectedDate);
    state.reviews[key] = {
      energy: activeReviewEnergy,
      workedWell: $("workedWell").value.trim(),
      blockedBy: $("blockedBy").value.trim(),
      note: $("reviewNote").value.trim(),
      updatedAt: new Date().toISOString()
    };
    saveState();
    renderReviewHistory();
    showToast("Bilan enregistré.");
  }

  function renderReviewHistory() {
    const container = $("reviewHistory");
    container.innerHTML = "";
    const dates = Object.keys(state.reviews).sort().reverse().slice(0, 14);
    if (!dates.length) {
      container.innerHTML = `<div class="card review-card"><p style="margin:0">Tes bilans apparaîtront ici.</p></div>`;
      return;
    }
    dates.forEach(key => {
      const review = state.reviews[key];
      const date = parseDate(key);
      const totals = totals42ForDate(date);
      const card = document.createElement("article");
      card.className = "card review-card";
      const details = [review.workedWell && `✓ ${review.workedWell}`, review.blockedBy && `→ ${review.blockedBy}`].filter(Boolean).join(" · ");
      card.innerHTML = `<div class="review-card-head"><strong>${escapeHtml(capitalize(fmtShort.format(date)))}</strong><span>énergie ${review.energy ?? "—"}/5 · 42 ${hoursLabel(totals.actual)}</span></div>${details ? `<p>${escapeHtml(details)}</p>` : ""}`;
      container.appendChild(card);
    });
  }

  async function copyTwoWeeks() {
    const payload = buildTwoWeekPayload();
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      showToast("Les 14 derniers jours sont copiés pour ChatGPT.");
    } catch {
      downloadJson(`dayflow-14-jours-${dateKey(new Date())}.json`, payload);
      showToast("Export 14 jours téléchargé.");
    }
  }

  function buildTwoWeekPayload() {
    const end = startOfDay(selectedDate);
    const start = addDays(end, -13);
    const days = [];
    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
      const occurrences = occurrencesForDate(cursor);
      days.push({
        date: dateKey(cursor),
        totals42: totals42ForDate(cursor),
        events: occurrences.map(occ => ({
          title: occ.title,
          category: occ.category,
          planned: { start: occ.start, end: occ.end },
          status: occ.status,
          actual: occ.actualStart && occ.actualEnd ? { start: occ.actualStart, end: occ.actualEnd } : null
        })),
        review: state.reviews[dateKey(cursor)] || null
      });
    }
    return {
      schema: "dayflow-analysis-v1",
      generatedAt: new Date().toISOString(),
      period: { start: dateKey(start), end: dateKey(end) },
      days
    };
  }

  // ---------- data ----------

  function bindDataActions() {
    $("exportButton").addEventListener("click", () => downloadJson(`dayflow-backup-${dateKey(new Date())}.json`, { schema: "dayflow-backup-v1", exportedAt: new Date().toISOString(), state }));
    $("importButton").addEventListener("click", () => $("importInput").click());
    $("importInput").addEventListener("change", importBackup);
    $("checkUpdateButton").addEventListener("click", () => checkForUpdate(true));
    $("installButton").addEventListener("click", installApp);
  }

  function renderData() {
    const start = startOfWeek(selectedDate);
    const end = addDays(start, 6);
    const totals = totals42ForRange(start, end);
    $("weekActual").textContent = hoursLabel(totals.actual);
    $("weekPlanned").textContent = `${hoursLabel(totals.planned)} prévu`;
    const goal = (state.settings?.weekly42Goal || WEEKLY_42_GOAL) * 60;
    $("weekProgress").style.width = `${Math.min(100, (totals.actual / goal) * 100)}%`;
    $("versionLine").textContent = `Dayflow ${APP_VERSION} · données locales sur cet appareil`;
  }

  function renderCategoryLegend() {
    $("categoryLegend").innerHTML = Object.values(CATEGORIES)
      .map(category => `<div class="category-item" style="--event-color:${category.color}"><span class="category-dot"></span>${escapeHtml(category.label)}</div>`)
      .join("");
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const imported = parsed.state || parsed;
        if (!imported || !Array.isArray(imported.events) || typeof imported.reviews !== "object") throw new Error("invalid");
        state = imported;
        saveState();
        renderAll();
        showToast("Sauvegarde importée.");
      } catch {
        showToast("Ce fichier n’est pas une sauvegarde Dayflow valide.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- install + update ----------

  function bindInstallPrompt() {
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      installPrompt = event;
      $("installRow").hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      installPrompt = null;
      $("installRow").hidden = true;
      showToast("Dayflow est installé.");
    });
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      $("updateStatus").textContent = "Service worker non pris en charge par ce navigateur.";
      return;
    }
    try {
      const hadController = Boolean(navigator.serviceWorker.controller);
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`);
      $("updateStatus").textContent = navigator.onLine ? "À jour · vérification automatique active." : "Hors ligne · la version locale reste disponible.";

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController) return;
        if (sessionStorage.getItem("dayflow_reloaded_for_update") === APP_VERSION) return;
        sessionStorage.setItem("dayflow_reloaded_for_update", APP_VERSION);
        window.location.reload();
      });

      const check = () => registration.update().catch(() => {});
      window.addEventListener("online", check);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && navigator.onLine) check();
      });
      updateTimer = setInterval(() => {
        if (document.visibilityState === "visible" && navigator.onLine) check();
      }, 5 * 60 * 1000);
    } catch {
      $("updateStatus").textContent = "La mise à jour automatique n’a pas pu être activée.";
    }
  }

  async function checkForUpdate(manual = false) {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;
      $("updateStatus").textContent = "Vérification…";
      await registration.update();
      $("updateStatus").textContent = "À jour · vérification automatique active.";
      if (manual) showToast("Vérification terminée.");
    } catch {
      $("updateStatus").textContent = navigator.onLine ? "Vérification impossible pour le moment." : "Hors ligne · impossible de vérifier.";
    }
  }

  // ---------- render ----------

  function renderAll() {
    renderHeader();
    renderAgenda();
    if (currentScreen === "review") renderReview();
    if (currentScreen === "data") renderData();
  }

  // ---------- helpers ----------

  function uid() {
    return crypto?.randomUUID?.() || `df_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function instanceKey(eventId, date) { return `${eventId}@${date}`; }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function startOfWeek(date) {
    const d = startOfDay(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d;
  }

  function addDays(date, count) {
    const d = new Date(date);
    d.setDate(d.getDate() + count);
    return startOfDay(d);
  }

  function dateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function timeKey(date) {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function parseDate(value) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  function timeToMinutes(time) {
    if (!time || !time.includes(":")) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  function minutesToTime(minutes) {
    const safe = clamp(Math.round(minutes), 0, 23 * 60 + 59);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function addMinutesToTime(time, delta) { return minutesToTime(timeToMinutes(time) + delta); }
  function timeDurationMinutes(start, end) { return Math.max(0, timeToMinutes(end) - timeToMinutes(start)); }
  function roundMinutes(minutes, step) { return Math.round(minutes / step) * step; }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function hoursLabel(minutes) {
    if (!minutes) return "0 h";
    const hours = minutes / 60;
    return `${hours.toFixed(hours % 1 === 0 ? 0 : 1).replace(".", ",")} h`;
  }

  function durationLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m} min`;
    if (!m) return `${h} h`;
    return `${h} h ${m}`;
  }

  function isToday(date) { return dateKey(date) === dateKey(new Date()); }
  function capitalize(text) { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
  function shortDateChip(date) { return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`; }
  function weekRangeLabel(date) {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    return `Semaine du ${start.getDate()} au ${end.getDate()} ${new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(end)}`;
  }

  function isoWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function splitAcrossDays(start, end) {
    const parts = [];
    let cursor = new Date(start);
    while (cursor < end) {
      const nextMidnight = startOfDay(addDays(cursor, 1));
      const partEnd = end < nextMidnight ? end : nextMidnight;
      const displayEnd = +partEnd === +nextMidnight ? new Date(partEnd.getTime() - 60000) : partEnd;
      parts.push({ start: new Date(cursor), end: displayEnd });
      cursor = new Date(partEnd);
    }
    return parts;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
})();
