import { useEffect, useMemo, useState } from "react";
import { useAllRequests, useDeleteRequest } from "../../hooks/UseUserRequests";
import RequestsTable from "./RequestsTable";
import Button from "../../components/Button";
import { REQUEST_STATUS, REQUEST_STATUS_LABEL } from "../../shared/constants/requestStatus";
import { useAuth } from "../../components/auth/AuthContext";
import { Trash2 } from "lucide-react";

const DEFAULT_PAGE_SIZE = 8;

export default function AllRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState("all");
  const { hasRole } = useAuth();
  const isAdmin = hasRole?.('admin');
  const deleteReq = useDeleteRequest();
  const { data, isLoading, isFetching, error } = useAllRequests({ page, pageSize, status });
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
      <h1 className="text-2xl font-semibold">Όλα τα αιτήματα</h1>

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

      <RequestsTable
        title="Λίστα αιτημάτων"
        requests={requests}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        emptyMessage={
          status === 'all'
            ? "Δεν υπάρχουν αιτήματα."
            : `Δεν υπάρχουν αιτήματα με κατάσταση «${REQUEST_STATUS_LABEL[status] ?? status}».`
        }
        startIndex={(page - 1) * pageSize}
        linkState={{ from: "/app/requests" }}
        renderActions={
          isAdmin && status === 'all'
            ? (req) => {
                const isDeleting = deleteReq.isPending && deleteReq.variables?.id === req.request_id;
                return (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isDeleting}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Διαγραφή αιτήματος #${req.request_id}; Η ενέργεια δεν μπορεί να αναιρεθεί.`
                        )
                      ) {
                        deleteReq.mutate({ id: req.request_id });
                      }
                    }}
                    loading={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Διαγραφή</span>
                  </Button>
                );
              }
            : undefined
        }
      />

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
