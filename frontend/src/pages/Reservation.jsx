import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton";
import { apiRequest, getSession, saveVehicleLocation } from "../lib/api";
import {
    isValidVehicleNumber,
    normalizeVehicleNumber,
    vehicleNumberErrorMessage,
} from "../lib/vehicleNumber";

const parkedVehicleLocation = {
  name: "My parked vehicle",
  destination: "6.9271,79.8612",
  link: "https://www.google.com/maps/dir/?api=1&destination=6.9271,79.8612&travelmode=driving",
};

const getReservationSlotId = (reservation) =>
  String(reservation.parkingSlot?._id || reservation.parkingSlot || "");
const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
const formatReservationDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const formatReservationTime = (value) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
const vehicleTypeOptions = [
  { value: "motorcycle", label: "🏍 Motorcycle" },
  { value: "three_wheel", label: "🛺 Three Wheel" },
  { value: "light", label: "🚗 Light Vehicle" },
  { value: "heavy", label: "🚌 Heavy Vehicle" },
];

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hour${hours === 1 ? "" : "s"}${remainingMinutes ? ` ${remainingMinutes} minutes` : ""}`;
};
const emptySlotForm = {
  slot: "",
  floor: "1",
  latitude: "6.9271",
  longitude: "79.8612",
  vehicleType: "light",
  status: "available",
};

const Reservation = ({ onNavigate, isDarkMode, onToggleTheme }) => {
  const currentUser = getSession();
  const currentUserId = currentUser?._id;
  const [spaces, setSpaces] = useState([]);
  const [verifiedRole, setVerifiedRole] = useState("");
  const isAdmin = verifiedRole === "admin";
  const [myReservations, setMyReservations] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isReserved, setIsReserved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("light");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
  const [arrivalDate, setArrivalDate] = useState(getToday);
  const [arrivalStart, setArrivalStart] = useState("09:00");
  const [arrivalEnd, setArrivalEnd] = useState("11:00");
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [isManagingSlot, setIsManagingSlot] = useState(false);
  const [adminAction, setAdminAction] = useState("edit");
  const [adminMessage, setAdminMessage] = useState("");
  const [activeFloor, setActiveFloor] = useState(1);
  //const startDateTime = new Date(`${arrivalDate}T${arrivalStart}`);
  //const endDateTime = new Date(`${arrivalDate}T${arrivalEnd}`);
  //const durationMinutes = Number.isFinite(startDateTime.getTime()) && Number.isFinite(endDateTime.getTime()) && endDateTime > startDateTime

  const startDateTime = new Date(`${arrivalDate}T${arrivalStart}`);
  const endDateTime = new Date(`${arrivalDate}T${arrivalEnd}`);
  const durationMinutes =
    startDateTime.getTime() &&
    endDateTime.getTime() &&
    endDateTime > startDateTime
      ? Math.round((endDateTime - startDateTime) / 60000)
      : 0;
  const floors = [
    ...new Set(
      spaces.map((space) => Number(space.floor)).filter(Number.isFinite),
    ),
  ].sort((a, b) => a - b);
  const floorSpaces = spaces.filter(
    (space) =>
      Number(space.floor) === activeFloor &&
      (space.vehicleType || "light") === vehicleType,
  );
  const now = new Date();
  const activeReservations = myReservations.filter((reservation) => {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    return start <= now && now < end;
  });
  const upcomingReservations = myReservations.filter(
    (reservation) => new Date(reservation.startTime) > now,
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Use "auto" if you don't want animation
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadParkingData = async (initialLoad = false) => {
      try {
        const [parking, reservations, profile] = await Promise.all([
          apiRequest("/parking"),
          currentUserId
            ? apiRequest(`/reservation/user/${currentUserId}`)
            : Promise.resolve([]),
          initialLoad && currentUserId
            ? apiRequest(`/users/${currentUserId}`)
            : Promise.resolve(null),
        ]);

        if (!active) return;

        const currentReservations = reservations.filter((reservation) =>
          ["pending", "confirmed", "checked-in"].includes(reservation.status),
        );

        setSpaces(parking);
        setMyReservations(currentReservations);

        if (profile) {
          setVerifiedRole(profile?.role === "admin" ? "admin" : "");
        }

        // Keep the currently selected slot synchronized
        setSelectedSpace((currentSelected) => {
          if (!currentSelected) {
            const ownedSlotIds = new Set(
              currentReservations
                .filter((reservation) => {
                  const start = new Date(reservation.startTime);
                  const end = new Date(reservation.endTime);
                  const now = new Date();
                  return start <= now && now < end;
                })
                .map(getReservationSlotId),
            );

            return (
              parking.find((space) => ownedSlotIds.has(String(space._id))) ||
              parking.find((space) => space.status === "available") ||
              parking[0] ||
              null
            );
          }

          const updatedSelectedSpace = parking.find(
            (space) => String(space._id) === String(currentSelected._id),
          );

          return updatedSelectedSpace || currentSelected;
        });

        if (initialLoad && parking.length > 0) {
          const ownedSlotIds = new Set(
            currentReservations
              .filter((reservation) => {
                const start = new Date(reservation.startTime);
                const end = new Date(reservation.endTime);
                const now = new Date();
                return start <= now && now < end;
              })
              .map(getReservationSlotId),
          );

          const initialSpace =
            parking.find((space) => ownedSlotIds.has(String(space._id))) ||
            parking.find((space) => space.status === "available") ||
            parking[0] ||
            null;

          if (initialSpace) {
            setSelectedSpace(initialSpace);
            setActiveFloor(Number(initialSpace.floor));
          }
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active && initialLoad) {
          setIsLoading(false);
        }
      }
    };

    loadParkingData(true);
    const interval = setInterval(() => {
      loadParkingData(false);
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentUserId]);
  const copySlotToForm = (space) => {
    setSlotForm({
      slot: space?.slot || "",
      floor: String(space?.floor || 1),
      latitude: String(space?.latitude || ""),
      longitude: String(space?.longitude || ""),
      vehicleType: space?.vehicleType || "light",
      status: space?.status || "available",
    });
  };

  const ensureAdmin = () => {
    if (isAdmin) return true;
    setError("Only administrators can manage parking slots.");
    return false;
  };

  const chooseSpace = (space) => {
    const isMine = activeReservations.some(
      (reservation) => getReservationSlotId(reservation) === String(space._id),
    );
    if (space.status === "occupied" && !isMine && !isAdmin) return;
    setSelectedSpace(space);
    setActiveFloor(Number(space.floor));
    if (isAdmin && !isCreatingSlot) copySlotToForm(space);
    setIsReserved(false);
    setError("");
  };

  const chooseVehicleType = ({ target }) => {
    setVehicleType(target.value);
    setSelectedSpace(null);
    setIsReserved(false);
    setError("");
  };

  const updateSlotForm = ({ target }) => {
    setSlotForm((current) => ({ ...current, [target.name]: target.value }));
    setAdminMessage("");
  };

  const openSlotManager = () => {
    if (!ensureAdmin()) return;
    if (selectedSpace) {
      copySlotToForm(selectedSpace);
      setIsCreatingSlot(false);
      setAdminAction("edit");
    } else {
      setSlotForm({ ...emptySlotForm, floor: String(activeFloor) });
      setIsCreatingSlot(true);
      setAdminAction("add");
    }
    setAdminMessage("");
    setIsManagingSlot(true);
  };

  const chooseAdminAction = ({ target }) => {
    if (!ensureAdmin()) return;
    const nextAction = target.value;
    setAdminAction(nextAction);
    setAdminMessage("");
    if (nextAction === "add") {
      setIsCreatingSlot(true);
      setSlotForm({ ...emptySlotForm, floor: String(activeFloor) });
    } else if (selectedSpace) {
      setIsCreatingSlot(false);
      copySlotToForm(selectedSpace);
    }
  };

  const saveSlot = async (event) => {
    event.preventDefault();
    if (!ensureAdmin()) return;
    setAdminMessage("");
    try {
      const savedSlot = await apiRequest(
        isCreatingSlot ? "/parking" : `/parking/${selectedSpace?._id}`,
        {
          method: isCreatingSlot ? "POST" : "PUT",
          body: JSON.stringify(slotForm),
        },
      );
      setSpaces((current) =>
        isCreatingSlot
          ? [...current, savedSlot]
          : current.map((space) =>
              space._id === savedSlot._id ? savedSlot : space,
            ),
      );
      setSelectedSpace(savedSlot);
      setActiveFloor(Number(savedSlot.floor));
      copySlotToForm(savedSlot);
      setIsCreatingSlot(false);
      setIsManagingSlot(false);
      setAdminMessage(
        `Slot ${savedSlot.slot} ${isCreatingSlot ? "added" : "updated"}.`,
      );
    } catch (requestError) {
      setAdminMessage(requestError.message);
    }
  };

  const deleteSlot = async () => {
    if (!ensureAdmin()) return;
    if (
      !selectedSpace ||
      isCreatingSlot ||
      !window.confirm(`Delete parking slot ${selectedSpace.slot}?`)
    )
      return;
    setAdminMessage("");
    try {
      await apiRequest(`/parking/${selectedSpace._id}`, { method: "DELETE" });
      setSpaces((current) =>
        current.filter((space) => space._id !== selectedSpace._id),
      );
      setSelectedSpace(null);
      setIsManagingSlot(false);
      setAdminMessage(`Slot ${selectedSpace.slot} deleted.`);
    } catch (requestError) {
      setAdminMessage(requestError.message);
    }
  };

  const handleFindVehicle = () => onNavigate?.("tracking");

  const releaseSpace = async (space) => {
    const user = getSession();
    if (!user?._id) {
      setError("Please sign in before releasing a parking space.");
      onNavigate?.("login");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await apiRequest(`/parking/${space._id}/release`, { method: "POST" });
      setSpaces((current) =>
        current.map((item) =>
          item._id === space._id
            ? { ...item, status: "available", vehicleNumber: "" }
            : item,
        ),
      );
      setMyReservations((current) =>
        current.filter((reservation) => {
          const reservationIsActive =
            new Date(reservation.startTime) <= new Date() &&
            new Date() < new Date(reservation.endTime);
          return (
            getReservationSlotId(reservation) !== String(space._id) ||
            !reservationIsActive
          );
        }),
      );
      setSelectedSpace((current) =>
        current?._id === space._id
          ? { ...current, status: "available", vehicleNumber: "" }
          : current,
      );
      setIsReserved(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const reserveSpace = async () => {
    const user = getSession();
    if (!user?._id) {
      setError("Please sign in before reserving a parking space.");
      onNavigate?.("login");
      return;
    }
    if (!selectedSpace) return;
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
    setVehicleNumberError("");
    if (!durationMinutes) {
      setError("Please choose a valid arrival time range.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const createdReservation = await apiRequest("/reservation", {
        method: "POST",
        body: JSON.stringify({
          user: user._id,
          parkingSlot: selectedSpace._id,
          vehicleDetails: {
            vehicleNumber: normalizedVehicleNumber,
            vehicleType,
          },
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalAmount: 0,
        }),
      });
      setMyReservations((current) => [createdReservation, ...current]);
      if (
        Number.isFinite(Number(selectedSpace.latitude)) &&
        Number.isFinite(Number(selectedSpace.longitude))
      ) {
        saveVehicleLocation({
          lat: Number(selectedSpace.latitude),
          lng: Number(selectedSpace.longitude),
          label: `Reserved vehicle · ${selectedSpace.slot}`,
          slot: selectedSpace.slot,
          floor: `Level ${selectedSpace.floor}`,
        });
      }
      setIsReserved(true);

      // Check whether the reservation is currently active
      const now = new Date();

      const reservationIsActive = startDateTime <= now && endDateTime > now;

      if (reservationIsActive) {
        setSpaces((current) =>
          current.map((space) =>
            space._id === selectedSpace._id
              ? {
                  ...space,
                  status: "occupied",
                  vehicleNumber: normalizedVehicleNumber,
                }
              : space,
          ),
        );
        setSelectedSpace((current) =>
          current
            ? {
                ...current,
                status: "occupied",
                vehicleNumber: normalizedVehicleNumber,
              }
            : current,
        );
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="reservation-page min-h-screen">
      <Navbar
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />
      <main className="reservation-main">
        <BackButton onNavigate={onNavigate} />
        {error && (
          <p className="user-alert user-alert-error" role="alert">
            {error}
          </p>
        )}
        <header className="reservation-hero">
          <span className="reservation-eyebrow">Reserve your space</span>
          <h1>
            Your parking spot, <span>saved ahead.</span>
          </h1>
          <p>
            Choose an available spot before you arrive and make parking one less
            thing to think about.
          </p>
        </header>

        <div className="reservation-layout">
          <section
            className="reservation-card reservation-map-card"
            aria-labelledby="parking-map-title"
          >
            <div className="reservation-card-header">
              <div>
                <p className="reservation-label">Parking map</p>
                <h2 id="parking-map-title">
                  Level {activeFloor} · Main Building
                </h2>
              </div>
              <span className="reservation-availability">
                <i />{" "}
                {
                  floorSpaces.filter((space) => space.status === "available")
                    .length
                }{" "}
                spaces available
              </span>
            </div>
            <label className="reservation-label" htmlFor="vehicle-type">
              Vehicle type
            </label>
            <select
              id="vehicle-type"
              value={vehicleType}
              onChange={chooseVehicleType}
              className="reservation-vehicle-type"
            >
              {vehicleTypeOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {floors.length > 0 && (
              <div
                className="parking-floor-selector"
                role="tablist"
                aria-label="Choose parking floor"
              >
                {floors.map((floor) => (
                  <button
                    type="button"
                    key={floor}
                    role="tab"
                    aria-selected={activeFloor === floor}
                    className={activeFloor === floor ? "is-active" : ""}
                    onClick={() => {
                      setActiveFloor(floor);
                      setSelectedSpace((current) =>
                        Number(current?.floor) === floor ? current : null,
                      );
                    }}
                  >
                    Level {floor}
                  </button>
                ))}
              </div>
            )}
            <div className="reservation-legend" aria-label="Parking map legend">
              <span>
                <i className="available" /> Available
              </span>
              <span>
                <i className="selected" /> Selected
              </span>
              <span>
                <i className="reserved" /> My reservation
              </span>
              <span>
                <i className="occupied" /> Occupied
              </span>
            </div>
            <div className="parking-lane" aria-hidden="true">
              <span>Entry</span>
              <div />
              <span>Exit</span>
            </div>
            <div
              className="parking-spaces"
              role="list"
              aria-label="Available parking spaces"
            >
              {isLoading && (
                <p className="reservation-map-tip">
                  Loading live parking availability...
                </p>
              )}
              {!isLoading && !floorSpaces.length && (
                <p className="reservation-map-tip parking-floor-empty">
                  No parking slots have been added to this level yet.
                </p>
              )}
              {!isLoading &&
                floorSpaces.map((space) => {
                  const selected = selectedSpace?._id === space._id;
                  const activeReservation = activeReservations.find(
                    (reservation) =>
                      getReservationSlotId(reservation) === String(space._id),
                  );
                  const isMine = Boolean(activeReservation);
                  const bookedVehicleNumber =
                    space.vehicleNumber ||
                    activeReservation?.vehicleDetails?.vehicleNumber;
                  return (
                    <button
                      key={space._id}
                      type="button"
                      role="listitem"
                      disabled={
                        space.status === "occupied" && !isMine && !isAdmin
                      }
                      onClick={() => chooseSpace(space)}
                      className={`parking-space ${space.status} ${isMine ? "reserved-by-me" : ""} ${isAdmin && space.status === "occupied" ? "admin-manageable" : ""} ${selected ? "is-selected" : ""}`}
                      aria-label={`${space.slot}, ${space.status === "occupied" ? `Booked, vehicle ${space.vehicleNumber || "number unavailable"}` : isMine ? "reserved by you" : selected ? "selected" : "available"}`}
                    >
                      {space.status === "occupied" ? (
                        <>
                          <span>Booked</span>
                          <b>{space.slot}</b>
                          <small>
                            {bookedVehicleNumber ||
                              "Vehicle number unavailable"}
                          </small>
                        </>
                      ) : (
                        <>
                          <span>{isMine ? "★" : "P"}</span>
                          <b>{space.slot}</b>
                        </>
                      )}
                    </button>
                  );
                })}
            </div>
            <p className="reservation-map-tip">
              Choose a floor, then tap an available space to select it.
            </p>
            <div className="reservation-map-actions">
              <button
                type="button"
                className="reservation-button reservation-button-secondary"
                onClick={handleFindVehicle}
              >
                Go to my vehicle
              </button>
            </div>
          </section>

          <aside
            className="reservation-card reservation-summary"
            aria-labelledby="booking-title"
          >
            <p className="reservation-label">Your reservation</p>
            <h2 id="booking-title">Review your spot</h2>
            <div className="selected-space-display">
              <span>Selected space</span>
              <strong>{selectedSpace?.slot || "No space selected"}</strong>
              <em>
                Level {selectedSpace?.floor || activeFloor} · Main Building
              </em>
            </div>
            <div className="reservation-vehicle-location">
              <span className="reservation-location-label">Parked vehicle</span>
              <strong>{parkedVehicleLocation.name}</strong>
              <small>{parkedVehicleLocation.destination}</small>
            </div>
            <label className="reservation-label" htmlFor="vehicle-number">
              Vehicle number
            </label>
            <input
              id="vehicle-number"
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
            <dl className="reservation-details reservation-arrival-details">
              <div>
                <dt>Arrival date</dt>
                <dd className="reservation-date-selector">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="3" />
                    <path d="M8 3v4m8-4v4M3 10h18" />
                  </svg>
                  <input
                    type="date"
                    value={arrivalDate}
                    min={getToday()}
                    onChange={(event) => setArrivalDate(event.target.value)}
                  />
                </dd>
              </div>
              <div className="reservation-time-range">
                <label className="reservation-time-selector">
                  <span>From</span>
                  <div>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    <input
                      type="time"
                      value={arrivalStart}
                      onChange={(event) => setArrivalStart(event.target.value)}
                    />
                  </div>
                </label>
                <span aria-hidden="true">-</span>
                <label className="reservation-time-selector">
                  <span>To</span>
                  <div>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    <input
                      type="time"
                      value={arrivalEnd}
                      onChange={(event) => setArrivalEnd(event.target.value)}
                    />
                  </div>
                </label>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>
                  {durationMinutes
                    ? formatDuration(durationMinutes)
                    : "Choose a valid time range"}
                </dd>
              </div>
            </dl>
            {selectedSpace &&
            (activeReservations.some(
              (reservation) =>
                getReservationSlotId(reservation) === String(selectedSpace._id),
            ) ||
              (isAdmin && selectedSpace.status === "occupied")) ? (
              <button
                type="button"
                className="reservation-button reservation-release-button"
                disabled={isSaving}
                onClick={() => releaseSpace(selectedSpace)}
              >
                {isSaving
                  ? "Releasing..."
                  : isAdmin &&
                      !activeReservations.some(
                        (reservation) =>
                          getReservationSlotId(reservation) ===
                          String(selectedSpace._id),
                      )
                    ? "Release occupied slot"
                    : "Release my slot"}
              </button>
            ) : (
              <button
                type="button"
                className="reservation-button"
                disabled={
                  !selectedSpace ||
                  selectedSpace.status === "occupied" ||
                  isSaving
                }
                onClick={reserveSpace}
              >
                {isSaving
                  ? "Reserving..."
                  : isReserved
                    ? "Space Reserved"
                    : "Reserve this space"}
              </button>
            )}
            {isReserved && (
              <p className="reservation-success" role="status">
                Your space {selectedSpace?.slot} is reserved. See you soon!
              </p>
            )}
            <p className="reservation-note">
              You can update or cancel your reservation before arrival.
            </p>
            {isAdmin && (
              <section
                className="slot-admin-tools"
                aria-labelledby="slot-admin-title"
              >
                <div className="slot-admin-heading">
                  <div>
                    <span>Administrator</span>
                    <h3 id="slot-admin-title">Manage parking slots</h3>
                  </div>
                  <button type="button" onClick={openSlotManager}>
                    Manage slots
                  </button>
                </div>
                {adminMessage && (
                  <p className="slot-admin-message" role="status">
                    {adminMessage}
                  </p>
                )}
                {isManagingSlot && (
                  <div className="slot-admin-panel">
                    <label className="slot-admin-action">
                      Choose action
                      <select value={adminAction} onChange={chooseAdminAction}>
                        <option value="add">Add a slot</option>
                        <option value="edit" disabled={!selectedSpace}>
                          Edit selected slot
                        </option>
                        <option value="delete" disabled={!selectedSpace}>
                          Delete selected slot
                        </option>
                      </select>
                    </label>
                    {adminAction !== "delete" ? (
                      <form className="slot-admin-form" onSubmit={saveSlot}>
                        <label>
                          Slot name
                          <input
                            required
                            name="slot"
                            value={slotForm.slot}
                            onChange={updateSlotForm}
                            placeholder="A-05"
                          />
                        </label>
                        <label>
                          Floor
                          <input
                            required
                            min="1"
                            name="floor"
                            type="number"
                            value={slotForm.floor}
                            onChange={updateSlotForm}
                          />
                        </label>
                        <label>
                          Latitude
                          <input
                            required
                            name="latitude"
                            type="number"
                            step="any"
                            value={slotForm.latitude}
                            onChange={updateSlotForm}
                          />
                        </label>
                        <label>
                          Longitude
                          <input
                            required
                            name="longitude"
                            type="number"
                            step="any"
                            value={slotForm.longitude}
                            onChange={updateSlotForm}
                          />
                        </label>
                        <label>
                          Vehicle type
                          <select
                            name="vehicleType"
                            value={slotForm.vehicleType}
                            onChange={updateSlotForm}
                          >
                            {vehicleTypeOptions.map((option) => (
                              <option value={option.value} key={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Status
                          <select
                            name="status"
                            value={slotForm.status}
                            onChange={updateSlotForm}
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                          </select>
                        </label>
                        <div className="slot-admin-actions">
                          <button type="submit">
                            {isCreatingSlot ? "Create slot" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManagingSlot(false);
                              setIsCreatingSlot(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="slot-admin-delete-panel">
                        <p>
                          Delete <b>{selectedSpace?.slot}</b> from Level{" "}
                          {selectedSpace?.floor}? This cannot be undone.
                        </p>
                        <div className="slot-admin-actions">
                          <button
                            type="button"
                            className="slot-admin-delete"
                            onClick={deleteSlot}
                          >
                            Delete slot
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsManagingSlot(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                      </div>
                    )}
                  </section>
                )}
                    </aside>
                </div>
            <div className="upcoming-reservation-list">
              {upcomingReservations.map((reservation) => (
                <article className="upcoming-reservation" key={reservation._id}>
                  <div>
                    <strong>
                      Slot {reservation.parkingSlot?.slot || "Unavailable"}
                    </strong>
                    <span>
                      Level {reservation.parkingSlot?.floor || "Unavailable"}
                    </span>
                  </div>
                  <div>
                    <strong>
                      {formatReservationDate(reservation.startTime)}
                    </strong>
                    <span>
                      {formatReservationTime(reservation.startTime)} -{" "}
                      {formatReservationTime(reservation.endTime)}
                    </span>
                  </div>
                  <div>
                    <strong>
                      {reservation.vehicleDetails?.vehicleNumber ||
                        "Unavailable"}
                    </strong>
                    <span>Vehicle number</span>
                  </div>
                  <span className="upcoming-reservation-status">Upcoming</span>
                </article>
              ))}
            </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default Reservation;
