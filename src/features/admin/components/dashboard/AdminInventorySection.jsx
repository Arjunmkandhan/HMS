// Inventory section:
// Keeps the inventory watchlist table separate from the main admin page.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";

export default function AdminInventorySection({ active, filteredInventory }) {
  // AdminInventorySection:
  // This component renders the inventory watchlist tab.
  // The parent page pre-filters inventory items using the shared search term, and this function
  // simply displays the resulting rows in the reusable admin table.
  const inventoryColumns = [
    { key: "item", label: "Item" },
    { key: "remaining", label: "Remaining" },
    { key: "threshold", label: "Threshold" },
    { key: "vendor", label: "Vendor" },
  ];

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
        columns={inventoryColumns}
        rows={filteredInventory}
      />
    </section>
  );
}
