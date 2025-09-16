import { Link } from 'react-router-dom';
import Button from '../components/Button';
import notFoundAnimation from '../assets/explosion-reaction.gif';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-12 text-slate-800">
      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-700">
        Oops!
      </span>
      <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">404</span>
        <span className="block text-lg sm:text-xl font-semibold text-slate-600 mt-1">Η σελίδα δεν βρέθηκε</span>
      </h1>
      <img
        src={notFoundAnimation}
        alt="Animated explosion reaction for a 404 error"
        className="w-full max-w-md sm:max-w-lg rounded-xl shadow-lg"
      />
      <p className="mt-3 max-w-xl text-xl text-slate-600">
        Η σελίδα που ζητήσατε φαίνεται να έχει μετακινηθεί ή να μην υπάρχει πια.
      </p>
      <Link to="/app" className="mt-6 inline-block">
        <Button size="lg">
          Επιστροφή στο Dashboard
        </Button>
      </Link>
    </div>
  );
}
