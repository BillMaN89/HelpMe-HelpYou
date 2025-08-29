import Button from "../components/Button";
import { Link } from "react-router-dom";
import kefiLogo from "../assets/kefiLogo.jpg";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <section className="rounded-2xl border bg-white p-8 shadow-sm">
        <img
          src={kefiLogo}
          alt="Σύλλογος ΚΕΦΙ"
          className="mx-auto mb-4 h-24 w-auto rounded-lg shadow-sm"
          loading="eager"
        />
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Καλώς ήρθες 👋
        </h1>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Τι μπορείς να κάνεις εδώ</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Υποβολή αιτήματος υποστήριξης (κοινωνική/ψυχολογική).</li>
          <li>Παρακολούθηση της πορείας των αιτημάτων σου.</li>
          <li>Σύνδεση προσωπικού για ανάθεση & ενημέρωση κατάστασης.</li>
          <li>Οι εθελοντές βλέπουν τα αιτήματα που τους έχουν ανατεθεί.</li>
        </ul>
      </section>

      <section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login">
            <Button className="h-10 px-5 text-sm">Σύνδεση</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="h-10 px-5 text-sm">
              Εγγραφή
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}