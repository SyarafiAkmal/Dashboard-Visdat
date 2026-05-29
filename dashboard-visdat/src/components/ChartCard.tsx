import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Modal from './Modal';
import { useState, useEffect } from 'react';

type ProvinceData = {
  ipm: number;
  pct_formal_worker: number;
  avg_schooling_years: number;
  ump_rupiah: number;
  p0_pct: number;
  aps_avg: number;
};

type ChartCardProps = {
  title?: string;
  description?: string;
  xKey: keyof Omit<ProvinceData, 'p0_pct'>;
  variables?: { name: string; explanation: string }[];
};

const UMP_MIN = 2169349;
const UMP_MAX = 5396761;

function umpToColor(ump: number): string {
  if (!ump) return '#8B0000';
  const t = Math.max(0, Math.min(1, (ump - UMP_MIN) / (UMP_MAX - UMP_MIN)));

  // Gradient stops: dark red → red → orange → amber → yellow
  const stops = [
    { t: 0.00, r: 139, g:   0, b:   0 },
    { t: 0.25, r: 192, g:  57, b:  43 },
    { t: 0.50, r: 226, g:  75, b:  74 },
    { t: 0.75, r: 230, g: 126, b:  34 },
    { t: 1.00, r: 241, g: 196, b:  15 },
  ];

  let s = stops[0], e = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      s = stops[i];
      e = stops[i + 1];
      break;
    }
  }

  const seg = (t - s.t) / (e.t - s.t);
  const r = Math.round(s.r + (e.r - s.r) * seg);
  const g = Math.round(s.g + (e.g - s.g) * seg);
  const b = Math.round(s.b + (e.b - s.b) * seg);
  return `rgb(${r},${g},${b})`;
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={umpToColor(payload.ump)}
      opacity={0.9}
      stroke="none"
    />
  );
};

export default function ChartCard({ title, description, xKey, variables }: ChartCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [chartData, setChartData] = useState<{ x: number; y: number; province: string; ump: number }[]>([]);

  useEffect(() => {
    fetch('/indonesia_province_data_2025.json')
      .then((res) => res.json())
      .then((json: Record<string, ProvinceData>) => {
        const points = Object.entries(json)
          .map(([province, d]) => ({
            province,
            x: d[xKey] as number,
            y: d.p0_pct,
            ump: d.ump_rupiah,
          }))
          .filter((d) => d.x != null && d.y != null);
        setChartData(points);
      });
  }, [xKey]);

  return (
    <>
      <div className="card chart-card">
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
          {(description || variables) && (
            <button className="chart-info-btn" onClick={() => setShowInfo(true)}>?</button>
          )}
        </div>

        <div className="chart-content">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#c8c8c0" />

              <XAxis
                dataKey="x"
                type="number"
                tick={{ fontSize: 11, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                dataKey="y"
                tick={{ fontSize: 11, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{
                      background: '#f4f4f0',
                      border: '1px solid #deded6',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontFamily: 'Georgia, serif',
                      color: '#444',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.province}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: umpToColor(d.ump), flexShrink: 0 }} />
                        <span>UMP: Rp {d.ump ? d.ump.toLocaleString('id-ID') : 'N/A'}</span>
                      </div>
                      <div>x: {d.x}</div>
                      <div>P0: {d.y}%</div>
                    </div>
                  );
                }}
              />

              <Scatter data={chartData} shape={<CustomDot />} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Modal
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title={title ?? 'Chart Info'}
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {description && <p className="poverty-modal-text">{description}</p>}
          {variables && variables.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="legend-section-label">Variables</span>
              {variables.map((v) => (
                <div key={v.name} className="chart-variable-row">
                  <span className="chart-variable-name">{v.name}</span>
                  <span className="chart-variable-desc">{v.explanation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}