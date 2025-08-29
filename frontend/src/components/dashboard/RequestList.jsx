import { Link } from "react-router-dom";

function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("el-GR");
}

export default function RequestList({ title, items = [], linkToAll, loading, emptyMessage = "Δεν υπάρχουν εγγραφές." }) {
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

      <div className="mt-4 divide-y">
        {loading ? (
          <div className="py-3 text-sm text-slate-400">Φόρτωση…</div>
        ) : items.length ? (
          items.slice(0, 5).map((r) => (
            <div key={r.request_id ?? JSON.stringify(r)} className="py-3 text-sm text-slate-700">
              #{r.request_id} • {r.service_type} • {r.status} • {fmtDate(r.updated_at ?? r.created_at)}
            </div>
          ))
        ) : (
          <div className="py-6 text-sm text-slate-500">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
