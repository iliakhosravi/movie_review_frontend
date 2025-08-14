import { useState } from "react";
import type { Movie } from "../types/Movie";
import Timer from "./Timer";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import FavoriteButton from "./FavoriteButton"; // اضافه شد

interface MovieCardProps {
  movie: Movie;
  view: "grid" | "list";
}

const MovieCard = ({ movie, view }: MovieCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [hovered, setHovered] = useState(false);

  const now = Date.now();
  const release = (movie as any).releaseDate
    ? new Date((movie as any).releaseDate).getTime()
    : 0;
  const notPublished = (movie as any).releaseDate && release > now;
  const secondsLeft = notPublished ? Math.floor((release - now) / 1000) : 0;

  const castPreview = Array.isArray(movie.cast)
    ? movie.cast.slice(0, 3).join(", ")
    : "";

  return (
    <div
      className={`movie-card group ${
        view === "list"
          ? "flex gap-6 items-start w-full max-w-3xl h-64"
          : "flex flex-col w-72 h-[500px]"
      } shadow-xl shadow-yellow-900/30 border border-yellow-200`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowVideo(false);
      }}
    >
      <div
        className={`relative overflow-hidden ${
          view === "list"
            ? "w-1/3 min-w-[160px] max-w-[220px] h-64"
            : "w-full h-2/3"
        }`}
      >
        {/* Rating Badge */}
        <div className="rating-badge">
          <Icon name="StarIcon" size={16} className="w-4 h-4" />
          <span>{movie.rating ?? "-"}</span>
        </div>

        {/* Poster */}
        <div className="w-full h-full relative">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Timer */}
        {notPublished && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <Timer seconds={secondsLeft} />
          </div>
        )}

        {/* Hover Video */}
        {!notPublished && showVideo && movie.videoUrl && (
          <div className="absolute inset-0 bg-black">
            <video
              controls
              src={movie.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              onMouseLeave={() => setShowVideo(false)}
            />
          </div>
        )}

        {/* Hover Content */}
        {hovered && !notPublished && !showVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <p className="text-white text-sm mb-4 line-clamp-4 text-center">
              {movie.description}
            </p>
            {movie.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
              >
                Watch Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className={`flex flex-col ${
          view === "list" ? "w-2/3 py-4 px-2 h-64 justify-between" : "p-6 h-1/3"
        }`}
      >
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-gray-600 mb-1">
          {movie.genre && <span className="font-semibold">{movie.genre}</span>}
          {movie.genre && <span>•</span>}
          {movie.year != null && <span>{movie.year}</span>}
          {movie.views != null && (
            <>
              <span>•</span>
              <span className="text-sm text-gray-500">
                {movie.views.toLocaleString()} views
              </span>
            </>
          )}
        </div>
        {movie.director && (
          <p className="text-gray-500 italic">Directed by {movie.director}</p>
        )}
        {!!castPreview && (
          <p className="text-gray-600 text-sm">
            Cast:{" "}
            <span className="text-gray-700">
              {castPreview}
              {Array.isArray(movie.cast) && movie.cast.length > 3 ? "…" : ""}
            </span>
          </p>
        )}

        {/* Favorite Button */}
        <div className="mt-3">
          <FavoriteButton movieId={movie.id} />
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
