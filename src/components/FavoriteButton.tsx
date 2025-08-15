import { useEffect, useState, useRef } from "react";
import { authApi } from "../services/api";
import {
  FAVORITES_ME_URL,
  FAVORITE_DELETE_URL,
  FAVORITE_CREATE_URL,
} from "../constants/api";
import { useUserStore } from "../store";
import Icon from "./Icon";
import type { Favorite } from "../types/Favorite";

interface Props {
  movieId: number | string;
  className?: string;
  onChange?: (isFav: boolean) => void;
}

const toStr = (v: number | string | undefined | null) => String(v ?? "");

const FavoriteButton = ({ movieId, className = "", onChange }: Props) => {
  const user = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [fav, setFav] = useState<Favorite | null>(null);
  const isToggling = useRef(false);

  const userIdStr = toStr(user?.id);
  const movieIdStr = toStr(movieId);

  // دریافت علاقه‌مندی برای همین فیلم
  const refresh = async () => {
    if (!user?.id) {
      setFav(null);
      return;
    }
    try {
      // بعضی بک‌اندها کوئری‌های یوزر/مووی را نادیده می‌گیرند و کل لیست را می‌دهند
      // ما سمت کلاینت فیلتر می‌کنیم
      const { data } = await authApi.get<Favorite[]>(
        `${FAVORITES_ME_URL}?userId=${encodeURIComponent(
          userIdStr
        )}&movieId=${encodeURIComponent(movieIdStr)}`
      );
      const list = Array.isArray(data) ? data : [];
      
      // Check if we got favorite objects or movie objects
      let item: Favorite | null = null;
      
      if (list.length > 0) {
        const firstItem = list[0];
        // If the response contains favorite objects (has userId, movieId)
        if ('userId' in firstItem && 'movieId' in firstItem) {
          item = list.find((f) => toStr(f.movieId) === movieIdStr) ?? null;
        } 
        // If the response contains movie objects (has title, director, etc.)
        else if ('title' in firstItem) {
          // The API returned movies that are favorited, so check if our movie is in the list
          const movieExists = list.find((movie: any) => toStr(movie.id) === movieIdStr);
          if (movieExists) {
            // Create a synthetic favorite object
            item = {
              id: `synthetic-${movieIdStr}`,
              userId: userIdStr,
              movieId: movieIdStr,
              createdAt: new Date().toISOString(),
            } as Favorite;
          }
        }
      }
      
      setFav(item);
    } catch (e) {
      console.warn("[FAV refresh] failed", e);
      setFav(null);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdStr, movieIdStr]);

  const toggle = async () => {
    if (!user?.id) {
      alert("Please login to use favorites");
      return;
    }
    
    // Prevent duplicate calls
    if (isToggling.current) {
      return;
    }
    
    isToggling.current = true;
    setLoading(true);
    try {
      if (fav?.id != null) {
        const old = fav;
        setFav(null);
        onChange?.(false);
        try {
          // Use movieId for deletion since that's what the API expects
          await authApi.delete(FAVORITE_DELETE_URL(Number(movieIdStr)));
        } catch (e) {
          // rollback
          setFav(old);
          onChange?.(true);
          throw e;
        }
      } else {
        const payload: Favorite = {
          userId: userIdStr,
          movieId: movieIdStr,
          createdAt: new Date().toISOString(),
        } as Favorite;

        // optimistic placeholder
        const optimistic: Favorite = {
          ...payload,
          id: `optimistic-${movieIdStr}`,
        };
        setFav(optimistic);
        onChange?.(true);

        try {
          const { data } = await authApi.post<Favorite>(
            FAVORITE_CREATE_URL,
            payload
          );
          setFav(data); // id واقعی بک‌اند
        } catch (e) {
          // rollback
          setFav(null);
          onChange?.(false);
          throw e;
        }
      }
    } catch (e) {
      console.error("[FAV toggle] failed", e);
      alert("Failed to update favorites");
    } finally {
      setLoading(false);
      isToggling.current = false;
    }
  };

  const isFav = !!fav;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition
        ${
          isFav
            ? "bg-yellow-400/90 text-yellow-900 border-yellow-300"
            : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
        }
        ${className}`}
    >
      <Icon
        name="HeartIcon"
        size={16}
        className={isFav ? "text-yellow-900" : "text-gray-600"}
      />
      <span className="text-sm font-semibold">
        {isFav ? "Favorited" : "Favorite"}
      </span>
    </button>
  );
};

export default FavoriteButton;
