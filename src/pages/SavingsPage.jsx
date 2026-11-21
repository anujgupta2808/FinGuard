import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  PiggyBank,
  Sparkles,
  Flame,
  Trophy,
  Plus,
  CheckCircle2,
  Target,
  Check,
  Calendar,
  Wallet,
  GraduationCap,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, weeklySavings, habitScore, CURRENCIES } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal } from '../components/common/Modal'

export function SavingsPage() {
  const { state, updateGoal, contribute, checkin } = useFinance()
  const { notify } = useOutletContext()
  const { goal, habit, currency, scholarships, transactions } = state

  const currencySymbol = CURRENCIES[currency]?.symbol || '₹'

  const score = habitScore(state)
  const weekly = weeklySavings(goal)
  const pct = Math.min(100, Math.round(((goal?.current || 0) / Math.max(1, goal?.target || 1)) * 100))

  const todayStr = new Date().toISOString().slice(0, 10)
  const checkedInToday = habit?.lastCheckin === todayStr

  // Contribution modal state
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contribAmount, setContribAmount] = useState('')

  // Edit goal modal state
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [targetDraft, setTargetDraft] = useState(String(goal?.target || 50000))
  const [dateDraft, setDateDraft] = useState(goal?.targetDate || new Date().toISOString().slice(0, 10))

  const achievements = [
    {
      title: 'Budget Boss',
      desc: 'Maintain spending within planned category envelopes',
      icon: Wallet,
      unlocked: score >= 70,
    },
    {
      title: 'First Savings Milestone',
      desc: 'Reach 25% of your emergency cushion target',
      icon: PiggyBank,
      unlocked: pct >= 25,
    },
    {
      title: 'Consistency Streak',
      desc: 'Log in and track finances for 7 days consecutive',
      icon: Flame,
      unlocked: (habit?.streak || 0) >= 7,
    },
    {
      title: 'Opportunity Hunter',
      desc: 'Bookmark student scholarships or grants',
      icon: GraduationCap,
      unlocked: (scholarships || []).some(s => s.status === 'Saved' || s.status === 'Submitted'),
    },
  ]

  const handleContribute = (e) => {
    e.preventDefault()
    const num = Number(contribAmount)
    if (!num || num <= 0) {
      notify?.('Please enter a valid contribution amount.', 'error')
      return
    }
    contribute(num)
    notify?.(`Added ${formatCurrency(num, currency)} to your savings cushion!`, 'success')
    setContribAmount('')
    setIsContributeOpen(false)
  }

  const handleSaveGoal = (e) => {
    e.preventDefault()
    const num = Number(targetDraft)
    if (!num || num <= 0) {
      notify?.('Please enter a valid target amount.', 'error')
      return
    }
    updateGoal({
      ...goal,
      target: num,
      targetDate: dateDraft,
    })
    notify?.('Savings goal updated.', 'success')
    setIsEditGoalOpen(false)
  }

  return (
    <div className="savings-container">
      <PageHeader
        eyebrow="STUDENT CUSHION & HABITS"
        title="Savings & Wellness"
        description="Grow your emergency safety net and build consistent financial discipline."
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              onClick={() => {
                setTargetDraft(String(goal?.target || 50000))
                setDateDraft(goal?.targetDate || '')
                setIsEditGoalOpen(true)
              }}
            >
              Adjust Goal
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsContributeOpen(true)}
            >
              Add Contribution
            </Button>
          </div>
        }
      />

      {/* Hero Savings Progress Card */}
      <Card className="savings-hero-card">
        <div className="savings-hero-content">
          <div className="savings-hero-text">
            <span className="savings-eyebrow">EMERGENCY SAFETY NET</span>
            <h2 className="savings-title">{formatCurrency(goal?.current || 0, currency)} Saved</h2>
            <p className="savings-desc">
              You’re at <strong>{pct}%</strong> of your <strong>{formatCurrency(goal?.target || 0, currency)}</strong> student target.
            </p>

            <div className="savings-progress-wrap">
              <div className="savings-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            <div className="milestones-row">
              {[25, 50, 75, 100].map(m => (
                <div key={m} className={`milestone-tag ${pct >= m ? 'reached' : ''}`}>
                  <CheckCircle2 size={13} />
                  <span>{m}% Milestone</span>
                </div>
              ))}
            </div>
          </div>

          <div className="savings-weekly-nudge">
            <div className="nudge-icon">
              <Sparkles size={20} />
            </div>
            <span className="nudge-title">Recommended Weekly Pace</span>
            <span className="nudge-amount">{formatCurrency(weekly, currency)}/week</span>
            <p className="nudge-desc">
              Setting aside this small amount weekly keeps your target date comfortable.
            </p>
          </div>
        </div>
      </Card>

      {/* Habit Score & Streaks Section */}
      <div className="habits-grid">
        <Card className="streak-card-main">
          <div className="streak-card-header">
            <div>
              <span className="streak-eyebrow">DAILY DISCIPLINE</span>
              <h3 className="streak-title">Tracking Streak</h3>
            </div>
            <div className="flame-badge">
              <Flame size={24} className="text-warning" />
            </div>
          </div>

          <div className="streak-big-number">
            <span className="streak-val">{habit?.streak || 0}</span>
            <span className="streak-unit">Days Consecutive 🔥</span>
          </div>

          <p className="streak-explainer">
            Consistency beats perfection. Check in each day to log transactions and protect your financial clarity.
          </p>

          <Button
            variant={checkedInToday ? 'secondary' : 'primary'}
            icon={Check}
            onClick={() => {
              checkin()
              notify?.(checkedInToday ? 'Already checked in today!' : 'Daily check-in verified! +15 XP earned.', 'success')
            }}
          >
            {checkedInToday ? 'Checked In Today ✓' : 'Daily Check-In (+15 XP)'}
          </Button>
        </Card>

        <Card className="wellness-card-main">
          <div className="streak-card-header">
            <div>
              <span className="streak-eyebrow">HABIT SCORE</span>
              <h3 className="streak-title">Financial Wellness</h3>
            </div>
            <div className="trophy-badge">
              <Trophy size={24} className="text-primary" />
            </div>
          </div>

          <div className="score-big-row">
            <span className="score-num">{score}</span>
            <span className="score-denom">/ 100 Points</span>
          </div>

          <p className="streak-explainer">
            Combines ledger activity, category budget discipline, savings pace, and timely bill payments.
          </p>

          <div className="achievements-mini-list">
            <span className="achieve-title">Unlocked Badges:</span>
            <div className="badges-flex">
              {achievements.map((ach) => {
                const Icon = ach.icon
                return (
                  <div
                    key={ach.title}
                    className={`badge-pill-item ${ach.unlocked ? 'unlocked' : 'locked'}`}
                    title={ach.desc}
                  >
                    <Icon size={14} />
                    <span>{ach.title}</span>
                    {ach.unlocked && <Check size={11} className="text-success" />}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Contribution Modal */}
      <Modal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        title="Add to Savings Cushion"
        subtitle="Transfer or log funds dedicated to your emergency safety net."
        maxWidth="440px"
      >
        <form onSubmit={handleContribute} className="fg-form">
          <div className="form-group">
            <label htmlFor="contrib-amount" className="form-label">Contribution Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="contrib-amount"
                type="number"
                step="any"
                min="1"
                className="form-input has-prefix"
                placeholder="0.00"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsContributeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus}>
              Confirm Contribution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Goal Modal */}
      <Modal
        isOpen={isEditGoalOpen}
        onClose={() => setIsEditGoalOpen(false)}
        title="Adjust Savings Cushion Goal"
        subtitle="Set an achievable target amount and horizon date."
        maxWidth="440px"
      >
        <form onSubmit={handleSaveGoal} className="fg-form">
          <div className="form-group">
            <label htmlFor="goal-target" className="form-label">Target Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="goal-target"
                type="number"
                step="any"
                min="100"
                className="form-input has-prefix"
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goal-date" className="form-label">Target Date</label>
            <input
              id="goal-date"
              type="date"
              className="form-input"
              value={dateDraft}
              onChange={(e) => setDateDraft(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsEditGoalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Save Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
