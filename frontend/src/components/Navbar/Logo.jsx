const Logo = () => {
    return (
        <div className="flex items-center gap-2 cursor-pointer">

            <img
                src="/EasyPark_Logo.webp"
                alt="EasyPark"
                className="h-20 w-30"
            />

            <h1 className="text-2xl font-bold">
                Easy<span className="text-emerald-500">Park</span>
            </h1>

        </div>
    );
};

export default Logo;