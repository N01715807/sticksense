import 'dotenv/config';

const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!YT_API_KEY) {
  throw new Error('YOUTUBE_API_KEY missing');
}

export async function searchHighlights(homeName, awayName, dateStr, options) {
  console.log('[youtube.api] searchHighlights', homeName, awayName, dateStr);

  if (!homeName || !awayName || !dateStr) {
    throw new Error('homeName / awayName / dateStr required');
  }

  let maxResults = 10;
  let extraQuery = 'highlights';
  let hoursBefore = 6;
  let hoursAfter = 36;

  if (options) {
    if (options.maxResults) maxResults = options.maxResults;
    if (options.extraQuery) extraQuery = options.extraQuery;
    if (options.hoursBefore) hoursBefore = options.hoursBefore;
    if (options.hoursAfter) hoursAfter = options.hoursAfter;
  }

  const q = `${homeName} vs ${awayName} ${extraQuery}`;

  const baseDate = new Date(`${dateStr}T00:00:00Z`);
  const after = new Date(baseDate.getTime() - hoursBefore * 60 * 60 * 1000);
  const before = new Date(baseDate.getTime() + hoursAfter * 60 * 60 * 1000);

  const params = new URLSearchParams();
  params.append('key', YT_API_KEY);
  params.append('part', 'snippet');
  params.append('type', 'video');
  params.append('maxResults', String(maxResults));
  params.append('q', q);
  params.append('publishedAfter', after.toISOString());
  params.append('publishedBefore', before.toISOString());

  const url = `${YT_BASE_URL}/search?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      let text = '';
      try {
        text = await res.text();
      } catch (e) {
      }
      console.error('[youtube.api] error', res.status, text);
      return [];
    }

    const json = await res.json();

    if (!json?.items || !Array.isArray(json.items)) {
      return [];
    }

    return json.items;
  } catch (err) {
    console.error('[youtube.api] fetch failed:', err.message);
    return [];
  }
}
