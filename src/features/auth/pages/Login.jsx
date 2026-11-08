import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, TriangleAlert } from "lucide-react";
import { login } from "../services/auth.api.js";
import { AuthShell, Field } from "./AuthShell.jsx";
import { useAuth } from "../hook/useAuth.js"; 
import { useSelector } from "react-redux";

// NOTE: same note as Signup.jsx — this calls auth.api.js directly with
// local state. Swap for useAuth().login(...) if that's how auth.slice.js
// expects to be driven; the JSX below doesn't need to change either way.

export default function Login() {
  const navigate = useNavigate();
  const user = useSelector(state=>state.auth.user)
      const loading = useSelector(state=> state.auth.loading)

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error | unverified
  const [error, setError] = useState("");

  if(!loading && user){
    navigate("/")
  }

  const {handelLogin} = useAuth();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const payload = {
        email:form.email,
        password:form.password
      }
      // api call — swap for useAuth().login(...) if that's how your app is wired
      await handelLogin(payload);
      navigate("/"); // adjust to wherever the logged-in app lives
    } catch (err) {
      const msg = err?.response?.data?.msg || "";
      if (msg.toLowerCase().includes("not verified")) {
        setStatus("unverified");
        return;
      }
      setError(msg || "Email or password may be wrong.");
      setStatus("error");
    }
  };

  return (
    <AuthShell
      kicker="Resume Session"
      title={<>Welcome<br />back online.</>}
      subtitle="Your sessions, prompts, and history — picked up exactly where you left them."
    >
      {status === "unverified" ? (
        <UnverifiedPanel email={form.email} />
      ) : (
        <>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Email" delay={0}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@domain.com"
                autoComplete="email"
                className="field-input"
              />
            </Field>

            <Field label="Password" delay={1}>
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Your password"
                  autoComplete="current-password"
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

            {status === "error" && error && (
              <p role="alert" className="fade-item rounded-md border border-[#FF6B5E]/30 bg-[#FF6B5E]/[0.08] px-3 py-2.5 text-sm text-[#FF9A8F]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="submit-btn fade-item"
              style={{ animationDelay: "300ms" }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  Log in <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="fade-item mt-8 text-center text-[13px] text-[#6B7570]" style={{ animationDelay: "380ms" }}>
            New to Chat Lab?{" "}
            <Link to="/signup" className="text-[#C6FF4D] hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

function UnverifiedPanel({ email }) {
  return (
    <div className="fade-item text-center py-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#FFC94D]/30 bg-[#FFC94D]/10">
        <TriangleAlert size={22} className="text-[#FFC94D]" />
      </div>
      <h3 className="mt-6 font-mono text-lg text-[#F2F4F0]">verification_required</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#8A9290]">
        {email ? (
          <>A fresh verification link just went out to <span className="text-[#F2F4F0]">{email}</span>.</>
        ) : (
          "A fresh verification link just went out to your inbox."
        )}{" "}
        Confirm it, then log in again.
      </p>
      <button onClick={() => window.location.reload()} className="submit-btn mt-8 inline-flex">
        Back to login <ArrowRight size={15} />
      </button>
    </div>
  );
}