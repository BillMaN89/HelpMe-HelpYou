import UserInfoCard from "../components/profile/UserInfoCard";
import AddressCard from "../components/profile/AddressCard";
import ExtraInfoCard from "../components/profile/ExtraInfoCard";

export default function ProfilePage() {
  return (
    // όχι min-h-dvh, όχι δεύτερο header
    <section id="profile-main" role="main" className="py-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb (προαιρετικό) */}
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:underline">Αρχική</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">Προφίλ</li>
          </ol>
        </nav>

        <div className="mt-2 flex items-center justify-between">
          <h1
            id="profile-title"
            className="text-2xl font-semibold tracking-tight relative inline-block"
          >
            Το Προφίλ μου
          </h1>

          {/* header actions slot */}
          <div id="profile-header-actions" className="flex items-center gap-2" data-slot="header-actions" />
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <UserInfoCard />
          <AddressCard />
          <ExtraInfoCard />
        </div>
      </div>
    </section>
  );
}
