import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import kefiLogo from "../assets/kefiLogo.jpg";
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
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span>
            <img
              src={kefiLogo}
              alt="Σύλλογος ΚΕΦΙ"
              className="mx-auto mb-4 h-24 w-auto rounded-lg shadow-sm"
              loading="eager"
            />
          </span>
          <span className="font-semibold">HelpMe-HelpYou</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications badge (stub) */}
          {isLoggedIn && (
            <Link
              to="/notifications"
              className="relative rounded-lg px-2 py-1 hover:bg-slate-100"
            >
              <BellRing className="w-5 h-5 text-slate-600" />
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                2
              </span>
            </Link>
          )}

          {isLoggedIn && (
            <>
              <Link to="/app/profile" className="text-sm text-slate-700 hover:underline">
                {user?.name ?? user?.email} <User className="inline-block ml-1 mb-1" />
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
