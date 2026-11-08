import { ScanLine } from "lucide-react";

// Shared by Signup.jsx and Login.jsx so both pages stay visually identical.
// If your project keeps shared UI elsewhere (e.g. components/ui/), feel
// free to move this file there — the import paths in Signup/Login would
// just need updating to match.

export function AuthShell({ kicker, title, subtitle, children }) {
  return (
    <div className="min-h-screen w-full bg-[#0A0B0D] lg:flex">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-item { opacity: 0; animation: fadeUp 0.5s ease forwards; }
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,25px) scale(1.05); } }
        @keyframes blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
        .field-input {
          width: 100%; background: transparent; color: #F2F4F0; font-size: 14.5px;
          padding: 10px 0; border: none; border-bottom: 1px solid rgba(255,255,255,0.12);
          outline: none; transition: border-color 0.2s;
        }
        .field-input::placeholder { color: #4B5450; }
        .field-input:focus { border-color: #C6FF4D; }
        .submit-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #C6FF4D; color: #0A0B0D; font-family: ui-monospace, 'JetBrains Mono', monospace;
          font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 13px 20px; border-radius: 8px; border: none; cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
          box-shadow: 0 0 0 rgba(198,255,77,0);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px -8px rgba(198,255,77,0.5); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Left — animated lab / brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#0A0B0D] lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-40 blur-[90px]"
             style={{ background: "#C6FF4D", animation: "drift1 9s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-30 blur-[100px]"
             style={{ background: "#8B5CFF", animation: "drift2 11s ease-in-out infinite" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]"
             style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative z-10 flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold tracking-[0.25em] text-[#F2F4F0]">CHAT LAB</span>
          <span className="font-mono text-[13px] text-[#C6FF4D]" style={{ animation: "blink 1s step-start infinite" }}>_</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C6FF4D]/25 bg-[#C6FF4D]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#C6FF4D]">
            <ScanLine size={11} /> {kicker}
          </span>
          <h1 className="mt-6 font-mono text-[2.4rem] font-medium leading-[1.15] text-[#F2F4F0]">
            {title}
          </h1>
          <p className="mt-5 text-[14.5px] leading-relaxed text-[#8A9290]">{subtitle}</p>
        </div>

        <p className="relative z-10 font-mono text-[10.5px] tracking-widest text-[#4B5450]">
          © {new Date().getFullYear()} CHAT_LAB — ALL SYSTEMS NOMINAL
        </p>
      </aside>

      {/* Right — form panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="mb-9 flex items-center gap-2 lg:hidden">
            <span className="font-mono text-[13px] font-bold tracking-[0.25em] text-[#F2F4F0]">CHAT LAB</span>
            <span className="font-mono text-[13px] text-[#C6FF4D]" style={{ animation: "blink 1s step-start infinite" }}>_</span>
          </div>

          <div className="relative rounded-2xl border border-white/[0.06] bg-[#101317] p-9">
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <div className="pointer-events-none absolute left-0 right-0 h-px opacity-40"
                 style={{ background: "linear-gradient(90deg, transparent, #C6FF4D, transparent)", animation: "scan 4s linear infinite" }} />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function Field({ label, children, delay = 0 }) {
  return (
    <label className="fade-item block" style={{ animationDelay: `${delay * 70 + 80}ms` }}>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B7570]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Corner({ pos }) {
  const base = "absolute h-3.5 w-3.5 border-[#C6FF4D]/60";
  const map = {
    tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-md",
    tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-md",
    bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md",
    br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-md",
  };
  return <span className={`${base} ${map[pos]}`} />;
}