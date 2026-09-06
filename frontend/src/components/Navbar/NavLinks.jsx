const NavLinks = ({ links = [], mobile = false, className = "", onLinkClick }) => {
    return (
        <ul className={`${mobile ? "flex flex-col gap-4" : "hidden min-[1280px]:flex min-w-0 items-center gap-5"} ${className}`}>
            {links.map((link) => (
                <li key={link.label} className={mobile ? "mobile-nav-link w-full" : ""}>
                    <a
                        href={link.href}
                        className={`nav-link whitespace-nowrap font-medium text-[var(--color-text)] transition duration-300 ${mobile ? "block py-3 text-lg" : "text-base"}`}
                        onClick={(event) => onLinkClick?.(link, event)}
                    >
                        {link.icon && <img src={link.icon} alt="" className="nav-account-icon" aria-hidden="true" />}
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default NavLinks;
