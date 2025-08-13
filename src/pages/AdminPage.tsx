import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { MOVIES_ENDPOINT } from "../constants/api";
import { USERS_ENDPOINT } from "../constants/userApi";
import { useUserStore } from "../store";
import type { Movie } from "../types/Movie";
import type { User } from "../types/User";
import type { Comment } from "../types/Comment";
import Icon from "../components/Icon";
import MovieFormModal from "../components/MovieFormModal";
import { recalculateMovieRating } from "../utils/recalculateMovieRating";

const COMMENTS_ENDPOINT = "/comments";

type Tab = "movies" | "comments" | "users";

const AdminPage = () => {
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.is_admin === true;

  const [activeTab, setActiveTab] = useState<Tab>("movies");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState({
    movies: false,
    comments: false,
    users: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Comments controls
  const [commentSort, setCommentSort] = useState<"desc" | "asc">("desc");
  const [commentSearch, setCommentSearch] = useState("");

  const setLoader = (k: keyof typeof loading, v: boolean) =>
    setLoading((prev) => ({ ...prev, [k]: v }));

  // --- Fetchers ---
  const fetchMovies = async () => {
    setLoader("movies", true);
    setError(null);
    try {
      const res = await api.get<Movie[]>(MOVIES_ENDPOINT);
      setMovies(res.data || []);
    } catch {
      setError("Failed to load movies");
    } finally {
      setLoader("movies", false);
    }
  };

  const fetchComments = async () => {
    setLoader("comments", true);
    setError(null);
    try {
      const res = await api.get<Comment[]>(
        `${COMMENTS_ENDPOINT}?_sort=createdAt&_order=${commentSort}`
      );
      setComments(res.data || []);
    } catch {
      setError("Failed to load comments");
    } finally {
      setLoader("comments", false);
    }
  };

  const fetchUsers = async () => {
    setLoader("users", true);
    setError(null);
    try {
      const res = await api.get<User[]>(USERS_ENDPOINT);
      setUsers(res.data || []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoader("users", false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchMovies();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "comments" && isAdmin) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, commentSort, isAdmin]);

  useEffect(() => {
    if (activeTab === "users" && isAdmin) fetchUsers();
  }, [activeTab, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          Access denied: Admins only.
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const openAddMovie = () => {
    setEditingMovie(null);
    setIsMovieModalOpen(true);
  };
  const openEditMovie = (m: Movie) => {
    setEditingMovie(m);
    setIsMovieModalOpen(true);
  };
  const closeMovieModal = () => {
    setIsMovieModalOpen(false);
  };

  const upsertMovieInState = (saved: Movie) => {
    setMovies((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(saved.id));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteMovie = async (id: number | string) => {
    if (!confirm("Delete this movie?")) return;
    try {
      await api.delete(`${MOVIES_ENDPOINT}/${id}`);
      setMovies((prev) => prev.filter((m) => String(m.id) !== String(id)));
    } catch {
      setError("Failed to delete movie");
    }
  };

  const handleDeleteComment = async (
    id: number | string,
    movieId?: number | string
  ) => {
    try {
      await api.delete(`${COMMENTS_ENDPOINT}/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      if (movieId != null) {
        // بعد از حذف، میانگین را دوباره محاسبه کن
        await recalculateMovieRating(movieId);
      }
    } catch {
      setError("Failed to delete comment");
    }
  };

  const handleDeleteUser = async (id: number | string) => {
    if (String(id) === String(user?.id)) {
      setError("You can't delete your own admin account");
      return;
    }
    try {
      await api.delete(`${USERS_ENDPOINT}/${id}`);
      setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    } catch {
      setError("Failed to delete user");
    }
  };

  const filteredComments = useMemo(() => {
    let list = comments;
    if (commentSearch.trim()) {
      const q = commentSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          String(c.movieId).includes(q) ||
          (c.userName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [comments, commentSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              className="w-12 h-12 rounded-full border-2 border-yellow-300"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-yellow-600">
                Admin Panel
              </h1>
              <p className="text-gray-600 text-sm">
                Manage movies, comments, and users
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("movies")}
              className={`px-4 py-2 rounded-xl border ${
                activeTab === "movies"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-4 py-2 rounded-xl border ${
                activeTab === "comments"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-xl border ${
                activeTab === "users"
                  ? "bg-yellow-400 text-yellow-900 border-yellow-300"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* MOVIES TAB */}
        {activeTab === "movies" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Movies ({movies.length})
              </h2>
              <button
                onClick={openAddMovie}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-extrabold shadow hover:from-yellow-300 hover:to-yellow-400"
              >
                + Add Movie
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-yellow-300/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Click <b>Edit</b> to modify all fields
                </span>
                <button
                  onClick={fetchMovies}
                  disabled={loading.movies}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-yellow-50"
                >
                  {loading.movies ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="p-3">Poster</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Genre</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Director</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr key={m.id} className="border-t border-gray-100">
                        <td className="p-3">
                          <img
                            src={
                              (m as any).poster ||
                              (m as any).posterUrl ||
                              "/images/avatar.jpg"
                            }
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-md border"
                          />
                        </td>
                        <td className="p-3 font-semibold">{m.title}</td>
                        <td className="p-3">{(m as any).genre || "-"}</td>
                        <td className="p-3">{(m as any).year ?? "-"}</td>
                        <td className="p-3">{(m as any).director || "-"}</td>
                        <td className="p-3">{(m as any).rating ?? "-"}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditMovie(m)}
                              className="px-3 py-1 rounded bg-white border border-gray-200 hover:bg-yellow-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(m.id!)}
                              className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {movies.length === 0 && !loading.movies && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-6 text-center text-gray-500"
                        >
                          No movies yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Add/Edit */}
            <MovieFormModal
              isOpen={isMovieModalOpen}
              onClose={closeMovieModal}
              initial={editingMovie}
              onSaved={upsertMovieInState}
            />
          </section>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "comments" && (
          <section className="space-y-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-yellow-300/60 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Comments ({comments.length})
                </h2>
                <div className="flex gap-2">
                  <input
                    className="border-2 border-yellow-300 rounded-xl px-3 py-2 bg-white"
                    placeholder="Search text / movieId / user"
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                  />
                  <select
                    className="border-2 border-yellow-300 rounded-xl px-3 py-2 bg-white"
                    value={commentSort}
                    onChange={(e) =>
                      setCommentSort(e.target.value as "desc" | "asc")
                    }
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                  <button
                    onClick={fetchComments}
                    disabled={loading.comments}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-yellow-50"
                  >
                    {loading.comments ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="p-3">ID</th>
                      <th className="p-3">Movie</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Text</th>
                      <th className="p-3">Created</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-gray-100 align-top"
                      >
                        <td className="p-3 text-gray-600">{String(c.id)}</td>
                        <td className="p-3">#{c.movieId}</td>
                        <td className="p-3">{c.userName || c.userId}</td>
                        <td className="p-3 max-w-[520px]">
                          <div className="text-gray-800 whitespace-pre-wrap">
                            {c.text}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleDeleteComment(c.id!, c.movieId)
                            }
                            className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredComments.length === 0 && !loading.comments && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-6 text-center text-gray-500"
                        >
                          No comments.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <section className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-yellow-300/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Users ({users.length})
                </h2>
                <button
                  onClick={fetchUsers}
                  disabled={loading.users}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-yellow-50"
                >
                  {loading.users ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Admin</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={String(u.id)}
                        className="border-t border-gray-100"
                      >
                        <td className="p-3 text-gray-600">{String(u.id)}</td>
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{(u as any).email || "-"}</td>
                        <td className="p-3">
                          {(u as any).is_admin ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                              <Icon name="SuccessIcon" size={14} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                              <Icon name="InfoIcon" size={14} /> User
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteUser(u.id!)}
                            className="px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !loading.users && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-6 text-center text-gray-500"
                        >
                          No users.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
