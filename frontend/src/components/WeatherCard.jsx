function WeatherCard({
  condition = "Favourable",
  rainfall = "Good",
  temperature = "28°C",
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-start justify-between">
        <span className="text-3xl">🌧️</span>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
          {condition}
        </span>
      </div>

      <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
        Weather
      </p>

      <h3 className="mt-2 text-2xl font-bold">
        {rainfall}
      </h3>

      <div className="mt-4 flex gap-5 text-xs text-gray-500">
        <span>🌡 {temperature}</span>
        <span>💧 68%</span>
      </div>

    </div>
  );
}

export default WeatherCard;