import React from "react";

function SowingWindowRiskCard({ windowAnalysis = [], windowScores = {} }) {
  // Built-in fallback windows if windowAnalysis is empty
  const defaultWindows = [
    {
      window: "Early",
      score: windowScores?.Early?.suitability_score ?? 25,
      riskLevel: "High Risk",
      suitability: "Unsuitable",
      isRecommended: false,
      notes: ["Dry spell exceeds crop tolerance", "Insufficient early rainfall"],
    },
    {
      window: "Normal",
      score: windowScores?.Normal?.suitability_score ?? 65,
      riskLevel: "Moderate Risk",
      suitability: "Moderately Suitable",
      isRecommended: true,
      notes: ["Normal monsoon aligns with normal sowing window"],
    },
    {
      window: "Late",
      score: windowScores?.Late?.suitability_score ?? 30,
      riskLevel: "High Risk",
      suitability: "Unsuitable",
      isRecommended: false,
      notes: ["Early monsoon may end before late sowing establishes"],
    },
  ];

  const windows = windowAnalysis && windowAnalysis.length > 0 ? windowAnalysis : defaultWindows;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Agronomic Assessment
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">
            Suitable & Risk Sowing Windows
          </h3>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
          Decision Engine
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400 leading-5">
        Evaluated across Early, Normal, and Late sowing periods based on temperature, rainfall adequacy, dry-spells, and crop requirements.
      </p>

      {/* WINDOW CARDS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {windows.map((w) => {
          const isLow = w.riskLevel === "Low Risk" || w.score >= 70;
          const isMod = w.riskLevel === "Moderate Risk" || (w.score >= 40 && w.score < 70);

          const badgeColor = isLow
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : isMod
            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
            : "border-rose-400/30 bg-rose-400/10 text-rose-400";

          const progressColor = isLow
            ? "bg-emerald-400"
            : isMod
            ? "bg-amber-400"
            : "bg-rose-400";

          return (
            <div
              key={w.window}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                w.isRecommended
                  ? "border-emerald-400/50 bg-emerald-400/[0.04]"
                  : "border-white/10 bg-white/[0.015]"
              }`}
            >
              {w.isRecommended && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-400 px-2.5 py-0.5 text-[9px] font-bold uppercase text-black">
                  Recommended
                </div>
              )}

              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">
                  {w.window} Window
                </h4>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${badgeColor}`}>
                  {w.riskLevel || (isLow ? "Low Risk" : isMod ? "Moderate Risk" : "High Risk")}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-gray-400">Suitability Score</span>
                <span className="text-2xl font-extrabold text-white">{w.score}%</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                  style={{ width: `${Math.min(w.score, 100)}%` }}
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-gray-300">
                {w.suitability || (isLow ? "Highly Suitable" : isMod ? "Moderately Suitable" : "Unsuitable")}
              </p>

              {w.notes && w.notes.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-white/5 pt-3 text-[11px] text-gray-400">
                  {w.notes.slice(0, 2).map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span className="leading-4">{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default SowingWindowRiskCard;
