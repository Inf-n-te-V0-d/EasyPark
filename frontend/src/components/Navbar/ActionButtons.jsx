import { getSession } from "../../lib/api";

const ActionButtons = ({ className = "", onNavigate }) => {
    const user = getSession();
    const username = user?.name?.trim();

    if (username) {
        return (
            <button
                type="button"
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[color:color-mix(in_srgb,var(--color-white)_90%,transparent)] px-4 py-2 font-semibold text-[var(--color-text)] transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)] md:w-auto ${className}`}
                onClick={() => onNavigate?.("user")}
                aria-label={`Open ${username}'s account`}
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white" aria-hidden="true">
                    {username.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-36 truncate">{username}</span>
            </button>
        );
    }

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
