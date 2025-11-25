import { getDisplayStatus } from "./getDisplayStatus.js";

export function splitGames(games) {
  const upcoming = [];
  const finished = [];

  for (const game of games) {
    const status = getDisplayStatus(game);

    if (status === "Final") {
      finished.push(game);
    } else {
      upcoming.push(game);
    }
  }

  return {
    upcoming: upcoming,
    finished: finished
  };
}