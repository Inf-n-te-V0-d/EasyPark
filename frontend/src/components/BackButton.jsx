const BackButton = ({ onNavigate }) => (
    <button type="button" className="page-back-button" onClick={() => onNavigate?.("home")}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6M8 12h10" /></svg>
        Back
    </button>
);

export default BackButton;