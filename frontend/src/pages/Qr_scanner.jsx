import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const QrScanner = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const userType = "staff"; // change to "staff" or "user"(another role) to show generator + scanner
    const showGenerator = userType !== "user";
    const [qrText, setQrText] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [scanResult, setScanResult] = useState("No QR scanned yet");
    const scannerRef = useRef(null);
    const readerId = "reader";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => null);
            }
        };
    }, []);

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
                setScanResult(decodedText);
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
            localStorage.setItem("easypark-vehicle-location", JSON.stringify({
                lat: location.lat,
                lng: location.lng,
                label: location.label || location.slot || "Scanned parking location",
                slot: location.slot || "—",
                floor: location.floor || location.level || "—",
            }));
            onNavigate?.("tracking");
        } catch {
            alert("This QR code does not contain a parking location. Use JSON such as {\"lat\":6.9271,\"lng\":79.8612,\"slot\":\"A-01\",\"floor\":\"Level 1\"}.");
        }
    };

    return (
        <div className="scan-park-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="scan-park-main">
                <div className="scan-park-hero">
                    <span className="scan-park-eyebrow"><span className="scan-park-live-dot" /> EasyPark QR Hub</span>
                    <h1>Scan, park, <span>go.</span></h1>
                    <p>
                        Generate a parking QR code or scan one in seconds. Everything you need for a smoother arrival is right here.
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

