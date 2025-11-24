# StickSense

A small project that aggregates **NHL today's games + YouTube highlights**.

## Features
- Automatic NHL schedule ingestion
- Automatic YouTube highlight search and matching
- Raw + cleaned data layers (ETL pipeline)
- Single API endpoint for frontend
- Single-page HTML/JS interface for viewing games and highlights

## Tech Stack
- Node.js (Express)
- MongoDB (with TTL collections)
- YouTube Data API v3
- NHL Public API
- Docker (MongoDB setup)
- HTML/CSS/JavaScript (no framework)

## Run Locally

### 1. Start MongoDB (Docker)

```bash
docker-compose up -d
```
This automatically creates the database, user, collections, and indexes.

### 2. Configure .env

- Copy the example environment file:

```bash
cp .env.example .env
```
- Then edit .env and fill in the required values:
- This allows the backend to connect to the MongoDB instance started in Docker.

### 3. Start the Node.js Backend

- Install dependencies and run the server:

```bash
npm install
npm run dev
```

- If everything is correct, you should see logs confirming:
  - MongoDB connection successful
  - Server is running on the configured port

### 4 Pull Initial Data

- The system is designed to fetch new data automatically. However, because a fresh database starts empty, it is recommended to run an initial sync once.

- Fetch NHL Schedule (first-time only)
```bash
node src/jobs/schedule.sync.js
```
- Fetch YouTube Highlights (first-time only)
```bash
node src/jobs/youtube.sync.js
```
### 5 Verifying the Backend

- After starting the server:
```bash
curl http://localhost:3000/health
```
Expected:
```bash
{ "ok": true, "env": "dev" }
```

- Check Today’s Games API
```bash
curl http://localhost:3000/api/games/games-today
```
Expected:
```bash
{
  "games": [
    { ...game object with highlights... }
  ]
}
```

### 6 Open the Web Interface

- The frontend of this project is a static HTML/JS page (no framework).  
- After the backend is running, simply open the main page in your browser:
  - public/index.html

## Project Logic

- The project runs a simple data pipeline:
  - NHL API → raw_schedule → games
  - YouTube API → raw_youtube → highlights

- `schedule.sync.js`  
  - Fetches NHL games  
  - Saves raw data to `raw_schedule`  (TTL 30 days)  
  - Transforms to a consistent game format → writes to `games`

- `youtube.sync.js`  
  - Searches YouTube highlights based on team names and dates 
  - Saves raw results to `raw_youtube`  
  - Extracts needed fields → writes to `highlights`

- The frontend calls:
```bash
GET /api/games/games-today
```
- It renders:
  - Today’s upcoming games  
  - Today’s finished games  
  - YouTube highlights under each game

## Database Structure

1. `games`
Cleaned NHL game data.
- `gamePk` (unique)
- `startTimeUtc`, `startTimeLocal`
- `status`
- `venue { name, city }`
- `home { teamId, name, abbrev, score }`
- `away { teamId, name, abbrev, score }`

2. `highlights`
YouTube highlight videos.
- `videoId` (unique)
- `title`, `channelTitle`, `publishedAt`
- `gamePk` (matched game)
- `homeTeamId`, `awayTeamId`
- `matchScore`

3. `raw_schedule` (TTL 30 days)
Raw NHL API responses.
- `source`, `kind`
- `request`
- `payload`
- `fetchedAt` (auto-expire)

4. `raw_youtube` (TTL 30 days)
Raw YouTube API responses.
- Same structure as `raw_schedule`

## API Endpoints

- GET /api/games/games-today
  - Returns today's upcoming and finished games, including matched YouTube highlights.

- GET /health
  - Simple health check.