import { Link } from "react-router-dom";
import { useMyRequests } from "../../hooks/userRequests";
import Button from '../../components/Button';
import { getStatusLabel } from "../../shared/constants/requestStatus";


function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("el-GR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return iso; }
}

function formatService(type) {
  if (type === "social") return "Κοινωνική Υπηρεσία";
  if (type === "psychological") return "Ψυχολογική Υποστήριξη";
  return type ?? "-";
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const map = {
    unassigned: "bg-slate-50 text-slate-700 border border-slate-200",
    open: "bg-blue-50 text-blue-700 border border-blue-200",
    assigned: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    in_progress: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
    canceled: "bg-rose-50 text-rose-700 border border-rose-200",
  };
  return (
    <span className={`${base} ${map[status] ?? "bg-slate-100 text-slate-700 border"}`}>
      {getStatusLabel(status)}
    </span>
  );
}

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
