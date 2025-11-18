// src/services/nhl.api.js
const BASE_URL = 'https://api-web.nhle.com/v1';

export async function fetchSchedule(daysAhead = 10) {
  // setup startTime and endTime
  const start = new Date();
  const results = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    // transform to YYYY-MM-DD
    const dateStr = d.toISOString().split('T')[0];

    const url = `${BASE_URL}/schedule/${dateStr}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`NHL API error: ${response.status} (${dateStr})`);
        continue; 
      }

      const json = await response.json();
      results.push(json);
    } catch (error) {
      console.error(`Failed to fetch schedule for ${dateStr}:`, error.message);
    }
  }

  return results;
}
