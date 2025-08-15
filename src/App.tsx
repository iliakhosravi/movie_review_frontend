// src/App.tsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { useUserStore } from "./store";
import { setAuthToken } from "./services/api";
import type { User } from "./types/User";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/register" replace />;
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const storeUser = useUserStore((s) => s.user);
  let lsUser: User | null = null;
  try {
    lsUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    lsUser = null;
  }
  const u = storeUser ?? lsUser;

  if (!u) return <Navigate to="/admin-login" replace />;
  if ((u as any).is_admin !== true) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const setUser = useUserStore((s) => s.setUser);

  // Bootstrap user + token from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsed = JSON.parse(raw) as any;
        setUser(parsed);
        if (token) setAuthToken(token);
      } catch {
        /* ignore parse errors */
        console.error("Failed to parse user from localStorage");
      }
    }
  }, [setUser]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/movies/:id"
        element={
          <ProtectedRoute>
            <MovieDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
