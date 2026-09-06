import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton";
import { apiRequest, getSession, saveVehicleLocation } from "../lib/api";

const parkedVehicleLocation = {
    name: "My parked vehicle",
    destination: "6.9271,79.8612",
    link: "https://www.google.com/maps/dir/?api=1&destination=6.9271,79.8612&travelmode=driving",
};

const getReservationSlotId = (reservation) => String(reservation.parkingSlot?._id || reservation.parkingSlot || "");
const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours === 1 ? "" : "s"}${remainingMinutes ? ` ${remainingMinutes} minutes` : ""}`;
};

const Reservation = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const currentUser = getSession();
    const currentUserId = currentUser?._id;
    const isAdmin = currentUser?.role === "admin";
    const [spaces, setSpaces] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [isReserved, setIsReserved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [vehicleNumberError, setVehicleNumberError] = useState("");
    const [arrivalDate, setArrivalDate] = useState(getToday);
    const [arrivalStart, setArrivalStart] = useState("09:00");
    const [arrivalEnd, setArrivalEnd] = useState("11:00");

    const startDateTime = new Date(`${arrivalDate}T${arrivalStart}`);
    const endDateTime = new Date(`${arrivalDate}T${arrivalEnd}`);
    const durationMinutes = startDateTime.getTime() && endDateTime.getTime() && endDateTime > startDateTime
        ? Math.round((endDateTime - startDateTime) / 60000)
        : 0;

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth", // Use "auto" if you don't want animation
        });
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([
            apiRequest("/parking"),
            currentUserId ? apiRequest(`/reservation/user/${currentUserId}`) : Promise.resolve([]),
        ])
            .then(([parking, reservations]) => {
                if (!active) return;
                setSpaces(parking);
                setMyReservations(reservations.filter((reservation) => reservation.status !== "cancelled"));
                const ownedSlotIds = new Set(reservations.filter((reservation) => reservation.status !== "cancelled").map(getReservationSlotId));
                setSelectedSpace(parking.find((space) => space.status === "available") || parking.find((space) => ownedSlotIds.has(String(space._id))) || parking[0] || null);
            })
            .catch((requestError) => active && setError(requestError.message))
            .finally(() => active && setIsLoading(false));

        return () => { active = false; };
    }, [currentUserId, isAdmin]);

    const chooseSpace = (space) => {
        const isMine = myReservations.some((reservation) => getReservationSlotId(reservation) === String(space._id));
        if (space.status === "occupied" && !isMine && !isAdmin) return;
        setSelectedSpace(space);
        setIsReserved(false);
        setError("");
    };

    const handleFindVehicle = () => onNavigate?.("tracking");

    const releaseSpace = async (space) => {
        const user = getSession();
        if (!user?._id) {
            setError("Please sign in before releasing a parking space.");
            onNavigate?.("login");
            return;
        }

        setIsSaving(true);
        setError("");
        try {
            await apiRequest(`/parking/${space._id}/release`, { method: "POST" });
            setSpaces((current) => current.map((item) => item._id === space._id ? { ...item, status: "available" } : item));
            setMyReservations((current) => current.filter((reservation) => getReservationSlotId(reservation) !== String(space._id)));
            setSelectedSpace((current) => current?._id === space._id ? { ...current, status: "available" } : current);
            setIsReserved(false);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    const reserveSpace = async () => {
        const user = getSession();
        if (!user?._id) {
            setError("Please sign in before reserving a parking space.");
            onNavigate?.("login");
            return;
        }
        if (!selectedSpace) return;
        if (!vehicleNumber.trim()) {
            setVehicleNumberError("Please enter your vehicle number before reserving.");
            return;
        }
        setVehicleNumberError("");
        if (!durationMinutes) {
            setError("Please choose a valid arrival time range.");
            return;
        }

        setIsSaving(true);
        setError("");
        try {
            await apiRequest("/reservation", {
                method: "POST",
                body: JSON.stringify({
                    user: user._id,
                    parkingSlot: selectedSpace._id,
                    vehicleDetails: { vehicleNumber: vehicleNumber.trim() },
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    totalAmount: 0,
                }),
            });
            if (Number.isFinite(Number(selectedSpace.latitude)) && Number.isFinite(Number(selectedSpace.longitude))) {
                saveVehicleLocation({
                    lat: Number(selectedSpace.latitude),
                    lng: Number(selectedSpace.longitude),
                    label: `Reserved vehicle · ${selectedSpace.slot}`,
                    slot: selectedSpace.slot,
                    floor: `Level ${selectedSpace.floor}`,
                });
            }
            setIsReserved(true);
            setSpaces((current) => current.map((space) => space._id === selectedSpace._id ? { ...space, status: "occupied" } : space));
            setSelectedSpace((current) => current ? { ...current, status: "occupied" } : current);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="reservation-page min-h-screen">
                        <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
                        <main className="reservation-main">
                    <BackButton onNavigate={onNavigate} />
                    {error && <p className="user-alert user-alert-error" role="alert">{error}</p>}
                <header className="reservation-hero">
                    <span className="reservation-eyebrow">Reserve your space</span>
                    <h1>Your parking spot, <span>saved ahead.</span></h1>
                    <p>Choose an available spot before you arrive and make parking one less thing to think about.</p>
                </header>

                <div className="reservation-layout">
                    <section className="reservation-card reservation-map-card" aria-labelledby="parking-map-title">
                        <div className="reservation-card-header">
                            <div><p className="reservation-label">Parking map</p><h2 id="parking-map-title">Level 1 · Main Building</h2></div>
                            <span className="reservation-availability"><i /> {spaces.filter((space) => space.status === "available").length} spaces available</span>
                        </div>
                        <div className="reservation-legend" aria-label="Parking map legend">
                            <span><i className="available" /> Available</span><span><i className="selected" /> Selected</span><span><i className="reserved" /> My reservation</span><span><i className="occupied" /> Occupied</span>
                        </div>
                        <div className="parking-lane" aria-hidden="true"><span>Entry</span><div /><span>Exit</span></div>
                        <div className="parking-spaces" role="list" aria-label="Available parking spaces">
                            {isLoading && <p className="reservation-map-tip">Loading live parking availability...</p>}
                            {!isLoading && spaces.map((space) => {
                                const selected = selectedSpace?._id === space._id;
                                const isMine = myReservations.some((reservation) => getReservationSlotId(reservation) === String(space._id));
                                return <button key={space._id} type="button" role="listitem" disabled={space.status === "occupied" && !isMine && !isAdmin} onClick={() => chooseSpace(space)} className={`parking-space ${space.status} ${isMine ? "reserved-by-me" : ""} ${isAdmin && space.status === "occupied" ? "admin-manageable" : ""} ${selected ? "is-selected" : ""}`} aria-label={`${space.slot}, ${isMine ? "reserved by you" : isAdmin && space.status === "occupied" ? "occupied, manageable by admin" : selected ? "selected" : space.status}`}><span>{isMine ? "★" : "P"}</span><b>{space.slot}</b></button>;
                            })}
                        </div>
                        <p className="reservation-map-tip">Tap an available space to select it.</p>
                        <div className="reservation-map-actions">
                            <button type="button" className="reservation-button reservation-button-secondary" onClick={handleFindVehicle}>Go to my vehicle</button>
                        </div>
                    </section>

                    <aside className="reservation-card reservation-summary" aria-labelledby="booking-title">
                        <p className="reservation-label">Your reservation</p>
                        <h2 id="booking-title">Review your spot</h2>
                        <div className="selected-space-display"><span>Selected space</span><strong>{selectedSpace?.slot || "No space selected"}</strong><em>Level {selectedSpace?.floor || 1} · Main Building</em></div>
                        <div className="reservation-vehicle-location">
                            <span className="reservation-location-label">Parked vehicle</span>
                            <strong>{parkedVehicleLocation.name}</strong>
                            <small>{parkedVehicleLocation.destination}</small>
                        </div>
                        <label className="reservation-label" htmlFor="vehicle-number">Vehicle number</label>
                        <input id="vehicle-number" required value={vehicleNumber} onChange={(event) => { setVehicleNumber(event.target.value); setVehicleNumberError(""); }} placeholder="Enter vehicle number" className="scan-park-input mt-2" maxLength={20} />
                        {vehicleNumberError && <p className="user-alert user-alert-error mt-2" role="alert">{vehicleNumberError}</p>}
                        <dl className="reservation-details reservation-arrival-details">
                            <div>
                                <dt>Arrival date</dt>
                                <dd><input type="date" value={arrivalDate} min={getToday()} onChange={(event) => setArrivalDate(event.target.value)} /></dd>
                            </div>
                            <div className="reservation-time-range">
                                <label><span>From</span><input type="time" value={arrivalStart} onChange={(event) => setArrivalStart(event.target.value)} /></label>
                                <span aria-hidden="true">-</span>
                                <label><span>To</span><input type="time" value={arrivalEnd} onChange={(event) => setArrivalEnd(event.target.value)} /></label>
                            </div>
                            <div><dt>Duration</dt><dd>{durationMinutes ? formatDuration(durationMinutes) : "Choose a valid time range"}</dd></div>
                        </dl>
                        {selectedSpace && (myReservations.some((reservation) => getReservationSlotId(reservation) === String(selectedSpace._id)) || (isAdmin && selectedSpace.status === "occupied")) ? <button type="button" className="reservation-button reservation-release-button" disabled={isSaving} onClick={() => releaseSpace(selectedSpace)}>{isSaving ? "Releasing..." : isAdmin && !myReservations.some((reservation) => getReservationSlotId(reservation) === String(selectedSpace._id)) ? "Release occupied slot" : "Release my slot"}</button> : <button type="button" className="reservation-button" disabled={!selectedSpace || selectedSpace.status === "occupied" || isSaving} onClick={reserveSpace}>{isSaving ? "Reserving..." : isReserved ? "Space Reserved" : "Reserve this space"}</button>}
                        {isReserved && <p className="reservation-success" role="status">Your space {selectedSpace?.slot} is reserved. See you soon!</p>}
                        <p className="reservation-note">You can update or cancel your reservation before arrival.</p>
                    </aside>
                </div>
              </main>
              <Footer onNavigate={onNavigate} />
            </div>
        
    );
};

export default Reservation;
