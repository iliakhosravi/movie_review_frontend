// src/components/CommentForm.tsx
import { useState } from "react";

interface Props {
  onSubmit: (text: string) => Promise<void> | void;
  disabled?: boolean;
}

export default function CommentForm({ onSubmit, disabled }: Props) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErr("Comment cannot be empty.");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (e) {
      setErr("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your comment…"
        className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base bg-white/90 resize-y min-h-[90px]"
        disabled={disabled || submitting}
      />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button
        type="submit"
        disabled={disabled || submitting}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post Comment"}
      </button>
    </form>
  );
}
