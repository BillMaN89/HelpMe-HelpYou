import { Routes, Route } from "react-router-dom";
import "./index.css";

import RootLayout from "./layouts/RootLayout";   // Public layout
import AppLayout from "./layouts/AppLayout";     // Private layout

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import RequestCreatePage from "./pages/requests/RequestCreatePage";
import RequestForm from "./pages/requests/RequestForm";
import MyRequestsPage from "./pages/requests/MyRequestsPage";

import { RequireLogin } from "./components/auth/Guards";
import { AuthProvider } from "./components/auth/AuthContext";

import { useEffect, useState } from "react";
import http from "./shared/lib/http";
import { API } from "./shared/constants/api";                 

function AppRoutes() {
  return (
    <Routes>
      {/* Public area */}
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected area */}
      <Route element={<RequireLogin />}>
        <Route path="app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Requests */}
          <Route path="requests" element={<MyRequestsPage />} />
          <Route path="requests/new" element={<RequestCreatePage />} />
          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);     
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setBootLoading(false); return; }

    http.get(API.USERS.ME)
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setBootLoading(false));
  }, []);

  if (bootLoading) return <div className="p-6">Φόρτωση…</div>;

  return (
    <AuthProvider user={user} setUser={setUser}>
      <AppRoutes />
    </AuthProvider>
  );
}

