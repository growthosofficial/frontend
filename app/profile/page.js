'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Upload } from 'lucide-react'
import { userProfileAPI } from '@/lib/supabase'
import SidebarNavigation from '../../components/SidebarNavigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState({})
  const [editValues, setEditValues] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Get the first profile from the database
      const currentProfile = await userProfileAPI.getFirstProfile()
      
      if (currentProfile) {
        setProfile(currentProfile)
        setEditValues(currentProfile)
        
        // Store the profile ID in localStorage for other parts of the app
        localStorage.setItem('GOS_currentProfileId', currentProfile.id)
        
        console.log('✅ Loaded first profile:', currentProfile)
        return
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }))
  }

  const handleSave = async (field) => {
    try {
      const updatedProfile = { ...profile, [field]: editValues[field] }

      // Update the profile in the database
      await userProfileAPI.updateProfile(profile.id, {
        [field]: editValues[field],
      })

      setProfile(updatedProfile)
      setIsEditing((prev) => ({ ...prev, [field]: false }))

      // console.log('Field being saved:', field)
      // console.log('Edit values:', editValues[field])
      // console.log('Saving profile:', updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    }
  }

  const handleCancel = (field) => {
    setEditValues((prev) => ({ ...prev, [field]: profile[field] }))
    setIsEditing((prev) => ({ ...prev, [field]: false }))
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      console.log('Uploading avatar:', file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar. Please try again.')
    }
  }

  const renderEditableField = (label, field, type = 'text') => {
    const isCurrentlyEditing = isEditing[field]

    return (
      <div className="flex justify-between items-center">
        <span className="text-white/80">{label}:</span>
        <div className="flex items-center gap-1">
          {isCurrentlyEditing ? (
            <>
              <Input
                type={type}
                value={editValues[field] || ''}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className="bg-black/20 border-0 text-white text-right w-48 focus-visible:ring-0"
              />
              <Button
                onClick={() => handleSave(field)}
                size="sm"
                className="bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg"
              >
                Save
              </Button>
              <Button
                onClick={() => handleCancel(field)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white hover:shadow-lg"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span className="text-white font-medium">
                {profile[field] || 'Not set'}
              </span>
              <Button
                onClick={() => handleEdit(field)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white p-2"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-r from-emerald-200 via-blue-200 to-blue-300 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-screen bg-gradient-to-r from-emerald-200 via-blue-200 to-blue-300 flex items-center justify-center">
        <div className="text-white text-xl">
          No profile found. Please complete onboarding first.
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-r from-emerald-200 via-blue-200 to-blue-300 flex">
      {/* Sidebar Navigation */}
      <SidebarNavigation currentPage="profile" />
      
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/90 rounded-2xl p-4 mb-6 text-center">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
              <span>😊</span> User Profile
            </h1>
          </div>

          {/* Profile Content */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            {/* Avatar Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 mx-auto bg-white/20">
                  <AvatarImage src={profile.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg p-2 rounded-full cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-white/80 mt-2">Change profile picture</p>
            </div>

            {/* About You Section */}
            <div className="bg-black/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">😎</div>
                <h2 className="text-xl font-bold text-white">About you</h2>
              </div>

              <div className="space-y-2">
                {renderEditableField('Your name', 'name')}
                {renderEditableField('Your birthday', 'birth_date', 'date')}
                {renderEditableField('Current location', 'location')}
                {renderEditableField('Current working role', 'working_role')}
                {renderEditableField(
                  'Current working industry',
                  'working_industry',
                )}
              </div>
            </div>

            {/* Goals Section */}
            <div className="bg-black/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🎯</div>
                <h2 className="text-xl font-bold text-white">Your Goal</h2>
              </div>

              <div className="space-y-6">
                {/* Goal Idea Box */}
                <div className="bg-black/20 rounded-xl p-6 shadow-white/15 shadow-lg">
                  <div className="flex justify-between items-start">
                    <span></span>
                    {!isEditing.goal_idea && (
                      <Button
                        onClick={() => handleEdit('goal_idea')}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing.goal_idea ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editValues.goal_idea || ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            goal_idea: e.target.value,
                          }))
                        }
                        className="bg-black/20 border-0 text-white min-h-[80px] focus-visible:ring-0"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave('goal_idea')}
                          size="sm"
                          className="bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel('goal_idea')}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10 hover:text-white hover:shadow-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center pb-8">
                      <h2 className="text-white font-bold text-xl">
                        {profile.goal_idea || 'Not set'}
                      </h2>
                    </div>
                  )}
                </div>

                {/* Goal Domain Box */}
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">Domain:</h3>
                    {!isEditing.goal_domain && (
                      <Button
                        onClick={() => handleEdit('goal_domain')}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing.goal_domain ? (
                    <div className="space-y-3">
                      <Input
                        value={editValues.goal_domain || ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            goal_domain: e.target.value,
                          }))
                        }
                        className="bg-black/20 border-0 text-white focus-visible:ring-0"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave('goal_domain')}
                          size="sm"
                          className="bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel('goal_domain')}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10 hover:text-white hover:shadow-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/80">
                      {profile.goal_domain || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Goal Reason Box */}
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">Why:</h3>
                    {!isEditing.goal_reason && (
                      <Button
                        onClick={() => handleEdit('goal_reason')}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing.goal_reason ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editValues.goal_reason || ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            goal_reason: e.target.value,
                          }))
                        }
                        className="bg-black/20 border-0 text-white min-h-[80px] focus-visible:ring-0"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave('goal_reason')}
                          size="sm"
                          className="bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel('goal_reason')}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10 hover:text-white hover:shadow-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/80">
                      {profile.goal_reason || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Target Date Box */}
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">Target Date:</h3>
                    {!isEditing.goal_prospective_achieve_date && (
                      <Button
                        onClick={() =>
                          handleEdit('goal_prospective_achieve_date')
                        }
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {isEditing.goal_prospective_achieve_date ? (
                    <div className="space-y-3">
                      <Input
                        type="date"
                        value={editValues.goal_prospective_achieve_date || ''}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            goal_prospective_achieve_date: e.target.value,
                          }))
                        }
                        className="bg-black/20 border-0 text-white focus-visible:ring-0"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            handleSave('goal_prospective_achieve_date')
                          }
                          size="sm"
                          className="bg-lime-300 hover:bg-lime-300 text-slate-700 hover:text-slate-700 hover:shadow-lg"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() =>
                            handleCancel('goal_prospective_achieve_date')
                          }
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10 hover:text-white hover:shadow-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/80">
                      {profile.goal_prospective_achieve_date
                        ? new Date(
                            profile.goal_prospective_achieve_date,
                          ).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            {/* <div className="bg-black/20 rounded-2xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">🎯</div>
                <h2 className="text-xl font-bold text-white">
                  Anything else to know about you
                </h2>
              </div>

              <Textarea
                placeholder="Interests, values, or preferences to keep in mind"
                className="bg-black/20 border-0 text-white placeholder:text-white/50 min-h-[100px] resize-none"
              />
            </div> */}

            <div className="mb-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
