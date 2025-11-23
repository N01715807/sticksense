const BASE_URL = 'https://api-web.nhle.com/v1';

export async function fetchSchedule(daysAhead) {
  console.log('[fetchSchedule] running');

  if (typeof daysAhead === 'undefined' || daysAhead === null) {
    daysAhead = 10;
  }

  const start = new Date();
  const results = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);

    const iso = d.toISOString();
    const parts = iso.split('T');
    const dateStr = parts[0];
    const url = BASE_URL + '/schedule/' + dateStr;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error('NHL API error: ' + response.status + ' (' + dateStr + ')');
        continue;
      }

      const json = await response.json();

      let games = [];

      if (json && json.gameWeek && json.gameWeek.length > 0) {
        const firstWeek = json.gameWeek[0];
        if (firstWeek && firstWeek.games && Array.isArray(firstWeek.games)) {
          games = firstWeek.games;
        }
      } else if (json && json.games && Array.isArray(json.games)) {
        games = json.games;
      }

      results.push({
        date: dateStr,
        games: games
      });

    } catch (error) {
      console.error('Failed to fetch schedule for ' + dateStr + ':', error.message);
    }
  }

  return {
    dates: results
  };
}
