import React, { useState } from 'react'
import { api, authApi } from '../services/api'
// import { USERS_ENDPOINT } from '../constants/userApi'
import { USER_ME_URL, USER_SIGNUP_URL } from '../constants/api'
import { useUserStore, useErrorStore } from '../store'
import Icon from './Icon'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

const RegisterModal = ({ isOpen, onClose }: RegisterModalProps) => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { error, showError, clearError } = useErrorStore()
  const login = useUserStore(s => s.login)

  // Clear error when modal opens
  React.useEffect(() => {
    if (isOpen) {
      clearError()
    }
  }, [isOpen, clearError])

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !password) {
      showError('Name and password are required')
      return
    }

    setIsLoading(true)
    const avatarUrl = "icon.png"
    
    try {
      // Check if user exists
      const res = await authApi.get(`${USER_ME_URL}?name=${encodeURIComponent(name)}`)
      const existingUser = res.data.find((u: any) => u.name === name)
      
      if (existingUser) {
        // Check password
        if (existingUser.password === password) {
          login(existingUser)
          onClose()
          setName('')
          setPassword('')
        } else {
          showError('User already exists with a different password')
        }
        return
      }
      // Register new user
      const response = await authApi.post(USER_SIGNUP_URL, { name, password, avatarUrl })
      login(response.data)
      // DO NOT navigate or reload, just close modal
      onClose()
      setName('')
      setPassword('')
    } catch (e) {
      showError('Registration or login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-yellow-400/80 max-w-md w-full mx-4 animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Icon name="CloseIcon" size={24} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-4 border-yellow-400 shadow-xl flex items-center justify-center mb-4">
            <Icon name="UserIcon" size={48} className="text-yellow-700" />
          </div>
          <h2 className="text-3xl font-extrabold text-yellow-600 mb-2">Welcome!</h2>
          <p className="text-gray-600 text-center">Register or log in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-white/80"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg bg-white/80"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-center font-semibold bg-red-50 rounded-xl py-2 px-3 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Register / Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal