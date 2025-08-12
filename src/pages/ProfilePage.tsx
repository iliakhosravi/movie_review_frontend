import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { USERS_ENDPOINT } from '../constants/userApi'
import { useUserStore, useErrorStore } from '../store'
import Icon from '../components/Icon'

const ProfilePage = () => {
  const { user, setUser, logout } = useUserStore()
  const { error, showError, clearError } = useErrorStore()
  const navigate = useNavigate()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    })
  }, [user, navigate])

  const handleSave = async () => {
    if (!user) return
    
    setIsLoading(true)
    clearError()
    
    try {
      const response = await api.put(`${USERS_ENDPOINT}/${user.id}`, {
        ...user,
        ...formData
      })
      
      setUser(response.data)
      setIsEditing(false)
    } catch (e) {
      showError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      localStorage.removeItem('userId')
      navigate('/')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
          >
            <Icon name="HomeIcon" size={20} />
            Back to Home
          </button>
          
          <div className="flex gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      bio: user.bio || '',
                      avatarUrl: user.avatarUrl || ''
                    })
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-4 border-yellow-400 shadow-xl flex items-center justify-center mb-4">
                {user.avatarUrl && user.avatarUrl !== 'icon.png' ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Icon name="UserIcon" size={80} className="text-yellow-700" />
                )}
              </div>
              
              {isEditing && (
                <input
                  type="text"
                  placeholder="Avatar URL"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full border-2 border-yellow-400 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                  />
                ) : (
                  <p className="text-lg text-gray-600">{user.email || 'No email provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-lg text-gray-600">{user.bio || 'No bio provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Since
                </label>
                <p className="text-lg text-gray-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 text-red-600 text-center font-semibold bg-red-50 rounded-xl py-3 px-4 border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-yellow-300/60 p-6 text-center">
            <Icon name="MovieIcon" size={48} className="text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600">Movies Watched</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-yellow-300/60 p-6 text-center">
            <Icon name="HeartIcon" size={48} className="text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600">Favorites</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-yellow-300/60 p-6 text-center">
            <Icon name="StarIcon" size={48} className="text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600">Reviews</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage 