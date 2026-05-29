type StatCardProps = {
  label: string;
  value: string;
  unit: string;
  badge: string;
  badgeType: 'red' | 'green' | 'amber' | 'blue' | 'gray';
  province: string;
  barColor: string;
  barWidth: number;
  icon: React.ReactNode;
};

export default function StatCard({ label, value, unit, badge, badgeType, province, barColor, barWidth, icon }: StatCardProps) {
  return (
    <div className="card small-card stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}<span className="stat-unit">{unit}</span></div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${barWidth}%`, background: barColor }} />
      </div>
      <div className="stat-footer">
        <span className={`stat-badge stat-badge--${badgeType}`}>{badge}</span>
        <span className="stat-province">{province}</span>
      </div>
    </div>
  );
}