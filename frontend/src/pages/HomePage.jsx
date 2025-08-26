import Button from "../components/Button";
import Input from "../components/Input";

export default function HomePage() {
  return (
    <div>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Καλώς ήρθες 👋</h1>
        <p className="mt-2 text-slate-600">Το frontend ζει και βασιλεύει.</p>
      </section>
      <section>
      <Button>Default (primary)</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      </section>
      <section>
        <Input label="Όνομα" placeholder = "Γράψε το όνομά σου"/>
        <Input label="Email" type="email" placeholder = "you@example.com" error = "To email δεν είναι έγκυρο"/>
      </section>
    </div>
  );
}

    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Καλώς ήρθες 👋</h1>
      <p className="mt-2 text-slate-600">Το frontend ζει και βασιλεύει.</p>

    </section>