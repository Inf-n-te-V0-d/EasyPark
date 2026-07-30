const Logo = () => {
    return (
        <div className="flex items-center gap-2 cursor-pointer">

            <img
                src="/Logo_icon.png"
                alt="EasyPark"
                className="h-11 w-11 rounded-xl object-cover"
            />

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-dark)]">
                Easy<span className="text-[var(--color-primary)]">Park</span>
            </h1>

        </div>
    );
};

export default Logo;
