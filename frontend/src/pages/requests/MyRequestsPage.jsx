import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useMyRequests } from "../../hooks/UseUserRequests";
import Button from '../../components/Button';
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import StatusPill from "../../shared/components/StatusPill";
import { formatDate } from "../../shared/utils/dates";
import { REQUEST_STATUS, REQUEST_STATUS_LABEL } from "../../shared/constants/requestStatus";

// centralized in constants
const formatService = getServiceTypeLabel;

export default function MyRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [status, setStatus] = useState("all");

  const { data, isLoading, isFetching, error } = useMyRequests({ page, pageSize, status });
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
      { key: REQUEST_STATUS.ASSIGNED, label: 'Ανατεθειμένα' },
      { key: REQUEST_STATUS.IN_PROGRESS, label: 'Σε εξέλιξη' },
      { key: REQUEST_STATUS.COMPLETED, label: 'Ολοκληρωμένα' },
      { key: REQUEST_STATUS.CANCELED, label: 'Ακυρωμένα' },
    ]
  ), []);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Τα αιτήματά μου</h1>
        <Link to="/app/requests/new">
          <Button>Νέο αίτημα</Button>
        </Link>
      </header>

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

      {isLoading ? (
        <div className="p-4 rounded-xl border bg-white">Φόρτωση…</div>
      ) : error ? (
        <div className="p-4 rounded-xl border bg-white text-red-600">{error?.message || 'Σφάλμα φόρτωσης'}</div>
      ) : requests.length === 0 ? (
        <div className="p-6 rounded-xl border bg-white space-y-3">
          {status === "all" ? (
            <>
              <p className="text-slate-700">Δεν έχεις καταχωρήσει ακόμη αιτήματα.</p>
              <div>
                <Link to="/app/requests/new">
                  <Button>Δημιουργία αιτήματος</Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-slate-700">
              Δεν υπάρχουν αιτήματα με κατάσταση «{REQUEST_STATUS_LABEL[status] ?? status}».
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ημ/νία</th>
                <th className="px-4 py-3 text-left font-medium">Υπηρεσία</th>
                <th className="px-4 py-3 text-left font-medium w-30">Κατάσταση</th>
                <th className="px-4 py-3 text-left font-medium">Περιγραφή</th>
                <th className="px-4 py-3 text-left font-medium">Ανάθεση</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((r) => {
                const assignedName = [r.assigned_employee_first_name, r.assigned_employee_last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim();

                return (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">{formatService(r.service_type)}</td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-700">
                      <span title={r.description}>{(r.description ?? "").slice(0, 120)}{(r.description?.length ?? 0) > 120 ? "…" : ""}</span>
                    </td>
                    <td className="px-4 py-3">{assignedName || r.assigned_employee_email || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isFetching && <div className="px-4 py-2 text-xs text-slate-500">Ανανέωση…</div>}
        </div>
      )}

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
