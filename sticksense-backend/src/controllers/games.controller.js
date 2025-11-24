import { Game } from "../models/game.model.js";
import { Highlight } from "../models/highlight.model.js";

//Date → YYYY-MM-DD
function formatDateYMD(date) {
  const iso = date.toISOString();
  return iso.slice(0, 10);
}

//UTC time range
function getUtcDayRange(date) {
  const dayStr = formatDateYMD(date);

  const start = new Date(dayStr + "T00:00:00Z");
  const end = new Date(dayStr + "T23:59:59Z");

  return { start, end };
}

//Group highlights by gamePk
function buildHighlightMap(highlights) {
  const result = {};

  for (const item of highlights) {
    const gameId = item.gamePk;

    if (result[gameId] === undefined) {
      result[gameId] = [];
    }

    result[gameId].push(item);
  }

  return result;
}

//The process of `getTodayGamesWithHighlights` is as follows:
//Calculate the start and end times for today's UTC.
//Check today's games.
//Extract all game keys.
//Check all highlights for these games.
//Group the highlights by game key.
//Add a "highlights" field to each game.
//Return `res.json({games})` to the front end.
export async function getTodayGamesWithHighlights(req, res) {
  try {
    const { start, end } = getUtcDayRange(new Date());

    const games = await Game.find({
      startTimeUtc: { $gte: start, $lte: end }
    }).lean();

    if (!games || games.length === 0) {
      return res.json({ games: [] });
    }

    const gameIds = games.map(game => game.gamePk);

    const highlights = await Highlight.find({
      gamePk: { $in: gameIds }
    }).lean();

    const highlightMap = buildHighlightMap(highlights);

    const gamesWithHighlights = games.map(game => {
      const gameHighlights = highlightMap[game.gamePk] || [];
      return {
        ...game,
        highlights: gameHighlights
      };
    });

    return res.json({ games: gamesWithHighlights });

  } catch (error) {
    console.error("[getTodayGamesWithHighlights] failed:", error);
    return res.status(500).json({ error: "server error" });
  }
}