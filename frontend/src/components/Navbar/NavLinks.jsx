const NavLinks = () => {

    const links = [
        "Home",
        "Features",
        "About",
        "Contact"
    ];

    return (

        <ul className="hidden md:flex items-center gap-10">

            {links.map((link) => (

                <li
                    key={link}
                    className="cursor-pointer font-medium hover:text-emerald-500 transition duration-300"
                >
                    {link}
                </li>

            ))}

        </ul>

    );
};

export default NavLinks;