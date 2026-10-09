function SoilMoistureChart() {
  const values = [38, 42, 45, 49, 54, 58, 62];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
        Soil Data
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Soil Moisture Trend
      </h2>

      <div className="mt-10 flex h-48 items-end gap-3">

        {values.map((value, index) => (
          <div
            key={index}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >

            <div
              className="w-full rounded-t-xl bg-emerald-400/50 transition hover:bg-emerald-400"
              style={{
                height: `${value}%`,
              }}
            />

            <span className="mt-3 text-[9px] text-gray-600">
              D{index + 1}
            </span>

          </div>
        ))}

      </div>

      <div className="mt-5 flex justify-between text-xs text-gray-600">
        <span>38%</span>
        <span>Current: 62%</span>
      </div>

    </div>
  );
}

export default SoilMoistureChart;