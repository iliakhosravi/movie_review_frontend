# React Movie Site

A modern web application for browsing and managing a collection of movies, built with **React**, **TypeScript**, and **Tailwind CSS**.

<p align="center">
  <img src="public/logo.png" alt="MultiMedia Magic Logo" width="96" />
</p>

<p align="center">
  <b>MultiMedia Magic</b> &mdash; Discover, search, and manage your favorite movies with a beautiful, responsive UI.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwindcss&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646cff?logo=vite&logoColor=white" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

---

## 📑 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Starting the API Server](#starting-the-api-server)
  - [Starting the Development Server](#starting-the-development-server)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [How It Works (Detailed Explanation)](#how-it-works-detailed-explanation)
  - [Component and State Flow](#component-and-state-flow)
  - [User Registration and Login](#user-registration-and-login)
  - [Debounced Search and Progress Bar](#debounced-search-and-progress-bar)
  - [Movie Add, List, and Trailer](#movie-add-list-and-trailer)
  - [Resume Video](#resume-video)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Browse movies** in grid or list view
- **Debounced search** with progress bar (search triggers after 0.5s pause)
- **Add new movies** to the collection (form opens on button click, can be closed)
- **Watch movie trailers** directly in the app
- **Responsive design** for desktop and mobile devices
- **Loading indicator** (timer) shown during search debounce
- **Modern UI** with animated gradients and glassmorphism effects using Tailwind CSS
- **User registration/login** with profile avatar and persistent session
- **Resume video** feature to continue watching from where you left off

---

## Demo

> _Add a link or GIF screenshot of your app here if available!_

---

## Technologies Used

- [React 19](https://react.dev/) with TypeScript
- [React Router](https://reactrouter.com/) for navigation
- [Axios](https://axios-http.com/) for API requests
- [Vite](https://vitejs.dev/) for build tooling and development server
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [JSON Server](https://github.com/typicode/json-server) for mock API

---

## Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amirreza938/multiMedia_website
   cd react-movie-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Starting the API Server

This project uses a local JSON server to provide the movie data API.

1. **Install JSON Server globally (if not already installed):**
   ```bash
   npm install -g json-server
   ```

2. **Start the JSON Server using the included db.json file:**
   ```bash
   json-server --watch db.json --port 4000
   ```

The API will be available at [http://localhost:4000/movies](http://localhost:4000/movies)

### Starting the Development Server

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

---

## Project Structure

```
multiMedia_website/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images and other assets
│   ├── components/   # Reusable UI components
│   │   ├── AddMovieForm.tsx
│   │   ├── LateInput.tsx      # Debounced input with progress bar
│   │   ├── Timer.tsx          # Timer for loading indication
│   │   ├── MovieCard.tsx
│   │   └── MovieList.tsx
│   ├── constants/    # API endpoints and constants
│   │   └── api.ts
│   ├── pages/        # Page components
│   │   └── Home.tsx
│   ├── services/     # API and other services
│   │   └── api.ts
│   ├── types/        # TypeScript type definitions
│   │   └── Movie.ts
│   ├── contexts/     # React Contexts (UserContext)
│   ├── App.tsx       # Main app component
│   └── main.tsx      # Entry point
├── db.json           # Mock database for JSON Server
├── index.html        # HTML entry point
├── vite.config.ts    # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

---

## Usage

- **Search:** Type in the search box. Results update only after you stop typing for 0.5 seconds. A progress bar and timer show the waiting period.
- **Add Movie:** Click "Add Movie" to open the form. Fill in details and submit. Click "Close" to hide the form.
- **View Toggle:** Switch between grid and list views for movies.
- **Watch Trailer:** Hover or click the play button on a movie card to watch its trailer.
- **Register/Login:** Click "Register" in the header to create an account or log in. After login, your avatar and name appear in the header.
- **Resume Video:** If you stop watching a video, you can resume from where you left off the next time you visit the page.

---

## How It Works (Detailed Explanation)

### Component and State Flow

- **App.tsx**: The root component. Wraps the app in a `UserProvider` context and sets up routes for Home and RegisterPage.
- **UserContext**: Provides global user state (`user`, `setUser`) to all components via React Context API.
- **Home.tsx**: Main page. Handles movie fetching, search state, view toggle, and add-movie form. Uses `useUser()` to access the current user.
- **Header.tsx**: Top navigation bar. Shows logo, search input, add-movie button, view toggle, and user profile/register button. Uses `useUser()` for user info and logout.
- **LateInput.tsx**: Custom input with debounce and progress bar. Notifies parent after user stops typing for 0.5s.
- **MovieList.tsx**: Displays movies in grid or list view, animating each card.
- **MovieCard.tsx**: Shows movie poster, rating, description, and trailer video on hover.
- **AddMovieForm.tsx**: Form to add a new movie. On submit, posts to the API and refreshes the movie list.

### User Registration and Login

- **Register/Login Flow:**
  - Click "Register" in the header to open the registration/login page.
  - Enter a name and password.
    - If the name does not exist, a new user is created and logged in.
    - If the name exists and the password matches, you are logged in.
    - If the name exists but the password does not match, an error is shown.
  - After login/registration, your avatar (from [pravatar.cc](https://pravatar.cc/)) and name appear in the header.
  - Click your avatar/name to log out (confirmation required).
  - User session is persisted using `localStorage` (`userId` key).
  - User state is managed globally via `UserContext` so all components can access it.

- **How it works in code:**
  - `UserContext.tsx` provides `user` and `setUser` via React Context.
  - `RegisterPage.tsx` uses `setUser` to update the context and stores the user ID in `localStorage`.
  - On app load, `Home.tsx` checks `localStorage` for a user ID and fetches the user profile if present.
  - `Header.tsx` displays the Register button if no user, or the profile avatar/name with logout if logged in.

### Debounced Search and Progress Bar

- **Debounced Search:**
  - The search input uses the `LateInput` component.
  - As the user types, the input value is updated immediately, but the actual search/filter only happens after 500ms of inactivity.
  - This is achieved using a `setTimeout` for the debounce and a `setInterval` to update the progress bar.
  - The progress bar visually fills up as the debounce timer counts down.
  - When the timer completes, `onDebouncedChange` is called, updating the `debouncedSearch` state in `Home.tsx`.
  - The movie list is filtered based on `debouncedSearch`.

- **Progress Bar:**
  - The progress bar is shown below the search input while the debounce timer is running.
  - If the user types again before the timer completes, the timer and progress bar reset.
  - When the timer completes, the bar disappears and the search is triggered.

- **State Flow:**
  - `Home.tsx` holds `search` (immediate input) and `debouncedSearch` (used for filtering).
  - `Header.tsx` and mobile search both use `LateInput`, passing handlers to update these states.
  - The filtered movie list is derived from `debouncedSearch`.

### Movie Add, List, and Trailer

- **Adding Movies:**
  - Click "Add Movie" to open the form.
  - Fill in all fields and submit.
  - The movie is posted to the API and the list refreshes.
  - The form can be closed at any time.

- **Movie List and Card:**
  - Movies are displayed in grid or list view, with animated fade-in.
  - Each card shows poster, rating, genre, year, director, and description.
  - Hovering (or clicking "Watch Now") shows the trailer video overlay.

- **Release Timer:**
  - If a movie has a future `releaseDate`, a timer is shown until it becomes available.

### Resume Video

- **Saving and Resuming Video Position:**
  - The current position of the video is saved in `localStorage` using a unique key for each user and movie.
  - When the video page is loaded, the app checks `localStorage` for a saved position.
  - If a position is found, a prompt is shown to the user to continue watching or start over.
  - If the user chooses to continue, the video will seek to the saved position and resume playback.
  - If the user chooses to start over, the video will reset to the beginning.

- **Key Functions and Logic:**
  - `getStorageKey(userId, movieId)`: Generates a unique key for storing the video progress in `localStorage`.
  - `handleTimeUpdate()`: Saves the current time of the video to `localStorage` at regular intervals.
  - `handleEnded()`: Removes the saved position from `localStorage` when the video ends.
  - `useEffect()`: Checks for a saved position when the video page is loaded and shows the prompt if necessary.
  - `handleContinue()`: Seeks the video to the saved position and starts playback.
  - `handleRestart()`: Resets the video to the beginning and starts playback.

---

#### Autoplay و Reactivity (پاسخ به سوالات فنی/محصول)

- **Autoplay:**
  - پس از انتخاب کاربر (ادامه یا شروع مجدد)، ویدیو به صورت خودکار پخش می‌شود (autoplay) تا تجربه کاربری روان باشد.
  - به دلیل محدودیت‌های مرورگرها، autoplay فقط پس از تعامل کاربر (کلیک روی دکمه) فعال می‌شود و در حالت اولیه بدون اجازه کاربر اجرا نمی‌شود.
  - اگر کاربر گزینه «ادامه» را انتخاب کند، ویدیو به موقعیت ذخیره‌شده seek می‌شود و بلافاصله پخش آغاز می‌گردد.
  - اگر کاربر «شروع مجدد» را انتخاب کند، ویدیو از ابتدا پخش می‌شود و موقعیت قبلی حذف می‌گردد.

- **Reactivity (واکنش‌پذیری):**
  - ذخیره و بازیابی موقعیت ویدیو به صورت واکنش‌پذیر و با کمترین rerender انجام می‌شود؛ فقط VideoPlayer و کامپوننت‌های مرتبط با وضعیت کاربر به state مربوطه متصل هستند.
  - استفاده از hookها و selectorها باعث می‌شود فقط بخش‌های لازم UI به تغییرات state واکنش نشان دهند و کل صفحه دوباره رندر نشود.
  - تغییر وضعیت کاربر (ورود/خروج) فقط روی دکمه کاربر و صفحه پروفایل اثر می‌گذارد و سایر بخش‌ها بدون تغییر باقی می‌مانند.
  - ذخیره موقعیت ویدیو در localStorage به صورت غیرمسدودکننده (non-blocking) انجام می‌شود تا عملکرد روان بماند.

- **توضیحات بیشتر و پاسخ به سوالات:**
  - پیاده‌سازی به گونه‌ای است که هر کاربر فقط پیشرفت خودش را می‌بیند و اطلاعات سایر کاربران یا مهمان‌ها جداگانه ذخیره می‌شود.
  - اگر کاربر وارد نشده باشد، امکان ادامه ویدیو وجود ندارد و ابتدا باید ثبت‌نام/ورود انجام شود.
  - جزئیات بیشتر و پاسخ به سوالات فنی/محصولی در بخش پرسش و پاسخ README آمده است.

---

## Troubleshooting

### API Connection Errors

If you see `ERR_CONNECTION_REFUSED` errors, make sure the JSON Server is running on port 4000. Check that:

1. You've installed JSON Server (`npm install -g json-server`)
2. The server is running with the command `json-server --watch db.json --port 4000`
3. There are no other services using port 4000

### Alternative Mock Data Solution

If you prefer not to use JSON Server, you can modify the `src/services/api.ts` file to use mock data instead:

```typescript
// filepath: src/services/api.ts
import { Movie } from '../types/Movie';

const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Downton Abbey",
    genre: "Drama",
    year: 2004,
    director: "Guy Ritchie",
    rating: 8.5,
    description: "A family drama set in the 19th century, with a focus on the lives of the Crawley family and their servants.",
    poster: "src/assets/downton.jpg",
    videoUrl: "/videos/interstellar.mp4"
  },
  // Add more mock movies as needed
];

export const api = {
  get: async (endpoint: string) => {
    if (endpoint === '/movies') {
      return { data: mockMovies };
    }
    throw new Error('Endpoint not mocked');
  },
  post: async (endpoint: string, data: any) => {
    if (endpoint === '/movies') {
      console.log('Movie added (mock):', data);
      return { data: { id: Date.now(), ...data } };
    }
    throw new Error('Endpoint not mocked');
  }
};
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
