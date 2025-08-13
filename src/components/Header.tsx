// src/components/Header.tsx
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { useUIStore, useUserStore } from "../store";
import LateInput from "../components/LateInput";
import Icon from "../components/Icon";
import RegisterModal from "./RegisterModal";
import UserButton from "../components/UserButton";

interface HeaderProps {
  isScrolled: boolean;
  placeholder?: string;
  className?: string;
  onAddMovieClick?: () => void;
  onToggleAdvancedSearch?: () => void; // toggle advanced search panel in Home
  showAdvanced?: boolean; // visual state of advanced search button
}

const Header = ({
  isScrolled,
  onAddMovieClick,
  onToggleAdvancedSearch,
  showAdvanced = false,
}: HeaderProps) => {
  const { search, setSearch, view, setView } = useUIStore();
  const { user } = useUserStore(); // <- مهم: برای تشخیص ادمین
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.includes("/admin");

  // دیباگ سریع برای اطمینان از وضعیت کاربر
  console.log("USER in Header:", user);

  const handleAdminLogin = () => navigate("/admin-login");

  return (
    <header
      className={`imdb-navbar transition-all duration-300 shadow-md bg-gradient-to-r from-yellow-50 via-white to-yellow-100 ${
        isScrolled ? "py-2" : "py-6"
      } px-4 md:px-12 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50`}
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="imdb-logo bg-gradient-to-tr from-yellow-400 to-yellow-200 p-1 rounded-full shadow-lg"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12 rounded-full border-2 border-yellow-300 shadow"
          />
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 drop-shadow-lg tracking-tight">
          MultiMedia <span className="text-yellow-600">Magic</span>
        </h1>
      </div>

      {/* Quick Search + Advanced toggle */}
      <div className="search-container w-full md:w-1/3 mt-4 md:mt-0 md:mx-8 flex gap-2 items-center">
        <LateInput
          value={search}
          onChange={setSearch}
          onDebouncedChange={setSearch}
          debounce={500}
        />
        {onToggleAdvancedSearch && (
          <button
            type="button"
            onClick={onToggleAdvancedSearch}
            className={`px-3 py-2 text-sm rounded-lg border transition ${
              showAdvanced
                ? "bg-yellow-400 border-yellow-500 text-black"
                : "bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            }`}
            title="Advanced Search"
          >
            {showAdvanced ? "Hide Advanced" : "Advanced Search"}
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        {/* User */}
        <UserButton />

        {/* Admin Login button (اگر ادمین لاگین نباشه) */}
        {(!user || !user.is_admin) && (
          <button
            type="button"
            onClick={handleAdminLogin}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Admin Login
          </button>
        )}

        {/* View Toggle */}
        <div className="view-toggle flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center rounded-2xl gap-1 px-4 py-2 font-semibold transition-all duration-300 ${
              view === "grid"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 scale-105"
                : "bg-white text-gray-600 hover:bg-yellow-100"
            }`}
            title="Grid"
          >
            <Icon name="GridIcon" size={20} className="h-5 w-5" />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center rounded-2xl gap-1 px-4 py-2 font-semibold transition-all duration-300 ${
              view === "list"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 scale-105"
                : "bg-white text-gray-600 hover:bg-yellow-100"
            }`}
            title="List"
          >
            <Icon name="ListIcon" size={20} className="h-5 w-5" />
            <span className="hidden md:inline">List</span>
          </button>
        </div>

        {/* Add Movie فقط در صفحه ادمین و وقتی کاربر ادمین است */}
        {isAdminPage && user?.is_admin && onAddMovieClick && (
          <button
            onClick={onAddMovieClick}
            className="ml-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            Add Movie
          </button>
        )}
      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </header>
  );
};

export default Header;
