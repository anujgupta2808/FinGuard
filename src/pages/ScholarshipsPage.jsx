import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, scholarshipScore } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal } from '../components/common/Modal'
import { EmptyState } from '../components/common/EmptyState'

export function ScholarshipsPage() {
  const { state, updateScholarship } = useFinance()
  const { notify } = useOutletContext()
  const { scholarships, user, currency } = state

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'high-match' | 'saved' | 'submitted'
  const [selectedScholarship, setSelectedScholarship] = useState(null)

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
    return scoredScholarships.filter(s => s.matchScore >= 75).length
  }, [scoredScholarships])

  const savedCount = useMemo(() => {
    return scoredScholarships.filter(s => s.status === 'Saved' || s.status === 'In Progress').length
  }, [scoredScholarships])

  const filteredList = useMemo(() => {
    return scoredScholarships.filter((s) => {
      if (activeFilter === 'high-match' && s.matchScore < 75) return false
      if (activeFilter === 'saved' && s.status !== 'Saved' && s.status !== 'In Progress') return false
      if (activeFilter === 'submitted' && s.status !== 'Submitted') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = s.name?.toLowerCase().includes(q)
        const matchOrg = s.org?.toLowerCase().includes(q)
        const matchField = s.field?.toLowerCase().includes(q)
        if (!matchName && !matchOrg && !matchField) return false
      }

      return true
    }).sort((a, b) => b.matchScore - a.matchScore)
  }, [scoredScholarships, activeFilter, searchQuery])

  const fmtDate = (d) => {
    try {
      return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return d
    }
  }

  return (
    <div className="scholarships-container">
      <PageHeader
        eyebrow="STUDENT FUNDING DIRECTORY"
        title="Scholarship Finder"
        description="Discover grants, fellowships, and tuition awards matching your academic profile."
        actions={
          <Link to="/settings" className="btn btn-secondary btn-md">
            <User size={16} /> Edit Student Profile
          </Link>
        }
      />

      {/* Match Banner based on student GPA & Major */}
      <Card className="scholarship-hero-banner">
        <div className="banner-icon-box">
          <GraduationCap size={28} />
        </div>
        <div className="banner-copy">
          <span className="banner-eyebrow">ACADEMIC PROFILE MATCH</span>
          <h3 className="banner-title">
            {highMatchCount} high-probability awards tailored for you
          </h3>
          <p className="banner-desc">
            Evaluated against your <strong>{user?.major || 'Computer Science'}</strong> major and {user?.year || 'Junior'} academic standing.
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
              All Directory ({scholarships.length})
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
              Submitted ({scholarships.filter(s => s.status === 'Submitted').length})
            </button>
          </div>

          <div className="history-search">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by grant name, organization, field..."
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
            description="Try relaxing your search query or reset filter to 'All Directory'."
          />
        ) : (
          <div className="scholarships-list">
            {filteredList.map((s) => {
              const isUrgent = s.daysLeft <= 14 && s.daysLeft >= 0
              const isSubmitted = s.status === 'Submitted'
              const isSaved = s.status === 'Saved' || s.status === 'In Progress'

              return (
                <div key={s.id} className="scholarship-row-card">
                  <div className="sch-icon-col">
                    <div className="sch-cap-icon">
                      <GraduationCap size={22} />
                    </div>
                  </div>

                  <div className="sch-info-col">
                    <div className="sch-title-line">
                      <h4 className="sch-name">{s.name}</h4>
                      <Badge variant={s.matchScore >= 80 ? 'success' : s.matchScore >= 60 ? 'primary' : 'neutral'}>
                        <Sparkles size={11} /> {s.matchScore}% Match
                      </Badge>
                    </div>
                    <span className="sch-org">{s.org}</span>
                    <p className="sch-desc">{s.description}</p>
                    <div className="sch-tags">
                      <span className="tag-pill">{s.field}</span>
                      <span className="tag-pill">{s.level}</span>
                      <span className="tag-pill">{s.minGpa}+ Min GPA</span>
                      {s.need && <span className="tag-pill need-pill">Need-based</span>}
                    </div>
                  </div>

                  <div className="sch-award-col">
                    <span className="award-amount">{formatCurrency(s.amount, currency)}</span>
                    <span className="award-label">grant award</span>
                  </div>

                  <div className="sch-deadline-col">
                    <span className={`deadline-tag ${isUrgent ? 'urgent' : ''}`}>
                      <Clock size={12} />
                      {s.daysLeft < 0 ? 'Closed' : s.daysLeft === 0 ? 'Due Today' : `${s.daysLeft} days left`}
                    </span>
                    <span className="deadline-date">Due {fmtDate(s.deadline)}</span>
                  </div>

                  <div className="sch-actions-col">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedScholarship(s)}
                    >
                      View Details
                    </Button>
                    <button
                      type="button"
                      className={`sch-save-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => {
                        const newStatus = isSaved ? 'Available' : 'Saved'
                        updateScholarship(s.id, newStatus)
                        notify?.(isSaved ? `Removed from saved list.` : `Saved "${s.name}" to your list.`, 'success')
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
          <span>Eligibility criteria and match scores are provided as advisory guidance. Always verify official requirements with sponsoring foundations.</span>
        </div>
      </Card>

      {/* Details Modal */}
      {selectedScholarship && (
        <Modal
          isOpen={Boolean(selectedScholarship)}
          onClose={() => setSelectedScholarship(null)}
          title={selectedScholarship.name}
          subtitle={`Sponsored by ${selectedScholarship.org}`}
          maxWidth="520px"
        >
          <div className="sch-modal-content">
            <div className="sch-modal-award-box">
              <span className="award-title">Grant Award</span>
              <span className="award-value">{formatCurrency(selectedScholarship.amount, currency)}</span>
            </div>

            <p className="modal-body-desc">{selectedScholarship.description}</p>

            <div className="sch-criteria-grid">
              <div className="criteria-box">
                <span className="crit-label">Match Score</span>
                <strong className="crit-val text-success">{selectedScholarship.matchScore}%</strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Deadline</span>
                <strong className="crit-val">{fmtDate(selectedScholarship.deadline)}</strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Minimum GPA</span>
                <strong className="crit-val">{selectedScholarship.minGpa}+</strong>
              </div>
              <div className="criteria-box">
                <span className="crit-label">Eligible Field</span>
                <strong className="crit-val">{selectedScholarship.field}</strong>
              </div>
            </div>

            {selectedScholarship.requirements && (
              <div className="sch-requirements-box">
                <span className="req-title">Eligibility Checklist:</span>
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

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  const isSaved = selectedScholarship.status === 'Saved'
                  updateScholarship(selectedScholarship.id, isSaved ? 'Available' : 'Saved')
                  notify?.(isSaved ? 'Removed from saved' : 'Saved to your list', 'info')
                  setSelectedScholarship(null)
                }}
              >
                {selectedScholarship.status === 'Saved' ? 'Unsave' : 'Save for Later'}
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={() => {
                  updateScholarship(selectedScholarship.id, 'Submitted')
                  notify?.(`Marked application for "${selectedScholarship.name}" as submitted!`, 'success')
                  setSelectedScholarship(null)
                }}
              >
                Mark as Submitted
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
