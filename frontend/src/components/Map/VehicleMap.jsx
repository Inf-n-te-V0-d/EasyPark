import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackButton from "../BackButton";
import { apiRequest, saveVehicleLocation, getSession } from "../../lib/api";
import "./VehicleMap.css";

const DEFAULT_USER = { lat: 6.92662, lng: 79.86008 };

const getReservedVehicles = (reservations) => reservations
    .filter((reservation) => ["pending", "confirmed", "checked-in"].includes(reservation.status))
    .map((reservation) => {
        const slot = reservation.parkingSlot;
        const lat = Number(slot?.latitude);
        const lng = Number(slot?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
            id: reservation._id,
            lat,
            lng,
            slot: slot.slot,
            floor: `Level ${slot.floor}`,
            label: `Reserved vehicle · ${slot.slot}`,
        };
    })
    .filter(Boolean);

const formatDistance = (meters) => meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
const formatDuration = (seconds) => {
    const totalMinutes = Math.max(1, Math.round(seconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} h ${minutes} min walk` : `${minutes} min walk`;
};
const estimateWalkingRoute = (start, end) => {
    const earthRadius = 6371000;
    const latitudeDelta = (end.lat - start.lat) * Math.PI / 180;
    const longitudeDelta = (end.lng - start.lng) * Math.PI / 180;
    const distance = 2 * earthRadius * Math.asin(Math.sqrt(
        Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2,
    ));
    return { distance: distance * 1.25, duration: (distance * 1.25) / 1.35 };
};

const VehicleMap = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const userId = getSession()?._id;
    const [vehicles, setVehicles] = useState([]);
    const [vehicle, setVehicle] = useState(null);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(Boolean(userId));
    const [userLocation, setUserLocation] = useState(DEFAULT_USER);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
    const [status, setStatus] = useState("Ready to locate you");
    const [isLocating, setIsLocating] = useState(false);
    const [routeError, setRouteError] = useState("");
    const liveNavigationUrl = vehicle ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${vehicle.lat},${vehicle.lng}`)}&travelmode=walking` : "#";

    const googleMapsEmbedUrl = useMemo(() => {
        if (!vehicle) return "about:blank";
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${vehicle.lat},${vehicle.lng}`;
        return `https://www.google.com/maps?output=embed&f=d&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=w`;
    }, [userLocation, vehicle]);

    const getRoute = useCallback(async (start, end) => {
        setRouteError("");
        const key = import.meta.env.VITE_ORS_API_KEY;
        if (!key) {
            setRouteInfo(estimateWalkingRoute(start, end));
            setRouteError("Showing an approximate walking estimate.");
            return;
        }

        try {
            const response = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
                method: "POST",
                headers: { Authorization: key, "Content-Type": "application/json" },
                body: JSON.stringify({ coordinates: [[start.lng, start.lat], [end.lng, end.lat]] }),
            });
            if (!response.ok) throw new Error("ORS route request failed");
            const data = await response.json();
            const feature = data.features?.[0];
            if (!feature) throw new Error("No route was returned");
            setRouteInfo(feature.properties.summary);
        } catch {
            setRouteInfo(estimateWalkingRoute(start, end));
            setRouteError("Route service unavailable; showing an approximate walking estimate.");
        }
    }, []);

    useEffect(() => {
        if (!userId) return;

        apiRequest(`/reservation/user/${userId}`)
            .then((reservations) => {
                const reservedVehicles = getReservedVehicles(reservations);
                setVehicles(reservedVehicles);
                setVehicle(reservedVehicles[0] || null);
                if (reservedVehicles[0]) getRoute(DEFAULT_USER, reservedVehicles[0]);
            })
            .catch(() => setVehicles([]))
            .finally(() => setIsLoadingVehicles(false));
    }, [getRoute, userId]);

    const locateUser = useCallback(() => {
        if (!vehicle) return;
        if (!navigator.geolocation) {
            setStatus("Location services are not supported by this browser");
            return;
        }
        setIsLocating(true);
        setStatus("Requesting your live location…");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(location);
                setStatus("Live location updated");
                setIsLocating(false);
                getRoute(location, vehicle);
            },
            () => {
                setStatus("Couldn’t access your location — using the nearby preview point");
                setIsLocating(false);
                getRoute(userLocation, vehicle);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
        );
    }, [getRoute, userLocation, vehicle]);

    const saveCurrentPosition = () => {
        if (!vehicle) return;
        const nextVehicle = saveVehicleLocation({ ...vehicle, ...userLocation, label: "Saved vehicle location" });
        setVehicles((current) => current.map((item) => item.id === vehicle.id ? nextVehicle : item));
        setVehicle(nextVehicle);
        setStatus("Vehicle location saved on this device");
        getRoute(userLocation, nextVehicle);
    };

    const selectVehicle = (nextVehicle) => {
        setVehicle(nextVehicle);
        setStatus(`Showing ${nextVehicle.label || "selected vehicle"}`);
        getRoute(userLocation, nextVehicle);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []); // Initial preview route only.

    const hasRouteSummary = routeInfo.distance > 0;
    const liveNavigationUrl = vehicle
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${vehicle.lat},${vehicle.lng}`)}&travelmode=walking`
        : "#";
    return (
        <div className="tracking-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="tracking-main">
                <BackButton onNavigate={onNavigate} />
                <section className="tracking-heading">
                    <span className="tracking-eyebrow"><i /> Vehicle tracker</span>
                    <h1>Find your way <span>back to your car.</span></h1>
                    <p>Your parking location stays saved on this device. Turn on location to receive a route from where you are now.</p>
                </section>

                <section className="tracking-layout" aria-label="Vehicle location and directions">
                    <div className="tracking-map-card">
                        <iframe className="tracking-map" title="Google Maps directions to your vehicle" src={googleMapsEmbedUrl} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                        {vehicle && <div className="tracking-map-key"><span><i className="tracking-key-user" /> Your live location</span><span><i className="tracking-key-vehicle" /> Destination: {vehicle.floor} · {vehicle.slot}</span></div>}
                    </div>

                    <aside className="tracking-panel">
                        {vehicles.length > 1 && <div className="tracking-vehicle-list" aria-label="Reserved vehicles"><span>Your reserved vehicles</span>{vehicles.map((savedVehicle, index) => <button type="button" key={savedVehicle.id} className={savedVehicle.id === vehicle?.id ? "is-active" : ""} onClick={() => selectVehicle(savedVehicle)}>{savedVehicle.label || `Vehicle ${index + 1}`} · {savedVehicle.slot}</button>)}</div>}
                        {isLoadingVehicles && <p className="tracking-help">Loading your reserved vehicles…</p>}
                        {!isLoadingVehicles && !vehicle && <p className="tracking-help">No active reserved vehicles found. Reserve a parking slot to see it here.</p>}
                        {vehicle && <>
                        <div className="tracking-status"><span className="tracking-status-dot" /> {status}</div>
                        {vehicle && <><div className="tracking-destination"><span>Parked at</span><strong>{vehicle.label}</strong><div className="tracking-parking-details"><div><small>Slot</small><b>{vehicle.slot}</b></div><div><small>Floor</small><b>{vehicle.floor}</b></div></div><small>{vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}</small></div>
                        <div className="tracking-stats">
                            <div><span>Distance</span><strong>{hasRouteSummary ? formatDistance(routeInfo.distance) : "—"}</strong></div>
                            <div><span>Walking time</span><strong>{hasRouteSummary ? formatDuration(routeInfo.duration) : "—"}</strong></div>
                        </div>
                        <button type="button" className="tracking-button" onClick={locateUser} disabled={isLocating}>{isLocating ? "Locating you…" : "Use my live location"}</button>
                        <a className="tracking-button tracking-navigation-button" href={liveNavigationUrl} target="_blank" rel="noreferrer" aria-label="Open live navigation to your vehicle">Open live navigation</a>
                        <button type="button" className="tracking-button tracking-button-secondary" onClick={saveCurrentPosition}>Save this as my vehicle location</button></>}
                        {routeError && <p className="tracking-help" role="status">{routeError}</p>}
                        <p className="tracking-help">Tip: after scanning at your bay, save the vehicle location once. It will be here when you return.</p>
                        </>}
                    </aside>
                </section>
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default VehicleMap;
