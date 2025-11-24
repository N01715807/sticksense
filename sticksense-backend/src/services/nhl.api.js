const BASE_URL = 'https://api-web.nhle.com/v1';

export async function fetchSchedule(daysAhead) {
  console.log('[fetchSchedule] running');

  const days = daysAhead ?? 10;

  const start = new Date();
  const results = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);

    const iso = d.toISOString();
    const dateStr = iso.split('T')[0];
    const url = `${BASE_URL}/schedule/${dateStr}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`NHL API error: ${response.status} (${dateStr})`);
        continue;
      }

      const json = await response.json();

      let games = [];

      if (json?.gameWeek?.length > 0) {
        const firstWeek = json.gameWeek[0];
        if (firstWeek?.games && Array.isArray(firstWeek.games)) {
          games = firstWeek.games;
        }
      }
      else if (json?.games && Array.isArray(json.games)) {
        games = json.games;
      }

      results.push({
        date: dateStr,
        games
      });

    } catch (err) {
      console.error(`Failed to fetch schedule for ${dateStr}: ${err.message}`);
    }
  }

  return {
    dates: results
  };
}
