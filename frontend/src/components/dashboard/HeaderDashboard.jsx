import { useAuth } from "../auth/AuthContext";

export default function DashboardHeader({
  title,              
  subtitle,           
  right = null,       // optional right slot (filters / date)
}) {
  const { user } = useAuth();
  const hello =
    title ??
    `Καλωσήρθες${user?.first_name ? `, ${user.first_name}` : ""} 👋`;

  return (
    <section className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{hello}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
      <div className="hidden sm:block text-sm text-slate-500">
        {right}
      </div>
    </section>
  );
}