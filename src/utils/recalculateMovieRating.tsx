// src/utils/recalculateMovieRating.ts
import { api } from "../services/api";
import type { Comment } from "../types/Comment";
import { MOVIES_ENDPOINT, COMMENTS_ENDPOINT } from "../constants/api";

export async function recalculateMovieRating(
  movieId: number | string
): Promise<number> {
  const { data } = await api.get<Comment[]>(
    `${COMMENTS_ENDPOINT}?movieId=${movieId}`
  );
  const list = data || [];
  if (list.length === 0) {
    await api.patch(`${MOVIES_ENDPOINT}/${movieId}`, { rating: 0 });
    return 0;
  }
  const sum = list.reduce((acc, c) => acc + Number(c.rating || 0), 0);
  const avgRaw = sum / list.length;
  const avg = Math.round(avgRaw * 10) / 10;
  await api.patch(`${MOVIES_ENDPOINT}/${movieId}`, { rating: avg });
  return avg;
}
