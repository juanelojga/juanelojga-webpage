import type { UrlCitation } from './openrouter';

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

export function citationUrls(citations: UrlCitation[]): Set<string> {
  return new Set(citations.filter(c => isHttpsUrl(c.url)).map(c => normalizeUrl(c.url)));
}
