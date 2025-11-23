import { getDb } from '../lib/mongo.js';
import { Game } from '../models/game.model.js';

await getDb();

export async function upsertGame(game) {
  if (!game) {
    throw new Error('upsertGame: "game" must be an object');
  }
  if (game.gamePk == null) {
    throw new Error('upsertGame: "game.gamePk" is required');
  }

  const filter = { gamePk: game.gamePk };
  const update = {
    $set: {
      ...game,
      updatedAt: new Date(),
    },
  };
  const options = { upsert: true };
  
  const res = await Game.updateOne(filter, update, options);

  let matched = 0;
  let modified = 0;
  let upsertedId = null;

  if (res.matchedCount !== undefined) {
    matched = res.matchedCount;
  }
  if (res.modifiedCount !== undefined) {
    modified = res.modifiedCount;
  }
  if (res.upsertedId) {
    upsertedId = res.upsertedId;
  }
  else if (Array.isArray(res.upserted) && res.upserted.length > 0) {
    upsertedId = res.upserted[0]._id;
  }
  return { matched, modified, upsertedId };
}

export async function bulkUpsertGames(games) {
  if (!Array.isArray(games)) {
    throw new Error('bulkUpsertGames: games must be an array');
  }

  if (games.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const validGames = [];
  for (let i = 0; i < games.length; i++) {
    const g = games[i];

    if (!g) {
      continue;
    }

    if (g.gamePk == null) {
      continue;
    }

    validGames.push(g);
  }

  if (validGames.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const ops = [];
  for (let i = 0; i < validGames.length; i++) {
    const game = validGames[i];

    ops.push({
      updateOne: {
        filter: { gamePk: game.gamePk },
        update: {
          $set: {
            ...game,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    });
  }

  const res = await Game.bulkWrite(ops, { ordered: false });

  let matched = 0;
  let modified = 0;
  let upserted = 0;

  if (res.matchedCount !== undefined) {
    matched = res.matchedCount;
  }

  if (res.modifiedCount !== undefined) {
    modified = res.modifiedCount;
  }

  if (res.upsertedCount !== undefined) {
    upserted = res.upsertedCount;
  }

  return {
    matched: matched,
    modified: modified,
    upserted: upserted,
  };
}