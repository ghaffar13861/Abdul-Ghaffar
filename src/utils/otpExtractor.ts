/**
 * Extracts numeric or alphanumeric verification codes / OTPs from SMS text.
 */
export function extractOtpCode(text: string): string | undefined {
  if (!text) return undefined;

  // Patterns for typical OTP messages:
  // 1. "431963" or "431-963" or "code: 123456"
  // 2. "G-123456" for Google
  const googlePattern = /\bG-\d{5,6}\b/i;
  const googleMatch = text.match(googlePattern);
  if (googleMatch) return googleMatch[0];

  // Look for explicit code keywords followed by digits:
  // "code is 431963", "code: 431963", "OTP: 1234"
  const keywordPattern = /(?:code|otp|pin|verification|passcode|token|key)(?:[\s:]+(?:is|:)?[\s*]*)([0-9]{4,8})/i;
  const keywordMatch = text.match(keywordPattern);
  if (keywordMatch && keywordMatch[1]) {
    return keywordMatch[1];
  }

  // Look for hyphenated code: "431-963"
  const hyphenatedPattern = /\b\d{3}-\d{3}\b/;
  const hyphenMatch = text.match(hyphenatedPattern);
  if (hyphenMatch) {
    return hyphenMatch[0].replace('-', '');
  }

  // Look for standalone 4 to 8 digit numbers surrounded by non-digits
  const standalonePattern = /(?:^|\s|[^\d])(\d{4,8})(?=[^\d]|$)/g;
  let match: RegExpExecArray | null;
  const candidateCodes: string[] = [];

  while ((match = standalonePattern.exec(text)) !== null) {
    const code = match[1];
    // Ignore common years unless nothing else is found
    if (!['2024', '2025', '2026', '2027'].includes(code)) {
      candidateCodes.push(code);
    }
  }

  if (candidateCodes.length > 0) {
    // Prefer 6-digit codes (standard for WhatsApp, Google, Telegram)
    const sixDigit = candidateCodes.find(c => c.length === 6);
    if (sixDigit) return sixDigit;
    return candidateCodes[0];
  }

  return undefined;
}
