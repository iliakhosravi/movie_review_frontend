// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { Movie } from "../types/Movie";
import MovieList from "../components/MovieList";
import LateInput from "../components/LateInput";
import Header from "../components/Header";
import { MOVIES_ENDPOINT } from "../constants/api";
import { USERS_ENDPOINT } from "../constants/userApi";
import { useUserStore, useUIStore } from "../store";
import AdvancedSearch, {
  type AdvancedFilters,
} from "../components/AdvancedSearch";

const normalize = (v: unknown) => (v ?? "").toString().toLowerCase().trim();

const Home = () => {
  const setUser = useUserStore((s) => s.setUser);
  const { search, setSearch, view, isScrolled, setIsScrolled } = useUIStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Advanced search filters
  const [adv, setAdv] = useState<AdvancedFilters>({
    title: "",
    director: "",
    genre: "",
    ratingMin: "",
    ratingMax: "",
    yearMin: "",
    yearMax: "",
  });

  // Show/Hide Advanced Search panel (toggled via Header button)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sticky header scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsScrolled]);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get<Movie[]>(MOVIES_ENDPOINT);
        setMovies(response.data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    fetchMovies();
  }, []);

  // Fetch logged-in user (if any)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await api.get(`${USERS_ENDPOINT}/${userId}`);
          setUser(response.data);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  // Debounce quick search from header
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Apply filters
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

      // Quick search (title/director/genre)
      const quickPass = q
        ? title.includes(q) || director.includes(q) || genre.includes(q)
        : true;

      // Advanced filters
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
        // Advanced Search toggle in header
        onToggleAdvancedSearch={() => setShowAdvanced((prev) => !prev)}
        showAdvanced={showAdvanced}
        // No AddMovie button here; admins add movies in Admin panel
      />

      {/* Mobile quick search */}
      <div className="md:hidden px-4 pt-20 pb-4">
        <LateInput
          value={search}
          onChange={setSearch}
          onDebouncedChange={setSearch}
          debounce={500}
        />
      </div>

      <main className="container mx-auto px-4 pt-6 md:pt-24 pb-12">
        {/* Advanced Search Panel */}
        {showAdvanced && (
          <div className="mb-6 animate-fadeIn">
            <AdvancedSearch value={adv} onChange={setAdv} />
          </div>
        )}

        <MovieList movies={filteredMovies} view={view} />
      </main>
    </div>
  );
};

export default Home;
