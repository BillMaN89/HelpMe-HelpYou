import { useEffect, useMemo, useState } from "react";
import FieldRow from "./FieldRow";

export default function UserInfoCard({ data, editable = [], onSubmit }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(() => normalize(data));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setForm(normalize(data)); }, [data]);

  const canEdit = editable.length > 0;

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const changes = useMemo(() => {
    const out = {};
    for (const k of editable) {
      const a = valStr(data?.[k]);
      const b = valStr(form?.[k]);
      if (a !== b) out[k] = form[k];
    }
    delete out.email; // safety
    return out;
  }, [data, form, editable]);

  const isDirty = Object.keys(changes).length > 0;

  const errors = useMemo(() => {
    const e = {};
    if (edit) {
      if (changes.dob != null && !/^\d{4}-\d{2}-\d{2}$/.test(String(form.dob))) {
        e.dob = "YYYY-MM-DD";
      } else if (form.dob) {
        const d = new Date(form.dob);
        const today = new Date(); today.setHours(0,0,0,0);
        if (d < new Date("1900-01-01") || d > today) e.dob = "Μη έγκυρη ημερομηνία";
      }
      const telRe = /^\+?\d{8,15}$/;
      if (changes.phone_no != null && form.phone_no && !telRe.test(form.phone_no)) e.phone_no = "8–15 ψηφία";
      if (changes.mobile   != null && form.mobile   && !telRe.test(form.mobile))   e.mobile   = "8–15 ψηφία";
      if (changes.first_name != null && !form.first_name?.trim()) e.first_name = "Υποχρεωτικό";
      if (changes.last_name  != null && !form.last_name?.trim())  e.last_name  = "Υποχρεωτικό";
    }
    return e;
  }, [edit, form, changes]);

  async function handleSubmit() {
    if (!isDirty || Object.keys(errors).length) return;
    setSubmitting(true);
    try {
      await onSubmit(changes);
      setEdit(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() { setForm(normalize(data)); }

  return (
    <section
      id="profile-users"
      aria-labelledby="profile-users-title"
      className="rounded-2xl border shadow-sm"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
    >
      <div className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "var(--brand-600)" }} />
      <div className="mb-3 flex items-start justify-between px-0.5">
        <div>
          <h2 id="profile-users-title" className="text-lg font-semibold tracking-tight">Βασικά στοιχεία</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Προσωπικά στοιχεία χρήστη</p>
        </div>
        {canEdit && (
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
                  disabled={!isDirty || submitting || Object.keys(errors).length > 0}
                >
                  Αποθήκευση
                </button>
                <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50" onClick={handleReset} type="button">
                  Reset
                </button>
                <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50" onClick={() => { setEdit(false); setForm(normalize(data)); }} type="button">
                  Άκυρο
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {!edit ? (
        <div className="divide-y">
          <FieldRow label="Όνομα"          value={dash(data.first_name)} />
          <FieldRow label="Επώνυμο"        value={dash(data.last_name)} />
          <FieldRow label="Email"          value={dash(data.email)} />
          <FieldRow label="Ημ/νία γέννησης" value={dash(data.dob)} />
          <FieldRow label="Σταθερό"        value={dash(data.phone_no)} />
          <FieldRow label="Κινητό"         value={dash(data.mobile)} />
          <FieldRow label="Επάγγελμα"      value={dash(data.occupation)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 pt-1">
          <InputRow name="first_name" label="Όνομα" value={form.first_name} onChange={onChange} error={errors.first_name} />
          <InputRow name="last_name"  label="Επώνυμο" value={form.last_name} onChange={onChange} error={errors.last_name} />
          <ReadOnlyRow label="Email" value={data.email} />
          <InputRow name="dob" label="Ημ/νία γέννησης" type="date" value={form.dob || ""} onChange={onChange} error={errors.dob} />
          <InputRow name="phone_no" label="Σταθερό" value={form.phone_no || ""} onChange={onChange} error={errors.phone_no} inputMode="tel" />
          <InputRow name="mobile"   label="Κινητό"  value={form.mobile   || ""} onChange={onChange} error={errors.mobile}   inputMode="tel" />
          <InputRow name="occupation" label="Επάγγελμα" value={form.occupation || ""} onChange={onChange} />
          {!isDirty && <p className="text-xs text-slate-400">Δεν υπάρχουν αλλαγές για αποθήκευση.</p>}
        </div>
      )}
    </section>
  );
}

/* helpers */
function normalize(d = {}) {
  return {
    first_name: d.first_name ?? "",
    last_name:  d.last_name ?? "",
    email:      d.email ?? "",
    dob:        d.dob ?? "",
    phone_no:   d.phone_no ?? "",
    mobile:     d.mobile ?? "",
    occupation: d.occupation ?? "",
  };
}
const dash = (v) => (v == null || String(v).trim() === "" ? "—" : v);
const valStr = (v) => (v == null ? "" : String(v));

function InputRow({ label, error, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <input className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
             style={{ borderColor: "var(--border)" }} {...rest} />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
function ReadOnlyRow({ label, value }) {
  return (
    <div>
      <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}>
        {value}
      </div>
    </div>
  );
}
