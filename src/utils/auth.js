const ACCOUNTS_KEY = 'finguard-accounts'
const AUTH_KEY = 'finguard-auth'
const SESSION_KEY = 'finguard-session'

export const defaultAccounts = [
  {
    name: 'Anuj Gupta',
    email: 'anuj@example.com',
    password: 'password123',
    major: 'Computer Science',
    year: 'Junior',
    gpa: 3.7,
    location: 'Delhi / Bengaluru',
    needBased: true,
  },
]

export function formatNameFromEmail(email) {
  if (!email || !email.includes('@')) return 'Student'
  const userPart = email.split('@')[0]
  const cleaned = userPart.replace(/[._\-+]/g, ' ')
  const words = cleaned.split(' ').filter(Boolean)
  if (words.length === 0) return 'Student'
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed reading accounts from localStorage:', e)
  }
  return defaultAccounts
}

export function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch (e) {
    console.error('Failed saving accounts to localStorage:', e)
  }
}

export function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed reading session:', e)
  }
  return null
}

export function setStoredSession(session) {
  try {
    if (session) {
      const str = JSON.stringify(session)
      sessionStorage.setItem(SESSION_KEY, str)
      localStorage.setItem(SESSION_KEY, str)
      localStorage.setItem(AUTH_KEY, 'true')
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
      localStorage.setItem(AUTH_KEY, 'false')
    }
  } catch (e) {
    console.error('Failed saving session:', e)
  }
}

export function getStoredAuth() {
  try {
    const session = getStoredSession()
    if (session && session.email) return true
    const raw = localStorage.getItem(AUTH_KEY)
    return raw === 'true'
  } catch {
    return false
  }
}

export function setStoredAuth(isAuth) {
  try {
    localStorage.setItem(AUTH_KEY, isAuth ? 'true' : 'false')
    if (!isAuth) {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(SESSION_KEY)
    }
  } catch (e) {
    console.error('Failed saving auth state to localStorage:', e)
  }
}

/**
 * Creates an encrypted/base64 compact transfer string for cross-browser synchronization.
 */
export function createSessionSyncCode(appState, accounts) {
  try {
    const bundle = {
      v: 1,
      timestamp: Date.now(),
      user: appState?.user,
      budgets: appState?.budgets,
      transactions: appState?.transactions,
      bills: appState?.bills,
      splitBills: appState?.splitBills,
      accounts: accounts || [],
    }
    const jsonStr = JSON.stringify(bundle)
    return btoa(encodeURIComponent(jsonStr))
  } catch (e) {
    console.error('Failed creating sync code:', e)
    return ''
  }
}

/**
 * Decodes a session transfer code from another browser/device.
 */
export function decodeSessionSyncCode(code) {
  try {
    const jsonStr = decodeURIComponent(atob(code.trim()))
    const parsed = JSON.parse(jsonStr)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch (e) {
    console.error('Invalid sync code format:', e)
  }
  return null
}
