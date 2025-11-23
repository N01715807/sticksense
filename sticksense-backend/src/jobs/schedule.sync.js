import 'dotenv/config';

import { fetchSchedule } from '../services/nhl.api.js';
import { insertRaw } from '../repositories/raw.repo.js';
import { bulkUpsertGames } from '../repositories/games.repo.js';
import { toUtcDate, toLocalDate } from '../utils/time.js';

function transformScheduleToGames(raw) {
  const games = [];

  if (!raw || !raw.dates || !Array.isArray(raw.dates)) {
    return games;
  }

  for (let i = 0; i < raw.dates.length; i++) {
    const dateBlock = raw.dates[i];

    if (!dateBlock || !dateBlock.games || !Array.isArray(dateBlock.games)) {
      continue;
    }

    for (let j = 0; j < dateBlock.games.length; j++) {
      const g = dateBlock.games[j];

      if (!g || !g.homeTeam || !g.awayTeam) {
        continue;
      }

      const homeTeam = g.homeTeam;
      const awayTeam = g.awayTeam;

      if (!homeTeam.id || !awayTeam.id) {
        continue;
      }

      let iso = null;
      if (g.startTimeUTC) {
        iso = g.startTimeUTC;
      } else if (g.gameDate) {
        iso = g.gameDate;
      }

      if (!iso) {
        continue;
      }

      let venueName = null;
      let venueCity = null;

      if (g.venue) {
        if (typeof g.venue === 'string') {
          venueName = g.venue;
        } else if (typeof g.venue === 'object') {
          if (g.venue.name) {
            venueName = g.venue.name;
          } else if (g.venue.default) {
            venueName = g.venue.default;
          }
          if (g.venue.city) {
            venueCity = g.venue.city;
          }
        }
      }

      let homeName = null;
      if (homeTeam.placeName && homeTeam.placeName.default) {
        homeName = homeTeam.placeName.default;
      } else if (homeTeam.teamName) {
        homeName = homeTeam.teamName;
      } else if (homeTeam.abbrev) {
        homeName = homeTeam.abbrev;
      }

      let awayName = null;
      if (awayTeam.placeName && awayTeam.placeName.default) {
        awayName = awayTeam.placeName.default;
      } else if (awayTeam.teamName) {
        awayName = awayTeam.teamName;
      } else if (awayTeam.abbrev) {
        awayName = awayTeam.abbrev;
      }

      let homeScore = 0;
      if (homeTeam.score || homeTeam.score === 0) {
        homeScore = homeTeam.score;
      }

      let awayScore = 0;
      if (awayTeam.score || awayTeam.score === 0) {
        awayScore = awayTeam.score;
      }

      let status = null;
      if (g.gameState) {
        status = g.gameState;
      }

      const game = {
        gamePk: g.id,
        season: String(g.season || ''),
        gameType: String(g.gameType || ''),

        startTimeUtc: toUtcDate(iso),
        startTimeLocal: toLocalDate(iso, 'America/Toronto'),

        status: status,

        venue: {
          name: venueName,
          city: venueCity,
        },

        home: {
          teamId: homeTeam.id,
          name: homeName,
          abbrev: homeTeam.abbrev,
          score: homeScore,
        },

        away: {
          teamId: awayTeam.id,
          name: awayName,
          abbrev: awayTeam.abbrev,
          score: awayScore,
        },

        tags: [],
      };

      games.push(game);
    }
  }

  return games;
}

export async function syncSchedule(daysAhead = 5) {
  console.log('[schedule.sync] start');

  const raw = await fetchSchedule(daysAhead);

  console.log('[debug raw]', raw);

  if (!raw) {
    console.log('[schedule.sync] fetchSchedule returned null');
    return;
  }

  try {
    await insertRaw({
      source: 'nhl',
      kind: 'schedule',
      request: { daysAhead: daysAhead },
      payload: raw,
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
    upserted: stats.upserted,
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
