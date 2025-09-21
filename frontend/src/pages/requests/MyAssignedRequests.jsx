import { useAssignedToMe, useUpdateRequestStatus } from "../../hooks/userRequests";
import { getStatusLabel } from "../../shared/constants/requestStatus";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import { useAuth } from "../../components/auth/AuthContext";
import StatusPill from "../../shared/components/StatusPill";
import { formatDate } from "../../shared/utils/dates";

export default function AssignedToMePage() {
  const { data, isLoading, isFetching } = useAssignedToMe();
  const updateStatus = useUpdateRequestStatus();
  const { can } = useAuth();
  const requests = data ?? [];
  const canEditStatus = can('edit_req_status');
  
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
