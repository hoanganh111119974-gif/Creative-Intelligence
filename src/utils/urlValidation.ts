export interface UrlValidationResult {
  validUrls: string[];
  invalidLines: string[];
}

const PRIVATE_IPV4_PATTERNS = [
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./,
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '0.0.0.0',
  '::1',
  '[::1]',
  'metadata.google.internal',
  'metadata',
]);

export function isSafePublicHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname)) {
    return false;
  }

  if (
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    return false;
  }

  if (hostname.startsWith('[') || hostname.includes(':')) {
    // Reject IPv6 literals such as [::1], [fe80::...], [fc00::...], [fd00::...]
    return false;
  }

  if (PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return false;
  }

  // Require at least one dot for public domains
  if (!hostname.includes('.')) {
    return false;
  }

  return true;
}

export function parseReferenceUrlsInput(rawText: string, maxUrls = 10): UrlValidationResult {
  const lines = rawText
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const seen = new Set<string>();
  const validUrls: string[] = [];
  const invalidLines: string[] = [];

  for (const line of lines) {
    if (isSafePublicHttpUrl(line)) {
      if (!seen.has(line) && validUrls.length < maxUrls) {
        seen.add(line);
        validUrls.push(line);
      }
    } else {
      invalidLines.push(line);
    }
  }

  return { validUrls, invalidLines };
}

export function extractDomain(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return rawUrl;
  }
}
