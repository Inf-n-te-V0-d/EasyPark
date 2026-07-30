const NavLinks = ({ links = [], mobile = false, className = "", onLinkClick }) => {
    return (
        <ul className={`${mobile ? "flex flex-col gap-4" : "hidden md:flex items-center gap-10"} ${className}`}>
            {links.map((link) => (
                <li key={link.label}>
                    <a
                        href={link.href}
                        className={`font-medium text-[var(--color-text)] transition duration-300 hover:text-[var(--color-primary-hover)] ${mobile ? "block py-3 text-lg" : ""}`}
                        onClick={(event) => onLinkClick?.(link, event)}
                    >
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default NavLinks;
