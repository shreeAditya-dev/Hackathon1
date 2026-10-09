import React from "react";

function TemperatureExtremesChart({ forecast = [] }) {
  // Fallback data if no forecast is available yet
  const defaultData = [
    { dayName: "Day 1", tempMax: 34, tempMin: 24 },
    { dayName: "Day 2", tempMax: 35, tempMin: 25 },
    { dayName: "Day 3", tempMax: 33, tempMin: 23 },
    { dayName: "Day 4", tempMax: 32, tempMin: 22 },
    { dayName: "Day 5", tempMax: 31, tempMin: 21 },
    { dayName: "Day 6", tempMax: 33, tempMin: 22 },
    { dayName: "Day 7", tempMax: 34, tempMin: 23 },
  ];

  const chartData = forecast && forecast.length > 0 ? forecast : defaultData;

  // Find min and max for scaling
  const allMax = Math.max(...chartData.map((d) => d.tempMax || 35), 40);
  const allMin = Math.min(...chartData.map((d) => d.tempMin || 15), 10);
  const range = allMax - allMin || 1;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Thermal Analysis
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">
            Highest & Lowest Temperature Forecast
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-400"></span>
            <span className="text-gray-400">Highest (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-400"></span>
            <span className="text-gray-400">Lowest (°C)</span>
          </div>
        </div>
      </div>

      {/* CHART BARS */}
      <div className="mt-8 flex h-56 items-end gap-3 border-b border-white/10 pb-4">
        {chartData.map((item, idx) => {
          const maxPercent = Math.max(15, Math.min(100, ((item.tempMax - allMin) / range) * 100));
          const minPercent = Math.max(10, Math.min(100, ((item.tempMin - allMin) / range) * 100));

          return (
            <div
              key={item.date || item.dayName || idx}
              className="group flex flex-1 flex-col items-center justify-end h-full"
            >
              {/* Max & Min Values on Hover / Always */}
              <div className="mb-2 flex flex-col items-center text-[10px] font-bold">
                <span className="text-amber-400">{item.tempMax}°</span>
                <span className="text-blue-400">{item.tempMin}°</span>
              </div>

              {/* Bar Pair */}
              <div className="flex w-full justify-center gap-1.5 items-end h-full max-h-36">
                {/* Max Temp Bar */}
                <div
                  className="w-1/2 max-w-4 rounded-t-lg bg-gradient-to-t from-amber-500/40 to-amber-400 transition-all duration-500 group-hover:from-amber-400 group-hover:to-amber-300"
                  style={{ height: `${maxPercent}%` }}
                />
                {/* Min Temp Bar */}
                <div
                  className="w-1/2 max-w-4 rounded-t-lg bg-gradient-to-t from-blue-500/40 to-blue-400 transition-all duration-500 group-hover:from-blue-400 group-hover:to-blue-300"
                  style={{ height: `${minPercent}%` }}
                />
              </div>

              {/* Label */}
              <span className="mt-3 text-[10px] font-medium text-gray-400">
                {item.dayName || item.date?.slice(5) || `D${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Range: {allMin}°C – {allMax}°C</span>
        <span>7-Day Daily Extremes</span>
      </div>

    </div>
  );
}

export default TemperatureExtremesChart;
