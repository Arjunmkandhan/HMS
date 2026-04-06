// Appointment slot utilities:
// This shared helper file contains all reusable logic for converting doctor availability
// into bookable time slots. Both the admin dashboard and patient dashboard depend on this
// file so they generate, validate, sort, and reserve appointment times in the same way.

// Pads a number to two digits so times like 9 become 09.
function pad(value) {
  return String(value).padStart(2, "0");
}

// Used when converting a chosen calendar date into a readable day name such as Monday.
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Converts a minute count back into a display string like `09:15 AM`.
// This is useful after generating slot intervals programmatically.
function formatMinutes(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${pad(hours12)}:${pad(minutes)} ${suffix}`;
}

// Time parsing:
// Accepts either a plain 24-hour value like `14:30` or a display label like `02:30 PM`
// and converts it into minutes from midnight for easy comparison and sorting.
export function parseTimeLabelToMinutes(timeValue) {
  if (!timeValue) {
    return null;
  }

  const normalized = String(timeValue).trim().toUpperCase();

  const directMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (directMatch) {
    return Number(directMatch[1]) * 60 + Number(directMatch[2]);
  }

  const amPmMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!amPmMatch) {
    return null;
  }

  let hours = Number(amPmMatch[1]);
  const minutes = Number(amPmMatch[2]);
  const suffix = amPmMatch[3];

  if (suffix === "PM" && hours !== 12) {
    hours += 12;
  }

  if (suffix === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

// Sorting helper:
// Combines the date and time into one numeric timestamp so appointment lists can be
// ordered consistently in dashboards.
export function getAppointmentSortValue(dateValue, timeValue) {
  const normalizedDate = String(dateValue || "1970-01-01").slice(0, 10);
  const minutes = parseTimeLabelToMinutes(timeValue);

  if (minutes === null) {
    return new Date(`${normalizedDate}T00:00:00`).getTime();
  }

  return new Date(`${normalizedDate}T00:00:00`).getTime() + minutes * 60 * 1000;
}

// Expands a list of slot ranges into 15-minute appointment options.
// Example: `09:00 AM - 10:00 AM` becomes `09:00 AM`, `09:15 AM`, `09:30 AM`, `09:45 AM`.
export function expandDoctorTimeSlots(timeSlots) {
  if (!Array.isArray(timeSlots)) {
    return [];
  }

  const expandedSlots = [];
  const seenSlots = new Set();

  timeSlots.forEach((slot) => {
    const [startLabel, endLabel] = String(slot || "")
      .split("-")
      .map((value) => value.trim())
      .filter(Boolean);

    const startMinutes = parseTimeLabelToMinutes(startLabel);
    const endMinutes = parseTimeLabelToMinutes(endLabel);

    if (startMinutes === null) {
      return;
    }

    // If the end time is missing or invalid, treat the value as a single exact slot.
    if (endMinutes === null || endMinutes <= startMinutes) {
      const singleSlot = formatMinutes(startMinutes);
      if (!seenSlots.has(singleSlot)) {
        seenSlots.add(singleSlot);
        expandedSlots.push(singleSlot);
      }
      return;
    }

    for (let cursor = startMinutes; cursor < endMinutes; cursor += 15) {
      const nextSlot = formatMinutes(cursor);
      if (!seenSlots.has(nextSlot)) {
        seenSlots.add(nextSlot);
        expandedSlots.push(nextSlot);
      }
    }
  });

  return expandedSlots;
}

// Converts a date string like `2026-04-06` into a day name used by doctor availability logic.
export function getDayNameFromDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const resolvedDate = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(resolvedDate.getTime())) {
    return "";
  }

  return DAY_NAMES[resolvedDate.getDay()] || "";
}

// Normalizes doctor slot data:
// Some records may store slots as raw strings and others as structured objects.
// This helper converts both shapes into one consistent object format.
export function normalizeDoctorTimeSlots(timeSlots) {
  if (!Array.isArray(timeSlots)) {
    return [];
  }

  return timeSlots
    .map((slot) => {
      if (typeof slot === "object" && slot !== null) {
        const day = String(slot.day || "").trim();
        const start = String(slot.start || "").trim();
        const end = String(slot.end || "").trim();
        const label =
          slot.label || (start && end ? `${start} - ${end}` : String(slot.value || "").trim());

        if (!day || !label) {
          return null;
        }

        return {
          day,
          start,
          end,
          label,
        };
      }

      const normalizedSlot = String(slot || "").trim();
      if (!normalizedSlot.includes(":")) {
        return null;
      }

      return {
        day: "",
        start: "",
        end: "",
        label: normalizedSlot,
      };
    })
    .filter(Boolean);
}

// Day-aware slot expansion:
// This version is used in the patient and admin booking forms. It filters a doctor's
// saved time ranges by the selected day, then returns detailed objects for each free slot.
export function expandDoctorTimeSlotsForDay(timeSlots, dayName) {
  const normalizedSlots = normalizeDoctorTimeSlots(timeSlots);
  const expandedSlots = [];
  const seenSlots = new Set();

  normalizedSlots
    .filter((slot) => !slot.day || slot.day === dayName)
    .forEach((slot) => {
      const [startLabel, endLabel] = String(slot.label || "")
        .split("-")
        .map((value) => value.trim())
        .filter(Boolean);

      const startMinutes = parseTimeLabelToMinutes(startLabel);
      const endMinutes = parseTimeLabelToMinutes(endLabel);

      if (startMinutes === null) {
        return;
      }

      if (endMinutes === null || endMinutes <= startMinutes) {
        const singleSlot = formatMinutes(startMinutes);
        if (!seenSlots.has(singleSlot)) {
          seenSlots.add(singleSlot);
          expandedSlots.push({
            day: slot.day || dayName,
            time: singleSlot,
            display: `${slot.day || dayName} • ${singleSlot}`,
          });
        }
        return;
      }

      for (let cursor = startMinutes; cursor < endMinutes; cursor += 15) {
        const nextSlot = formatMinutes(cursor);
        if (!seenSlots.has(nextSlot)) {
          seenSlots.add(nextSlot);
          expandedSlots.push({
            day: slot.day || dayName,
            time: nextSlot,
            display: `${slot.day || dayName} • ${nextSlot}`,
          });
        }
      }
    });

  return expandedSlots;
}

// Availability validation:
// Checks whether a selected appointment date falls within the doctor's allowed schedule.
// The current app supports comma-separated day lists and simple day ranges.
export function isDateWithinAvailability(dateValue, availabilityValue) {
  if (!dateValue || !availabilityValue) {
    return true;
  }

  const resolvedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(resolvedDate.getTime())) {
    return false;
  }

  const normalizedAvailability = String(availabilityValue).trim();

  if (normalizedAvailability.includes(",")) {
    const allowedDays = normalizedAvailability
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    return allowedDays.includes(DAY_NAMES[resolvedDate.getDay()].toLowerCase());
  }

  const [fromDay, toDay] = normalizedAvailability
    .split("-")
    .map((value) => value.trim())
    .filter(Boolean);

  const fromIndex = DAY_NAMES.findIndex(
    (day) => day.toLowerCase() === String(fromDay || "").toLowerCase()
  );
  const toIndex = DAY_NAMES.findIndex(
    (day) => day.toLowerCase() === String(toDay || "").toLowerCase()
  );

  if (fromIndex === -1 || toIndex === -1) {
    return true;
  }

  const selectedDayIndex = resolvedDate.getDay();

  if (fromIndex <= toIndex) {
    return selectedDayIndex >= fromIndex && selectedDayIndex <= toIndex;
  }

  return selectedDayIndex >= fromIndex || selectedDayIndex <= toIndex;
}

// Deterministic appointment ID:
// The app uses a predictable document ID built from doctor, date, and time so one slot
// can only be booked once. Both admin and patient booking flows rely on this.
export function buildAppointmentSlotId(doctorId, dateValue, timeValue) {
  const normalizedDate = String(dateValue || "").replace(/-/g, "");
  const minutes = parseTimeLabelToMinutes(timeValue);
  const normalizedTime =
    minutes === null ? String(timeValue || "").replace(/\s+/g, "-") : String(minutes).padStart(4, "0");

  return `${doctorId}_${normalizedDate}_${normalizedTime}`;
}
