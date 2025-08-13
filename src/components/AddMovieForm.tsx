import { useState } from "react";
import { api } from "../services/api"; // اگر به Django می‌زنی: authApi
import { MOVIES_ENDPOINT } from "../constants/api";
import { useUserStore } from "../store";

type FormState = {
  title: string;
  genre: string;
  year: string;
  director: string;
  rating: string;
  description: string;
  poster: string;
  videoUrl: string;
};

const initialForm: FormState = {
  title: "",
  genre: "",
  year: "",
  director: "",
  rating: "",
  description: "",
  poster: "",
  videoUrl: "",
};

const AddMovieForm = ({ onAdd }: { onAdd?: () => void }) => {
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.is_admin === true;

  const [formData, setFormData] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setError(null);
    setSuccess(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (data: FormState): string | null => {
    if (!data.title.trim()) return "Title is required";
    if (!data.genre.trim()) return "Genre is required";
    if (!data.year.trim()) return "Year is required";
    const yearNum = Number(data.year);
    if (Number.isNaN(yearNum)) return "Year must be a number";
    if (yearNum < 1888 || yearNum > 2100)
      return "Year must be between 1888 and 2100";

    if (!data.director.trim()) return "Director is required";
    if (!data.rating.trim()) return "Rating is required";
    const ratingNum = Number(data.rating);
    if (Number.isNaN(ratingNum)) return "Rating must be a number";
    if (ratingNum < 0 || ratingNum > 10)
      return "Rating must be between 0 and 10";

    if (!data.description.trim()) return "Description is required";
    if (!data.poster.trim()) return "Poster URL is required";
    if (!data.videoUrl.trim()) return "Video URL is required";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAdmin) {
      setError("Only admins can add movies");
      return;
    }

    const v = validate(formData);
    if (v) {
      setError(v);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(MOVIES_ENDPOINT, {
        title: formData.title.trim(),
        genre: formData.genre.trim(),
        year: Number(formData.year),
        director: formData.director.trim(),
        rating: Number(formData.rating),
        description: formData.description.trim(),
        poster: formData.poster.trim(),
        videoUrl: formData.videoUrl.trim(),
      });

      setFormData(initialForm);
      setSuccess("Movie added successfully");
      if (onAdd) onAdd();
    } catch (err) {
      console.error("Failed to add movie:", err);
      setError("Failed to add movie. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white border border-yellow-300 rounded-2xl shadow-xl p-6 md:p-8 mb-8 w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-yellow-600">
          Add a New Movie
        </h2>
        {!isAdmin && (
          <span className="text-xs md:text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-200">
            Admin only
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="title"
          placeholder="Title"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.title}
          required
          disabled={!isAdmin || isSubmitting}
        />

        <input
          name="genre"
          placeholder="Genre"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.genre}
          required
          disabled={!isAdmin || isSubmitting}
        />

        <input
          name="year"
          placeholder="Year (e.g. 1999)"
          inputMode="numeric"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.year}
          required
          disabled={!isAdmin || isSubmitting}
        />

        <input
          name="director"
          placeholder="Director"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.director}
          required
          disabled={!isAdmin || isSubmitting}
        />

        <input
          name="rating"
          placeholder="Rating (0–10)"
          inputMode="decimal"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.rating}
          required
          disabled={!isAdmin || isSubmitting}
        />

        <input
          name="poster"
          placeholder="Poster URL"
          className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onChange={handleChange}
          value={formData.poster}
          required
          disabled={!isAdmin || isSubmitting}
        />
      </div>

      <textarea
        name="description"
        placeholder="Description"
        className="w-full border-2 border-yellow-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[96px] resize-y"
        onChange={handleChange}
        value={formData.description}
        required
        disabled={!isAdmin || isSubmitting}
      />

      <input
        name="videoUrl"
        placeholder="Video URL"
        className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        onChange={handleChange}
        value={formData.videoUrl}
        required
        disabled={!isAdmin || isSubmitting}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setFormData(initialForm);
            setError(null);
            setSuccess(null);
          }}
          className="px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold"
          disabled={isSubmitting}
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-extrabold shadow hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50"
          disabled={!isAdmin || isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Add Movie"}
        </button>
      </div>
    </form>
  );
};

export default AddMovieForm;
