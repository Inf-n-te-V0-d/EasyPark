import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { apiRequest, clearSession, getSession } from "../lib/api";

const User = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const session = getSession();
    const userId = session?._id;
    const token = session?.token;
    const [profile, setProfile] = useState(session);
    const [reservations, setReservations] = useState([]);
    const [parking, setParking] = useState([]);
    const [resetRequests, setResetRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const isAdmin = profile?.role === "admin";

    useEffect(() => {
        if (!userId || !token) {
            onNavigate?.("login");
            return;
        }

        Promise.all([
            apiRequest(`/users/${userId}`),
            apiRequest(`/reservation/user/${userId}`),
            apiRequest("/parking"),
        ])
            .then(async ([user, userReservations, spaces]) => {
                setProfile({ ...user, token });
                setReservations(userReservations);
                setParking(spaces);
                if (user.role === "admin") {
                    setResetRequests(await apiRequest("/users/password-reset/requests"));
                }
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, [onNavigate, token, userId]);

    const releaseSlot = async (slotId) => {
        setMessage("");
        setError("");
        try {
            await apiRequest(`/parking/${slotId}/release`, { method: "POST" });
            setParking((current) => current.map((space) => space._id === slotId ? { ...space, status: "available" } : space));
            setReservations((current) => current.map((reservation) => reservation.parkingSlot?._id === slotId ? { ...reservation, status: "cancelled" } : reservation));
            setMessage("The parking slot is available again.");
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const markOtpSent = async (requestId) => {
        setMessage("");
        setError("");
        try {
            await apiRequest(`/users/password-reset/requests/${requestId}/sent`, { method: "POST" });
            setResetRequests((current) => current.filter((request) => request._id !== requestId));
            setMessage("OTP marked as sent and removed from the request queue.");
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const signOut = () => {
        clearSession();
        onNavigate?.("home");
    };

    if (!session?.token) return null;

    return (
        <div className="user-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="user-main">
                <header className="user-hero">
                    <span className="reservation-eyebrow">EasyPark account</span>
                    <h1>Welcome back, <span>{profile?.name || "driver"}.</span></h1>
                    <p>Keep your details close and manage every parking reservation from one place.</p>
                </header>

                {error && <p className="user-alert user-alert-error" role="alert">{error}</p>}
                {message && <p className="user-alert user-alert-success" role="status">{message}</p>}

                <div className="user-grid">
                    <section className="user-card user-profile-card" aria-labelledby="profile-title">
                        <div className="user-card-heading"><div><p className="reservation-label">Profile</p><h2 id="profile-title">Your details</h2></div><span className="user-role">{profile?.role || "user"}</span></div>
                        <dl className="user-details"><div><dt>Name</dt><dd>{profile?.name || "-"}</dd></div><div><dt>Email</dt><dd>{profile?.email || "-"}</dd></div><div><dt>Telephone</dt><dd>{profile?.telephone || "-"}</dd></div><div><dt>Vehicle</dt><dd>{profile?.vehicleDetails?.prefix || "-"} {profile?.vehicleDetails?.suffix || ""}</dd></div></dl>
                        <button type="button" className="reservation-button reservation-button-secondary" onClick={signOut}>Sign out</button>
                    </section>

                    <section className="user-card" aria-labelledby="reservations-title">
                        <div className="user-card-heading"><div><p className="reservation-label">Bookings</p><h2 id="reservations-title">Your reservations</h2></div><span className="user-count">{reservations.filter((item) => item.status !== "cancelled").length}</span></div>
                        {loading && <p className="user-empty">Loading your parking activity...</p>}
                        {!loading && !reservations.length && <p className="user-empty">No reservations yet. Choose a space to get started.</p>}
                        <div className="user-list">{reservations.map((reservation) => <div className="user-list-item" key={reservation._id}><div><strong>{reservation.parkingSlot?.slot || "Parking slot"}</strong><span>{reservation.status} · {new Date(reservation.startTime).toLocaleString()}</span></div>{reservation.status !== "cancelled" && <button type="button" className="release-button" onClick={() => releaseSlot(reservation.parkingSlot?._id)}>Release slot</button>}</div>)}</div>
                    </section>
                </div>

                {isAdmin && <div className="user-admin-panels">
                    <section className="user-card user-admin-card" aria-labelledby="admin-title"><div className="user-card-heading"><div><p className="reservation-label">Administration</p><h2 id="admin-title">Parking control</h2></div><span className="user-role">all slots</span></div><div className="user-list">{parking.filter((space) => space.status === "occupied").map((space) => <div className="user-list-item" key={space._id}><div><strong>{space.slot}</strong><span>Level {space.floor} · occupied</span></div><button type="button" className="release-button" onClick={() => releaseSlot(space._id)}>Release slot</button></div>)}</div>{!parking.some((space) => space.status === "occupied") && <p className="user-empty">All parking slots are available.</p>}</section>
                    <section className="user-card user-admin-card" aria-labelledby="reset-requests-title"><div className="user-card-heading"><div><p className="reservation-label">Manual delivery</p><h2 id="reset-requests-title">Password reset requests</h2></div><span className="user-count">{resetRequests.length}</span></div>{!resetRequests.length && <p className="user-empty">No password reset requests.</p>}<div className="user-list">{resetRequests.map((request) => <div className="user-reset-request" key={request._id}><div><strong>{request.user?.name || "Unknown user"}</strong><span>{request.user?.email || "-"} · {request.contact}</span><small>OTP: <b>{request.otp}</b> · Expires {new Date(request.expiresAt).toLocaleTimeString()}</small></div><button type="button" className="release-button user-sent-button" onClick={() => markOtpSent(request._id)}>OTP sent</button></div>)}</div></section>
                </div>}
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default User;