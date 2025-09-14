import { useEffect, useMemo, useState } from "react";
import http from "../shared/lib/http";
import { API } from "../shared/constants/api";
import { useAuth } from "../components/auth/AuthContext";
import { toast } from 'react-toastify';

import UserInfoCard from "../components/profile/UserInfoCard";
import AddressCard from "../components/profile/AddressCard";
import ExtraInfoCard from "../components/profile/ExtraInfoCard";

const EDITABLE_USERS   = ["first_name","last_name","dob","birth_place","phone_no","mobile","occupation"];
const EDITABLE_ADDRESS = ["address","address_no","postal_code","city"];

export default function ProfilePage() {
  const auth = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---- Fetch profile ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await http.get(API.USERS.ME); // shaped object
        const shaped = data?.user ?? data;
        if (!mounted) return;
        setProfile(shaped);
      } catch (e) {
        console.error("profile fetch error", e?.response?.status, e?.response?.data);
        setErr(e?.response?.data?.message || "Αποτυχία φόρτωσης προφίλ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ---- Editable per section (role-aware extra) ----
  const editable = useMemo(() => {
    if (!profile?.user_type) return { users: [], address: [], extra: [] };
    let extra = [];
    if (profile.user_type === "patient") {
      extra = ["disease_type", "handicap", "emergency_contact"];
    } else if (profile.user_type === "volunteer") {
      extra = ["occupation", "has_vehicle"];
    } else if (profile.user_type === "employee") {
      // Base employee fields editable by user; department/type admin-only, allow if user has manage_users
      extra = ["has_vehicle"];
      if (auth.can('manage_users')) {
        extra = ["department", "employee_type", ...extra];
      }
    }
    return { users: EDITABLE_USERS, address: EDITABLE_ADDRESS, extra };
  }, [profile?.user_type, auth]);

  // ---- Submit handlers ----
  async function updateUsers(fields) {
    const payload = { target_email: profile.email, user_fields: fields };
    const { data } = await http.patch(API.USERS.ME, payload);
    setProfile(data?.user ?? data);
    toast.success('Τα βασικά στοιχεία αποθηκεύτηκαν');
    return data;
  }

  async function updateAddress(fields) {
    // Προσοχή στο postal_code (backend ensureInteger): στείλ' το ως number αν γίνεται
    if (fields.postal_code != null) {
      const num = Number(String(fields.postal_code).trim());
      if (!Number.isNaN(num)) fields.postal_code = num;
    }
    const payload = { target_email: profile.email, address_fields: fields };
    const { data } = await http.patch(API.USERS.ME, payload);
    setProfile(data?.user ?? data);
    toast.success('Τα στοιχεία επικοινωνίας αποθηκεύτηκαν');
    return data;
  }

  async function updateExtra(fields) {
    const payload = { target_email: profile.email, details_fields: fields }; // backend patch per role table
    const { data } = await http.patch(API.USERS.ME, payload);
    setProfile(data?.user ?? data);
    toast.success('Οι επιπλέον πληροφορίες αποθηκεύτηκαν');
    return data;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-slate-500">
        Φόρτωση προφίλ…
      </div>
    );
  }
  if (err) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-rose-600">
        {err}
      </div>
    );
  }

  return (
    <section id="profile-main" role="main" className="py-6">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:underline">Αρχική</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">Προφίλ</li>
          </ol>
        </nav>

        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight relative inline-block">
            Το Προφίλ μου
          </h1>
          <div id="profile-header-actions" />
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <UserInfoCard
            data={{
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
              dob: profile.dob,
              phone_no: profile.phone_no,
              mobile: profile.mobile,
              occupation: profile.occupation,
            }}
            editable={editable.users}
            onSubmit={updateUsers}
          />

          <AddressCard
            data={profile.address ?? { address: "", address_no: "", postal_code: "", city: "" }}
            editable={editable.address}
            onSubmit={updateAddress}
          />

          <ExtraInfoCard
            data={profile.details || {}}
            userType={profile.user_type}
            editable={editable.extra}
            onSubmit={updateExtra}
          />
        </div>
      </div>
    </section>
  );
}
