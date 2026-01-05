import { useEffect, useState } from "react";
import RequestsTable from "./RequestsTable";
import { useDeleteRequest, useUnassignedRequests } from "../../hooks/UseUserRequests";
import { useAuth } from "../../components/auth/AuthContext";
import Button from "../../components/Button";
import { Trash2 } from "lucide-react";

export default function UnassignedRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const { data, isLoading, isFetching, error } = useUnassignedRequests({ page, pageSize });
  const requests = Array.isArray(data?.requests) ? data.requests : [];
  const meta = data?.meta ?? {};
  const total = meta.total ?? requests.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const { hasRole } = useAuth();
  const isAdmin = hasRole?.('admin');
  const deleteReq = useDeleteRequest();

  useEffect(() => {
    if (!isLoading && !isFetching && page > 1 && requests.length === 0 && total > 0) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isLoading, isFetching, page, requests.length, total]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Αναθέσεις</h1>
      <h3>Προβολή Ανοιχτών Αιτημάτων</h3>

      <RequestsTable
        title="Αιτήματα προς ανάθεση"
        requests={requests}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        emptyMessage="Δεν υπάρχουν μη ανατεθειμένα αιτήματα."
        showRequester
        startIndex={(page - 1) * pageSize}
        linkState={{ from: "/app/requests/unassigned" }}
        renderActions={
          isAdmin
            ? (req) => {
                const isDeleting =
                  deleteReq.isPending &&
                  deleteReq.variables?.id === req.request_id;

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
