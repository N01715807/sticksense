import { getDb } from '../lib/mongo.js';
import { Game } from '../models/game.model.js';

await getDb();

export async function upsertGame(game) {
  if (!game || typeof game !== 'object') {
    throw new Error('upsertGame: "game" must be an object');
  }

  if (game.gamePk == null) {
    throw new Error('upsertGame: "game.gamePk" is required');
  }

  const filter = { gamePk: game.gamePk };

  const updateSet = {
    ...game,
    updatedAt: new Date()
  };

  const update = { $set: updateSet };
  const options = { upsert: true };

  const res = await Game.updateOne(filter, update, options);

  const matched = res.matchedCount ?? 0;
  const modified = res.modifiedCount ?? 0;

  let upsertedId = null;
  if (res.upsertedId) {
    upsertedId = res.upsertedId;
  } else if (Array.isArray(res.upserted) && res.upserted.length > 0) {
    upsertedId = res.upserted[0]._id;
  }

  return {
    matched,
    modified,
    upsertedId
  };
}

export async function bulkUpsertGames(games) {
  if (!Array.isArray(games)) {
    throw new Error('bulkUpsertGames: games must be an array');
  }

  if (games.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const validGames = [];
  for (const g of games) {
    if (!g || g.gamePk == null) continue;
    validGames.push(g);
  }

  if (validGames.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const ops = [];
  for (const game of validGames) {
    const updateSet = {
      ...game,
      updatedAt: new Date()
    };

    ops.push({
      updateOne: {
        filter: { gamePk: game.gamePk },
        update: { $set: updateSet },
        upsert: true
      }
    });
  }

  const res = await Game.bulkWrite(ops, { ordered: false });

  const matched = res.matchedCount ?? 0;
  const modified = res.modifiedCount ?? 0;
  const upserted = res.upsertedCount ?? 0;

  return {
    matched,
    modified,
    upserted
  };
}

export async function findGamesForHighlights(daysBack, daysAhead) {
  const back = daysBack ?? 2;
  const ahead = daysAhead ?? 0;

  const now = new Date();
  const from = new Date(now.getTime() - back * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + ahead * 24 * 60 * 60 * 1000);

  const query = {
    startTimeUtc: { $gte: from, $lte: to }
  };

  return Game.find(query).lean();
}
