import { Link } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyTile from "../../components/dashboard/FancyTile";
import RequestList from "../../components/dashboard/RequestList";
import { useAuth } from "../../components/auth/AuthContext";
import { useMyRequests } from "../../hooks/userRequests";
import { FileText, PlusCircle } from "lucide-react";

export default function PatientDashboard() {
  const { can } = useAuth();
  const { data: mine = [], isLoading } = useMyRequests({ enabled: can('view_own_requests') });
  return (
    <div className="space-y-6">
      <DashboardHeader
        subtitle="Τι θα ήθελες να κάνεις σήμερα;"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FancyTile
          to="/app/requests"
          title="Τα αιτήματά μου"
          desc="Δες την πορεία των αιτημάτων σου."
          Icon={FileText}
          tone="default"
          // badge={2} // όταν βάλω summary counts
        />
        <FancyTile
          to="/app/requests/new"
          title="Νέο αίτημα"
          desc="Καταχώρησε ένα νέο αίτημα υποστήριξης."
          Icon={PlusCircle}
          tone="primary"
        />
      </div>

      <section>
        <RequestList
          title="Τα αιτήματά μου"
          items={mine}
          linkToAll="/app/requests"
          loading={isLoading}
          emptyMessage="Δεν έχεις αιτήματα."
        />
      </section>
    </div>
  );
}
