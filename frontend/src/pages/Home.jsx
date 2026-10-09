import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

const STORAGE_KEY = "agrisentinal_analysis";

function Home() {
  const navigate = useNavigate();

  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed?.crop && parsed?.location) {
          setAnalysisData(parsed);
        }
      }
    } catch (error) {
      console.error("Home storage error:", error);
    }
  }, []);

  const probability = Number(
    analysisData?.probability ?? 0
  );

  const weather = analysisData?.weather;
  const monsoon = analysisData?.monsoon;

  const recommendation =
    analysisData?.recommendation;

  /*
   * Home par analysis hone ke baad backend ka
   * actual result show hoga.
   *
   * Agar analysis nahi hui hai to fake date/probability
   * show nahi karenge.
   */

  const hasAnalysis = Boolean(analysisData);

  const getSuitabilityText = () => {
    if (!hasAnalysis) {
      return "Ready for analysis";
    }

    if (probability >= 75) {
      return "Highly favourable";
    }

    if (probability >= 50) {
      return "Moderately favourable";
    }

    return "Conditions need attention";
  };

  const getRainfallText = () => {
    if (!hasAnalysis) {
      return "Awaiting analysis";
    }

    const rainfall = Number(
      weather?.rainfall ?? 0
    );

    if (rainfall >= 10) {
      return "Good";
    }

    if (rainfall > 0) {
      return "Light";
    }

    return "Low";
  };

  const getMoistureText = () => {
    if (!hasAnalysis) {
      return "--";
    }

    return `${weather?.humidity ?? 0}%`;
  };

  const getWindowText = () => {
    if (!hasAnalysis) {
      return "Analyse to find";
    }

    if (probability >= 75) {
      return "Recommended now";
    }

    if (probability >= 50) {
      return "Monitor conditions";
    }

    return "Wait for better conditions";
  };

  const features = [
    {
      id: 1,
      icon: "🌦️",
      title: "Weather Forecast",
      description:
        "Understand upcoming rainfall and monsoon conditions for your location.",
      path: "/dashboard",
    },
    {
      id: 2,
      icon: "💧",
      title: "Soil Analysis",
      description:
        "Estimate soil moisture using rainfall history and soil characteristics.",
      path: "/analysis",
    },
    {
      id: 3,
      icon: "🌧️",
      title: "Monsoon Prediction",
      description:
        "Analyse historical onset patterns and forecast data.",
      path: "/analysis",
    },
    {
      id: 4,
      icon: "🌱",
      title: "Smart Sowing Window",
      description:
        "Find the most suitable Kharif sowing window for your selected crop.",
      path: "/analysis",
    },
  ];

  return (
    <div className="min-h-screen bg-[#04100c] text-white">

      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden pt-24">

        {/* Background glow */}
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative mx-auto grid min-h-[85vh] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">

          {/* LEFT */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300">

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />

              KHARIF SOWING ASSISTANT

            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">

              Right Sowing

              <br />

              <span className="text-emerald-400">
                Window.
              </span>

              <br />

              Better Harvest.

            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 md:text-lg">
              Make smarter Kharif sowing decisions using monsoon forecasts,
              historical onset patterns, soil conditions and crop duration.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <button
                onClick={() => navigate("/analysis")}
                className="group rounded-full bg-emerald-400 px-7 py-3.5 font-semibold text-black transition duration-300 hover:scale-105 hover:bg-emerald-300"
              >
                Start Analysis

                <span className="ml-2 transition group-hover:ml-3">
                  →
                </span>
              </button>

              <button
                onClick={() => navigate("/about")}
                className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-white transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                Learn More
              </button>

            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8">

              <div>
                <p className="text-2xl font-bold text-white">
                  5+
                </p>

                <p className="text-xs text-gray-500">
                  Decision Factors
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-2xl font-bold text-white">
                  Smart
                </p>

                <p className="text-xs text-gray-500">
                  Assisted Analysis
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-2xl font-bold text-white">
                  Kharif
                </p>

                <p className="text-xs text-gray-500">
                  Focused
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT VISUAL */}
          <div className="relative">

            <div className="relative mx-auto aspect-square max-w-[520px] overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-950 via-[#071913] to-[#020806] p-5 shadow-2xl shadow-emerald-950/40">

              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-emerald-400/10" />

              <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-emerald-400/10" />

              <div className="relative flex h-full flex-col justify-between rounded-[1.5rem] border border-white/5 bg-black/20 p-6">

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <span className="text-xs text-gray-500">
                    {hasAnalysis
                      ? "LATEST ANALYSIS"
                      : "READY TO ANALYSE"}
                  </span>

                  <span className="flex items-center gap-2 text-xs text-emerald-400">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                    {hasAnalysis
                      ? "Live Result"
                      : "Monitoring"}

                  </span>

                </div>

                {/* CENTER */}
                <div className="text-center">

                  <div className="mx-auto mb-7 flex h-36 w-36 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_80px_rgba(52,211,153,0.12)]">

                    <span className="text-7xl">
                      🌱
                    </span>

                  </div>

                  <p className="text-sm text-gray-500">
                    Smart Sowing Window
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">

                    {hasAnalysis
                      ? getWindowText()
                      : "Analyse to find"}

                  </h2>

                  {/* Probability */}
                  <div className="mx-auto mt-5 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{
                        width: hasAnalysis
                          ? `${Math.min(
                              100,
                              Math.max(
                                0,
                                probability
                              )
                            )}%`
                          : "0%",
                      }}
                    />

                  </div>

                  <p className="mt-3 text-sm text-emerald-400">

                    {hasAnalysis
                      ? `${probability}% ${getSuitabilityText().toLowerCase()}`
                      : "Start an analysis to get your result"}

                  </p>

                </div>

                {/* BOTTOM CARDS */}
                <div className="grid grid-cols-3 gap-3">

                  {/* RAINFALL */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">

                    <p className="text-lg">
                      🌧️
                    </p>

                    <p className="mt-2 text-[10px] text-gray-500">
                      Rainfall
                    </p>

                    <p className="text-sm font-semibold">

                      {getRainfallText()}

                    </p>

                  </div>

                  {/* MOISTURE / HUMIDITY */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">

                    <p className="text-lg">
                      💧
                    </p>

                    <p className="mt-2 text-[10px] text-gray-500">
                      Humidity
                    </p>

                    <p className="text-sm font-semibold">

                      {getMoistureText()}

                    </p>

                  </div>

                  {/* CROP */}
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">

                    <p className="text-lg">
                      🌾
                    </p>

                    <p className="mt-2 text-[10px] text-gray-500">
                      Crop
                    </p>

                    <p className="text-sm font-semibold">

                      {analysisData?.crop || "Select"}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="border-t border-white/5 bg-[#06130f] py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              One platform
            </p>

            <h2 className="mt-4 text-3xl font-bold md:text-5xl">

              Everything you need to

              <span className="text-emerald-400">
                {" "}plan better.
              </span>

            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Explore each factor behind the recommended sowing window.
            </p>

          </div>

          {/* FEATURES */}
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => (

              <button
                key={feature.id}
                onClick={() => navigate(feature.path)}
                className="group text-left"
              >

                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 group-hover:-translate-y-2 group-hover:border-emerald-400/30 group-hover:bg-emerald-400/[0.04]">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                      {feature.icon}
                    </div>

                    <span className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-emerald-400">
                      →
                    </span>

                  </div>

                  <h3 className="mt-7 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>

                  <div className="mt-6 text-xs font-semibold text-emerald-400 opacity-0 transition group-hover:opacity-100">
                    Explore section →
                  </div>

                </div>

              </button>

            ))}

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-emerald-950/20" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Make the decision before the rain does
          </p>

          <h2 className="mt-5 text-4xl font-bold md:text-6xl">

            Find your best

            <br />

            <span className="text-emerald-400">
              sowing window.
            </span>

          </h2>

          <button
            onClick={() => navigate("/analysis")}
            className="mt-9 rounded-full bg-emerald-400 px-8 py-4 font-semibold text-black transition hover:scale-105 hover:bg-emerald-300"
          >
            Start Free Analysis →
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-500 md:flex-row">

          <p>
            © 2026 AgriSentinal
          </p>

          <p>
            Better data. Better decisions. Better harvests.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;