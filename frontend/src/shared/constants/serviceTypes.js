// Centralized service type constants and display helpers
export const SERVICE_TYPES = {
  SOCIAL: 'social',
  PSYCHOLOGICAL: 'psychological',
};

export const SERVICE_TYPE_LABEL = {
  social: 'Κοινωνική Υπηρεσία',
  psychological: 'Ψυχολογική Υπηρεσία',
};

export function getServiceTypeLabel(type) {
  return SERVICE_TYPE_LABEL[type] ?? type ?? '-';
}

