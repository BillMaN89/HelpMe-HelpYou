import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <Header />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 lg:grid-cols-[16rem_1fr]">
        <Sidebar />
        <main className="py-6">
          <Outlet />
        </main>
      <footer className="mt-auto border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-500">
          © {new Date().getFullYear()} BillMaN.
        </div>
      </footer>
      </div>
    </div>
  );
}
