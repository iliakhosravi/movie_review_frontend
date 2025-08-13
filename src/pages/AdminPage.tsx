// src/pages/AdminPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { MOVIES_ENDPOINT } from "../constants/api";
import { USERS_ENDPOINT } from "../constants/userApi";
import { useUserStore, useErrorStore } from "../store";
import Icon from "../components/Icon";
import type { Movie } from "../types/Movie";
import type { User } from "../types/User";
import type { Comment } from "../types/Comment";

type ID = string | number;
const COMMENTS_ENDPOINT = "/comments";

type Tab = "users" | "comments" | "movies";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { error, showError, clearError } = useErrorStore();

  const [activeTab, setActiveTab] = useState<Tab>("comments");

  // users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<ID | null>(null);

  // comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<ID | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [movieFilter, setMovieFilter] = useState<string>(""); // optional filter by movieId

  // movies
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [savingMovie, setSavingMovie] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState<ID | null>(null);

  // guards
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if ((user as any).role && (user as any).role !== "admin") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    // load initial datasets
    refreshUsers();
    refreshMovies();
    refreshComments();
  }, [user]);

  /** -------- Users -------- */
  const refreshUsers = async () => {
    try {
      clearError();
      setLoadingUsers(true);
      const res = await api.get<User[]>(USERS_ENDPOINT);
      setUsers(res.data || []);
    } catch {
      showError("Failed to fetch users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id: ID) => {
    if (!confirm("Delete this user?")) return;
    try {
      clearError();
      setDeletingUserId(id);
      await api.delete(`${USERS_ENDPOINT}/${id}`);
      setUsers((prev) => prev.filter((u) => (u as any).id !== id));
      // optionally: also could delete their comments (json-server has no cascade; manual if you want)
    } catch {
      showError("Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  /** -------- Comments -------- */
  const refreshComments = async () => {
    try {
      clearError();
      setLoadingComments(true);
      const params = new URLSearchParams();
      if (movieFilter.trim()) params.append("movieId", movieFilter.trim());
      params.append("_sort", "createdAt");
      params.append("_order", sortOrder);
      const res = await api.get<Comment[]>(
        `${COMMENTS_ENDPOINT}?${params.toString()}`
      );
      setComments(res.data || []);
    } catch {
      showError("Failed to fetch comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    // reload comments when sort/filter change
    if (user) refreshComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const handleDeleteComment = async (id: ID) => {
    if (!confirm("Delete this comment?")) return;
    try {
      clearError();
      setDeletingCommentId(id);
      await api.delete(`${COMMENTS_ENDPOINT}/${id}`);
      setComments((prev) => prev.filter((c) => (c as any).id !== id));
    } catch {
      showError("Failed to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  /** -------- Movies -------- */
  const refreshMovies = async () => {
    try {
      clearError();
      setLoadingMovies(true);
      const res = await api.get<Movie[]>(MOVIES_ENDPOINT);
      setMovies(res.data || []);
    } catch {
      showError("Failed to fetch movies.");
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleSaveMovie = async (payload: Partial<Movie> & { id: ID }) => {
    // keep schema exactly as your db.json (title, genre, year, director, rating, description, poster, videoUrl)
    try {
      clearError();
      setSavingMovie(true);
      const res = await api.put<Movie>(`${MOVIES_ENDPOINT}/${payload.id}`, {
        ...editingMovie,
        ...payload,
        year: payload.year ? Number(payload.year) : undefined,
        rating: payload.rating ? Number(payload.rating) : undefined,
      });
      setMovies((prev) =>
        prev.map((m) => ((m as any).id === payload.id ? res.data : m))
      );
      setEditingMovie(null);
    } catch {
      showError("Failed to save movie.");
    } finally {
      setSavingMovie(false);
    }
  };

  const handleDeleteMovie = async (id: ID) => {
    if (!confirm("Delete this movie?")) return;
    try {
      clearError();
      setDeletingMovieId(id);
      await api.delete(`${MOVIES_ENDPOINT}/${id}`);
      setMovies((prev) => prev.filter((m) => (m as any).id !== id));
    } catch {
      showError("Failed to delete movie.");
    } finally {
      setDeletingMovieId(null);
    }
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "users") refreshUsers();
                if (activeTab === "comments") refreshComments();
                if (activeTab === "movies") refreshMovies();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                if (confirm("Log out?")) {
                  logout();
                  localStorage.removeItem("userId");
                  navigate("/");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-2xl overflow-hidden border-2 border-yellow-300/60">
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === "comments"
                ? "bg-yellow-400 text-white"
                : "bg-white hover:bg-yellow-50 text-gray-700"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-yellow-400 text-white"
                : "bg-white hover:bg-yellow-50 text-gray-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === "movies"
                ? "bg-yellow-400 text-white"
                : "bg-white hover:bg-yellow-50 text-gray-700"
            }`}
          >
            Movies
          </button>
        </div>

        {/* Panels */}
        {activeTab === "comments" && (
          <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="InfoIcon" size={22} className="text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-800">
                  All Comments
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-700">
                  Movie ID:
                  <input
                    value={movieFilter}
                    onChange={(e) => setMovieFilter(e.target.value)}
                    placeholder="(optional)"
                    className="ml-2 border-2 border-yellow-300 px-3 py-1.5 rounded-lg bg-white"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Sort:
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="ml-2 border-2 border-yellow-300 px-3 py-1.5 rounded-lg bg-white"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
                <button
                  onClick={refreshComments}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>

            {loadingComments ? (
              <div className="text-gray-600">Loading comments…</div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                {comments.map((c) => (
                  <div
                    key={(c as any).id}
                    className="border rounded-2xl p-4 hover:bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 text-gray-700">
                        <span className="px-2 py-0.5 rounded-lg bg-yellow-100 text-sm border border-yellow-300/60">
                          Movie #{(c as any).movieId}
                        </span>
                        <span className="font-semibold">
                          {(c as any).userName}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date((c as any).createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment((c as any).id)}
                        disabled={deletingCommentId === (c as any).id}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        title="Delete comment"
                      >
                        <Icon name="ErrorIcon" size={16} />
                        {deletingCommentId === (c as any).id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                    <p className="text-gray-800 mt-2 whitespace-pre-wrap">
                      {(c as any).text}
                    </p>
                  </div>
                ))}
                {!comments.length && (
                  <div className="text-gray-500">No comments found.</div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "users" && (
          <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="UserIcon" size={22} className="text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Users</h2>
            </div>

            {loadingUsers ? (
              <div className="text-gray-600">Loading users…</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-700 bg-yellow-100">
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={(u as any).id}
                        className="border-b border-yellow-200 hover:bg-yellow-50"
                      >
                        <td className="px-4 py-3">{(u as any).name || "—"}</td>
                        <td className="px-4 py-3">{(u as any).email || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteUser((u as any).id)}
                            disabled={deletingUserId === (u as any).id}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                          >
                            <Icon name="ErrorIcon" size={16} />
                            {deletingUserId === (u as any).id
                              ? "Deleting…"
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr>
                        <td
                          className="px-4 py-6 text-center text-gray-500"
                          colSpan={3}
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "movies" && (
          <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="MovieIcon" size={22} className="text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Movies</h2>
            </div>

            {loadingMovies ? (
              <div className="text-gray-600">Loading movies…</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-700 bg-yellow-100">
                      <th className="px-4 py-3 font-semibold">Poster</th>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Genre</th>
                      <th className="px-4 py-3 font-semibold">Year</th>
                      <th className="px-4 py-3 font-semibold">Director</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr
                        key={(m as any).id}
                        className="border-b border-yellow-200 hover:bg-yellow-50"
                      >
                        <td className="px-4 py-3">
                          {(m as any).poster ? (
                            <img
                              src={(m as any).poster}
                              alt={(m as any).title}
                              className="w-12 h-16 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-12 h-16 rounded-md border flex items-center justify-center text-xs text-gray-400">
                              No poster
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {(m as any).title}
                        </td>
                        <td className="px-4 py-3">{(m as any).genre ?? "—"}</td>
                        <td className="px-4 py-3">{(m as any).year ?? "—"}</td>
                        <td className="px-4 py-3">
                          {(m as any).director ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {(m as any).rating ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingMovie(m)}
                              className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm"
                            >
                              <Icon name="SettingsIcon" size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMovie((m as any).id)}
                              disabled={deletingMovieId === (m as any).id}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                            >
                              <Icon name="ErrorIcon" size={16} />
                              {deletingMovieId === (m as any).id
                                ? "Deleting…"
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!movies.length && (
                      <tr>
                        <td
                          className="px-4 py-6 text-center text-gray-500"
                          colSpan={7}
                        >
                          No movies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Error banner */}
        {error && (
          <div className="mt-6 text-red-600 text-center font-semibold bg-red-50 rounded-xl py-3 px-4 border border-red-200">
            {error}
          </div>
        )}
      </div>

      {editingMovie && (
        <MovieEditModal
          movie={editingMovie}
          onClose={() => setEditingMovie(null)}
          onSave={handleSaveMovie}
          saving={savingMovie}
        />
      )}
    </div>
  );
};

/* ------------------------ Movie Edit Modal ------------------------ */
const MovieEditModal: React.FC<{
  movie: Movie;
  onClose: () => void;
  onSave: (payload: Partial<Movie> & { id: ID }) => void;
  saving: boolean;
}> = ({ movie, onClose, onSave, saving }) => {
  const [form, setForm] = useState<Partial<Movie>>({
    id: (movie as any).id,
    title: (movie as any).title ?? "",
    genre: (movie as any).genre ?? "",
    year: (movie as any).year ?? undefined,
    director: (movie as any).director ?? "",
    rating: (movie as any).rating ?? undefined,
    description: (movie as any).description ?? "",
    poster: (movie as any).poster ?? "",
    videoUrl: (movie as any).videoUrl ?? "",
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!form.title) return;
    onSave({
      ...form,
      id: (movie as any).id,
    });
  };

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-yellow-300/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Edit Movie</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition"
            aria-label="Close"
          >
            <Icon name="CloseIcon" size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field(
              "Title",
              <input
                type="text"
                value={form.title as any}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
            {field(
              "Genre",
              <input
                type="text"
                value={(form.genre as any) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, genre: e.target.value }))
                }
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field(
              "Year",
              <input
                type="number"
                value={(form.year as any) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, year: Number(e.target.value) }))
                }
                min={1888}
                max={new Date().getFullYear() + 1}
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
            {field(
              "Director",
              <input
                type="text"
                value={(form.director as any) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, director: e.target.value }))
                }
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field(
              "Rating",
              <input
                type="number"
                step="0.1"
                value={(form.rating as any) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rating: Number(e.target.value) }))
                }
                min={0}
                max={10}
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
            {field(
              "Poster URL",
              <input
                type="url"
                value={(form.poster as any) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, poster: e.target.value }))
                }
                placeholder="https://…"
                className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            )}
          </div>

          {field(
            "Video URL",
            <input
              type="url"
              value={(form.videoUrl as any) ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, videoUrl: e.target.value }))
              }
              placeholder="/videos/… or https://…"
              className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          )}

          {field(
            "Description",
            <textarea
              rows={4}
              value={(form.description as any) ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full border-2 border-yellow-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
  