import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ActivityComparison.css';

const ActivityComparison = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const defaultData = [
    { name: 'Groups', current: 11, previous: 11 },
    { name: 'Members', current: 23, previous: 35 },
    { name: 'Meetings', current: 49, previous: 35 },
    { name: 'Videos', current: 27, previous: 35 },
    { name: 'Messages', current: 27, previous: 35 },
    { name: 'Attendance', current: 45, previous: 30 },
  ];

  const chartData = data || defaultData;

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="d-flex flex-column align-items-end mb-3 legend-container">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="d-flex align-items-center mt-2">
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: entry.color,
                borderRadius: 4,
                marginRight: 8
              }}
            />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              {entry.value === 'current' ? 'Current Period' : 'Previous Period'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="activity-comparison-card w-100">
      <div className="d-flex justify-content-between align-items-start">
        <h4 className="fw-semibold mb-4" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Activity Comparison</h4>
        <CustomLegend payload={[{ value: 'current', color: '#0076EA' }, { value: 'previous', color: '#00DC85' }]} />
      </div>
      <div style={{ width: '100%', height: 300, minHeight: 300, flex: 1 }}>
        {isMounted && (
          <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={100}>
            <BarChart
              data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 5,
            }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="0" vertical={false} horizontal={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="previous" fill="#00DC85" radius={[8, 8, 8, 8]} barSize={20} />
            <Bar dataKey="current" fill="#0076EA" radius={[8, 8, 8, 8]} barSize={20} />
          </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ActivityComparison;
