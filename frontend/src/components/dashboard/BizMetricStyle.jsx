import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function BizMetricTile({
  title,
  value = 0,
  delta,            // π.χ. +12, -3 (number)
  deltaLabel,       // π.χ. "vs. last week"
  positiveIsGood = true, // για να βάφουμε σωστά (π.χ. ανοιχτά αιτήματα: όσο λιγότερα τόσο καλύτερα)
}) {
  let dir = null;
  if (typeof delta === "number") dir = delta === 0 ? 0 : delta > 0 ? 1 : -1;

  const good = positiveIsGood ? dir >= 0 : dir <= 0; // πότε θεωρείται πράσινο
  const deltaColor =
    dir === 0 ? "text-slate-500"
    : good ? "text-emerald-600"
    : "text-rose-600";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>

      {(dir !== null) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 font-medium ${deltaColor}`}>
            {dir > 0 && <ArrowUpRight className="w-4 h-4" aria-hidden />}
            {dir < 0 && <ArrowDownRight className="w-4 h-4" aria-hidden />}
            {delta > 0 ? `+${delta}` : `${delta}`}
          </span>
          {deltaLabel && <span className="text-slate-500">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
