// Billing section:
// Keeps the billing summary UI separate from the main admin page.
import { SectionHeader, StatCard } from "./AdminDashboardCommon";

export default function AdminBillingSection({ active }) {
  // AdminBillingSection:
  // This component renders the billing summary tab.
  // It is intentionally simple right now and mainly serves as a clean home for the billing snapshot cards.
  return (
    <section id="billing" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Billing"
        title="Revenue snapshot"
        description="A quick operational summary for collections, pending invoices, and discharge billing."
      />

      <div className="admin-stats-grid compact">
        {/* Each StatCard here represents a fixed business-summary metric for the billing view. */}
        <StatCard label="Invoices Raised" value="126" helper="Generated this month" />
        <StatCard
          label="Collected Revenue"
          value="Rs. 18.4L"
          helper="Across inpatient and outpatient billing"
        />
        <StatCard
          label="Pending Payments"
          value="Rs. 2.6L"
          helper="Awaiting insurance and direct settlements"
        />
      </div>
    </section>
  );
}
