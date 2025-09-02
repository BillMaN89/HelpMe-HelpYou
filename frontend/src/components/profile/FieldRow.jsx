export default function FieldRow({ label, value }) {
  const empty = value === "—" || value === "" || value == null;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>

        {!empty && (
          <span className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>
            {value}
          </span>
        )}
      </div>

      {empty && (
        <div
          className="mt-1 h-2 rounded"
          style={{
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "6px 1px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "left center",          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
