// Admin dashboard helpers:
// These utility functions are reused by the page container and section components.

export function formatTimeLabel(timeValue) {
  // formatTimeLabel:
  // Converts the browser's `HH:MM` time input format into a more human-readable `hh:mm AM/PM` label.
  // This is mainly used when the admin creates doctor consultation slots and the app needs a display
  // label that can later be shown inside dropdowns and slot chips.
  if (!timeValue) {
    return "";
  }

  const [rawHours, rawMinutes] = timeValue.split(":");
  const hours = Number(rawHours);
  const minutes = rawMinutes || "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;

  return `${String(normalizedHours).padStart(2, "0")}:${minutes} ${suffix}`;
}

export function normalizePhoneNumber(phoneValue) {
  // normalizePhoneNumber:
  // Strips everything except digits and limits the result to 10 characters.
  // This keeps phone values clean even if the user types spaces, dashes, or other formatting symbols.
  return String(phoneValue || "").replace(/\D/g, "").slice(0, 10);
}

export function formatDisplayDate(dateValue) {
  // formatDisplayDate:
  // Converts stored date strings into a consistent `day month year` format for the admin UI.
  // If a date is missing, the function returns a readable fallback so tables do not show blank cells.
  if (!dateValue) {
    return "Not set";
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSpecialization(specialization) {
  // formatSpecialization:
  // Doctor specializations may be stored either as one string or an array of strings.
  // This helper normalizes both shapes into one comma-separated label that can be shown in tables.
  if (Array.isArray(specialization)) {
    return specialization.join(", ");
  }

  return specialization || "General";
}

export function getDoctorDepartment(doctor) {
  // getDoctorDepartment:
  // The admin appointment form needs one department string for the selected doctor.
  // This helper extracts the first specialization if the doctor has an array, or returns the direct string otherwise.
  if (!doctor) {
    return "";
  }

  return Array.isArray(doctor.specialization)
    ? doctor.specialization[0] || ""
    : doctor.specialization || "";
}

export function getPatientDisplayName(patient) {
  // getPatientDisplayName:
  // Patient records in this project may use either `name` or `fullName`.
  // This helper hides that storage difference from the UI and always returns one label-ready string.
  return patient?.name || patient?.fullName || "Unnamed patient";
}
