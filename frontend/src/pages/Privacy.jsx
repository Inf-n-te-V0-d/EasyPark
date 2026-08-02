import { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const Privacy = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />

            <main className="mx-auto max-w-4xl px-6 pb-16 pt-28 lg:px-10">
                <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-sm lg:p-10">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                        Privacy Policy
                    </span>
                    <h1 className="mt-4 text-4xl font-bold text-[var(--color-dark)]">Your privacy matters to us</h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text)]">
                        EasyPark collects only the information needed to provide parking reservations, account access,
                        and service support. We use this data to improve your experience, secure your account, and keep
                        parking operations reliable.
                    </p>

                    <div className="mt-8 space-y-6 text-sm leading-7">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">1. Information we collect</h2>
                            <p className="mt-2">We may collect contact details, account credentials, reservation history, vehicle identifiers, and usage data necessary for booking and service delivery.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">2. How we use your information</h2>
                            <p className="mt-2">Information is used to create and manage your account, process reservations, communicate service updates, and improve security and app performance.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">3. Sharing and storage</h2>
                            <p className="mt-2">We do not sell personal data. We may share information with trusted service providers only when required to run the platform securely and efficiently.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">4. Your choices</h2>
                            <p className="mt-2">You may update your account information, request data changes, or contact support at any time if you need assistance with your privacy settings.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default Privacy;
