function SoilMoistureCard({ moisture = 62 }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-center justify-between">
        <span className="text-3xl">💧</span>

        <span className="text-xs text-emerald-400">
          +8%
        </span>
      </div>

      <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
        Soil Moisture
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {moisture}%
      </h3>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-1000"
          style={{ width: `${moisture}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Estimated from rainfall history
      </p>

    </div>
  );
}

export default SoilMoistureCard;