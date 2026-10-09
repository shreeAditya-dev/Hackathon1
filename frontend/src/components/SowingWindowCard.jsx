function SowingWindowCard({
  windowDate = "16 — 21 June",
  probability = 84,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-950/80 to-[#04100c] p-8">

      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-emerald-400/10" />

      <div className="relative">

        <div className="flex justify-between gap-5">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Recommended Sowing Window
            </p>

            <h2 className="mt-5 text-4xl font-bold">
              {windowDate}
            </h2>
          </div>

          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-400/10">
            <span className="font-bold text-emerald-400">
              {probability}%
            </span>

            <span className="text-[8px] text-gray-500">
              SCORE
            </span>
          </div>

        </div>

        <p className="mt-6 max-w-xl text-sm leading-6 text-gray-500">
          Current conditions indicate a favourable period for sowing
          the selected crop.
        </p>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-[84%] rounded-full bg-emerald-400" />
        </div>

      </div>
    </div>
  );
}

export default SowingWindowCard;