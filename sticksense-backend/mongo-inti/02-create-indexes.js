const dbName = process.env.MONGO_DB || "sticksense";
db = db.getSiblingDB(dbName);

db.teams.createIndex({ teamId: 1 }, { unique: true });
db.players.createIndex({ personId: 1 }, { unique: true });
db.games.createIndex({ gamePk: 1 }, { unique: true });
db.highlights.createIndex({ videoId: 1 }, { unique: true });

db.games.createIndex({ startTimeUtc: 1 });
db.games.createIndex({ status: 1 });
db.games.createIndex({ "home.teamId": 1 });
db.games.createIndex({ "away.teamId": 1 });

db.standings.createIndex({ snapshotDate: 1, teamId: 1 }, { unique: true });

db.highlights.createIndex({ gamePk: 1 });
db.highlights.createIndex({ personId: 1 });
db.highlights.createIndex({ publishedAt: 1 });
