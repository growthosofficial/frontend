'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { userProfileAPI } from '@/lib/supabase'

const STEPS = [
  'Tell us about you',
  "Let's set up your first goal",
  'What domain is this goal in?',
  'Why is this goal important to you?',
  'When do you want to achieve it by?',
  'The goal is locked',
]

const GOAL_DOMAINS = [
  'Career advancement',
  'Skill building',
  'Academic achievement',
  'Personal project',
  'Health & wellness',
]

const TIME_PERIODS = [
  'Within 2 weeks from now',
  'Within 1 month from now',
  'Within 3 months from now',
  'Within 1 year from now',
]

const calculateDate = (period) => {
  const now = new Date()
  const targetDate = new Date()

  switch (period) {
    case 'Within 2 weeks from now':
      targetDate.setDate(now.getDate() + 14)
      break
    case 'Within 1 month from now':
      targetDate.setMonth(now.getMonth() + 1)
      break
    case 'Within 3 months from now':
      targetDate.setMonth(now.getMonth() + 3)
      break
    case 'Within 1 year from now':
      targetDate.setFullYear(now.getFullYear() + 1)
      break
    default:
      return ''
  }

  return targetDate.toISOString().split('T')[0]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    location: '',
    working_role: '',
    working_industry: '',
    goal_idea: '',
    goal_domain: '',
    goal_reason: '',
    goal_period: '',
    goal_prospective_achieve_date: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log('Submitting form data:', formData)

      const userProfileData = {
        name: formData.name,
        birth_date: formData.birth_date,
        location: formData.location,
        working_role: formData.working_role,
        working_industry: formData.working_industry,
        goal_idea: formData.goal_idea,
        goal_domain: formData.goal_domain,
        goal_reason: formData.goal_reason,
        goal_prospective_achieve_date: formData.goal_prospective_achieve_date,
      }

      // Call the API to save the profile
      const data = await userProfileAPI.createProfile(userProfileData)

      // Store the profile ID in localStorage for the profile page
      localStorage.setItem('GOS_currentProfileId', data.id || 'new-profile-id')

      // Redirect to profile page
      router.push('/profile')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProgressBar = () => (
    <div className="flex gap-2 mb-12">
      {STEPS.map((_, index) => (
        <div
          key={index}
          className={`h-4 flex-1 rounded-full ${
            index <= currentStep ? 'bg-lime-300' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-white/15 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">😎</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Tell us about you
                </h2>
                <p className="text-white/80">
                  We'll personalize your experience.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">
                  What's your name?
                </label>
                <Input
                  placeholder="Example: Chris"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="bg-black/20 border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  What's your birthday?
                </label>
                <Input
                  placeholder="dd.mm.yyyy"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => updateFormData('birth_date', e.target.value)}
                  className="bg-black/20 border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  Where are you currently based?
                </label>
                <Input
                  placeholder="Example: Ho Chi Minh City, Vietnam"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="bg-black/20 border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  What's your current working role?
                </label>
                <Input
                  placeholder="Example: Head of Marketing"
                  value={formData.working_role}
                  onChange={(e) =>
                    updateFormData('working_role', e.target.value)
                  }
                  className="bg-black/20 border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  What is your current working industry?
                </label>
                <Input
                  placeholder="Example: Finance, Healthcare, Logistic"
                  value={formData.working_industry}
                  onChange={(e) =>
                    updateFormData('working_industry', e.target.value)
                  }
                  className="bg-black/20 border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-white/15 w-14 h-14 flex items-center justify-center pe-1">
                <span className="text-2xl">&nbsp;🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Let's set up your first goal. What's a meaningful goal you
                  want to achieve?
                </h2>
                <p className="text-white/80">
                  Think specific + exciting. We'll help make it real.
                </p>
              </div>
            </div>

            <Textarea
              placeholder="Example: Build an AI agent in 30 days, Get into YC, Learn Python, etc."
              value={formData.goal_idea}
              onChange={(e) => updateFormData('goal_idea', e.target.value)}
              className="bg-black/20 border-0 text-white placeholder:text-white/50 min-h-[300px] resize-none focus-visible:ring-0"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-white/15 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  What domain is this goal in?
                </h2>
                <p className="text-white/80">
                  This helps me tailor research, advice, and support.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {GOAL_DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => updateFormData('goal_domain', domain)}
                  className={`w-full p-4 rounded-full text-left transition-colors flex items-center justify-between ${
                    formData.goal_domain === domain
                      ? 'bg-white text-black'
                      : 'bg-white/90 text-black hover:bg-white'
                  }`}
                >
                  <span>{domain}</span>
                  {formData.goal_domain === domain && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-white/15 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Why is this goal important to you?
                </h2>
                <p className="text-white/80">
                  Your "why" fuels consistency. Don't overthink it.
                </p>
              </div>
            </div>

            <Textarea
              placeholder="Type here"
              value={formData.goal_reason}
              onChange={(e) => updateFormData('goal_reason', e.target.value)}
              className="bg-black/20 border-0 text-white placeholder:text-white/50 min-h-[300px] resize-none focus-visible:ring-0"
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-white/15 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  When do you want to achieve it by?
                </h2>
                <p className="text-white/80">
                  You can always adjust this later.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    updateFormData('goal_period', period)
                    updateFormData(
                      'goal_prospective_achieve_date',
                      calculateDate(period),
                    )
                  }}
                  className={`w-full p-4 rounded-full text-left transition-colors flex items-center justify-between ${
                    formData.goal_period === period
                      ? 'bg-white text-black'
                      : 'bg-white/90 text-black hover:bg-white'
                  }`}
                >
                  <span>{period}</span>
                  {formData.goal_period === period && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}

              <Input
                placeholder="dd.mm.yyyy"
                type="date"
                value={formData.goal_prospective_achieve_date}
                onChange={(e) => {
                  updateFormData(
                    'goal_prospective_achieve_date',
                    e.target.value,
                  )
                  updateFormData('goal_period', '')
                }}
                className="bg-black/20 border-0 text-white placeholder:text-white/50 p-4 rounded-full focus-visible:ring-0"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-white">
              The goal is locked. Let's Make It Happen.
            </h2>

            <div className="w-48 h-48 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <Rocket className="w-24 h-24 text-white" />
            </div>

            <p className="text-white/80 text-lg">
              You've just taken the first step toward real, measurable progress.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-200 via-blue-200 to-blue-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 rounded-2xl p-4 mb-6 text-center">
          <h1 className="text-xl font-bold flex items-center justify-center gap-2">
            <span>👋</span> Welcome to Growth OS!
          </h1>
        </div>

        {/* Main Form */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          {renderProgressBar()}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="ghost"
              className={`w-12 h-12 rounded-full font-semibold text-center ${
                currentStep === 0
                  ? 'text-white/50 hover:bg-white/10 disabled:opacity-50'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-lime-300 hover:bg-lime-400 text-slate-700 font-semibold px-6 rounded-full drop-shadow-lg"
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="text-center bg-lime-300 hover:bg-lime-400 text-slate-700 font-semibold w-12 h-12 rounded-full drop-shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
