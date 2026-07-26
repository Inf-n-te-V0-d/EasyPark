import Logo from "./Logo";
import NavLinks from "./NavLinks";
import ActionButtons from "./ActionButtons";

const Navbar = () => {

    return (

        <nav
            className="fixed top-0 left-0 w-full bg-white shadow-sm z-50"
        >

            <div
                className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between"
            >

                <Logo />

                <NavLinks />

                <ActionButtons />

            </div>

        </nav>

    );
};

export default Navbar;