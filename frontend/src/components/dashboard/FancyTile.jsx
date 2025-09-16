import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FancyTile({
  to,
  title,
  desc,
  Icon,          // lucide-react
  badge,         // number / small label: TODO
  tone = "default", // "default" | "primary" | "caution"
}) {
  const toneClasses = {
    default:
      "bg-white border-slate-200 hover:shadow-lg",
    primary:
      "bg-gradient-to-br from-sky-50 to-white border-sky-100 hover:shadow-sky-200/60",
    caution:
      "bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-amber-200/60",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        to={to}
        className={`group relative block rounded-2xl p-5 border ${toneClasses[tone]} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
        aria-label={title}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl p-2 bg-slate-900/5 group-hover:bg-slate-900/10 transition">
            {Icon ? <Icon className="w-6 h-6" aria-hidden /> : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold truncate">{title}</h3>
              {badge != null && (
                <span className="inline-flex items-center justify-center rounded-full bg-slate-900/5 px-2 h-6 text-xs font-medium">
                  {badge}
                </span>
              )}
            </div>
            {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
          </div>
        </div>

        {/* small affordance top right */}
        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition text-xs text-slate-400">
          Είσοδος ↵
        </div>
      </Link>
    </motion.div>
  );
}
