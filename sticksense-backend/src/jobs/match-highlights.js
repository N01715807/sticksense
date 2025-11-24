import 'dotenv/config';

import { Highlight } from '../models/highlight.model.js';
import { Game } from '../models/game.model.js';
import { getDb } from '../lib/mongo.js';

await getDb();

export async function matchHighlights() {
  console.log('[match] start');

  const videos = await Highlight.find({ gamePk: null }).lean();
  if (!videos || videos.length === 0) {
    console.log('[match] no videos need matching');
    return;
  }

  const games = await Game.find({}).lean();
  const updates = [];

  for (const video of videos) {
    const title = video.title?.toUpperCase() ?? '';
    const publishedMs = new Date(video.publishedAt).getTime();

    let matchedGame = null;

    for (const g of games) {
      const homeAbbrev = g.home?.abbrev?.toUpperCase() ?? '';
      const awayAbbrev = g.away?.abbrev?.toUpperCase() ?? '';

      if (!title.includes(homeAbbrev) || !title.includes(awayAbbrev)) {
        continue;
      }

      const gameStartMs = new Date(g.startTimeUtc).getTime();
      const diffHours = (publishedMs - gameStartMs) / 3600 / 1000;

      if (diffHours < 0 || diffHours > 48) {
        continue;
      }

      matchedGame = g;
      break;
    }

    if (matchedGame) {
      updates.push({
        updateOne: {
          filter: { videoId: video.videoId },
          update: {
            $set: {
              gamePk: matchedGame.gamePk,
              homeTeamId: matchedGame.home.teamId,
              awayTeamId: matchedGame.away.teamId,
              matchScore: 50
            }
          }
        }
      });
    }
  }

  if (updates.length === 0) {
    console.log('[match] no matches found');
    return;
  }

  await Highlight.bulkWrite(updates);
  console.log('[match] done, updated:', updates.length);
}

if (import.meta.url === 'file://' + process.argv[1]) {
  matchHighlights()
    .then(() => {
      console.log('[match] finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[match] failed:', err);
      process.exit(1);
    });
}
