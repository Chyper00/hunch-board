/**
 * Links come from .hunch files, share links and pasted text, so they are
 * untrusted. Only web and mail links are allowed; anything else
 * (javascript:, data:, vbscript:…) is dropped.
 */
export function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null;
}
