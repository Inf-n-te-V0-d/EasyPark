import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const spaces = [
    { id: "A-01", status: "available" }, { id: "A-02", status: "available" }, { id: "A-03", status: "occupied" }, { id: "A-04", status: "available" },
    { id: "B-01", status: "occupied" }, { id: "B-02", status: "available" }, { id: "B-03", status: "available" }, { id: "B-04", status: "occupied" },
    { id: "C-01", status: "available" }, { id: "C-02", status: "available" }, { id: "C-03", status: "occupied" }, { id: "C-04", status: "available" },
];

const Reservation = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const [selectedSpace, setSelectedSpace] = useState("A-01");
    const [isReserved, setIsReserved] = useState(false);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth", // Use "auto" if you don't want animation
        });
    }, []);

    const chooseSpace = (space) => {
        if (space.status === "occupied") return;
        setSelectedSpace(space.id);
        setIsReserved(false);
    };

    return (
        <div className="reservation-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="reservation-main">
                <header className="reservation-hero">
                    <span className="reservation-eyebrow">Reserve your space</span>
                    <h1>Your parking spot, <span>saved ahead.</span></h1>
                    <p>Choose an available spot before you arrive and make parking one less thing to think about.</p>
                </header>

                <div className="reservation-layout">
                    <section className="reservation-card reservation-map-card" aria-labelledby="parking-map-title">
                        <div className="reservation-card-header">
                            <div><p className="reservation-label">Parking map</p><h2 id="parking-map-title">Level 1 · Main Building</h2></div>
                            <span className="reservation-availability"><i /> 8 spaces available</span>
                        </div>
                        <div className="reservation-legend" aria-label="Parking map legend">
                            <span><i className="available" /> Available</span><span><i className="selected" /> Selected</span><span><i className="occupied" /> Occupied</span>
                        </div>
                        <div className="parking-lane" aria-hidden="true"><span>Entry</span><div /><span>Exit</span></div>
                        <div className="parking-spaces" role="list" aria-label="Available parking spaces">
                            {spaces.map((space) => {
                                const selected = selectedSpace === space.id;
                                return <button key={space.id} type="button" role="listitem" disabled={space.status === "occupied"} onClick={() => chooseSpace(space)} className={`parking-space ${space.status} ${selected ? "is-selected" : ""}`} aria-label={`${space.id}, ${selected ? "selected" : space.status}`}><span>P</span><b>{space.id}</b></button>;
                            })}
                        </div>
                        <p className="reservation-map-tip">Tap an available space to select it.</p>
                    </section>

                    <aside className="reservation-card reservation-summary" aria-labelledby="booking-title">
                        <p className="reservation-label">Your reservation</p>
                        <h2 id="booking-title">Review your spot</h2>
                        <div className="selected-space-display"><span>Selected space</span><strong>{selectedSpace}</strong><em>Level 1 · Main Building</em></div>
                        <dl className="reservation-details"><div><dt>Arrival window</dt><dd>Today, 9:00 AM – 11:00 AM</dd></div><div><dt>Duration</dt><dd>Up to 2 hours</dd></div></dl>
                        <button type="button" className="reservation-button" onClick={() => setIsReserved(true)}>{isReserved ? "Space Reserved" : "Reserve this space"}</button>
                        {isReserved && <p className="reservation-success" role="status">Your space {selectedSpace} is reserved. See you soon!</p>}
                        <p className="reservation-note">You can update or cancel your reservation before arrival.</p>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Reservation;
