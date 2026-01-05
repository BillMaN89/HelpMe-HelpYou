import http from "../shared/lib/http";
import { API } from "../shared/constants/api";

export async function createAnonymousRequest({ full_name, email, mobile, service_type, description, assigned_employee_email }) {
  if (!full_name || !mobile || !service_type || !description) {
    throw new Error("Λείπουν υποχρεωτικά πεδία");
  }

  const { data } = await http.post(API.ANONYMOUS_REQUESTS.CREATE, {
    full_name,
    email: email || null,
    mobile,
    service_type,
    description,
    assigned_employee_email: assigned_employee_email || null,
  });
  return data.request;
}

export async function fetchAnonymousRequests({ page = 1, pageSize = 20, status = 'all' } = {}) {
  const params = { page, pageSize };
  if (status && status !== 'all') {
    params.status = status;
  }
  const { data } = await http.get(API.ANONYMOUS_REQUESTS.LIST, { params });
  return data;
}

export async function fetchAnonymousRequestById(id) {
  if (!id) throw new Error('Λείπει το id');
  const { data } = await http.get(API.ANONYMOUS_REQUESTS.BY_ID(id));
  return data.request;
}

export async function assignAnonymousRequest(id, { assigned_employee_email }) {
  if (!assigned_employee_email) {
    throw new Error("Λείπει το email του υπαλλήλου");
  }
  const { data } = await http.patch(API.ANONYMOUS_REQUESTS.ASSIGN(id), { assigned_employee_email });
  return data.request;
}

export async function updateAnonymousRequestStatus(id, { status }) {
  if (!id || !status) {
    throw new Error("Λείπουν πεδία (id ή status)");
  }
  const { data } = await http.patch(API.ANONYMOUS_REQUESTS.STATUS(id), { status });
  return data.request;
}

export async function updateAnonymousRequestNotes(id, { notes_from_employee }) {
  if (!id) throw new Error('Λείπει το id');
  const { data } = await http.patch(API.ANONYMOUS_REQUESTS.NOTES(id), { notes_from_employee });
  return data.request;
}

export async function deleteAnonymousRequest(id) {
  if (!id) throw new Error("Λείπει το id");
  const { data } = await http.delete(API.ANONYMOUS_REQUESTS.BY_ID(id));
  return data?.message ?? 'Το αίτημα διαγράφηκε';
}

export async function fetchEmployees() {
  const { data } = await http.get(API.USERS.EMPLOYEES);
  return data.employees;
}
