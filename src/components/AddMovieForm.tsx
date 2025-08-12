import { useState } from 'react'
import { api } from '../services/api'
import { MOVIES_ENDPOINT } from '../constants/api'
const AddMovieForm = ({onAdd}: {onAdd: () => void}) => {
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        year: '',
        director: '',
        rating: '',
        description: '',
        poster: '',
        videoUrl: '',
    })
    const [error, setError] = useState<string | null>(null)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post(MOVIES_ENDPOINT, {
                ...formData,
                year: Number(formData.year),
                rating: Number(formData.rating)
            })
            setFormData({ title: '', genre: '', year: '', director: '', rating: '', description: '', poster: '', videoUrl: '' })
            onAdd()
        } catch (error) {
            console.error("Failed to add movie:", error)
        }
    }
    return (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-black border border-yellow-400 rounded-lg shadow-lg p-8 mb-8 max-w-lg mx-auto"
        >
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">Add a New Movie</h2>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <input name="title" placeholder="Title" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.title} required />
            <input name="genre" placeholder="Genre" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.genre} required />
            <input name="year" placeholder="Year" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.year} required />
            <input name="director" placeholder="Director" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.director} required />
            <input name="rating" placeholder="Rating" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.rating} required />
            <textarea name="description" placeholder="Description" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none min-h-[80px] resize-y" onChange={handleChange} value={formData.description} required />
            <input name="poster" placeholder="Poster URL" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.poster} required />
            <input name="videoUrl" placeholder="Video URL" className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none" onChange={handleChange} value={formData.videoUrl} required />
            <button type="submit" className="bg-yellow-400 text-black font-bold text-lg rounded shadow px-6 py-2 uppercase tracking-wide transition hover:bg-yellow-500 mt-2">Add Movie</button>
        </form>
    )
}

export default AddMovieForm