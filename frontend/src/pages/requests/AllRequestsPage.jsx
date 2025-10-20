import { useAllRequests } from "../../hooks/UseUserRequests";
import RequestsTable from "./RequestsTable";

export default function AllRequestsPage() {
  const { data, isLoading, isFetching, error } = useAllRequests();
  const requests = data ?? [];

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
    </section>
  );
}
