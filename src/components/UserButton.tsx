import { useUserStore } from '../store'
import Icon from './Icon'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import RegisterModal from './RegisterModal'

const UserButton = () => {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="register-btn px-4 py-2 rounded-full bg-black text-yellow-900 font-bold shadow hover:bg-yellow-300 transition"
        >
          Register
        </button>
        <RegisterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }
  return (
    <button
      onClick={() => navigate('/profile')}
      className="profile-btn flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 transition"
    >
      {user.avatarUrl && user.avatarUrl !== 'icon.png' ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-8 h-8 rounded-full border border-yellow-300"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-300 flex items-center justify-center">
          <Icon name="UserIcon" size={16} className="text-yellow-700" />
        </div>
      )}
      <span className="hidden md:inline">{user.name}</span>
    </button>
  )
}

export default UserButton
