import { useState } from "react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import ActionButtons from "./ActionButtons";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
                <Logo />

                <div className="hidden md:flex items-center gap-10">
                    <NavLinks />
                    <ActionButtons />
                </div>

                <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                    <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <span
                            className={`h-0.5 w-6 bg-current transition-transform ${isMenuOpen ? "translate-y-1 rotate-45" : ""}`}
                        />
                        <span
                            className={`h-0.5 w-6 bg-current transition-opacity ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                        />
                        <span
                            className={`h-0.5 w-6 bg-current transition-transform ${isMenuOpen ? "-translate-y-1 -rotate-45" : ""}`}
                        />
                    </div>
                </button>
            </div>

            {isMenuOpen && (
                <div className="absulate inset-x-0 top-20 bottom-0 z-900 overflow-auto bg-white px-6 pb-6 pt-6 shadow-lg md:hidden">
                    <div className="flex min-h-full flex-col gap-6">
                        <NavLinks
                            mobile
                            className="flex flex-col gap-4"
                            onLinkClick={() => setIsMenuOpen(false)}
                        />
                        <ActionButtons className="flex flex-col gap-3" />
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
