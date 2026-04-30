import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ActivityComparison.css';

const DailyActivity = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const defaultData = [
    { name: '20 Mar', groups: 6, meetings: 15, videos: 15 },
    { name: '21 Mar', groups: 18, meetings: 18, videos: 22 },
    { name: '22 Mar', groups: 12, meetings: 36, videos: 54 },
    { name: '23 Mar', groups: 6, meetings: 15, videos: 18 },
    { name: '24 Mar', groups: 15, meetings: 10, videos: 6 },
    { name: '25 Mar', groups: 8, meetings: 10, videos: 2 },
    { name: '26 Mar', groups: 23, meetings: 18, videos: 18 },
    { name: '27 Mar', groups: 12, meetings: 6, videos: 2 },
  ];

  const chartData = data || defaultData;

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="d-flex align-items-center mx-3">
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
              {entry.value.charAt(0).toUpperCase() + entry.value.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="activity-comparison-card w-100 h-100 d-flex flex-column">
      <h4 className="fw-semibold mb-4" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Daily Activity</h4>
      <div style={{ width: '100%', height: 300, minHeight: 300, flex: 1 }}>
        {isMounted && (
          <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={100}>
            <LineChart
              data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
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
              cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend content={<CustomLegend />} verticalAlign="bottom" />
            <Line type="monotone" dataKey="groups" stroke="#0076EA" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="meetings" stroke="#00DC85" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="videos" stroke="#7E8CF5" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DailyActivity;
