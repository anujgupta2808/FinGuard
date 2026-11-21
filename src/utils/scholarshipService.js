import { OFFICIAL_SCHOLARSHIPS } from '../data/officialScholarships'

const SYNC_STORAGE_KEY = 'finguard_scholarships_last_sync'
const REMOTE_FEED_URL = 'https://raw.githubusercontent.com/anujgupta2808/FinGuard/main/public/data/scholarships.json'

/**
 * Retrieves the timestamp of the last successful scholarship sync.
 */
export function getLastSyncTime() {
  try {
    return localStorage.getItem(SYNC_STORAGE_KEY) || null
  } catch {
    return null
  }
}

/**
 * Stores the current timestamp of the scholarship sync.
 */
export function setLastSyncTime(timestamp = new Date().toISOString()) {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, timestamp)
  } catch (e) {
    console.error('Failed to save sync timestamp:', e)
  }
}

/**
 * Fetches the latest scholarship feed from:
 * 1. Local public JSON endpoint (./data/scholarships.json)
 * 2. Remote GitHub raw feed (if online)
 * 3. Fallback to bundled official registry (OFFICIAL_SCHOLARSHIPS)
 *
 * Merges with existing student applications while preserving user status (Saved / Submitted).
 */
export async function fetchLiveScholarships(existingScholarships = []) {
  let feedData = null

  // 1. Try local public endpoint
  try {
    const res = await fetch(`./data/scholarships.json?t=${Date.now()}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        feedData = data
      }
    }
  } catch (err) {
    // Local fetch failed or running in isolated environment
  }

  // 2. Try remote repository raw feed if local endpoint was unavailable
  if (!feedData) {
    try {
      const res = await fetch(`${REMOTE_FEED_URL}?t=${Date.now()}`, {
        cache: 'no-cache',
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          feedData = data
        }
      }
    } catch {
      // Remote fetch unavailable
    }
  }

  // 3. Fallback to bundled official scholarships
  if (!feedData) {
    feedData = OFFICIAL_SCHOLARSHIPS
  }

  const existingMap = new Map((existingScholarships || []).map((s) => [s.id, s]))
  let newCount = 0

  const merged = feedData.map((feedItem) => {
    const existing = existingMap.get(feedItem.id)
    if (!existing) {
      newCount += 1
      return {
        ...feedItem,
        isNew: true,
        status: 'Available',
      }
    }
    // Preserve student's saved or submitted status
    return {
      ...feedItem,
      status: existing.status || 'Available',
      isNew: existing.isNew ?? false,
    }
  })

  // Retain any custom / user-added scholarships
  existingMap.forEach((val, id) => {
    if (!feedData.some((f) => f.id === id)) {
      merged.push(val)
    }
  })

  const nowIso = new Date().toISOString()
  setLastSyncTime(nowIso)

  return {
    scholarships: merged,
    newCount,
    timestamp: nowIso,
  }
}
