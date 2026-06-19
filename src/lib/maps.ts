/** Build a Maps deep link for a place query.
 *  Uses the Apple Maps URL scheme, which opens Apple Maps on Apple devices
 *  and gracefully falls back to maps.apple.com on the web. */
export function mapsUrl(query: string, cityHint?: string): string {
  const q = cityHint && !query.toLowerCase().includes(cityHint.toLowerCase())
    ? `${query}, ${cityHint}`
    : query;
  return `https://maps.apple.com/?q=${encodeURIComponent(q)}`;
}
