import { GAMES_TODAY_URL } from "../config/api.js";

export async function fetchTodayGames() {
  const response = await fetch(GAMES_TODAY_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch game data.");
  }

  const data = await response.json();

  let games = [];
  if (Array.isArray(data.games)) {
    games = data.games;
  }

  return games;
}
