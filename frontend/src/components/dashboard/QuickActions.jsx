import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function QuickActions() {
  const { hasRole, can } = useAuth();

  return (
    <section>
      <h2 className="sr-only">Γρήγορες ενέργειες</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Patient */}
        {hasRole("patient") && (
          <>
            {can("create_request") && (
              <Link to="/app/requests/new" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
                Νέο Αίτημα
              </Link>
            )}
            {can("view_own_requests") && (
              <Link to="/app/requests" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
                Τα Αιτήματά μου
              </Link>
            )}
          </>
        )}

        {/* Staff/Admin */}
        {(can("view_assigned_requests") || can("view_requests")) && (
          <>
            {can("view_assigned_requests") && (
              <Link to="/app/requests/assigned" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
                Ανατεθειμένα σε εμένα
              </Link>
            )}
            {can("assign_requests") && (
              <Link to="/app/requests/unassigned" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
                Ανάθεση Αιτημάτων
              </Link>
            )}
            {can("view_requests") && (
              <Link to="/app/requests" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
                Όλα τα Αιτήματα
              </Link>
            )}
          </>
        )}

        {/* Admin/Employees with user-related permissions */}
        {(can("manage_users") || can('update_user') || can('view_patient_info')) && (
          <Link to="/app/users" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
            Διαχείριση Χρηστών
          </Link>
        )}
        {/*TODO: separate role management page */}
        {/* {can("manage_roles") && (
          <Link to="/app/admin/roles" className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow">
            Διαχείριση Ρόλων
          </Link>
        )} */}
      </div>
    </section>
  );
}
