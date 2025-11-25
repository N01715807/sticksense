import { getDomElements } from "../dom/elements.js";
import { fetchTodayGames } from "../services/gamesService.js";
import { splitGames } from "../status/splitGames.js";
import { createGameCard } from "../ui/gameCard.js";

export async function loadTodayGames() {
  const elements = getDomElements();

  const loadingElement = elements.loadingElement;
  const errorElement = elements.errorElement;
  const upcomingContainer = elements.upcomingElement;
  const finishedContainer = elements.finishedElement;

  const missing =
    !loadingElement ||
    !errorElement ||
    !upcomingContainer ||
    !finishedContainer;

  if (missing) {
    console.error("[todayController] Missing required DOM elements.");
    return;
  }

  loadingElement.style.display = "block";
  errorElement.style.display = "none";
  upcomingContainer.innerHTML = "";
  finishedContainer.innerHTML = "";

  try {
    const games = await fetchTodayGames();
    const parts = splitGames(games);

    const upcoming = parts.upcoming;
    const finished = parts.finished;

    if (upcoming.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-text";
      empty.textContent = "No upcoming games today.";
      upcomingContainer.appendChild(empty);
    } else {
      for (let i = 0; i < upcoming.length; i++) {
        const card = createGameCard(upcoming[i]);
        upcomingContainer.appendChild(card);
      }
    }

    if (finished.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-text";
      empty.textContent = "No finished games today.";
      finishedContainer.appendChild(empty);
    } else {
      for (let i = 0; i < finished.length; i++) {
        const card = createGameCard(finished[i]);
        finishedContainer.appendChild(card);
      }
    }
  } catch (error) {
    console.error("[todayController] loadTodayGames failed:", error);

    errorElement.textContent =
      "Failed to load today's games. Please try again later.";
    errorElement.style.display = "block";
  } finally {
    loadingElement.style.display = "none";
  }
}
