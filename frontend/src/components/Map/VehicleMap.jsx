import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./VehicleMap.css";

const DEFAULT_VEHICLE = { lat: 6.92708, lng: 79.86124, slot: "A-01", floor: "Level 1", label: "Main Building" };
const DEFAULT_USER = { lat: 6.92662, lng: 79.86008 };

const readSavedVehicle = () => {
    try {
        const saved = JSON.parse(localStorage.getItem("easypark-vehicle-location"));
        if (Number.isFinite(saved?.lat) && Number.isFinite(saved?.lng)) return { ...DEFAULT_VEHICLE, ...saved };
    } catch {
        // The tracker remains usable with its sample parking location.
    }
    return DEFAULT_VEHICLE;
};

const formatDistance = (meters) => meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
const formatDuration = (seconds) => `${Math.max(1, Math.round(seconds / 60))} min walk`;

const VehicleMap = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const [vehicle, setVehicle] = useState(readSavedVehicle);
    const [userLocation, setUserLocation] = useState(DEFAULT_USER);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
    const [status, setStatus] = useState("Ready to locate you");
    const [isLocating, setIsLocating] = useState(false);
    const [routeError, setRouteError] = useState("");

    const googleMapsEmbedUrl = useMemo(() => {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${vehicle.lat},${vehicle.lng}`;
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
            return `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(apiKey)}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=walking`;
        }
        return `https://www.google.com/maps?output=embed&f=d&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=w`;
    }, [userLocation, vehicle]);

    const getRoute = useCallback(async (start, end) => {
        setRouteError("");
        const key = import.meta.env.VITE_ORS_API_KEY;
        if (!key) {
            setRouteInfo({ distance: 0, duration: 0 });
            setRouteError("Add VITE_ORS_API_KEY to show route distance and walking time.");
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
            setRouteInfo({ distance: 0, duration: 0 });
            setRouteError("Route details are unavailable right now.");
        }
    }, []);

    const locateUser = useCallback(() => {
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
        const nextVehicle = { ...userLocation, slot: vehicle.slot, floor: vehicle.floor, label: "Saved vehicle location" };
        setVehicle(nextVehicle);
        localStorage.setItem("easypark-vehicle-location", JSON.stringify(nextVehicle));
        setStatus("Vehicle location saved on this device");
        getRoute(userLocation, nextVehicle);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []); // Initial preview route only.

    const hasRouteSummary = routeInfo.distance > 0;
    return (
        <div className="tracking-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="tracking-main">
                <section className="tracking-heading">
                    <span className="tracking-eyebrow"><i /> Vehicle tracker</span>
                    <h1>Find your way <span>back to your car.</span></h1>
                    <p>Your parking location stays saved on this device. Turn on location to receive a route from where you are now.</p>
                </section>

                <section className="tracking-layout" aria-label="Vehicle location and directions">
                    <div className="tracking-map-card">
                        <iframe className="tracking-map" title="Google Maps directions to your vehicle" src={googleMapsEmbedUrl} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                        <div className="tracking-map-key"><span><i className="tracking-key-user" /> Your live location</span><span><i className="tracking-key-vehicle" /> Destination: {vehicle.floor} · {vehicle.slot}</span></div>
                    </div>

                    <aside className="tracking-panel">
                        <div className="tracking-status"><span className="tracking-status-dot" /> {status}</div>
                        <div className="tracking-destination"><span>Parked at</span><strong>{vehicle.label}</strong><div className="tracking-parking-details"><div><small>Slot</small><b>{vehicle.slot}</b></div><div><small>Floor</small><b>{vehicle.floor}</b></div></div><small>{vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}</small></div>
                        <div className="tracking-stats">
                            <div><span>Distance</span><strong>{hasRouteSummary ? formatDistance(routeInfo.distance) : "—"}</strong></div>
                            <div><span>Walking time</span><strong>{hasRouteSummary ? formatDuration(routeInfo.duration) : "—"}</strong></div>
                        </div>
                        <button type="button" className="tracking-button" onClick={locateUser} disabled={isLocating}>{isLocating ? "Locating you…" : "Use my live location"}</button>
                        <button type="button" className="tracking-button tracking-button-secondary" onClick={saveCurrentPosition}>Save this as my vehicle location</button>
                        {routeError && <p className="tracking-help" role="status">{routeError}</p>}
                        <p className="tracking-help">Tip: after scanning at your bay, save the vehicle location once. It will be here when you return.</p>
                    </aside>
                </section>
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default VehicleMap;
