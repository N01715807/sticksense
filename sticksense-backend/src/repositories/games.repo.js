import { getDb } from '../lib/mongo.js';
import { Game } from '../models/game.model.js';

await getDb();

/**
 * 单条 upsert：有就更新，没有就插入
 */
export async function upsertGame(game) {
  // 1) 必须有 gamePk
  if (!game || typeof game.gamePk === 'undefined') {
    throw new Error('upsertGame: game.gamePk is required');
  }

  // 2) filter：用 gamePk 找这场比赛
  const filter = { gamePk: game.gamePk };

  // 3) update：用 $set 更新所有字段 + 自动更新时间
  const update = {
    $set: {
      ...game,
      updatedAt: new Date(),
    },
  };

  // 4) upsert：没有就插入，有就更新
  const options = { upsert: true };

  const res = await Game.updateOne(filter, update, options);

  // 整理结果（Mongo 返回的格式比较复杂）
  return {
    matched: res.matchedCount ?? 0,     // 匹配到旧记录数量（0 或 1）
    modified: res.modifiedCount ?? 0,   // 实际更新次数
    upsertedId:
      res.upsertedId ||
      (Array.isArray(res.upserted) && res.upserted[0]?._id) ||
      null,
  };
}

/**
 * 批量 upsert 多场比赛
 * - games: 已经清洗好的比赛数组
 * - 幂等：可以重复跑，不会插重复
 */
export async function bulkUpsertGames(games) {
  // 1) 必须是数组
  if (!Array.isArray(games)) {
    throw new Error('bulkUpsertGames: games must be an array');
  }

  // 空数组就直接返回统计 0
  if (games.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  // 2) 过滤掉没有 gamePk 的脏数据
  const validGames = games.filter(
    (g) => g && typeof g.gamePk !== 'undefined'
  );

  if (validGames.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  // 3) 把每场比赛变成 bulk updateOne + upsert 操作
  const ops = validGames.map((game) => ({
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
  }));

  // 4) 批量执行
  const res = await Game.bulkWrite(ops, { ordered: false });

  // 5) 整理一下结果再返回
  return {
    matched: res.matchedCount ?? 0,
    modified: res.modifiedCount ?? 0,
    upserted: res.upsertedCount ?? 0,
  };
}