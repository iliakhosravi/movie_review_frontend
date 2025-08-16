import { useMemo } from "react";
import type { Comment } from "../types/Comment";
import { useUserStore } from "../store";
import Icon from "./Icon";

interface Props {
  comments: Comment[];
  onDelete: (id: number) => void;
  deletingId: number | null;
  className?: string;
}

const CommentList = ({
  comments,
  onDelete,
  deletingId,
  className = "",
}: Props) => {
  const user = useUserStore((s) => s.user);

  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [comments]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {sorted.length === 0 && (
        <div className="text-gray-500">No comments yet. Be the first!</div>
      )}

      {sorted.map((c) => {
        const canDelete =
          !!user && (user.is_admin || String(user.id) === String(c.userId));
        return (
          <div
            key={c.id}
            className="flex items-start gap-3 border border-yellow-200 rounded-2xl p-4 bg-white/90"
          >
            {/* Avatar bubble */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 flex items-center justify-center text-yellow-900 font-bold">
              {(c.userName || "?").slice(0, 1).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">
                    {c.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-yellow-700 font-semibold">
                  <Icon name="StarIcon" size={18} className="text-yellow-500" />
                  {c.rating}/10
                </span>
              </div>

              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{c.text}</p>

              {canDelete && (
                <div className="mt-2">
                  <button
                    onClick={() => onDelete(Number(c.id))}
                    disabled={deletingId === c.id}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold disabled:opacity-60"
                  >
                    {deletingId === c.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
