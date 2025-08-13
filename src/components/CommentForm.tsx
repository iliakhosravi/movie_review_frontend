// src/components/CommentForm.tsx
import { useState } from "react";
import { api } from "../services/api";
import { useUserStore } from "../store";
import StarRating from "./StarRating";
import type { Comment } from "../types/Comment";
import { COMMENTS_ENDPOINT } from "../constants/api";
import { recalculateMovieRating } from "../utils/recalculateMovieRating";

interface Props {
  movieId: number | string;
  onAdded?: (c: Comment) => void;
  onMovieRatingUpdated?: (avg: number) => void;
}

const CommentForm = ({ movieId, onAdded, onMovieRatingUpdated }: Props) => {
  const user = useUserStore((s) => s.user);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be logged in to comment");
      return;
    }
    if (!text.trim()) {
      setError("Comment text is required");
      return;
    }
    if (rating < 1 || rating > 10) {
      setError("Please select a rating between 1 and 10");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Comment = {
        movieId,
        userId: user.id!,
        userName: user.name || "User",
        text: text.trim(),
        rating,
        createdAt: new Date().toISOString(),
      };
      const res = await api.post<Comment>(COMMENTS_ENDPOINT, payload);

      setText("");
      setRating(0);
      onAdded?.(res.data);

      const avg = await recalculateMovieRating(movieId);
      onMovieRatingUpdated?.(avg);
    } catch (e) {
      console.error(e);
      setError("Failed to submit your comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-yellow-200 p-4 md:p-6 space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg md:text-xl font-bold text-yellow-700">
          Write a review
        </h3>
        <StarRating value={rating} onChange={setRating} max={10} />
      </div>

      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <textarea
        placeholder="Share your thoughts about this movie..."
        className="w-full border-2 border-yellow-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px] resize-y"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setText("");
            setRating(0);
            setError(null);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold"
          disabled={isSubmitting}
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-extrabold shadow hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting…" : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
