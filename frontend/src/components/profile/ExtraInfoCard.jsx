export default function ExtraInfoCard() {
  return (
    <section
      id="profile-extra"
      aria-labelledby="profile-extra-title"
      className="rounded-2xl border shadow-sm" 
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
      data-section="extra"
      data-testid="profile-extra-card"
    >
    <div className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl" style={{ background: "var(--brand-600)" }} />

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 id="profile-extra-title" className="text-lg font-semibold tracking-tight">
            Επιπλέον
          </h2>
          <p className="text-sm text-zinc-500">Πεδία βάσει ρόλων & δικαιωμάτων</p>
        </div>

        {/* actions slot */}
        <div id="profile-extra-actions" className="flex items-center gap-2" data-slot="section-actions" />
      </div>

      <div className="text-sm text-zinc-500">
        Θα εμφανιστεί περιεχόμενο ανά permissions.
      </div>
    </section>
  );
}
