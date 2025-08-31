import { useAuth } from "../../components/auth/AuthContext";
import StaffDashboard from "./StaffDashboard";
import VolunteerDashboard from "./VolunteerDashboard";
import PatientDashboard from "./PatientDashboard";  

export default function DashboardPage() {
  const auth = useAuth();

  if (auth.can('view_requests')) {
    return <StaffDashboard />; 
  }

  if (auth.hasRole('volunteer')) {
    return <VolunteerDashboard />;
  }

  // default: patient
  return <PatientDashboard />;
}