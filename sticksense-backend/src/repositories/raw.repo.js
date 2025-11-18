import { getDb } from '../lib/mongo.js';
import { RawSchedule } from '../models/rawSchedule.model.js';

await getDb();

export async function insertRaw({ source, kind, request, payload, fetchedAt = new Date(), traceId }) {
  const doc = new RawSchedule({ source, kind, request, payload, fetchedAt, meta: { traceId } });
  await doc.save();
  return { insertedId: doc._id };
}

export async function findRecentRaw(limit = 10) {
  return RawSchedule.find({}).sort({ fetchedAt: -1 }).limit(limit).lean();
}