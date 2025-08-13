// src/components/CommentList.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Comment } from "../types/Comment";
import StarRating from "./StarRating";
import { COMMENTS_ENDPOINT } from "../constants/api";

const CommentList = ({ movieId }: { movieId: number | string }) => {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Comment[]>(
        `${COMMENTS_ENDPOINT}?movieId=${encodeURIComponent(
          String(movieId)
        )}&_sort=createdAt&_order=desc`
      );
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  if (loading) return <div className="text-gray-500">Loading comments…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="text-gray-500">No comments yet. Be the first!</div>
      )}

      {items.map((c) => (
        <div
          key={String(c.id)}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-yellow-200 p-4"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-semibold text-gray-800">
              {c.userName || `User #${c.userId}`}
              <span className="ml-2 text-sm text-gray-500">
                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={Number(c.rating) || 0} readOnly max={10} />
              <span className="text-sm text-gray-600">{c.rating}/10</span>
            </div>
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{c.text}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
