// stylesheet
import { useState } from "react";
import "./App.css";

// Pages
import Home from "./pages/Home";
import QrScanner from "./pages/Qr_scanner";

function App() {
    const [page, setPage] = useState("home");

    return page === "qr" ? <QrScanner onNavigate={setPage} /> : <Home onNavigate={setPage} />;
}

export default App;