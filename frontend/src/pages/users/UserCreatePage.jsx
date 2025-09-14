import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../components/auth/AuthContext';

const Schema = Yup.object({
  email: Yup.string().email('Δώστε έγκυρο email').required('Απαραίτητο πεδίο'),
  first_name: Yup.string().min(2, 'Τουλάχιστον 2 χαρακτήρες').max(50, 'Το πολύ 50 χαρακτήρες').required('Απαραίτητο πεδίο'),
  last_name: Yup.string().min(2, 'Τουλάχιστον 2 χαρακτήρες').max(50, 'Το πολύ 50 χαρακτήρες').required('Απαραίτητο πεδίο'),
  password: Yup.string().min(8, 'Τουλάχιστον 8 χαρακτήρες').required('Απαραίτητο πεδίο'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Οι κωδικοί δεν ταιριάζουν').required('Απαραίτητο πεδίο'),
  dob: Yup.date().max(new Date(), 'Η ημερομηνία γέννησης δεν μπορεί να είναι στο μέλλον').required('Απαραίτητο πεδίο'),
  birth_place: Yup.string().max(100, 'Το πολύ 100 χαρακτήρες'),
  phone_no: Yup.string().matches(/^\+?[0-9]{7,15}$/u, 'Δώστε έγκυρο αριθμό τηλεφώνου'),
  mobile: Yup.string().matches(/^\+?[0-9]{7,15}$/u, 'Δώστε έγκυρο αριθμό κινητού').required('Απαραίτητο πεδίο'),
  occupation: Yup.string().max(100, 'Το πολύ 100 χαρακτήρες'),
  user_type: Yup.string().oneOf(['patient', 'employee', 'volunteer'], 'Μη έγκυρος τύπος χρήστη').required('Απαραίτητο πεδίο'),
  address: Yup.string().max(150, 'Το πολύ 150 χαρακτήρες').required('Απαραίτητο πεδίο'),
  address_no: Yup.string().max(10, 'Το πολύ 10 χαρακτήρες').required('Απαραίτητο πεδίο'),
  postal_code: Yup.string().max(10, 'Το πολύ 10 χαρακτήρες').required('Απαραίτητο πεδίο'),
  city: Yup.string().max(50, 'Το πολύ 50 χαρακτήρες').required('Απαραίτητο πεδίο'),
  disease_type: Yup.string().when('user_type', { is: 'patient', then: (s) => s.required('Απαραίτητο πεδίο'), otherwise: (s) => s.strip() }),
  handicap: Yup.number().when('user_type', { is: 'patient', then: (s) => s.min(0).max(100).required('Απαραίτητο πεδίο'), otherwise: (s) => s.strip() }),
  emergency_contact: Yup.string().when('user_type', { is: 'patient', then: (s) => s.max(100), otherwise: (s) => s.strip() }),
  employee_type: Yup.string().when('user_type', { is: 'employee', then: (s) => s.oneOf(['full_time','part_time','intern','contractor','board_member']).required('Απαραίτητο πεδίο'), otherwise: (s) => s.strip() }),
  department: Yup.string().when('user_type', { is: 'employee', then: (s) => s.oneOf(['social_services','psychological_services','administration','management','board_of_directors']).required('Απαραίτητο πεδίο'), otherwise: (s) => s.strip() }),
  has_vehicle: Yup.boolean().when('user_type', { is: (t) => t === 'employee' || t === 'volunteer', then: (s) => s, otherwise: (s) => s.strip() }),
});

export default function UserCreatePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = auth.can('manage_users');
  if (!isAdmin) {
    return (
      <div className="p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 text-slate-700">
          Δεν έχετε δικαίωμα δημιουργίας χρήστη.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Νέος Χρήστης</h1>
          <Link to="/app/users" className="text-sm text-indigo-700 hover:underline">← Πίσω στη λίστα</Link>
        </div>

        <Formik
          initialValues={{
            email: '', first_name: '', last_name: '', password: '', confirmPassword: '', dob: '', birth_place: '', phone_no: '', mobile: '', occupation: '', user_type: '',
            address: '', address_no: '', postal_code: '', city: '',
            disease_type: '', handicap: '', emergency_contact: '',
            employee_type: '', department: '', has_vehicle: false,
          }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setServerError(''); setLoading(true);
            try {
              await http.post(API.AUTH.REGISTER, values);
              toast.success('Ο χρήστης δημιουργήθηκε');
              navigate('/app/users');
            } catch (err) {
              const msg = err?.response?.data?.message || err?.message || 'Αποτυχία δημιουργίας χρήστη';
              setServerError(msg);
              toast.error(msg);
            } finally {
              setSubmitting(false); setLoading(false);
            }
          }}
        >
          {({ values, isSubmitting, resetForm }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Όνομα</label>
                  <Field name="first_name" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Επώνυμο</label>
                  <Field name="last_name" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Field name="email" type="email" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Κωδικός</label>
                  <Field name="password" type="password" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Επιβεβαίωση</label>
                  <Field name="confirmPassword" type="password" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ημ/νία γέννησης</label>
                  <Field name="dob" type="date" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="dob" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Τόπος γέννησης</label>
                  <Field name="birth_place" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Σταθερό</label>
                  <Field name="phone_no" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Κινητό</label>
                  <Field name="mobile" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="mobile" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Επάγγελμα</label>
                  <Field name="occupation" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Διεύθυνση</label>
                  <Field name="address" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Αριθμός</label>
                  <Field name="address_no" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="address_no" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Τ.Κ.</label>
                  <Field name="postal_code" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="postal_code" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Πόλη</label>
                  <Field name="city" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                  <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Τύπος χρήστη</label>
                  <Field as="select" name="user_type" className="mt-1 w-full rounded-xl border px-3 py-2">
                    <option value="">-- Επιλέξτε --</option>
                    <option value="patient">Ασθενής</option>
                    <option value="employee">Υπάλληλος</option>
                    <option value="volunteer">Εθελοντής</option>
                  </Field>
                  <ErrorMessage name="user_type" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {values.user_type === 'patient' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Είδος Νόσου</label>
                    <Field name="disease_type" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                    <ErrorMessage name="disease_type" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ποσοστό Αναπηρίας (%)</label>
                    <Field name="handicap" type="number" min={0} max={100} className="mt-1 w-full rounded-xl border px-3 py-2" />
                    <ErrorMessage name="handicap" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Επαφή έκτακτης ανάγκης</label>
                    <Field name="emergency_contact" type="text" className="mt-1 w-full rounded-xl border px-3 py-2" />
                    <ErrorMessage name="emergency_contact" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
              )}

              {values.user_type === 'employee' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Είδος απασχόλησης</label>
                    <Field as="select" name="employee_type" className="mt-1 w-full rounded-xl border px-3 py-2">
                      <option value="">-- Επιλέξτε --</option>
                      <option value="full_time">Πλήρης Απασχόληση</option>
                      <option value="part_time">Μερική Απασχόληση</option>
                      <option value="intern">Πρακτική</option>
                      <option value="contractor">Συνεργάτης</option>
                      <option value="board_member">Μέλος Δ.Σ.</option>
                    </Field>
                    <ErrorMessage name="employee_type" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Τμήμα</label>
                    <Field as="select" name="department" className="mt-1 w-full rounded-xl border px-3 py-2">
                      <option value="">-- Επιλέξτε --</option>
                      <option value="social_services">Κοινωνική Υπηρεσία</option>
                      <option value="psychological_services">Ψυχολογική Υπηρεσία</option>
                      <option value="management">Γραμματεία</option>
                      <option value="administration">Διοίκηση</option>
                      <option value="board_of_directors">Δ.Σ.</option>
                    </Field>
                    <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div className="flex items-center gap-2 mt-7">
                    <Field id="has_vehicle" name="has_vehicle" type="checkbox" className="h-4 w-4" />
                    <label htmlFor="has_vehicle" className="text-sm text-gray-700">Διαθέτει όχημα</label>
                  </div>
                </div>
              )}

              {values.user_type === 'volunteer' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Field id="has_vehicle" name="has_vehicle" type="checkbox" className="h-4 w-4" />
                    <label htmlFor="has_vehicle" className="text-sm text-gray-700">Διαθέτει όχημα</label>
                  </div>
                </div>
              )}

              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
              )}

              <div className="flex items-center justify-center gap-3">
                <Button type="submit" size="md" disabled={isSubmitting || loading} className="min-w-[160px]">
                  {loading ? 'Αποθήκευση…' : 'Δημιουργία'}
                </Button>
                <Button type="button" variant="secondary" size="md" className="min-w-[160px]" onClick={() => { setServerError(''); resetForm(); }}>
                  Καθαρισμός φόρμας
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
