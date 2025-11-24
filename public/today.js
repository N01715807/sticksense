const API_URL = "http://localhost:3000/api/games/games-today";

function formatGameTime(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  const timeStr = date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit"
  });

  const hour = date.getHours();
  const prefix = hour >= 18 ? "Tonight" : "Today";

  return `${prefix} ${timeStr}`;
}

function formatVenue(venue) {
  if (!venue) return "";
  const name = venue.name || "";
  const city = venue.city || "";
  if (name && city) return `${name} · ${city}`;
  return name || city;
}

function formatPublishedAt(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("en-CA");
}

function getDisplayStatus(game) {
  const iso = game.startTimeUtc || game.startTimeLocal;
  if (!iso) return "Unknown";

  const start = new Date(iso);
  const now = new Date();

  if (now < start) return "Scheduled";

  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  if (now >= start && now <= end) return "Live";

  return "Final";
}

function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  const homeName = game.home?.name || game.home?.abbrev || "Home";
  const awayName = game.away?.name || game.away?.abbrev || "Away";

  const timeIso = game.startTimeUtc || game.startTimeLocal;
  const timeText = formatGameTime(timeIso);
  const venueText = formatVenue(game.venue);

  const statusText = getDisplayStatus(game);

  const titleEl = document.createElement("div");
  titleEl.className = "game-title";
  titleEl.textContent = `${homeName} vs ${awayName}`;
  card.appendChild(titleEl);

  const subEl = document.createElement("div");
  subEl.className = "game-sub";
  subEl.textContent = venueText ? `${timeText} · ${venueText}` : timeText;
  card.appendChild(subEl);

  const statusEl = document.createElement("div");
  statusEl.className = "game-status";
  statusEl.textContent = `Status: ${statusText}`;
  card.appendChild(statusEl);

  const hasHighlights = Array.isArray(game.highlights) && game.highlights.length > 0;

  if (hasHighlights) {
    const h = game.highlights[0];

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "highlight-toggle-btn";
    toggleBtn.textContent = "Show Highlight ▼";

    const container = document.createElement("div");
    container.className = "highlight-container";
    container.style.display = "none";

    const wrapper = document.createElement("div");
    wrapper.className = "highlight-video-wrapper";

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${h.videoId}`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

    wrapper.appendChild(iframe);
    container.appendChild(wrapper);

    const meta = document.createElement("div");
    meta.className = "highlight-meta";

    const metaTitle = document.createElement("div");
    metaTitle.className = "highlight-meta-title";
    metaTitle.textContent = `Title: ${h.title}`;

    const metaTime = document.createElement("div");
    metaTime.className = "highlight-meta-time";
    metaTime.textContent = `Published At: ${formatPublishedAt(h.publishedAt)}`;

    meta.appendChild(metaTitle);
    meta.appendChild(metaTime);
    container.appendChild(meta);

    toggleBtn.addEventListener("click", () => {
      if (container.style.display === "none") {
        container.style.display = "block";
        toggleBtn.textContent = "Hide Highlight ▲";
      } else {
        container.style.display = "none";
        toggleBtn.textContent = "Show Highlight ▼";
      }
    });

    card.appendChild(toggleBtn);
    card.appendChild(container);
  }

  return card;
}

function splitGames(games) {
  const upcoming = [];
  const finished = [];

  for (const game of games) {
    const displayStatus = getDisplayStatus(game);
    if (displayStatus === "Final") {
      finished.push(game);
    } else {
      upcoming.push(game);
    }
  }

  return { upcoming, finished };
}

async function loadGames() {
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const upContainer = document.getElementById("upcoming-container");
  const finContainer = document.getElementById("finished-container");

  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  upContainer.innerHTML = "";
  finContainer.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API error");

    const json = await res.json();
    const games = Array.isArray(json.games) ? json.games : [];

    const parts = splitGames(games);

    if (parts.upcoming.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-text";
      empty.textContent = "No upcoming games today.";
      upContainer.appendChild(empty);
    } else {
      for (const game of parts.upcoming) {
        upContainer.appendChild(createGameCard(game));
      }
    }

    if (parts.finished.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-text";
      empty.textContent = "No finished games today.";
      finContainer.appendChild(empty);
    } else {
      for (const game of parts.finished) {
        finContainer.appendChild(createGameCard(game));
      }
    }
  } catch (e) {
    console.error("[today.js] loadGames failed:", e);
    errorEl.textContent = "Failed to load today's games. Please try again later.";
    errorEl.style.display = "block";
  } finally {
    loadingEl.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadGames);
