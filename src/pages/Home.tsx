import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Movie } from '../types/Movie'
import MovieList from '../components/MovieList'
import AddMovieForm from '../components/AddMovieForm'
import LateInput from '../components/LateInput'
import Header from '../components/Header'
import { MOVIES_ENDPOINT } from '../constants/api'
import { USERS_ENDPOINT } from '../constants/userApi'
import { useUserStore, useUIStore } from '../store'

const Home = () => {
  const setUser = useUserStore(s => s.setUser)
  const { search, setSearch, view, showAddForm, setShowAddForm, isScrolled, setIsScrolled } = useUIStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setIsScrolled])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get(MOVIES_ENDPOINT)
        setMovies(response.data)
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      }
    }
    fetchMovies()
  }, [])

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (userId) {
          const response = await api.get(`${USERS_ENDPOINT}/${userId}`)
          setUser(response.data)
        }
      } catch (error) {
        setUser(null)
      }
    }
    fetchUser()
  }, [setUser])

  return (
    <div className="home-container min-h-screen bg-white">
      <Header
        isScrolled={isScrolled}
        onAddMovieClick={() => setShowAddForm(!showAddForm)}
      />
      {/* Mobile Search */}
      <div className="md:hidden px-4 pt-20 pb-4">
        <LateInput
          value={search}
          onChange={setSearch}
          onDebouncedChange={setDebouncedSearch}
          debounce={500}
        />
      </div>

      <main className="container mx-auto px-4 pt-24 pb-12">
        {showAddForm && (
          <AddMovieForm
            onAdd={() => {
              setDebouncedSearch('')
              setShowAddForm(false)
            }}
          />
        )}

        <MovieList movies={filteredMovies} view={view} />
      </main>
    </div>
  )
}

export default Home