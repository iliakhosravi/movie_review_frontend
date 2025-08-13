import { useState } from "react";

interface Props {
  // parent خودش پست کردن به API رو انجام میده
  onSubmit: (text: string, rating: number) => Promise<void> | void;
  className?: string;
}

const CommentForm = ({ onSubmit, className = "" }: Props) => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!text.trim()) {
      setErr("Please write a comment.");
      return;
    }
    if (rating < 0 || rating > 10) {
      setErr("Rating must be between 0 and 10.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(text.trim(), rating);
      setText("");
      setRating(10);
    } catch {
      setErr("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full space-y-3 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm font-semibold text-gray-700">Rating</label>
          <input
            type="number"
            min={0}
            max={10}
            step="1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-20 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span className="text-gray-500 text-sm">/10</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write your comment..."
          className="flex-1 border-2 border-yellow-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
        />
      </div>

      {err && (
        <div className="text-red-600 font-semibold bg-red-50 rounded-xl py-2 px-3 border border-red-200">
          {err}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post Comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
