function RainfallChart() {
  const data = [
    ["Mon", 35],
    ["Tue", 50],
    ["Wed", 30],
    ["Thu", 65],
    ["Fri", 85],
    ["Sat", 72],
    ["Sun", 92],
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
          Weather Data
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Rainfall Forecast
        </h2>
      </div>

      <div className="mt-10 flex h-60 items-end gap-3 border-b border-white/10">

        {data.map(([day, value]) => (
          <div
            key={day}
            className="group flex h-full flex-1 flex-col items-center justify-end"
          >

            <span className="mb-2 text-[9px] text-gray-600 opacity-0 group-hover:opacity-100">
              {value} mm
            </span>

            <div
              className="w-full max-w-10 rounded-t-xl bg-emerald-400/60 transition-all duration-500 group-hover:bg-emerald-400"
              style={{ height: `${value}%` }}
            />

            <span className="mt-3 text-[10px] text-gray-600">
              {day}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default RainfallChart;