import Navbar from "../components/Navbar";

function About() {
  return (
    <div className="min-h-screen bg-[#04100c] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">

        {/* HERO */}

        <section className="grid items-center gap-12 lg:grid-cols-2">

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AGRICULTURE INTELLIGENCE
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Better timing.
              <br />
              <span className="text-emerald-400">
                Better decisions.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-500">
              AgriSentinal is a decision-support platform designed to help
              farmers identify a favourable Kharif sowing window using
              weather forecasts, historical monsoon onset, soil conditions
              and crop duration.
            </p>
          </div>

          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-emerald-400/10 bg-gradient-to-br from-emerald-950 to-[#06120d]">

            <div className="absolute h-72 w-72 rounded-full border border-emerald-400/10" />
            <div className="absolute h-52 w-52 rounded-full border border-emerald-400/10" />

            <div className="relative text-center">

              <div className="text-7xl">
                🌧️
              </div>

              <p className="mt-7 text-2xl font-bold">
                Weather
                <span className="text-emerald-400"> × </span>
                Soil
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Data-driven sowing intelligence
              </p>

            </div>

          </div>

        </section>

        {/* PROBLEM */}

        <section className="mt-24 grid gap-5 md:grid-cols-2">

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8">
            <span className="text-3xl">⚠️</span>

            <h2 className="mt-6 text-2xl font-bold">
              The Problem
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              District-level monsoon information can be too broad for
              individual farming decisions. Farmers need a more useful
              estimate that considers local conditions and the selected
              crop.
            </p>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/10 bg-emerald-400/[0.03] p-8">
            <span className="text-3xl">💡</span>

            <h2 className="mt-6 text-2xl font-bold">
              Our Approach
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              AgriSentinal combines forecast information, historical onset
              patterns, soil information, rainfall history and crop
              duration to generate a sowing-window probability estimate.
            </p>
          </div>

        </section>

        {/* FACTORS */}

        <section className="mt-24">

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Decision Engine
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              What influences the prediction?
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              ["🌧️", "Rainfall", "Forecast and rainfall patterns"],
              ["📅", "Historical Onset", "Past monsoon behaviour"],
              ["💧", "Soil Moisture", "Estimated moisture conditions"],
              ["🌾", "Crop Duration", "Crop-specific requirements"],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20"
              >
                <span className="text-3xl">{icon}</span>

                <h3 className="mt-6 font-semibold">
                  {title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-600">
                  {description}
                </p>
              </div>
            ))}

          </div>

        </section>

        {/* DISCLAIMER */}

        <section className="mt-24 rounded-[2rem] border border-yellow-400/10 bg-yellow-400/[0.02] p-7">

          <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
            Important
          </p>

          <p className="mt-4 text-sm leading-7 text-gray-500">
            AgriSentinal provides a decision-support estimate.
            It is not a guaranteed weather prediction and should be used
            together with local field observations and agricultural
            guidance.
          </p>

        </section>

      </main>
    </div>
  );
}

export default About;