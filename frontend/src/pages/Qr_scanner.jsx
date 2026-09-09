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
  const [vehicleType, setVehicleType] = useState("light");
  const [releaseTime, setReleaseTime] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
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
                setReservationMessage(`Parking slot ${parkingSpace.slot}: ${parkingSpace.status}.`);
                return;
            }

            if (parkingSpace.status !== "available") {
                throw new Error(`Parking slot ${parkingSpace.slot} is not available.`);
            }

            setPendingSlot(parkingSpace);
            setVehicleNumber("");
        } catch (error) {
            setReservationError(error.message);
        } finally {
            scanProcessingRef.current = false;
        }
    };

    const confirmScannedReservation = async () => {
        if (!pendingSlot) return;
        const normalizedVehicleNumber = normalizeVehicleNumber(vehicleNumber);
        if (!normalizedVehicleNumber) {
            setVehicleNumberError("Please enter your vehicle number before reserving.");
            return;
        }
        if (!isValidVehicleNumber(normalizedVehicleNumber)) {
            setVehicleNumberError(vehicleNumberErrorMessage);
            return;
        }

        setVehicleNumberError("");
        setReservationError("");
        setReservationMessage("");
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
            await apiRequest("/reservation", {
                method: "POST",
                body: JSON.stringify({
                    parkingSlot: pendingSlot._id,
                    vehicleDetails: { vehicleNumber: normalizedVehicleNumber },
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    totalAmount: 0,
                }),
            });

            if (Number.isFinite(Number(pendingSlot.latitude)) && Number.isFinite(Number(pendingSlot.longitude))) {
                saveVehicleLocation({
                    lat: Number(pendingSlot.latitude),
                    lng: Number(pendingSlot.longitude),
                    label: `Reserved vehicle · ${pendingSlot.slot}`,
                    slot: pendingSlot.slot,
                    floor: `Level ${pendingSlot.floor}`,
                });
            }
            setReservationMessage(`Success! Parking slot ${pendingSlot.slot} is reserved for you.`);
            setPendingSlot(null);
            setVehicleNumber("");
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
            }
        );
      });

      if (isReservedByUser) {
        setReservationMessage(
          `Parking slot ${parkingSpace.slot}: ${parkingSpace.status}.`,
        );
        return;
      }

      if (parkingSpace.status !== "available") {
        throw new Error(`Parking slot ${parkingSpace.slot} is not available.`);
      }

      setPendingSlot(parkingSpace);
      setVehicleNumber("");
      setVehicleType(parkingSpace.vehicleType || "light");
      const defaultReleaseTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      defaultReleaseTime.setSeconds(0, 0);
      setReleaseTime(defaultReleaseTime.toISOString().slice(0, 16));
    } catch (error) {
      setReservationError(error.message);
    } finally {
      scanProcessingRef.current = false;
    }
  };

  const confirmScannedReservation = async () => {
    if (!pendingSlot) return;
    if (!vehicleNumber.trim()) {
      setVehicleNumberError(
        "Please enter your vehicle number before reserving.",
      );
      return;
    }
    const endTime = new Date(releaseTime);
    if (
      !releaseTime ||
      Number.isNaN(endTime.getTime()) ||
      endTime <= new Date()
    ) {
      setReservationError("Please choose a release time in the future.");
      return;
    }

    setVehicleNumberError("");
    setReservationError("");
    setReservationMessage("");
    try {
      await apiRequest("/reservation", {
        method: "POST",
        body: JSON.stringify({
          parkingSlot: pendingSlot._id,
          source: "instant",
          vehicleDetails: {
            vehicleNumber: vehicleNumber.trim(),
            vehicleType,
          },
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

    return (
        <div className="scan-park-page min-h-screen">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <main className="scan-park-main">
                <BackButton onNavigate={onNavigate} />
                {sessionError && <p className="user-alert user-alert-error" role="alert">{sessionError}</p>}
                <div className="scan-park-hero">
                    <span className="scan-park-eyebrow"><span className="scan-park-live-dot" /> EasyPark QR Hub</span>
                    <h1>Scan, park, <span>go.</span></h1>
                    <p>{showGenerator ? "Generate and share parking QR codes for your facility, or scan one to check a vehicle location in seconds." : "Scan your parking QR code in seconds to check in at your assigned parking space."}</p>
                </div>
                <div className={`scan-park-grid ${showGenerator ? "scan-park-grid-two" : "scan-park-grid-single"}`}>
                    {showGenerator && (
                        <section className="scan-park-card scan-generator-card">
                            <div className="scan-card-heading"><span className="scan-card-icon" aria-hidden="true">⌘</span><div><span className="scan-card-kicker">Create</span><h2>QR Code Generator</h2></div></div>
                            <p className="scan-card-description">Add a link, reference, or parking detail to create a shareable QR code.</p>
                            <input value={qrText} onChange={(event) => setQrText(event.target.value)} placeholder="Enter text or URL" className="scan-park-input" />
                            <div className="scan-park-actions"><button onClick={generateQR} className="scan-park-button scan-park-button-primary">Generate QR</button><button onClick={downloadQR} className="scan-park-button scan-park-button-secondary">Download QR</button></div>
                            <div id="qrcode" className="scan-park-qr-preview">{qrDataUrl ? <img src={qrDataUrl} alt="Generated QR code" className="mx-auto" /> : <div className="scan-park-empty-qr"><span aria-hidden="true">⌘</span><p>QR code preview will appear here.</p></div>}</div>
                        </section>
                    )}
                    <section className="scan-park-card scan-scanner-card">
                        <div className="scan-card-heading"><span className="scan-card-icon scan-card-icon-camera" aria-hidden="true">⌁</span><div><span className="scan-card-kicker">Arrive</span><h2>QR Code Scanner</h2></div></div>
                        <p className="scan-card-description">Use your device camera to reserve your assigned parking space.</p>
                        <button onClick={startScanner} className="scan-park-button scan-park-button-primary scan-camera-button"><span aria-hidden="true">◉</span> Start Camera</button>
                        <div className="scan-camera-shell"><div className="scan-camera-corners" aria-hidden="true" /><div id={readerId} className="scan-reader" /><p className="scan-camera-hint">Position the QR code inside the frame</p></div>
                        <div className="scan-result" aria-live="polite"><span className="scan-result-icon" aria-hidden="true">✓</span><div><p className="scan-result-label">Latest scan</p><p className="scan-result-value">{QR_read_result}</p></div></div>
                        {reservationMessage && <p className="reservation-success mt-3" role="status">{reservationMessage}</p>}
                        {reservationError && <p className="user-alert user-alert-error mt-3" role="alert">{reservationError}</p>}
                        <div className="scan-qr-reservation-form">
                            <p className="reservation-label">{pendingSlot ? `Slot scanned: ${pendingSlot.slot}` : "Scan an available slot to reserve"}</p>
                            <label className="reservation-label" htmlFor="scanned-vehicle-number">Vehicle number</label>
                            <input id="scanned-vehicle-number" autoFocus required value={vehicleNumber} onChange={(event) => { const normalizedValue = normalizeVehicleNumber(event.target.value); setVehicleNumber(normalizedValue); setVehicleNumberError(normalizedValue && !isValidVehicleNumber(normalizedValue) ? vehicleNumberErrorMessage : ""); }} placeholder="Enter vehicle number" className="scan-park-input mt-2" maxLength={20} />
                            {vehicleNumberError && <p className="user-alert user-alert-error mt-2" role="alert">{vehicleNumberError}</p>}
                            <button type="button" className="scan-park-button scan-park-button-primary mt-3 w-full" onClick={confirmScannedReservation} disabled={!pendingSlot}>
                                Reserve slot
                            </button>
                        </div>
                    </section>
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
            <div className="scan-qr-reservation-form">
              <p className="reservation-label">
                {pendingSlot
                  ? `Slot scanned: ${pendingSlot.slot}`
                  : "Scan an available slot to reserve"}
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
                  setVehicleNumber(event.target.value);
                  setVehicleNumberError("");
                }}
                placeholder="Enter vehicle number"
                className="scan-park-input mt-2"
                maxLength={20}
              />
              {vehicleNumberError && (
                <p className="user-alert user-alert-error mt-2" role="alert">
                  {vehicleNumberError}
                </p>
              )}
              <label
                className="reservation-label mt-3"
                htmlFor="scanned-vehicle-type"
              >
                Vehicle type
              </label>
              <select
                id="scanned-vehicle-type"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                className="scan-park-input mt-2"
              >
                <option value="motorcycle">Motorcycle</option>
                <option value="three_wheel">Three wheel</option>
                <option value="light">Light vehicle</option>
                <option value="heavy">Heavy vehicle</option>
              </select>
              <label
                className="reservation-label mt-3"
                htmlFor="scanned-release-time"
              >
                Release / end time
              </label>
              <input
                id="scanned-release-time"
                type="datetime-local"
                required
                value={releaseTime}
                onChange={(event) => setReleaseTime(event.target.value)}
                className="scan-park-input mt-2"
              />
              <button
                type="button"
                className="scan-park-button scan-park-button-primary mt-3 w-full"
                onClick={confirmScannedReservation}
                disabled={!pendingSlot}
              >
                Start instant parking
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default QrScanner;
