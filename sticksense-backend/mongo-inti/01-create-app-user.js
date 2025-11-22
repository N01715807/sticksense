const dbName = process.env.MONGO_DB || "sticksense";
const appUser = process.env.MONGO_APP_USER || "appuser";
const appPass = process.env.MONGO_APP_PASS || "app-pass";

db = db.getSiblingDB(dbName);

db.createUser({
  user: appUser,
  pwd: appPass,
  roles: [{ role: "readWrite", db: dbName }]
});

db.createCollection("teams");
db.createCollection("players");
db.createCollection("games");
db.createCollection("standings");
db.createCollection("highlights");
db.createCollection("rankings");

db.createCollection("raw_schedule");
db.createCollection("raw_teams");
db.createCollection("raw_players");
db.createCollection("raw_standings");
db.createCollection("raw_youtube");

db.raw_schedule.createIndex({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
db.raw_youtube.createIndex({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });