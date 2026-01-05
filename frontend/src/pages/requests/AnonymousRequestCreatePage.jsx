import { useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { useCreateAnonymousRequest } from '../../hooks/useAnonymousRequests';
import { useAuth } from '../../components/auth/AuthContext';
import Button from '../../components/Button';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';

const schema = Yup.object({
  full_name: Yup.string().trim().required('Το ονοματεπώνυμο είναι υποχρεωτικό'),
  email: Yup.string().email('Μη έγκυρο email').nullable(),
  mobile: Yup.string().trim().required('Το κινητό είναι υποχρεωτικό'),
  service_type: Yup.string().required('Επιλέξτε υπηρεσία'),
  description: Yup.string().trim().min(10, 'Περιγράψτε λίγο πιο αναλυτικά (>=10 χαρακτήρες)').required('Η περιγραφή είναι υποχρεωτική'),
  assigned_employee_email: Yup.string().nullable(),
});

const SERVICE_OPTIONS = [
  { value: '', label: '— Επιλογή υπηρεσίας —' },
  { value: 'social', label: 'Κοινωνική Υπηρεσία' },
  { value: 'psychological', label: 'Ψυχολογική Υπηρεσία' },
];

// Map service type to required role
const SERVICE_ROLE_MAP = {
  social: 'social_worker',
  psychological: 'therapist',
};

// Hook to fetch users with roles
function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users', 'withRoles'],
    queryFn: async () => {
      const { data } = await http.get(API.USERS.LIST, { params: { pageSize: 100 } });
      return data.users || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function AnonymousRequestCreatePage() {
  const { mutate: createRequest, isPending } = useCreateAnonymousRequest();
  const { data: users = [], isLoading: usersLoading } = useUsersWithRoles();
  const { user } = useAuth();

  return (
    <div className="max-w-xl w-full mx-auto p-4 rounded-2xl shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Νέο Ανώνυμο Αίτημα</h1>
      <p className="text-sm text-slate-600 mb-4">
        Δημιουργήστε αίτημα για κάποιον που δεν είναι εγγεγραμμένος στο σύστημα.
      </p>

      <Formik
        initialValues={{
          full_name: '',
          email: '',
          mobile: '',
          service_type: '',
          description: '',
          assigned_employee_email: '',
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          createRequest({
            ...values,
            email: values.email || null,
            assigned_employee_email: values.assigned_employee_email || null,
          });
        }}
      >
        {({ isValid, dirty, resetForm }) => (
          <Form className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block mb-1 required" aria-required="true">
                Ονοματεπώνυμο
              </label>
              <Field
                type="text"
                id="full_name"
                name="full_name"
                placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isPending}
              />
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="full_name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1">
                Email <span className="text-slate-500">(προαιρετικό)</span>
              </label>
              <Field
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isPending}
              />
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="email" />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block mb-1 required" aria-required="true">
                Κινητό
              </label>
              <Field
                type="text"
                id="mobile"
                name="mobile"
                placeholder="π.χ. 6912345678"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isPending}
              />
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="mobile" />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="service_type" className="block mb-1 required" aria-required="true">
                Υπηρεσία
              </label>
              <Field
                as="select"
                id="service_type"
                name="service_type"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isPending}
              >
                {SERVICE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Field>
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="service_type" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block mb-1 required" aria-required="true">
                Περιγραφή / Σκοπός κλήσης
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="5"
                placeholder="Περιγράψτε συνοπτικά τον λόγο επικοινωνίας..."
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isPending}
              />
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="description" />
              </div>
            </div>

            {/* Assignment */}
            <AssignmentDropdown
              users={users}
              currentUserEmail={user?.email}
              isLoading={usersLoading}
              isPending={isPending}
            />

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isPending || !dirty || !isValid}
                variant="primary"
              >
                {isPending ? 'Αποστολή...' : 'Καταχώρηση Αιτήματος'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => resetForm()}
                disabled={isPending}
              >
                Καθαρισμός φόρμας
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

// Component to handle assignment dropdown with service type filtering
function AssignmentDropdown({ users, currentUserEmail, isLoading, isPending }) {
  const { values, setFieldValue } = useFormikContext();
  const serviceType = values.service_type;

  // Filter employees based on selected service type
  const filteredEmployees = useMemo(() => {
    if (!serviceType || !users.length) return [];

    const requiredRole = SERVICE_ROLE_MAP[serviceType];
    if (!requiredRole) return [];

    // Filter users who have the required role and are employees
    return users.filter(u => {
      // Skip current user (will be shown separately)
      if (u.email === currentUserEmail) return false;
      // Check if user has the required role
      const roles = Array.isArray(u.roles) ? u.roles : [];
      return roles.includes(requiredRole);
    });
  }, [users, serviceType, currentUserEmail]);

  // Reset assignment when service type changes
  const handleServiceTypeAwareReset = () => {
    // If currently selected assignee is not in the new filtered list, reset it
    const currentAssignee = values.assigned_employee_email;
    if (currentAssignee && currentAssignee !== currentUserEmail) {
      const stillValid = filteredEmployees.some(e => e.email === currentAssignee);
      if (!stillValid) {
        setFieldValue('assigned_employee_email', '');
      }
    }
  };

  // Check validity when filtered list changes
  useMemo(() => {
    handleServiceTypeAwareReset();
  }, [filteredEmployees]);

  const isDisabled = isPending || isLoading || !serviceType;

  return (
    <div>
      <label htmlFor="assigned_employee_email" className="block mb-1">
        Ανάθεση <span className="text-slate-500">(προαιρετικό)</span>
      </label>
      <Field
        as="select"
        id="assigned_employee_email"
        name="assigned_employee_email"
        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
        disabled={isDisabled}
      >
        <option value="">— Χωρίς ανάθεση —</option>
        {currentUserEmail && (
          <option value={currentUserEmail}>Ανάθεση σε εμένα ({currentUserEmail})</option>
        )}
        {filteredEmployees.map(emp => (
          <option key={emp.email} value={emp.email}>
            {emp.last_name} {emp.first_name} — {emp.email}
          </option>
        ))}
      </Field>
      <div className="text-sm text-slate-500 mt-1">
        {!serviceType
          ? 'Επιλέξτε πρώτα υπηρεσία για να δείτε τους διαθέσιμους υπαλλήλους.'
          : 'Αν δεν επιλέξετε υπάλληλο, το αίτημα θα παραμείνει χωρίς ανάθεση.'}
      </div>
    </div>
  );
}
