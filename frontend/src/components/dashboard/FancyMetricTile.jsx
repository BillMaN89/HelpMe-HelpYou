import { motion } from "framer-motion";

export default function FancyMetricTile({
  title,
  value = 0,
  subtext,
  Icon,              // από lucide-react (προαιρετικό)
  tone = "default",  // "default" | "primary" | "caution" | "success"
}) {
  const toneClasses = {
    default: "bg-white border-slate-200 hover:shadow-lg",
    primary: "bg-gradient-to-br from-sky-50 to-white border-sky-100 hover:shadow-sky-200/60",
    caution: "bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-amber-200/60",
    success: "bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-emerald-200/60",
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div className={`rounded-2xl p-5 border ${toneClasses[tone]} transition`}>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-xl p-2 bg-slate-900/5">
              <Icon className="w-6 h-6" aria-hidden />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="text-3xl font-semibold mt-1 tabular-nums">{value}</div>
            {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
