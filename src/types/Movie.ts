export interface Movie {
  id: number;
  title: string;
  genre?: string;
  year?: number;
  director?: string;
  rating?: number;
  description?: string;
  poster?: string;
  videoUrl?: string;
  trailer?: string; // لینک
  cast?: string[]; // آرایهٔ بازیگران
  views?: number; // آمار بازدید
  gradeByUsersReview?: string; // فیلد جدید
}
