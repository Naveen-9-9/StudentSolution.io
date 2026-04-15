/**
 * XSS Sanitizer Middleware
 * Strips dangerous HTML/JS from all string fields in req.body recursively.
 * Lightweight regex-based approach — no heavy library dependency.
 */

// Patterns that indicate XSS attempts
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // <script>...</script>
  /<iframe\b[^>]*>/gi,                                       // <iframe>
  /<object\b[^>]*>/gi,                                       // <object>
  /<embed\b[^>]*>/gi,                                        // <embed>
  /<link\b[^>]*>/gi,                                         // <link>
  /on\w+\s*=\s*["'][^"']*["']/gi,                           // onerror="...", onload="..."
  /on\w+\s*=\s*[^\s>]+/gi,                                  // onerror=alert(1)
  /javascript\s*:/gi,                                        // javascript:
  /vbscript\s*:/gi,                                          // vbscript:
  /data\s*:\s*text\/html/gi,                                 // data:text/html
];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let clean = str;
  for (const pattern of XSS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Strip any remaining HTML tags (allow text content only)
  clean = clean.replace(/<[^>]*>/g, '');
  return clean.trim();
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item));
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * NoSQL Injection Sanitizer
 * Recursively removes $ and . from keys in an object to prevent operator injection.
 */
function sanitizeNoSql(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      obj[index] = sanitizeNoSql(item);
    });
    return obj;
  }

  // Iterate over properties and remove dangerous ones or rename keys
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // If key contains $ or ., it's a potential NoSQL injection
      if (key.includes('$') || key.includes('.')) {
        const newKey = key.replace(/[\$.]/g, '_');
        obj[newKey] = sanitizeNoSql(obj[key]);
        delete obj[key];
      } else {
        obj[key] = sanitizeNoSql(obj[key]);
      }
    }
  }
  return obj;
}

const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body); // Modify in-place
  }
  next();
};

const mongoSanitizer = (req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
};

module.exports = { 
  xssSanitizer, 
  mongoSanitizer,
  sanitizeString, 
  sanitizeObject,
  sanitizeNoSql
};
