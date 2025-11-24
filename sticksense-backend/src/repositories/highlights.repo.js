import { getDb } from '../lib/mongo.js';
import { Highlight } from '../models/highlight.model.js';

await getDb();

export async function bulkUpsertHighlights(items) {
  if (!Array.isArray(items)) {
    throw new Error('bulkUpsertHighlights: items must be an array');
  }

  if (items.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const valid = [];
  for (const x of items) {
    if (x && x.videoId) {
      valid.push(x);
    }
  }

  if (valid.length === 0) {
    return { matched: 0, modified: 0, upserted: 0 };
  }

  const ops = [];
  for (const item of valid) {
    ops.push({
      updateOne: {
        filter: { videoId: item.videoId },
        update: { $set: item },
        upsert: true
      }
    });
  }

  const res = await Highlight.bulkWrite(ops, { ordered: false });

  const matched = res.matchedCount ?? 0;
  const modified = res.modifiedCount ?? 0;
  const upserted = res.upsertedCount ?? 0;

  return {
    matched,
    modified,
    upserted
  };
}
