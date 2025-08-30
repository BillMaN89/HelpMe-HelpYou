import { NavLink } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import { NAV_ITEMS } from "../components/config/navConfig";

export default function Sidebar() {
    const { user, hasRole, can} = useAuth();

    const items = NAV_ITEMS.filter(it => {
        if (it.all) return true;
        if (it.showFor && !it.showFor.some(r => hasRole(r))) return false;
        if (it.requireAllPerm && !it.requireAllPerm.every(p => can(p))) return false;
        if (it.requireAnyPerm && !it.requireAnyPerm.some(p => can(p))) return false;
        return true;
    });

    return (
        <aside className="hidden w-64 shrink-0 border-r bg-white p-3 lg:block">
        <nav className="space-y-1">
            {items.map(it => (
            <NavLink
                key={it.key}
                to={it.to}
                className={({isActive}) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`
                }
            >
                {it.label}
            </NavLink>
            ))}
        </nav>
        </aside>
    );
}