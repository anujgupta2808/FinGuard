/**
 * FinGuard Cloud Synchronization Service
 * 
 * Ensures student data remains 100% constant, synced, and identical across 
 * every different browser, device, incognito session, or operating system
 * for the same login.
 */

const KVDB_BUCKET = 'JtkhcqeQ2SskC3iRCHTXqD'
const KVDB_BASE = `https://kvdb.io/${KVDB_BUCKET}`

/**
 * Derives a consistent cloud key for any student email address.
 */
export function getCloudKey(email) {
  if (!email || typeof email !== 'string') return null
  const sanitized = email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
  return `fg_usr_${sanitized}`
}

/**
 * Fetches user account state from the cloud for cross-browser synchronization.
 */
export async function fetchCloudState(email) {
  const key = getCloudKey(email)
  if (!key) return null

  try {
    const res = await fetch(`${KVDB_BASE}/${key}?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    })

    if (res.status === 200) {
      const data = await res.json()
      if (data && typeof data === 'object') {
        return data
      }
    }
  } catch (err) {
    console.warn('Cloud sync fetch unavailable (operating in offline/local mode):', err)
  }
  return null
}

/**
 * Pushes updated user state and account credentials to the cloud.
 */
export async function pushCloudState(email, state, account) {
  const key = getCloudKey(email)
  if (!key || !state) return false

  try {
    const payload = {
      timestamp: Date.now(),
      email: email.trim().toLowerCase(),
      account: account ? {
        name: account.name,
        email: account.email,
        password: account.password,
        major: account.major,
        year: account.year,
        needBased: account.needBased,
      } : null,
      state: {
        user: state.user,
        currency: state.currency || 'INR',
        budgets: state.budgets || { total: 0, categories: {} },
        transactions: Array.isArray(state.transactions) ? state.transactions : [],
        bills: Array.isArray(state.bills) ? state.bills : [],
        splitBills: Array.isArray(state.splitBills) ? state.splitBills : [],
        scholarships: Array.isArray(state.scholarships) ? state.scholarships : [],
        goal: state.goal || { target: 0, current: 0, targetDate: '', title: '' },
        habit: state.habit || { streak: 0, xp: 0, lastCheckin: '' },
        theme: state.theme || 'light',
      },
    }

    const res = await fetch(`${KVDB_BASE}/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return res.ok || res.status === 200 || res.status === 204
  } catch (err) {
    console.warn('Cloud sync push unavailable (data preserved locally):', err)
    return false
  }
}

// In-memory debounce timer for background syncing
let syncTimer = null

/**
 * Debounced background push to prevent network spam while keeping all browsers synced.
 */
export function debounceCloudPush(email, state, account, delay = 800) {
  if (!email || !state) return

  if (syncTimer) {
    clearTimeout(syncTimer)
  }

  syncTimer = setTimeout(() => {
    pushCloudState(email, state, account).catch(() => {})
  }, delay)
}
