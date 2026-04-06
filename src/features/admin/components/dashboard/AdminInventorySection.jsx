// Inventory section:
// Keeps the inventory watchlist table separate from the main admin page.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";

export default function AdminInventorySection({ active, filteredInventory }) {
  return (
    <section id="inventory" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Inventory"
        title="Critical supplies watchlist"
        description="Review low stock items and vendors to keep care delivery uninterrupted."
      />

      <DataTable
        title="Inventory status"
        emptyText="Inventory data unavailable."
        columns={[
          { key: "item", label: "Item" },
          { key: "remaining", label: "Remaining" },
          { key: "threshold", label: "Threshold" },
          { key: "vendor", label: "Vendor" },
        ]}
        rows={filteredInventory}
      />
    </section>
  );
}
