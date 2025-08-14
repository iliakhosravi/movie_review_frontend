// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { api, authApi } from "../services/api";
import type { Movie } from "../types/Movie";
import MovieList from "../components/MovieList";
import AddMovieForm from "../components/AddMovieForm";
import LateInput from "../components/LateInput";
import Header from "../components/Header";
// import { MOVIES_ENDPOINT } from "../constants/api";
// import { USERS_ENDPOINT } from "../constants/userApi";
import { MOVIE_LIST_URL, USER_ME_URL } from "../constants/api";
import { useUserStore, useUIStore } from "../store";
import AdvancedSearch, {
  type AdvancedFilters,
} from "../components/AdvancedSearch";

const normalize = (v: unknown) => (v ?? "").toString().toLowerCase().trim();

const Home = () => {
  const setUser = useUserStore((s) => s.setUser);
  const {
    search,
    setSearch,
    view,
    showAddForm,
    setShowAddForm,
    isScrolled,
    setIsScrolled,
  } = useUIStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // فیلترهای پیشرفته
  const [adv, setAdv] = useState<AdvancedFilters>({
    title: "",
    director: "",
    genre: "",
    ratingMin: "",
    ratingMax: "",
    yearMin: "",
    yearMax: "",
  });

  // نمایش/عدم نمایش پنل جست‌وجوی پیشرفته (کنترل با دکمه در Header)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // مدیریت اسکرول برای هدر
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsScrolled]);

  // گرفتن لیست فیلم‌ها
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await authApi.get<Movie[]>(MOVIE_LIST_URL);
        setMovies(response.data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    fetchMovies();
  }, []);

  // گرفتن کاربر لاگین‌شده (در صورت وجود)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await authApi.get(USER_ME_URL);
          setUser(response.data);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  // debounce برای سرچ سریع هدر (useUIStore.search)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // اعمال فیلترها
  const filteredMovies = useMemo(() => {
    const q = normalize(debouncedSearch);
    const t = normalize(adv.title);
    const d = normalize(adv.director);
    const g = normalize(adv.genre);

    const rMin = adv.ratingMin ? Number(adv.ratingMin) : undefined;
    const rMax = adv.ratingMax ? Number(adv.ratingMax) : undefined;
    const yMin = adv.yearMin ? Number(adv.yearMin) : undefined;
    const yMax = adv.yearMax ? Number(adv.yearMax) : undefined;

    return movies.filter((m) => {
      const title = normalize((m as any).title);
      const director = normalize((m as any).director);
      const genre = normalize((m as any).genre);
      const rating = Number((m as any).rating ?? 0);
      const year = Number((m as any).year ?? 0);

      // جست‌وجوی سریع (LateInput هدر): title/director/genre
      const quickPass = q
        ? title.includes(q) || director.includes(q) || genre.includes(q)
        : true;

      // فیلترهای پیشرفته
      const titlePass = t ? title.includes(t) : true;
      const directorPass = d ? director.includes(d) : true;
      const genrePass = g ? genre.includes(g) : true;

      const ratingMinPass = rMin != null ? rating >= rMin : true;
      const ratingMaxPass = rMax != null ? rating <= rMax : true;

      const yearMinPass = yMin != null ? year >= yMin : true;
      const yearMaxPass = yMax != null ? year <= yMax : true;

      return (
        quickPass &&
        titlePass &&
        directorPass &&
        genrePass &&
        ratingMinPass &&
        ratingMaxPass &&
        yearMinPass &&
        yearMaxPass
      );
    });
  }, [movies, debouncedSearch, adv]);

  return (
    <div className="home-container min-h-screen bg-white">
      <Header
        isScrolled={isScrolled}
        // دکمه Advanced Search در هدر
        onToggleAdvancedSearch={() => setShowAdvanced((prev) => !prev)}
        showAdvanced={showAdvanced}
        // دکمه Add Movie را پاس نده تا در هدر نمایش داده نشود (فقط در Admin)
        // onAddMovieClick={() => setShowAddForm(!showAddForm)}
      />

      {/* Mobile Search */}
      <div className="md:hidden px-4 pt-20 pb-4">
        <LateInput
          value={search}
          onChange={setSearch}
          onDebouncedChange={setSearch}
          debounce={500}
        />
      </div>

      <main className="container mx-auto px-4 pt-6 md:pt-24 pb-12">
        {/* پنل جست‌وجوی پیشرفته */}
        {showAdvanced && (
          <div className="mb-6 animate-fadeIn">
            <AdvancedSearch value={adv} onChange={setAdv} />
          </div>
        )}

        {/* فرم افزودن فیلم (اگر از قبل همین رفتار را در Home می‌خواستی) */}
        {showAddForm && (
          <AddMovieForm
            onAdd={() => {
              setDebouncedSearch("");
              setShowAddForm(false);
            }}
          />
        )}

        <MovieList movies={filteredMovies} view={view} />
      </main>
    </div>
  );
};

export default Home;
