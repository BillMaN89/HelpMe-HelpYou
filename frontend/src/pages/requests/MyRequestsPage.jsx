import { Link } from "react-router-dom";
import { useMyRequests } from "../../hooks/userRequests";
import Button from '../../components/Button';
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import StatusPill from "../../shared/components/StatusPill";
import { formatDate } from "../../shared/utils/dates";

// centralized in constants
const formatService = getServiceTypeLabel;

export default function MyRequestsPage() {
  const { data, isLoading, isFetching } = useMyRequests();
  const requests = data ?? [];

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Τα αιτήματά μου</h1>
        <Link to="/app/requests/new">
          <Button>Νέο αίτημα</Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="p-4 rounded-xl border bg-white">Φόρτωση…</div>
      ) : requests.length === 0 ? (
        <div className="p-6 rounded-xl border bg-white">
          <p className="text-slate-700">Δεν έχεις καταχωρήσει ακόμη αιτήματα.</p>
          <div className="mt-3">
            <Link to="/app/requests/new">
              <Button>Δημιουργία αιτήματος</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ημ/νία</th>
                <th className="px-4 py-3 text-left font-medium">Υπηρεσία</th>
                <th className="px-4 py-3 text-left font-medium">Κατάσταση</th>
                <th className="px-4 py-3 text-left font-medium">Περιγραφή</th>
                <th className="px-4 py-3 text-left font-medium">Ανάθεση</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((r) => (
                <tr key={r.request_id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">{formatService(r.service_type)}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-700">
                    <span title={r.description}>{(r.description ?? "").slice(0, 120)}{(r.description?.length ?? 0) > 120 ? "…" : ""}</span>
                  </td>
                  <td className="px-4 py-3">{r.assigned_employee_email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isFetching && <div className="px-4 py-2 text-xs text-slate-500">Ανανέωση…</div>}
        </div>
      )}
    </section>
  );
}
