import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import kefiLogo from "../assets/kefi.jpeg";
import Button from "../components/Button";
import { User, BellRing } from "lucide-react";

export default function Header() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    window.location.replace("/");                     
    // navigate("/", { replace: true });
  }

  return (
  <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {/* Logo wrapper with fixed box — prevents overflow */}
        <div className="px-3 py-3">
          <div className="h-12 w-12 rounded-md bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <img src={kefiLogo} alt="ΚΕΦΙ" className="h-12 w-12 object-contain" />
          </div>
        </div>

        <span className="font-semibold tracking-tight">HelpMe - HelpYou</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        {isLoggedIn && (
          <Link
            to="/notifications"
            className="relative rounded-lg px-2 py-1 hover:bg-slate-100"
          >
            <BellRing className="h-5 w-5 text-slate-600" />
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
              
            </span>
          </Link>
        )}

        {isLoggedIn && (
          <>
            <Link
              to="/app/profile"
              className="max-w-[220px] truncate text-sm text-slate-700 hover:underline"
              title={user?.name ?? user?.email}
            >
              {user?.name ?? user?.email} <User className="ml-1 inline-block h-4 w-4 align-[-2px]" />
            </Link>
            <Button onClick={handleLogout} size="sm" variant="secondary">
              Αποσύνδεση
            </Button>
          </>
        )}
      </div>
    </div>
  </header>

  );
}
