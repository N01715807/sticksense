import { formatGameTime } from "../formatters/time.js";
import { formatVenue } from "../formatters/venue.js";
import { getDisplayStatus } from "../status/getDisplayStatus.js";
import {
  createHighlightSection,
  createHighlightToggleButton,
  attachHighlightToggle
} from "./highlightSection.js";

export function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  let homeName = "Home";
  if (game.home) {
    if (game.home.name) {
      homeName = game.home.name;
    } else if (game.home.abbrev) {
      homeName = game.home.abbrev;
    }
  }

  let awayName = "Away";
  if (game.away) {
    if (game.away.name) {
      awayName = game.away.name;
    } else if (game.away.abbrev) {
      awayName = game.away.abbrev;
    }
  }

  let timeIso = null;
  if (game.startTimeUtc) {
    timeIso = game.startTimeUtc;
  } else if (game.startTimeLocal) {
    timeIso = game.startTimeLocal;
  }

  const timeText = formatGameTime(timeIso);
  const venueText = formatVenue(game.venue);
  const statusText = getDisplayStatus(game);

  const titleElement = document.createElement("div");
  titleElement.className = "game-title";
  titleElement.textContent = homeName + " vs " + awayName;
  card.appendChild(titleElement);

  const subElement = document.createElement("div");
  subElement.className = "game-sub";

  if (venueText) {
    subElement.textContent = timeText + " · " + venueText;
  } else {
    subElement.textContent = timeText;
  }

  card.appendChild(subElement);

  const statusElement = document.createElement("div");
  statusElement.className = "game-status";
  statusElement.textContent = "Status: " + statusText;
  card.appendChild(statusElement);

  const hasHighlights =
    game.highlights && Array.isArray(game.highlights) && game.highlights.length > 0;

  if (hasHighlights) {
    const highlight = game.highlights[0];

    const toggleButton = createHighlightToggleButton();
    const highlightSection = createHighlightSection(highlight);

    attachHighlightToggle(toggleButton, highlightSection);

    card.appendChild(toggleButton);
    card.appendChild(highlightSection);
  }

  return card;
}
