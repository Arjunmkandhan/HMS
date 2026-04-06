// Admin dashboard helpers:
// These utility functions are reused by the page container and section components.

export function formatTimeLabel(timeValue) {
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
  return String(phoneValue || "").replace(/\D/g, "").slice(0, 10);
}

export function formatDisplayDate(dateValue) {
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
  if (Array.isArray(specialization)) {
    return specialization.join(", ");
  }

  return specialization || "General";
}

export function getDoctorDepartment(doctor) {
  if (!doctor) {
    return "";
  }

  return Array.isArray(doctor.specialization)
    ? doctor.specialization[0] || ""
    : doctor.specialization || "";
}

export function getPatientDisplayName(patient) {
  return patient?.name || patient?.fullName || "Unnamed patient";
}
