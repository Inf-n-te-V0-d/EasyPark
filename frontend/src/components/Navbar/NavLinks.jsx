const NavLinks = ({ mobile = false, className = "", onLinkClick }) => {
    const links = [
        { label: "Home", href: "#top" },
        { label: "Features", href: "#features" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Qr-scanner", href: "#" },
    ];

    return (
        <ul className={`${mobile ? "flex flex-col" : "hidden md:flex"} items-center gap-10 ${className}`}>
            {links.map((link) => (
                <li key={link.label}>
                    <a
                        href={link.href}
                        className="font-medium text-[#334155] transition duration-300 hover:text-[#16A34A]"
                        onClick={onLinkClick}
                    >
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default NavLinks;
