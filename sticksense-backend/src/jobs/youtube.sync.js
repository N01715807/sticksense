import 'dotenv/config';

import { findGamesForHighlights } from '../repositories/games.repo.js';
import { insertRawYoutube } from '../repositories/raw.repo.js';
import { bulkUpsertHighlights } from '../repositories/highlights.repo.js';
import { searchHighlights } from '../services/youtube.api.js';

function transformYoutubeItems(items, game) {
  const results = [];

  if (!Array.isArray(items)) {
    return results;
  }

  for (const it of items) {
    if (!it?.id?.videoId || !it.snippet) {
      continue;
    }

    const sn = it.snippet;

    const publishedAt = sn.publishedAt ? new Date(sn.publishedAt) : null;

    const doc = {
      videoId: it.id.videoId,
      title: sn.title ?? '',
      description: sn.description ?? '',
      channelId: sn.channelId ?? '',
      channelTitle: sn.channelTitle ?? '',
      publishedAt: publishedAt,

      gamePk: game.gamePk,
      homeTeamId: game.home?.teamId ?? null,
      awayTeamId: game.away?.teamId ?? null,

      personId: null,
      matchScore: 50,
      tags: []
    };

    results.push(doc);
  }

  return results;
}

export async function syncYoutubeHighlights() {
  console.log('[youtube.sync] start');

  const games = await findGamesForHighlights(2, 0);

  if (!games || games.length === 0) {
    console.log('[youtube.sync] no games found');
    return;
  }

  const allHighlights = [];
  let totalVideos = 0;

  for (const game of games) {
    const home = game.home?.name ?? game.home?.abbrev ?? '';
    const away = game.away?.name ?? game.away?.abbrev ?? '';

    const time = game.startTimeUtc ?? game.startTimeLocal;
    const dateStr = time.toISOString().slice(0, 10);

    console.log(`[youtube.sync] searching: ${home} vs ${away} (${dateStr})`);

    const items = await searchHighlights(home, away, dateStr, {
      maxResults: 8,
      extraQuery: 'highlights',
      hoursBefore: 6,
      hoursAfter: 36
    });

    totalVideos += items.length;

    await insertRawYoutube({
      source: 'youtube',
      kind: 'highlights',
      request: {
        home: home,
        away: away,
        dateStr: dateStr,
        gamePk: game.gamePk
      },
      payload: items
    });

    const highlights = transformYoutubeItems(items, game);

    for (const h of highlights) {
      allHighlights.push(h);
    }
  }

  if (allHighlights.length === 0) {
    console.log('[youtube.sync] no highlights to write');
    return;
  }

  const stats = await bulkUpsertHighlights(allHighlights);

  console.log('[youtube.sync] done');
  console.log({
    gamesProcessed: games.length,
    totalVideos: totalVideos,
    highlightsUpsert: allHighlights.length,
    matched: stats.matched,
    modified: stats.modified,
    upserted: stats.upserted
  });
}

if (import.meta.url === 'file://' + process.argv[1]) {
  syncYoutubeHighlights()
    .then(() => {
      console.log('[youtube.sync] finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[youtube.sync] failed:', err);
      process.exit(1);
    });
}
