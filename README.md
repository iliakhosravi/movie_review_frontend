# 🎬 Movie Recommendation & Review — Frontend (React + TypeScript + Vite)

This repository contains the **frontend** of a movie recommendation & review platform.  
It is a **React + TypeScript** single‑page app bootstrapped with **Vite** and styled with utility classes (Tailwind-like). The app integrates with a **Django backend** via REST APIs (JWT/Bearer token).

> **Note:** This README is for the **frontend only**. It does not rely on any JSON server; all data comes from your **Django** backend.

---

## 🚀 Features at a Glance

- Auth (register/login) with **Bearer token** persisted in `localStorage`
- Guarded routes (`/profile`, `/movies/:id`) and **admin-only** area (`/admin`)
- Home with **quick search** (debounced) + **Advanced Search** (title, director, genre, rating, year)
- Movie cards with rating, hover preview, video trailer button, and **Favorite** toggle
- **Favorite** flow supports two backend response styles (list of Favorite records or list of Movies)
- Movie detail with **comments**, **ratings**, **views counter**, **video resume** (continue watching)
- Profile with tabs: **Profile**, **Favorites**, **My Comments**, **Recommendations**
- Admin panel: CRUD for movies, user and comment moderation
- Global state with **Zustand** (UI state, user session, error handling)
- Stable **API layer** with Axios + optional request/response logging

---

## 🧱 Tech Stack

- **Framework:** React 18, TypeScript
- **Bundler:** Vite
- **Routing:** React Router
- **State:** Zustand (persisted slices)
- **HTTP:** Axios
- **Styling:** Utility classes (Tailwind-like CSS in `index.css`)
- **Video:** Native `<video>` with custom resume logic
- **Tooling:** ESLint/TSConfig (Vite defaults)

---

## 📁 Project Structure (Frontend)

```
src
├── App.css
├── App.tsx
├── components
│   ├── AddMovieForm.tsx
│   ├── AdvancedSearch.tsx
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   ├── FavoriteButton.tsx
│   ├── Header.tsx
│   ├── Icon.tsx
│   ├── LateInput.tsx
│   ├── MovieCard.tsx
│   ├── MovieFormModal.tsx
│   ├── MovieList.tsx
│   ├── RegisterModal.tsx
│   ├── StarRating.tsx
│   ├── Timer.tsx
│   ├── UserButton.tsx
│   └── VideoPlayer.tsx
├── constants
│   ├── api.ts
│   └── userApi.ts
├── contexts
│   └── UserContext.tsx
├── icons
│   └── *.svg (+ index.ts)
├── index.css
├── main.tsx
├── pages
│   ├── AdminLoginPage.tsx
│   ├── AdminPage.tsx
│   ├── Home.tsx
│   ├── MovieDetail.tsx
│   ├── ProfilePage.tsx
│   └── RegisterPage.tsx
├── services
│   └── api.ts
├── store
│   ├── index.ts
│   ├── useErrorStore.ts
│   ├── useUIStore.ts
│   └── useUserStore.ts
├── types
│   ├── Comment.ts
│   ├── Favorite.ts
│   ├── Movie.ts
│   ├── svg.d.ts
│   └── User.ts
├── utils
│   └── recalculateMovieRating.ts
└── vite-env.d.ts
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18 (recommended LTS)
- **npm** ≥ 9 (or **pnpm/yarn** if you prefer)

---

## 🔧 Setup & Run

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Create a `.env` file at the project root (same level as `vite.config.ts`):

```
# Django API base URL (no trailing slash)
VITE_DJANGO_API_BASE=http://localhost:8000

# Optional: turn on axios request/response console logs
VITE_API_LOG=true
```

> The app reads these via `import.meta.env`.  
> The axios client for Django lives in `src/services/api.ts` as `authApi`.

### 3) Start the dev server
```bash
npm run dev
```
The app will open on the Vite dev URL (e.g., `http://localhost:5173`).

### 4) Build & preview production bundle
```bash
npm run build
npm run preview
```

---

## 🔐 Authentication Flow (Frontend)

- `RegisterPage` and `RegisterModal` implement a **login-first, then fallback to signup** UX:
  1. Try `POST /api/users/login/` with `{ email, password }`.
  2. If invalid, try `POST /api/users/signup/` with the same payload.
  3. On success, **store `token` in `localStorage`**, call `setAuthToken(token)` so Axios sends `Authorization: Bearer <token>`.
  4. The full user object is persisted in Zustand (`useUserStore`) and partially in `localStorage` (`user`, `token`, `userId`).

- Protected routes are wrapped in `<ProtectedRoute>` (see `App.tsx`).  
- Admin routes use `<AdminRoute>` and also check `user.is_admin === true`.

---

## 🧭 Routing

- `/` — **Home** (public view, but some actions may require auth)
- `/register` — **Register/Login**
- `/movies/:id` — **MovieDetail** (protected)
- `/profile` — **ProfilePage** (protected; tabs: Profile, Favorites, My Comments, Recommendations)
- `/admin-login` — **Admin Login**
- `/admin` — **Admin Panel** (admin-only)

---

## 🗃️ Global State (Zustand)

- `useUserStore` — user/session state (`user`, `isAuthenticated`, `login`, `logout`, `setUser`). Persisted to `localStorage`.
- `useUIStore` — UI state (`search`, `view`, `isScrolled`, `toggleView`, …). Persisted (only `search` & `view`). 
- `useErrorStore` — global error banner/flags with `showError`, `showWarning`, `showInfo`.

All stores live under `src/store/*`. The `store/index.ts` re‑exports the slices.

---

## 🌐 API Layer (Axios)

**File:** `src/services/api.ts`

- `authApi` — configured with `VITE_DJANGO_API_BASE`  
- `setAuthToken(token)` — sets/removes `Authorization: Bearer <token>` header on `authApi`
- Optional request/response logging when `VITE_API_LOG=true`

**REST Endpoints (expected):** `src/constants/api.ts`
- **Users:** `USER_SIGNUP_URL`, `USER_LOGIN_URL`, `USER_ME_URL`, `USER_UPDATE_URL`, admin list/delete
- **Movies:** list, detail, admin create/edit/delete, increase views, quality, update rating
- **Favorites:** `FAVORITES_ME_URL`, `FAVORITE_CREATE_URL`, `FAVORITE_DELETE_URL(id)`
- **Comments:** create, list by movie, list mine, edit mine, delete mine, admin list/delete

> Ensure your Django backend provides these endpoints and shapes (see **Types** below).

---

## 🧩 Components & Pages — What They Do

### Header / UserButton / RegisterModal
- Global top bar with **debounced search** (`LateInput`) and **Advanced Search** toggle (on Home).
- `UserButton` shows Register (opens `RegisterModal`) when unauthenticated, otherwise takes user to `/profile`.
- Admin Login button appears when the current user is not admin.

### LateInput
- Controlled input with **debounce & progress** bar.  
- Calls `onDebouncedChange` after `debounce` (default 500ms).

### MovieCard
- Displays poster, **rating badge** (top‑left), **FavoriteButton** (top‑right), description overlay, and optional trailer button.  
- Hover overlay uses `pointer-events: none` to avoid blocking card interactions; inner buttons re‑enable pointer events.  
- If `releaseDate` is in the future → **Timer** overlay is shown.

### FavoriteButton
- Uses `authApi` and `FAVORITES_ME_URL`, `FAVORITE_CREATE_URL`, `FAVORITE_DELETE_URL`.
- Maintains **isolated state per movie**. `useEffect` refreshes when `userId` or `movieId` changes.
- **Optimistic UI**: clicking toggles immediately; rolls back on error.
- Handles **two backend response styles** on `/api/favorites/me/`:
  1) Array of **Favorite** records → finds the one with matching `movieId`  
  2) Array of **Movie** objects → treats presence of current `movieId` as “favorited” (synthetic favorite)
- Delete call uses `FAVORITE_DELETE_URL(movieId)` because the backend may delete by movieId for the current user (adjust on server if needed).

### AdvancedSearch
- Controlled query UI for title, director, genre, rating min/max, year min/max.  
- Calls `onChange` immediately; `Home.tsx` applies filters in a `useMemo` pipeline.

### MovieList
- Grid/list layout switch (from `useUIStore.view`).  
- Animates item entrance.

### Timer
- Simple countdown formatter for unreleased movies (shows “Now available!” when done).

### CommentForm / CommentList
- Post, list, and delete comments for a movie.  
- `MovieDetail` recomputes ratings after comment changes using `recalculateMovieRating` (calls backend `PATCH /api/movies/:id/update-rating/`).

### VideoPlayer
- Stores **watch progress** in `localStorage` per `[userId]-[movieId]`.  
- On next play, offers **Continue** from last saved time or **Restart**.  
- Seeks precisely after metadata loaded; robust against race conditions.

### MovieFormModal (Admin)
- Admin add/edit movie via modal.  
- Validates fields (year range, 1888–2100; rating 0–10).  
- Calls `MOVIE_ADMIN_CREATE_URL` or `MOVIE_ADMIN_EDIT_URL`.

### Pages

#### Home.tsx
- Fetches movies from `MOVIE_LIST_URL`.  
- Debounced quick search + optional **Advanced Search panel**.  
- Uses `MovieList` and preserves user’s view mode.

#### MovieDetail.tsx (Protected)
- Fetches movie by `id`.  
- On mount: calls `POST /increase-views/`.  
- Loads comments; can post/delete; triggers **rating recompute** (server computes & returns new average).  
- Shows trailer link, cast, views, and quality badge (from `/quality/`).

#### ProfilePage.tsx (Protected)
- **Profile tab:** edit & save name/email/bio/avatarUrl/favoriteGenre → `PUT USER_UPDATE_URL`, then refreshes with `GET USER_ME_URL`.  
- **Favorites tab:** supports both favorite response shapes (see FavoriteButton). Builds movie list either directly or by requesting each movie id.  
- **My Comments tab:** lists current user comments with edit/delete.  
- **Recommendations tab:** calls `MOVIE_SUGGEST_URL` (server filters by favoriteGenre or other heuristics).

#### AdminLoginPage.tsx
- Email/password login to get **token**, then fetch `/api/users/me/` and validate `is_admin`.  
- Persists `user`, `token` and redirects to `/admin`.

#### AdminPage.tsx (Admin only)
- Tabs: **Movies**, **Comments**, **Users**.  
- Movies: list with edit/delete, open **MovieFormModal** for add/edit.  
- Comments: admin list & delete. Recomputes rating on delete via `recalculateMovieRating`.  
- Users: admin list & delete (prevents deleting yourself).

#### RegisterPage.tsx
- “Try login → else signup → then login” flow in one button.  
- Stores token and updates `authApi` header via `setAuthToken`.

---

## 🧾 Types (Frontend Contracts)

```ts
// src/types/Movie.ts
export interface Movie {
  id: number;
  title: string;
  genre?: string;
  year?: number;
  director?: string;
  rating?: number;           // 0..10 (average from comments)
  description?: string;
  poster?: string;           // image URL
  videoUrl?: string;         // trailer or full video URL
  trailer?: string;          // external link (e.g., YouTube)
  cast?: string;             // e.g. "Actor A, Actor B"
  views?: number;
  gradeByUsersReview?: string; // from backend /quality/
}

// src/types/Comment.ts
export interface Comment {
  id?: number | string;
  movieId: number | string;
  userId: number | string;
  userName: string;
  text: string;
  rating: number;        // 1..10
  created_at: string;    // ISO
}

// src/types/Favorite.ts
export interface Favorite {
  id?: number | string;
  userId: number | string;
  movieId: number | string;
  createdAt: string;     // ISO
}

// src/types/User.ts
export interface User {
  id: string | number;
  name: string;
  password?: string;
  avatarUrl?: string;
  email?: string;
  bio?: string;
  createdAt?: string;
  is_admin?: boolean;
  favoriteGenre?: string;
}
```

> Ensure your Django serializers align with these shapes (or adapt the TS types and consuming code accordingly).

---

## 🧮 Utility: Recompute Rating

**File:** `src/utils/recalculateMovieRating.ts`  
Fetches all comments for a movie (`GET /api/comments/movie/:id/`), computes average on the client, and sends:  
`PATCH /api/movies/:id/update-rating/ { rating: avg }`

> You can move the averaging to the backend and have the endpoint compute & persist the rating—frontend will still call it after comment changes.

---

## 🎨 Styling

- The app relies on utility classes (e.g., `bg-yellow-400`, `rounded-xl`).  
- You can plug in Tailwind or keep the provided CSS tokens in `index.css` / `App.css`.
- Icons under `src/icons/*` are imported as React components via `?react` (`src/components/Icon.tsx`).

---

## 🧪 Manual Test Plan (Frontend)

- **Auth**
  - Register a new user → token stored → header set → `/profile` accessible
  - Login with existing user
  - Logout clears state & storage; protected routes redirect to `/register`
- **Home**
  - Debounced search updates list after ~500ms
  - Advanced Search filters by title/director/genre/rating/year
  - Toggle grid/list view persists across reloads
- **Card**
  - Hover overlay shows text & “Watch Now” without blocking other clicks
  - Favorite toggle updates UI optimistically; only this card changes
- **Detail**
  - Video player prompts “Continue” after leaving mid-play, then seeks
  - Post/delete a comment; rating updates (and persists after refresh)
  - Views increment on open
- **Profile**
  - Edit and save profile fields; reload shows updated data
  - Favorites tab populates (works whether `/favorites/me/` returns Movie[] or Favorite[])
  - My Comments lists, with edit/delete
  - Recommendations render when `favoriteGenre` is set
- **Admin**
  - Only admin can access `/admin`
  - Add/edit/delete movie; changes reflect on Home/Detail
  - Delete comment triggers rating recompute
  - Users list and delete (not yourself)

---

## 🧯 Troubleshooting

- **401/403 everywhere**
  - Confirm `localStorage.token` is set after login and `setAuthToken(token)` ran (see `App.tsx` effect).
  - Backend CORS must allow Vite dev origin.
- **Favorites look “global” or all cards turn favorited**
  - Each `FavoriteButton` isolates state by `movieId` and `userId`; make sure cards render unique `key={movie.id}`.
  - Ensure `/api/favorites/me/` filters by the current user OR return just the current user’s favorited **movies**; both are supported.
- **Delete favorite by `id` vs `movieId`**
  - This code calls `FAVORITE_DELETE_URL(movieId)` because some backends delete “by movieId for current user”. If your backend expects favorite **record id**, adapt the call to pass the correct `id`.
- **Images or videos not loading**
  - Use absolute URLs or configure static files in Django. Check mixed-content (HTTP/HTTPS) issues.
- **Search/filters not working**
  - Ensure `MOVIE_LIST_URL` returns an array of movies with the fields used in filters (`title`, `director`, `genre`, `rating`, `year`).

---

## 🧰 Scripts

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # serve the dist build locally
```

---

## 📌 Notes & Conventions

- Persisted keys in `localStorage`:
  - `token` — JWT/Bearer token
  - `user` — full user JSON (admin flag, etc.)
  - `userId` — convenience id (some flows read it)
  - `movie-progress-<uid>-<movieId>` — per-user video resume
- Avoid mixing domains; set `VITE_DJANGO_API_BASE` correctly (e.g., `http://127.0.0.1:8000`).  
- If your Django uses cookie auth + CSRF instead of Bearer tokens, adjust `authApi` accordingly.

---

## 🏁 Summary

- Frontend is **decoupled** from the backend; set `VITE_DJANGO_API_BASE` and you’re good.  
- Routes are protected where needed.  
- Favorites, comments, ratings, and recommendations are wired to Django endpoints.  
- Admin flows live entirely in the frontend but require `is_admin` from the backend.

If you need a shorter “presentation script” for the demo, check the **Manual Test Plan** section above 👆 — it’s an ordered path you can follow live.

---

**Good luck with your presentation!** 🍿🎥
