import { useUIStore } from '../store'
import LateInput from '../components/LateInput'
import Icon from '../components/Icon'
import { Link, useNavigate } from 'react-router-dom'
import RegisterModal from './RegisterModal'
import { useState } from 'react'
import UserButton from '../components/UserButton'

interface HeaderProps {
  isScrolled: boolean
  placeholder?: string
  className?: string
  onAddMovieClick?: () => void
}

const Header = ({
  isScrolled,
}: HeaderProps) => {
  const { search, setSearch, view, setView } = useUIStore()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <header
      className={`imdb-navbar transition-all duration-300 shadow-md bg-gradient-to-r from-yellow-50 via-white to-yellow-100 ${
        isScrolled ? 'py-2' : 'py-6'
      } px-4 md:px-12 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50`}
    >
      <div className="flex items-center gap-4">
        <div className="imdb-logo bg-gradient-to-tr from-yellow-400 to-yellow-200 p-1 rounded-full shadow-lg">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12 rounded-full border-2 border-yellow-300 shadow"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 drop-shadow-lg tracking-tight">
          MultiMedia <span className="text-yellow-600">Magic</span>
        </h1>
      </div>
      <div className="search-container w-full md:w-1/3 mt-4 md:mt-0 md:mx-8">
        <LateInput
          value={search}
          onChange={setSearch}
          onDebouncedChange={setSearch}
          debounce={500}
        />
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <UserButton />
        <div className="view-toggle flex gap-2">
          
            <span
              className={`flex items-center rounded-2xl gap-1 px-4 py-2 font-semibold transition-all duration-300 ${
                view === 'grid'
                  ? ''
                  : ''
              }`}
            >
              {/* Grid icon */}
              <button
                onClick={() => setView('grid')}
                className={`flex items-center rounded-2xl gap-1 px-4 py-2 font-semibold transition-all duration-300 ${
                  view === 'grid'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 scale-105'
                    : 'bg-white text-gray-600 hover:bg-yellow-100'
                }`}
              >
                <Icon name="GridIcon" size={20} className="h-5 w-5" />
                <span className="hidden md:inline">Grid</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center rounded-2xl gap-1 px-4 py-2 font-semibold transition-all duration-300 ${
                  view === 'list'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 scale-105'
                    : 'bg-white text-gray-600 hover:bg-yellow-100'
                }`}
              >
                <Icon name="ListIcon" size={20} className="h-5 w-5" />
                <span className="hidden md:inline">List</span>
              </button>
            </span>
        </div>
      </div>
      
      {/* Register Modal */}
      <RegisterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </header>
  )
}

export default Header
