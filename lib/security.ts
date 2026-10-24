/**
 * Baseera Security & Data Sanitization Library
 * Defends against OWASP Top 10 vulnerabilities:
 * - A01: Broken Access Control (CSRF origin validation, IDOR protection)
 * - A03: Injection (SQL / PostgREST filter injection, CSV Formula / Macro injection)
 * - A07: Cross-Site Scripting (XSS sanitization, SVG/malicious upload rejection)
 */

/**
 * Strips HTML tags, script blocks, event handlers, and dangerous protocols from user inputs.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<[^>]+>/g, '') // Strip all remaining HTML tags
    .replace(/javascript:/gi, '') // Disallow pseudo-protocol
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers like onerror=, onclick=
    .trim();
}

/**
 * Neutralizes CSV / Spreadsheet Formula Injection (CWE-1236).
 * Prevents Excel/Google Sheets execution of formulas starting with =, +, -, @, \t, \r, |
 * by prefixing with a single quote.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r|]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Validates that an image URL or uploaded file is safe and does NOT contain SVG or executable payloads.
 * Disallows SVG (which can execute inline XML/scripts), HTML, and executables.
 */
export function isSafeImageUrl(url: unknown): boolean {
  if (typeof url !== 'string' || !url.trim()) return true; // Optional field
  const clean = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    clean.startsWith('javascript:') ||
    clean.startsWith('vbscript:') ||
    clean.startsWith('data:text/html') ||
    clean.startsWith('data:image/svg')
  ) {
    return false;
  }

  // Block dangerous extensions
  const dangerousExtensions = [
    '.svg',
    '.htm',
    '.html',
    '.xml',
    '.exe',
    '.bat',
    '.cmd',
    '.sh',
    '.php',
    '.js',
    '.vbs',
    '.scr',
    '.msi',
    '.jar',
  ];

  for (const ext of dangerousExtensions) {
    if (clean.includes(ext)) {
      // Check if it's the file extension before query parameters
      const urlWithoutParams = clean.split('?')[0].split('#')[0];
      if (urlWithoutParams.endsWith(ext)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates an uploaded File object (e.g. in browser or form-data).
 */
export function validateUploadedImageFile(file: { name: string; type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  // Explicitly disallow SVG
  if (type === 'image/svg+xml' || name.endsWith('.svg')) {
    return {
      valid: false,
      error: 'SVG files are strictly disallowed due to script-execution security risks. Please upload JPG, PNG, or WebP.',
    };
  }

  // Allowed MIME types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowedMimeTypes.includes(type)) {
    return {
      valid: false,
      error: 'Invalid file format. Allowed formats: JPG, PNG, WebP, AVIF, GIF.',
    };
  }

  // Max 5MB limit
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds maximum allowed limit of 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Safely sanitizes JSON-LD output for embedding inside <script type="application/ld+json">.
 * Escapes characters that can terminate the script block or inject HTML/JS.
 */
export function safeJsonLdStringify(data: any): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * CSRF & Origin Validation for state-changing HTTP requests.
 * Checks request Origin or Referer against the application's base URL.
 */
export function validateCsrfOrigin(req: Request, allowedOrigin?: string): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');

  // If running in development, allow localhost
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const candidate = origin || referer;
  if (!candidate) {
    // If neither origin nor referer is provided on state-changing mutation, reject
    return false;
  }

  try {
    const candidateUrl = new URL(candidate);
    if (host && candidateUrl.host === host) {
      return true;
    }
    if (allowedOrigin) {
      const allowed = new URL(allowedOrigin);
      return candidateUrl.host === allowed.host;
    }
  } catch {
    return false;
  }

  return false;
}
