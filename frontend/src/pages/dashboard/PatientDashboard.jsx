import { Link } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyTile from "../../components/dashboard/FancyTile";
import { FileText, PlusCircle } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        // title: άστο να πάρει το default "Καλωσήρθες, {Όνομα} 👋"
        subtitle="Γρήγορες ενέργειες για τα αιτήματά σου."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FancyTile
          to="/app/requests"
          title="Τα αιτήματά μου"
          desc="Δες την πορεία των αιτημάτων σου."
          Icon={FileText}
          tone="default"
          // badge={2} // όταν βάλουμε summary counts
        />
        <FancyTile
          to="/app/requests/new"
          title="Νέο αίτημα"
          desc="Ξεκίνα ένα νέο αίτημα υποστήριξης."
          Icon={PlusCircle}
          tone="primary"
        />
      </div>
    </div>
  );
}

// function Tile({ to, title, desc, emoji }) {
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