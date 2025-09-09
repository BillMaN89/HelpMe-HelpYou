// Centralized request status constants and display helpers
export const REQUEST_STATUS = {
  UNASSIGNED: 'unassigned',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'canceled',
};

export const REQUEST_STATUS_LABEL = {
  unassigned: 'Ανοιχτό',
  assigned: 'Ανατεθειμένο',
  in_progress: 'Σε εξέλιξη',
  completed: 'Ολοκληρωμένο',
  cancelled: 'Ακυρωμένο',
  canceled: 'Ακυρωμένο',
};

export function getStatusLabel(status) {
  return REQUEST_STATUS_LABEL[status] ?? status ?? '-';
}
