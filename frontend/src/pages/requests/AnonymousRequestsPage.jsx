import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useAnonymousRequests, useDeleteAnonymousRequest } from "../../hooks/useAnonymousRequests";
import Button from "../../components/Button";
import { REQUEST_STATUS, REQUEST_STATUS_LABEL } from "../../shared/constants/requestStatus";
import { useAuth } from "../../components/auth/AuthContext";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import { formatDate } from "../../shared/utils/dates";
import StatusPill from "../../shared/components/StatusPill";

const DEFAULT_PAGE_SIZE = 8;

export default function AnonymousRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState("all");
  const { hasRole, can } = useAuth();
  const isAdmin = hasRole?.('admin');
  const canManage = can?.('manage_anonymous_requests');
  const deleteReq = useDeleteAnonymousRequest();

  const { data, isLoading, isFetching, error } = useAnonymousRequests({ page, pageSize, status });
  const requests = Array.isArray(data?.requests) ? data.requests : [];
  const meta = data?.meta ?? {};
  const total = meta.total ?? requests.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!isLoading && !isFetching && page > 1 && requests.length === 0 && total > 0) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isLoading, isFetching, page, requests.length, total]);

  const tabs = useMemo(() => (
    [
      { key: 'all', label: 'Όλα' },
      { key: REQUEST_STATUS.UNASSIGNED, label: 'Ανοιχτά' },
      { key: REQUEST_STATUS.IN_PROGRESS, label: 'Σε εξέλιξη' },
      { key: REQUEST_STATUS.ASSIGNED, label: 'Ανατεθειμένα' },
      { key: REQUEST_STATUS.COMPLETED, label: 'Ολοκληρωμένα' },
      { key: REQUEST_STATUS.CANCELED, label: 'Ακυρωμένα' },
    ]
  ), []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Τηλεφωνικά Αιτήματα</h1>
        {canManage && (
          <Link to="/app/anonymous-requests/new">
            <Button variant="primary">Νέο Τηλεφωνικό Αίτημα</Button>
          </Link>
        )}
      </div>

      <div className="rounded-xl border bg-white p-2">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatus(tab.key);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-0 overflow-hidden rounded-xl border bg-white">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <span className="font-medium text-slate-700">Λίστα τηλεφωνικών αιτημάτων</span>
          {isFetching && <span className="text-xs text-slate-500">Ανανέωση...</span>}
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-600">Φόρτωση...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error?.message || "Σφάλμα φόρτωσης"}</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-slate-700">
            {status === 'all'
              ? "Δεν υπάρχουν τηλεφωνικά αιτήματα."
              : `Δεν υπάρχουν αιτήματα με κατάσταση «${REQUEST_STATUS_LABEL[status] ?? status}».`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">#</th>
                  <th className="px-4 py-3 text-left font-medium w-20">ID</th>
                  <th className="px-4 py-3 text-left font-medium w-[10rem]">Ημ/νία</th>
                  <th className="px-4 py-3 text-left font-medium w-[12rem]">Όνομα</th>
                  <th className="px-4 py-3 text-left font-medium w-[10rem]">Τηλέφωνο</th>
                  <th className="px-4 py-3 text-left font-medium w-[10rem]">Υπηρεσία</th>
                  <th className="px-4 py-3 text-left font-medium w-[10rem]">Κατάσταση</th>
                  <th className="px-4 py-3 text-left font-medium w-[30%]">Περιγραφή</th>
                  <th className="px-4 py-3 text-left font-medium w-[8rem]">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((r, index) => {
                  const rowNumber = (page - 1) * pageSize + index + 1;
                  const isDeleting = deleteReq.isPending && deleteReq.variables?.id === r.request_id;

                  return (
                    <tr key={r.request_id}>
                      <td className="px-4 py-3 whitespace-nowrap">{rowNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{r.request_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updated_at ?? r.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.full_name || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.mobile || "-"}</td>
                      <td className="px-4 py-3">{getServiceTypeLabel(r.service_type)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700 align-top whitespace-pre-wrap break-words">
                        {r.description?.substring(0, 100) || "-"}
                        {r.description?.length > 100 && "..."}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/app/anonymous-requests/${r.request_id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
                            title="Προβολή αιτήματος"
                          >
                            <Eye className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                            <span className="sr-only">Προβολή</span>
                          </Link>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isDeleting}
                              onClick={() => {
                                if (window.confirm(`Διαγραφή αιτήματος #${r.request_id}; Η ενέργεια δεν μπορεί να αναιρεθεί.`)) {
                                  deleteReq.mutate({ id: r.request_id });
                                }
                              }}
                              loading={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Διαγραφή</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm text-slate-600">
        <span>
          Σελίδα {page} από {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || isLoading || isFetching}
          >
            Προηγούμενη
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages || isLoading || isFetching}
          >
            Επόμενη
          </Button>
        </div>
      </div>
    </section>
  );
}
