import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema(
  {
    // YouTube ID
    videoId: {
      type: String,
      required: true,
      unique: true,
    },

    title: { type: String, required: true },
    description: { type: String, default: '' },

    channelId: { type: String, required: true },
    channelTitle: { type: String, required: true },

    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },

    gamePk: {
      type: Number,
      default: null,
      index: true,
    },

    homeTeamId: {
      type: Number,
      default: null,
    },
    awayTeamId: {
      type: Number,
      default: null,
    },

    personId: {
      type: Number,
      default: null,
      index: true,
    },

    matchScore: {
      type: Number,
      default: 0,
    },

    tags: {
      type: [String],
      default: [],
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'highlights',
  }
);

// Automatically refresh updatedAt on each save
highlightSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Prevent duplicate registration model
export const Highlight =
  mongoose.models.Highlight ||
  mongoose.model('Highlight', highlightSchema);
