import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar/Navbar";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>
);

const QrScanner = ({ onNavigate }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const isScanningRef = useRef(false);
  const [status, setStatus] = useState("idle");
  const [scanResult, setScanResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    stopCamera();
    setScanResult("");
    setErrorMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("Camera access is not available in this browser. Please use a secure HTTPS connection and a supported browser.");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!("BarcodeDetector" in window)) {
        setStatus("unsupported");
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      isScanningRef.current = true;
      setStatus("scanning");

      const detectCode = async () => {
        if (!isScanningRef.current || !videoRef.current) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const result = codes.find((code) => code.rawValue)?.rawValue;
          if (result) {
            setScanResult(result);
            setStatus("success");
            stopCamera();
            return;
          }
        } catch {
          // A frame can be skipped while the camera is still preparing.
        }

        frameRef.current = requestAnimationFrame(detectCode);
      };

      frameRef.current = requestAnimationFrame(detectCode);
    } catch (error) {
      setStatus("error");
      if (error?.name === "NotAllowedError") {
        setErrorMessage("Camera permission was denied. Allow camera access in your browser, then try again.");
      } else if (error?.name === "NotFoundError") {
        setErrorMessage("No camera was found on this device.");
      } else {
        setErrorMessage("We could not start the camera. Please try again.");
      }
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const scannerIsOpen = status !== "idle";
  const cameraIsOpen = ["requesting", "scanning", "unsupported", "success"].includes(status);

  const closeScanner = () => {
    stopCamera();
    setStatus("idle");
    setScanResult("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar onNavigate={onNavigate} />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28 lg:px-10">
        <button type="button" onClick={() => onNavigate?.("home")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] transition hover:text-[#16A34A]"><BackIcon /> Back to home</button>
        <div className="mt-7 grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16A34A]">QR parking scanner</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] text-[#0F172A] sm:text-5xl">Scan your slot. <span className="text-[#22C55E]">We will remember it.</span></h1>
            <p className="mt-5 max-w-lg leading-8 text-[#475569]">Point your camera at the QR code on your parking slot. EasyPark records your location and entry time, so finding your vehicle and managing your parking is simple.</p>
            <div className="mt-8 space-y-4">
              {[["1", "Scan the QR code", "Use the code displayed at your parking space."], ["2", "Save your location", "Your floor, row, and parking slot are securely recorded."], ["3", "Find your way back", "View your saved location when you are ready to leave."]].map(([number, title, text]) => <div key={number} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#DCFCE7] text-sm font-bold text-[#16A34A]">{number}</span><div><p className="font-semibold text-[#0F172A]">{title}</p><p className="mt-0.5 text-sm leading-6 text-[#64748B]">{text}</p></div></div>)}
            </div>
          </div>

          <section className="relative overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-[#0F172A] p-7 text-center shadow-[0_20px_55px_rgba(15,23,42,0.1)] sm:p-10" aria-label="QR scan preview">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#22C55E] opacity-20 blur-3xl" />
            <div className="relative mx-auto grid aspect-square max-w-[280px] place-items-center rounded-[28px] border border-white/15 bg-white/5 p-7">
              <div className="qr-artwork relative grid h-full w-full place-items-center overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
                <img src="/Logo_icon.png" alt="EasyPark QR parking logo" className="h-full w-full object-contain" />
                <span className="absolute left-3 top-3 h-9 w-9 rounded-tl-lg border-l-2 border-t-2 border-[#22C55E]" />
                <span className="absolute right-3 top-3 h-9 w-9 rounded-tr-lg border-r-2 border-t-2 border-[#22C55E]" />
                <span className="absolute bottom-3 left-3 h-9 w-9 rounded-bl-lg border-b-2 border-l-2 border-[#22C55E]" />
                <span className="absolute bottom-3 right-3 h-9 w-9 rounded-br-lg border-b-2 border-r-2 border-[#22C55E]" />
                <span className="qr-artwork-line absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#22C55E] shadow-[0_0_14px_#22C55E]" />
              </div>
              <span className="absolute -bottom-4 rounded-full bg-[#22C55E] px-4 py-2 text-xs font-semibold text-white shadow-lg">Ready to scan</span>
            </div>
            <h2 className="relative mt-10 text-2xl font-semibold text-white">Scan your parking QR code</h2>
            <p className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">Open the camera when you are at your parking space and point it at the QR code.</p>
            <button type="button" onClick={startScanner} className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3.5 font-semibold text-white transition hover:bg-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#BBF7D0]"><CameraIcon /> Scan QR code</button>
          </section>
        </div>
      </main>

      {scannerIsOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0F172A]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="QR code camera scanner">
        <section className="w-full max-w-md rounded-[24px] bg-white p-4 shadow-2xl sm:p-5">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-[#16A34A]">Camera scanner</p><h2 className="text-xl font-bold text-[#0F172A]">Align the QR code in the frame</h2></div><button type="button" onClick={closeScanner} className="grid h-10 w-10 place-items-center rounded-full border border-[#E2E8F0] text-lg text-[#475569] transition hover:bg-[#F8FAFC]" aria-label="Close scanner">×</button></div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#0F172A]">
            <video ref={videoRef} className={`h-full w-full object-cover ${cameraIsOpen ? "block" : "hidden"}`} playsInline muted />
            {!cameraIsOpen && <div className="grid h-full place-items-center px-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[#86EFAC]"><CameraIcon /></span><p className="mt-4 font-semibold text-white">Camera is ready when you are</p></div></div>}
            {status === "scanning" && <><div className="absolute inset-[14%] rounded-2xl border-2 border-[#86EFAC] shadow-[0_0_0_999px_rgba(15,23,42,0.28)]" /><span className="scanner-line absolute inset-x-[14%] top-[14%] h-0.5 bg-[#22C55E] shadow-[0_0_14px_#22C55E]" /></>}
            {status === "requesting" && <div className="absolute inset-0 grid place-items-center bg-[#0F172A]/70 text-center"><p className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white">Opening your camera...</p></div>}
            {status === "unsupported" && <div className="absolute inset-x-4 bottom-4 rounded-xl bg-amber-100 p-3 text-left text-sm text-amber-900">Camera is open, but this browser cannot read QR codes. Please use the latest Chrome or Edge for scanning.</div>}
            {status === "success" && <div className="absolute inset-0 grid place-items-center bg-[#0F172A]/85 p-6 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#22C55E] text-2xl text-white">✓</span><h2 className="mt-4 text-xl font-semibold text-white">QR code scanned</h2><p className="mt-2 break-all text-sm text-slate-300">{scanResult}</p></div></div>}
          </div>
          <div className="mt-4 flex gap-3"><button type="button" onClick={startScanner} className="flex-1 rounded-xl bg-[#22C55E] px-5 py-3 font-semibold text-white transition hover:bg-[#16A34A]">Restart scanner</button><button type="button" onClick={closeScanner} className="rounded-xl border border-[#E2E8F0] px-5 py-3 font-semibold text-[#475569]">Close</button></div>
          {status === "error" && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{errorMessage}</p>}
        </section>
      </div>}
    </div>
  );
};

export default QrScanner;
