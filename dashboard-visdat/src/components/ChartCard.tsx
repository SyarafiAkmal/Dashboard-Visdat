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
  insight?: string;
  xKey: keyof Omit<ProvinceData, 'p0_pct'>;
  variables?: { name: string; explanation: string }[];
};

const UMP_MIN = 2169349;
const UMP_MAX = 5396761;

function umpToColor(ump: number): string {
  if (!ump) return '#440154';

  const t = Math.max(
    0,
    Math.min(1, (ump - UMP_MIN) / (UMP_MAX - UMP_MIN))
  );

  const stops = [
    { t: 0.00, r: 68,  g: 1,   b: 84  },  // deep purple
    { t: 0.25, r: 59, g: 82,  b: 139 },  // blue
    { t: 0.50, r: 33, g: 145, b: 140 },  // teal
    { t: 0.75, r: 94, g: 201, b: 98  },  // green
    { t: 1.00, r: 253, g: 231, b: 37 },  // yellow
  ];

  let s = stops[0];
  let e = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      s = stops[i];
      e = stops[i + 1];
      break;
    }
  }

  const seg = (t - s.t) / (e.t - s.t);

  return `rgb(
    ${Math.round(s.r + (e.r - s.r) * seg)},
    ${Math.round(s.g + (e.g - s.g) * seg)},
    ${Math.round(s.b + (e.b - s.b) * seg)}
  )`;
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <circle cx={cx} cy={cy} r={5} fill={umpToColor(payload.ump)} opacity={0.9} stroke="none" />
  );
};

export default function ChartCard({ title, description, insight, xKey, variables }: ChartCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [chartData, setChartData] = useState<{ x: number; y: number; province: string; ump: number }[]>([]);

  useEffect(() => {
    fetch('/indonesia_province_data_2025.json')
      .then((res) => res.json())
      .then((json: Record<string, ProvinceData>) => {
        const excludedProvinces = [
          'Papua Pegunungan',
          'Papua Tengah',
        ];

        const points = Object.entries(json)
          .map(([province, d]) => ({
            province,
            x: d[xKey] as number,
            y: d.p0_pct,
            ump: d.ump_rupiah,
          }))
          .filter(
            (d) =>
              d.x != null &&
              d.y != null &&
              !excludedProvinces.includes(d.province)
          );

        setChartData(points);
      });
  }, [xKey]);

  return (
    <>
      <div className="card chart-card">
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
          {(description || variables || insight) && (
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
                label={{
                  value: variables?.[0]?.name.replace(/^X — /, '') ?? xKey,
                  position: 'insideBottom',
                  offset: -5,
                  dx: -15,
                  fontSize: 11,
                  fill: '#b5721a',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'bold',
                }}
              />

              <YAxis
                dataKey="y"
                tick={{ fontSize: 11, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
                width={50}
                label={{
                  value: 'P0 (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  dy: 15,
                  fontSize: 11,
                  fill: '#b5721a',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'bold',
                }}
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
          {description && (
            <p className="poverty-modal-text">{description}</p>
          )}

          {insight && (
            <div className="poverty-formula">
              <span className="poverty-formula-label">Insight Korelasi</span>
              <p className="poverty-modal-text" style={{ margin: 0 }}>{insight}</p>
            </div>
          )}

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