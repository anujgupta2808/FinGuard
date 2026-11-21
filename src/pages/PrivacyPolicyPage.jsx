import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  ArrowLeft,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { exportAllData } from '../utils/export'

export function PrivacyPolicyPage() {
  const navigate = useNavigate()
  const { isAuthenticated, state } = useFinance()

  const handleExportData = () => {
    try {
      exportAllData(state)
    } catch (e) {
      console.error('Export failed:', e)
    }
  }

  return (
    <div className={`privacy-page-wrapper ${state?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* Top Navigation Bar */}
      <header className="privacy-navbar">
        <div className="privacy-nav-container">
          <div className="privacy-nav-brand">
            <div className="brand-icon-box">
              <Shield size={20} />
            </div>
            <span className="brand-name">FinGuard</span>
            <span className="brand-badge">Privacy & Trust</span>
          </div>

          <div className="privacy-nav-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(isAuthenticated ? '/' : '/login')}
            >
              <ArrowLeft size={15} />
              {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="privacy-hero">
        <div className="privacy-hero-container">
          <div className="privacy-hero-pill">
            <ShieldCheck size={14} className="text-success" />
            <span>STUDENT DATA PRIVACY COMMITMENT</span>
          </div>
          <h1 className="privacy-hero-title">FinGuard Privacy Policy</h1>
          <p className="privacy-hero-subtitle">
            Transparency, local data sovereignty, and zero commercial exploitation. We protect student financial data by design.
          </p>
          <div className="privacy-meta-row">
            <span><strong>Effective Date:</strong> November 21, 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 2.4.0 (Student Edition)</span>
            <span>•</span>
            <span><strong>Scope:</strong> Web Application & Multi-Device Sync</span>
          </div>

          {/* Core Guarantees Cards */}
          <div className="privacy-guarantees-grid">
            <div className="guarantee-card">
              <EyeOff size={22} className="guarantee-icon text-primary" />
              <strong>Zero Ad Trackers</strong>
              <p>We do not run third-party advertising networks, pixels, or behavioral tracking cookies.</p>
            </div>
            <div className="guarantee-card">
              <Lock size={22} className="guarantee-icon text-success" />
              <strong>No Bank Credentials</strong>
              <p>FinGuard never asks for, connects to, or stores your bank passwords, debit cards, or NetBanking OTPs.</p>
            </div>
            <div className="guarantee-card">
              <Database size={22} className="guarantee-icon text-purple" />
              <strong>Local-First Control</strong>
              <p>Your records live securely on your device, with isolated cloud synchronization for your own logins.</p>
            </div>
            <div className="guarantee-card">
              <UserCheck size={22} className="guarantee-icon text-warning" />
              <strong>100% Data Exportable</strong>
              <p>You own your financial history. Export or completely wipe your data at any time in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Privacy Articles */}
      <main className="privacy-content-container">
        <div className="privacy-articles-card">
          {/* Article 1 */}
          <article className="privacy-article">
            <div className="article-number">01</div>
            <div className="article-body">
              <h2 className="article-title">Introduction & Student Trust Pledge</h2>
              <p>
                FinGuard is built specifically for university and college students to navigate personal budgeting, manage shared room/flat expenses, track utility bills, and find government scholarships without financial anxiety.
              </p>
              <p>
                Unlike commercial financial applications that harvest student transaction behavior to sell credit cards, loan products, or insurance, <strong>FinGuard operates strictly as a student utility</strong>. We do not monetize your personal information or sell your financial habits to third-party data brokers.
              </p>
            </div>
          </article>

          {/* Article 2 */}
          <article className="privacy-article">
            <div className="article-number">02</div>
            <div className="article-body">
              <h2 className="article-title">Information We Collect & Process</h2>
              <p>To provide personal budgeting and scholarship matching, FinGuard processes the following student data:</p>
              <ul className="privacy-list">
                <li>
                  <strong>Student Account Credentials:</strong> Your student name, student email address, academic major, and academic standing (e.g. Freshman, Junior).
                </li>
                <li>
                  <strong>Financial Tracking Records:</strong> Expense and income entries entered by you (title, amount, category, date), monthly budget allocations by category, and upcoming bill due dates.
                </li>
                <li>
                  <strong>Group Split Bill Records:</strong> Split bill amounts, participant names, and settlement checkboxes created for roommate or project expense sharing.
                </li>
                <li>
                  <strong>Scholarship Interactions:</strong> Scholarships you mark as <em>Saved</em> or <em>Submitted</em> from our verified government & Google directory.
                </li>
                <li>
                  <strong>Session Tokens:</strong> Secure client-side tokens generated to verify your active session on your device without exposing your password.
                </li>
              </ul>
            </div>
          </article>

          {/* Article 3 */}
          <article className="privacy-article">
            <div className="article-number">03</div>
            <div className="article-body">
              <h2 className="article-title">How We Use Your Data</h2>
              <p>Your data is processed strictly for the following student-centric purposes:</p>
              <div className="privacy-sub-grid">
                <div className="sub-box">
                  <CheckCircle2 size={16} className="text-success" />
                  <div>
                    <strong>Rule-Based Health Scoring</strong>
                    <p>Transparent evaluation of emergency savings, debt ratios, and budget adherence without opaque AI models.</p>
                  </div>
                </div>
                <div className="sub-box">
                  <CheckCircle2 size={16} className="text-success" />
                  <div>
                    <strong>Scholarship Recommendations</strong>
                    <p>Matching your declared academic major with relevant schemes from the National Scholarship Portal (NSP) and Google.</p>
                  </div>
                </div>
                <div className="sub-box">
                  <CheckCircle2 size={16} className="text-success" />
                  <div>
                    <strong>Multi-Device Continuity</strong>
                    <p>Synchronizing your records so you can view your budget on your phone, tablet, and laptop seamlessly.</p>
                  </div>
                </div>
                <div className="sub-box">
                  <CheckCircle2 size={16} className="text-success" />
                  <div>
                    <strong>Gamified Financial Habits</strong>
                    <p>Tracking streaks and awarding XP for daily expense logging and mindful spending reviews.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Article 4 */}
          <article className="privacy-article">
            <div className="article-number">04</div>
            <div className="article-body">
              <h2 className="article-title">Data Storage, Encryption & Cross-Browser Sync</h2>
              <p>
                FinGuard utilizes a <strong>Local-First Architecture</strong>. By default, your records are saved inside your device's isolated browser storage (<code>localStorage</code> and <code>sessionStorage</code>).
              </p>
              <div className="privacy-callout">
                <ShieldCheck size={20} className="text-primary" />
                <div>
                  <strong>Cross-Browser Cloud Synchronization:</strong>
                  <p>
                    To ensure your financial records remain constant when switching between devices (such as your laptop and smartphone), FinGuard synchronizes encrypted state bundles to isolated cloud key-value storage keyed specifically to your student email. All transmission occurs over TLS 1.3 HTTPS encryption.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Article 5 */}
          <article className="privacy-article">
            <div className="article-number">05</div>
            <div className="article-body">
              <h2 className="article-title">What We NEVER Do</h2>
              <div className="never-grid">
                <div className="never-item">
                  <span className="never-badge">PROHIBITED</span>
                  <strong>Never Sell Student Data</strong>
                  <p>We do not share, lease, trade, or monetize your contact or financial information with recruiters, marketers, or lenders.</p>
                </div>
                <div className="never-item">
                  <span className="never-badge">PROHIBITED</span>
                  <strong>Never Access Bank Accounts</strong>
                  <p>We do not connect via open-banking screen scrapers or ask for your UPI PIN, ATM PIN, or Internet Banking passwords.</p>
                </div>
                <div className="never-item">
                  <span className="never-badge">PROHIBITED</span>
                  <strong>Never Deploy Ad Networks</strong>
                  <p>We have no banner ads, sponsored affiliate trackers, or third-party behavioral profiling scripts on FinGuard.</p>
                </div>
              </div>
            </div>
          </article>

          {/* Article 6 */}
          <article className="privacy-article">
            <div className="article-number">06</div>
            <div className="article-body">
              <h2 className="article-title">Third-Party Portals & External Links</h2>
              <p>
                FinGuard links directly to official government bodies and educational foundations, including:
              </p>
              <ul className="privacy-list">
                <li><strong>National Scholarship Portal (NSP):</strong> <code>scholarships.gov.in</code> (Govt. of India)</li>
                <li><strong>All India Council for Technical Education (AICTE):</strong> <code>aicte-india.org</code></li>
                <li><strong>Department of Science & Technology (DST):</strong> <code>online-inspire.gov.in</code></li>
                <li><strong>Google Build Your Future:</strong> <code>buildyourfuture.withgoogle.com</code></li>
                <li><strong>Reliance Foundation & Tata Trusts:</strong> Official philanthropic grant portals</li>
              </ul>
              <p style={{ marginTop: '10px' }}>
                When you click an external application link, you leave FinGuard and are subject to that respective organization's official privacy and security standards. Always ensure you are on the verified official domain before providing government IDs or Aadhaar details.
              </p>
            </div>
          </article>

          {/* Article 7 */}
          <article className="privacy-article">
            <div className="article-number">07</div>
            <div className="article-body">
              <h2 className="article-title">Your Data Rights & Erasure Options</h2>
              <p>As a student using FinGuard, you retain absolute ownership over your data:</p>
              <ul className="privacy-list">
                <li>
                  <strong>Right to Export:</strong> Download your entire budget, all transactions, split bills, and saved scholarships anytime in open standard JSON format.
                </li>
                <li>
                  <strong>Right to Total Erasure:</strong> Wipe all records from your browser and reset all stored data via <em>Settings → Reset All Data</em>.
                </li>
                <li>
                  <strong>Right to Correction:</strong> Update your student profile, academic major, and preferences at any time in Settings.
                </li>
              </ul>

              <div className="privacy-actions-box">
                <Button
                  variant="secondary"
                  size="md"
                  icon={Download}
                  onClick={handleExportData}
                >
                  Export My FinGuard Data (JSON)
                </Button>
                <Link to="/settings" className="btn btn-secondary btn-md">
                  Manage Account in Settings
                </Link>
              </div>
            </div>
          </article>

          {/* Article 8 */}
          <article className="privacy-article">
            <div className="article-number">08</div>
            <div className="article-body">
              <h2 className="article-title">Updates & Contact</h2>
              <p>
                We may periodically update this policy to reflect new student tools or regulatory updates. Any material updates will be clearly highlighted in the application header.
              </p>
              <p style={{ marginTop: '8px' }}>
                For questions regarding student data protection or technical architecture, reach out via our GitHub repository or contact:
                <br />
                <code>privacy@finguard.student / anujgupta26610812@gmail.com</code>
              </p>
            </div>
          </article>
        </div>

        {/* Footer Return Card */}
        <div className="privacy-footer-card">
          <div className="privacy-footer-left">
            <Shield size={24} className="text-primary" />
            <div>
              <strong>FinGuard Student Privacy Standard</strong>
              <p>Built transparently for students. No hidden clauses, no commercial tracking.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(isAuthenticated ? '/' : '/login')}
          >
            {isAuthenticated ? 'Return to Dashboard' : 'Proceed to Sign In'}
          </Button>
        </div>
      </main>
    </div>
  )
}
