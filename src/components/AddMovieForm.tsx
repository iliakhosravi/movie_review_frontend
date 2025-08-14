import { useState } from "react";
import { api, authApi } from "../services/api";
import { MOVIE_ADMIN_CREATE_URL } from "../constants/api";

const AddMovieForm = ({ onAdd }: { onAdd: () => void }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    year: "",
    director: "",
    rating: "",
    description: "",
    poster: "",
    videoUrl: "",
    // NEW:
    trailer: "",
    cast: "", // comma-separated input
    views: "", // numeric as string for input
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: any = {
        title: formData.title,
        genre: formData.genre || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        director: formData.director || undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        description: formData.description || undefined,
        poster: formData.poster || undefined,
        videoUrl: formData.videoUrl || undefined,
        // NEW:
        trailer: formData.trailer || undefined,
        cast: formData.cast
          ? formData.cast
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        views: formData.views ? Number(formData.views) : undefined,
      };

      await authApi.post(MOVIE_ADMIN_CREATE_URL, payload);

      setFormData({
        title: "",
        genre: "",
        year: "",
        director: "",
        rating: "",
        description: "",
        poster: "",
        videoUrl: "",
        trailer: "",
        cast: "",
        views: "",
      });

      onAdd();
    } catch (err) {
      console.error("Failed to add movie:", err);
      setError("Failed to add movie");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-black border border-yellow-400 rounded-lg shadow-lg p-8 mb-8 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
        Add a New Movie
      </h2>
      {error && <div className="text-red-500 text-center">{error}</div>}

      <input
        name="title"
        placeholder="Title"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.title}
        required
      />
      <input
        name="genre"
        placeholder="Genre"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.genre}
      />
      <input
        name="year"
        placeholder="Year"
        type="number"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.year}
      />
      <input
        name="director"
        placeholder="Director"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.director}
      />
      <input
        name="rating"
        placeholder="Rating (0-10)"
        type="number"
        step="0.1"
        min={0}
        max={10}
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.rating}
      />
      <textarea
        name="description"
        placeholder="Description"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none min-h-[80px] resize-y"
        onChange={handleChange}
        value={formData.description}
      />
      <input
        name="poster"
        placeholder="Poster URL"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.poster}
      />
      <input
        name="videoUrl"
        placeholder="Video URL"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.videoUrl}
      />

      {/* NEW fields */}
      <input
        name="trailer"
        placeholder="Trailer URL (optional)"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.trailer}
      />
      <input
        name="cast"
        placeholder="Cast (comma separated, e.g. Keanu Reeves, Carrie-Anne Moss)"
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.cast}
      />
      <input
        name="views"
        placeholder="Views (number, optional)"
        type="number"
        min={0}
        className="w-full border border-yellow-300 rounded px-4 py-2 text-base bg-white text-black focus:border-yellow-500 focus:outline-none"
        onChange={handleChange}
        value={formData.views}
      />

      <button
        type="submit"
        className="bg-yellow-400 text-black font-bold text-lg rounded shadow px-6 py-2 uppercase tracking-wide transition hover:bg-yellow-500 mt-2"
      >
        Add Movie
      </button>
    </form>
  );
};

export default AddMovieForm;
