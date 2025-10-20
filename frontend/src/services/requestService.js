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

export async function fetchUnassignedRequests() {
    const { data } = await http.get(API.REQUESTS.UNASSIGNED);
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

export async function updateRequestStatus(id, { status }) {
    if (!id || !status) {
        throw new Error("Λείπουν πεδία (id ή status)");
    }
    const { data } = await http.patch(API.REQUESTS.STATUS(id), { status });
    // data = { message, request }
    return data.request;
}

export async function deleteRequest(id) {
    if (!id) throw new Error("Λείπει το id");
    const { data } = await http.delete(API.REQUESTS.BY_ID(id));
    // data = { message }
    return data?.message ?? 'Το αίτημα διαγράφηκε';
}

export async function fetchRequestById(id) {
    if (!id) throw new Error('Λείπει το id');
    const { data } = await http.get(API.REQUESTS.BY_ID(id));
    // data = { request }
    return data.request;
}
