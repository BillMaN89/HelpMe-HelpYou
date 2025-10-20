import RequestsTable from "./RequestsTable";
import { useDeleteRequest, useUnassignedRequests } from "../../hooks/UseUserRequests";
import { useAuth } from "../../components/auth/AuthContext";
import Button from "../../components/Button";
import { Trash2 } from "lucide-react";

export default function UnassignedRequestsPage() {
  const { data, isLoading, isFetching, error } = useUnassignedRequests();
  const requests = data ?? [];
  const { hasRole } = useAuth();
  const isAdmin = hasRole?.('admin');
  const deleteReq = useDeleteRequest();

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
    </section>
  );
}
