// Admin dashboard constants:
// This file collects static data and option lists used across the admin dashboard.

// initialBeds:
// Demo/local bed data used by the admin bed-management tab.
// These records are stored in component state rather than Firestore, so the admin can still
// demonstrate bed assignment and occupancy changes even without a backend collection for beds.
export const initialBeds = [
  { id: "BED-01", ward: "ICU", patient: "Kabir Patel", status: "Occupied", bedType: "Critical Care" },
  { id: "BED-02", ward: "ICU", patient: "", status: "Available", bedType: "Critical Care" },
  { id: "BED-03", ward: "General", patient: "Aarav Sharma", status: "Occupied", bedType: "Standard" },
  { id: "BED-04", ward: "General", patient: "", status: "Available", bedType: "Standard" },
  { id: "BED-05", ward: "Pediatrics", patient: "Anaya Singh", status: "Occupied", bedType: "Pediatric" },
  { id: "BED-06", ward: "Private", patient: "", status: "Maintenance", bedType: "Premium" },
  { id: "BED-07", ward: "Private", patient: "Rohan Verma", status: "Occupied", bedType: "Premium" },
  { id: "BED-08", ward: "General", patient: "", status: "Available", bedType: "Standard" },
];

// DAY_OPTIONS:
// Canonical weekday list used by the doctor-availability picker.
export const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// inventoryData:
// Static inventory watchlist shown in the inventory tab and overview alerts.
export const inventoryData = [
  { item: "N95 Masks", remaining: 42, threshold: 60, vendor: "MediSafe Supplies" },
  { item: "Syringes", remaining: 110, threshold: 120, vendor: "CareLine Pharma" },
  { item: "IV Fluids", remaining: 26, threshold: 40, vendor: "VitalMed" },
  { item: "Antibiotic Vials", remaining: 18, threshold: 25, vendor: "HealthBridge Labs" },
];

// patientGrowthData:
// Demo analytics dataset used by the overview line chart.
export const patientGrowthData = [
  { month: "Nov", patients: 220 },
  { month: "Dec", patients: 248 },
  { month: "Jan", patients: 286 },
  { month: "Feb", patients: 312 },
  { month: "Mar", patients: 348 },
  { month: "Apr", patients: 389 },
];

// appointmentAnalyticsData:
// Demo dataset used by the overview bar chart.
export const appointmentAnalyticsData = [
  { name: "Cardiology", appointments: 32 },
  { name: "Neurology", appointments: 24 },
  { name: "Orthopedics", appointments: 28 },
  { name: "Pediatrics", appointments: 30 },
  { name: "Dermatology", appointments: 18 },
];

// bedChartColors:
// Shared color palette for the bed occupancy pie chart.
export const bedChartColors = ["#0b63f6", "#58a6ff", "#b8d7ff"];

// navigationItems:
// Defines the admin sidebar structure and the section IDs used by the main page container.
export const navigationItems = [
  { id: "overview", label: "Dashboard" },
  { id: "doctors", label: "Doctors" },
  { id: "patients", label: "Patients" },
  { id: "appointments", label: "Appointments" },
  { id: "beds", label: "Beds" },
  { id: "billing", label: "Billing" },
  { id: "inventory", label: "Inventory" },
];
