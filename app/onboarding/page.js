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
    <div className="flex gap-2 mb-8">
      {STEPS.map((_, index) => (
        <div
          key={index}
          className={`h-3 flex-1 rounded-full transition-all duration-300 ${
            index <= currentStep ? 'bg-lime-500' : 'bg-white/30'
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
              <div className="rounded-full bg-lime-100 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">😎</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tell us about you
                </h2>
                <p className="text-gray-600">
                  We'll personalize your experience.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  What's your name?
                </label>
                <Input
                  placeholder="Example: Chris"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  What's your birthday?
                </label>
                <Input
                  placeholder="dd.mm.yyyy"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => updateFormData('birth_date', e.target.value)}
                  className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  Where are you currently based?
                </label>
                <Input
                  placeholder="Example: Ho Chi Minh City, Vietnam"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  What's your current working role?
                </label>
                <Input
                  placeholder="Example: Head of Marketing"
                  value={formData.working_role}
                  onChange={(e) =>
                    updateFormData('working_role', e.target.value)
                  }
                  className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  What is your current working industry?
                </label>
                <Input
                  placeholder="Example: Finance, Healthcare, Logistic"
                  value={formData.working_industry}
                  onChange={(e) =>
                    updateFormData('working_industry', e.target.value)
                  }
                  className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-lime-100 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Let's set up your first goal. What's a meaningful goal you
                  want to achieve?
                </h2>
                <p className="text-gray-600">
                  Think specific + exciting. We'll help make it real.
                </p>
              </div>
            </div>

            <Textarea
              placeholder="Example: Build an AI agent in 30 days, Get into YC, Learn Python, etc."
              value={formData.goal_idea}
              onChange={(e) => updateFormData('goal_idea', e.target.value)}
              className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 min-h-[200px] resize-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-lime-100 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  What domain is this goal in?
                </h2>
                <p className="text-gray-600">
                  This helps me tailor research, advice, and support.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {GOAL_DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => updateFormData('goal_domain', domain)}
                  className={`w-full p-4 rounded-lg text-left transition-colors flex items-center justify-between border ${
                    formData.goal_domain === domain
                      ? 'bg-lime-600 text-white border-lime-600'
                      : 'bg-white text-gray-900 hover:bg-lime-50 border-lime-200'
                  }`}
                >
                  <span>{domain}</span>
                  {formData.goal_domain === domain && (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-lime-600"
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
              <div className="rounded-full bg-lime-100 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Why is this goal important to you?
                </h2>
                <p className="text-gray-600">
                  Your "why" fuels consistency. Don't overthink it.
                </p>
              </div>
            </div>

            <Textarea
              placeholder="Type here"
              value={formData.goal_reason}
              onChange={(e) => updateFormData('goal_reason', e.target.value)}
              className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 min-h-[200px] resize-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-lime-100 w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  When do you want to achieve it by?
                </h2>
                <p className="text-gray-600">
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
                  className={`w-full p-4 rounded-lg text-left transition-colors flex items-center justify-between border ${
                    formData.goal_period === period
                      ? 'bg-lime-600 text-white border-lime-600'
                      : 'bg-white text-gray-900 hover:bg-lime-50 border-lime-200'
                  }`}
                >
                  <span>{period}</span>
                  {formData.goal_period === period && (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-lime-600"
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
                className="bg-white border-lime-200 text-gray-900 placeholder:text-gray-400 p-4 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">
              The goal is locked. Let's Make It Happen.
            </h2>

            <div className="w-48 h-48 mx-auto bg-lime-100 rounded-full flex items-center justify-center">
              <Rocket className="w-24 h-24 text-lime-600" />
            </div>

            <p className="text-gray-600 text-lg">
              You've just taken the first step toward real, measurable progress.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-lime-50 to-green-100 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center border border-lime-100 shadow-sm">
          <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-gray-900">
            <span>👋</span> Welcome to GrowthOS!
          </h1>
        </div>

        {/* Main Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-lime-100">
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
                  ? 'text-gray-400 hover:bg-gray-100 disabled:opacity-50'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-lime-600 hover:bg-lime-700 text-white font-semibold px-6 rounded-full shadow-lg"
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="text-center bg-lime-600 hover:bg-lime-700 text-white font-semibold w-12 h-12 rounded-full shadow-lg"
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