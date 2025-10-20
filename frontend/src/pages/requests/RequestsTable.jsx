import { Link } from "react-router-dom";
import { Eye, View, ScanEye } from "lucide-react";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import { formatDate } from "../../shared/utils/dates";
import StatusPill from "../../shared/components/StatusPill";

export default function RequestsTable({
  title,
  requests,
  isLoading,
  isFetching,
  error,
  emptyMessage,
  showRequester = false,
  linkState,
  renderActions,
}) {
  const rows = requests ?? [];
  const hasRows = rows.length > 0;

  return (
    <div className="p-0 overflow-hidden rounded-xl border bg-white">
      <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
        <span className="font-medium text-slate-700">{title}</span>
        {isFetching && <span className="text-xs text-slate-500">Ανανέωση…</span>}
      </div>

      {isLoading ? (
        <div className="p-6 text-slate-600">Φόρτωση…</div>
      ) : error ? (
        <div className="p-6 text-red-600">
          {error?.message || "Σφάλμα φόρτωσης"}
        </div>
      ) : !hasRows ? (
        <div className="p-6 text-slate-700">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium w-16">#</th>
                <th className="px-4 py-3 text-left font-medium w-[13rem]">
                  Ημ/νία
                </th>
                <th className="px-4 py-3 text-left font-medium w-[14rem]">
                  Υπηρεσία
                </th>
                {showRequester && (
                  <th className="px-4 py-3 text-left font-medium w-[14rem]">
                    Αιτών
                  </th>
                )}
                <th className="px-4 py-3 text-left font-medium w-[12rem]">
                  Κατάσταση
                </th>
                <th className="px-4 py-3 text-left font-medium w-[50%]">
                  Περιγραφή
                </th>
                <th className="px-4 py-3 text-left font-medium w-[8rem]">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const requesterName = [r.requester_first_name, r.requester_last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim();

                return (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.request_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(r.updated_at ?? r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {getServiceTypeLabel(r.service_type)}
                    </td>
                    {showRequester && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {requesterName || r.user_email || "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 align-top whitespace-pre-wrap break-words">
                      {r.description || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(() => {
                        const viewLink = (
                          <Link
                            to={`/app/requests/${r.request_id}`}
                            state={
                              typeof linkState === "function"
                                ? linkState(r)
                                : linkState
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
                            title="Προβολή αιτήματος"
                          >
                            <Eye className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                            <span className="sr-only">Προβολή</span>
                          </Link>
                        );
                        if (!renderActions) return viewLink;
                        const extra = renderActions(r);
                        if (!extra) return viewLink;
                        return (
                          <div className="flex items-center gap-2">
                            {viewLink}
                            {extra}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
