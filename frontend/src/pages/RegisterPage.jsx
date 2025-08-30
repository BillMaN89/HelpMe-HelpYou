import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from "react";
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import http from '../shared/lib/http';
import { API } from '../shared/constants/api';

// ----- Validation -----
const RegisterSchema = Yup.object({
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
  // --- Conditional extras ---
  disease_type: Yup.string().when('user_type', {
    is: 'patient',
    then: (s) => s.required('Απαραίτητο πεδίο'),
    otherwise: (s) => s.strip(),
  }),
  handicap: Yup.number().when('user_type', {
    is: 'patient',
    then: (s) => s.min(0, '>= 0').max(100, '<= 100').required('Απαραίτητο πεδίο'),
    otherwise: (s) => s.strip(),
  }),
  emergency_contact: Yup.string().when('user_type', {
    is: 'patient',
    then: (s) => s.max(100, 'Το πολύ 100 χαρακτήρες'),
    otherwise: (s) => s.strip(),
  }),
  employee_type: Yup.string().when('user_type', {
    is: 'employee',
    then: (s) => s.oneOf(['full_time','part_time','intern','contractor','board_member']).required('Απαραίτητο πεδίο'),
    otherwise: (s) => s.strip(),
  }),
  department: Yup.string().when('user_type', {
    is: 'employee',
    then: (s) => s.oneOf(['social_services','psychological_services','administration','management','board_of_directors']).required('Απαραίτητο πεδίο'),
    otherwise: (s) => s.strip(),
  }),
  has_vehicle: Yup.boolean().when('user_type', {
    is: (t) => t === 'employee' || t === 'volunteer',
    then: (s) => s,
    otherwise: (s) => s.strip(),
  }),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <section className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">Εγγραφή Χρήστη</h2>
          <p className="text-sm text-gray-500 text-center mt-1">Παρακαλώ συμπληρώστε τα στοιχεία σας.</p>
        </section>

        {/* Form */}
        <Formik
          initialValues={{
            email: '',
            first_name: '',
            last_name: '',
            password: '',
            confirmPassword: '',
            dob: '',
            birth_place: '',
            phone_no: '',
            mobile: '',
            occupation: '',
            user_type: '',
            address: '',
            address_no: '',
            postal_code: '',
            city: '',
            // extras (patient)
            disease_type: '',
            handicap: '',
            emergency_contact: '',
            // extras (employee/volunteer)
            employee_type: '',
            department: '',
            has_vehicle: false,
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setServerError('');
            setLoading(true);
            try {
              const payload = { ...values };
              delete payload.confirmPassword; // δεν χρειάζεται στο backend
              const { data } = await http.post(API.AUTH.REGISTER, payload);
              if (data?.access_token) {
                localStorage.setItem('access_token', data.access_token);
              }
              toast.success('Εγγραφή επιτυχής! 🎉');
              navigate('/app', { replace: true });
            } catch (err) {
              const msg = err?.response?.data?.message || err?.message || 'Κάτι πήγε στραβά. Προσπαθήστε ξανά.';
              setServerError(msg);
              toast.error(msg);
            } finally {
              setSubmitting(false);
              setLoading(false);
            }
          }}
        >
          {({ values, isSubmitting, resetForm }) => (
            <Form className="space-y-8">
              {/* Βασικές Πληροφορίες */}
              <h3 className="text-lg font-medium text-gray-900">Βασικές Πληροφορίες</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Field id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>


                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Κωδικός Πρόσβασης</label>
                  <Field id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Επιβεβαίωση Κωδικού</label>
                  <Field id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Όνομα</label>
                  <Field id="first_name" name="first_name" type="text" autoComplete="given-name" placeholder="Γιώργος" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Επώνυμο</label>
                  <Field id="last_name" name="last_name" type="text" autoComplete="family-name" placeholder="Παπαδόπουλος" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Ημερομηνία Γέννησης</label>
                  <Field id="dob" name="dob" type="date" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="dob" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700">Τόπος Γέννησης</label>
                  <Field id="birth_place" name="birth_place" type="text" placeholder="Αθήνα" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="birth_place" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Επάγγελμα */}
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Επάγγελμα</label>
                  <Field id="occupation" name="occupation" type="text" placeholder="Π.χ. Υπάλληλος γραφείου" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="occupation" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {/* Τύπος Χρήστη */}
                <div>
                  <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">Τύπος Χρήστη</label>
                  <Field as="select" id="user_type" name="user_type" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200">
                    <option value="">-- Επιλέξτε --</option>
                    <option value="patient">Ασθενής</option>
                    <option value="volunteer">Εθελοντής</option>
                    <option value="employee">Υπάλληλος</option>
                  </Field>
                  <ErrorMessage name="user_type" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Στοιχεία Επικοινωνίας */}
              <h3 className="text-lg font-medium text-gray-900">Στοιχεία Επικοινωνίας</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Οδός</label>
                  <Field id="address" name="address" type="text" placeholder="Ελ. Βενιζέλου" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label htmlFor="address_no" className="block text-sm font-medium text-gray-700">Αριθμός</label>
                  <Field id="address_no" name="address_no" type="text" placeholder="12" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="address_no" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Τ.Κ.</label>
                  <Field id="postal_code" name="postal_code" type="text" placeholder="12345" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="postal_code" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">Πόλη</label>
                  <Field id="city" name="city" type="text" placeholder="Αθήνα" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700">Σταθερό Τηλέφωνο</label>
                  <Field id="phone_no" name="phone_no" type="text" placeholder="2101234567" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="phone_no" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Κινητό Τηλέφωνο</label>
                  <Field id="mobile" name="mobile" type="text" placeholder="6901234567" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                  <ErrorMessage name="mobile" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Επιπλέον πεδία (δυναμικά) */}
              <h3 className="text-lg font-medium text-gray-900">Επιπλέον Πληροφορίες</h3>
              {values.user_type === 'patient' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="disease_type" className="block text-sm font-medium text-gray-700">Είδος Νόσου</label>
                    <Field id="disease_type" name="disease_type" type="text" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                    <ErrorMessage name="disease_type" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div>
                    <label htmlFor="handicap" className="block text-sm font-medium text-gray-700">Ποσοστό Αναπηρίας (%)</label>
                    <Field id="handicap" name="handicap" type="number" min={0} max={100} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                    <ErrorMessage name="handicap" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700">Επείγον Επικοινωνία</label>
                    <Field id="emergency_contact" name="emergency_contact" type="text" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
                    <ErrorMessage name="emergency_contact" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
              )}

              {values.user_type === 'employee' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="employee_type" className="block text-sm font-medium text-gray-700">Είδος Απασχόλησης</label>
                    <Field as="select" id="employee_type" name="employee_type" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200">
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
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Τμήμα</label>
                    <Field as="select" id="department" name="department" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200">
                      <option value="">-- Επιλέξτε --</option>
                      <option value="social_services">Κοινωνική Υπηρεσία</option>
                      <option value="psychological_services">Ψυχολογική Υπηρεσία</option>
                      <option value="administration">Administration</option>
                      <option value="management">Management</option>
                      <option value="board_of_directors">Δ.Σ.</option>
                    </Field>
                    <ErrorMessage name="department" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Field id="has_vehicle" name="has_vehicle" type="checkbox" className="h-4 w-4" />
                    <label htmlFor="has_vehicle" className="text-sm text-gray-700">Διαθέτει όχημα</label>
                  </div>
                </div>
              )}

              {values.user_type === 'volunteer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Field id="has_vehicle" name="has_vehicle" type="checkbox" className="h-4 w-4" />
                    <label htmlFor="has_vehicle" className="text-sm text-gray-700">Διαθέτει όχημα</label>
                  </div>
                </div>
              )}

              {/* Server error */}
              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button type="submit" size="lg" disabled={isSubmitting || loading} className="w-full">
                    {loading ? 'Αποστολή…' : 'Εγγραφή'}
                  </Button>
                  <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => { setServerError(''); resetForm(); }}>
                    Καθαρισμός φόρμας
                  </Button>
                </div>
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">Αρχική Σελίδα</Button>
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
