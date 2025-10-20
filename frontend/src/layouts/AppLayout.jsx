import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="bg-slate-50"> 
      <Header />

      {/* Layout container */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-x-6">
          <Sidebar /> 
          <main className="py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Unified footer */}
      <footer role="contentinfo" className="mt-10 border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500">
          <div className="flex items-center justify-between">
            <p>© {new Date().getFullYear()} BillMaN</p>
            <p>Thesis Project • v 0.3.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

