// stylesheet
import { useState } from "react";
import "./App.css";

// Components
import Home from "./pages/Home";
import QrScanner from "./pages/Qr_scanner";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    const [page, setPage] = useState("home");

    if (page === "qr") {
        return <QrScanner onNavigate={setPage} />;
    }

    if (page === "login") {
        return <Login onNavigate={setPage} />;
    }

    if (page === "register") {
        return <Register onNavigate={setPage} />;
    }

    return <Home onNavigate={setPage} />;
}

export default App;