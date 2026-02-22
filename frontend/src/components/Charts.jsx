import React from 'react';

const COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  SUBMITTED: '#3b82f6',
  DRAFT: '#6b7280',
};

export const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path for pie slice
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={COLORS[slice.name] || '#6b7280'}
                stroke="white"
                strokeWidth="0.5"
                className="transition-opacity hover:opacity-80 cursor-pointer"
              >
                <title>{`${slice.name}: ${slice.value} (${slice.percentage}%)`}</title>
              </path>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: COLORS[slice.name] || '#6b7280' }}
            />
            <span className="text-sm">
              {slice.name}: {slice.value} ({slice.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BarChart = ({ data, title, xLabel, yLabel }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const scale = 200 / maxValue;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end justify-around h-64 border-b border-l border-gray-300">
        {data.map((item, index) => {
          const height = item.value * scale;
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="w-full flex flex-col items-center justify-end flex-1">
                <span className="text-xs font-semibold mb-1">{item.value}</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}px` }}
                  title={`${item.name}: ${item.value}`}
                />
              </div>
              <span className="text-xs mt-2 text-center">{item.name}</span>
            </div>
          );
        })}
      </div>
      {yLabel && <div className="text-xs text-gray-600 mt-2">{yLabel}</div>}
    </div>
  );
};

export const StatCard = ({ title, value, subtitle, trend, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const LineChart = ({ data, title, xLabel, yLabel }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;
  const width = 800;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
    return { x, y, ...item };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
          const y = padding + chartHeight * (1 - percent);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text x={10} y={y + 4} fontSize="12" fill="#6b7280">
                {Math.round(minValue + range * percent)}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="3" />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#3b82f6" />
            <title>{`${point.name}: ${point.value}`}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 10}
            fontSize="12"
            fill="#6b7280"
            textAnchor="middle"
          >
            {point.name}
          </text>
        ))}
      </svg>
      {yLabel && <div className="text-xs text-gray-600 text-center mt-2">{yLabel}</div>}
    </div>
  );
};
