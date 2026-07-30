const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const PinIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M20 10c0 5.25-8 11-8 11S4 15.25 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>
);

const Hero = ({ onNavigate }) => (
  <main className="relative isolate min-h-screen overflow-hidden bg-[#F8FAFC] pt-20">
    <div className="absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(circle_at_76%_8%,rgba(34,197,94,0.17),transparent_27rem)]" />
    <div className="hero-theme-orb absolute -bottom-40 -left-40 -z-10 h-96 w-96 rounded-full bg-[#DCFCE7] blur-3xl opacity-70" />
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-6 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-16">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-white px-3.5 py-2 text-sm font-medium text-[#16A34A] shadow-sm"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#DCFCE7]"><PinIcon /></span>Smarter parking starts here</div>
        <h1 className="mt-7 text-4xl font-bold leading-[1.14] tracking-[-0.035em] text-[#0F172A] sm:text-5xl lg:text-6xl">Park with confidence,<span className="block text-[#22C55E]">every single time.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-[#334155] sm:text-lg">Find available spaces, reserve your spot, and breeze through entry with one simple, intelligent parking experience.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => onNavigate?.("qr")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3.5 font-semibold text-white shadow-[0_12px_24px_rgba(34,197,94,0.25)] transition hover:bg-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#BBF7D0]">Find a parking spot <ArrowIcon /></button>
          <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3.5 font-semibold text-[#334155] transition hover:border-[#22C55E] hover:text-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#DCFCE7]">How EasyPark works</a>
        </div>
        <div className="mt-11 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#E2E8F0] pt-7">
          {[["500+", "parking spaces"], ["24/7", "live availability"], ["2 min", "average booking"]].map(([value, label]) => <div key={label}><p className="text-2xl font-bold tracking-tight text-[#0F172A]">{value}</p><p className="mt-0.5 text-sm text-[#64748B]">{label}</p></div>)}
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="hero-brand-panel relative overflow-hidden rounded-3xl bg-[#0F172A] px-7 py-9 text-center text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22C55E] opacity-20 blur-3xl" />
          <div className="hero-brand-logo relative mx-auto grid h-32 w-32 place-items-center rounded-[28px] bg-white p-4 shadow-2xl sm:h-40 sm:w-40"><img src="/Logo_icon.png" alt="EasyPark smart parking logo" className="h-full w-full object-contain" /></div>
          <p className="hero-brand-name relative mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Easy<span className="text-[#22C55E]">Park</span></p>
          <p className="hero-brand-tagline relative mt-2 text-sm text-slate-300 sm:text-base">Parking, tracked the easy way.</p>
          <div className="relative mt-8 h-12 overflow-hidden rounded-xl border border-white/15 bg-white/10 px-4">
            <div className="hero-phrase-track">
              <p>Track your parking in real time</p>
              <p>Reserve your space with QR</p>
              <p>Arrive, scan, and park with ease</p>
            </div>
          </div>
          <div className="relative mt-6 flex justify-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22C55E]" /><span className="h-2 w-2 rounded-full bg-white/30" /><span className="h-2 w-2 rounded-full bg-white/30" /></div>
        </div>
      </div>
    </section>
  </main>
);

export default Hero;
