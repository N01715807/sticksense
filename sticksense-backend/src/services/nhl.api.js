const BASE_URL = 'https://statsapi.web.nhl.com/api/v1';

export async function fetchSchedule(daysAhead = 10) {
  //setup startTime and endTime
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + daysAhead);

  //transform to YYYY-MM-DD
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  const url = `${BASE_URL}/schedule?startDate=${startDate}&endDate=${endDate}`;

  //defensive coding
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NHL API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch NHL schedule:', error);
    return null;
  }
}