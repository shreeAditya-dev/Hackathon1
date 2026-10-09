function RecommendationCard() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/10 bg-emerald-400/[0.03] p-7">

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl text-black">
          ✦
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400">
            Insight
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Recommendation
          </h2>
        </div>

      </div>

      <p className="mt-7 text-lg leading-8 text-gray-300">
        Conditions appear favourable for sowing during the recommended
        window.
      </p>

      <p className="mt-4 text-sm leading-7 text-gray-500">
        Rainfall probability, estimated soil moisture and historical
        monsoon behaviour currently support the prediction.
      </p>

      <div className="mt-7 rounded-2xl border border-white/5 bg-black/20 p-5">
        <p className="text-xs text-gray-600">
          NOTE
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-600">
          This is an estimate and should be considered
          alongside local field conditions.
        </p>
      </div>

    </div>
  );
}

export default RecommendationCard;