import { Link } from "react-router-dom";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import StatusPill from "../../shared/components/StatusPill";
import { formatDate } from "../../shared/utils/dates";

export default function RequestList({ title, items = [], linkToAll, loading, emptyMessage = "Δεν υπάρχουν εγγραφές." }) {
  const rows = Array.isArray(items) ? items.slice(0, 5) : [];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {linkToAll && (
          <Link to={linkToAll} className="text-sm text-indigo-600 hover:underline">
            Προβολή όλων
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-4 py-3 text-sm text-slate-400">Φόρτωση…</div>
      ) : rows.length === 0 ? (
        <div className="mt-4 py-6 text-sm text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="mt-3 divide-y">
          {rows.map((r) => (
            <div key={r.request_id ?? JSON.stringify(r)} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">#{r.request_id}</span>
                  <span className="text-slate-700">{getServiceTypeLabel(r.service_type)}</span>
                  <StatusPill status={r.status} />
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">{formatDate(r.updated_at ?? r.created_at, { fallback: '-' })}</div>
              </div>
              {r.description && (
                <div className="mt-1 text-sm text-slate-700 truncate" title={r.description}>
                  {r.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
