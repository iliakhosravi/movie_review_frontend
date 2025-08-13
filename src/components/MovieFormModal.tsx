import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api"; // اگر با Django کار می‌کنی: import { authApi as api } from '../services/api'
import { MOVIES_ENDPOINT } from "../constants/api";
import { useUserStore } from "../store";
import type { Movie } from "../types/Movie";

type MovieInput = {
  title: string;
  genre: string;
  year: string;
  director: string;
  rating: string;
  description: string;
  poster: string;
  videoUrl: string;
};

const emptyForm: MovieInput = {
  title: "",
  genre: "",
  year: "",
  director: "",
  rating: "",
  description: "",
  poster: "",
  videoUrl: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initial?: Movie | null; // اگر مقدار داشته باشد => حالت Edit
  onSaved?: (saved: Movie) => void;
}

const MovieFormModal = ({ isOpen, onClose, initial, onSaved }: Props) => {
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.is_admin === true;

  const [form, setForm] = useState<MovieInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = useMemo(() => !!initial?.id, [initial?.id]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setIsSubmitting(false);
    if (initial) {
      // پُر کردن فرم از داده‌های فیلم
      setForm({
        title: initial.title || "",
        genre: (initial as any).genre || "",
        year: String((initial as any).year ?? ""),
        director: (initial as any).director || "",
        rating: String((initial as any).rating ?? ""),
        description: (initial as any).description || "",
        poster: (initial as any).poster || (initial as any).posterUrl || "",
        videoUrl: (initial as any).videoUrl || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setError(null);
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (d: MovieInput): string | null => {
    if (!d.title.trim()) return "Title is required";
    if (!d.genre.trim()) return "Genre is required";
    if (!d.year.trim()) return "Year is required";
    const y = Number(d.year);
    if (Number.isNaN(y)) return "Year must be a number";
    if (y < 1888 || y > 2100) return "Year must be between 1888 and 2100";
    if (!d.director.trim()) return "Director is required";
    if (!d.rating.trim()) return "Rating is required";
    const r = Number(d.rating);
    if (Number.isNaN(r)) return "Rating must be a number";
    if (r < 0 || r > 10) return "Rating must be between 0 and 10";
    if (!d.description.trim()) return "Description is required";
    if (!d.poster.trim()) return "Poster URL is required";
    if (!d.videoUrl.trim()) return "Video URL is required";
    return null;
  };

  const payload = {
    title: form.title.trim(),
    genre: form.genre.trim(),
    year: Number(form.year),
    director: form.director.trim(),
    rating: Number(form.rating),
    description: form.description.trim(),
    poster: form.poster.trim(), // کلاینت از poster استفاده می‌کند
    videoUrl: form.videoUrl.trim(),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError("Only admins can save movies");
      return;
    }
    const v = validate(form);
    if (v) {
      setError(v);
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (isEdit && initial?.id != null) {
        res = await api.put<Movie>(`${MOVIES_ENDPOINT}/${initial.id}`, payload);
      } else {
        res = await api.post<Movie>(MOVIES_ENDPOINT, payload);
      }
      onSaved?.(res.data);
      onClose();
    } catch (err) {
      console.error("Save movie failed:", err);
      setError("Failed to save movie. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onBackdrop}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-yellow-300/70 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-white flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-yellow-700">
            {isEdit ? "Edit Movie" : "Add New Movie"}
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-auto"
        >
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Title"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.title}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
            <input
              name="genre"
              placeholder="Genre"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.genre}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
            <input
              name="year"
              placeholder="Year (e.g. 1999)"
              inputMode="numeric"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.year}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
            <input
              name="director"
              placeholder="Director"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.director}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
            <input
              name="rating"
              placeholder="Rating (0–10)"
              inputMode="decimal"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.rating}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
            <input
              name="poster"
              placeholder="Poster URL"
              className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={form.poster}
              onChange={handleChange}
              disabled={!isAdmin || isSubmitting}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            className="border-2 border-yellow-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px] resize-y"
            value={form.description}
            onChange={handleChange}
            disabled={!isAdmin || isSubmitting}
            required
          />

          <input
            name="videoUrl"
            placeholder="Video URL"
            className="border-2 border-yellow-300 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.videoUrl}
            onChange={handleChange}
            disabled={!isAdmin || isSubmitting}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-extrabold shadow hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50"
              disabled={!isAdmin || isSubmitting}
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieFormModal;
