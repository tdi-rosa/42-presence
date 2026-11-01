(() => {
  "use strict";

  const STATE_KEY = "dayflow_v1";
  const REVIEW_DATE = "2026-11-01";

  const journal = {
    version: 1,
    title: "Une journée qui relance la machine",
    summary: "Tu as avancé sur plusieurs fronts sans tout résoudre d’un coup. Le point important de la journée, c’est surtout d’avoir créé du mouvement : le déménagement est lancé, le travail en Go avance, ton outil d’apprentissage prend forme et les candidatures sont parties.",
    moments: [
      {
        symbol: "↗",
        title: "Déménagement",
        text: "Tu as réellement commencé et créé du momentum, même s’il reste encore beaucoup à faire."
      },
      {
        symbol: "⌘",
        title: "Go",
        text: "Tu as fini de recopier tout le tutoriel à la main. Tu es encore à l’étape compréhension, pas encore autonomie — c’est le prochain cap."
      },
      {
        symbol: "✦",
        title: "Outil d’apprentissage",
        text: "Tu construis un outil relié à ChatGPT avec captures d’écran automatiques pour expliquer le code en temps réel. C’est une piste à poursuivre."
      },
      {
        symbol: "✉",
        title: "Candidatures",
        text: "Des dizaines de candidatures sont parties pour des jobs de livraison vélo cargo et en code. Demain : vérifier les réponses une fois, sans surveiller la boîte mail en continu."
      },
      {
        symbol: "♡",
        title: "Famille",
        text: "La discussion avec ta mère s’est mieux passée et elle a compris ce que tu voulais lui expliquer."
      }
    ],
    followUps: [
      "Refaire le tutoriel Go jusqu’à pouvoir reconstruire les parties importantes sans recopier.",
      "Continuer l’outil de capture d’écran + explication temps réel et voir s’il accélère vraiment l’apprentissage.",
      "Regarder demain les réponses aux candidatures dans un seul créneau dédié.",
      "Continuer le déménagement sans perdre le momentum créé aujourd’hui."
    ],
    closing: "J’ai avancé sur plusieurs fronts. Rien n’a besoin d’être réglé cette nuit."
  };

  seedReview();
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
      workedWell: existing.workedWell || "Bonne journée globalement : déménagement lancé, tutoriel Go recopié, outil d’apprentissage en cours, candidatures envoyées et discussion positive avec ma mère.",
      blockedBy: existing.blockedBy || "Stress encore élevé en fin de journée, surtout autour de l’argent et du besoin de continuer à résoudre des problèmes au lieu de décrocher.",
      note: existing.note || "À suivre : Go, outil d’apprentissage, réponses aux candidatures et poursuite du déménagement.",
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

    const review = state?.reviews?.[REVIEW_DATE];
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
      <div class="journal-kicker">Bilan du dimanche</div>
      <h2 class="journal-title">${escapeHtml(data.title)}</h2>
      <p class="journal-lead">${escapeHtml(data.summary)}</p>
      <div class="journal-moments">${moments}</div>
      <div class="followup-card">
        <h3>À suivre</h3>
        <div class="followup-list">${followUps}</div>
      </div>
      <p class="journal-closing">${escapeHtml(data.closing)}</p>
      <p class="journal-date">1 novembre 2026</p>
    `;
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
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char]));
  }
})();
