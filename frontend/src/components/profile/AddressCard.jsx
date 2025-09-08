import { useEffect, useMemo, useState } from "react";
import FieldRow from "./FieldRow";

const REQUIRED_FOR_CREATE = ["address", "address_no", "postal_code", "city"];

export default function AddressCard({ data, editable = [], onSubmit }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(() => normalize(data));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(normalize(data));
  }, [data]);

  const canEdit = editable.length > 0;

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const isCreateMode = useMemo(() => {
    const f = form || {};
    return (
      (data == null) ||
      (isEmptyValue(data.address) &&
        isEmptyValue(data.address_no) &&
        isEmptyValue(data.postal_code) &&
        isEmptyValue(data.city))
    ) && (
      isEmptyValue(f.address) &&
      isEmptyValue(f.address_no) &&
      isEmptyValue(f.postal_code) &&
      isEmptyValue(f.city)
    ) === false; 
  }, [data, form]);

  // Diff μόνο για editable fields
  const changes = useMemo(() => {
    const out = {};
    for (const k of editable) {
      const prevVal = valueToString(data?.[k]);
      const nextVal = valueToString(form?.[k]);
      if (prevVal !== nextVal) out[k] = form[k];
    }
    return out;
  }, [data, form, editable]);

  const isDirty = Object.keys(changes).length > 0;

  const errors = useMemo(() => {
    const e = {};
    if (edit) {
      if (!isEmptyValue(form.postal_code)) {
        if (!/^\d{5}$/.test(String(form.postal_code))) {
          e.postal_code = "Το Τ.Κ. πρέπει να είναι 5 ψηφία";
        }
      }
      if (isCreateMode) {
        for (const key of REQUIRED_FOR_CREATE) {
          if (isEmptyValue(form[key])) e[key] = "Απαραίτητο πεδίο";
        }
      }
    }
    return e;
  }, [edit, form, isCreateMode]);

  async function handleSubmit() {
    if (!isDirty) return;
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload =
        isCreateMode
          ? pickAll(form, REQUIRED_FOR_CREATE)
          : changes;

      await onSubmit(payload); 
      setEdit(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(normalize(data));
  }

  return (
    <section
      id="profile-address"
      aria-labelledby="profile-address-title"
      className="rounded-2xl border shadow-sm"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
      data-section="address"
      data-testid="profile-address-card"
    >
      <div className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "var(--brand-600)" }} />

      <div className="mb-3 flex items-start justify-between px-0.5">
        <div>
          <h2 id="profile-address-title" className="text-lg font-semibold tracking-tight">
            Διεύθυνση
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Στοιχεία κατοικίας
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {!edit ? (
              <button
                className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50"
                onClick={() => setEdit(true)}
              >
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
                <button
                  className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50"
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50"
                  onClick={() => { setEdit(false); setForm(normalize(data)); }}
                  type="button"
                >
                  Άκυρο
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Περιεχόμενο */}
      {!edit ? (
        <div className="divide-y">
          <FieldRow label="Οδός"     value={showOrDash(data?.address)} />
          <FieldRow label="Αριθμός"  value={showOrDash(data?.address_no)} />
          <FieldRow label="Τ.Κ."     value={showOrDash(data?.postal_code)} />
          <FieldRow label="Πόλη"     value={showOrDash(data?.city)} />
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <InputRow
            name="address"
            label="Οδός"
            value={form.address}
            onChange={onChange}
            error={errors.address}
            required={isCreateMode}
          />
          <InputRow
            name="address_no"
            label="Αριθμός"
            value={form.address_no}
            onChange={onChange}
            error={errors.address_no}
            required={isCreateMode}
          />
          <InputRow
            name="postal_code"
            label="Τ.Κ."
            value={form.postal_code}
            onChange={onChange}
            error={errors.postal_code}
            inputMode="numeric"
            pattern="\d*"
            required={isCreateMode}
          />
          <InputRow
            name="city"
            label="Πόλη"
            value={form.city}
            onChange={onChange}
            error={errors.city}
            required={isCreateMode}
          />

          {!isDirty && (
            <p className="text-xs text-slate-400">Δεν υπάρχουν αλλαγές για αποθήκευση.</p>
          )}
        </div>
      )}
    </section>
  );
}

/* ----------------- Helpers ----------------- */

function normalize(d = {}) {
  return {
    address: d.address ?? "",
    address_no: d.address_no ?? "",
    postal_code: d.postal_code ?? "",
    city: d.city ?? "",
  };
}

function isEmptyValue(v) {
  return v == null || String(v).trim() === "";
}

function valueToString(v) {
  return v == null ? "" : String(v);
}

function showOrDash(v) {
  return isEmptyValue(v) ? "—" : v;
}

function pickAll(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

/** InputRow: edit helper */
function InputRow({ label, error, required, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>
        {label}{required ? " *" : ""}
      </span>
      <input
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        style={{ borderColor: "var(--border)" }}
        {...rest}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
