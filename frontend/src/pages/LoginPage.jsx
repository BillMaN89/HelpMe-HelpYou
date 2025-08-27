import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import http from '../shared/shared/lib/http';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Δώστε έγκυρο email")
    .required("Απαραίτητο πεδίο"),
  password: Yup.string()
    .min(8, "Τουλάχιστον 8 χαρακτήρες")
    .required("Απαραίτητο πεδίο"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <section className="mb-6">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">
            Σύνδεση Χρήστη
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Παρακαλώ συμπληρώστε τα στοιχεία σας.
          </p>
        </section>

        {/* Form */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setServerError("");
            setLoading(true);
            try {
              // endpoint
              const { data } = await http.post("/auth/login", values);
              // token storage
              if (data?.access_token) {
                localStorage.setItem("access_token", data.access_token);
              }
              // Navigate to dashboard/home after successful login -- needs to be changed
              toast.success("Επιτυχής σύνδεση!");
              navigate("/");
            } catch (err) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Κάτι πήγε στραβά. Προσπαθήστε ξανά.";
              setServerError(msg);
            } finally {
              setSubmitting(false);
              setLoading(false);
            }
          }}
        >
          {({ isSubmitting, resetForm }) => (
            <Form className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Κωδικός Πρόσβασης
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              {/* Server error */}
              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

                {/* Actions */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || loading}
                      className="w-full"
                    >
                      {loading ? "Σύνδεση..." : "Υποβολή"}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setServerError("");
                        resetForm();
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
            </Form>
          )}
        </Formik>

        {/* Footer helper */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Ξεχάσατε τον κωδικό; <Link to="/forgot-password" className="underline">Ανάκτηση</Link>
        </p>
        <Link to="/" className="block">
          <Button variant="outline" className="w-full">
            Αρχική Σελίδα
          </Button>
        </Link>
      </div>
    </div>
  );
}
