import { getDb } from '../lib/mongo.js';
import { RawSchedule } from '../models/rawSchedule.model.js';
import { RawYoutube } from '../models/rawYoutube.model.js';

await getDb();

export async function insertRaw(params) {
  const source = params.source;
  const kind = params.kind;
  const request = params.request;
  const payload = params.payload;
  const fetchedAt = params.fetchedAt ?? new Date();
  const traceId = params.traceId ?? null;

  const doc = new RawSchedule({
    source,
    kind,
    request,
    payload,
    fetchedAt,
    meta: { traceId }
  });

  await doc.save();
  return { insertedId: doc._id };
}

export async function insertRawYoutube(params) {
  const source = params.source;
  const kind = params.kind;
  const request = params.request;
  const payload = params.payload;
  const fetchedAt = params.fetchedAt ?? new Date();
  const traceId = params.traceId ?? null;

  const doc = new RawYoutube({
    source,
    kind,
    request,
    payload,
    fetchedAt,
    meta: { traceId }
  });

  await doc.save();
  return { insertedId: doc._id };
}
