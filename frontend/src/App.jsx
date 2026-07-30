// stylesheet
import { useEffect, useState } from "react";
import "./App.css";

// Components
import Home from "./pages/Home";
import QrScanner from "./pages/Qr_scanner";
import Reservation from "./pages/Reservation";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    const [page, setPage] = useState("home");
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("easypark-theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add("theme-transitioning");
        // Ensure the transition rule is active before the theme values change.
        void root.offsetWidth;
        root.classList.toggle("dark", isDarkMode);
        localStorage.setItem("easypark-theme", isDarkMode ? "dark" : "light");

        const transitionTimer = window.setTimeout(() => {
            root.classList.remove("theme-transitioning");
        }, 280);

        return () => window.clearTimeout(transitionTimer);
    }, [isDarkMode]);

    if (page === "qr") {
        return <QrScanner onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "reservation") {
        return <Reservation onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
    }

    if (page === "login") {
        return <Login onNavigate={setPage} />;
    }

    if (page === "register") {
        return <Register onNavigate={setPage} />;
    }

    return <Home onNavigate={setPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((value) => !value)} />;
}

export default App;
