import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCreateRequest } from '../../hooks/userRequests';
import Button from '../../components/Button';

const schema = Yup.object({
  service_type: Yup.string().required('Επιλέξτε υπηρεσία'),
  description: Yup.string().trim().min(10, 'Περιγράψτε λίγο πιο αναλυτικά (≥10 χαρακτήρες)').required('Η περιγραφή είναι απαραίτητη'),
});

const SERVICE_OPTIONS = [
  { value: '', label: '— Επιλογή υπηρεσίας —' },
  { value: 'social', label: 'Κοινωνική Υπηρεσία' },
  { value: 'psychological', label: 'Ψυχολογική Υποστήριξη' },
];

export default function RequestForm() {
  const { mutate: createRequest, isLoading } = useCreateRequest();

  return (
    <div className="max-w-xl w-full mx-auto p-4 rounded-2xl shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Νέο Αίτημα Υποστήριξης</h1>

      <Formik
        initialValues={{ service_type: '', description: '' }}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          createRequest(values, { onSuccess: () => resetForm() });
        }}
      >
        {({ isValid, dirty, resetForm }) => (
          <Form className="space-y-4">
            {/* Υπηρεσία */}
            <div>
              <label htmlFor="service_type" className="block mb-1">Υπηρεσία</label>
              <Field
                as="select"
                id="service_type"
                name="service_type"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isLoading}
              >
                {SERVICE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Field>
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="service_type" />
              </div>
            </div>

            {/* Περιγραφή */}
            <div>
              <label htmlFor="description" className="block mb-1">Περιγραφή</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="5"
                placeholder="Περιγράψτε συνοπτικά το αίτημα σας…"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50"
                disabled={isLoading}
              />
              <div className="text-sm text-red-600 mt-1">
                <ErrorMessage name="description" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                variant='primary'
              >
                {isLoading ? 'Αποστολή…' : 'Καταχώρηση Αιτήματος'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => resetForm()}
                disabled={isLoading}
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