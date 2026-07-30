import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const QrScanner = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    const userType = "staff"; // change to "staff" or "User"(another role) to show generator + scanner
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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="mx-auto max-w-7xl px-6 py-24">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-semibold text-slate-900">QR Tool</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                        Scan your parking QR code from a clean app page that matches the rest of the site.
                    </p>
                </div>

                <div className={`grid gap-8 ${showGenerator ? "lg:grid-cols-2" : "justify-items-center"}`}>
                    {showGenerator && (
                        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-2xl font-semibold text-slate-900">QR Code Generator</h2>
                            <input
                                value={qrText}
                                onChange={(event) => setQrText(event.target.value)}
                                placeholder="Enter text or URL"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400"
                            />
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={generateQR}
                                    className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
                                >
                                    Generate QR
                                </button>
                                <button
                                    onClick={downloadQR}
                                    className="rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
                                >
                                    Download QR
                                </button>
                            </div>
                            <div
                                id="qrcode"
                                className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-900"
                            >
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="Generated QR code" className="mx-auto" />
                                ) : (
                                    <p className="text-center text-slate-500">QR code preview will appear here.</p>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="w-full max-w-xl rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 className="mb-6 text-2xl font-semibold text-slate-900">QR Code Scanner</h2>
                        <button
                            onClick={startScanner}
                            className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
                        >
                            Start Camera
                        </button>
                        <div id={readerId} className="mt-6 rounded-3xl bg-slate-100 p-4 text-slate-900" />
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Result:</p>
                            <p className="mt-2 break-words">{QR_read_result}</p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default QrScanner;

