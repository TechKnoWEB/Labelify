export default function AdminStatCard({ label, value, sub, icon }) {
  return (
    <div className="adm-stat-card">
      {icon && <div className="adm-stat-icon">{icon}</div>}
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value ?? '—'}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}
