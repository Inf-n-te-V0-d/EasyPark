const Logo = () => {
    return (
        <div className="flex items-center gap-2 cursor-pointer">

            <img
                src="/Logo_icon.png"
                alt="EasyPark"
                className="h-11 w-11 rounded-xl object-cover"
            />

            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Easy<span className="text-[#22C55E]">Park</span>
            </h1>

        </div>
    );
};

export default Logo;
