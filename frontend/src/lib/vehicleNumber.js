const sriLankanVehicleNumberPattern = /^[A-Z]{2,3}-\d{4}$/;

export const normalizeVehicleNumber = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

export const isValidVehicleNumber = (value) =>
  sriLankanVehicleNumberPattern.test(normalizeVehicleNumber(value));

export const vehicleNumberErrorMessage =
  "Enter a valid Sri Lankan vehicle number (for example, ABC-1234).";