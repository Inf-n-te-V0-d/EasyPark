import Logo from "./Logo";
import NavLinks from "./NavLinks";
import ActionButtons from "./ActionButtons";

const Navbar = () => {

    return (

        <nav
            className="fixed top-0 left-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur"
        >

            <div
                className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10"
            >

                <Logo />

                <NavLinks />

                <ActionButtons />

            </div>

        </nav>

    );
};

export default Navbar;
