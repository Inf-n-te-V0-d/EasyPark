const NavLinks = () => {

    const links = [
        { label: "Home", href: "#top" },
        { label: "Features", href: "#features" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" }
    ];

    return (

        <ul className="hidden md:flex items-center gap-10">

            {links.map((link) => (

                <li
                    key={link.label}
                >
                    <a href={link.href} className="font-medium text-[#334155] transition duration-300 hover:text-[#16A34A]">
                        {link.label}
                    </a>
                </li>

            ))}

        </ul>

    );
};

export default NavLinks;
