const ACCOUNTS_KEY = 'finguard-accounts'
const AUTH_KEY = 'finguard-auth'

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

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    // If explicitly 'false', return false. If 'true', return true.
    // If not set yet (first visit), return false so the user can experience the login/register flow!
    return raw === 'true'
  } catch {
    return false
  }
}

export function setStoredAuth(isAuth) {
  try {
    localStorage.setItem(AUTH_KEY, isAuth ? 'true' : 'false')
  } catch (e) {
    console.error('Failed saving auth state to localStorage:', e)
  }
}
