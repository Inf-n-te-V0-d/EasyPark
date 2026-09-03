// stylesheet
import { useEffect, useState } from "react";
import "./App.css";

// Components
import Home from "./pages/Home";
import QrScanner from "./pages/Qr_scanner";
import Reservation from "./pages/Reservation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Loader from "./components/Loader/Loader";

function App() {
    const [page, setPage] = useState(() => {
        const hash = window.location.hash.replace("#", "").trim();
        if (hash === "privacy" || hash === "terms") {
            return hash;
        }

        return "home";
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("easypark-theme") === "dark";
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const root = document.documentElement;

        // apply class
        if (isDarkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // persist
        try {
            localStorage.setItem("easypark-theme", isDarkMode ? "dark" : "light");
        } catch (err) {
            // ignore
        }

        // add transition class briefly for smooth change
        root.classList.add("theme-transitioning");
        const transitionTimer = window.setTimeout(() => {
            root.classList.remove("theme-transitioning");
        }, 280);

        return () => window.clearTimeout(transitionTimer);
    }, [isDarkMode]);

    useEffect(() => {
        const syncPageFromHash = () => {
            const hash = window.location.hash.replace("#", "").trim();

            if (hash === "privacy" || hash === "terms") {
                setPage(hash);
            } else if (hash === "home" || hash === "top") {
                setPage("home");
            }
        };

        syncPageFromHash();
        window.addEventListener("hashchange", syncPageFromHash);

        return () => window.removeEventListener("hashchange", syncPageFromHash);
    }, []);

    // Show a short loader on first mount / refresh
    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    // Wrapped navigation so loader shows during transitions but doesn't block routing
    const handleNavigate = (to) => {
        setIsLoading(true);
        setPage(to);
        // let content change immediately, hide loader shortly after
        setTimeout(() => setIsLoading(false), 700);
    };

    if (page === "qr") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <QrScanner onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />
            </>
        );
    }

    if (page === "reservation") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <Reservation onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />
            </>
        );
    }

    if (page === "login") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <Login onNavigate={handleNavigate} />
            </>
        );
    }

    if (page === "register") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <Register onNavigate={handleNavigate} />
            </>
        );
    }

    if (page === "privacy") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <Privacy onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />
            </>
        );
    }

    if (page === "terms") {
        return (
            <>
                {isLoading && <Loader duration={700} />}
                <Terms onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />
            </>
        );
    }

    return (
        <>
            {isLoading && <Loader duration={700} />}
            <Home onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />
        </>
    );
}

export default App;