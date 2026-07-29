const ActionButtons = ({ className = "", onNavigate }) => {

    return (

        <div className={`flex flex-wrap items-center gap-4 ${className}`}>

            <button
                type="button"
                className="w-full rounded-lg border border-emerald-500 px-5 py-2 text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white md:w-auto"
                onClick={() => onNavigate?.("register")}
            >
                Sign Up
            </button>

            <button
                type="button"
                className="w-full rounded-lg bg-emerald-500 px-5 py-2 text-white transition-all hover:bg-emerald-600 md:w-auto"
                onClick={() => onNavigate?.("login")}
            >
                Sign In
            </button>

        </div>

    );
};

export default ActionButtons;