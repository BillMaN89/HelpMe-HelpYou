import FieldRow from './FieldRow';

export default function UserInfoCard() {
  return (
    <section
      id="profile-users"
      aria-labelledby="profile-users-title"
      className="rounded-2xl border shadow-sm" 
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
      data-section="users"
      data-testid="profile-users-card"
    >
     <div className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "var(--brand-600)" }} />
     
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 id="profile-users-title" className="text-lg font-semibold tracking-tight">
            Βασικά στοιχεία
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Προσωπικά στοιχεία χρήστη</p>
        </div>

        {/* actions slot (edit/reset/submit later) */}
        <div id="profile-users-actions" className="flex items-center gap-2" data-slot="section-actions" />
      </div>

      <div className="divide-y">
        <FieldRow label="Όνομα" value="—" />
        <FieldRow label="Επώνυμο" value="—" />
        <FieldRow label="Email" value="—" />
        <FieldRow label="Ημ/νία γέννησης" value="—" />
        <FieldRow label="Σταθερό" value="—" />
        <FieldRow label="Κινητό" value="—" />
        <FieldRow label="Επάγγελμα" value="—" />
      </div>
    </section>
  );
}
