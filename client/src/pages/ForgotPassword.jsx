import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // After clicking the link in the email, Supabase redirects here.
        // The user lands on /reset-password where they set a new password.
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors";

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
          <p className="text-slate-400">
            We sent a password reset link to{" "}
            <span className="text-white font-medium">{email}</span>.
          </p>
          <p className="text-slate-500 text-sm mt-3">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              try again
            </button>
            .
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-blue-400 hover:text-blue-300 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">QuoteFlow AI</h1>
          <p className="text-slate-400 mt-2">Reset your password</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm mb-6">
            Enter your account email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-semibold"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
