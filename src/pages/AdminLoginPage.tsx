// src/pages/AdminLoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi, setAuthToken } from "../services/api";
import { useUserStore, useErrorStore } from "../store";
import Icon from "../components/Icon";
import type { User } from "../types/User";
import { USER_LOGIN_URL, USER_ME_URL,  } from "../constants/api";

type AnyUser = Partial<User> & Record<string, any>;

// Adjust these if your backend paths differ
// const LOGIN_PATH = "/api/user/login/";
// const ME_PATH = "/api/user/me/";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { error, showError, clearError } = useErrorStore();
  const { login } = useUserStore();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      showError("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Login -> expect { token, ... }
      const loginRes = await authApi.post(
        USER_LOGIN_URL,
        { email, password },
        { withCredentials: false }
      );
      const logged = loginRes.data as AnyUser;

      if (!logged?.token) {
        showError("Login succeeded but no token was returned");
        return;
      }

      // 2) Attach token for subsequent calls
      setAuthToken(logged.token);

      // 3) Fetch profile -> must include is_admin
      const meRes = await authApi.get(USER_ME_URL);
      const profile = meRes.data as AnyUser;

      if (profile?.is_admin !== true) {
        showError("Access denied: Not an admin account");
        return;
      }

      // 4) Merge and persist
      const finalUser: AnyUser = {
        ...logged,
        ...profile,
        token: logged.token,
        is_admin: true,
      };
      if (!finalUser.email) finalUser.email = email;

      login(finalUser as any);
      localStorage.setItem("user", JSON.stringify(finalUser));
      if (finalUser.id != null)
        localStorage.setItem("userId", String(finalUser.id));

      navigate("/admin", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) showError("Invalid credentials");
      else if (status === 404) showError("Login endpoint not found on server");
      else showError("Login failed. Please check the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-white">
      <form
        onSubmit={handleAdminLogin}
        className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6 min-w-[320px] max-w-md border-2 border-yellow-300/60"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-4 border-yellow-400 flex items-center justify-center">
            <Icon name="UserIcon" size={36} className="text-yellow-700" />
          </div>
          <h2 className="text-2xl font-extrabold text-yellow-600">
            Admin Login
          </h2>
          <p className="text-gray-600 text-sm">Authorized admins only</p>
        </div>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/80"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-yellow-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/80"
          disabled={isLoading}
        />

        {error && (
          <div className="text-red-600 text-center font-semibold bg-red-50 rounded-xl py-2 px-3 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? "Checking…" : "Login as Admin"}
        </button>

        <Link
          to="/"
          className="text-center text-yellow-700 font-semibold hover:underline"
        >
          ← Back to Home
        </Link>
      </form>
    </div>
  );
};

export default AdminLoginPage;
