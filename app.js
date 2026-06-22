const state = {
  filter: "all",
  search: "",
  reading: [],
  activeCardId: null,
  messageRevealed: false
};

const deckGrid = document.querySelector("#deck-grid");
const searchInput = document.querySelector("#card-search");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const tray = document.querySelector("#reading-tray");
const readingCount = document.querySelector("#reading-count");
const clearButton = document.querySelector("#clear-reading");
const revealButton = document.querySelector("#reveal-message");
const messageOutput = document.querySelector("#message-output");
const cardPreview = document.querySelector("#card-preview");

const elementTone = {
  Feu: {
    name: "Fire",
    text: "desire, drive and action"
  },
  Eau: {
    name: "Water",
    text: "feeling and relationship"
  },
  Air: {
    name: "Air",
    text: "thought, truth and decision"
  },
  Terre: {
    name: "Earth",
    text: "body, money and the practical"
  }
};

const numberThemes = {
  As: "the seed and a beginning offered",
  II: "pairing, choice and balance",
  III: "growth and the first result",
  IIII: "structure, pause and foundation",
  V: "disruption, test and struggle",
  VI: "restored harmony, exchange and relief",
  VII: "effort, reflection and the inner test",
  VIII: "momentum and mastery building",
  VIIII: "near fullness, weight and intensity",
  X: "completion, the full load and a cycle closing"
};

const courtRoles = {
  Valet: "learner",
  Cavalier: "mover",
  Reine: "keeper",
  Roi: "ruler"
};

const courtDomains = {
  "Bâtons": "fire and action",
  Coupes: "feeling and connection",
  "Épées": "thought and truth",
  Deniers: "body, work and money"
};

const namedMajorLines = {
  "La Roue de Fortune": "La Roue de Fortune says change is turning.",
  "Sans nom": "XIII Sans nom says an ending is clearing the way.",
  "La Maison Dieu": "La Maison Dieu says a sudden break is in the picture.",
  "Le Monde": "Le Monde says completion and arrival.",
  "La Lune": "La Lune says not all of this is clear yet.",
  "Le Soleil": "Le Soleil says there is clarity and warmth here.",
  "La Justice": "La Justice says a fair weighing is due.",
  "Le Pendu": "Le Pendu says a pause is asked of you."
};

function displayTitle(card) {
  return [card.numeral, card.name].filter(Boolean).join(" ");
}

function normalise(value) {
  return value.toLocaleLowerCase("fr-FR");
}

function matchesFilter(card) {
  if (state.filter === "all") {
    return true;
  }
  if (state.filter === "major") {
    return card.group === "major";
  }
  return card.suit === state.filter;
}

function matchesSearch(card) {
  if (!state.search) {
    return true;
  }
  const haystack = normalise(`${card.numeral} ${card.name} ${card.subtitle ?? ""}`);
  return haystack.includes(normalise(state.search));
}

function getVisibleCards() {
  return CARD_DATA.filter((card) => matchesFilter(card) && matchesSearch(card));
}

function createCardButton(card) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-tile";
  button.dataset.cardId = card.id;
  button.innerHTML = `
    <span class="card-numeral">${card.numeral || " "}</span>
    <span class="card-name">${card.name}</span>
    ${card.subtitle ? `<span class="card-subtitle">${card.subtitle}</span>` : ""}
  `;
  button.addEventListener("click", () => addCard(card.id));
  return button;
}

function renderDeck() {
  deckGrid.replaceChildren();
  renderCardPreview();
  const visibleCards = getVisibleCards();

  if (!visibleCards.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No cards match.";
    deckGrid.append(empty);
    return;
  }

  const groups = [
    ["major", "Majeurs"],
    ["Bâtons", "Bâtons"],
    ["Coupes", "Coupes"],
    ["Épées", "Épées"],
    ["Deniers", "Deniers"]
  ];

  groups.forEach(([key, label]) => {
    const groupCards = visibleCards.filter((card) => {
      return key === "major" ? card.group === "major" : card.suit === key;
    });

    if (!groupCards.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "deck-group";
    const heading = document.createElement("h3");
    heading.textContent = label;
    const list = document.createElement("div");
    list.className = "card-list";
    groupCards.forEach((card) => list.append(createCardButton(card)));
    section.append(heading, list);
    deckGrid.append(section);
  });
}

function addCard(cardId) {
  const card = CARD_DATA.find((item) => item.id === cardId);
  if (!card) {
    return;
  }
  state.reading.push({
    instanceId: `${cardId}-${Date.now()}-${state.reading.length}`,
    cardId
  });
  state.activeCardId = cardId;
  state.messageRevealed = false;
  renderDeck();
  renderReading();
}

function removeCard(instanceId) {
  state.reading = state.reading.filter((entry) => entry.instanceId !== instanceId);
  state.messageRevealed = false;
  renderReading();
}

function getEntryCard(entry) {
  return CARD_DATA.find((card) => card.id === entry.cardId);
}

function renderReading() {
  tray.replaceChildren();
  const count = state.reading.length;
  readingCount.textContent = count === 0 ? "No cards selected." : count === 1 ? "1 card selected." : `${count} cards selected.`;
  clearButton.disabled = count === 0;
  revealButton.disabled = count === 0;

  if (!count) {
    const empty = document.createElement("li");
    empty.className = "reading-empty";
    empty.textContent = "The reading tray is empty.";
    tray.append(empty);
    messageOutput.textContent = "";
    return;
  }

  state.reading.forEach((entry) => {
    const card = getEntryCard(entry);
    const item = document.createElement("li");
    item.className = "reading-card";

    const title = document.createElement("div");
    title.className = "reading-title";
    title.innerHTML = `
      <span>${displayTitle(card)}</span>
      ${card.subtitle ? `<small>${card.subtitle}</small>` : ""}
    `;

    const meaning = document.createElement("p");
    meaning.className = "reading-meaning";
    meaning.textContent = card.upright;

    const actions = document.createElement("div");
    actions.className = "reading-actions";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "plain-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeCard(entry.instanceId));
    actions.append(removeButton);

    item.append(title, meaning, actions);
    tray.append(item);
  });

  if (state.messageRevealed) {
    messageOutput.textContent = composeMessage();
  } else {
    messageOutput.textContent = "";
  }
}

function renderCardPreview() {
  cardPreview.replaceChildren();
  if (!state.activeCardId) {
    cardPreview.hidden = true;
    return;
  }

  const card = CARD_DATA.find((item) => item.id === state.activeCardId);
  if (!card) {
    cardPreview.hidden = true;
    return;
  }

  cardPreview.hidden = false;
  const heading = document.createElement("h3");
  heading.textContent = displayTitle(card);
  const meaning = document.createElement("p");
  meaning.textContent = card.upright;
  const note = document.createElement("p");
  note.className = "preview-note";
  note.textContent = "Added to the reading.";
  cardPreview.append(heading, meaning, note);
}

function joinWords(items) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function composeMessage() {
  const entries = state.reading.map((entry) => ({
    ...entry,
    card: getEntryCard(entry)
  }));
  const total = entries.length;
  const majors = entries.filter((entry) => entry.card.group === "major");
  const minors = entries.filter((entry) => entry.card.group === "minor");
  const courts = minors.filter((entry) => ["Valet", "Cavalier", "Reine", "Roi"].includes(entry.card.rank));
  const lines = [];

  if (majors.length > total / 2) {
    lines.push("Large forces are at work, this reading speaks to fate and turning points more than to daily detail.");
  } else if (majors.length === 0) {
    lines.push("This reading sits close to the ground, everyday matters and practical movement.");
  } else {
    lines.push("Big themes and daily life are both present here.");
  }

  if (minors.length) {
    const elementCounts = minors.reduce((counts, entry) => {
      counts[entry.card.element] = (counts[entry.card.element] ?? 0) + 1;
      return counts;
    }, {});
    const strongest = Math.max(...Object.values(elementCounts));
    const leading = Object.entries(elementCounts)
      .filter(([, count]) => count === strongest)
      .map(([element]) => element);
    const names = leading.map((element) => elementTone[element].name);
    const tones = leading.map((element) => elementTone[element].text);
    lines.push(`${joinWords(names)} ${leading.length === 1 ? "leads" : "lead"}, so ${joinWords(tones)} set the tone.`);
  }

  const numberedMinors = minors.filter((entry) => numberThemes[entry.card.rank]);
  const rankCounts = numberedMinors.reduce((counts, entry) => {
    counts[entry.card.rank] = (counts[entry.card.rank] ?? 0) + 1;
    return counts;
  }, {});
  const repeatedRanks = Object.entries(rankCounts).filter(([, count]) => count >= 2).map(([rank]) => rank);

  if (repeatedRanks.length) {
    const themes = repeatedRanks.map((rank) => `${rank}, ${numberThemes[rank]}`);
    lines.push(`${sentenceCase(joinWords(themes))} run as a thread through the reading.`);
  }

  if (numberedMinors.length) {
    const low = numberedMinors.filter((entry) => ["As", "II", "III"].includes(entry.card.rank)).length;
    const middle = numberedMinors.filter((entry) => ["IIII", "V", "VI"].includes(entry.card.rank)).length;
    const high = numberedMinors.filter((entry) => ["VII", "VIII", "VIIII", "X"].includes(entry.card.rank)).length;

    if (low >= middle && low >= high) {
      lines.push("The numbers show early energy, things beginning.");
    } else if (middle >= low && middle >= high) {
      lines.push("The numbers show the middle of the work, building and adjusting.");
    } else {
      lines.push("The numbers show late energy, things completing or coming to a head.");
    }

    if (rankCounts.As) {
      lines.push("A new beginning is offered.");
    }
    if (rankCounts.X) {
      lines.push("A cycle is closing.");
    }
  }

  if (courts.length) {
    const roles = courts.map((entry) => {
      return `${entry.card.name}, the ${courtRoles[entry.card.rank]} of ${courtDomains[entry.card.suit]}`;
    });
    lines.push(`People or the roles you play feature here: ${joinWords(roles)}.`);
    if (courts.length >= 3) {
      lines.push("The reading is busy with people.");
    }
  }

  majors.forEach((entry) => {
    const line = namedMajorLines[entry.card.name];
    if (line) {
      lines.push(line);
    }
  });

  lines.push("Read this against what you already felt, the cards either confirm or they complicate and both are useful.");
  return lines.join(" ");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderDeck();
  });
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value.trim();
  renderDeck();
});

clearButton.addEventListener("click", () => {
  state.reading = [];
  state.activeCardId = null;
  state.messageRevealed = false;
  renderDeck();
  renderReading();
});

revealButton.addEventListener("click", () => {
  state.messageRevealed = true;
  messageOutput.textContent = composeMessage();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

renderDeck();
renderReading();
