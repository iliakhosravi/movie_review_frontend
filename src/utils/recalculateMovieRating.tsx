// src/utils/recalculateMovieRating.ts
import { api, authApi } from "../services/api";
import type { Comment } from "../types/Comment";
import { MOVIE_DETAIL_URL, COMMENT_LIST_BY_MOVIE_ID, MOVIE_UPDATE_RATING_URL } from "../constants/api";

export async function recalculateMovieRating(
  movieId: number | string
): Promise<number> {
  const { data } = await authApi.get<Comment[]>(
    COMMENT_LIST_BY_MOVIE_ID(Number(movieId))
  );
  const list = data || [];
  if (list.length === 0) {
    await authApi.patch(MOVIE_UPDATE_RATING_URL(Number(movieId)), { rating: 0 });
    return 0;
  }
  const sum = list.reduce((acc, c) => acc + Number(c.rating || 0), 0);
  const avgRaw = sum / list.length;
  const avg = Math.round(avgRaw * 10) / 10;
  await authApi.patch(MOVIE_UPDATE_RATING_URL(Number(movieId)), { rating: avg });
  return avg;
}





