import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Check, GraduationCap, Mail, MapPin } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'

export function ProfilePage() {
  const { state, updateUser } = useFinance()
  const { notify } = useOutletContext()
  const { user } = state

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [major, setMajor] = useState(user?.major || '')
  const [year, setYear] = useState(user?.year || 'Freshman')
  const [needBased, setNeedBased] = useState(Boolean(user?.needBased))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      notify?.('Please enter your name.', 'error')
      return
    }

    updateUser({
      ...user,
      name: name.trim(),
      email: email.trim(),
      major: major.trim(),
      year,
      needBased,
    })

    notify?.('Student profile updated successfully!', 'success')
  }

  return (
    <div className="profile-container">
      <PageHeader
        eyebrow="STUDENT IDENTITY & CRITERIA"
        title="Student Profile"
        description="Your academic standing helps match eligible scholarships and customized budget advice."
      />

      <Card className="profile-card">
        <form onSubmit={handleSubmit} className="fg-form">
          <div className="profile-avatar-row">
            <div className="avatar-circle">
              {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <h3 className="profile-name-display">{name || 'Student Name'}</h3>
              <span className="profile-sub-display">{major} • {year}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="user-name" className="form-label">Full Name</label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-email" className="form-label">Student Email</label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="user-major" className="form-label">Major / Field of Study</label>
              <input
                id="user-major"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science, Economics"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-year" className="form-label">Academic Year</label>
              <select
                id="user-year"
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="Freshman">Freshman (1st Year)</option>
                <option value="Sophomore">Sophomore (2nd Year)</option>
                <option value="Junior">Junior (3rd Year)</option>
                <option value="Senior">Senior (4th Year)</option>
                <option value="Graduate">Graduate / Master's</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={needBased}
                onChange={(e) => setNeedBased(e.target.checked)}
              />
              <span>I qualify for or am interested in need-based student financial grants</span>
            </label>
          </div>

          <div className="profile-form-footer">
            <Button type="submit" variant="primary" icon={Check}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
