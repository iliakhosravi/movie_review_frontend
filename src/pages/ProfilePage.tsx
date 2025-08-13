// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  MOVIES_ENDPOINT,
  COMMENTS_ENDPOINT,
  FAVORITES_ENDPOINT,
  USERS_ENDPOINT,
} from "../constants/api";
import { useUserStore, useErrorStore } from "../store";
import Icon from "../components/Icon";
import type { Movie } from "../types/Movie";
import type { Comment } from "../types/Comment";
import type { Favorite } from "../types/Favorite";

type Tab = "profile" | "favorites" | "my-comments" | "recommendations";
const toStr = (v: number | string | undefined | null) => String(v ?? "");

const ProfilePage = () => {
  const { user, setUser, logout } = useUserStore();
  const { error, showError, clearError } = useErrorStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: (user as any)?.email || "",
    bio: (user as any)?.bio || "",
    avatarUrl: (user as any)?.avatarUrl || "",
    favoriteGenre: (user as any)?.favoriteGenre || "", // NEW
  });

  const [tab, setTab] = useState<Tab>("profile");

  // Favorites
  const [favMovies, setFavMovies] = useState<Movie[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // My comments
  const [myComments, setMyComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Edit comment modal
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState<number>(0);
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    setFormData({
      name: user.name || "",
      email: (user as any).email || "",
      bio: (user as any).bio || "",
      avatarUrl: (user as any).avatarUrl || "",
      favoriteGenre: (user as any).favoriteGenre || "", // NEW
    });
  }, [user, navigate]);

  // ---------- Save profile ----------
  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    clearError();
    try {
      const response = await api.put(`${USERS_ENDPOINT}/${user.id}`, {
        ...user,
        ...formData,
      });
      setUser(response.data);
      setIsEditing(false);
    } catch {
      showError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.removeItem("userId");
      navigate("/");
    }
  };

  // ---------- Favorites (fetch each movie individually) ----------
  const fetchFavorites = async () => {
    if (!user?.id) return;
    setLoadingFavs(true);
    try {
      const userIdStr = toStr(user.id);
      // 1) get favorites for this user
      const favRes = await api.get<Favorite[]>(
        `${FAVORITES_ENDPOINT}?userId=${encodeURIComponent(
          userIdStr
        )}&_sort=createdAt&_order=desc`
      );
      const favs = favRes.data || [];
      const movieIds = [
        ...new Set(favs.map((f) => toStr(f.movieId)).filter(Boolean)),
      ];

      if (movieIds.length === 0) {
        setFavMovies([]);
        return;
      }

      // 2) fetch each movie by /movies/:id
      const results: Movie[] = [];
      for (const mid of movieIds) {
        try {
          const res = await api.get<Movie>(
            `${MOVIES_ENDPOINT}/${encodeURIComponent(mid)}`
          );
          if (res.data) results.push(res.data);
        } catch {
          // ignore single item error
        }
      }
      setFavMovies(results);
    } finally {
      setLoadingFavs(false);
    }
  };

  useEffect(() => {
    if (tab === "favorites") fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

  // ---------- My comments ----------
  const fetchMyComments = async () => {
    if (!user?.id) return;
    setLoadingComments(true);
    try {
      const userIdStr = toStr(user.id);
      const { data } = await api.get<Comment[]>(
        `${COMMENTS_ENDPOINT}?userId=${encodeURIComponent(
          userIdStr
        )}&_sort=createdAt&_order=desc`
      );
      setMyComments(data || []);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (tab === "my-comments") fetchMyComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

  // ---------- Edit comment modal ----------
  const openEditComment = (c: Comment) => {
    setEditingComment(c);
    setCommentText(c.text);
    setCommentRating(Number(c.rating) || 0);
  };
  const closeEditComment = () => {
    setEditingComment(null);
    setCommentText("");
    setCommentRating(0);
  };
  const saveComment = async () => {
    if (!editingComment?.id) return;
    if (!commentText.trim()) {
      alert("Comment text is required");
      return;
    }
    if (commentRating < 1 || commentRating > 10) {
      alert("Rating must be 1..10");
      return;
    }
    setSavingComment(true);
    try {
      const payload = { text: commentText.trim(), rating: commentRating };
      const { data } = await api.patch<Comment>(
        `${COMMENTS_ENDPOINT}/${editingComment.id}`,
        payload
      );
      setMyComments((prev) =>
        prev.map((x) => (x.id === editingComment.id ? data : x))
      );
      closeEditComment();
    } finally {
      setSavingComment(false);
    }
  };
  const deleteComment = async (id: number | string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`${COMMENTS_ENDPOINT}/${id}`);
      setMyComments((prev) => prev.filter((x) => x.id !== id));
    } catch {}
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
          >
            <Icon name="HomeIcon" size={20} />
            Back to Home
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setTab("profile")}
              className={`px-4 py-2 rounded-xl border ${
                tab === "profile"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setTab("favorites")}
              className={`px-4 py-2 rounded-xl border ${
                tab === "favorites"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setTab("my-comments")}
              className={`px-4 py-2 rounded-xl border ${
                tab === "my-comments"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              My Comments
            </button>
            {/* NEW: Recommendations tab */}
            <button
              onClick={() => setTab("recommendations")}
              className={`px-4 py-2 rounded-xl border ${
                tab === "recommendations"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Recommendations
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        {/* TAB: PROFILE */}
        {tab === "profile" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-4 border-yellow-400 shadow-xl flex items-center justify-center mb-4">
                  {formData.avatarUrl && formData.avatarUrl !== "icon.png" ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon
                      name="UserIcon"
                      size={80}
                      className="text-yellow-700"
                    />
                  )}
                </div>
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    className="w-full border-2 border-yellow-400 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">
                      {user.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                    />
                  ) : (
                    <p className="text-lg text-gray-600">
                      {(user as any).email || "No email provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-lg text-gray-600">
                      {(user as any).bio || "No bio provided"}
                    </p>
                  )}
                </div>

                {/* NEW: Favorite Genre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Genre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.favoriteGenre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          favoriteGenre: e.target.value,
                        })
                      }
                      className="w-full border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-lg"
                      placeholder="e.g. Sci-Fi, Drama, Action"
                    />
                  ) : (
                    <p className="text-lg text-gray-600">
                      {(user as any).favoriteGenre || "Not set"}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || "",
                            email: (user as any).email || "",
                            bio: (user as any).bio || "",
                            avatarUrl: (user as any).avatarUrl || "",
                            favoriteGenre: (user as any).favoriteGenre || "", // NEW
                          });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </button>
                    </>
                  )}
                </div>

                {error && (
                  <div className="mt-4 text-red-600 text-center font-semibold bg-red-50 rounded-xl py-3 px-4 border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FAVORITES */}
        {tab === "favorites" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              My Favorites
            </h2>
            {loadingFavs ? (
              <div className="text-gray-600">Loading favorites…</div>
            ) : favMovies.length === 0 ? (
              <div className="text-gray-600">No favorite movies yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favMovies.map((m) => (
                  <div
                    key={String(m.id)}
                    className="rounded-2xl border border-yellow-200 shadow bg-white overflow-hidden"
                  >
                    <img
                      src={(m as any).poster || (m as any).posterUrl}
                      alt={m.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">{m.title}</h3>
                        <span className="inline-flex items-center gap-1 text-yellow-700">
                          <Icon
                            name="StarIcon"
                            size={16}
                            className="text-yellow-500"
                          />
                          {(m as any).rating ?? 0}/10
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(m as any).genre} • {(m as any).year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: MY COMMENTS */}
        {tab === "my-comments" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">My Comments</h2>
              <button
                onClick={fetchMyComments}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-yellow-50"
              >
                Refresh
              </button>
            </div>

            {loadingComments ? (
              <div className="text-gray-600">Loading comments…</div>
            ) : myComments.length === 0 ? (
              <div className="text-gray-600">
                You haven't posted any comments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myComments.map((c) => (
                  <div
                    key={String(c.id)}
                    className="rounded-2xl border border-yellow-200 shadow bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Movie #{c.movieId} •{" "}
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : ""}
                      </div>
                      <div className="text-sm text-gray-700">{c.rating}/10</div>
                    </div>
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                      {c.text}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openEditComment(c)}
                        className="px-3 py-1.5 rounded bg-white border border-gray-200 hover:bg-yellow-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(c.id!)}
                        className="px-3 py-1.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: RECOMMENDATIONS (NEW) */}
        {tab === "recommendations" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Icon name="InfoIcon" size={22} className="text-yellow-500" />
                Recommendations
              </h2>
              <span className="text-sm text-gray-500">
                Based on your favorite genre:{" "}
                <strong className="text-gray-700">
                  {(user as any)?.favoriteGenre || "—"}
                </strong>
              </span>
            </div>

            {/* Placeholder – بعداً با API پر میشه */}
            <div className="border-2 border-dashed border-yellow-200 rounded-2xl p-8 text-center text-gray-500">
              No recommendations yet.
            </div>
          </div>
        )}

        {/* Edit Comment Modal */}
        {editingComment && (
          <div
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEditComment();
            }}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-yellow-300/70 overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-white flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-yellow-700">
                  Edit Comment
                </h3>
                <button
                  onClick={closeEditComment}
                  className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating (1..10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={commentRating}
                    onChange={(e) => setCommentRating(Number(e.target.value))}
                    className="w-full border-2 border-yellow-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={4}
                    className="w-full border-2 border-yellow-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-end gap-3">
                <button
                  onClick={closeEditComment}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveComment}
                  disabled={savingComment}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-extrabold shadow hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50"
                >
                  {savingComment ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
