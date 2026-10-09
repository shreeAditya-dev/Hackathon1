function ProbabilityMeter({ probability = 84 }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.025] p-8">

      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
        Sowing Probability
      </p>

      <div className="relative mt-8 flex h-44 w-44 items-center justify-center rounded-full border-[12px] border-emerald-400/10">

        <div
          className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-r-emerald-400 border-t-emerald-400"
          style={{
            transform: `rotate(${20 + probability / 4}deg)`,
          }}
        />

        <div className="text-center">
          <p className="text-4xl font-bold">
            {probability}%
          </p>

          <p className="mt-1 text-xs text-emerald-400">
            High Confidence
          </p>
        </div>

      </div>

      <p className="mt-7 max-w-xs text-center text-xs leading-5 text-gray-600">
        Higher probability indicates more favourable conditions for
        the selected sowing window.
      </p>

    </div>
  );
}

export default ProbabilityMeter;