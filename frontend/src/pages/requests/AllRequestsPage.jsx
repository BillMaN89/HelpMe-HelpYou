import { useAllRequests } from "../../hooks/userRequests";
import { Link } from "react-router-dom";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
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

export default function AllRequestsPage() {
  const { data, isLoading, isFetching, error } = useAllRequests();
  const requests = data ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Όλα τα αιτήματα</h1>

      <div className="p-0 overflow-hidden rounded-xl border bg-white">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <span className="font-medium text-slate-700">Λίστα αιτημάτων</span>
          {isFetching && (
            <span className="text-xs text-slate-500">Ανανέωση…</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-600">Φόρτωση…</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error?.message || 'Σφάλμα φόρτωσης'}</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-slate-700">Δεν υπάρχουν αιτήματα.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">#</th>
                  <th className="px-4 py-3 text-left font-medium w-[13rem]">Ημ/νία</th>
                  <th className="px-4 py-3 text-left font-medium w-[14rem]">Υπηρεσία</th>
                  <th className="px-4 py-3 text-left font-medium w-[12rem]">Κατάσταση</th>
                  <th className="px-4 py-3 text-left font-medium w-[50%]">Περιγραφή</th>
                  <th className="px-4 py-3 text-left font-medium w-[8rem]">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((r) => (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 whitespace-nowrap">{r.request_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updated_at ?? r.created_at)}</td>
                    <td className="px-4 py-3">{getServiceTypeLabel(r.service_type)}</td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-700 align-top whitespace-pre-wrap break-words w-[50%]">
                      {r.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/app/requests/${r.request_id}`}
                        className="text-indigo-700 hover:underline text-sm"
                        title="Προβολή αιτήματος"
                      >
                        Προβολή
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
