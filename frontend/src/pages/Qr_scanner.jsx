import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton";
import { apiRequest, getSession, saveVehicleLocation } from "../lib/api";
import {
  isValidVehicleNumber,
  normalizeVehicleNumber,
  vehicleNumberErrorMessage,
} from "../lib/vehicleNumber";

const QrScanner = ({ onNavigate, isDarkMode, onToggleTheme }) => {
  const session = getSession();
  const userId = session?._id;
  const token = session?.token;
  const [isAdmin, setIsAdmin] = useState(
    () =>
      String(session?.role || session?.userType || "").toLowerCase() ===
      "admin",
  );
  const showGenerator = isAdmin;
  const [qrText, setQrText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [scanResult, setScanResult] = useState("No QR scanned yet");
  const [sessionError, setSessionError] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [pendingSlot, setPendingSlot] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
  const [releaseTime, setReleaseTime] = useState("");
  const [releaseTimeError, setReleaseTimeError] = useState("");
  const [scanFeedback, setScanFeedback] = useState(null);
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
      .then((user) =>
        setIsAdmin(
          String(user.role || user.userType || "").toLowerCase() === "admin",
        ),
      )
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

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    await scanner.clear().catch(() => null);
  };

  const reserveScannedSlot = async (decodedText) => {
    if (scanProcessingRef.current) return;
    scanProcessingRef.current = true;
    setScanResult(decodedText);
    setReservationMessage("");
    setReservationError("");
    setScanFeedback(null);

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
        (space) =>
          String(space.slot).trim().toUpperCase() === slotName.toUpperCase(),
      );

      if (!parkingSpace) {
        throw new Error(`Parking slot ${slotName} was not found.`);
      }

      const reservations = await apiRequest(`/reservation/user/${userId}`);
      const isReservedByUser = reservations.some((reservation) => {
        const reservationSlotId =
          reservation.parkingSlot?._id || reservation.parkingSlot;
        return (
          String(reservationSlotId) === String(parkingSpace._id) &&
          ["pending", "confirmed", "checked-in"].includes(reservation.status)
        );
      });

      if (isReservedByUser) {
        await stopScanner();
        setScanFeedback({
          type: "reserved",
          title: "Slot already reserved",
          message: `Parking slot ${parkingSpace.slot} is already reserved for you. Please try another free slot.`,
        });
        return;
      }

      if (parkingSpace.status !== "available") {
        await stopScanner();
        setScanFeedback({
          type: "unavailable",
          title: "Slot unavailable",
          message: `Parking slot ${parkingSpace.slot} is currently occupied. Please try another free slot.`,
        });
        return;
      }

      setPendingSlot(parkingSpace);
      setVehicleNumber("");
      setVehicleNumberError("");
      setReleaseTime("");
      setReleaseTimeError("");
      await stopScanner();
    } catch (error) {
      await stopScanner();
      setReservationError(error.message);
      setScanFeedback({
        type: "error",
        title: "Unable to use this QR code",
        message: error.message,
      });
    } finally {
      scanProcessingRef.current = false;
    }
  };

  const confirmScannedReservation = async () => {
    if (!pendingSlot) return;
    const normalizedVehicleNumber = normalizeVehicleNumber(vehicleNumber);
    if (!normalizedVehicleNumber) {
      setVehicleNumberError(
        "Please enter your vehicle number before reserving.",
      );
      return;
    }
    if (!isValidVehicleNumber(normalizedVehicleNumber)) {
      setVehicleNumberError(vehicleNumberErrorMessage);
      return;
    }

    const endTime = new Date(releaseTime);
    if (
      !releaseTime ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= new Date()
    ) {
      setReleaseTimeError("Choose a release time in the future.");
      return;
    }

    setVehicleNumberError("");
    setReleaseTimeError("");
    setReservationError("");
    setReservationMessage("");
    try {
      const startTime = new Date();
      await apiRequest("/reservation", {
        method: "POST",
        body: JSON.stringify({
          parkingSlot: pendingSlot._id,
          source: "instant",
          vehicleDetails: { vehicleNumber: normalizedVehicleNumber },
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalAmount: 0,
        }),
      });

      if (
        Number.isFinite(Number(pendingSlot.latitude)) &&
        Number.isFinite(Number(pendingSlot.longitude))
      ) {
        saveVehicleLocation({
          lat: Number(pendingSlot.latitude),
          lng: Number(pendingSlot.longitude),
          label: `Reserved vehicle · ${pendingSlot.slot}`,
          slot: pendingSlot.slot,
          floor: `Level ${pendingSlot.floor}`,
        });
      }
      setReservationMessage(
        `Success! Parking slot ${pendingSlot.slot} is reserved for you.`,
      );
      setPendingSlot(null);
      setVehicleNumber("");
      setReleaseTime("");
    } catch (error) {
      setReservationError(error.message);
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
      },
    );

    scannerRef.current = scanner;
  };

  const closeScanFeedback = () => setScanFeedback(null);

  const retryScan = async () => {
    closeScanFeedback();
    await startScanner();
  };

  const QR_read_result = scanResult;

  return (
    <div className="scan-park-page min-h-screen">
      <Navbar
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />
      <main className="scan-park-main">
        <BackButton onNavigate={onNavigate} />
        {sessionError && (
          <p className="user-alert user-alert-error" role="alert">
            {sessionError}
          </p>
        )}
        <div className="scan-park-hero">
          <span className="scan-park-eyebrow">
            <span className="scan-park-live-dot" /> EasyPark QR Hub
          </span>
          <h1>
            Scan, park, <span>go.</span>
          </h1>
          <p>
            {showGenerator
              ? "Generate and share parking QR codes for your facility, or scan one to check a vehicle location in seconds."
              : "Scan your parking QR code in seconds to check in at your assigned parking space."}
          </p>
        </div>
        <div
          className={`scan-park-grid ${showGenerator ? "scan-park-grid-two" : "scan-park-grid-single"}`}
        >
          {showGenerator && (
            <section className="scan-park-card scan-generator-card">
              <div className="scan-card-heading">
                <span className="scan-card-icon" aria-hidden="true">
                  ⌘
                </span>
                <div>
                  <span className="scan-card-kicker">Create</span>
                  <h2>QR Code Generator</h2>
                </div>
              </div>
              <p className="scan-card-description">
                Add a link, reference, or parking detail to create a shareable
                QR code.
              </p>
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
              <div id="qrcode" className="scan-park-qr-preview">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Generated QR code"
                    className="mx-auto"
                  />
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
              <span
                className="scan-card-icon scan-card-icon-camera"
                aria-hidden="true"
              >
                ⌁
              </span>
              <div>
                <span className="scan-card-kicker">Arrive</span>
                <h2>QR Code Scanner</h2>
              </div>
            </div>
            <p className="scan-card-description">
              Use your device camera to reserve your assigned parking space.
            </p>
            <button
              onClick={startScanner}
              className="scan-park-button scan-park-button-primary scan-camera-button"
            >
              <span aria-hidden="true">◉</span> Start Camera
            </button>
            <div className="scan-camera-shell">
              <div className="scan-camera-corners" aria-hidden="true" />
              <div id={readerId} className="scan-reader" />
              <p className="scan-camera-hint">
                Position the QR code inside the frame
              </p>
            </div>
            <div className="scan-result" aria-live="polite">
              <span className="scan-result-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <p className="scan-result-label">Latest scan</p>
                <p className="scan-result-value">{QR_read_result}</p>
              </div>
            </div>
            {reservationMessage && (
              <p className="reservation-success mt-3" role="status">
                {reservationMessage}
              </p>
            )}
            {reservationError && (
              <p className="user-alert user-alert-error mt-3" role="alert">
                {reservationError}
              </p>
            )}
            {pendingSlot && (
              <div
                className="scan-reservation-modal-backdrop"
                role="presentation"
              >
                <section
                  className="scan-reservation-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="scan-reservation-title"
                >
                  <div className="scan-reservation-modal-heading">
                    <div>
                      <p className="reservation-label">
                        Slot scanned: {pendingSlot.slot}
                      </p>
                      <h2 id="scan-reservation-title">
                        Complete your parking stay
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="scan-modal-close"
                      onClick={() => setPendingSlot(null)}
                      aria-label="Close reservation form"
                    >
                      ×
                    </button>
                  </div>
                  <p className="scan-modal-description">
                    Your camera has been turned off. Tell us how long you need
                    this space.
                  </p>
                  <label
                    className="reservation-label"
                    htmlFor="scanned-vehicle-number"
                  >
                    Vehicle number
                  </label>
                  <input
                    id="scanned-vehicle-number"
                    autoFocus
                    required
                    value={vehicleNumber}
                    onChange={(event) => {
                      const normalizedValue = normalizeVehicleNumber(
                        event.target.value,
                      );
                      setVehicleNumber(normalizedValue);
                      setVehicleNumberError(
                        normalizedValue &&
                          !isValidVehicleNumber(normalizedValue)
                          ? vehicleNumberErrorMessage
                          : "",
                      );
                    }}
                    placeholder="Enter vehicle number"
                    className="scan-park-input mt-2"
                    maxLength={20}
                  />
                  {vehicleNumberError && (
                    <p
                      className="user-alert user-alert-error mt-2"
                      role="alert"
                    >
                      {vehicleNumberError}
                    </p>
                  )}
                  <label
                    className="reservation-label scan-release-label"
                    htmlFor="scanned-release-time"
                  >
                    Releasing time
                  </label>
                  <input
                    id="scanned-release-time"
                    type="datetime-local"
                    required
                    value={releaseTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(event) => {
                      setReleaseTime(event.target.value);
                      setReleaseTimeError("");
                    }}
                    className="scan-park-input mt-2"
                  />
                  {releaseTimeError && (
                    <p
                      className="user-alert user-alert-error mt-2"
                      role="alert"
                    >
                      {releaseTimeError}
                    </p>
                  )}
                  <button
                    type="button"
                    className="scan-park-button scan-park-button-primary mt-3 w-full"
                    onClick={confirmScannedReservation}
                  >
                    Reserve slot
                  </button>
                </section>
              </div>
            )}
            {scanFeedback && (
              <div
                className="scan-reservation-modal-backdrop"
                role="presentation"
              >
                <section
                  className={`scan-reservation-modal scan-feedback-modal scan-feedback-${scanFeedback.type || "error"}`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="scan-feedback-title"
                >
                  <div className="scan-reservation-modal-heading">
                    <div>
                      <span className="scan-feedback-icon" aria-hidden="true">
                        {scanFeedback.type === "reserved" ||
                        scanFeedback.type === "unavailable"
                          ? "!"
                          : "×"}
                      </span>
                      <p className="reservation-label">Camera stopped</p>
                      <h2 id="scan-feedback-title">{scanFeedback.title}</h2>
                    </div>
                    <button
                      type="button"
                      className="scan-modal-close"
                      onClick={closeScanFeedback}
                      aria-label="Close scan feedback"
                    >
                      ×
                    </button>
                  </div>
                  <p className="scan-modal-description">
                    {scanFeedback.message}
                  </p>
                  <div className="scan-feedback-actions">
                    <button
                      type="button"
                      className="scan-park-button scan-park-button-primary"
                      onClick={retryScan}
                    >
                      Start camera again
                    </button>
                    <button
                      type="button"
                      className="scan-park-button scan-park-button-secondary"
                      onClick={closeScanFeedback}
                    >
                      Close
                    </button>
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default QrScanner;
