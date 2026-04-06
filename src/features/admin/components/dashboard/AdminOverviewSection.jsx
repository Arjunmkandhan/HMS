// Admin overview section:
// Shows the main dashboard cards, charts, summary tables, and alerts.
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataTable, SectionHeader, StatCard } from "./AdminDashboardCommon";
import { formatDisplayDate, getPatientDisplayName } from "./AdminDashboardUtils";

export default function AdminOverviewSection({
  active,
  stats,
  patientGrowthData,
  appointmentAnalyticsData,
  bedOccupancyData,
  bedChartColors,
  filteredPatients,
  filteredAppointments,
  lowStockAlerts,
  bedAlerts,
  getAppointmentSortValue,
}) {
  return (
    <section id="overview" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Live Overview"
        title="Hospital performance snapshot"
        description="Core metrics, trend views, and watchlist items for today’s operations."
      />

      <div className="admin-stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="admin-chart-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Patient growth</h3>
            <span>Last six months</span>
          </div>
          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientGrowthData}>
                <XAxis dataKey="month" stroke="#5a6d8a" />
                <YAxis stroke="#5a6d8a" />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#0b63f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Appointments analytics</h3>
            <span>Department wise activity</span>
          </div>
          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentAnalyticsData}>
                <XAxis dataKey="name" stroke="#5a6d8a" />
                <YAxis stroke="#5a6d8a" />
                <Tooltip />
                <Bar dataKey="appointments" fill="#1e84ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Bed occupancy</h3>
            <span>Current utilization</span>
          </div>
          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bedOccupancyData} cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={4} dataKey="value">
                  {bedOccupancyData.map((entry, index) => (
                    <Cell key={entry.name} fill={bedChartColors[index % bedChartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="admin-data-grid">
        <DataTable
          title="Recent patients"
          emptyText="No patient entries match the current search."
          columns={[
            {
              key: "name",
              label: "Patient",
              render: (row) => getPatientDisplayName(row),
            },
            { key: "condition", label: "Condition" },
            { key: "phone", label: "Phone" },
            {
              key: "admittedOn",
              label: "Admitted",
              render: (row) => formatDisplayDate(row.admittedOn),
            },
          ]}
          rows={[...filteredPatients]
            .sort((a, b) => new Date(b.admittedOn) - new Date(a.admittedOn))
            .slice(0, 5)}
        />

        <DataTable
          title="Upcoming appointments"
          emptyText="No appointment records match the current search."
          columns={[
            { key: "patient", label: "Patient" },
            { key: "doctor", label: "Doctor" },
            { key: "department", label: "Department" },
            {
              key: "schedule",
              label: "Schedule",
              render: (row) => `${formatDisplayDate(row.date)} at ${row.time}`,
            },
          ]}
          rows={[...filteredAppointments]
            .sort(
              (a, b) =>
                getAppointmentSortValue(a.date, a.time) -
                getAppointmentSortValue(b.date, b.time)
            )
            .slice(0, 6)}
        />
      </div>

      <div className="admin-alert-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Low stock warnings</h3>
          </div>
          <div className="admin-alert-list">
            {lowStockAlerts.map((item) => (
              <div className="admin-alert-item warning" key={item.item}>
                <strong>{item.item}</strong>
                <span>
                  {item.remaining} units remaining. Reorder threshold is {item.threshold}.
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Bed availability alerts</h3>
          </div>
          <div className="admin-alert-list">
            {bedAlerts.map((item) => (
              <div className="admin-alert-item info" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
