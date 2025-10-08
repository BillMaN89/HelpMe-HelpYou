import { useAllRequests } from "../../hooks/UseUserRequests";
import { Link } from "react-router-dom";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import StatusPill from "../../shared/components/StatusPill";
import { formatDate } from "../../shared/utils/dates";

export default function AllRequestsPage() {
  const { data, isLoading, isFetching, error } = useAllRequests();
  const requests = data ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Όλα τα αιτήματα</h1>

      <div className="p-0 overflow-hidden rounded-xl border bg-white">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <span className="font-medium text-slate-700">Λίστα αιτημάτων</span>
          {isFetching && (
            <span className="text-xs text-slate-500">Ανανέωση…</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-600">Φόρτωση…</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error?.message || 'Σφάλμα φόρτωσης'}</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-slate-700">Δεν υπάρχουν αιτήματα.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">#</th>
                  <th className="px-4 py-3 text-left font-medium w-[13rem]">Ημ/νία</th>
                  <th className="px-4 py-3 text-left font-medium w-[14rem]">Υπηρεσία</th>
                  <th className="px-4 py-3 text-left font-medium w-[12rem]">Κατάσταση</th>
                  <th className="px-4 py-3 text-left font-medium w-[50%]">Περιγραφή</th>
                  <th className="px-4 py-3 text-left font-medium w-[8rem]">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((r) => (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 whitespace-nowrap">{r.request_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updated_at ?? r.created_at)}</td>
                    <td className="px-4 py-3">{getServiceTypeLabel(r.service_type)}</td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-700 align-top whitespace-pre-wrap break-words w-[50%]">
                      {r.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/app/requests/${r.request_id}`}
                        className="text-indigo-700 hover:underline text-sm"
                        title="Προβολή αιτήματος"
                      >
                        Προβολή
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
