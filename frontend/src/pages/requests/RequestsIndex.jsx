import { useAuth } from "../../components/auth/AuthContext";
import MyRequestsPage from "./MyRequestsPage";
import AllRequestsPage from "./AllRequestsPage";

// Chooses which requests page to render based on permissions/role.
export default function RequestsIndex() {
  const { can } = useAuth();

  // If user can see all requests, show staff/admin view; otherwise show personal requests
  if (can("view_requests")) {
    return <AllRequestsPage />;
  }
  return <MyRequestsPage />;
}

