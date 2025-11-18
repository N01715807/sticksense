import mongoose from 'mongoose';

const rawScheduleSchema = new mongoose.Schema(
    {
        source:{type:String, required:true},
        kind:{type:String, required:true},
        request: { type: Object, default: {} },
        payload: { type: mongoose.Schema.Types.Mixed },
        fetchedAt: {
            type: Date,
            default: Date.now,
            index: { expires: '30d' },
        },
        meta: {
            traceId: { type: String, default: null },
            version: { type: Number, default: 1 },
        },
    },
    {
        collection: 'raw_schedule',
    }
)

export const RawSchedule =
  mongoose.models.RawSchedule ||
  mongoose.model('RawSchedule', rawScheduleSchema);