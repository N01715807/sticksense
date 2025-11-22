import mongoose from 'mongoose';

// teams
const teamSideSchema = new mongoose.Schema(
  {
    teamId: { type: Number, required: true },
    name: { type: String, required: true },
    abbrev: { type: String },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

// games
const gameSchema = new mongoose.Schema(
  {
    gamePk: {
      type: Number,
      required: true,
      unique: true,
    },

    season: { type: String },
    gameType: { type: String },

    startTimeUtc: { type: Date, index: true },
    startTimeLocal: { type: Date },

    status: { type: String, index: true }, 

    venue: {
      name: { type: String },
      city: { type: String },
    },

    home: teamSideSchema,
    away: teamSideSchema,

    tags: { type: [String], default: [] },

    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'games',
  }
);

// Update time
gameSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Export Model
export const Game =
  mongoose.models.Game || mongoose.model('Game', gameSchema);