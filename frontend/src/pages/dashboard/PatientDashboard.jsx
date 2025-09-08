import { Link } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyTile from "../../components/dashboard/FancyTile";
import { FileText, PlusCircle } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        // title: άστο να πάρει το default "Καλωσήρθες, {Όνομα} 👋"
        subtitle="Τι θα ήθελες να κάνεις σήμερα;"
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
          desc="Καταχώρησε ένα νέο αίτημα υποστήριξης."
          Icon={PlusCircle}
          tone="primary"
        />
      </div>
    </div>
  );
}
