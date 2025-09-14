import { Routes, Route } from "react-router-dom";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RootLayout from "./layouts/RootLayout";   // Public layout
import AppLayout from "./layouts/AppLayout";     // Private layout

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import RequestCreatePage from "./pages/requests/RequestCreatePage";
import MyRequestsPage from "./pages/requests/MyRequestsPage";
import RequestsIndex from "./pages/requests/RequestsIndex";
import AssignedToMePage from "./pages/requests/MyAssignedRequests";
import UnassignedRequestsPage from "./pages/requests/UnassignedRequestsPage";
import UsersPage from "./pages/users/UsersPage";
import UserCreatePage from "./pages/users/UserCreatePage";
import UserProfileView from "./pages/users/UserProfileView";

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
          <Route path="requests" element={<RequestsIndex />} />
          <Route path="requests/assigned" element={<AssignedToMePage />} />
          <Route path="requests/unassigned" element={<UnassignedRequestsPage />} />
          <Route path="myRequests" element={<MyRequestsPage />} />
          <Route path="requests/new" element={<RequestCreatePage />} />
          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />
          {/* Users */}
          <Route path="users" element={<UsersPage />} />
          <Route path="users/new" element={<UserCreatePage />} />
          <Route path="users/:email" element={<UserProfileView />} />
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
      <ToastContainer position="top-right" autoClose={2500} newestOnTop theme="light" />
    </AuthProvider>
  );
}
