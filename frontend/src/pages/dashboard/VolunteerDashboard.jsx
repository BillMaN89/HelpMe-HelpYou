import { Link } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyTile from "../../components/dashboard/FancyTile";
import RequestList from "../../components/dashboard/RequestList";
import { FileText, PlusCircle, ClipboardList } from "lucide-react";
import { useAssignedToMe } from "../../hooks/userRequests";
import { useAuth } from "../../components/auth/AuthContext";


export default function VolunteerDashboard() {
  const { can } = useAuth();
  const { data: assigned = [], isLoading } = useAssignedToMe({ enabled: can('view_assigned_requests') });
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
          title="Ανατεθειμένα σε εμένα"
          desc="Όσα πρέπει να εξυπηρετήσεις."
          Icon={ClipboardList}
          tone="caution"
          // badge={1}
        />
      </div>

      <section>
        <RequestList
          title="Ανατεθειμένα σε εμένα"
          items={assigned}
          linkToAll="/app/requests/assigned"
          loading={isLoading}
          emptyMessage="Δεν έχεις ανατεθειμένα."
        />
      </section>
    </div>
  );
}
