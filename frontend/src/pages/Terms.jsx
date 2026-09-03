import { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const Terms = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />

            <main className="mx-auto max-w-4xl px-6 pb-16 pt-28 lg:px-10">
                <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-sm lg:p-10">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                        Terms of Service
                    </span>
                    <h1 className="mt-4 text-4xl font-bold text-[var(--color-dark)]">Parking handled with clarity</h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text)]">
                        By using EasyPark, you agree to use our platform responsibly, respect reservation rules, and follow
                        any local parking regulations associated with your booking.
                    </p>

                    <div className="mt-8 space-y-6 text-sm leading-7">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">1. Account responsibility</h2>
                            <p className="mt-2">You are responsible for keeping your account information accurate and for any activity performed through your account.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">2. Reservation rules</h2>
                            <p className="mt-2">Reservations are held for the stated time window and must be used in line with the service’s booking terms and availability.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">3. Service availability</h2>
                            <p className="mt-2">EasyPark aims to provide a reliable parking experience, but availability and access conditions may vary depending on site operations.</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-dark)]">4. Contact and support</h2>
                            <p className="mt-2">For questions or concerns about these terms, please contact our support team using the details listed in the footer.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default Terms;
