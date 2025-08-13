// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import { useUserStore } from "./store";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useUserStore((s) => s.user);
  if (!user) return <Navigate to="/register" replace />;
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useUserStore((s) => s.user);
  // if (!user) return <Navigate to="/register" replace />;
  // if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
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
