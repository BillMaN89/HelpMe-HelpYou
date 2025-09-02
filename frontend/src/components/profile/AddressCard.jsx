import FieldRow from "./FieldRow";

export default function AddressCard() {
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

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 id="profile-address-title" className="text-lg font-semibold tracking-tight">
            Διεύθυνση
          </h2>
          <p className="text-sm text-zinc-500">Στοιχεία κατοικίας</p>
        </div>

        {/* actions slot */}
        <div id="profile-address-actions" className="flex items-center gap-2" data-slot="section-actions" />
      </div>

      <div className="divide-y">
        <FieldRow label="Οδός" value="—" />
        <FieldRow label="Αριθμός" value="—" />
        <FieldRow label="Τ.Κ." value="—" />
        <FieldRow label="Πόλη" value="—" />
      </div>
    </section>
  );
}
