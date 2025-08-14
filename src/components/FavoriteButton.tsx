import { useEffect, useState } from "react";
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
      const item = list.find((f) => toStr(f.movieId) === movieIdStr);
      setFav(item ?? null);
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
    setLoading(true);
    try {
      if (fav?.id != null) {
        // حذف
        const old = fav;
        // optimistic
        setFav(null);
        onChange?.(false);
        try {
          await authApi.delete(FAVORITE_DELETE_URL(old.id as any)); // id را همانی که هست بفرست
        } catch (e) {
          // rollback
          setFav(old);
          onChange?.(true);
          throw e;
        }
      } else {
        // ایجاد
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
