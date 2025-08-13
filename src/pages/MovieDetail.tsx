// src/pages/MovieDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Movie } from "../types/Movie";
import Icon from "../components/Icon";
import VideoPlayer from "../components/VideoPlayer";
import { useUserStore } from "../store";
import { MOVIES_ENDPOINT } from "../constants/api";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import FavoriteButton from "../components/FavoriteButton";

const MovieDetail = () => {
  const { id } = useParams();
  const user = useUserStore((s) => s.user);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("You must register or log in to view movie details.");
      return;
    }
    const fetchMovie = async () => {
      try {
        if (!id) throw new Error("No movie id");
        const res = await api.get<Movie>(`${MOVIES_ENDPOINT}/${id}`);
        setMovie(res.data);
      } catch {
        setError("Movie not found");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, user]);

  if (loading) return <p>Loading...</p>;
  if (error || !movie) {
    return (
      <div className="text-center py-12 text-yellow-700 font-bold text-xl">
        {error || "Movie not found"}
      </div>
    );
  }

  const posterSrc =
    (movie as any).poster || (movie as any).posterUrl || "/images/avatar.jpg";

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
                src={posterSrc}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Info + Video */}
            <div className="flex-1 flex flex-col gap-3 text-gray-800">
              <h2 className="text-4xl font-extrabold text-yellow-600 drop-shadow flex items-center gap-3">
                {movie.title}
                <FavoriteButton movieId={movie.id} />
              </h2>

              <div className="flex flex-wrap gap-3 text-base text-gray-600">
                {(movie as any).genre && (
                  <span className="bg-yellow-100 px-3 py-1 rounded-full font-medium shadow border border-yellow-300/60">
                    {(movie as any).genre}
                  </span>
                )}
                {(movie as any).year != null && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium shadow border border-gray-300/60">
                    {(movie as any).year}
                  </span>
                )}
              </div>

              {(movie as any).director && (
                <div className="text-gray-500 italic">
                  Directed by{" "}
                  <span className="font-semibold text-gray-700">
                    {(movie as any).director}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-yellow-700 font-bold text-lg">
                <Icon name="StarIcon" size={24} className="text-yellow-500" />
                {(movie as any).rating ?? 0}/10
              </div>

              {(movie as any).description && (
                <p className="mt-2 text-lg leading-relaxed text-gray-700 bg-white/60 rounded-xl p-4 shadow-inner border border-yellow-100/40">
                  {(movie as any).description}
                </p>
              )}

              {(movie as any).videoUrl && (
                <div className="mt-2 w-full flex justify-center md:justify-start">
                  <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-300/80 bg-black">
                    <VideoPlayer
                      videoUrl={(movie as any).videoUrl}
                      poster={posterSrc}
                      movieId={movie.id}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="max-w-5xl w-full mx-auto px-4 pb-16">
        <div className="rounded-3xl shadow-xl bg-white/95 border-2 border-yellow-300/60 p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Comments</h3>

          {user ? (
            <div className="mb-6">
              <CommentForm
                movieId={movie.id}
                onMovieRatingUpdated={(avg) => {
                  // به‌روز کردن میانگین امتیاز نمایش‌داده‌شده
                  (movie as any).rating = avg;
                  setMovie({ ...movie });
                }}
              />
            </div>
          ) : (
            <div className="text-gray-600 mb-6 italic">
              Please register or log in to post comments.
            </div>
          )}

          <CommentList movieId={movie.id} />
        </div>
      </section>

      {/* BG circles */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-yellow-100 rounded-full opacity-40 z-0" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-yellow-200 rounded-full opacity-30 z-0" />
    </div>
  );
};

export default MovieDetail;
