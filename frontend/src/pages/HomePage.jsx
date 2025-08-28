import Button from "../components/Button";
import Input from "../components/Input";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Καλώς ήρθες 👋</h1>
        <p className="mt-2 text-slate-600">Το frontend ζει και βασιλεύει.</p>
      </section>
      <section className="rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-100">
        <Link to="/login" className="block">
          <Button variant="outline" className="w-full">
            Σύνδεση
          </Button>
        </Link>
        <Link to="/register" className="block">
          <Button variant="outline" className="w-full">
            Εγγραφή
          </Button>
        </Link>
        </div>
      </section>
    </div>
  );
}
