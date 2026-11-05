(() => {
  "use strict";
  // Import doux : respecte les saisies de l'utilisateur dans localStorage.
  const STATE_KEY = "dayflow_v1";
  const UPDATE_KEY = "dayflow_2026_11_05_review_v1";
  if (localStorage.getItem(UPDATE_KEY)) return;
  let state;
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)); } catch { state = null; }
  if (!state || typeof state !== "object") return;
  if (!Array.isArray(state.events)) state.events = [];
  if (!state.occurrences || typeof state.occurrences !== "object") state.occurrences = {};
  if (!state.reviews || typeof state.reviews !== "object") state.reviews = {};
  if (!Array.isArray(state.alerts)) state.alerts = [];
  const date = "2026-11-05";
  const now = new Date().toISOString();
  const matchesDate = event => {
    if (!event) return false;
    if (event.recurrence?.type === "weekly") {
      return (event.recurrence.days || []).includes(4) && date >= event.recurrence.startDate;
    }
    return event.date === date;
  };
  const sessions = state.events.filter(event =>
    event.category === "work42" && matchesDate(event) &&
    !state.occurrences[event.id + "@" + date]?.deleted
  );
  const alreadyRecorded = sessions.some(event => {
    const o = state.occurrences[event.id + "@" + date] || {};
    return Boolean(o.actualStart && o.actualEnd);
  });
  if (!alreadyRecorded) {
    let target = sessions.find(event => event.start === "10:00") || sessions[0];
    if (!target) {
      target = {
        id: "dayflow-presence-2026-11-05",
        title: "42 — Hansar Protocol",
        category: "work42",
        date,
        start: "10:00",
        end: "14:00",
        recurrence: null,
        protected: false,
        note: "Présence communiquée pour le jeudi 5 novembre.",
        createdAt: now
      };
      state.events.push(target);
    }
    const key = target.id + "@" + date;
    state.occurrences[key] = {
      ...state.occurrences[key],
      status: "done",
      actualStart: "10:00",
      actualEnd: "14:00"
    };
  }

  // Les activités sont faites, même quand leur horaire réel est inconnu.
  for (const [id, note] of [
    ["seed-sport-3", "Course effectuée le 5 novembre ; horaire exact non renseigné."],
    ["seed-moving-3", "Meubles à démonter démontés. Rangement et nettoyage restants (environ 3 à 4 jours). Ascenseur en panne : camion en attente."]
  ]) {
    const event = state.events.find(item => item.id === id);
    if (!event) continue;
    const key = id + "@" + date;
    if (!state.occurrences[key]?.deleted) {
      state.occurrences[key] = {
        ...state.occurrences[key],
        status: "done",
        note: state.occurrences[key]?.note || note
      };
    }
  }

  // ASR de samedi : seul rendez-vous dont l'horaire est explicitement connu.
  if (!state.events.some(e => e.id === "dayflow-asr-2026-11-07" ||
      (e.date === "2026-11-07" && /ASR/i.test(e.title || "")))) {
    state.events.push({
      id: "dayflow-asr-2026-11-07",
      title: "ASR — journée associative",
      category: "social",
      date: "2026-11-07",
      start: "09:00",
      end: "18:00",
      recurrence: null,
      protected: true,
      note: "ASR de Narcotiques Anonymes annoncée de 9 h à 18 h.",
      createdAt: now
    });
  }

  const gel = state.alerts.find(a => a.id === "alert-shower-gel-2026-11-01");
  if (gel) {
    gel.done = true;
    gel.doneAt = gel.doneAt || now;
    gel.detail = "Achat confirmé le 5 novembre (effectué quelques jours plus tôt).";
  }
  const free = state.alerts.find(a => a.id === "alert-freebox-cancellation-2026-11-05");
  if (free) {
    free.done = true;
    free.doneAt = free.doneAt || now;
    free.completedDate = date;
    free.detail = "Lettre recommandée de résiliation envoyée jeudi 5 novembre. Résiliation non encore confirmée.";
  }
  if (!state.alerts.some(a => a.id === "alert-freebox-followup-2026-11-05")) {
    state.alerts.push({
      id: "alert-freebox-followup-2026-11-05",
      title: "Suivre la résiliation Freebox",
      detail: "Recommandé envoyé le 5 novembre. Attendre la confirmation et vérifier les modalités de retour de la box.",
      symbol: "!",
      priority: "high",
      done: false,
      createdAt: now
    });
  }
  if (!state.alerts.some(a => a.id === "alert-elevator-followup-2026-11-06")) {
    state.alerts.push({
      id: "alert-elevator-followup-2026-11-06",
      title: "Rappeler pour l'ascenseur",
      detail: "Demander une date de réparation avant de fixer le camion du déménagement.",
      symbol: "!",
      priority: "high",
      done: false,
      createdAt: now
    });
  }

  const existing = state.reviews[date] || {};
  if (!existing.journal) {
    const journal = {
      version: 1,
      kicker: "Bilan du jeudi",
      title: "Une journée complète et des perspectives à construire",
      dateLabel: "5 novembre 2026",
      summary: "Course, quatre heures à 42 de 10 h à 14 h, progrès sur Hansar Protocol, meubles démontés pour le déménagement, courrier recommandé Free envoyé et gros curry cuisiné : les principales choses prévues ont avancé. La soirée a aussi ouvert une réflexion importante sur la façon de créer de la valeur et de gagner sa vie grâce à l'informatique.",
      moments: [
        { symbol: "⌘", title: "42 · 10 h–14 h", text: "Quatre heures de présence. Fonction Execute reconstruite ; Handle et Reply désormais beaucoup plus claires. Objectif suivant : consolider la première partie du serveur avant de s'attaquer à Run." },
        { symbol: "↗", title: "Course et repas maison", text: "Tu es encore allé courir et tu as préparé plusieurs portions d'un gros curry." },
        { symbol: "◫", title: "Déménagement", text: "Meubles à démonter terminés ; il reste environ trois à quatre jours de rangement et de nettoyage. Le camion attend la réparation de l'ascenseur." },
        { symbol: "✓", title: "Freebox", text: "Lettre recommandée de résiliation envoyée. Attendre la confirmation ; retour du matériel et éventuels frais encore à clarifier." },
        { symbol: "◇", title: "Perspective professionnelle", text: "Envie de créer une vraie utilité sociale avec le logiciel, tout en en vivant. Besoin d'une meilleure vue du secteur, de rencontres et de pistes concrètes autour des systèmes et de l'open source." }
      ],
      followUps: [
        "Vendredi 6 : terminer de consolider Execute, Handle et Reply ; ensuite seulement aborder Run par blocs.",
        "Continuer nettoyage et rangement ; rappeler la gestion de l'immeuble pour l'ascenseur.",
        "Suivre la réponse de Free à la lettre recommandée, sans considérer la résiliation déjà effective.",
        "Samedi 7 : ASR de 9 h à 18 h.",
        "À explorer sans pression : lire Grokking Algorithms, découvrir des projets open source concrets et rencontrer des développeurs partageant ces valeurs."
      ],
      closing: "Les objectifs concrets du quotidien avancent. Pour les questions de métier et de sens, la prochaine étape est d'explorer des milieux et des projets réels plutôt que de devoir déjà connaître la réponse."
    };
    state.reviews[date] = {
      ...existing,
      energy: existing.energy ?? null,
      workedWell: existing.workedWell || "Course, 42 de 10 h à 14 h, Hansar Protocol, meubles démontés, recommandé Free envoyé et gros curry préparé.",
      blockedBy: existing.blockedBy || "Ascenseur en panne : camion bloqué ; incertitude sur l'avenir professionnel et sur les pistes de création de valeur.",
      note: existing.note || "Demain : Hansar Protocol et suite du rangement/nettoyage. Samedi : ASR 9 h–18 h. Explorer plus tard open source, lecture sur les graphes, rencontres et pistes professionnelles.",
      journal,
      updatedAt: now
    };
  }
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  localStorage.setItem(UPDATE_KEY, now);
})();