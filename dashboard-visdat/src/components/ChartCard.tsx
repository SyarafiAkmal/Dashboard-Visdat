import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartCardProps = {
  title?: string;
};

const data = [
  { month: 'Jan', value: 20 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 60 },
  { month: 'May', value: 42 },
];

export default function ChartCard({
  title,
}: ChartCardProps) {
  return (
    <div className="card chart-card">
      {title && (
        <h3 className="chart-title">
          {title}
        </h3>
      )}

      <div className="chart-content">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}