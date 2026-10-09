import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

function History() {
  const navigate = useNavigate();

  const history = [
    {
      id: 1,
      location: "Jaipur, Rajasthan",
      crop: "Bajra",
      date: "08 June 2026",
      window: "16–21 June",
      probability: 84,
      status: "Favourable",
    },
    {
      id: 2,
      location: "Sikar, Rajasthan",
      crop: "Maize",
      date: "05 June 2026",
      window: "18–24 June",
      probability: 79,
      status: "Favourable",
    },
    {
      id: 3,
      location: "Ajmer, Rajasthan",
      crop: "Soybean",
      date: "02 June 2026",
      window: "20–27 June",
      probability: 68,
      status: "Moderate",
    },
  ];

  return (
    <div className="min-h-screen bg-[#04100c] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Your Activity
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Analysis <span className="text-emerald-400">History</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Review your previous sowing-window predictions and compare
              different crops and locations.
            </p>
          </div>

          <button
            onClick={() => navigate("/analysis")}
            className="w-fit rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            + New Analysis
          </button>
        </div>

        <div className="mt-10 space-y-4">

          {history.map((item) => (
            <div
              key={item.id}
              className="group rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20"
            >
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">

                <div className="flex items-start gap-5">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
                    🌾
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {item.crop}
                      </h2>

                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      📍 {item.location}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Analysed on {item.date}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                  <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Window
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {item.window}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Probability
                    </p>

                    <p className="mt-2 text-sm font-semibold text-emerald-400">
                      {item.probability}%
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="col-span-2 rounded-2xl border border-white/10 px-5 py-4 text-xs text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-400 sm:col-span-1"
                  >
                    View →
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>

        <div className="mt-8 rounded-[2rem] border border-dashed border-white/10 p-10 text-center">
          <div className="text-4xl">📊</div>

          <h3 className="mt-4 text-lg font-semibold">
            More analysis coming here
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
            Once backend storage is connected, every analysis will
            automatically appear in your history.
          </p>
        </div>

      </main>
    </div>
  );
}

export default History;