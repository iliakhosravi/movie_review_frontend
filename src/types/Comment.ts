// src/types/Comment.ts
export interface Comment {
  id?: number | string;
  movieId: number | string;
  userId: number | string;
  userName: string;
  text: string;
  rating: number; // 1..10
  created_at: string; // ISO string
}
