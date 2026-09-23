const FALLBACK_SITE_URL = 'https://quantpath.brenshock.chatgpt.site';

export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();

  if (!configuredUrl) return new URL(FALLBACK_SITE_URL);

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      return new URL(FALLBACK_SITE_URL);
    }
    url.pathname = '/';
    url.search = '';
    url.hash = '';
    return url;
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}
