import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Movie } from '../types/Movie'
import Icon from '../components/Icon'
import VideoPlayer from '../components/VideoPlayer'
import { useUserStore } from '../store'

const MovieDetail = () => {
    const { id } = useParams()
    const user = useUserStore(s => s.user)
    const [movie, setMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) {
            setLoading(false)
            setError('You must register or log in to view movie details.')
            return
        }
        const fetcvMovie = async () => {
            try {
                const res = await api.get(`/movies/${id}`)
                setMovie(res.data)
            } catch (e) {
                setError('Movie not found')
            } finally {
                setLoading(false)
            }
        }
        fetcvMovie()
    }, [id, user])

    if (loading) {
        return <p>Loading...</p>
    }
    if (error || !movie) {
        return <div className="text-center py-12 text-yellow-700 font-bold text-xl">{error || 'Movie not found'}</div>
    }
    return (
        <div className="home-container min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden">
            {/* Main content, centered and no scroll needed */}
            <div className="relative z-10 max-w-5xl w-full mx-auto p-4 md:p-8 rounded-3xl shadow-2xl bg-white/90 flex flex-col md:flex-row items-center gap-10 animate-fade-in min-h-[400px] my-0 border-2 border-yellow-300/60" style={{height: '80vh'}}>
                <div className="absolute top-6 left-8 z-30">
                    <Link
                        to="/"
                        className="text-yellow-500 hover:text-yellow-600 font-semibold text-lg inline-flex items-center transition-colors duration-200 bg-white/80 px-4 py-2 rounded-full shadow border border-yellow-300/60"
                    >
                        <span className="mr-2">&larr;</span> Back to Home
                    </Link>
                </div>
                <div className="flex-shrink-0 shadow-xl rounded-2xl overflow-hidden border-4 border-yellow-400 w-64 h-96 bg-white/80">
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <div className="flex-1 flex flex-col gap-3 text-gray-800 justify-center px-2 md:px-8">
                    <h2 className="text-4xl font-extrabold text-yellow-600 drop-shadow mb-2">{movie.title}</h2>
                    <div className="flex flex-wrap gap-3 text-base text-gray-600 mb-1">
                        <span className="bg-yellow-100 px-3 py-1 rounded-full font-medium shadow border border-yellow-300/60">{movie.genre}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium shadow border border-gray-300/60">{movie.year}</span>
                    </div>
                    <div className="text-gray-500 italic mb-2">Directed by <span className="font-semibold text-gray-700">{movie.director}</span></div>
                    <div className="flex items-center gap-2 text-yellow-700 font-bold text-lg mb-2">
                        <Icon name="StarIcon" size={24} className="text-yellow-500" />
                        {movie.rating}
                    </div>
                    <p className="mt-2 text-lg leading-relaxed text-gray-700 bg-white/60 rounded-xl p-4 shadow-inner border border-yellow-100/40 max-h-40 overflow-auto">{movie.description}</p>
                    {movie.videoUrl && (
                        <div className="mt-4 w-full flex justify-center">
                            <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-300/80 bg-black">
                                <VideoPlayer
                                    videoUrl={movie.videoUrl}
                                    poster={movie.poster}
                                    movieId={movie.id}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Subtle yellow circle background like Home */}
            <div className="absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-yellow-100 rounded-full opacity-40 z-0"></div>
            <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-yellow-200 rounded-full opacity-30 z-0"></div>
        </div>
    )
}

export default MovieDetail