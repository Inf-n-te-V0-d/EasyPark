import Navbar from "../components/Navbar/Navbar";

const QrScanner = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onNavigate={onNavigate} />
            <main className="mx-auto max-w-6xl px-6 py-24 text-center">
                <h1 className="text-4xl font-semibold text-slate-900">QR Scanner</h1>
                <p className="mt-4 text-lg text-slate-600">Scan your parking QR code to access the scanner page.</p>
                <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                    <p className="text-slate-500">This is the QR scanner page. Replace this section with your actual scanner component or camera UI.</p>
                </div>
            </main>
        </div>
    );
};

export default QrScanner;
