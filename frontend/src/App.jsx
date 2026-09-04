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
import CarLoader from "./components/CarLoader";
import VehicleMap from "./components/Map/VehicleMap";

function App() {
    const [isLoading, setIsLoading] = useState(true);
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
        } catch {
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

    useEffect(() => {
        const finishLoading = () => window.setTimeout(() => setIsLoading(false), 850);
        const timer = document.readyState === "complete" ? finishLoading() : null;

        if (timer === null) {
            window.addEventListener("load", finishLoading, { once: true });
        }

        return () => {
            if (timer) window.clearTimeout(timer);
            window.removeEventListener("load", finishLoading);
        };
    }, []);

    if (isLoading) {
        return <CarLoader />;
    }

    if (page === "qr") {
        return <QrScanner onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "reservation") {
        return <Reservation onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "tracking") {
        return <VehicleMap onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "login") {
        return <Login onNavigate={setPage} />;
    }

    if (page === "register") {
        return <Register onNavigate={setPage} />;
    }

    if (page === "privacy") {
        return <Privacy onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "terms") {
        return <Terms onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    return <Home onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
}

export default App;
