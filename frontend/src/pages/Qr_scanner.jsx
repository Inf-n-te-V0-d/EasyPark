import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton";
import { apiRequest, getSession, saveVehicleLocation } from "../lib/api";

const QrScanner = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const session = getSession();
    const userId = session?._id;
    const token = session?.token;
    const [isAdmin, setIsAdmin] = useState(() => String(session?.role || session?.userType || "").toLowerCase() === "admin");
    const showGenerator = isAdmin;
    const [qrText, setQrText] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [scanResult, setScanResult] = useState("No QR scanned yet");
    const [sessionError, setSessionError] = useState("");
    const [reservationMessage, setReservationMessage] = useState("");
    const [reservationError, setReservationError] = useState("");
    const scannerRef = useRef(null);
    const scanProcessingRef = useRef(false);
    const readerId = "reader";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => null);
            }
        };
    }, []);

    useEffect(() => {
        if (!userId || !token) return;

        apiRequest(`/users/${userId}`)
            .then((user) => setIsAdmin(String(user.role || user.userType || "").toLowerCase() === "admin"))
            .catch((error) => setSessionError(error.message));
    }, [token, userId]);

    const generateQR = async () => {
        if (!qrText.trim()) {
            alert("Enter text first");
            return;
        }

        try {
            const dataUrl = await QRCode.toDataURL(qrText, {
                width: 220,
                margin: 1,
            });
            setQrDataUrl(dataUrl);
        } catch (error) {
            console.error(error);
            alert("Unable to generate QR code.");
        }
    };

    const downloadQR = () => {
        if (!qrDataUrl) {
            alert("Generate QR first");
            return;
        }

        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = "QRCode.png";
        a.click();
    };

    const reserveScannedSlot = async (decodedText) => {
        if (scanProcessingRef.current) return;
        scanProcessingRef.current = true;
        setScanResult(decodedText);
        setReservationMessage("");
        setReservationError("");

        try {
            if (!userId || !token) {
                throw new Error("Please sign in before reserving a parking space.");
            }

            let scannedData = decodedText.trim();
            try {
                const parsedData = JSON.parse(scannedData);
                scannedData = parsedData.slot || "";
            } catch {
                // A plain QR value such as A-01 is also a valid slot name.
            }

            const slotName = String(scannedData).trim();
            if (!slotName) {
                throw new Error("This QR code does not contain a parking slot name.");
            }

            const parkingSpaces = await apiRequest("/parking");
            const parkingSpace = parkingSpaces.find(
                (space) => String(space.slot).trim().toUpperCase() === slotName.toUpperCase(),
            );

            if (!parkingSpace) {
                throw new Error(`Parking slot ${slotName} was not found.`);
            }

            const reservations = await apiRequest(`/reservation/user/${userId}`);
            const isReservedByUser = reservations.some((reservation) => {
                const reservationSlotId = reservation.parkingSlot?._id || reservation.parkingSlot;
                return String(reservationSlotId) === String(parkingSpace._id)
                    && ["pending", "confirmed", "checked-in"].includes(reservation.status);
            });

            if (isReservedByUser) {
                setReservationMessage(`Parking slot ${parkingSpace.slot} is yours.`);
                return;
            }

            if (parkingSpace.status !== "available") {
                throw new Error(`Parking slot ${parkingSpace.slot} is not available.`);
            }

            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
            await apiRequest("/reservation", {
                method: "POST",
                body: JSON.stringify({
                    parkingSlot: parkingSpace._id,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    totalAmount: 0,
                }),
            });

            if (Number.isFinite(Number(parkingSpace.latitude)) && Number.isFinite(Number(parkingSpace.longitude))) {
                saveVehicleLocation({
                    lat: Number(parkingSpace.latitude),
                    lng: Number(parkingSpace.longitude),
                    label: `Reserved vehicle · ${parkingSpace.slot}`,
                    slot: parkingSpace.slot,
                    floor: `Level ${parkingSpace.floor}`,
                });
            }
            setReservationMessage(`Success! Parking slot ${parkingSpace.slot} is reserved for you.`);
        } catch (error) {
            setReservationError(error.message);
        } finally {
            scanProcessingRef.current = false;
        }
    };

    const startScanner = async () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => null);
            scannerRef.current = null;
        }

        try {
            // Request camera access before starting the QR library so the browser
            // shows its permission prompt at the camera action.
            const permissionStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            });

            // html5-qrcode opens its own stream after permission is granted.
            permissionStream.getTracks().forEach((track) => track.stop());
        } catch (error) {
            console.error("Camera permission was not granted.", error);
            return;
        }

        const config = {
            fps: 10,
            qrbox: 250,
            videoConstraints: { facingMode: { ideal: "environment" } },
        };

        const scanner = new Html5QrcodeScanner(readerId, config, false);
        scanner.render(
            (decodedText) => {
                reserveScannedSlot(decodedText);
            },
            () => {
                // ignore scan errors
            }
        );

        scannerRef.current = scanner;
    };

    const QR_read_result = scanResult;

    const saveScannedVehicleLocation = () => {
        try {
            const location = JSON.parse(scanResult);
            if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
                throw new Error("Missing coordinates");
            }
            saveVehicleLocation({
                lat: location.lat,
                lng: location.lng,
                label: location.label || location.slot || "Scanned parking location",
                slot: location.slot || "—",
                floor: location.floor || location.level || "—",
            });
            onNavigate?.("tracking");
        } catch {
            alert("This QR code does not contain a parking location. Use JSON such as {\"lat\":6.9271,\"lng\":79.8612,\"slot\":\"A-01\",\"floor\":\"Level 1\"}.");
        }
    };

    return (
        <div className="scan-park-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="scan-park-main">
                <BackButton onNavigate={onNavigate} />
                {sessionError && <p className="user-alert user-alert-error" role="alert">{sessionError}</p>}
                <div className="scan-park-hero">
                    <span className="scan-park-eyebrow"><span className="scan-park-live-dot" /> EasyPark QR Hub</span>
                    <h1>Scan, park, <span>go.</span></h1>
                    <p>
                        {showGenerator
                            ? "Generate and share parking QR codes for your facility, or scan one to check a vehicle location in seconds."
                            : "Scan your parking QR code in seconds to check in and find your vehicle location when you are ready to leave."}
                    </p>
                </div>

                <div className={`scan-park-grid ${showGenerator ? "scan-park-grid-two" : "scan-park-grid-single"}`}>
                    {showGenerator && (
                        <section className="scan-park-card scan-generator-card">
                            <div className="scan-card-heading">
                                <span className="scan-card-icon" aria-hidden="true">⌘</span>
                                <div>
                                    <span className="scan-card-kicker">Create</span>
                                    <h2>QR Code Generator</h2>
                                </div>
                            </div>
                            <p className="scan-card-description">Add a link, reference, or parking detail to create a shareable QR code.</p>
                            <input
                                value={qrText}
                                onChange={(event) => setQrText(event.target.value)}
                                placeholder="Enter text or URL"
                                className="scan-park-input"
                            />
                            <div className="scan-park-actions">
                                <button
                                    onClick={generateQR}
                                    className="scan-park-button scan-park-button-primary"
                                >
                                    Generate QR
                                </button>
                                <button
                                    onClick={downloadQR}
                                    className="scan-park-button scan-park-button-secondary"
                                >
                                    Download QR
                                </button>
                            </div>
                            <div
                                id="qrcode"
                                className="scan-park-qr-preview"
                            >
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="Generated QR code" className="mx-auto" />
                                ) : (
                                    <div className="scan-park-empty-qr">
                                        <span aria-hidden="true">⌘</span>
                                        <p>QR code preview will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="scan-park-card scan-scanner-card">
                        <div className="scan-card-heading">
                            <span className="scan-card-icon scan-card-icon-camera" aria-hidden="true">⌁</span>
                            <div>
                                <span className="scan-card-kicker">Arrive</span>
                                <h2>QR Code Scanner</h2>
                            </div>
                        </div>
                        <p className="scan-card-description">Use your device camera to check in at your assigned parking space.</p>
                        <button
                            onClick={startScanner}
                            className="scan-park-button scan-park-button-primary scan-camera-button"
                        >
                            <span aria-hidden="true">◉</span> Start Camera
                        </button>
                        <div className="scan-camera-shell">
                            <div className="scan-camera-corners" aria-hidden="true" />
                            <div id={readerId} className="scan-reader" />
                            <p className="scan-camera-hint">Position the QR code inside the frame</p>
                        </div>
                        <div className="scan-result" aria-live="polite">
                            <span className="scan-result-icon" aria-hidden="true">✓</span>
                            <div>
                                <p className="scan-result-label">Latest scan</p>
                                <p className="scan-result-value">{QR_read_result}</p>
                            </div>
                        </div>
                        {reservationMessage && <p className="reservation-success mt-3" role="status">{reservationMessage}</p>}
                        {reservationError && <p className="user-alert user-alert-error mt-3" role="alert">{reservationError}</p>}
                        {scanResult !== "No QR scanned yet" && (
                            <button type="button" className="scan-park-button scan-park-button-secondary mt-3 w-full" onClick={saveScannedVehicleLocation}>
                                Save scan & view vehicle map
                            </button>
                        )}
                    </section>
                </div>
            </main>
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default QrScanner;

