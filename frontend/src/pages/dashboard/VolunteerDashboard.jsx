import { Link } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyTile from "../../components/dashboard/FancyTile";
import { FileText, PlusCircle, ClipboardList } from "lucide-react";


export default function VolunteerDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        subtitle="Τι θα ήθελες να κάνεις σήμερα;"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FancyTile
          to="/app/requests"
          title="Τα αιτήματά μου"
          desc="Δες τα αιτήματα που έχεις δημιουργήσει."
          Icon={FileText}
          tone="default"
          // badge={5} // αργότερα από /dashboard/summary
        />
        <FancyTile
          to="/app/requests/new"
          title="Νέο αίτημα"
          desc="Καταχώρησε νέο αίτημα υποστήριξης."
          Icon={PlusCircle}
          tone="primary"
        />
        <FancyTile
          to="/app/requests/assigned"
          title="Ανατεθειμένα σε μένα"
          desc="Όσα πρέπει να εξυπηρετήσεις."
          Icon={ClipboardList}
          tone="caution"
          // badge={1}
        />
      </div>
    </div>
  );
}

//function Tile({ to, title, desc, emoji }) {
//   return (
//     <Link
//       to={to}
//       className="rounded-2xl p-5 shadow hover:shadow-md bg-white border border-slate-100 transition"
//     >
//       <div className="text-3xl mb-2">{emoji}</div>
//       <div className="text-lg font-semibold">{title}</div>
//       {desc && <div className="text-slate-500 text-sm mt-1">{desc}</div>}
//     </Link>
//   );
// }