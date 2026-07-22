// ─────────────────────────────────────────────
//  timeUtils.js  —  IST (UTC+5:30) time helpers
//
//  Pull resets : 12:00 AM IST  and  12:00 PM IST
//  Arena reset : 12:00 AM IST  (once per day)
// ─────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 19 800 000 ms

/**
 * Returns a Date object representing the current time in IST,
 * by shifting the UTC epoch value so that getUTC* methods
 * return the IST date/time parts.
 */
function nowIST(utcMs = Date.now()) {
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Returns the UTC timestamp (ms) when the current bi-daily pull period started.
 * Periods are: [00:00 IST → 12:00 IST) and [12:00 IST → 00:00 IST next day).
 */
function currentPullPeriodStartUTC(utcMs = Date.now()) {
  const ist = nowIST(utcMs);
  const y   = ist.getUTCFullYear();
  const mo  = ist.getUTCMonth();
  const d   = ist.getUTCDate();
  const h   = ist.getUTCHours();

  const periodHour = h < 12 ? 0 : 12; // midnight IST or noon IST
  return Date.UTC(y, mo, d, periodHour, 0, 0) - IST_OFFSET_MS;
}

/**
 * Returns the UTC timestamp (ms) of the next pull reset.
 */
function nextPullResetUTC(utcMs = Date.now()) {
  const ist  = nowIST(utcMs);
  const y    = ist.getUTCFullYear();
  const mo   = ist.getUTCMonth();
  const d    = ist.getUTCDate();
  const h    = ist.getUTCHours();

  if (h < 12) {
    // Currently in AM period — next reset is noon IST same day
    return Date.UTC(y, mo, d, 12, 0, 0) - IST_OFFSET_MS;
  } else {
    // Currently in PM period — next reset is midnight IST next day
    const tomorrow = new Date(Date.UTC(y, mo, d + 1));
    return Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 0, 0, 0) - IST_OFFSET_MS;
  }
}

/**
 * Returns the UTC timestamp (ms) of IST midnight (start of today).
 * Used for the daily arena reset.
 */
function todayISTMidnightUTC(utcMs = Date.now()) {
  const ist = nowIST(utcMs);
  const y   = ist.getUTCFullYear();
  const mo  = ist.getUTCMonth();
  const d   = ist.getUTCDate();
  return Date.UTC(y, mo, d, 0, 0, 0) - IST_OFFSET_MS;
}

/**
 * Formats milliseconds into a human-readable countdown string.
 * e.g.  7 320 000 ms  →  "2h 2m"
 *       90 000 ms     →  "1m 30s"
 *       5 000 ms      →  "5s"
 */
function formatCountdown(ms) {
  if (ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

module.exports = {
  IST_OFFSET_MS,
  nowIST,
  currentPullPeriodStartUTC,
  nextPullResetUTC,
  todayISTMidnightUTC,
  formatCountdown,
};
