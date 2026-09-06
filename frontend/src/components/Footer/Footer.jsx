import { useState } from "react";

const Footer = ({ onNavigate }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
  <footer id="contact" className="bg-[#0F172A] text-white">
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="rounded-2xl bg-[#22C55E] px-6 py-8 sm:flex sm:items-center sm:justify-between sm:px-9"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#DCFCE7]">Ready when you are</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Make your next parking stop effortless.</h2></div><a href="#features" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-[#16A34A] transition hover:bg-[#F0FDF4] sm:mt-0">Explore EasyPark</a></div>
      <div className="grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"><div><a href="#top" className="inline-flex items-center gap-2"><img src="/Logo_icon.png" alt="EasyPark" className="h-11 w-11 rounded-xl object-cover" /><span className="text-2xl font-bold">Easy<span className="text-[#22C55E]">Park</span></span></a><p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">The simple way to find, reserve, and manage parking spaces with confidence.</p></div><div><h3 className="font-semibold">Explore</h3><ul className="mt-4 space-y-3 text-sm text-slate-400"><li><a className="transition hover:text-[#86EFAC]" href="#top">Home</a></li><li><a className="transition hover:text-[#86EFAC]" href="#features">Features</a></li><li><a className="transition hover:text-[#86EFAC]" href="#about">About EasyPark</a></li><li><a className="transition hover:text-[#86EFAC]" href="#how-it-works">How it works</a></li></ul></div><div><h3 className="font-semibold">Need help?</h3><ul className="mt-4 space-y-3 text-sm text-slate-400"><li><a className="transition hover:text-[#86EFAC]" href="mailto:support@easypark.com">support@easypark.com</a></li><li><button type="button" className="font-inherit text-left transition hover:text-[#86EFAC]" onClick={() => setIsContactOpen(true)}>Contact us</button></li><li>Available 24/7</li></ul></div></div>
      <div className="flex flex-col gap-3 border-t border-slate-700 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 EasyPark. All rights reserved.</p><div className="flex gap-5"><button type="button" className="hover:text-white" onClick={() => onNavigate?.("privacy")}>Privacy</button><button type="button" className="hover:text-white" onClick={() => onNavigate?.("terms")}>Terms</button></div></div>
    </div>
    {isContactOpen && <div className="contact-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsContactOpen(false); }}><section className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title"><button type="button" className="contact-modal-close" aria-label="Close contact details" onClick={() => setIsContactOpen(false)}>&times;</button><div className="contact-modal-heading"><span>EasyPark Support</span><h2 id="contact-modal-title">Contact Us</h2></div><div className="contact-modal-details"><a href="mailto:support@easypark.com"><span>Email</span>support@easypark.com</a><a href="tel:+94112345678"><span>Phone</span>+94 11 234 5678</a></div></section></div>}
  </footer>
  );
};

export default Footer;
