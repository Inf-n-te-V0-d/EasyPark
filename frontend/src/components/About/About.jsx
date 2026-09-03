const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M20 10c0 5.25-8 11-8 11S4 15.25 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>
);

const QrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 14h2m3 0v3m-5 3h2m3-1v1m-2-3h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const steps = [
  { icon: QrIcon, title: "Scan your parking slot", text: "A unique QR code records the exact floor, section, row, and slot where you parked." },
  { icon: LocationIcon, title: "Find your vehicle again", text: "Return to a clear saved location and route, whether you are in a mall, hospital, campus, or parking tower." },
  { icon: ClockIcon, title: "Leave with confidence", text: "Entry and exit times keep your parking duration accurate for straightforward automatic fee calculation." },
];

const About = () => (
  <section id="about" className="bg-[#F8FAFC] py-20 sm:py-24">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16A34A]">About EasyPark</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-4xl">Never lose track of where you parked again.</h2>
          <p className="mt-5 max-w-xl leading-8 text-[#475569]">EasyPark is a QR-based smart parking system designed for large and busy parking areas. It makes every stage of parking simpler: check availability, reserve a space, save your exact vehicle location, and find your way back when it is time to leave.</p>
          <p className="mt-4 max-w-xl leading-8 text-[#475569]">Built for vehicle owners and parking administrators alike, it replaces manual processes with live slot information, reliable tracking, and automatic parking fee management.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Malls & hospitals', 'Universities', 'Office complexes', 'Parking towers'].map((place) => <span key={place} className="rounded-full border border-[#BBF7D0] bg-white px-3.5 py-2 text-sm font-medium text-[#16A34A]">{place}</span>)}
          </div>
        </div>
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5"><div><p className="text-sm font-medium text-[#16A34A]">Your parking journey</p><h3 className="mt-1 text-xl font-semibold text-[#0F172A]">Simple from arrival to exit</h3></div><img src="/Logo_icon.png" alt="EasyPark" className="h-12 w-12 rounded-xl object-cover" /></div>
          <div className="mt-6 space-y-6">
            {steps.map(({ icon: Icon, title, text }, index) => <div key={title} className="flex gap-4"><div className="relative flex flex-col items-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#DCFCE7] text-[#16A34A]"><Icon /></span>{index < steps.length - 1 && <span className="mt-2 h-full w-px bg-[#BBF7D0]" />}</div><div className="pb-1"><p className="font-semibold text-[#0F172A]">{title}</p><p className="mt-1 text-sm leading-6 text-[#64748B]">{text}</p></div></div>)}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
