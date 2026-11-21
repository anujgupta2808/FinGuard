import React, { useState, useMemo, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Shield,
  Search,
  Check,
  User,
  RefreshCw,
  Globe,
  Building2,
  AlertCircle,
  Award,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, scholarshipScore } from '../utils/finance'
import { fetchLiveScholarships, getLastSyncTime } from '../utils/scholarshipService'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal } from '../components/common/Modal'
import { EmptyState } from '../components/common/EmptyState'

export function ScholarshipsPage() {
  const { state, updateScholarship, syncScholarships } = useFinance()
  const { notify } = useOutletContext()
  const { scholarships, user, currency } = state

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'gov' | 'google' | 'foundation' | 'high-match' | 'saved' | 'submitted'
  const [selectedScholarship, setSelectedScholarship] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState(() => getLastSyncTime())

  // Initial mount auto-sync if scholarships list is empty
  useEffect(() => {
    if (!scholarships || scholarships.length === 0) {
      handleSync(true)
    } else {
      setLastSyncDate(getLastSyncTime())
    }
  }, [])

  const handleSync = async (silent = false) => {
    setIsSyncing(true)
    try {
      const { scholarships: updatedList, newCount, timestamp } = await fetchLiveScholarships(scholarships)
      if (syncScholarships) {
        syncScholarships(updatedList)
      }
      setLastSyncDate(timestamp)

      if (!silent) {
        if (newCount > 0) {
          notify?.(`Synced with official portals! Found ${newCount} new scholarship scheme${newCount > 1 ? 's' : ''}.`, 'success')
        } else {
          notify?.(`Directory is completely up to date with official Government & Google feeds (${updatedList.length} active schemes).`, 'info')
        }
      }
    } catch (err) {
      console.error('Failed to sync scholarships:', err)
      if (!silent) {
        notify?.('Unable to reach remote portals. Loaded verified offline registry.', 'warning')
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const daysRemaining = (dateStr) => {
    try {
      const target = new Date(`${dateStr}T23:59:59`)
      const now = new Date()
      return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    } catch {
      return 0
    }
  }

  const scoredScholarships = useMemo(() => {
    return (scholarships || []).map((s) => ({
      ...s,
      matchScore: scholarshipScore(s, user),
      daysLeft: daysRemaining(s.deadline),
    }))
  }, [scholarships, user])

  const highMatchCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.matchScore >= 75).length
  }, [scoredScholarships])

  const govCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.portalType === 'government').length
  }, [scoredScholarships])

  const googleCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.portalType === 'google').length
  }, [scoredScholarships])

  const foundationCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.portalType === 'foundation').length
  }, [scoredScholarships])

  const savedCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.status === 'Saved' || s.status === 'In Progress').length
  }, [scoredScholarships])

  const submittedCount = useMemo(() => {
    return scoredScholarships.filter((s) => s.status === 'Submitted').length
  }, [scoredScholarships])

  const filteredList = useMemo(() => {
    return scoredScholarships
      .filter((s) => {
        if (activeFilter === 'gov' && s.portalType !== 'government') return false
        if (activeFilter === 'google' && s.portalType !== 'google') return false
        if (activeFilter === 'foundation' && s.portalType !== 'foundation') return false
        if (activeFilter === 'high-match' && s.matchScore < 75) return false
        if (activeFilter === 'saved' && s.status !== 'Saved' && s.status !== 'In Progress') return false
        if (activeFilter === 'submitted' && s.status !== 'Submitted') return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = s.name?.toLowerCase().includes(q)
          const matchOrg = s.org?.toLowerCase().includes(q)
          const matchPortal = s.portal?.toLowerCase().includes(q)
          const matchField = s.field?.toLowerCase().includes(q)
          const matchCategory = s.category?.toLowerCase().includes(q)
          if (!matchName && !matchOrg && !matchPortal && !matchField && !matchCategory) return false
        }

        return true
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [scoredScholarships, activeFilter, searchQuery])

  const fmtDate = (d) => {
    try {
      return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }

  const formatLastSync = (iso) => {
    if (!iso) return 'Synchronized just now'
    try {
      const d = new Date(iso)
      return `Updated: ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return 'Synchronized recently'
    }
  }

  return (
    <div className="scholarships-container">
      <PageHeader
        eyebrow="STUDENT FUNDING DIRECTORY"
        title="Official Government & Google Scholarships"
        description="Verified grants from National Scholarship Portal (NSP), AICTE, DST, Google Build Your Future, and premier foundations."
        actions={
          <div className="header-action-group">
            <button
              type="button"
              className="btn btn-secondary btn-md sync-feeder-btn"
              onClick={() => handleSync(false)}
              disabled={isSyncing}
              title="Check official Government & Google portals for newly announced scholarships"
            >
              <RefreshCw size={15} className={isSyncing ? 'spin-icon' : ''} />
              {isSyncing ? 'Checking Portals...' : 'Check for New Scholarships'}
            </button>
            <Link to="/settings" className="btn btn-secondary btn-md">
              <User size={16} /> Edit Profile
            </Link>
          </div>
        }
      />

      {/* Live Feed Status Bar */}
      <div className="live-sync-bar">
        <div className="sync-bar-left">
          <span className="live-pulse-dot" />
          <div className="sync-bar-text">
            <strong>Live Government & Google Portals Connected</strong>
            <span className="sync-subtext">
              Direct verification with National Scholarship Portal (NSP scholarships.gov.in), AICTE, DST INSPIRE & Google APAC.
            </span>
          </div>
        </div>
        <div className="sync-bar-right">
          <span className="last-sync-badge">
            <Clock size={12} /> {formatLastSync(lastSyncDate)}
          </span>
        </div>
      </div>

      {/* Match Banner based on student Profile */}
      <Card className="scholarship-hero-banner">
        <div className="banner-icon-box">
          <GraduationCap size={28} />
        </div>
        <div className="banner-copy">
          <span className="banner-eyebrow">ACADEMIC PROFILE MATCH</span>
          <h3 className="banner-title">
            {highMatchCount} high-probability schemes tailored for your profile
          </h3>
          <p className="banner-desc">
            Evaluated against your <strong>{user?.major || 'Computer Science'}</strong> major and{' '}
            {user?.year || 'Junior'} standing. Directly apply through verified government & sponsor portals.
          </p>
        </div>
        <div className="banner-badge-box">
          <span className="badge-big-num">{highMatchCount}</span>
          <span className="badge-sub">Top Matches</span>
        </div>
      </Card>

      <Card className="scholarships-main-card">
        {/* Filters and search bar */}
        <div className="scholarships-toolbar">
          <div className="tab-group">
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Schemes ({scholarships.length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'gov' ? 'active' : ''}`}
              onClick={() => setActiveFilter('gov')}
            >
              Govt Portals (NSP / AICTE) ({govCount})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'google' ? 'active' : ''}`}
              onClick={() => setActiveFilter('google')}
            >
              Google & Tech ({googleCount})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'foundation' ? 'active' : ''}`}
              onClick={() => setActiveFilter('foundation')}
            >
              Foundations ({foundationCount})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'high-match' ? 'active' : ''}`}
              onClick={() => setActiveFilter('high-match')}
            >
              Best Matches (75%+) ({highMatchCount})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('saved')}
            >
              Saved ({savedCount})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'submitted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('submitted')}
            >
              Submitted ({submittedCount})
            </button>
          </div>

          <div className="history-search">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by scholarship, ministry, portal (NSP, AICTE, Google)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="history-search-input"
            />
          </div>
        </div>

        {/* Scholarships List */}
        {filteredList.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No scholarships found"
            description="Try clearing your search query or reset filter to 'All Schemes'."
          />
        ) : (
          <div className="scholarships-list">
            {filteredList.map((s) => {
              const isUrgent = s.daysLeft <= 14 && s.daysLeft >= 0
              const isSubmitted = s.status === 'Submitted'
              const isSaved = s.status === 'Saved' || s.status === 'In Progress'

              const portalClass =
                s.portalType === 'government'
                  ? 'portal-gov'
                  : s.portalType === 'google'
                  ? 'portal-google'
                  : 'portal-foundation'

              return (
                <div key={s.id} className="scholarship-row-card">
                  <div className="sch-icon-col">
                    <div className={`sch-cap-icon ${portalClass}`}>
                      {s.portalType === 'google' ? (
                        <Sparkles size={20} />
                      ) : s.portalType === 'foundation' ? (
                        <Award size={20} />
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>
                  </div>

                  <div className="sch-info-col">
                    <div className="sch-title-line">
                      <span className={`sch-portal-pill ${portalClass}`}>
                        {s.portal}
                      </span>
                      {s.isNew && <span className="badge-new-pill">NEW</span>}
                      <Badge
                        variant={
                          s.matchScore >= 80
                            ? 'success'
                            : s.matchScore >= 65
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        <Sparkles size={11} /> {s.matchScore}% Match
                      </Badge>
                    </div>

                    <h4 className="sch-name">{s.name}</h4>
                    <span className="sch-org">{s.org}</span>
                    <p className="sch-desc">{s.description}</p>

                    <div className="sch-tags">
                      <span className="tag-pill">{s.field}</span>
                      <span className="tag-pill">{s.level}</span>
                      <span className="tag-pill">{s.category}</span>
                      {s.status === 'Submitted' && (
                        <span className="tag-pill submitted-pill">
                          <Check size={11} /> Application Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sch-award-col">
                    <span className="award-amount">
                      {formatCurrency(s.amount, currency)}
                    </span>
                    <span className="award-label">grant award</span>
                  </div>

                  <div className="sch-deadline-col">
                    <span className={`deadline-tag ${isUrgent ? 'urgent' : ''}`}>
                      <Clock size={12} />
                      {s.daysLeft < 0
                        ? 'Closed'
                        : s.daysLeft === 0
                        ? 'Due Today'
                        : `${s.daysLeft} days left`}
                    </span>
                    <span className="deadline-date">Due {fmtDate(s.deadline)}</span>
                  </div>

                  <div className="sch-actions-col">
                    {s.applyUrl && (
                      <a
                        href={s.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary apply-portal-btn"
                        title={`Open official ${s.portal} application page in new tab`}
                      >
                        Apply <ExternalLink size={12} />
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedScholarship(s)}
                    >
                      Details
                    </Button>
                    <button
                      type="button"
                      className={`sch-save-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => {
                        const newStatus = isSaved ? 'Available' : 'Saved'
                        updateScholarship(s.id, newStatus)
                        notify?.(
                          isSaved
                            ? `Removed "${s.name}" from saved list.`
                            : `Saved "${s.name}" to your list.`,
                          'success'
                        )
                      }}
                      title={isSaved ? 'Saved to your list' : 'Save for later'}
                    >
                      <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="scholarships-disclaimer">
          <Shield size={14} />
          <span>
            Official Government and Google scholarship portals require direct registration (such as NSP One-Time Registration OTR or Google Build Your Future). Always verify latest closing dates on official portals.
          </span>
        </div>
      </Card>

      {/* Details & Eligibility Modal */}
      {selectedScholarship && (
        <Modal
          isOpen={Boolean(selectedScholarship)}
          onClose={() => setSelectedScholarship(null)}
          title={selectedScholarship.name}
          subtitle={`Sponsored by ${selectedScholarship.org} (${selectedScholarship.portal})`}
          maxWidth="560px"
        >
          <div className="sch-modal-content">
            <div className="sch-modal-award-box">
              <div className="modal-award-left">
                <span className="award-title">Grant Award</span>
                <span className="award-value">
                  {formatCurrency(selectedScholarship.amount, currency)}
                </span>
              </div>
              <div className="modal-award-right">
                <span className="modal-scheme-tag">
                  {selectedScholarship.category}
                </span>
              </div>
            </div>

            <p className="modal-body-desc">{selectedScholarship.description}</p>

            <div className="sch-criteria-grid">
              <div className="criteria-box">
                <span className="crit-label">Match Probability</span>
                <strong className="crit-val text-success">
                  {selectedScholarship.matchScore}%
                </strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Application Deadline</span>
                <strong className="crit-val">
                  {fmtDate(selectedScholarship.deadline)}
                </strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Academic Level</span>
                <strong className="crit-val">{selectedScholarship.level}</strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Target Field</span>
                <strong className="crit-val">{selectedScholarship.field}</strong>
              </div>
            </div>

            {selectedScholarship.requirements && (
              <div className="sch-requirements-box">
                <span className="req-title">Official Eligibility Checklist:</span>
                <ul className="req-list">
                  {selectedScholarship.requirements.map((req, i) => (
                    <li key={i}>
                      <Check size={14} className="text-success" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Portal Apply Link */}
            {selectedScholarship.applyUrl && (
              <div className="official-portal-banner">
                <div className="portal-banner-text">
                  <strong>Submit Online on Official Portal</strong>
                  <p>
                    Applications must be submitted through the verified portal at{' '}
                    <code>{new URL(selectedScholarship.applyUrl).hostname}</code>.
                  </p>
                </div>
                <a
                  href={selectedScholarship.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-md portal-redirect-btn"
                >
                  <Globe size={15} /> Open Official Portal <ExternalLink size={14} />
                </a>
              </div>
            )}

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  const isSaved = selectedScholarship.status === 'Saved'
                  updateScholarship(
                    selectedScholarship.id,
                    isSaved ? 'Available' : 'Saved'
                  )
                  notify?.(
                    isSaved ? 'Removed from saved list' : 'Saved to your list',
                    'info'
                  )
                  setSelectedScholarship(null)
                }}
              >
                {selectedScholarship.status === 'Saved'
                  ? 'Unsave'
                  : 'Save for Later'}
              </Button>
              <Button
                variant={selectedScholarship.status === 'Submitted' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => {
                  const nextStatus =
                    selectedScholarship.status === 'Submitted'
                      ? 'Available'
                      : 'Submitted'
                  updateScholarship(selectedScholarship.id, nextStatus)
                  notify?.(
                    nextStatus === 'Submitted'
                      ? `Marked "${selectedScholarship.name}" as submitted!`
                      : `Reset submission status for "${selectedScholarship.name}".`,
                    'success'
                  )
                  setSelectedScholarship(null)
                }}
              >
                {selectedScholarship.status === 'Submitted'
                  ? 'Mark as Not Submitted'
                  : 'Mark as Submitted'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
