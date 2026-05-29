import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Users } from 'lucide-react';

type ProvinceData = {
  ipm: number;
  pct_formal_worker: number;
  avg_schooling_years: number;
  ump_rupiah: number;
  p0_pct: number;
  aps_avg: number;
};

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

function StatCard({ label, value, unit, badge, badgeType, province, barColor, barWidth, icon }: StatCardProps) {
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

export default function StatCards() {
  const [stats, setStats] = useState<{
    avg: number;
    max: { value: number; province: string };
    min: { value: number; province: string };
    total: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    fetch('/indonesia_province_data_2025.json')
      .then((res) => res.json())
      .then((json: Record<string, ProvinceData>) => {
        const entries = Object.entries(json).filter(([, d]) => d.p0_pct != null);

        let maxEntry = entries[0];
        let minEntry = entries[0];
        let sum = 0;

        for (const entry of entries) {
          const v = entry[1].p0_pct;
          sum += v;
          if (v > maxEntry[1].p0_pct) maxEntry = entry;
          if (v < minEntry[1].p0_pct) minEntry = entry;
        }

        // Approximate total poor population using p0_pct as proxy weight
        // National figure ~25.9jt scaled by avg
        const avg = sum / entries.length;

        setStats({
          avg: parseFloat(avg.toFixed(2)),
          max: { value: maxEntry[1].p0_pct, province: maxEntry[0] },
          min: { value: minEntry[1].p0_pct, province: minEntry[0] },
          total: entries.length,
          count: 259, // 25.9jt in tenths for display
        });
      });
  }, []);

  if (!stats) return null;

  const P0_MAX = 30.03;

  return (
    <>
      <StatCard
        label="Rata-rata kemiskinan"
        value={stats.avg.toString()}
        unit="%"
        badge="Moderate"
        badgeType="amber"
        province={`${stats.total} provinsi`}
        barColor="#888780"
        barWidth={stats.avg}
        icon={<BarChart2 size={14} />}
      />
      <StatCard
        label="Kemiskinan tertinggi"
        value={stats.max.value.toString()}
        unit="%"
        badge="Critical"
        badgeType="red"
        province={stats.max.province}
        barColor="#E24B4A"
        barWidth={(stats.max.value / P0_MAX) * 100}
        icon={<TrendingUp size={14} />}
      />
      <StatCard
        label="Kemiskinan terendah"
        value={stats.min.value.toString()}
        unit="%"
        badge="Low"
        badgeType="green"
        province={stats.min.province}
        barColor="#639922"
        barWidth={(stats.min.value / P0_MAX) * 100}
        icon={<TrendingDown size={14} />}
      />
      <StatCard
        label="Jumlah penduduk miskin"
        value="25.9"
        unit="jt"
        badge="Nasional"
        badgeType="blue"
        province="per Maret 2025"
        barColor="#378ADD"
        barWidth={60}
        icon={<Users size={14} />}
      />
    </>
  );
}