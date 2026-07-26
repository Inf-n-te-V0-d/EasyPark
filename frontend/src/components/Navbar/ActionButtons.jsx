const ActionButtons = () => {

    return (

        <div className="flex items-center gap-4">

            <button
                className="px-5 py-2 rounded-lg border border-emerald-500
                text-emerald-500 hover:bg-emerald-500 hover:text-white
                transition-all cursor-pointer"
            >
                Sign In
            </button>

            <button
                className="px-5 py-2 rounded-lg bg-emerald-500
                text-white hover:bg-emerald-600 transition-all cursor-pointer"
            >
                Get Started
            </button>

        </div>

    );
};

export default ActionButtons;