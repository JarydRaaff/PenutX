const WATCHTOWER_URL = process.env.WATCHTOWER_URL || 'http://watchtower:8080';
const WATCHTOWER_TOKEN = process.env.WATCHTOWER_HTTP_API_TOKEN;

export class WatchtowerError extends Error {}

export async function triggerUpdate(imageName?: string): Promise<{ ok: boolean; body: string }> {
  if (!WATCHTOWER_TOKEN) {
    throw new WatchtowerError(
      'WATCHTOWER_HTTP_API_TOKEN is not set. Add it to your .env so Penutx can talk to Watchtower.'
    );
  }

  const url = new URL('/v1/update', WATCHTOWER_URL);
  if (imageName) {
    url.searchParams.set('image', imageName);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${WATCHTOWER_TOKEN}` },
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err) {
    throw new WatchtowerError(
      `Could not reach Watchtower at ${WATCHTOWER_URL}. Is the watchtower service running and on the same network? (${(err as Error).message})`
    );
  }

  const body = await res.text();

  if (!res.ok) {
    throw new WatchtowerError(`Watchtower returned ${res.status}: ${body || res.statusText}`);
  }

  return { ok: true, body };
}
