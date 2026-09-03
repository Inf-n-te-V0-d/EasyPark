const AvailabilityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
    <path d="M4 19V9m5 10V5m5 14v-7m5 7V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 3v4m8-4v4M3 10h18m-12 4h6m-6 3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const QrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 14h2m3 0v3m-5 3h2m3-1v1m-2-3h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
    <path d="M12 3 20 6v5.4c0 4.7-3.3 8.4-8 9.6-4.7-1.2-8-4.9-8-9.6V6l8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m8.5 12 2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const services = [
  { icon: AvailabilityIcon, title: "Live availability", description: "See open spaces in real time before you leave, so every journey starts with a plan." },
  { icon: CalendarIcon, title: "Easy reservations", description: "Reserve the space you want ahead of time and arrive knowing it is waiting for you." },
  { icon: QrIcon, title: "Contactless entry", description: "Use your secure QR pass to enter and exit quickly, without tickets or queues." },
  { icon: ShieldIcon, title: "Simple management", description: "Keep bookings, parking history, and account details together in one secure place." },
];

const Services = () => (
  <section id="features" className="relative overflow-hidden bg-white py-20 sm:py-24">
    <div className="feature-theme-orb pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#DCFCE7] blur-3xl opacity-70" aria-hidden="true" />
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div id="how-it-works" className="relative overflow-hidden rounded-3xl bg-[#0F172A] px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#22C55E] opacity-20 blur-3xl" />
          <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-[#86EFAC]">EasyPark in motion</p>
          <h2 className="relative mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Parking, made refreshingly simple.</h2>
          <p className="relative mt-4 max-w-md leading-7 text-slate-300">From finding a space to entering the gate, EasyPark keeps each step clear, quick, and stress-free.</p>
          <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/15 bg-slate-800">
            <video className="aspect-video w-full object-cover" autoPlay muted loop playsInline controls aria-label="EasyPark platform preview">
              <source src="/videos/EasyPark_Video.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
          <div className="relative mt-5 flex items-center gap-3 text-sm text-slate-300">
            <span className="hero-status-dot h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            Find, reserve, scan, and go.
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16A34A]">Everything you need</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-4xl">A better way to park, from search to exit.</h2>
          <p className="mt-4 max-w-xl leading-7 text-[#64748B]">EasyPark replaces uncertainty with a seamless parking experience built around your day.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {services.map(({ icon: Icon, title, description }) => (
              <article key={title} className="group rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#BBF7D0] hover:bg-white hover:shadow-lg hover:shadow-green-100/70">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#DCFCE7] text-[#16A34A] transition group-hover:bg-[#22C55E] group-hover:text-white"><Icon /></span>
                <h3 className="mt-4 font-semibold text-[#0F172A]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Services;
