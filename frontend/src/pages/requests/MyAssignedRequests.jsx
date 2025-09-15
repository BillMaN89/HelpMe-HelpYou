import { useAssignedToMe, useUpdateRequestStatus, useDeleteRequest } from "../../hooks/userRequests";
import { getStatusLabel } from "../../shared/constants/requestStatus";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import Button from "../../components/Button";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../components/auth/AuthContext";

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



export default function AssignedToMePage() {
  const { data, isLoading, isFetching } = useAssignedToMe();
  const updateStatus = useUpdateRequestStatus();
  const removeReq = useDeleteRequest();
  const { can } = useAuth();
  const requests = data ?? [];
  const canEditStatus = can('edit_req_status');
  const canDelete = can('update_request');

  function handleDelete(r) {
    if (!window.confirm(`Διαγραφή αιτήματος #${r.request_id}; Είστε σίγουροι;`)) return;
    removeReq.mutate({ id: r.request_id });
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Ανατεθειμένα σε εμένα</h1>

      {isLoading ? (
        <div className="p-4 rounded-xl border bg-white">Φόρτωση…</div>
      ) : requests.length === 0 ? (
        <div className="p-6 rounded-xl border bg-white text-slate-700">
          Δεν υπάρχουν ανατεθειμένα αιτήματα.
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
                {canDelete && <th className="px-4 py-3 text-left font-medium">Ενέργειες</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((r) => (
                <tr key={r.request_id}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updated_at ?? r.created_at)}</td>
                  <td className="px-4 py-3">{getServiceTypeLabel(r.service_type)}</td>
                  <td className="px-4 py-3">
                    {canEditStatus ? (
                      <select
                        className="rounded-md border px-2 py-1 text-sm"
                        defaultValue={r.status}
                        disabled={updateStatus.isPending}
                        onChange={(e) => {
                          const ns = e.target.value;
                          const label = getStatusLabel(ns);
                          if (!window.confirm(`Αλλαγή κατάστασης σε «${label}»;`)) {
                            e.target.value = r.status;
                            return;
                          }
                          updateStatus.mutate({ id: r.request_id, status: ns });
                        }}
                      >
                        <option value="assigned">{getStatusLabel('assigned')}</option>
                        <option value="in_progress">{getStatusLabel('in_progress')}</option>
                        <option value="completed">{getStatusLabel('completed')}</option>
                        <option value="canceled">{getStatusLabel('canceled')}</option>
                      </select>
                    ) : (
                      <StatusPill status={r.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span title={r.description}>{(r.description ?? "").slice(0, 120)}{(r.description?.length ?? 0) > 120 ? "…" : ""}</span>
                  </td>
                    {canDelete && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(r)}
                          loading={removeReq.isPending}
                          title="Διαγραφή αιτήματος"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
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
