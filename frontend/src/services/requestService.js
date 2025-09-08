import http from "../shared/lib/http";
import { API } from "../shared/constants/api";

export async function createRequest( {service_type, description}) {
    if (!service_type || !description) {
        throw new Error("Λείπουν υποχρεωτικά πεδία");
    }

    const { data } = await http.post(API.REQUESTS.CREATE, { service_type, description });
    // data = { message, request }
    return data.request;
};

export async function fetchMyRequests() {
    const { data } = await http.get(API.REQUESTS.MINE);
    // data = { requests: [] }
    return data.requests;
};

export async function fetchAllRequests() {
    const { data } = await http.get(API.REQUESTS.ALL);
    // data = { requests: [] }
    return data.requests;
};

export async function fetchAssignedToMe() {
    const { data } = await http.get(API.REQUESTS.ASSIGNED_TO_ME);
    // data = { requests: [] }
    return data.requests;
};

export async function assignRequest(id, {assigned_employee_email}) {
    if (!assigned_employee_email) {
        throw new Error("Λείπει το email του υπαλλήλου ή εθελοντή");
    }

    const { data } = await http.patch(API.REQUESTS.ASSIGN(id), { assigned_employee_email });
    // data = { message, request }
    return data.request;
}
