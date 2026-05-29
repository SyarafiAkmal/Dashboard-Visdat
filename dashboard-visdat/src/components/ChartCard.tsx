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
import { useState } from 'react';

type ChartCardProps = {
  title?: string;
  description?: string;
  variables?: { name: string; explanation: string }[];
};

const data = [
  { month: 'Jan', value: 20 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 60 },
  { month: 'May', value: 42 },
];

const numericData = data.map((d, i) => ({ x: i, value: d.value, month: d.month }));

export default function ChartCard({ title, description, variables }: ChartCardProps) {
  const [showInfo, setShowInfo] = useState(false);

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
                domain={[0, data.length - 1]}
                tickCount={data.length}
                tickFormatter={(i) => data[i]?.month ?? ''}
                tick={{ fontSize: 11, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                dataKey="value"
                tick={{ fontSize: 11, fill: '#aaa' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value) => [value, 'Value']}
                labelFormatter={(x) => data[x]?.month ?? ''}
                contentStyle={{
                  background: '#f4f4f0',
                  border: '1px solid #deded6',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'Georgia, serif',
                  color: '#444',
                }}
              />

              <Scatter data={numericData} fill="#E24B4A" opacity={0.85} r={5} />
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