(() => {
  "use strict";

  const STATE_KEY = "dayflow_v1";
  const REVIEW_DATE = "2026-11-02";

  const journal = {
    version: 1,
    title: "Une grosse journée, sans finir vidé",
    summary: "La journée a été très chargée, mais elle s’est bien déroulée : sport le matin, vrai progrès sur le projet Go, déménagement poursuivi, box Free récupérée et une situation familiale qui semble s’apaiser. Le signal le plus encourageant : tu rentres tard tout en te sentant encore en forme.",
    moments: [
      {
        symbol: "↗",
        title: "Rythme du matin",
        text: "Tu t’es réveillé assez tôt, tu es allé courir et tu as commencé l’école autour de 9 h 30–10 h. Le socle du matin fonctionne."
      },
      {
        symbol: "⌘",
        title: "Go",
        text: "Tu as terminé de recopier le tutoriel, puis tu as passé du temps à comprendre et schématiser les différentes portions de code. Tu as maintenant une vue d’ensemble et un organigramme complet ; la prochaine étape est de reconstruire progressivement sans recopier."
      },
      {
        symbol: "↗",
        title: "Déménagement",
        text: "Tu as continué le déménagement et gardé le momentum lancé la veille. Il reste du travail, mais le chantier avance concrètement."
      },
      {
        symbol: "♡",
        title: "Famille",
        text: "Ta mère t’a dit que la situation s’arrange de son côté et qu’elle fait davantage attention à ses comptes. C’est un poids qui semble commencer à diminuer."
      },
      {
        symbol: "✓",
        title: "Box Free",
        text: "Tu es bien allé récupérer la box Free avant le passage du technicien fibre mercredi. Cette alerte peut être considérée comme faite."
      },
      {
        symbol: "✉",
        title: "Candidatures",
        text: "Pas de réponse notable aujourd’hui. Rien à relancer ce soir : un seul contrôle demain suffit."
      },
      {
        symbol: "●",
        title: "Énergie",
        text: "Environ 7 h ont été enregistrées à l’école, avec des pauses comprises. Malgré une journée longue et chargée, tu ne te sens pas fatigué et tu rentres encore en forme."
      }
    ],
    followUps: [
      "Go : passer de la compréhension à la reconstruction — refaire les parties importantes sans recopier, puis vérifier avec l’organigramme.",
      "Abandonner l’idée de l’outil de captures d’écran pour l’instant : les échanges écrits avec ChatGPT à l’école sont déjà suffisamment efficaces.",
      "Regarder une seule fois demain s’il y a des réponses aux candidatures, sans surveillance continue.",
      "Continuer le déménagement à partir de 14 h 30 sans casser le bon rythme du matin."
    ],
    closing: "Le système commence à fonctionner : matin utile, progrès réel, obligations avancées — sans finir la journée vidé.",
    dateLabel: "2 novembre 2026",
    kicker: "Bilan du lundi"
  };


  const REVIEW_DATE_LATEST = "2026-11-03";
  const journalNov3 = {
    "version": 1,
    "title": "La compréhension devient de l’autonomie",
    "summary": "Une journée d’apprentissage solide : course avant le travail, premières portions du projet Go refaites de mémoire, puis une longue réunion riche en réflexions sur le métier de développeur. Le déménagement a été reporté à cause de la météo et du temps disponible, sans que cela annule les progrès du jour.",
    "moments": [
      {
        "symbol": "↗",
        "title": "Course et matinée 42",
        "text": "Course vers 9 h, puis travail à l’école jusqu’à environ 13–14 h. Le rythme du matin se confirme."
      },
      {
        "symbol": "⌘",
        "title": "Go : mémoire et compréhension",
        "text": "Tu as réécrit une partie du programme et constaté que tu retenais la logique et l’implémentation. La fonction run de server.go reste intimidante, mais tu sais désormais qu’un découpage en petits blocs peut aider."
      },
      {
        "symbol": "◷",
        "title": "Déménagement reporté",
        "text": "La météo, la tombée de la nuit et la réunion du soir ont rendu le déménagement peu pratique. À reprendre mercredi, sans considérer ce report comme un échec."
      },
      {
        "symbol": "✧",
        "title": "Une idée de jeu à conserver",
        "text": "Après Hansar Protocol, explorer un petit jeu personnel à l’esthétique sombre inspirée de Fear and Hunger, suffisamment abouti pour figurer dans un portfolio artistique."
      },
      {
        "symbol": "◎",
        "title": "Conditions de travail dans la tech",
        "text": "La réunion du soir a suscité une réflexion sur l’emploi des développeurs, les transformations liées à l’IA et les relations de travail. Une piste à creuser plutôt qu’une conclusion définitive."
      },
      {
        "symbol": "◇",
        "title": "Open source et graphes",
        "text": "Explorer comment contribuer à l’open source pour participer plus directement au progrès technique. Les algorithmes de graphes peuvent rester une activité secondaire quand le projet principal devient trop prenant."
      }
    ],
    "followUps": [
      "Go : attaquer run dans server.go par petits blocs, en s’aidant de l’organigramme et en testant la mémoire sans se forcer à tout reconstruire d’un coup.",
      "Déménagement : essayer de poursuivre mercredi 4 novembre si les conditions s’y prêtent.",
      "Hansar Protocol : garder l’idée d’un petit jeu à l’esthétique Fear and Hunger pour le portfolio, sans ouvrir immédiatement un projet trop ambitieux.",
      "Open source : identifier un projet et une première contribution réaliste, à explorer plus tard.",
      "Algorithmes de graphes : conserver cette curiosité comme respiration entre deux séances de travail principales."
    ],
    "closing": "Tu ne fais plus seulement suivre un tutoriel : tu commences à retrouver le code par toi-même. C’est le progrès essentiel du jour.",
    "dateLabel": "3 novembre 2026",
    "kicker": "Bilan du mardi"
  };

  const journalNov4 = {
    version: 2,
    title: "Une journée positive, consacrée aussi à NA",
    summary: "La journée s’est bien passée. Tu as un peu avancé sur Hansar Protocol, même si ce n’était pas une grosse séance. Le travail pour Narcotiques Anonymes a occupé une bonne partie de l’après-midi, et le rendez-vous s’est très bien déroulé. Le déménagement n’a pas pu avancer aujourd’hui. Le technicien fibre est passé, mais le raccordement n’a pas pu être réalisé.",
    moments: [
      { symbol: "⌘", title: "Hansar Protocol", text: "Un peu de temps consacré au projet, sans progression massive aujourd’hui. Tu souhaites lui réserver une vraie séance demain." },
      { symbol: "◎", title: "Narcotiques Anonymes", text: "Rendez-vous très positif. Les préparatifs et le travail liés à NA ont pris une bonne partie de l’après-midi." },
      { symbol: "◫", title: "Déménagement à reprendre", text: "Tu n’as pas eu le temps d’aller à l’appartement pour avancer le déménagement. Tu souhaites le poursuivre jeudi." },
      { symbol: "♡", title: "Prendre soin du quotidien", text: "Tu aimerais retrouver une alimentation plus satisfaisante en prenant le temps de préparer un bon curry maison demain." },
      { symbol: "!", title: "Fibre : installation impossible", text: "Le technicien est bien intervenu mercredi 4 novembre, mais n’a pas réussi à raccorder la fibre. Tu envisages de résilier la Freebox : la connexion de ton téléphone semble te suffire à domicile." }
    ],
    followUps: [
      "Jeudi 5 novembre : consacrer un vrai bloc de travail à Hansar Protocol, sans chercher à tout terminer.",
      "Poursuivre le déménagement si le temps disponible le permet.",
      "Préparer un curry nourrissant, avec l’idée de manger mieux et éventuellement d’avoir des portions pour les prochains jours.",
      "Freebox : récupérer le compte rendu de l’échec de raccordement, appeler le 3244 et demander une résiliation sans frais avant de valider une procédure standard."
    ],
    closing: "Le temps consacré à NA n’était pas du temps perdu : tu as avancé sur un engagement important. Demain, tu peux recentrer la journée sur Hansar Protocol, le déménagement et un repas maison.",
    dateLabel: "4 novembre 2026",
    kicker: "Bilan du mercredi"
  };
  let currentJournalDate = "2026-11-05";

  seedReview();
  seedLatestReview();
  seedNov4Review();
  renderJournal();
  decorateHistoryHeading();

  document.querySelectorAll('.nav-button[data-screen="review"]').forEach(button => {
    button.addEventListener("click", () => setTimeout(renderJournal, 0));
  });

  function seedReview() {
    let state;
    try {
      state = JSON.parse(localStorage.getItem(STATE_KEY));
    } catch {
      state = null;
    }

    if (!state || typeof state !== "object") return;
    if (!state.reviews || typeof state.reviews !== "object") state.reviews = {};

    const existing = state.reviews[REVIEW_DATE] || {};
    if (existing.journal?.version === journal.version) return;

    state.reviews[REVIEW_DATE] = {
      ...existing,
      energy: existing.energy ?? null,
      workedWell: existing.workedWell || "Très bonne journée : course le matin, vrai progrès de compréhension sur le projet Go, déménagement poursuivi, box Free récupérée et bonne énergie malgré une journée longue.",
      blockedBy: existing.blockedBy || "Pas de blocage majeur aujourd’hui. Pas encore de réponse côté emploi ; l’enjeu est surtout de ne pas transformer l’attente en vérification compulsive.",
      note: existing.note || "À suivre : refaire le Go sans recopier, continuer le déménagement, vérifier les candidatures une seule fois demain. L’outil de captures d’écran est mis de côté car il semble inutilement complexe.",
      journal,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function renderJournal() {
    const screen = document.getElementById("screenReview");
    if (!screen) return;

    let state;
    try {
      state = JSON.parse(localStorage.getItem(STATE_KEY));
    } catch {
      state = null;
    }

    const review = state?.reviews?.[currentJournalDate];
    const data = review?.journal;
    if (!data) return;

    let card = document.getElementById("journalCard");
    if (!card) {
      card = document.createElement("section");
      card.id = "journalCard";
      card.className = "journal-card";
      screen.insertBefore(card, screen.firstChild);
    }

    const moments = (data.moments || []).map(item => `
      <div class="journal-moment">
        <div class="journal-symbol" aria-hidden="true">${escapeHtml(item.symbol)}</div>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </div>
    `).join("");

    const followUps = (data.followUps || []).map(item => `
      <div class="followup-item">
        <span aria-hidden="true">→</span>
        <span>${escapeHtml(item)}</span>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="journal-kicker">${escapeHtml(data.kicker || "Bilan du jour")}</div>
      <h2 class="journal-title">${escapeHtml(data.title)}</h2>
      <p class="journal-lead">${escapeHtml(data.summary)}</p>
      <div class="journal-moments">${moments}</div>
      <div class="followup-card">
        <h3>À suivre</h3>
        <div class="followup-list">${followUps}</div>
      </div>
      <p class="journal-closing">${escapeHtml(data.closing)}</p>
      <p class="journal-date">${escapeHtml(data.dateLabel || currentJournalDate)}</p>
    `;

    const nav = document.createElement("div");
    nav.className = "journal-navigation";
    [["2026-11-05", "Jeu. 5"], ["2026-11-04", "Mer. 4"], ["2026-11-03", "Mar. 3"], ["2026-11-02", "Lun. 2"]].forEach(([date, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.className = "journal-day-button" + (currentJournalDate === date ? " active" : "");
      button.setAttribute("aria-pressed", String(currentJournalDate === date));
      button.addEventListener("click", () => { currentJournalDate = date; renderJournal(); });
      nav.appendChild(button);
    });
    card.prepend(nav);
  }

  function seedLatestReview() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STATE_KEY)); } catch { state = null; }
    if (!state || typeof state !== "object") return;
    if (!state.reviews || typeof state.reviews !== "object") state.reviews = {};
    const existing = state.reviews[REVIEW_DATE_LATEST] || {};
    if (existing.journal?.version === journalNov3.version) return;
    state.reviews[REVIEW_DATE_LATEST] = {
      ...existing,
      energy: existing.energy ?? null,
      workedWell: existing.workedWell || "Course et bonne matinée à 42 ; premières portions de Go reconstruites de mémoire ; échanges enrichissants le soir.",
      blockedBy: existing.blockedBy || "Déménagement reporté en raison de la météo et du rendez-vous du soir. La fonction run de server.go demande encore un découpage progressif.",
      note: existing.note || "À suivre : travailler run par petites parties, reprendre le déménagement mercredi, conserver les pistes Hansar Protocol (jeu de portfolio), open source et algorithmes de graphes.",
      journal: journalNov3,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }


  function seedNov4Review() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STATE_KEY)); } catch { state = null; }
    if (!state || typeof state !== "object") return;
    if (!state.reviews || typeof state.reviews !== "object") state.reviews = {};
    const existing = state.reviews["2026-11-04"] || {};
    if (existing.journal?.version === journalNov4.version) return;
    state.reviews["2026-11-04"] = {
      ...existing,
      energy: existing.energy ?? null,
      workedWell: existing.workedWell || "Journée globalement positive : un peu de Hansar Protocol, un rendez-vous NA qui s’est très bien passé et du travail pour NA l’après-midi.",
      blockedBy: existing.blockedBy || "Pas eu le temps d’aller à l’appartement pour le déménagement.",
      note: existing.note || "Pour jeudi : bien travailler sur Hansar Protocol, poursuivre le déménagement et préparer un bon curry maison. Fibre : intervention effectuée le 4 novembre, raccordement impossible ; demander une résiliation Freebox sans frais, avec justificatif.",
      journal: journalNov4,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function decorateHistoryHeading() {
    const screen = document.getElementById("screenReview");
    if (!screen) return;
    const heading = screen.querySelector(".section-heading");
    if (!heading) return;
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    if (eyebrow) eyebrow.textContent = "MÉMOIRE";
    if (title) title.textContent = "Jours précédents";
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
