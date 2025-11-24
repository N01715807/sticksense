import 'dotenv/config';

import { fetchSchedule } from '../services/nhl.api.js';
import { insertRaw } from '../repositories/raw.repo.js';
import { bulkUpsertGames } from '../repositories/games.repo.js';
import { toUtcDate, toLocalDate } from '../utils/time.js';

function transformScheduleToGames(raw) {
  const games = [];

  if (!raw?.dates || !Array.isArray(raw.dates)) {
    return games;
  }

  for (const dateBlock of raw.dates) {
    if (!dateBlock?.games || !Array.isArray(dateBlock.games)) {
      continue;
    }

    for (const g of dateBlock.games) {
      if (!g?.homeTeam || !g?.awayTeam) {
        continue;
      }

      const homeTeam = g.homeTeam;
      const awayTeam = g.awayTeam;

      if (!homeTeam.id || !awayTeam.id) {
        continue;
      }

      const iso = g.startTimeUTC ?? g.gameDate;
      if (!iso) {
        continue;
      }

      let venueName = null;
      let venueCity = null;

      if (g.venue) {
        if (typeof g.venue === 'string') {
          venueName = g.venue;
        } else if (typeof g.venue === 'object') {
          venueName = g.venue.name ?? g.venue.default ?? null;
          venueCity = g.venue.city ?? null;
        }
      }

      const homeName =
        homeTeam.placeName?.default ??
        homeTeam.teamName ??
        homeTeam.abbrev ??
        null;

      const awayName =
        awayTeam.placeName?.default ??
        awayTeam.teamName ??
        awayTeam.abbrev ??
        null;

      const homeScore = homeTeam.score ?? 0;
      const awayScore = awayTeam.score ?? 0;

      const status = g.gameState ?? null;

      const game = {
        gamePk: g.id,
        season: String(g.season ?? ''),
        gameType: String(g.gameType ?? ''),

        startTimeUtc: toUtcDate(iso),
        startTimeLocal: toLocalDate(iso, 'America/Toronto'),

        status: status,

        venue: {
          name: venueName,
          city: venueCity
        },

        home: {
          teamId: homeTeam.id,
          name: homeName,
          abbrev: homeTeam.abbrev,
          score: homeScore
        },

        away: {
          teamId: awayTeam.id,
          name: awayName,
          abbrev: awayTeam.abbrev,
          score: awayScore
        },

        tags: []
      };

      games.push(game);
    }
  }

  return games;
}

export async function syncSchedule(daysAhead) {
  const days = daysAhead ?? 5;

  console.log('[schedule.sync] start');

  const raw = await fetchSchedule(days);
  console.log('[debug raw]', raw);

  if (!raw) {
    console.log('[schedule.sync] fetchSchedule returned null');
    return;
  }

  try {
    await insertRaw({
      source: 'nhl',
      kind: 'schedule',
      request: { daysAhead: days },
      payload: raw
    });
  } catch (err) {
    console.log('[schedule.sync] insertRaw error:', err.message);
  }

  const games = transformScheduleToGames(raw);

  if (games.length === 0) {
    console.log('[schedule.sync] no valid games after transform');
    return;
  }

  const stats = await bulkUpsertGames(games);

  console.log('[schedule.sync] done');
  console.log({
    totalPulled: games.length,
    matched: stats.matched,
    modified: stats.modified,
    upserted: stats.upserted
  });
}

if (import.meta.url === 'file://' + process.argv[1]) {
  let days = 5;

  if (process.argv[2]) {
    days = parseInt(process.argv[2]);
  }

  syncSchedule(days)
    .then(() => {
      console.log('[schedule.sync] finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[schedule.sync] failed:', err);
      process.exit(1);
    });
}
