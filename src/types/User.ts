export interface User {
  id: string | number;
  name: string;
  password?: string;

  // optional profile fields
  avatarUrl?: string;
  email?: string;
  bio?: string;
  createdAt?: string;

  // auth/role
  is_admin?: boolean;

  // NEW: user's preferred genre for future recommendations
  favoriteGenre?: string;
}
