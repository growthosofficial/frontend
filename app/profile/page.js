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
        <span className="text-gray-600 font-medium">{label}:</span>
        <div className="flex items-center gap-2">
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
                className="bg-white border-lime-200 text-gray-900 text-right w-48 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
              />
              <Button
                onClick={() => handleSave(field)}
                size="sm"
                className="bg-lime-600 hover:bg-lime-700 text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => handleCancel(field)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span className="text-gray-900 font-medium">
                {profile[field] || 'Not set'}
              </span>
              <Button
                onClick={() => handleEdit(field)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100 p-2"
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
      <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
        <SidebarNavigation currentPage="profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mb-4 mx-auto"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
        <SidebarNavigation currentPage="profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-medium mb-2">
              No Profile Found
            </h3>
            <p className="text-red-700 text-sm">
              No profile found. Please complete onboarding first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
      {/* Sidebar Navigation */}
      <SidebarNavigation currentPage="profile" />
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
            <p className="text-gray-700">Manage your personal information and goals</p>
          </div>

          {/* Profile Content */}
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-lime-100 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-32 h-32 mx-auto bg-lime-100">
                    <AvatarImage src={profile.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="bg-lime-100 text-lime-700 text-2xl font-bold">
                      {profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-lime-600 hover:bg-lime-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-gray-600">Change profile picture</p>
              </div>
            </div>

            {/* About You Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-lime-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-lime-100 w-12 h-12 flex items-center justify-center">
                  <span className="text-xl">😎</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">About you</h2>
              </div>

              <div className="space-y-4">
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
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-lime-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-lime-100 w-12 h-12 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Goal</h2>
              </div>

              <div className="space-y-6">
                {/* Goal Idea Box */}
                <div className="bg-lime-50 rounded-lg p-6 border border-lime-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Goal Statement</h3>
                    {!isEditing.goal_idea && (
                      <Button
                        onClick={() => handleEdit('goal_idea')}
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:bg-white p-2"
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
                        className="bg-white border-lime-200 text-gray-900 min-h-[100px] focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave('goal_idea')}
                          size="sm"
                          className="bg-lime-600 hover:bg-lime-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel('goal_idea')}
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-900 font-medium text-lg">
                        {profile.goal_idea || 'Not set'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Goal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Goal Domain Box */}
                  <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-gray-900 font-semibold">Domain:</h3>
                      {!isEditing.goal_domain && (
                        <Button
                          onClick={() => handleEdit('goal_domain')}
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:bg-white p-2"
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
                          className="bg-white border-lime-200 text-gray-900 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave('goal_domain')}
                            size="sm"
                            className="bg-lime-600 hover:bg-lime-700 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleCancel('goal_domain')}
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        {profile.goal_domain || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Target Date Box */}
                  <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-gray-900 font-semibold">Target Date:</h3>
                      {!isEditing.goal_prospective_achieve_date && (
                        <Button
                          onClick={() =>
                            handleEdit('goal_prospective_achieve_date')
                          }
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:bg-white p-2"
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
                          className="bg-white border-lime-200 text-gray-900 focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleSave('goal_prospective_achieve_date')
                            }
                            size="sm"
                            className="bg-lime-600 hover:bg-lime-700 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() =>
                              handleCancel('goal_prospective_achieve_date')
                            }
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        {profile.goal_prospective_achieve_date
                          ? new Date(
                              profile.goal_prospective_achieve_date,
                            ).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Goal Reason Box */}
                <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-900 font-semibold">Why this goal matters:</h3>
                    {!isEditing.goal_reason && (
                      <Button
                        onClick={() => handleEdit('goal_reason')}
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:bg-white p-2"
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
                        className="bg-white border-lime-200 text-gray-900 min-h-[100px] focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave('goal_reason')}
                          size="sm"
                          className="bg-lime-600 hover:bg-lime-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel('goal_reason')}
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700">
                      {profile.goal_reason || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}