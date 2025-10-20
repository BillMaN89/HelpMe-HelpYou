import { useEffect, useState } from "react";
import { useAllRequests } from "../../hooks/UseUserRequests";
import RequestsTable from "./RequestsTable";
import Button from "../../components/Button";

const DEFAULT_PAGE_SIZE = 12;

export default function AllRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isFetching, error } = useAllRequests({ page, pageSize });
  const requests = Array.isArray(data?.requests) ? data.requests : [];
  const meta = data?.meta ?? {};
  const total = meta.total ?? requests.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!isLoading && !isFetching && page > 1 && requests.length === 0 && total > 0) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isLoading, isFetching, page, requests.length, total]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Όλα τα αιτήματα</h1>

      <RequestsTable
        title="Λίστα αιτημάτων"
        requests={requests}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        emptyMessage="Δεν υπάρχουν αιτήματα."
        linkState={{ from: "/app/requests" }}
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
