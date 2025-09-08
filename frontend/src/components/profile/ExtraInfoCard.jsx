import { useEffect, useMemo, useState } from "react";

export default function ExtraInfoCard({ data = {}, userType, editable = [], onSubmit }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(() => ({ ...data }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setForm({ ...data }); }, [data]);

  const fields = useMemo(() => {
    if (userType === "patient") {
      return [
        { key: "disease_type",        label: "Τύπος νόσου" },
        { key: "handicap",            label: "Αναπηρία" },
        { key: "emergency_contact",   label: "Επαφή έκτακτης ανάγκης" },
      ];
    }
    if (userType === "volunteer") {
      return [
        { key: "occupation",  label: "Επάγγελμα" },
        { key: "has_vehicle", label: "Διαθέτει όχημα", type: "boolean" },
        // help_types: μόνο εμφάνιση, TODO: προσθήκη/αφαίρεση κατηγοριών βοήθειας
      ];
    }
    if (userType === "employee") {
      return [
        { key: "department",     label: "Τμήμα",        readOnly: true },
        { key: "employee_type",  label: "Είδος απασχόλησης", readOnly: true },
        { key: "has_vehicle",    label: "Διαθέτει όχημα", type: "boolean" },
      ];
    }
    return [];
  }, [userType]);

  const changes = useMemo(() => {
    const out = {};
    for (const f of fields) {
      const k = f.key;
      if (!editable.includes(k)) continue;
      const a = valStr(data?.[k]);
      const b = valStr(form?.[k]);
      if (a !== b) out[k] = f.type === "boolean" ? !!form[k] : form[k];
    }
    return out;
  }, [data, form, editable, fields]);
  const isDirty = Object.keys(changes).length > 0;

  async function handleSubmit() {
    if (!isDirty) return;
    setSubmitting(true);
    try {
      await onSubmit(changes); 
      setEdit(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="rounded-2xl border shadow-sm"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
    >
      <div className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "var(--brand-600)" }} />

      <div className="mb-3 flex items-start justify-between px-0.5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Επιπλέον</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Πεδία βάσει ρόλου
          </p>
        </div>

        {editable.length > 0 && (
          <div className="flex items-center gap-2">
            {!edit ? (
              <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50" onClick={() => setEdit(true)}>
                Επεξεργασία
              </button>
            ) : (
              <>
                <button
                  className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={!isDirty || submitting}
                >
                  Αποθήκευση
                </button>
                <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50" onClick={() => setForm({ ...data })} type="button">
                  Reset
                </button>
                <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50" onClick={() => { setEdit(false); setForm({ ...data }); }} type="button">
                  Άκυρο
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* View / Edit */}
      {!edit ? (
        <div className="divide-y">
          {fields.map(f => (
            <div key={f.key} className="py-2 flex items-start justify-between">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{f.label}</span>
              <span className="text-sm font-medium">
                {formatValue(data?.[f.key], f.type)}
              </span>
            </div>
          ))}

          {/* Volunteer help_types εμφάνιση μόνο */}
          {userType === "volunteer" && Array.isArray(data?.help_types) && (
            <div className="py-2">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Κατηγορίες βοήθειας</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {data.help_types.length === 0 ? (
                  <span className="text-sm font-medium">—</span>
                ) : (
                  data.help_types.map(h => (
                    <span key={h.help_type_id} className="rounded-full border px-2 py-0.5 text-xs">
                      {h.help_category}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {fields.map(f => {
            const readOnly = f.readOnly || !editable.includes(f.key);
            return (
              <label key={f.key} className="block opacity-100">
                <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>{f.label}</span>
                {f.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    disabled={readOnly}
                    onChange={e => setForm(v => ({ ...v, [f.key]: e.target.checked }))}
                  />
                ) : (
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    style={{ borderColor: "var(--border)" }}
                    value={form[f.key] ?? ""}
                    disabled={readOnly}
                    onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            );
          })}
          {!isDirty && <p className="text-xs text-slate-400">Δεν υπάρχουν αλλαγές για αποθήκευση.</p>}
        </div>
      )}
    </section>
  );
}

const valStr = v => (v == null ? "" : String(v));
function formatValue(v, type) {
  if (type === "boolean") return v ? "Ναι" : "Όχι";
  return v == null || String(v).trim() === "" ? "—" : v;
}
