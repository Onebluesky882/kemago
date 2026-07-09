/**
 * Constant-time string comparison for secret/signature checks. Avoids
 * `node:crypto`'s `timingSafeEqual` so this stays portable across Workers,
 * Node, and browsers — everything else in this package is Web-Crypto-only
 * for the same reason (see the package README's Requirements section).
 *
 * A length mismatch short-circuits (still returns false immediately), but
 * that leaks only the length, not any byte of the secret — fine for the
 * fixed-length digests (base64/hex HMAC output, static webhook secrets) this
 * is used for. Once lengths match, every character is compared regardless of
 * where an earlier mismatch occurred.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
