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

  const input =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 aria-[invalid=true]:border-red-500";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">


      {/* Main Content */}
      <main className="flex-1 grid lg:grid-cols-[.94fr_1.06fr]">
        {/* Left Section */}
        <section className="mx-auto flex w-[min(100%-42px,460px)] flex-col justify-center py-8 lg:w-[min(100%-80px,460px)]">
          <img
            className="w-[196px]"
            src="/Logo_icon.png"
            alt="EasyPark"
          />

          <div className="relative mt-9 rounded-[18px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_42px_rgba(15,23,42,.055)] sm:px-[34px] before:absolute before:top-0 before:left-8 before:h-[3px] before:w-12 before:rounded-b-lg before:bg-green-500 before:content-['']">
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

                <a
                  href="#forgot-password"
                  className="font-semibold text-green-600 hover:underline"
                >
                  Forgot password?
                </a>
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
            🔒 Your information is protected and secure.
          </p>
        </section>

        {/* Right Section */}
        <aside className="relative hidden place-items-center overflow-hidden bg-[linear-gradient(145deg,#0f172a,#123a2a_48%,#15803d)] p-12 text-white lg:grid">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="absolute top-11 left-12 text-lg font-bold">
            easypark<span className="text-green-400">.</span>
          </div>

          <div className="relative z-10 text-center">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-full border-[14px] border-green-400 bg-white/10 shadow-[0_0_80px_rgba(34,197,94,.25)]">
              <span className="grid h-24 w-24 place-items-center rounded-[30px_30px_30px_0] bg-white text-4xl font-bold text-green-600">
                P
              </span>
            </div>

            <h2 className="mt-12 text-4xl font-bold tracking-tight">
              Your space is
              <br />
              waiting for you.
            </h2>

            <p className="mx-auto mt-4 max-w-xs text-[13px] leading-6 text-white/70">
              Find, reserve, and manage your parking in just a few taps.
            </p>

            <div className="mt-6 flex justify-center gap-5 text-[10px]">
              <span className="inline-flex items-center gap-1">
                <CheckIcon />
                Instant booking
              </span>

              <span className="inline-flex items-center gap-1">
                <CheckIcon />
                Best locations
              </span>
            </div>
          </div>
        </aside>
      </main>

    </div>
  );
}