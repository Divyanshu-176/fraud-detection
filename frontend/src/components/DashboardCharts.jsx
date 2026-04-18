function chartCardClass() {
  return "rounded-2xl bg-gray-800/80 p-4 shadow-lg";
}

function MiniBarChart({ items, color }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="mt-4 flex h-64 items-end gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-2">
          <div
            className="w-full rounded-t-md"
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: item.value > 0 ? "8px" : "0px",
              backgroundColor: color,
            }}
          />
          <p className="text-center text-xs text-gray-300">{item.label}</p>
          <p className="text-xs font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let current = 0;
  const colors = ["#22c55e", "#f59e0b", "#ef4444"];

  const segments = items.map((item, index) => {
    const percentage = item.value / total;
    const start = current;
    current += percentage;
    return {
      ...item,
      color: colors[index % colors.length],
      start,
      end: current,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-56 w-56 -rotate-90">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1f2937" strokeWidth="6" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke={segment.color}
            strokeWidth="6"
            strokeDasharray={`${(segment.end - segment.start) * 100} ${100 - (segment.end - segment.start) * 100}`}
            strokeDashoffset={-segment.start * 100}
          />
        ))}
      </svg>

      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-3 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="w-20 text-gray-300">{segment.label}</span>
            <span className="font-semibold">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ items }) {
  const width = 600;
  const height = 240;
  const padding = 24;
  const maxValue = Math.max(...items.map((item) => item.fraudScore), 1);
  const points = items.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(items.length - 1, 1);
    const y = height - padding - (item.fraudScore / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className={chartCardClass()}>
        <h3 className="mb-3 text-lg font-semibold">Fraud Score Trend</h3>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <polyline
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3"
            points={points.join(" ")}
          />
          {items.map((item, index) => {
            const x = padding + (index * (width - padding * 2)) / Math.max(items.length - 1, 1);
            const y = height - padding - (item.fraudScore / maxValue) * (height - padding * 2);
            return <circle key={`${item.label}-${index}`} cx={x} cy={y} r="4" fill="#93c5fd" />;
          })}
        </svg>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-300 md:grid-cols-6">
          {items.slice(-6).map((item) => (
            <div key={item.label}>
              <p>{item.label}</p>
              <p className="font-semibold text-white">{(item.fraudScore * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardCharts({ charts }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <LineChart items={charts.trend} />

      <div className={chartCardClass()}>
        <h3 className="mb-3 text-lg font-semibold">Risk Distribution</h3>
        <DonutChart items={charts.risk_distribution} />
      </div>

      <div className={chartCardClass()}>
        <h3 className="mb-3 text-lg font-semibold">Transactions by Payment Method</h3>
        <MiniBarChart items={charts.by_payment_method} color="#8b5cf6" />
      </div>

      <div className={chartCardClass()}>
        <h3 className="mb-3 text-lg font-semibold">Transactions by Location</h3>
        <MiniBarChart items={charts.by_location} color="#14b8a6" />
      </div>
    </div>
  );
}
