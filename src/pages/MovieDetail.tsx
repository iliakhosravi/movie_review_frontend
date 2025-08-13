// src/pages/MovieDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Movie } from "../types/Movie";
import type { Comment } from "../types/Comment";
import Icon from "../components/Icon";
import VideoPlayer from "../components/VideoPlayer";
import { useUserStore } from "../store";
import { COMMENTS_ENDPOINT } from "../constants/api";
import CommentList from "../components/CommentList";
import CommentForm from "../components/CommentForm";
import { recalculateMovieRating } from "../utils/recalculateMovieRating";

const MovieDetail = () => {
  const { id } = useParams();
  const movieId = Number(id);
  const user = useUserStore((s) => s.user);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch movie (json-server style)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("You must register or log in to view movie details.");
      return;
    }
    const fetchMovie = async () => {
      try {
        const res = await api.get<Movie>(`/movies/${movieId}`);
        setMovie(res.data);
      } catch {
        setError("Movie not found");
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(movieId)) fetchMovie();
  }, [movieId, user]);

  // Fetch comments (json-server style)
  const loadComments = async () => {
    if (!movieId) return;
    try {
      setLoadingComments(true);
      const res = await api.get<Comment[]>(
        `${COMMENTS_ENDPOINT}?movieId=${encodeURIComponent(
          String(movieId)
        )}&_sort=createdAt&_order=desc`
      );
      setComments(res.data || []);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [movieId]);

  // Post a comment
  const handlePostComment = async (text: string, rating: number) => {
    if (!user) throw new Error("Not authenticated");
    const payload = {
      movieId,
      userId: user.id,
      userName: user.name,
      text,
      rating,
      createdAt: new Date().toISOString(),
    };
    const tempId = Math.random();
    setComments((prev) => [{ id: tempId as any, ...payload }, ...prev]);
    try {
      const res = await api.post<Comment>(COMMENTS_ENDPOINT, payload);
      setComments((prev) =>
        prev.map((c) => (c.id === (tempId as any) ? res.data : c))
      );
      // update movie rating by comments average
      const avg = await recalculateMovieRating(movieId);
      setMovie((m) => (m ? { ...m, rating: avg } : m));
    } catch (e) {
      setComments((prev) => prev.filter((c) => c.id !== (tempId as any)));
      throw e;
    }
  };

  // Delete a comment
  const handleDeleteComment = async (cid: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      setDeletingId(cid);
      await api.delete(`${COMMENTS_ENDPOINT}/${cid}`);
      setComments((prev) => prev.filter((c) => c.id !== cid));
      const avg = await recalculateMovieRating(movieId);
      setMovie((m) => (m ? { ...m, rating: avg } : m));
    } finally {
      setDeletingId(null);
    }
  };

  // Cast helper
  const hasCast = useMemo(
    () => Array.isArray(movie?.cast) && (movie!.cast as string[]).length > 0,
    [movie]
  );

  if (loading) return <p>Loading...</p>;
  if (error || !movie) {
    return (
      <div className="text-center py-12 text-yellow-700 font-bold text-xl">
        {error || "Movie not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-semibold bg-white/80 px-4 py-2 rounded-full shadow border border-yellow-300/60"
        >
          <span className="mr-2">&larr;</span> Back to Home
        </Link>
      </div>

      {/* Movie card */}
      <section className="relative z-10 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="rounded-3xl shadow-2xl bg-white/90 border-2 border-yellow-300/60 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 shadow-xl rounded-2xl overflow-hidden border-4 border-yellow-400 w-64 h-96 bg-white/80">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Info + Video */}
            <div className="flex-1 flex flex-col gap-4 text-gray-800">
              <h2 className="text-4xl font-extrabold text-yellow-600 drop-shadow">
                {movie.title}
              </h2>

              <div className="flex flex-wrap gap-3 text-base text-gray-600">
                {movie.genre && (
                  <span className="bg-yellow-100 px-3 py-1 rounded-full font-medium shadow border border-yellow-300/60">
                    {movie.genre}
                  </span>
                )}
                {movie.year != null && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium shadow border border-gray-300/60">
                    {movie.year}
                  </span>
                )}
                {/* Views chip (always visible) */}
                <span className="bg-white px-3 py-1 rounded-full font-medium shadow border border-yellow-200/60 text-gray-600">
                  {movie.views != null ? movie.views.toLocaleString() : "—"}{" "}
                  views
                </span>
              </div>

              {movie.director && (
                <div className="text-gray-500 italic">
                  Directed by{" "}
                  <span className="font-semibold text-gray-700">
                    {movie.director}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-yellow-700 font-bold text-lg">
                <Icon name="StarIcon" size={24} className="text-yellow-500" />
                {movie.rating ?? "-"}
              </div>

              <p className="text-lg leading-relaxed text-gray-700 bg-white/60 rounded-xl p-4 shadow-inner border border-yellow-100/40">
                {movie.description}
              </p>

              {movie.videoUrl && (
                <div className="w-full flex justify-center md:justify-start">
                  <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-300/80 bg-black">
                    <VideoPlayer
                      videoUrl={movie.videoUrl}
                      poster={movie.poster || ""}
                      movieId={Number(movie.id)}
                    />
                  </div>
                </div>
              )}

              {/* Trailer (link; always visible with placeholder) */}
              <div className="mt-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Trailer
                </h4>
                {movie.trailer ? (
                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg shadow-sm hover:bg-yellow-200 transition-colors duration-200"
                  >
                    <Icon
                      name="PlayIcon"
                      size={20}
                      className="text-yellow-600 mr-2"
                    />
                    Watch Trailer
                  </a>
                ) : (
                  <div className="text-gray-500 italic">
                    No trailer available
                  </div>
                )}
              </div>

              {/* Cast (always visible with placeholder) */}
              <div className="mt-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Cast
                </h4>
                {hasCast ? (
                  <div className="flex flex-wrap gap-2">
                    {movie.cast!.map((actor, idx) => (
                      <span
                        key={`${actor}-${idx}`}
                        className="px-3 py-1 rounded-full bg-white border border-yellow-200 text-gray-700 shadow-sm"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No cast information
                  </div>
                )}
              </div>

              {/* Views (block with placeholder) */}
              <div className="mt-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Views
                </h4>
                {movie.views != null ? (
                  <div className="text-gray-700 font-medium">
                    {movie.views.toLocaleString()} views
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No views data</div>
                )}
              </div>
              {/* Grade by Users Review */}
              <div className="mt-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Grade by Users Review
                </h4>
                {movie.gradeByUsersReview ? (
                  <div className="text-gray-700 font-medium">
                    {movie.gradeByUsersReview}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No grade provided</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="max-w-5xl w-full mx-auto px-4 pb-16">
        <div className="rounded-3xl shadow-xl bg-white/95 border-2 border-yellow-300/60 p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>

          <div className="mb-6">
            {/* فقط یک فرم */}
            <CommentForm onSubmit={handlePostComment} />
          </div>

          {loadingComments ? (
            <div className="text-gray-500">Loading comments…</div>
          ) : (
            <CommentList
              comments={comments}
              onDelete={handleDeleteComment}
              deletingId={deletingId}
            />
          )}
        </div>
      </section>

      {/* BG */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-yellow-100 rounded-full opacity-40 z-0" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-yellow-200 rounded-full opacity-30 z-0" />
    </div>
  );
};

export default MovieDetail;
