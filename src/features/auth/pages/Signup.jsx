import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, ArrowRight } from "lucide-react";
import { signup } from "../services/auth.api.js";
import { AuthShell, Field } from "./AuthShell.jsx";

// NOTE: this talks to auth.api.js directly with local component state.
// If your `useAuth` hook / `auth.slice.js` already wraps signup + loading +
// error state via Redux, swap the api call below for `useAuth().signup(...)`
// instead — the JSX and validation logic don't need to change either way.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (form.username.trim().length < 3) return "Username needs at least 3 characters.";
    if (!EMAIL_RE.test(form.email)) return "That email doesn't look right.";
    if (form.password.length < 6) return "Password needs at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      // api call — swap for useAuth().signup(...) if that's how your app is wired
      await signup({ email: form.email, username: form.username, password: form.password });
      setStatus("sent");
    } catch (err) {
      setError(err?.response?.data?.msg || "Something went wrong. Try again.");
      setStatus("error");
    }
  };

  return (
    <AuthShell
      kicker="New Instance"
      title={<>Initialize a<br />new account.</>}
      subtitle="A workspace for every generative session you run — synced, versioned, yours."
    >
      {status === "sent" ? (
        <SuccessPanel email={form.email} />
      ) : (
        <>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Username" delay={0}>
              <input
                value={form.username}
                onChange={set("username")}
                placeholder="e.g. neon_researcher"
                autoComplete="username"
                className="field-input"
              />
            </Field>

            <Field label="Email" delay={1}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@domain.com"
                autoComplete="email"
                className="field-input"
              />
            </Field>

            <Field label="Password" delay={2}>
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="pl-3 text-[#6B7570] hover:text-[#C6FF4D] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm password" delay={3}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Type it again"
                autoComplete="new-password"
                className="field-input"
              />
            </Field>

            {status === "error" && error && (
              <p role="alert" className="fade-item rounded-md border border-[#FF6B5E]/30 bg-[#FF6B5E]/[0.08] px-3 py-2.5 text-sm text-[#FF9A8F]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="submit-btn fade-item"
              style={{ animationDelay: "440ms" }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Provisioning…
                </>
              ) : (
                <>
                  Create account <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="fade-item mt-8 text-center text-[13px] text-[#6B7570]" style={{ animationDelay: "520ms" }}>
            Already running?{" "}
            <Link to="/login" className="text-[#C6FF4D] hover:underline underline-offset-4">
              Log in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

function SuccessPanel({ email }) {
  return (
    <div className="fade-item text-center py-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C6FF4D]/30 bg-[#C6FF4D]/10">
        <Mail size={22} className="text-[#C6FF4D]" />
      </div>
      <h3 className="mt-6 font-mono text-lg text-[#F2F4F0]">check_inbox.exe</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#8A9290]">
        A verification link was sent to <span className="text-[#F2F4F0]">{email}</span>.
        Confirm it, then come back and log in.
      </p>
      <Link to="/login" className="submit-btn mt-8 inline-flex">
        Go to login <ArrowRight size={15} />
      </Link>
    </div>
  );
}