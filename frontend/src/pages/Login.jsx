import { useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Icon = ({ children, className = "" }) => (
  <svg
    className={`fill-none stroke-current stroke-[1.9] ${className}`}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CheckIcon = () => (
  <Icon className="h-4 w-4">
    <path d="m5 12 4.2 4.2L19 6.8" />
  </Icon>
);

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [resetStep, setResetStep] = useState("request");
  const [resetForm, setResetForm] = useState({ email: "", code: "", password: "", confirmPassword: "" });
  const [resetErrors, setResetErrors] = useState({});
  const [resetMessage, setResetMessage] = useState(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const updateField = ({ target }) => {
    const { name, value, checked, type } = target;

    setForm((v) => ({
      ...v,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((v) => ({
      ...v,
      [name]: "",
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const next = {};

    if (!form.email.trim()) {
      next.email = "Email address is required.";
    } else if (!emailPattern.test(form.email)) {
      next.email = "Enter a valid email address.";
    }

    if (!form.password) {
      next.password = "Password is required.";
    } else if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    setErrors(next);

    if (!Object.keys(next).length) {
      console.info("EasyPark sign-in form validated", {
        email: form.email,
        remember: form.remember,
      });
    }
  };

  const openReset = () => {
    setAuthView("reset");
    setResetStep("request");
    setResetForm({ email: form.email, code: "", password: "", confirmPassword: "" });
    setResetErrors({});
    setResetMessage(null);
  };

  const updateResetField = ({ target }) => {
    const { name, value } = target;
    setResetForm((current) => ({ ...current, [name]: value }));
    setResetErrors((current) => ({ ...current, [name]: "" }));
    setResetMessage(null);
  };

  const requestVerificationCode = (event) => {
    event.preventDefault();
    const next = {};
    if (!resetForm.email.trim()) next.email = "Email address is required.";
    else if (!emailPattern.test(resetForm.email)) next.email = "Enter a valid email address.";
    setResetErrors(next);
    if (Object.keys(next).length) {
      setResetMessage({ type: "error", text: "Please correct the highlighted field." });
      return;
    }
    setIsResetLoading(true);
    window.setTimeout(() => {
      setIsResetLoading(false);
      setResetStep("reset");
      setResetMessage({ type: "success", text: "A verification code has been sent to your email." });
    }, 700);
  };

  const completeReset = (event) => {
    event.preventDefault();
    const next = {};
    if (!/^\d{6}$/.test(resetForm.code)) next.code = "Enter the 6-digit verification code.";
    if (!resetForm.password) next.password = "New password is required.";
    else if (resetForm.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!resetForm.confirmPassword) next.confirmPassword = "Please confirm your new password.";
    else if (resetForm.password !== resetForm.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setResetErrors(next);
    if (Object.keys(next).length) {
      setResetMessage({ type: "error", text: "Please correct the highlighted fields." });
      return;
    }
    setIsResetLoading(true);
    window.setTimeout(() => {
      setIsResetLoading(false);
      setResetStep("success");
      setResetMessage({ type: "success", text: "Your password has been reset. You can now sign in with it." });
    }, 900);
  };

  const returnToLogin = () => {
    setAuthView("login");
    setResetMessage(null);
    setResetErrors({});
  };

  const input =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 aria-[invalid=true]:border-red-500";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">


      {/* Main Content */}
      <main className="flex-1 grid lg:grid-cols-[.94fr_1.06fr]">
        {/* Left Section */}
        <section className="mx-auto flex w-[min(100%-42px,460px)] flex-col justify-center py-8 lg:w-[min(100%-80px,460px)]">
          <button type="button" onClick={() => onNavigate?.("home")} className="auth-back-link inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#475569] transition hover:text-[#16A34A]"><Icon className="h-4 w-4"><path d="m14 6-6 6 6 6M8 12h10" /></Icon>Back to home</button>
          <div className="auth-brand-logo-log-reg mt-7 flex items-center gap-3"><img src="/Logo_icon.png" alt="EasyPark" className="h-11 w-11 rounded-xl object-cover" /><h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Easy<span className="text-[#22C55E]">Park</span></h1></div>

          <div className="relative mt-9 rounded-[18px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_42px_rgba(15,23,42,.055)] sm:px-[34px] before:absolute before:top-0 before:left-8 before:h-[3px] before:w-12 before:rounded-b-lg before:bg-green-500 before:content-['']">
            {authView === "login" ? <>
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.8px] text-slate-500">
                <i className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-500/10" />
                Secure sign in
              </span>

              <h1 className="mt-2 text-[32px] font-bold tracking-[-1.4px] text-slate-900">
                Welcome back
                <span className="text-green-500">.</span>
              </h1>

              <p className="mt-2 text-[13px] leading-6 text-slate-700">
                Your next easy parking experience is just a sign-in away.
              </p>
            </div>

            <form
              className="grid gap-5"
              noValidate
              onSubmit={submit}
            >
              {/* Email */}
              <label className="grid gap-2 text-[12px] font-semibold text-slate-900">
                <span>Email address</span>

                <input
                  className={input}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.email)}
                />

                {errors.email && (
                  <small className="text-[10px] font-medium text-red-600">
                    {errors.email}
                  </small>
                )}
              </label>

              {/* Password */}
              <label className="grid gap-2 text-[12px] font-semibold text-slate-900">
                <span>Password</span>

                <span className="relative">
                  <input
                    className={`${input} pr-12`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.password)}
                  />

                  <button
                    type="button"
                    className="absolute top-0 right-0 grid h-12 w-12 place-items-center text-slate-500 hover:text-green-500"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    <Icon className="h-[18px] w-[18px]">
                      <path d="M2.3 10.9C3.2 9 7 4 12 4s8.8 5 9.7 6.9a1.9 1.9 0 0 1 0 1.8C20.8 13.6 17 18 12 18s-8.8-4.4-9.7-6.3a1.9 1.9 0 0 1 0-.8Z" />
                      <circle cx="12" cy="11" r="3" />
                    </Icon>
                  </button>
                </span>

                {errors.password && (
                  <small className="text-[10px] font-medium text-red-600">
                    {errors.password}
                  </small>
                )}
              </label>

              <div className="flex items-center justify-between text-[11px] text-slate-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    className="h-4 w-4 accent-green-500"
                    name="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={updateField}
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-semibold text-green-600 hover:underline"
                  onClick={openReset}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="flex h-[52px] items-center justify-between rounded-xl bg-green-500 px-5 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(34,197,94,.22)] transition hover:-translate-y-px hover:bg-green-600"
              >
                Sign in to EasyPark

                <Icon className="h-[18px] w-[18px]">
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </Icon>
              </button>
            </form>
            </> : <div>
              <div className="mb-7">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.8px] text-slate-500">
                  <i className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-500/10" />
                  Secure password reset
                </span>
                <h1 className="mt-2 text-[32px] font-bold tracking-[-1.4px] text-slate-900">
                  {resetStep === "success" ? "Password reset" : "Reset password"}<span className="text-green-500">.</span>
                </h1>
                <p className="mt-2 text-[13px] leading-6 text-slate-700">
                  {resetStep === "request" ? "Enter your email and we’ll send you a verification code." : resetStep === "reset" ? "Enter your code and choose a new secure password." : "Your EasyPark account is ready to use."}
                </p>
              </div>

              {resetMessage && <div className={`mb-5 rounded-xl border px-4 py-3 text-[11px] leading-5 ${resetMessage.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`} role={resetMessage.type === "error" ? "alert" : "status"} aria-live="polite">{resetMessage.text}</div>}

              {resetStep === "request" && <form className="grid gap-5" noValidate onSubmit={requestVerificationCode}>
                <label className="grid gap-2 text-[12px] font-semibold text-slate-900"><span>Email address</span><input className={input} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={resetForm.email} onChange={updateResetField} aria-invalid={Boolean(resetErrors.email)} />{resetErrors.email && <small className="text-[10px] font-medium text-red-600">{resetErrors.email}</small>}</label>
                <button type="submit" disabled={isResetLoading} className="flex h-[52px] items-center justify-between rounded-xl bg-green-500 px-5 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(34,197,94,.22)] transition hover:-translate-y-px hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70">{isResetLoading ? "Sending code…" : "Send verification code"}<Icon className="h-[18px] w-[18px]"><path d="M5 12h13M13 6l6 6-6 6" /></Icon></button>
              </form>}

              {resetStep === "reset" && <form className="grid gap-5" noValidate onSubmit={completeReset}>
                <label className="grid gap-2 text-[12px] font-semibold text-slate-900"><span>Verification code</span><input className={input} name="code" inputMode="numeric" autoComplete="one-time-code" maxLength="6" pattern="[0-9]{6}" placeholder="6-digit code" value={resetForm.code} onChange={updateResetField} aria-invalid={Boolean(resetErrors.code)} aria-describedby="verification-code-help" />{resetErrors.code && <small className="text-[10px] font-medium text-red-600">{resetErrors.code}</small>}<small id="verification-code-help" className="font-normal text-[10px] text-slate-500">Frontend preview: enter any 6 digits.</small></label>
                <label className="grid gap-2 text-[12px] font-semibold text-slate-900"><span>New password</span><input className={input} name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={resetForm.password} onChange={updateResetField} aria-invalid={Boolean(resetErrors.password)} />{resetErrors.password && <small className="text-[10px] font-medium text-red-600">{resetErrors.password}</small>}</label>
                <label className="grid gap-2 text-[12px] font-semibold text-slate-900"><span>Confirm new password</span><input className={input} name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your new password" value={resetForm.confirmPassword} onChange={updateResetField} aria-invalid={Boolean(resetErrors.confirmPassword)} />{resetErrors.confirmPassword && <small className="text-[10px] font-medium text-red-600">{resetErrors.confirmPassword}</small>}</label>
                <button type="submit" disabled={isResetLoading} className="flex h-[52px] items-center justify-between rounded-xl bg-green-500 px-5 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(34,197,94,.22)] transition hover:-translate-y-px hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70">{isResetLoading ? "Resetting password…" : "Reset password"}<Icon className="h-[18px] w-[18px]"><path d="M5 12h13M13 6l6 6-6 6" /></Icon></button>
                <button type="button" className="text-center text-[11px] font-semibold text-green-600 hover:underline" onClick={() => { setResetStep("request"); setResetMessage(null); }}>Use a different email</button>
              </form>}

              {resetStep === "success" && <button type="button" onClick={returnToLogin} className="flex h-[52px] w-full items-center justify-between rounded-xl bg-green-500 px-5 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(34,197,94,.22)] transition hover:-translate-y-px hover:bg-green-600">Back to sign in<Icon className="h-[18px] w-[18px]"><path d="M5 12h13M13 6l6 6-6 6" /></Icon></button>}
              {resetStep !== "success" && <button type="button" onClick={returnToLogin} className="mt-6 w-full text-center text-[11px] font-semibold text-green-600 hover:underline">Back to sign in</button>}
            </div>}
          </div>

          <p className="mt-6 text-center text-[12px] text-slate-700">
            New to EasyPark?{" "}
            <button
              type="button"
              className="font-semibold text-green-600 hover:underline"
              onClick={() => onNavigate?.("register")}
            >
              Create an account
            </button>
          </p>

          <p className="mt-4 text-center text-[10px] text-slate-400">
            Your information is protected and secure.
          </p>
        </section>

        {/* Right Section */}
        <aside className="auth-visual-panel relative hidden min-h-screen overflow-hidden bg-[#0F172A] lg:block">
          <img src="/Login_img.png" alt="EasyPark parking experience" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/25 to-[#0F172A]/25" />
          <div className="auth-visual-content absolute inset-x-12 bottom-12 text-white"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur"><CheckIcon /> Smarter parking</span><h2 className="mt-5 text-4xl font-bold tracking-tight">Your space is<br />waiting for you.</h2><p className="auth-visual-copy mt-3 max-w-sm text-sm leading-6 text-white/80">Find, reserve, track, and manage your parking in just a few taps.</p></div>
        </aside>
      </main>

    </div>
  );
}
