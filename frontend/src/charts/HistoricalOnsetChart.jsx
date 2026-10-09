function HistoricalOnsetChart() {
  const years = [
    { year: "2020", day: 18 },
    { year: "2021", day: 16 },
    { year: "2022", day: 20 },
    { year: "2023", day: 15 },
    { year: "2024", day: 17 },
    { year: "2025", day: 19 },
    { year: "2026", day: 19 },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
        Historical Data
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Monsoon Onset History
      </h2>

      <div className="mt-8 space-y-4">

        {years.map((item) => (
          <div
            key={item.year}
            className="flex items-center gap-4"
          >

            <span className="w-10 text-xs text-gray-600">
              {item.year}
            </span>

            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">

              <div
                className={`h-full rounded-full ${
                  item.year === "2026"
                    ? "bg-emerald-400"
                    : "bg-emerald-400/40"
                }`}
                style={{
                  width: `${item.day * 4}%`,
                }}
              />

            </div>

            <span className="w-14 text-right text-xs text-gray-500">
              Jun {item.day}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default HistoricalOnsetChart;